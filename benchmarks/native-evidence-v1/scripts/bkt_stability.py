from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from .bkt import BktDiagnosticRun, build_bkt_frame, fit_bkt_with_diagnostics


@dataclass(frozen=True)
class BktStabilityToleranceFreeze:
    status: str
    near_best_final_log_likelihood_gap_per_observation: None
    max_abs_error_probability_difference_from_selected: None
    mean_abs_error_probability_difference_from_selected: None
    reviewer_required: bool
    test_labels_permitted: bool
    rationale: str


@dataclass(frozen=True)
class BktStabilityStressCase:
    case_id: str
    learner_count: int
    row_count: int
    positive_count: int
    diagnostic: BktDiagnosticRun


@dataclass(frozen=True)
class BktStabilityStressReport:
    status: str
    evidence_scope: str
    cases: tuple[BktStabilityStressCase, ...]
    tolerance_freeze: BktStabilityToleranceFreeze


def _frame_from_patterns(case_id: str, patterns: Sequence[Sequence[int]]):
    learners: list[str] = []
    outcomes: list[int] = []
    for learner_index, pattern in enumerate(patterns):
        learner_id = f"{case_id}-learner-{learner_index}"
        for outcome in pattern:
            learners.append(learner_id)
            outcomes.append(outcome)
    return build_bkt_frame(participant_ids=learners, correctness=outcomes)


def _stress_cases():
    return (
        (
            "mixed-progression",
            (
                (0, 0, 1, 1, 1),
                (0, 1, 0, 1, 1),
                (1, 0, 1, 1, 1),
                (0, 0, 0, 1, 1),
                (1, 1, 0, 1, 1),
                (0, 1, 1, 0, 1),
                (1, 0, 0, 1, 0),
                (0, 1, 0, 0, 1),
            ),
        ),
        (
            "weak-alternating-signal",
            (
                (0, 1, 0, 1, 0, 1),
                (1, 0, 1, 0, 1, 0),
                (0, 1, 1, 0, 0, 1),
                (1, 0, 0, 1, 1, 0),
                (0, 0, 1, 1, 0, 1),
                (1, 1, 0, 0, 1, 0),
                (0, 1, 0, 0, 1, 1),
                (1, 0, 1, 1, 0, 0),
            ),
        ),
        (
            "sparse-error-boundary",
            (
                (1, 1, 1, 1, 1, 0),
                (1, 1, 1, 1, 0, 1),
                (1, 1, 1, 0, 1, 1),
                (1, 1, 0, 1, 1, 1),
                (1, 0, 1, 1, 1, 1),
                (0, 1, 1, 1, 1, 1),
                (1, 1, 1, 1, 1, 1),
                (1, 1, 1, 1, 1, 1),
            ),
        ),
    )


def build_train_only_stability_stress_report() -> BktStabilityStressReport:
    cases: list[BktStabilityStressCase] = []
    for case_id, patterns in _stress_cases():
        frame = _frame_from_patterns(case_id, patterns)
        diagnostic = fit_bkt_with_diagnostics(frame, parity_data=frame)
        cases.append(
            BktStabilityStressCase(
                case_id=case_id,
                learner_count=int(frame["user_id"].nunique()),
                row_count=len(frame),
                positive_count=int(frame["correct"].sum()),
                diagnostic=diagnostic,
            )
        )

    return BktStabilityStressReport(
        status="review-required",
        evidence_scope="TRAIN-only-synthetic-numerical-stress",
        cases=tuple(cases),
        tolerance_freeze=BktStabilityToleranceFreeze(
            status="unresolved-pending-independent-review",
            near_best_final_log_likelihood_gap_per_observation=None,
            max_abs_error_probability_difference_from_selected=None,
            mean_abs_error_probability_difference_from_selected=None,
            reviewer_required=True,
            test_labels_permitted=False,
            rationale=(
                "The harness records likelihood gaps and prediction divergence before any N3 outcomes. "
                "Numerical thresholds remain null so implementation authors cannot tune them to synthetic or future TEST results. "
                "An independent reviewer must freeze or reject tolerances from this TRAIN-only stress evidence."
            ),
        ),
    )
