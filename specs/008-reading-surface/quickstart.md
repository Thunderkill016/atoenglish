# Quickstart: verify the reading surface

1. `npm run dev` → sign in → open `/read`.
2. Pick starter text 1 → all meaningful words show the "new" style.
3. Tap `apple` (or any glossed word) → popover shows Vietnamese meaning +
   phonetic; press the speaker button → browser speaks the word.
4. Mark it **known** → it recolours immediately → reload the page → still known
   (durable, not local).
5. Tap a word with no gloss → popover shows "chưa có nghĩa" — never a guess.
6. Tap a word → "Lưu vào flashcard" → check `/flashcards` — a real FSRS card
   exists; the word's status shows "learning", not "known".
7. Paste your own paragraph → same mechanic renders; >5,000 chars is refused
   gracefully.
8. Sign out → reopen `/read` → text renders all-neutral with the honest
   sign-in notice.
9. The header count reads "tự đánh dấu" (self-marked) — not a score.
