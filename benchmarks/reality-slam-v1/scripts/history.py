from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Literal, Mapping

from slam_io import SlamExercise, SlamTokenRow

SourceSplit = Literal["train", "dev", "test"]
FitPhase = Literal["train-only", "train-plus-dev"]


@dataclass(frozen=True)
class LabelAvailabilityPolicy:
    fit_phase: FitPhase
    label_available_history_splits: tuple[SourceSplit, ...]
    blind_prediction_split: Literal["dev", "test"]

    @staticmethod
    def for_dev() -> "LabelAvailabilityPolicy":
        return LabelAvailabilityPolicy(
            fit_phase="train-only",
            label_available_history_splits=("train",),
            blind_prediction_split="dev",
        )

    @staticmethod
    def for_test() -> "LabelAvailabilityPolicy":
        return LabelAvailabilityPolicy(
            fit_phase="train-plus-dev",
            label_available_history_splits=("train", "dev"),
            blind_prediction_split="test",
        )


@dataclass(frozen=True)
class LearnerHistoryFeatures:
    prior_labeled_user_token_count: int
    prior_labeled_user_error_count: int
    prior_labeled_user_error_rate: float | None
    prior_labeled_token_count: int
    prior_labeled_token_error_count: int
    prior_labeled_token_error_rate: float | None
    prior_encounter_count: int
    course_age_days_since_last_encounter: float | None
    exercise_format: str
    prompt_response_time_seconds: float | None


@dataclass(frozen=True)
class FeatureRow:
    token_id: str
    user_id: str
    token: str
    pos: str
    morphology: tuple[str, ...]
    dep_edge: str
    dep_head: int
    countries: tuple[str, ...]
    days: float
    client: str
    session: str
    source_split: SourceSplit
    features: LearnerHistoryFeatures
    label: int | None


@dataclass
class _Count:
    seen: int = 0
    errors: int = 0


class CausalHistory:
    """Stateful history that advances strictly in caller-provided source order."""

    def __init__(self) -> None:
        self._user_token_labeled: dict[tuple[str, str], _Count] = {}
        self._token_labeled: dict[str, _Count] = {}
        self._encounters: dict[tuple[str, str], tuple[int, float]] = {}

    @staticmethod
    def _rate(count: _Count | None) -> float | None:
        if count is None or count.seen == 0:
            return None
        return count.errors / count.seen

    def features_before(self, exercise: SlamExercise, token: SlamTokenRow) -> LearnerHistoryFeatures:
        user = exercise.header.user_id
        key = (user, token.token)
        user_token = self._user_token_labeled.get(key)
        token_global = self._token_labeled.get(token.token)
        prior_encounter_count, last_days = self._encounters.get(key, (0, exercise.header.days))
        lag = None if prior_encounter_count == 0 else exercise.header.days - last_days
        if lag is not None and lag < 0:
            # Source order is canonical. A negative course-age lag is source data inconsistency,
            # not permission to sort/reorder events.
            lag = None

        return LearnerHistoryFeatures(
            prior_labeled_user_token_count=0 if user_token is None else user_token.seen,
            prior_labeled_user_error_count=0 if user_token is None else user_token.errors,
            prior_labeled_user_error_rate=self._rate(user_token),
            prior_labeled_token_count=0 if token_global is None else token_global.seen,
            prior_labeled_token_error_count=0 if token_global is None else token_global.errors,
            prior_labeled_token_error_rate=self._rate(token_global),
            prior_encounter_count=prior_encounter_count,
            course_age_days_since_last_encounter=lag,
            exercise_format=exercise.header.format,
            prompt_response_time_seconds=exercise.header.time_seconds,
        )

    def observe_encounter(self, exercise: SlamExercise, token: SlamTokenRow) -> None:
        key = (exercise.header.user_id, token.token)
        count, _ = self._encounters.get(key, (0, exercise.header.days))
        self._encounters[key] = (count + 1, exercise.header.days)

    def observe_authorized_label(self, exercise: SlamExercise, token: SlamTokenRow, label: int) -> None:
        if label not in {0, 1}:
            raise ValueError("label must be 0 or 1")
        user_key = (exercise.header.user_id, token.token)
        user_count = self._user_token_labeled.setdefault(user_key, _Count())
        token_count = self._token_labeled.setdefault(token.token, _Count())
        user_count.seen += 1
        user_count.errors += label
        token_count.seen += 1
        token_count.errors += label


def emit_feature_rows(
    ordered_splits: Iterable[tuple[SourceSplit, Iterable[SlamExercise]]],
    policy: LabelAvailabilityPolicy,
    gold_keys: Mapping[SourceSplit, Mapping[str, int]] | None = None,
) -> list[FeatureRow]:
    """
    Emit rows in caller/source order.

    Labels from the currently blind prediction split are never consumed online, even if a
    caller accidentally supplies a gold key. Gold for an earlier source split is only used
    when that split is explicitly authorized by `label_available_history_splits`.
    """
    history = CausalHistory()
    rows: list[FeatureRow] = []
    gold_keys = gold_keys or {}

    for split, exercises in ordered_splits:
        for exercise in exercises:
            for token in exercise.tokens:
                features = history.features_before(exercise, token)

                source_label = token.label
                gold_label = gold_keys.get(split, {}).get(token.token_id)
                effective_label = source_label if source_label is not None else gold_label

                if split == policy.blind_prediction_split:
                    output_label = None
                else:
                    output_label = effective_label

                rows.append(
                    FeatureRow(
                        token_id=token.token_id,
                        user_id=exercise.header.user_id,
                        token=token.token,
                        pos=token.pos,
                        morphology=token.morphology,
                        dep_edge=token.dep_edge,
                        dep_head=token.dep_head,
                        countries=exercise.header.countries,
                        days=exercise.header.days,
                        client=exercise.header.client,
                        session=exercise.header.session,
                        source_split=split,
                        features=features,
                        label=output_label,
                    )
                )

                history.observe_encounter(exercise, token)

                if split in policy.label_available_history_splits and split != policy.blind_prediction_split:
                    if effective_label is None:
                        raise ValueError(
                            f"authorized history split {split!r} is missing label for token {token.token_id}"
                        )
                    history.observe_authorized_label(exercise, token, effective_label)

    return rows
