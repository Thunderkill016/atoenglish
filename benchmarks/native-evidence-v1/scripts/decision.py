from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .metrics import Interval, PairedContrastInterval


class RealityDecision(str, Enum):
    KEEP = "KEEP"
    KEEP_REPRESENTATION_ONLY = "KEEP_REPRESENTATION_ONLY"
    SIMPLIFY = "SIMPLIFY"
    REDESIGN = "REDESIGN"
    GATHER_MORE_EVIDENCE = "GATHER_MORE_EVIDENCE"


@dataclass(frozen=True)
class UtilityMargins:
    delta_history: float | None
    delta_basis: float | None
    approved: bool
    justification_artifact: str | None

    @property
    def resolved(self) -> bool:
        return (
            self.approved
            and self.delta_history is not None
            and self.delta_basis is not None
            and self.delta_history >= 0
            and self.delta_basis >= 0
            and bool(self.justification_artifact)
        )


@dataclass(frozen=True)
class DecisionInput:
    history: PairedContrastInterval
    basis: PairedContrastInterval
    utility: UtilityMargins
    instrumentation_valid: bool = True
    semantic_mapping_valid: bool = True
    basis_prediction_equivalent: bool = False


@dataclass(frozen=True)
class DecisionResult:
    decision: RealityDecision
    attribution: str
    reason: str


def _log_loss_win(interval: Interval | None, margin: float) -> bool:
    # Difference is B3 - control; negative is better. Entire interval must clear approved utility.
    return interval is not None and interval.upper < -margin


def _log_loss_material_benefit_excluded(interval: Interval | None, margin: float) -> bool:
    # Entire interval lies above the utility benefit boundary, so material benefit is excluded.
    return interval is not None and interval.lower > -margin


def _brier_supports_win(interval: Interval | None) -> bool:
    return interval is not None and interval.upper <= 0


def _brier_demonstrates_benefit(interval: Interval | None) -> bool:
    return interval is not None and interval.upper < 0


def decide_native_representation(input_: DecisionInput) -> DecisionResult:
    if not input_.instrumentation_valid or not input_.semantic_mapping_valid:
        return DecisionResult(
            decision=RealityDecision.REDESIGN,
            attribution="measurement-failure",
            reason="Instrumentation or prospective evidence semantics failed before predictive attribution.",
        )

    if not input_.utility.resolved:
        return DecisionResult(
            decision=RealityDecision.GATHER_MORE_EVIDENCE,
            attribution="utility-unresolved",
            reason="Predictive KEEP/SIMPLIFY is disabled until both utility margins are independently approved.",
        )

    assert input_.utility.delta_history is not None
    assert input_.utility.delta_basis is not None
    history_margin = input_.utility.delta_history
    basis_margin = input_.utility.delta_basis

    history_win = _log_loss_win(input_.history.log_loss, history_margin)
    basis_win = _log_loss_win(input_.basis.log_loss, basis_margin)
    history_brier_ok = _brier_supports_win(input_.history.brier)
    basis_brier_ok = _brier_supports_win(input_.basis.brier)

    if history_win and basis_win and history_brier_ok and basis_brier_ok:
        return DecisionResult(
            decision=RealityDecision.KEEP,
            attribution="incremental-representation-signal",
            reason=(
                "B3 clears both approved log-loss utility margins and neither Brier contrast contradicts the win. "
                "This supports incremental predictive signal under the frozen experiment, not new causal information."
            ),
        )

    if history_win and history_brier_ok and input_.basis_prediction_equivalent:
        return DecisionResult(
            decision=RealityDecision.KEEP_REPRESENTATION_ONLY,
            attribution="history-reencoding-not-new-information",
            reason=(
                "B3 beats the strong history lane while its frozen predictions are exactly equivalent to B2-basis. "
                "At most the representation/encoding is useful; no incremental learner-state information is established."
            ),
        )

    history_excluded = _log_loss_material_benefit_excluded(input_.history.log_loss, history_margin)
    basis_excluded = _log_loss_material_benefit_excluded(input_.basis.log_loss, basis_margin)
    no_brier_win = not _brier_demonstrates_benefit(input_.history.brier) and not _brier_demonstrates_benefit(
        input_.basis.brier
    )
    if history_excluded and basis_excluded and no_brier_win:
        return DecisionResult(
            decision=RealityDecision.SIMPLIFY,
            attribution="material-benefit-excluded",
            reason=(
                "Both contrasts exclude the pre-approved material log-loss benefit and Brier provides no clear rescue. "
                "The tested Nếp augmentation should be simplified rather than protected."
            ),
        )

    return DecisionResult(
        decision=RealityDecision.GATHER_MORE_EVIDENCE,
        attribution="inconclusive-two-control-comparison",
        reason="The two-control intervals do not justify KEEP, representation-only retention, or SIMPLIFY.",
    )
