# Feature Specification: Learner Reading Surface (spec-008)

**Feature Branch**: `devin/zero-path-session-contract-v2` (continuation — same working branch)

**Created**: 2026-10-04

**Status**: Draft

**Input**: Comparison audit (`research/PRODUCT_COMPARISON_AUDIT.md`) — the family-B
(LingQ/Readlang/Language Reactor) gap: no surface where real text carries the
learner's known/unknown word status with on-demand Vietnamese meaning. Authored
content is the on-ramp; learner-material is the product.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Read a text with per-word knowledge state (Priority: P1)

A signed-in learner opens a reading text (an authored starter text, or pastes
their own). Every word in the text is visually marked by what *this learner*
knows: words with no record render as new/unknown, learned words render as
known. The text itself is the progress display — nothing resets, nothing is
a score.

**Why this priority**: This is the missing family-B mechanic in its minimal
form. Without per-word state on real text there is no reading surface at all —
every other story depends on it.

**Independent Test**: Sign in → open a starter text → words render with two
honest states (unknown vs known) → mark a word known → reload the page → the
word still renders as known (state is durable, not local).

**Acceptance Scenarios**:

1. **Given** a signed-in learner who has never read anything, **When** they open
   a starter text, **Then** all meaningful words render as "new" (not yet
   encountered by this learner).
2. **Given** a learner who marked words `apple`, `work` as known, **When** they
   open any text containing those words, **Then** those words render as known
   in every text — status is per-learner-per-word, not per-text.
3. **Given** an anonymous (not signed-in) learner, **When** they open a text,
   **Then** the text renders with all words in the same neutral state and an
   honest notice that knowledge tracking needs sign-in — never a fake
   personalised display.

---

### User Story 2 — Tap a word for meaning and mark what you know (Priority: P1)

While reading, the learner taps any word. A popover shows the word's Vietnamese
meaning (when a gloss exists), lets the learner hear the word spoken, and lets
them mark it known / mark it still learning / save it to their flashcards for
spaced review.

**Why this priority**: Meaning-on-tap is the other half of the family-B
mechanic — reading support without leaving the text. Marking knowledge state is
what makes Story 1 durable and honest.

**Independent Test**: Open a text → tap `apple` → see its Vietnamese gloss →
mark it known → the word recolours immediately → open a different text →
`apple` is still known.

**Acceptance Scenarios**:

1. **Given** a word with an available Vietnamese gloss, **When** the learner
   taps it, **Then** the popover shows the gloss (and optionally pronunciation
   via browser speech).
2. **Given** a word with **no** gloss in the dictionary, **When** the learner
   taps it, **Then** the popover honestly shows "chưa có nghĩa" rather than a
   guessed or machine-generated meaning.
3. **Given** any tapped word, **When** the learner chooses known / learning /
   save-to-flashcards, **Then** the status persists server-side for signed-in
   learners, and the flashcard save reuses the existing FSRS card pipeline.
4. **Given** an anonymous learner, **When** they tap a word, **Then** the gloss
   still shows, but marking/saving explains that sign-in is required — local
   state is not silently presented as durable.

---

### User Story 3 — See the honest known-word count (Priority: P2)

The reading surface shows the learner their known-word count — the number of
distinct words they have marked known — and per-text coverage ("you know N of
the M words on this page"). These are *self-reported-knowledge* figures and are
labelled as such, consistent with the project's evidence honesty rules.

**Why this priority**: Known-word count is the family-B progress metric that
replaces XP for the reading surface — but it must not pretend to be assessed
evidence. Framing it correctly is what keeps this feature inside the project's
honesty rules.

**Independent Test**: Mark 5 words known → the count shows 5 → mark one back to
learning → the count shows 4.

**Acceptance Scenarios**:

1. **Given** a learner with marked words, **When** they view the reading
   surface, **Then** the known-word total and per-text coverage display, with a
   label clarifying it reflects self-marked knowledge, not measured evidence.
2. **Given** two texts with overlapping vocabulary, **When** the learner reads
   the second, **Then** coverage counts known words once — the same word is
   never double-counted across texts.

---

### User Story 4 — Starter texts for near-A0 readers (Priority: P3)

The surface ships with a small set of short authored starter texts (aligned to
the A0 arc vocabulary) so a learner with nothing to paste can read immediately.

**Why this priority**: Paste-your-own is the family-B true form but cold-starts
an A0 learner. A handful of starter texts removes the blank-slate problem
without building a content library — authored text is the on-ramp, not the
product.

**Independent Test**: Sign in fresh → the reader offers at least 3 starter
texts → each renders the word-status mechanic end-to-end.

**Acceptance Scenarios**:

1. **Given** a new signed-in learner, **When** they open `/read`, **Then** they
   can pick from starter texts without supplying their own.
2. **Given** a learner pasting their own text, **When** the text is submitted,
   **Then** it renders identically — pasted and authored texts share the same
   reading mechanic.

---

### Edge Cases

- A word form appears with different capitalisation or punctuation (`Work,`
  `work.` `WORK`) — status must match case-insensitively and ignore trailing
  punctuation, or the same word would fragment into false-new variants.
- A word the learner saved to flashcards but never marked — status stays
  "learning" (saved ≠ known; the card carries the spaced-review state instead).
- Extremely long pasted text — the surface must bound input size and refuse
  gracefully rather than render thousands of tokens badly.
- Non-English characters in pasted text — they render as neutral non-word
  spans, never as trackable "words".
- Gloss lookup for inflected forms (`works`, `worked`, `working`) — MVP maps
  each surface form to the dictionary's headword where a deterministic rule
  exists; unmapped inflections honestly show "chưa có nghĩa" rather than a
  wrong guess.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render reading texts as sequences of tappable
  word tokens, each coloured by the signed-in learner's stored knowledge state
  for that word (new/unknown, learning, known), with a neutral unstyled state
  for anonymous viewers.
- **FR-002**: The system MUST persist per-learner-per-word knowledge state
  durably so it survives reloads and applies across all texts; anonymous
  sessions MUST NOT persist word state.
- **FR-003**: Tapping a word MUST open a meaning popover showing the word's
  Vietnamese gloss when one exists and an explicit "no meaning yet" state when
  it does not — never a fabricated definition.
- **FR-004**: The popover MUST let a signed-in learner set the word's state to
  known or learning, and save the word to their existing spaced-repetition
  flashcards — saved words default to "learning" status.
- **FR-005**: The surface MUST display the learner's distinct known-word count
  and per-text coverage, labelled as self-marked knowledge rather than assessed
  evidence.
- **FR-006**: The surface MUST offer a small set of authored starter texts and
  accept learner-pasted texts within a bounded length.
- **FR-007**: Word matching MUST be case-insensitive and punctuation-tolerant;
  inflected English forms MUST map to dictionary headwords only via explicit
  rules — unmapped forms show no gloss rather than a guess.
- **FR-008**: The word popover MUST offer browser-side speech playback of the
  tapped word where the learner's browser supports it (no server dependency).

### Key Entities

- **Learner word state**: one record per (learner, normalized word) — status
  (`learning` | `known`), timestamps; owned by the learner, never shared.
- **Gloss entry**: (normalized headword) → Vietnamese meaning — shared
  read-only dictionary content, seeded from the existing authored unit
  vocabulary.
- **Reading text**: authored starter text (title, level, body) or a
  learner-pasted text held for the session; pasted texts are not persisted as
  product content in this MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in learner can open a text, see per-word status, tap a
  word for its Vietnamese meaning, and mark it — all in under 60 seconds for a
  first-time reader.
- **SC-002**: Word state survives a full page reload and a new browser session
  for 100% of marked words (durability, not optimism).
- **SC-003**: The known-word count changes by exactly ±1 per distinct word
  marked/unmarked — no double-counting across texts.
- **SC-004**: 100% of gloss misses render the explicit "no meaning" state — zero
  fabricated definitions.
- **SC-005**: Every functional requirement above is covered by at least one
  automated test; full project verification (`tsc`, lint, tests, build) passes.

## Assumptions

- Family-B's core mechanic — text overlaid with per-word state and tap-for-
  meaning — is validated by the product survey; this spec implements it without
  the parts that require new infrastructure (no video, no mining pipeline, no
  i+1 gate, no server TTS).
- The gloss dictionary is seeded from the existing authored unit vocabulary
  (`meaning_vn`) — a real but small dictionary; misses are shown honestly, which
  is the intended behaviour for an MVP.
- Pasted texts are transient (session-scoped); persisting a personal library is
  a later bounded feature.
- Self-marked word state is *self-report*, not assessed evidence — it must never
  feed the evidence/certification pipeline or `learning_attempts`.

## Non-Goals

- Video/subtitle overlay (Language Reactor class) — separate feature.
- Sentence mining, i+1 selection, coverage gating — requires the
  comprehensible-input infrastructure, deferred.
- Server-side TTS or phoneme scoring.
- Importing web pages/EPUBs; browser-extension capture (Read Frog class).
- A full dictionary — the seed dictionary is deliberately small and honest
  about misses.
- Treating word state as assessed evidence or review scheduling input.
