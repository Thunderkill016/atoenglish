from __future__ import annotations

from dataclasses import dataclass
import math
import re
from typing import Iterable, Iterator, Literal

SourceSplit = Literal["train", "dev", "test"]

_USER_ID = re.compile(r"^[A-Za-z0-9+/]{8}$")
_CLIENTS = {"web", "ios", "android"}
_SESSIONS = {"lesson", "practice", "test"}
_FORMATS = {"reverse_translate", "reverse_tap", "listen"}
_HEADER_KEYS = {"user", "countries", "days", "client", "session", "format", "time"}


@dataclass(frozen=True)
class SlamPromptHeader:
    user_id: str
    countries: tuple[str, ...]
    days: float
    client: str
    session: str
    format: str
    time_seconds: float | None
    source_line_number: int


@dataclass(frozen=True)
class SlamTokenRow:
    token_id: str
    token: str
    pos: str
    morphology: tuple[str, ...]
    dep_edge: str
    dep_head: int
    label: int | None
    source_line_number: int


@dataclass(frozen=True)
class SlamExercise:
    header: SlamPromptHeader
    tokens: tuple[SlamTokenRow, ...]


class SlamFormatError(ValueError):
    pass


def _parse_header(line: str, source_line_number: int) -> SlamPromptHeader:
    if not line.startswith("#"):
        raise SlamFormatError(f"line {source_line_number}: exercise header must start with '#'")

    fields: dict[str, str] = {}
    for part in line[1:].strip().split():
        if ":" not in part:
            raise SlamFormatError(f"line {source_line_number}: malformed header field {part!r}")
        key, value = part.split(":", 1)
        if key in fields:
            raise SlamFormatError(f"line {source_line_number}: duplicate header key {key!r}")
        fields[key] = value

    missing = _HEADER_KEYS - fields.keys()
    unknown = fields.keys() - _HEADER_KEYS
    if missing or unknown:
        raise SlamFormatError(
            f"line {source_line_number}: header keys mismatch; missing={sorted(missing)}, unknown={sorted(unknown)}"
        )

    user_id = fields["user"]
    if not _USER_ID.fullmatch(user_id):
        raise SlamFormatError(f"line {source_line_number}: invalid 8-character B64-style user id {user_id!r}")

    countries = tuple(fields["countries"].split("|")) if fields["countries"] else tuple()
    if not countries or any(len(code) != 2 for code in countries):
        raise SlamFormatError(f"line {source_line_number}: countries must be pipe-delimited 2-character codes")

    try:
        days = float(fields["days"])
    except ValueError as exc:
        raise SlamFormatError(f"line {source_line_number}: days must be numeric") from exc
    if not math.isfinite(days) or days < 0:
        raise SlamFormatError(f"line {source_line_number}: days must be finite and non-negative")

    client = fields["client"]
    session = fields["session"]
    exercise_format = fields["format"]
    if client not in _CLIENTS:
        raise SlamFormatError(f"line {source_line_number}: unsupported client {client!r}")
    if session not in _SESSIONS:
        raise SlamFormatError(f"line {source_line_number}: unsupported session {session!r}")
    if exercise_format not in _FORMATS:
        raise SlamFormatError(f"line {source_line_number}: unsupported format {exercise_format!r}")

    raw_time = fields["time"]
    if raw_time == "null":
        time_seconds = None
    else:
        try:
            parsed_time = float(raw_time)
        except ValueError as exc:
            raise SlamFormatError(f"line {source_line_number}: time must be numeric or null") from exc
        if not math.isfinite(parsed_time):
            raise SlamFormatError(f"line {source_line_number}: time must be finite or null")
        # Official SLAM guidance says documented negative browser logging errors should be treated as null.
        time_seconds = None if parsed_time < 0 else parsed_time

    return SlamPromptHeader(
        user_id=user_id,
        countries=countries,
        days=days,
        client=client,
        session=session,
        format=exercise_format,
        time_seconds=time_seconds,
        source_line_number=source_line_number,
    )


def _parse_token(line: str, split: SourceSplit, source_line_number: int) -> SlamTokenRow:
    columns = line.split()
    expected = 7 if split == "train" else 6
    if len(columns) != expected:
        raise SlamFormatError(
            f"line {source_line_number}: {split} token row must have {expected} whitespace columns, got {len(columns)}"
        )

    token_id, token, pos, morphology_raw, dep_edge, dep_head_raw = columns[:6]
    if len(token_id) != 12:
        raise SlamFormatError(f"line {source_line_number}: token instance id must contain 12 characters")

    morphology = tuple() if morphology_raw in {"_", "-"} else tuple(morphology_raw.split("|"))
    try:
        dep_head = int(dep_head_raw)
    except ValueError as exc:
        raise SlamFormatError(f"line {source_line_number}: dependency head must be an integer") from exc

    label: int | None = None
    if split == "train":
        if columns[6] not in {"0", "1"}:
            raise SlamFormatError(f"line {source_line_number}: training label must be 0 or 1")
        label = int(columns[6])

    return SlamTokenRow(
        token_id=token_id,
        token=token,
        pos=pos,
        morphology=morphology,
        dep_edge=dep_edge,
        dep_head=dep_head,
        label=label,
        source_line_number=source_line_number,
    )


def parse_slam_lines(lines: Iterable[str], split: SourceSplit) -> Iterator[SlamExercise]:
    """Parse source-order SLAM exercises without sorting by `days` or any derived clock."""
    if split not in {"train", "dev", "test"}:
        raise SlamFormatError(f"unsupported split {split!r}")

    header: SlamPromptHeader | None = None
    tokens: list[SlamTokenRow] = []
    seen_token_ids: set[str] = set()

    def flush() -> SlamExercise | None:
        nonlocal header, tokens
        if header is None:
            if tokens:
                raise SlamFormatError("token rows appeared without an exercise header")
            return None
        if not tokens:
            raise SlamFormatError(f"line {header.source_line_number}: exercise contains no token rows")
        exercise = SlamExercise(header=header, tokens=tuple(tokens))
        header = None
        tokens = []
        return exercise

    for line_number, raw in enumerate(lines, start=1):
        line = raw.rstrip("\n\r")
        if not line.strip():
            exercise = flush()
            if exercise is not None:
                yield exercise
            continue
        if line.startswith("#"):
            if header is not None:
                exercise = flush()
                if exercise is not None:
                    yield exercise
            header = _parse_header(line, line_number)
            continue
        if header is None:
            raise SlamFormatError(f"line {line_number}: token row encountered before header")
        token = _parse_token(line, split, line_number)
        if token.token_id in seen_token_ids:
            raise SlamFormatError(f"line {line_number}: duplicate token instance id {token.token_id!r}")
        seen_token_ids.add(token.token_id)
        tokens.append(token)

    exercise = flush()
    if exercise is not None:
        yield exercise


def parse_gold_key(lines: Iterable[str]) -> dict[str, int]:
    result: dict[str, int] = {}
    for line_number, raw in enumerate(lines, start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        columns = line.split()
        if len(columns) != 2 or columns[1] not in {"0", "1"}:
            raise SlamFormatError(f"line {line_number}: gold key row must be '<token_id> <0|1>'")
        token_id = columns[0]
        if token_id in result:
            raise SlamFormatError(f"line {line_number}: duplicate gold token id {token_id!r}")
        result[token_id] = int(columns[1])
    return result
