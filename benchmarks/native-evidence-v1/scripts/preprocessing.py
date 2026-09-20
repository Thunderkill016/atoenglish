from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Mapping, Sequence

import numpy as np

FeatureValue = float | int | str | None
FeatureRow = Mapping[str, FeatureValue]


@dataclass(frozen=True)
class NumericTransform:
    source_name: str
    output_name: str
    mean: float
    scale: float
    log1p: bool
    missing_output_name: str


@dataclass(frozen=True)
class CategoricalTransform:
    source_name: str
    categories: tuple[str, ...]
    output_names: tuple[str, ...]


@dataclass(frozen=True)
class FrozenFeatureTransform:
    numeric: tuple[NumericTransform, ...]
    categorical: tuple[CategoricalTransform, ...]
    retained_columns: tuple[str, ...]
    dropped_constant_columns: tuple[str, ...]
    dropped_duplicate_columns: tuple[tuple[str, str], ...]

    def transform(self, rows: Sequence[FeatureRow]) -> np.ndarray:
        raw_names, raw_matrix = _materialize_columns(rows, self.numeric, self.categorical)
        name_to_index = {name: index for index, name in enumerate(raw_names)}
        indices = [name_to_index[name] for name in self.retained_columns]
        if not rows:
            return np.zeros((0, len(indices)), dtype=np.float64)
        return raw_matrix[:, indices]


def _is_nonnegative_transform(name: str) -> bool:
    return (
        name.endswith("_count")
        or name.endswith("_positive")
        or name.endswith("_negative")
        or name.startswith("seconds_since_")
        or "_seconds_" in name
    )


def _preferred_column_order(name: str) -> tuple[int, str]:
    # Shared B2 columns must survive exact-duplicate pruning before basis/Nếp derivatives.
    if name.startswith("basis_") or name.startswith("nep_"):
        return (1, name)
    return (0, name)


def _validate_numeric(value: FeatureValue, name: str) -> float | None:
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"numeric feature {name!r} received non-numeric value {value!r}")
    number = float(value)
    if not math.isfinite(number):
        raise ValueError(f"numeric feature {name!r} must be finite")
    return number


def _is_unknown_channel(name: str) -> bool:
    return name.startswith("missing:") or (name.startswith("cat:") and name.endswith("=unknown"))


def fit_feature_transform(
    rows: Sequence[FeatureRow],
    *,
    categorical_domains: Mapping[str, Sequence[str]],
) -> FrozenFeatureTransform:
    if not rows:
        raise ValueError("cannot fit feature transform without TRAIN rows")

    all_names = sorted({name for row in rows for name in row}, key=_preferred_column_order)
    categorical_names = set(categorical_domains)
    numeric_names = [name for name in all_names if name not in categorical_names]

    numeric_transforms: list[NumericTransform] = []
    for name in numeric_names:
        values = [_validate_numeric(row.get(name), name) for row in rows]
        log1p = _is_nonnegative_transform(name)
        observed: list[float] = []
        for value in values:
            if value is None:
                continue
            if log1p:
                if value < 0:
                    raise ValueError(f"feature {name!r} is declared nonnegative but received {value}")
                value = math.log1p(value)
            observed.append(value)

        mean = float(np.mean(observed)) if observed else 0.0
        standard_deviation = float(np.std(observed, ddof=0)) if observed else 0.0
        scale = standard_deviation if standard_deviation > 0 else 1.0
        numeric_transforms.append(
            NumericTransform(
                source_name=name,
                output_name=f"num:{name}",
                mean=mean,
                scale=scale,
                log1p=log1p,
                missing_output_name=f"missing:{name}",
            )
        )

    categorical_transforms: list[CategoricalTransform] = []
    for name in sorted(categorical_domains, key=_preferred_column_order):
        declared = tuple(dict.fromkeys(str(value) for value in categorical_domains[name]))
        if "unknown" not in declared:
            raise ValueError(f"categorical feature {name!r} must declare an explicit 'unknown' category")
        if not declared:
            raise ValueError(f"categorical feature {name!r} has no declared categories")
        categorical_transforms.append(
            CategoricalTransform(
                source_name=name,
                categories=declared,
                output_names=tuple(f"cat:{name}={category}" for category in declared),
            )
        )

    raw_names, raw_matrix = _materialize_columns(rows, tuple(numeric_transforms), tuple(categorical_transforms))

    dropped_constants: list[str] = []
    candidate_indices: list[int] = []
    for index, name in enumerate(raw_names):
        column = raw_matrix[:, index]
        # Missing/unknown is a semantic state, not an observed zero. Preserve these channels even
        # when TRAIN contains no missing or unknown values; otherwise a future unknown can collapse
        # to a zero vector or observed mean after TRAIN-only constant pruning.
        if _is_unknown_channel(name):
            candidate_indices.append(index)
        elif column.size == 0 or np.all(column == column[0]):
            dropped_constants.append(name)
        else:
            candidate_indices.append(index)

    retained_indices: list[int] = []
    dropped_duplicates: list[tuple[str, str]] = []
    for index in candidate_indices:
        name = raw_names[index]
        if _is_unknown_channel(name):
            retained_indices.append(index)
            continue

        column = raw_matrix[:, index]
        duplicate_of: str | None = None
        for retained_index in retained_indices:
            retained_name = raw_names[retained_index]
            if _is_unknown_channel(retained_name):
                continue
            if np.array_equal(column, raw_matrix[:, retained_index]):
                duplicate_of = retained_name
                break
        if duplicate_of is None:
            retained_indices.append(index)
        else:
            dropped_duplicates.append((name, duplicate_of))

    return FrozenFeatureTransform(
        numeric=tuple(numeric_transforms),
        categorical=tuple(categorical_transforms),
        retained_columns=tuple(raw_names[index] for index in retained_indices),
        dropped_constant_columns=tuple(dropped_constants),
        dropped_duplicate_columns=tuple(dropped_duplicates),
    )


def _materialize_columns(
    rows: Sequence[FeatureRow],
    numeric: Sequence[NumericTransform],
    categorical: Sequence[CategoricalTransform],
) -> tuple[tuple[str, ...], np.ndarray]:
    names: list[str] = []
    for transform in numeric:
        names.extend((transform.output_name, transform.missing_output_name))
    for transform in categorical:
        names.extend(transform.output_names)

    matrix = np.zeros((len(rows), len(names)), dtype=np.float64)
    cursor = 0

    for transform in numeric:
        for row_index, row in enumerate(rows):
            value = _validate_numeric(row.get(transform.source_name), transform.source_name)
            if value is None:
                matrix[row_index, cursor] = 0.0
                matrix[row_index, cursor + 1] = 1.0
                continue
            if transform.log1p:
                if value < 0:
                    raise ValueError(
                        f"feature {transform.source_name!r} is declared nonnegative but received {value}"
                    )
                value = math.log1p(value)
            matrix[row_index, cursor] = (value - transform.mean) / transform.scale
            matrix[row_index, cursor + 1] = 0.0
        cursor += 2

    for transform in categorical:
        category_to_offset = {category: offset for offset, category in enumerate(transform.categories)}
        unknown_offset = category_to_offset["unknown"]
        for row_index, row in enumerate(rows):
            raw_value = row.get(transform.source_name)
            category = "unknown" if raw_value is None else str(raw_value)
            offset = category_to_offset.get(category, unknown_offset)
            matrix[row_index, cursor + offset] = 1.0
        cursor += len(transform.categories)

    return tuple(names), matrix
