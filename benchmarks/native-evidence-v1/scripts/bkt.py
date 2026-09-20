from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from hashlib import sha256
import importlib.util
from importlib.metadata import version as package_version
import inspect
import json
from pathlib import Path
from threading import Lock
from typing import Sequence

import numpy as np
import pandas as pd
from pyBKT.fit import EM_fit
from pyBKT.models import Model

PYBKT_SOURCE_REVISION = "06fc180ae72c117458acc527f8ec90cc8e0581c1"
PYBKT_PACKAGE_VERSION = "1.4.3"
PYBKT_SEED = 143
PYBKT_NUM_FITS = 5

BKT_DEFAULTS = {
    "order_id": "order_id",
    "skill_name": "skill_name",
    "correct": "correct",
    "user_id": "user_id",
}

REQUIRED_COLUMNS = ("order_id", "skill_name", "correct", "user_id")
_OBSERVER_LOCK = Lock()


@dataclass(frozen=True)
class BktBackendInspection:
    source_revision: str
    package_version: str
    backend_kind: str
    model_source_path: str
    em_source_path: str
    e_step_source_path: str
    model_source_sha256: str | None
    em_source_sha256: str | None
    e_step_source_sha256: str | None
    effective_em_tolerance: float | None
    effective_em_max_iterations: int | None
    tolerance_comparison: str


@dataclass(frozen=True)
class BktComparatorMetadata:
    source_revision: str
    package_version: str
    seed: int
    num_fits: int
    parallel: bool
    forgets: bool
    backend_default_num_fits: int
    backend_default_forgets: bool
    model_type: tuple[bool, ...]
    parameterization: str
    backend: BktBackendInspection


@dataclass(frozen=True)
class BktStartDiagnostic:
    start_index: int
    iteration_count: int
    final_log_likelihood: float
    final_delta: float | None
    finite_likelihood_trace: bool
    stopping_reason: str
    initial_parameter_fingerprint: str
    final_parameter_fingerprint: str


@dataclass(frozen=True)
class BktStartPredictionComparison:
    start_index: int
    final_log_likelihood_gap_from_selected: float
    final_log_likelihood_gap_per_observation: float
    mean_abs_error_probability_difference_from_selected: float
    max_abs_error_probability_difference_from_selected: float


@dataclass(frozen=True)
class BktDiagnosticRun:
    backend: BktBackendInspection
    starts: tuple[BktStartDiagnostic, ...]
    selected_start_index: int | None
    start_prediction_comparisons: tuple[BktStartPredictionComparison, ...]
    selected_start_prediction_matches_public: bool
    parity_parameters_equal: bool
    parity_predictions_equal: bool
    selected_predictions_finite: bool
    convergence_assurance: str
    stability_assurance: str


@dataclass
class FrozenBktComparator:
    model: Model
    metadata: BktComparatorMetadata

    def predict_error_probabilities(self, causal_sequence: pd.DataFrame) -> np.ndarray:
        """Return source-faithful one-step predictions for a fully observed causal sequence.

        This surface is intended for TRAIN-only diagnostics and replay. Outcomes supplied in earlier
        rows update pyBKT's state for later rows, so callers MUST NOT pass a blind evaluation block
        here and then treat every row as pre-outcome. Use `predict_blind_next_error_probability()`
        for a frozen target whose label must not affect any other target prediction.
        """

        frame = validate_bkt_frame(causal_sequence)
        predicted = self.model.predict(data=frame.copy())
        if "correct_predictions" not in predicted.columns:
            raise RuntimeError("pyBKT prediction frame omitted correct_predictions")
        correct = predicted["correct_predictions"].to_numpy(dtype=np.float64, copy=True)
        if not np.all(np.isfinite(correct)) or np.any(correct < 0) or np.any(correct > 1):
            raise RuntimeError("pyBKT emitted invalid correctness probabilities")
        return 1.0 - correct

    def predict_blind_next_error_probability(
        self,
        *,
        participant_id: str,
        skill_name: str,
        authorized_history: pd.DataFrame | None = None,
    ) -> float:
        """Predict one target without consuming its outcome or another blind-block outcome.

        `authorized_history` contains only outcomes that the frozen protocol permits before this
        target. The target itself is appended with an internal placeholder outcome because pyBKT's
        public prediction API requires an observed-row shape; one-step prediction for that target
        is computed before that placeholder can update state. No target outcome is accepted by this
        API, which prevents accidental current-label or prior blind-block-label feedback.
        """

        if not participant_id:
            raise ValueError("participant_id must be non-empty")
        if not skill_name:
            raise ValueError("skill_name must be non-empty")
        fitted = self.model.fit_model
        if not isinstance(fitted, dict) or skill_name not in fitted:
            raise ValueError(f"pyBKT target skill {skill_name!r} is not fitted")

        sequence = _build_blind_prediction_sequence(
            participant_id=participant_id,
            skill_name=skill_name,
            authorized_history=authorized_history,
        )
        probabilities = self.predict_error_probabilities(sequence)
        return float(probabilities[-1])

    def fitted_parameters(self) -> pd.DataFrame:
        return self.model.params().copy()


def _sha256_file(path: str) -> str | None:
    if not path:
        return None
    try:
        return sha256(Path(path).read_bytes()).hexdigest()
    except OSError:
        return None


def _resolve_effective_em_defaults(source: str) -> tuple[float | None, int | None, str]:
    signature = inspect.signature(EM_fit.EM_fit)
    tolerance_parameter = signature.parameters.get("tol")
    maxiter_parameter = signature.parameters.get("maxiter")
    tolerance_default = None if tolerance_parameter is None else tolerance_parameter.default
    maxiter_default = None if maxiter_parameter is None else maxiter_parameter.default

    tolerance: float | None
    if isinstance(tolerance_default, (int, float)):
        tolerance = float(tolerance_default)
    elif "tol = 1e-3" in source or "tol=1e-3" in source:
        tolerance = 1e-3
    elif "tol = 0.005" in source or "tol=0.005" in source:
        tolerance = 0.005
    else:
        tolerance = None

    max_iterations: int | None
    if isinstance(maxiter_default, int):
        max_iterations = maxiter_default
    elif "maxiter = 100" in source or "maxiter=100" in source:
        max_iterations = 100
    else:
        max_iterations = None

    if "<= tol" in source:
        comparison = "<="
    elif "< tol" in source:
        comparison = "<"
    else:
        comparison = "unknown"
    return tolerance, max_iterations, comparison


def _resolve_e_step_source(em_module_source: str, em_source_path: str) -> tuple[str, str]:
    if "E_step.run(" in em_module_source:
        spec = importlib.util.find_spec("pyBKT.fit.E_step")
        origin = "" if spec is None or spec.origin is None else str(spec.origin)
        return "compiled-e-step", origin
    if "def run(" in em_module_source:
        # The pure-Python package embeds the E-step implementation in EM_fit.py itself.
        return "python-e-step", em_source_path
    return "unknown", ""


def inspect_installed_bkt_backend() -> BktBackendInspection:
    installed_version = package_version("pyBKT")
    model_source_path = inspect.getsourcefile(Model) or ""
    em_source_path = inspect.getsourcefile(EM_fit) or inspect.getsourcefile(EM_fit.EM_fit) or ""
    em_module_source = inspect.getsource(EM_fit)
    tolerance, max_iterations, comparison = _resolve_effective_em_defaults(em_module_source)
    backend_kind, e_step_source_path = _resolve_e_step_source(em_module_source, em_source_path)

    return BktBackendInspection(
        source_revision=PYBKT_SOURCE_REVISION,
        package_version=installed_version,
        backend_kind=backend_kind,
        model_source_path=model_source_path,
        em_source_path=em_source_path,
        e_step_source_path=e_step_source_path,
        model_source_sha256=_sha256_file(model_source_path),
        em_source_sha256=_sha256_file(em_source_path),
        e_step_source_sha256=_sha256_file(e_step_source_path),
        effective_em_tolerance=tolerance,
        effective_em_max_iterations=max_iterations,
        tolerance_comparison=comparison,
    )


def validate_bkt_frame(data: pd.DataFrame) -> pd.DataFrame:
    missing = [column for column in REQUIRED_COLUMNS if column not in data.columns]
    if missing:
        raise ValueError(f"pyBKT frame missing required columns: {missing}")
    if data.empty:
        raise ValueError("pyBKT frame must not be empty")

    frame = data.copy()
    correctness = frame["correct"].tolist()
    if any(value not in (0, 1) for value in correctness):
        raise ValueError("pyBKT correctness must be binary 0/1 for this comparator")
    if frame["user_id"].isna().any() or frame["skill_name"].isna().any():
        raise ValueError("pyBKT user_id and skill_name must be observed")

    for _, learner_frame in frame.groupby("user_id", sort=False):
        order = learner_frame["order_id"].tolist()
        if order != sorted(order):
            raise ValueError("pyBKT order_id must be monotone within learner")
        if len(order) != len(set(order)):
            raise ValueError("pyBKT order_id must be unique within learner")

    return frame


def _build_blind_prediction_sequence(
    *,
    participant_id: str,
    skill_name: str,
    authorized_history: pd.DataFrame | None,
) -> pd.DataFrame:
    if authorized_history is None or authorized_history.empty:
        history_rows: list[dict[str, object]] = []
    else:
        history = validate_bkt_frame(authorized_history)
        if any(value != participant_id for value in history["user_id"].tolist()):
            raise ValueError("blind pyBKT history must contain exactly the target participant")
        if any(value != skill_name for value in history["skill_name"].tolist()):
            raise ValueError("blind pyBKT history must contain exactly the target skill")
        history_rows = [
            {
                "order_id": index,
                "skill_name": skill_name,
                "correct": int(row.correct),
                "user_id": participant_id,
            }
            for index, row in enumerate(history.itertuples(index=False))
        ]

    rows = [
        *history_rows,
        {
            "order_id": len(history_rows),
            "skill_name": skill_name,
            "correct": 0,
            "user_id": participant_id,
        },
    ]
    return validate_bkt_frame(pd.DataFrame(rows))


def fit_source_faithful_bkt(
    train_data: pd.DataFrame,
    *,
    backend: BktBackendInspection | None = None,
) -> FrozenBktComparator:
    frame = validate_bkt_frame(train_data)
    resolved_backend = inspect_installed_bkt_backend() if backend is None else backend
    if resolved_backend.package_version != PYBKT_PACKAGE_VERSION:
        raise RuntimeError(
            f"pyBKT package version mismatch: expected {PYBKT_PACKAGE_VERSION}, got {resolved_backend.package_version}"
        )

    model = Model(seed=PYBKT_SEED, num_fits=PYBKT_NUM_FITS, parallel=False)
    model.fit(data=frame, defaults=BKT_DEFAULTS, forgets=False)
    model_type = tuple(bool(value) for value in model.model_type)
    if any(model_type):
        raise RuntimeError("BKT-native must remain the pooled four-parameter model without variants")

    metadata = BktComparatorMetadata(
        source_revision=PYBKT_SOURCE_REVISION,
        package_version=resolved_backend.package_version,
        seed=PYBKT_SEED,
        num_fits=PYBKT_NUM_FITS,
        parallel=False,
        forgets=False,
        backend_default_num_fits=int(Model.DEFAULTS["num_fits"]),
        backend_default_forgets=bool(Model.DEFAULTS["forgets"]),
        model_type=model_type,
        parameterization="prior-learn-guess-slip-no-forgetting",
        backend=resolved_backend,
    )
    return FrozenBktComparator(model=model, metadata=metadata)


def _parameter_fingerprint(model: dict[str, object]) -> str:
    payload: dict[str, object] = {}
    for name in ("prior", "learns", "guesses", "slips", "forgets"):
        value = model.get(name)
        if isinstance(value, np.ndarray):
            payload[name] = np.asarray(value, dtype=np.float64).reshape(-1).tolist()
        elif isinstance(value, (int, float, np.floating, np.integer)):
            payload[name] = float(value)
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")
    return f"sha256:{sha256(encoded).hexdigest()}"


def _stopping_reason(
    trace: np.ndarray,
    backend: BktBackendInspection,
) -> tuple[float | None, str]:
    flat = np.asarray(trace, dtype=np.float64).reshape(-1)
    if flat.size == 0 or not np.all(np.isfinite(flat)):
        return None, "nonfinite-likelihood"

    final_delta = None if flat.size < 2 else float(abs(flat[-1] - flat[-2]))
    if backend.effective_em_max_iterations is not None and flat.size >= backend.effective_em_max_iterations:
        return final_delta, "max-iterations"

    tolerance = backend.effective_em_tolerance
    if tolerance is not None and final_delta is not None and flat.size >= 3:
        passed = final_delta <= tolerance if backend.tolerance_comparison == "<=" else final_delta < tolerance
        if passed:
            return final_delta, "backend-tolerance"
    return final_delta, "backend-returned-early-unclassified"


def _selected_start_index(starts: Sequence[BktStartDiagnostic]) -> int | None:
    best_index: int | None = None
    best_likelihood = float("-inf")
    for start in starts:
        if start.final_log_likelihood > best_likelihood:
            best_likelihood = start.final_log_likelihood
            best_index = start.start_index
    return best_index


def _parameters_equal(left: pd.DataFrame, right: pd.DataFrame) -> bool:
    left_sorted = left.sort_index()
    right_sorted = right.sort_index()
    if not left_sorted.index.equals(right_sorted.index):
        return False
    if list(left_sorted.columns) != list(right_sorted.columns):
        return False
    try:
        return bool(
            np.allclose(
                left_sorted.to_numpy(dtype=np.float64),
                right_sorted.to_numpy(dtype=np.float64),
                atol=1e-12,
                rtol=1e-12,
            )
        )
    except (TypeError, ValueError):
        return left_sorted.equals(right_sorted)


def _finalize_observed_start_model(
    raw_model: dict[str, object],
    selected_model: dict[str, object],
) -> dict[str, object]:
    finalized = deepcopy(raw_model)
    transitions = np.asarray(finalized["As"], dtype=np.float64)
    prior = np.asarray(finalized["pi_0"], dtype=np.float64)
    finalized["learns"] = transitions[:, 1, 0].copy()
    finalized["forgets"] = transitions[:, 0, 1].copy()
    finalized["prior"] = float(prior[1][0])
    finalized["resource_names"] = deepcopy(selected_model["resource_names"])
    finalized["gs_names"] = deepcopy(selected_model["gs_names"])
    return finalized


def _predict_observed_start(
    comparator: FrozenBktComparator,
    raw_model: dict[str, object],
    causal_sequence: pd.DataFrame,
) -> np.ndarray:
    fitted = comparator.model.fit_model
    if not isinstance(fitted, dict) or len(fitted) != 1:
        raise RuntimeError("BKT-native stability observer expects exactly one fitted skill")
    skill = next(iter(fitted))
    selected_model = fitted[skill]
    if not isinstance(selected_model, dict):
        raise RuntimeError("BKT-native selected model has unexpected shape")

    replay_model = deepcopy(comparator.model)
    replay_model.fit_model = {
        skill: _finalize_observed_start_model(raw_model, selected_model),
    }
    replay = FrozenBktComparator(model=replay_model, metadata=comparator.metadata)
    return replay.predict_error_probabilities(causal_sequence)


def _compare_start_predictions(
    comparator: FrozenBktComparator,
    captured_models: Sequence[dict[str, object]],
    starts: Sequence[BktStartDiagnostic],
    selected_start_index: int | None,
    parity_frame: pd.DataFrame,
    train_observation_count: int,
) -> tuple[tuple[BktStartPredictionComparison, ...], bool]:
    if selected_start_index is None or len(captured_models) != len(starts):
        return tuple(), False
    if train_observation_count <= 0:
        raise ValueError("train_observation_count must be positive")

    public_predictions = comparator.predict_error_probabilities(parity_frame)
    selected_predictions = _predict_observed_start(
        comparator,
        captured_models[selected_start_index],
        parity_frame,
    )
    selected_matches_public = bool(
        np.allclose(selected_predictions, public_predictions, atol=1e-12, rtol=1e-12)
    )
    selected_likelihood = starts[selected_start_index].final_log_likelihood

    comparisons: list[BktStartPredictionComparison] = []
    for start, raw_model in zip(starts, captured_models, strict=True):
        predictions = _predict_observed_start(comparator, raw_model, parity_frame)
        absolute_difference = np.abs(predictions - selected_predictions)
        likelihood_gap = selected_likelihood - start.final_log_likelihood
        comparisons.append(
            BktStartPredictionComparison(
                start_index=start.start_index,
                final_log_likelihood_gap_from_selected=float(likelihood_gap),
                final_log_likelihood_gap_per_observation=float(
                    likelihood_gap / train_observation_count
                ),
                mean_abs_error_probability_difference_from_selected=float(
                    np.mean(absolute_difference)
                ),
                max_abs_error_probability_difference_from_selected=float(
                    np.max(absolute_difference)
                ),
            )
        )
    return tuple(comparisons), selected_matches_public


def fit_bkt_with_diagnostics(
    train_data: pd.DataFrame,
    *,
    parity_data: pd.DataFrame | None = None,
) -> BktDiagnosticRun:
    """Observe the pinned EM traces without changing initialization, EM, selection, or prediction.

    `parity_data` is a TRAIN-only numerical replay surface, not an evaluation set. The observer is
    diagnostic only. A parity failure makes the observer untrustworthy; it must not make the
    untouched source-faithful comparator unavailable.
    """

    frame = validate_bkt_frame(train_data)
    parity_frame = frame if parity_data is None else validate_bkt_frame(parity_data)
    backend = inspect_installed_bkt_backend()
    starts: list[BktStartDiagnostic] = []
    captured_models: list[dict[str, object]] = []

    with _OBSERVER_LOCK:
        original_em_fit = EM_fit.EM_fit

        def observed_em_fit(model: dict[str, object], data: dict[str, object], *args: object, **kwargs: object):
            initial_fingerprint = _parameter_fingerprint(model)
            fitted_model, trace = original_em_fit(model, data, *args, **kwargs)
            captured_models.append(deepcopy(fitted_model))
            flat = np.asarray(trace, dtype=np.float64).reshape(-1)
            final_delta, stopping_reason = _stopping_reason(flat, backend)
            final_log_likelihood = float(flat[-1]) if flat.size else float("nan")
            starts.append(
                BktStartDiagnostic(
                    start_index=len(starts),
                    iteration_count=int(flat.size),
                    final_log_likelihood=final_log_likelihood,
                    final_delta=final_delta,
                    finite_likelihood_trace=bool(flat.size > 0 and np.all(np.isfinite(flat))),
                    stopping_reason=stopping_reason,
                    initial_parameter_fingerprint=initial_fingerprint,
                    final_parameter_fingerprint=_parameter_fingerprint(fitted_model),
                )
            )
            return fitted_model, trace

        EM_fit.EM_fit = observed_em_fit
        try:
            instrumented = fit_source_faithful_bkt(frame, backend=backend)
        finally:
            EM_fit.EM_fit = original_em_fit

    untouched = fit_source_faithful_bkt(frame, backend=backend)
    instrumented_predictions = instrumented.predict_error_probabilities(parity_frame)
    untouched_predictions = untouched.predict_error_probabilities(parity_frame)
    parity_predictions_equal = bool(
        np.allclose(instrumented_predictions, untouched_predictions, atol=1e-12, rtol=1e-12)
    )
    parity_parameters_equal = _parameters_equal(
        instrumented.fitted_parameters(),
        untouched.fitted_parameters(),
    )
    selected_predictions_finite = bool(
        np.all(np.isfinite(instrumented_predictions))
        and np.all((instrumented_predictions >= 0) & (instrumented_predictions <= 1))
    )
    selected_start_index = _selected_start_index(starts)
    start_prediction_comparisons, selected_start_prediction_matches_public = _compare_start_predictions(
        instrumented,
        captured_models,
        starts,
        selected_start_index,
        parity_frame,
        len(frame),
    )

    tolerance_starts = sum(
        1
        for start in starts
        if start.finite_likelihood_trace and start.stopping_reason == "backend-tolerance"
    )
    if (
        parity_parameters_equal
        and parity_predictions_equal
        and selected_predictions_finite
        and selected_start_prediction_matches_public
        and tolerance_starts >= 2
    ):
        convergence_assurance = "convergence-observed"
    else:
        convergence_assurance = "convergence-unverified"

    return BktDiagnosticRun(
        backend=backend,
        starts=tuple(starts),
        selected_start_index=selected_start_index,
        start_prediction_comparisons=start_prediction_comparisons,
        selected_start_prediction_matches_public=selected_start_prediction_matches_public,
        parity_parameters_equal=parity_parameters_equal,
        parity_predictions_equal=parity_predictions_equal,
        selected_predictions_finite=selected_predictions_finite,
        convergence_assurance=convergence_assurance,
        stability_assurance="unresolved-pending-reviewed-train-only-tolerances",
    )


def build_bkt_frame(
    *,
    participant_ids: Sequence[str],
    correctness: Sequence[int],
    skill_name: str = "present-subject-verb-agreement",
) -> pd.DataFrame:
    if len(participant_ids) != len(correctness):
        raise ValueError("participant_ids and correctness must have equal length")
    next_order: dict[str, int] = {}
    rows: list[dict[str, object]] = []
    for participant_id, correct in zip(participant_ids, correctness, strict=True):
        order_id = next_order.get(participant_id, 0)
        next_order[participant_id] = order_id + 1
        rows.append(
            {
                "order_id": order_id,
                "skill_name": skill_name,
                "correct": correct,
                "user_id": participant_id,
            }
        )
    return validate_bkt_frame(pd.DataFrame(rows))
