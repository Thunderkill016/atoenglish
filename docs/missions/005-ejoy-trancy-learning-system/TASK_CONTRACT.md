# Task Contract — 005-ejoy-trancy-learning-system

## MISSION

Replace the current AtoEnglish learning system with a free web learning system that meets the Trancy standard (verified by authenticated deep-dive, adapted per REDESIGN.md): discover or paste a YouTube video → sentence-segmented bilingual subtitles → contextual lookup and AI sentence analysis → save words, phrases and sentences with context → practise on the video → FSRS review in several modes → reuse; then retire the old curriculum system in phases.

## PROBLEM

Owner statements 2026-10-06: Trancy is the product standard; eJOY and the 39 open-source repositories in the research package are the design/technical reference; the current learning system (A0–B2 units, 5-phase lesson player, placement/checkpoints, roadmap, quiz) is to be **replaced**. At contract creation the app had no video input/player. As of the 2026-10-06 research checkpoint, this checkout has discover and an EN sentence player with repeat/theater/read; bilingual VI, contextual word lookup, sentence saving and dictation/shadowing are still pending (see RESEARCH-NOTES). `cards` de-duplicates by lemma and has no source context; the curated gloss dictionary now reads `src/lib/dict/vocabulary.ts` through `src/lib/read/gloss.ts`; preserve this existing primitive.

## WHY IT MATTERS

Without one working loop at the Trancy standard there is nothing for the learner to validate, and the old system keeps absorbing maintenance for a direction that is closed.

## CURRENT EVIDENCE

- Owner decisions 2026-10-06 recorded in `docs/project/PROJECT_STATE.md` and [LEDGER.md](./LEDGER.md).
- Research package on branch `research/ejoy-archive-2026-10-06` (eJOY report, Trancy official pages, 39 repos) — static desk/code research, nothing run; conclusions and repo-to-slice map in [RESEARCH-NOTES.md](./RESEARCH-NOTES.md).
- Probe 2026-10-06 (one public video, residential IP, see LEDGER evidence): Android `youtubei/v1/player` returned manual + `asr` English tracks with `vi` in `translationLanguages`; `json3` requires replacing the `fmt=srv3` already in `baseUrl`; `asr` `json3` carries word offsets (`segs[].tOffsetMs`) with events that split mid-sentence; `tlang=vi` returned HTTP 429 on the first request.
- Authenticated Trancy deep-dive 2026-10-06 ([TRANCY-DEEP-DIVE.md](./TRANCY-DEEP-DIVE.md), corpus at `/tmp/trancy-research/`): extension code, Learning Center route map, live API payloads (word/sentence saves, caption tokens with lemma/POS, progress heartbeat, incremental sync), 36 screenshots. Sentence identity = SHA-256 of normalised text; word state = separate `star`/`master` flags.
- Owner-approved UI/UX adaptation ([REDESIGN.md](./REDESIGN.md)): adapt Trancy's observed layouts (video-left + transcript-rail + dict drawer, icon rail, right-rail widgets, card grids, practice session shell); drop dark-only, paywall/upsell, machine-translated Vietnamese, mascot gamification and the 40-route sprawl.
- Existing code: `src/lib/read/{tokenize,gloss}.ts` (gloss seeded from `UNIT_VOCABULARY`), `src/lib/vocab/lemma.ts`, `src/lib/srs/fsrs.ts` (`ts-fsrs`), `src/lib/ai/gemini.ts` (`gemini-2.5-flash` via AI Gateway), `src/lib/speech.ts`, `src/lib/security/rate-limit.ts`, `src/app/actions/cards.ts`.

## SCOPE

See [SPEC.md](./SPEC.md) for product behaviour and [REDESIGN.md](./REDESIGN.md) for UI/interaction. Delivered as separate PRs, in order:

1. **Slice 1 — player + captions + segmentation:** URL intake, `/watch/[videoId]` with the official IFrame player, server-side caption fetch chain (6-request budget, backoff), learner upload/paste fallback, `segmentTranscript` for `asr` and manual tracks, synced transcript, loop / prev-next / speed / auto-pause / shortcuts, theater and read modes, migrations `content_sources` + `content_transcripts`.
2. **Slice 2 — bilingual + lookup + AI analysis:** Vietnamese line source order (YouTube manual `vi` → Gemini per-sentence batch), display modes, word/phrase popup (curated → AI context gloss → "chưa có nghĩa"), TTS, AI sentence analysis, standalone curated dictionary data, migrations `transcript_translations` + `ai_results`.
3. **Slice 3 — save + library + read:** migrations `study_cards` + `card_contexts`; save word/phrase/sentence with context; highlight saved items; `/library`; `/read` on the new model; new main navigation (phase A).
4. **Slice 4 — practice on the video:** `dictation`, `shadowing`, `speak_first`; migration `practice_attempts`.
5. **Slice 5 — review + evidence:** `/review` on `study_cards` with the six modes; `/me` evidence view.
6. **Slice 6 — discover:** `src/content/catalog/videos.json` (≥ 30 owner-chosen videos, ≥ 5 topics), `/discover` filters and "continue watching"; optional YouTube search only if the owner provides a Data API key.
7. **Slice 7 — retire the old system (phase B):** only after owner approval and ≥ 1 week of real use.

## NON-GOALS

- Downloading video/audio, AI subtitle generation from audio, bulk/batch crawling, fetching without a learner's explicit request, paid proxies.
- General browser-extension products, native mobile app, Netflix/other platforms, web-page or PDF translation, offline sync. The later owner-authorized YouTube caption companion is a bounded `/watch` intake exception (see latest refinement below).
- Payments, plans, quotas, upsell/paywall UX, public launch, multi-user onboarding work.
- Trancy surfaces beyond the six routes (podcast, movies, books/EPUB, PDF, AITalk, sentence-pack studio, assessments) — all deferred per REDESIGN §3/§8.
- Pronunciation scoring, AI voice conversation partner (AITalk / AI Speaking World), structured lesson curriculum, CEFR/band claims.
- Dropping old learner-data tables in the same PR that removes old UI; changing the stack; touching auth/RLS beyond new tables.
- XP, streaks, badges, games or any closed-scope surface.

## DEPENDENCIES

- Owner review of this contract, `SPEC.md` and `REDESIGN.md` before any implementation (status stays `DEFINING` until then — REDESIGN approved 2026-10-06; SPEC/contract updated to match).
- Neon migration replay + pgTAP/RLS checks through the Verify workflow for every new table.
- Owner content selection for slice 6; owner decision on a YouTube Data API key (optional feature).
- Owner approval before slice 7.

## RISKS

- Unofficial caption endpoints change or block the Worker's egress IP → fetch fails. Mitigation: single interface with fixture tests, fixed request budget, visible failure counter, fallback always offered; a live Worker check in slice 1.
- Terms-of-service risk accepted by owner (see `PROJECT_STATE.md`). Mitigation: explicit request only, per-user rate limit, caption text only, never redistribute.
- Segmentation thresholds wrong for real videos → unnatural sentences. Mitigation: versioned pure function, fixtures from several real videos, thresholds tuned before slice 2 builds on them.
- AI translation/glosses wrong or Gemini free-tier limits hit → labelled AI, cached, translate only on demand, failure never blocks watching/saving/review.
- Speech-recognition similarity misread as pronunciation score → label on every result; never changes FSRS.
- Schema change on production Neon → additive migrations only; rollback = drop new tables.
- Removing the old system breaks `test:content-standard`, smoke tests, landing → done in its own PR with its own verification.

## ACCEPTANCE CRITERIA

Slice 1

- [ ] Accepted URL shapes (`watch?v=`, `youtu.be/`, `/shorts/`, `/live/`, `/embed/`, `m.`/`music.` hosts) resolve to an 11-char ID; lookalike hosts and invalid URLs are rejected and store nothing — Vitest + Playwright.
- [ ] For a video with published captions, the transcript appears with timings and the track used (manual/asr, language) — Vitest on recorded fixtures for each chain step + one live check from the deployed Worker preview (result, including `blocked`, reported explicitly).
- [ ] The chain replaces `fmt` with `json3`, never exceeds 6 upstream requests per call, backs off only on network/403/429/5xx, stops on abort — Vitest with injected fetch/delay.
- [ ] `segmentTranscript` turns recorded `asr` fixtures (≥ 3 real videos) into sentences that never exceed 25 words / 12 s and keep word timings; manual-track cues are merged up to terminal punctuation — Vitest fixtures.
- [ ] When fetching fails the UI says so and offers the fallback; valid `.srt`/`.vtt`/timed paste yields sentences; malformed input is rejected — Vitest fixtures + Playwright with fetch mocked to fail.
- [ ] Fetching is per-user rate-limited and triggered only by explicit action; an existing transcript is not re-fetched — integration test.
- [ ] Active sentence follows playback; clicking seeks; loop, prev/next, 0.75×/0.5×, auto-pause and shortcuts work; theater/read modes switch without losing position — Playwright.
- [ ] Other users cannot read/write `content_sources` / `content_transcripts` — pgTAP RLS tests.

Slice 2

- [ ] A YouTube manual `vi` track, when present, is aligned to sentences and labelled; otherwise Gemini translates per sentence in batches validated by Zod, missing lines stay empty, output is labelled "Dịch máy (AI)" and cached (second open makes no AI call) — Vitest with AI mocked.
- [ ] EN+VI / EN / VI / hidden modes work; translation is requested only when bilingual mode is turned on — Playwright.
- [ ] Lookup order curated → AI context gloss → "chưa có nghĩa"; AI failure shows a message and does not block — Vitest with AI mocked to fail.
- [ ] Sentence analysis returns the Zod-validated shape, is labelled AI, cached per (user, sentence hash, model) — Vitest.
- [ ] `gloss.ts` no longer imports curriculum constants — grep + existing reader tests pass.

Slice 3

- [ ] Saving creates one `study_cards` row per (user, kind, key) and one `card_contexts` row per occurrence; re-saving the same occurrence creates nothing; the same item from a second source attaches to the same card — integration test.
- [ ] Saved words/phrases are highlighted in transcripts — Playwright.
- [ ] `/library` lists videos, words/phrases and sentences, filters by source, opens `/watch/[videoId]?t=` at the saved time, edits meanings and deletes items/sources — Playwright.
- [ ] New main navigation shows Khám phá · Đọc · Ôn · Thư viện · Tôi; old entries are gone from navigation but old routes still respond — Playwright.
- [ ] Other users cannot read/write the new tables — pgTAP RLS tests.

Slice 4

- [ ] `dictation` plays exactly the sentence span, compares normalised words, counts hints and plays, and writes one `practice_attempts` row per sentence — Vitest + Playwright (player mocked).
- [ ] `shadowing` / `speak_first` show similarity with the "không phải điểm phát âm" label, never change FSRS, and are hidden when speech recognition is unavailable — Vitest + Playwright (speech mocked).
- [ ] Recordings never leave the browser — code review + network assertion in Playwright.

Slice 5

- [ ] A due card appears in `/review`; mode selection follows SPEC §8 rules; rated modes update FSRS and append `practice_attempts` with `fsrs_before/after` — integration test.
- [ ] `listen_fill` / `sentence_dictation` play the source span; automatic ratings follow the documented thresholds — Vitest.
- [ ] At most one `write_reuse` per session; AI feedback labelled; AI failure does not block — Vitest.
- [ ] `/me` shows the four evidence levels with their denominators and no CEFR/band/XP/streak — Playwright.

Slice 6

- [ ] `videos.json` validates against its Zod schema in a unit test; ≥ 30 entries, ≥ 5 topics, difficulty labelled as the curator's judgement — Vitest.
- [ ] `/discover` filters by topic/duration/difficulty and shows "continue watching" from `last_position_ms` — Playwright.
- [ ] YouTube search UI is hidden when no API key is configured; when configured it calls only `search.list` with `type=video&videoCaption=closedCaption` — Vitest with fetch mocked.

Slice 7

- [ ] Old routes return 404, `/discover` is the signed-in home, no "IELTS" string in landing/metadata/manifest — Playwright + grep.
- [ ] No learner-data table is dropped — migration diff review.

All slices

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run e2e`, `npm run build` (+ `npm run build:vinext` when touching routes/Worker) pass on the exact PR head; migrations replay with pgTAP/RLS in Verify; independent QA review (ato-qa) per slice. (`test:content-standard` was removed in slice 0 — the curriculum corpus it guarded no longer exists.)

## VERIFICATION METHOD

tsc + eslint + vitest + migration replay/db lint/pgTAP (Verify workflow) + Playwright browser check of each slice + independent QA review (ato-qa) per slice; live caption check from a Worker preview in slice 1.

## OWNERSHIP

- Writer: Devin session assigned by owner
- Files/subsystems owned: new `src/lib/video/**`, `src/lib/study/**`, `src/content/catalog/**`, routes `src/app/(main)/{discover,watch,library,review,me,read}/**`, navigation constants, new migrations, removal of old routes in slice 7
- Read-only collaborators: owner (review), ato-qa

## OUTPUT

One merged PR per slice, plus a short validation note after Hoàng uses the loop on real videos for ≥ 1 week.

## STATUS

`IN_PROGRESS` — discover/player implementation and home WIP exist in this checkout as of 2026-10-06. The current owner research request is completed in RESEARCH-NOTES; the learning loop and required Worker/production evidence remain incomplete.

## Research checkpoint — 2026-10-06

Owner requested repository-first research, authenticated Trancy inspection and comparisons with other products/repos to improve AtoEnglish rather than copy the reference. This updates the method of design selection, not the six-surface scope. REDESIGN §9 and RESEARCH-NOTES contain the bounded implementation packet. Current checkout and upstream/main differ; Plate THU-8/THU-9 still describe the prior direction. No production, migration, learning efficacy or completion claim is implied by this research checkpoint.

### User refinement — 07/10/2026: translation core and free preference

Automatic EN→VI translation is the current focus. Free engines are evaluated by meaning quality, not a marketing score. Preserve original sentences/IDs/timing, expose missing/failed outputs, separate provider-specific caches, and never fall back to a billed provider implicitly. Chrome quick translation is opt-in and cannot satisfy the quality engine acceptance after four critical failures in six authored smoke cases. A real provider/corpus evaluation and the existing persistence/RLS acceptance remain required; mocked UI/route checks establish alignment and failure handling only.

07/10 bounded local-engine outcome: optional self-hosted contextual subtitle adapter integrated into existing route/client and tested with actual pinned Hy-MT2 Q4 on 30 authored cases. Preserve login boundary, source clocks/IDs, provider-scoped cache, cancellation and no automatic Gemini fallback. Config disabled by default; no production enablement or full Slice 2 acceptance. Codex reading and synthetic UI tests are not independent human/real-library evidence. See RESEARCH-NOTES update for measurements and remaining gates.

### Owner refinement — 07/10/2026: automatic player understanding

Owner: “Tiếp tục học hỏi trancy để phát triển trang player video và tính năng dịch và học từ vựng của nó tự động chứ ko cần phải bấm nút”. This supersedes the earlier explicit caption-fetch/device-download-only UX and the reveal default: opening a video requests captions once, defaults to visible EN+VI, prepares a supported available device model, and uses an ordinary page/play gesture for a first Chrome model download. Only already-configured free server engines may start for an authenticated learner; Gemini stays an explicit choice. No automatic retry/fallback or new provider configuration.

Scope: existing `/watch`, translation hook, shared curated dictionary, regression tests and evidence. Automatic vocabulary is a bounded list of existing dictionary meanings for the active cue (longest existing phrase first, honest misses omitted), not contextual AI sense verification, saving or learning assessment. Preserve uploaded/manual VI, original EN/IDs/times, model-specific caches, extension compatibility and manual fallback. Do not auto-play, auto-save words, mark learned, modify FSRS, migrate DB or deploy. Acceptance: one opening request under StrictMode, stale results cannot replace pasted/imported content, ordinary interaction prepares browser download once, failure stops, human VI wins, modes/caches/seek remain correct, no extra document/rail scroller on desktop, clean typecheck and tests. Real caption availability and translation quality remain separate live gates.

### Owner refinement — 07/10/2026: native caption intake repair

Owner asked why Trancy can obtain captions, then “Vậy giờ xử lý ntn ?” and
“tiếp tục”. Refine the existing caption companion authorized by the earlier
“làm extension đi” decision in LEDGER: inject at document_start in the embedded
YouTube player, read native json3 first, drive a bounded native track request,
and use a single same-session direct fallback only when not refused. Do not
copy proprietary code, download audio/video, bulk crawl, manufacture session
tokens or extend this into a general extension platform.

Acceptance: exact parent origin/frame/video and bounded payload checks; one
automatic request under StrictMode; no overwrite of loaded/pasted captions;
stop server intake on 403/429; optional VI refusal preserves EN; import tab
closes after successful storage; only trusted server acquisition may populate
the public cache. Typecheck, focused unit tests and installed-extension
browser fixtures must pass. Real-session source availability and deployed
cache/runtime remain separate gates; no DB migration, seed or deploy authorized
by this continuation.
