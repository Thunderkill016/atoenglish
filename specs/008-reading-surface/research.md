# Research: Learner Reading Surface

## Decision 1 — Gloss dictionary source

**Chosen**: `UNIT_VOCABULARY` in `src/lib/constants/vocabulary.ts` (~4,784
lines, curated `word → {meaning_vn, phonetic, example_en, topic, level}`).

Alternatives rejected: extracting `vocab[]` from 50 legacy unit files (messier
shape — `word`/`meaning` with mixed phrase entries); shipping a third-party
dictionary (licence + bundle cost for an MVP); machine-generating glosses
(violates honesty rules — fabricated meanings are worse than none).

Consequence: dictionary is small (hundreds of entries) and honest about misses.
Phrase entries ("Good morning") are indexed on the normalized full string;
single-word lookups dominate the A0 texts.

## Decision 2 — Word-state persistence

**Chosen**: new table `learner_known_words(user_id, word, status, created_at,
updated_at)`, `unique(user_id, word)`, status ∈ `learning | known`, RLS
owner-only, authenticated-only (no anonymous rows — self-marked state needs an
identity; anonymous viewers get the neutral render per spec US1).

Why a table and not JSON in `user_progress`: per-word rows are the honest unit,
RLS-scoped, queryable for cross-text rendering and later mining features.

## Decision 3 — Status model

`unknown` is **implicit** (no row) — we never store "unknown" rows, matching
family-B's "new word" state. `learning` = tapped/saved but not claimed known.
`known` = learner-marked. Both stored states are *self-report* — they must not
enter `learning_attempts` or the evidence pipeline (spec non-goal).

## Decision 4 — Tokenization

Client-side `tokenizeText(text)` → `[{type:"word"|"space"|"punct"|"other"}]`.
Word = `[A-Za-z]+(?:'[a-z]+)?` (keeps `don't`, `I'm` as one token).
Normalization = lowercase. Boundary characters (quotes, commas, sentence
punctuation) split tokens. Non-Latin runs → `other`, neutral render (spec edge
case). Pasted text bounded at 5,000 chars (A0 reader scope; refuses gracefully).

## Decision 5 — Inflection handling

Deterministic suffix rules only, tried in order: exact → strip `'s` → `ies→y` →
`es`/`s` → `ied→y`/`ed` → `ing` (with doubled-consonant undo: `running→run`).
Each candidate must exist in the dictionary or the next rule fires; final miss
= honest "chưa có nghĩa". No morphological guessing beyond the rule list —
wrong glosses are worse than misses (per spec + learning-science rules).

## Decision 6 — Save-to-flashcards reuse

Existing `saveCardToSRS({word, phonetic, meaning_vn, example_en, topic, level})`
in `src/app/actions/cards.ts` — already rate-limited, dedupes, and inserts into
the real FSRS pipeline. The reader calls it with the gloss entry's fields;
saved words set `learning` status in `learner_known_words` (saved ≠ known).

## Decision 7 — Surface + entry point

Route `/read` under `(main)` — first family-B surface in the app. Entry point:
link from `/learn` index (the visible lesson-picker surface) as "Đọc" card —
deliberately NOT a 4th bottom-nav tab (3-tab shell is a designed constraint,
and the H2 surface decision is still owner-pending). `/read` itself is the
active-direction surface, not legacy extension.

## Decision 8 — Speech

Browser `speechSynthesis` for the tapped word — client-side, no server dep, no
key, honest capability (browser voice quality varies; it's pronunciation
*support*, not assessment — consistent with the disabled phoneme scorer).

## Risks

- **Dictionary coverage**: small dict → high miss rate on arbitrary pasted text.
  Mitigation: honest miss state is the designed behaviour (SC-004); starter
  texts are authored to stay inside dict coverage.
- **Self-report drift**: learners may mark words known optimistically.
  Accepted and labelled — the count is "self-marked", not evidence; it cannot
  inflate any assessed metric because it never enters the evidence pipeline.
- **Pasted-text injection**: text is rendered as data (React text nodes), never
  `dangerouslySetInnerHTML`; bounded length.
