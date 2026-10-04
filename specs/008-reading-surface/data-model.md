# Data Model: Learner Reading Surface

## `learner_known_words` (new table)

| column | type | notes |
|---|---|---|
| id | bigint identity pk | |
| user_id | uuid not null → auth.users cascade | never null — anonymous rows don't exist |
| word | text not null | normalized lowercase form, 1–60 chars |
| status | text not null check in ('learning','known') | 'unknown' is implicit (no row) |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() | |
| | unique (user_id, word) | |

RLS: owner-only select/insert/update/delete for `authenticated`. No `anon`
policies — anonymous sessions never persist word state.

Indexes: `(user_id, word)` via unique; `(user_id, status)` for the count query.

## Gloss dictionary (no table — shipped content)

`gloss.ts` builds `Map<normalizedWord, {meaning_vn, phonetic?, example_en?}>`
at module init by flattening `UNIT_VOCABULARY` (`src/lib/constants/vocabulary.ts`).
Read-only shared content — RLS not applicable.

## Reading texts (no table in MVP)

- Authored starter texts: static `STARTER_TEXTS` array in `src/lib/read/starter-texts.ts`
  — `{id, title, level:"A0"|"A1", body}` — 3 short texts authored against the
  dictionary's coverage.
- Pasted texts: session-scoped client state, bounded 5,000 chars, never persisted.

## Token model (client)

```ts
type ReadToken =
  | { type: "word"; text: string; normalized: string }
  | { type: "space" | "punct" | "other"; text: string };
```

## Word state read model (action boundary)

```ts
type WordStatus = "learning" | "known";
// getReadWordStates(words: string[]) → Record<normalized, WordStatus> (signed-in only)
// setReadWordStatus(word, status) → {ok}
// clearReadWordStatus(word) → {ok} (mark back to "unknown" = delete row)
// getReadWordCounts() → {known: number, learning: number}
```
