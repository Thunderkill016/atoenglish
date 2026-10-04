# Contract: Reading Surface

## Invariants

1. **No fabricated meaning.** A word with no dictionary entry — directly or via
   the explicit inflection rules — renders the honest "chưa có nghĩa" state.
   The gloss path can never synthesize or guess a translation.
2. **Self-report is not evidence.** `learner_known_words` rows never feed
   `learning_attempts`, evidence certification, review derivation, or any
   assessed metric. The known-word count is labelled "self-marked".
3. **State is durable or absent.** Anonymous viewers get a fully neutral render
   — there is no half-personalised local word state presented as durable.
4. **Normalization is the join key.** `word` rows are stored normalized
   (lowercase); token rendering matches case-insensitively and ignores
   surrounding punctuation. The same surface form never fragments into two
   stored states.
5. **Boundary is server-checked.** Status writes require an authenticated
   caller; RLS enforces ownership at the DB layer regardless of action code.

## Action boundary (server actions)

```
getReadWordStates(words: readonly string[])
  → { signedIn: false } | { signedIn: true; states: Record<string, "learning"|"known"> }

setReadWordStatus(word: string, status: "learning" | "known")
  → { ok: true } | { ok: false; reason: "rate-limited" | "invalid" | "unauthenticated" | "storage" }

clearReadWordStatus(word: string)  // back to implicit "unknown"
  → { ok: true } | { ok: false; reason: ... }

getReadWordCounts()
  → { signedIn: false } | { signedIn: true; known: number; learning: number }
```

Client→server payloads are plain data: normalized word strings and status
labels only. No trusted fields, no client-supplied correctness — the action
validates shape and normalizes the word server-side before persisting.

## Gloss lookup

```
lookupGloss(surfaceForm: string)
  → { word: string; meaning_vn: string; phonetic?: string; example_en?: string }
  | null   // null = honest miss
```

Lookup order: exact → `'s` strip → `ies→y`/`ied→y` → `es`/`s` → `ing`
(doubled-consonant undo). First candidate present in the dictionary wins;
otherwise `null`.
