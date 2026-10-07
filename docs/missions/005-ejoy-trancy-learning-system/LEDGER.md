# Development Ledger — 005-ejoy-trancy-learning-system

> The Lead maintains this. Append entries; do not rewrite history.

## MISSION

New AtoEnglish learning system at the Trancy standard, replacing the old curriculum system — see [TASK_CONTRACT.md](./TASK_CONTRACT.md).

## STATE

`IN_PROGRESS` — 2026-10-06 (discover/player exist with home WIP; comparative research complete, full learning loop pending)

## ACTIVE WORKSTREAMS

| Stream                | Owner | State    | Output expected                                                                        |
| --------------------- | ----- | -------- | -------------------------------------------------------------------------------------- |
| Direction + spec docs | Devin | APPROVED | PROJECT_STATE, SPEC, TASK_CONTRACT, LEDGER, RESEARCH-NOTES, TRANCY-DEEP-DIVE, REDESIGN |

## DECISIONS

| Date       | Decision                                                                                                                                                                                                                                                                                                                               | Rationale                                                                           | Made by |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| 2026-10-06 | Replace IELTS direction with learning English through videos (PR #233)                                                                                                                                                                                                                                                                 | eJOY desk study; owner choice                                                       | Owner   |
| 2026-10-06 | New system replaces the old learning system, not an add-on                                                                                                                                                                                                                                                                             | Owner statement (recorded in PR #234)                                               | Owner   |
| 2026-10-06 | eJOY and Trancy are the product standard; the 39 repos are the technical reference set                                                                                                                                                                                                                                                 | Owner request in session                                                            | Owner   |
| 2026-10-06 | Write a new spec (mission 005) instead of amending 004 v2                                                                                                                                                                                                                                                                              | Owner answer in session                                                             | Owner   |
| 2026-10-06 | Include bilingual subtitles + sentence segmentation, sentence saving + practice on video, AI sentence analysis + read mode, curated video library                                                                                                                                                                                      | Owner answer in session (all four groups selected)                                  | Owner   |
| 2026-10-06 | Close PR #232 ("0→B2/C1 free" direction)                                                                                                                                                                                                                                                                                               | Conflicts with the single active direction; owner answer                            | Owner   |
| 2026-10-06 | Spec first, no code until the owner approves                                                                                                                                                                                                                                                                                           | Owner answer in session                                                             | Owner   |
| 2026-10-06 | Keep from 004: caption fetch chain + ToS mitigations, five-object data model, phased removal of the old system                                                                                                                                                                                                                         | Already owner-approved or derived from the research package                         | Devin   |
| 2026-10-06 | Vietnamese subtitles: YouTube manual `vi` track → Gemini per-sentence batch; do not depend on `tlang=vi`                                                                                                                                                                                                                               | `tlang=vi` returned 429 on first request (evidence below)                           | Devin   |
| 2026-10-06 | Curated catalogue as a JSON file in the repo, difficulty = curator judgement                                                                                                                                                                                                                                                           | No crawling, reviewable in PRs, no false CEFR claim                                 | Devin   |
| 2026-10-06 | Trancy is the sole product standard; eJOY and the 39 repos are demoted to design/technical reference                                                                                                                                                                                                                                   | Owner statement in session                                                          | Owner   |
| 2026-10-06 | Adopt Trancy-derived UI per REDESIGN.md: drop dark-only, paywall/upsell, machine-translated VI, mascot gamification, 40-route sprawl; keep 6 routes                                                                                                                                                                                    | Owner approval of REDESIGN.md                                                       | Owner   |
| 2026-10-06 | Apply the 10 repo-derived changes from TECH-KNOWLEDGE §9 into SPEC: `aAppend` line-end semantics + noise filter, timedtext client params + PO Token note, `context_origin`, CSS Custom Highlight, U+2019 tokenisation + deterministic blanks, `migrateToFSRS` mapping, auto-rating reference, subsequence similarity, ECDICT candidate | Owner answer "có" in session                                                        | Owner   |
| 2026-10-06 | Clean the old product surface BEFORE coding ("slice 0"): replace phased §13 plan — delete old routes/actions/libs/tests, extract `UNIT_VOCABULARY` → flat `src/lib/dict/vocabulary.ts` (501 entries), rewrite landing/login/manifest, keep infra + reusable libs + all DB tables                                                       | Owner statement "trước khi code phải dọn toàn bộ dự án cũ" + approval of boundaries | Owner   |

## EVIDENCE LOG

| Date       | Evidence (command/output/doc)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Supports                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 2026-10-06 | Research package `research/ejoy-archive-2026-10-06` commit `aa2d6678`, 9 zip parts → `ejoy-product-research/bao-cao-ejoy.md`, `github-research/{BAO-CAO,DANH-MUC-REPO,TRANCY,SCOPE}.md`                                                                                                                                                                                                                                                                                                                                                                                                             | Product standard, repo reference set                                     |
| 2026-10-06 | Android `youtubei/v1/player` probe on one public video from a residential IP: `playabilityStatus=OK`, English manual + `asr` tracks, 18 `translationLanguages` incl. `vi`                                                                                                                                                                                                                                                                                                                                                                                                                           | Fetch chain step 1, bilingual feasibility                                |
| 2026-10-06 | Appending `&fmt=json3` to a `baseUrl` that already contains `fmt=srv3` still returned XML; replacing `fmt` returned `json3`                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | SPEC §4.2 `fmt` rule                                                     |
| 2026-10-06 | `asr` `json3`: 103 events, 51 `aAppend` newline events; text events carry `segs[].tOffsetMs` word offsets and break mid-sentence (e.g. "love. You know the rules and so do" / "I. I feel …")                                                                                                                                                                                                                                                                                                                                                                                                        | SPEC §4.3 segmentation design                                            |
| 2026-10-06 | `…&fmt=json3&tlang=vi` → HTTP 429 on the first request                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Do not depend on YouTube auto-translate                                  |
| 2026-10-06 | `read-frog` (GPL-3.0) has `parseScrollingAsrSubtitles` with tests for `asr` `json3`; `easysubs` (MIT) computes cue end from the last `tOffsetMs`                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Segmentation references                                                  |
| 2026-10-06 | Authenticated Trancy capture (corpus `/tmp/trancy-research/`, report [TRANCY-DEEP-DIVE.md](./TRANCY-DEEP-DIVE.md)): extension v7.9.4 code, ~40 Learning Center routes, live API payloads, 36 screenshots                                                                                                                                                                                                                                                                                                                                                                                            | Trancy as product standard                                               |
| 2026-10-06 | Live-verified Trancy internals: sentence `sid` = SHA-256 of normalised text (dedupes across contexts); word state = `star`+`master` flags; caption `tokens` carry lemma/POS/dep; `PUT /3/play-progress` ~3 s heartbeat; `/4/words?updatedAt=` incremental sync                                                                                                                                                                                                                                                                                                                                      | Card-context dedup, NLP tokens, heartbeat/sync patterns in SPEC/REDESIGN |
| 2026-10-06 | Trancy's live Vietnamese UI is machine-translated with errors ("CHÚNG TA" for US accent, "Bà" for Review, "Nắm Bắt" for Mastered); a wordbook click crashed the SPA (`insertBefore`); several public `/youtube/` pages return 500                                                                                                                                                                                                                                                                                                                                                                   | REDESIGN §2 B1/B9 — hand-written VI, error boundaries                    |
| 2026-10-06 | Deep code read of the 39-repo reading packets → [TECH-KNOWLEDGE.md](./TECH-KNOWLEDGE.md): read-frog `parseScrollingAsrSubtitles` (aAppend = line-end signal, pendingSplit, 200 ms word estimate), `pot`/`potc` PO Token + `buildSubtitleUrl` fixed params, echo-type `accuracyToRating` 50/70/90 + `migrateToFSRS`, zeeguu `Bookmark{sentence_i,token_i,total_tokens}` + `cached_tokenized`, word-hunter CSS Custom Highlight API, english-trainer ordered-subsequence similarity, dictation-shadowing-tool precomputed `blanks` + U+2019-aware token regex, shadowing-english ECDICT (80k entries) | Concrete techniques per slice; SPEC changes listed in TECH-KNOWLEDGE §9  |

## FINDINGS

| Finding                                                                                         | Source                        | Accepted/Rejected | Why                                                              |
| ----------------------------------------------------------------------------------------------- | ----------------------------- | ----------------- | ---------------------------------------------------------------- |
| 004 v2 lacked bilingual subtitles, sentence saving, practice on the video, read mode, catalogue | Comparison with eJOY/Trancy   | Accepted          | Core features of both reference products                         |
| Trancy AI Subtitle (Whisper) for videos without captions                                        | `TRANCY.md`                   | Rejected          | Requires downloading audio — violates the YouTube mitigations    |
| AITalk / AI Speaking World / pronunciation assessment                                           | eJOY report, `TRANCY.md`      | Rejected          | Closed scope; pronunciation scoring not honestly measurable here |
| Free/Pro quotas and plan tiers                                                                  | eJOY report, `TRANCY.md`      | Rejected          | Owner: no monetization                                           |
| Conflicting branch `docs/free-english-recovery-20261006` (PR #232)                              | GitHub                        | Rejected          | Owner chose to close it                                          |
| Trancy's 40+ route sprawl (podcast, movies, books, PDF, assessments, pack studio)               | TRANCY-DEEP-DIVE §5           | Rejected for now  | Six routes only until the core loop is validated (REDESIGN §3)   |
| Trancy dark-only theme                                                                          | TRANCY-DEEP-DIVE, screenshots | Rejected          | `/watch` dark-first; app shell keeps light/dark (REDESIGN §4.1)  |

## OPEN BLOCKERS

- Open decisions in SPEC §15 — status after PLAN.md drafting: **resolved**: YouTube Data API key (owner creates GCP key for slice-6 search), `cards` migration (dropped — fresh start, tables join slice-7 drop list). **Still open**: expanded EN–VI dictionary source (ECDICT ruled out — it is en→zh; candidates: Wiktionary VI/kaikki CC BY-SA or AI long-tail — only blocks dictionary coverage, not slice 2), phase-B timing, closing PR #234, Upstash for prod rate-limit hardening before slice 2.

## PLANNING

- `PLAN.md` drafted by planning agent + owner-approved decisions (2026-10-12): slice order 1-tail → 2 → 3 → 4 → 5 → 7, slice 6 parallel; `cards` import **rejected by owner** (fresh start — `cards`/`card_review_logs` move to slice-7 drop list); YouTube Data API key **approved** (owner creates GCP key — search UI stays hidden until `YOUTUBE_DATA_API_KEY` set).

## IMPLEMENTED CHANGES

| Commit     | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Verified by                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `f5125435` | Slice 0 — strip old product surface: old routes/actions/libs/tests deleted, `UNIT_VOCABULARY` extracted to `src/lib/dict/vocabulary.ts` (501 entries), landing/login rewritten, infra + reusable libs + all DB tables kept                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | verify gate: tsc / lint / 81 tests / build / source-of-truth                                                                                                                  |
| `b92b4462` | Slice 1 — `/watch/[videoId]` + caption chain: `fetchYoutubeCaptions` (iOS→Android→watch→timedtext, ≤6 requests, retryable-only backoff), `segmentTranscript` (ASR pendingSplit + word timings; `♪` treated as decoration so lyric tracks survive — SEGMENTATION_VERSION 2), SRT/VTT/paste/plain fallback, `content_sources` + `content_transcripts` (owner RLS), CSP for IFrame API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | tsc / lint 0 warn / 127 tests / build / source-of-truth / squawk 0 / migration dry-run on Neon temp branch / live smoke: transcript renders on rickroll                       |
| follow-up  | Slice-1 QA fixes (adversarial review verdict DO-NOT-SHIP → fixed): sentence-loop never re-armed (rising-edge re-arm), YT player remounted into detached div on videoId change (imperative mount node + `key={videoId}`), script-load failure hung spinner (onerror + 10 s timeout → error UI), 20/hour quota never enforced when CF binding resolved (dual limiter: hourly + burst), auto-scroll offsetTop mismeasured (scrollIntoView), VTT `NOTE`/`STYLE`/`REGION` preamble rejected whole file, `start_ms:0` unseekable, tautological word-cap test rewritten, migration prefixes deduped, pgTAP `source_id` captured via RETURNING                                                                                                                                                                                                                                                                                                                                                           | tsc / lint / 154 unit tests / **12/12 e2e watch.spec.ts** (chromium + mobile, stubbed IFrame API) / build / squawk / adapt-check                                              |
| `60b09163` | Home rebuild v1 (owner-directed, ahead of slice order — research: Trancy/Lingopie/FluentU/LingoClip/eJOY/Migaku/Language-Reactor + Netflix/Duolingo): landing `/` hero now has a working paste-input (LingoClip guest-playable pattern), honest "Miễn phí · không cần tài khoản" + "Đang phát triển" block instead of unbuilt-feature claims, FAQ, sample-video grid; `/discover` is now a server component — auth fail-open, "Đang xem dở" row (resume cards with progress bar + `?t=` deep-link), "Tuần này" + resume widgets in RightRail (T5, stacks below content on mobile per §4.3), starter grid on T6 VideoCard. New shared components: `YoutubeLinkInput`, `VideoCard`, `EmptyState`, `RightRail/WidgetCard`, `lib/format`. Rejects applied: no sign-in wall (Trancy), no mid-feed upsell (B3), no fake metrics (B8), hand-written VI copy (B1).                                                                                                                                       | tsc / lint 0 warn / 156 unit / **36/36 e2e** incl. 10 new home.spec.ts (guest discover, paste→watch nav, signed-in continue-watching seeded via DB) / build / source-of-truth |
| `f8177206` | Home rebuild v2 — learning-home pass (owner rejected v1 as too minimal): **AppShell** = `(main)` route group with IconRail 56px desktop (icon-only, dot active, theme toggle bottom — T4) + BottomNav mobile; `/` `/login` `/watch` stay outside the shell. `/discover` moved to `(main)/discover`: floating paste input + Ctrl+K hint, `Đang xem dở` horizontal strip, `Thư viện chọn sẵn` = curated catalog (18 verified videos, 5 topics, Dễ/Vừa/Khó — no CEFR) with FilterChips + LevelSegment (T7), EmptyState on empty filter (T10), RightRail widgets + `Hoạt động` (last 3 sources). Catalog is interim — slice-6 owner curation to ≥30 still required.                                                                                                                                                                                                                                                                                                                                  | tsc / lint / 164 unit (+8 catalog validator) / **36/36 e2e** / build / source-of-truth                                                                                        |
| pending    | Home v3 — visual-deepen pass from screenshot teardown (Trancy `home.png`/`movie.png`/`saved.png`/`history.png` corpus) + wave-2 research (Anki/Bunpro/Khan/Coursera/YouTube-home/Memrise/Drops/LingQ): **VideoCard chromeless** (thumb-only rounding, meta as discrete pills — age/topic/colored-level/caption-label, channel initial avatar, `Đã xem` ≥95% + resume floor 30s/5%), **resume hero banner** ("Xem tiếp từ X · còn ~N′" — Anki Study Now single-CTA pattern), **greeting** "Chào buổi … — thứ, ngày" for signed-in, **WeekStrip** 7-day widget (T2..CN, active days tinted, today ring — real `updated_at` data, no streak flame), RightRail sticky + WidgetCard action slot, grid gap 5/6, FilterChips borderless muted pills, Hoạt động lines now carry "Xem đến X:XX · age". Deferred w/ reason: due-count widget (needs study_cards, slice 3/5), forecast/heatmap (fake precision now), multi-shelf rows (LingQ bloat complaint), personalized difficulty (needs vocab store). | tsc / lint / 164 unit / **36/36 e2e** / build / source-of-truth                                                                                                               |

## VERIFICATION

| Gate                    | Result | Evidence                                                                                                                                                                                                                                                                   |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit`          | PASS   | slice-1 worktree, incl. hand-added `content_*` types                                                                                                                                                                                                                       |
| `npm run lint`          | PASS   | 0 errors, 0 warnings                                                                                                                                                                                                                                                       |
| `npm run test`          | PASS   | 127 tests / 16 files (45 video-lib tests incl. 5 real-video json3 fixtures + lyric regression)                                                                                                                                                                             |
| `npm run build`         | PASS   | `/watch/[videoId]` dynamic, `/discover` static                                                                                                                                                                                                                             |
| `check:source-of-truth` | PASS   | —                                                                                                                                                                                                                                                                          |
| squawk `db:lint`        | PASS   | 0 issues / 59 files (pilot_events check split add-NOT-VALID + validate)                                                                                                                                                                                                    |
| Live smoke (localhost)  | PASS   | click "Lấy phụ đề" → iOS track → 20 lyric sentences render; IFrame API loads under new CSP                                                                                                                                                                                 |
| Neon migration dry-run  | PASS   | temp branch `mcp-migration-*`: 19 statements applied, 4 RLS policies per table, constraints verified, branch discarded                                                                                                                                                     |
| Neon prod migration     | PASS   | `db:migrate` on `production` (br-broad-thunder-az291ui5): 4 applied (content_sources, pilot_events ×2, drop_diag_claims), 58 skipped; `db:test` all pgTAP PASS incl. content_sources_rls                                                                                   |
| Worker preview deploy   | PASS   | `deploy-cf --preview` → `docs-005-ejoy-trancy-system-atoenglish.thunderkill016.workers.dev`                                                                                                                                                                                |
| Live caption check (CF) | PASS   | `scripts/smoke-preview.mjs` on preview: click "Lấy phụ đề" → lyric transcript renders end-to-end from Worker egress, 0 console errors; guest degrade shows "Đăng nhập để lưu" (preview has no worker secrets → createClient throws → guest path, covered by new unit test) |
| e2e read-mode + ?t=     | PASS   | `watch.spec.ts` +2 tests (16/16 total across Chromium + Mobile Chrome): read-mode hides timestamps/toggles back, `?t=65000` deep-links to 1:05 on player ready                                                                                                             |

## FOLLOW-UP FIXES (post-QA, slice-1 tail)

- `captions.ts` `currentUser()` now fails open to `{supabase:null, user:null}` when auth/env resolution throws (preview workers carry no secrets) — caption fetch is env-independent and must not die on a missing `NEON_DATA_API_URL`; persist + telemetry skip cleanly. Regression: `captions.test.ts` 2 new cases (env-failure → guest fetch works; saveLearnerTranscript → unauthorized).
- Known-warning (dev-only): browser logs "Encountered a script tag while rendering React component" — no `<script>`/`next/script` exists in app source; traced to vinext's `next/script` shim internals rendering a `<script>` element during dev SSR. Production preview showed zero console errors; not a functional break. Revisit if it ever appears in production builds.
- Doc drift: removed references to deleted `test:content-standard` / `smoke:learn` / `audit` scripts from `TASK_CONTRACT.md`, `README.md`, `.devin/agents/ato-qa.md`, `.devin/skills/{ato-verify,ato-release-check}/SKILL.md`, `CLOUDFLARE_DEPLOY.md`, `PROJECT_STATE.md` (release invariant now points at `check-deploy`).

## FINAL ACCEPTANCE

- Verdict: `PENDING`
- Acceptance criteria met: 0/n
- Accepted by / date:

## Home v4 — "Bàn học" (Study Desk) reskin — 2026-10-06

**Research round 3** (2 subagents): mined corpus ảnh Trancy + wave-2 products; added LingQ 5.0 backlash lesson (visual novelty forgiven, workflow regressions not — every capability stayed ≤1 click), Netflix/Spotify "personal-first" ordering, VN mobile reality (bottom nav kept), premium-vs-cluttered craft attributes (one accent budget, hairline > shadow, tinted neutrals).

**New visual direction — full reskin, not polish:**

- Palette: warm paper canvas `oklch(0.966 0.008 95)` + warm ink + deep-green accent (same hue family, quieter); dark = warm charcoal (not blue-black). `--mark` highlighter token reserved for saved words.
- Typography: **Be Vietnam Pro** (VN-native diacritics) body + **Playfair** variable serif for display/wordmark — replaces Plus Jakarta Sans.
- Shell: icon rail → **masthead** (serif wordmark, text nav with underline-active, theme toggle right); mobile bottom nav unchanged.
- `/discover`: serif "Hôm nay học gì?" + micro-caps date line; resume hero → hairline bookmark card; widgets → borderless margin column (micro-caps titles + hairline separators); WeekStrip → 7 dots; topic chips → underline tabs; level segment → ink pill.
- VideoCard: meta pills + avatar removed → single dot-separated meta line + colored level dot.
- Landing: serif wordmark/headlines, hairline header.
- Dead-code cleanup in globals.css: removed unused minimal-_/chart-_/sidebar-_/phase-_/feedback tokens + streak/spotlight/lesson-flip/metal-reflect/step-dot utilities (zero usage verified by grep).

**Rejected (documented):** dark-first cinema shelves (catalog too small, NN/g horizontal-scroll-on-desktop evidence), Duolingo-style forced path, Lingopie-style "a lot going on" metric strip.

**Gate:** tsc ✓ · eslint 0/0 ✓ · 164/164 unit ✓ · 36/36 e2e ✓ · build ✓ · source-of-truth ✓

## Home v5 — Trancy-faithful reskin — 2026-10-06

Owner rejected the v4 "Bàn học" editorial direction ("phải làm giống home của trancy"). Re-grounded on the actual captured Trancy home screenshot (`/tmp/trancy-research/live/shots/home.png`) and restored/derived from `bc5c55f7`:

- **Dark-first** (defaultTheme="dark", Trancy home is dark; light theme still available via toggle). Neutral palette — warm-paper experiment reverted; dead-token cleanup kept (minimal-_/chart-_/sidebar-_/phase-_/streak/flip utilities).
- **IconRail restored** (masthead removed); active item = neutral gray square per Trancy.
- Top paste field is the page header — greeting/H1 removed to match Trancy home (no "Khám phá" title).
- VideoCard: channel avatar circle moved onto the thumb's bottom-left corner (TED-logo position in Trancy), pill meta kept.
- Right rail: Trancy panel look (rounded bg-card) + new "Bộ sưu tập" tile grid with **real counts** (Video đã mở / Đang xem dở); vocab/sentence counts deferred until study_cards exists — honest note shown.
- Font: Be Vietnam Pro kept (VN diacritics); Playfair removed.
- Search input + button rounded-full per Trancy chrome.

**Gate:** tsc ✓ · eslint 0/0 ✓ · 164/164 unit ✓ · 36/36 e2e ✓ · build ✓ · source-of-truth ✓

## Home v5.1 — accent swap: green → gold, pattern refresh — 2026-10-06

Owner: "Ko dùng màu xanh lá cây và pattern cũ nữa". Trancy structure kept (rail, feed, right rail) but:

- **Primary → amber/gold** (`oklch 0.58/0.78, hue 75–85`) — matches Trancy's own CTA gold, not generic green. `--ring` follows.
- **State colors de-greened**: new=slate, learning=amber, known=blue, due=rose (no green anywhere).
- Card meta pills → **dot-separated meta line** (`Kênh · Chủ đề · ● Mức`); avatar stays on thumb corner.
- Topic chips → **underline tabs**; level segment active = ink chip (bg-foreground).
- `--mark` kept for future saved-word highlighting (gold wash).

**Gate:** tsc ✓ · eslint 0/0 ✓ · 36/36 e2e ✓ · build ✓

## Repository-first product research and selective design — 2026-10-06

**Owner request:** continue after Trancy login; understand current docs/code, inspect Trancy, compare multiple products and public repositories to develop AtoEnglish intelligently rather than copy it.

**Observed:** checkout HEAD `938a6908` plus preserved home/sidebar WIP; upstream main `a0043069`, PR #235 open. Discover/EN player exist; VI lookup/save/practice/review loop pending. Plate THU-8/THU-9 stale (curriculum/004), Active Work/Next do not reflect 005. Production not checked.

**Research:** authenticated Trancy home/player/word lookup/video examples/empty vocabulary; official docs for Language Reactor, eJOY, Migaku, LingQ and Lingopie; 33 source/test/doc/LICENSE files retrieved at pinned SHAs across 8 repos, selectively read, no repo build/execution. No writes to Trancy saved learning data, no extension installation. Source access and lookup are not evidence of playback correctness or learning gains.

**Changes:** RESEARCH-NOTES comparison and current-code map; TECH-KNOWLEDGE pinned source/license references and corrections to auto-rating/migration assumptions; REDESIGN §9 action-driven sidebar, single scroll and accessible contextual lookup packet; TASK_CONTRACT corrects stale statement that video input/player are absent. Existing UI WIP preserved; no production code changes in this research checkpoint, commit/push/merge/deploy or DB changes.

**Execution packet:** finish caption/Worker boundary; contextual understanding (slice 2); idempotent save and source return (slice 3); dictation → due review (slices 4/5). Acceptance UX-1…LEARN-2 in RESEARCH-NOTES. State: RESEARCH COMPLETE; product loop still IN PROGRESS.

**Validation of this documentation checkpoint:** `npm run check:source-of-truth` PASS; `git diff --check` PASS; local `tsc --noEmit --incremental false` PASS against the preserved checkout. These checks do not run reference repositories, exercise the new learning loop or verify a release.

## Home v6 — selective design implemented — 2026-10-06

Owner: “Tiếp tục nghiên cứu và phát triển trang home”. Bounded scope: improve /discover and its shared navigation/cards; preserve the existing 005 checkout and prior WIP. No new product direction, DB change or release.

- Header states the task and retains the working YouTube input. Catalog topics are visible; title/channel/topic search normalizes diacritics; ≤10-minute sessions combine with topic/curator-level filters; result count/reset/empty recovery stay together.
- Home/sidebar share one document scroll. Compact sidebar contains a neutral current-week calendar, guest sign-in or verified video-source summary, and guidance for controls that already work in the player. Flashcard/PDF/statistic placeholders and the empty progress plot no longer consume home space. Resume snapshots are not treated as learning-day history.
- Viewer reads distinguish guest, verified-empty/ready and unavailable data. Failed auth/source/count reads no longer silently become a zero count; public catalog stays usable with recovery. Resume reads a bounded recent window, excludes incidental/completed positions and preserves millisecond links.
- Shared nav marks unimplemented /read,/review,/library,/me as unavailable, with accessible labels, instead of navigating to missing routes. Cards retain one channel mark with compact metadata; link errors have accessible feedback; today's date has aria-current.
- Added mocked server-render tests for guest, eligible resume, real zero, auth/read/client failure and per-user query filters. Guest e2e covers search/filter/reset, responsive reflow, link feedback and one vertical scroll. No extra testing dependency introduced.

**Evidence:** local tsc --noEmit --incremental false PASS; ESLint changed source/tests PASS; 21 unit tests PASS; full home/landing guest suite 45/45 PASS across desktop 1854px, short desktop 1440px, tablet 1024px, mobile 393px and narrow mobile 320px. After the final calendar accessibility attribute, sidebar regressions 5/5 PASS. Browser desktop/mobile inspected; screenshots saved as atoenglish-home-desktop-v2.jpg and atoenglish-home-mobile-v2.jpg in the calling chat outputs. Guest config omitted global auth/DB setup and signed-in seeding. Real signed-in browser/runtime remains unverified; mocked query filtering is not an RLS proof.

**Work state:** HEAD remains 938a6908 with uncommitted WIP; no commit/push/merge/deploy. Plate Product Truth THU-8 and Current State THU-9 reconciled with mission 005 and current local evidence, replacing stale curriculum/004 descriptions. Remaining lookup/save/practice/review work follows the existing PLAN.

- Final search regression: `VLOG DOI SONG` initially returned 0 instead of 2 because Unicode NFD does not decompose `đ`. Explicit `đ → d` normalization fixed the root cause; all 5 viewport search regressions PASS after the fix. Final typecheck and changed-file ESLint PASS.

## Home correction, discovery picker and dictionary — 2026-10-07

Owner explicitly required restoring statistics, replacing duplicate search inputs, and adapting the Trancy discovery/AI dictionary screenshots. Preserved prior WIP. Restored Flashcard, statistics, Activity and Progress at home; no PDF revival, fake counts or invented events. One compact launcher opens search in a modal; Video/Channels/topics use the 18-video curated catalog, shared query/topic filters, reset, direct links and keyboard shortcuts. Dictionary drawer uses the 501-entry curated gloss plus explicit authenticated AI via existing Gemini helper, with source labels, examples, honest errors and no data writes.

Regression findings fixed: removed lucide brand icon import; native search Escape cleared text instead of closing; native first/last focus could escape to browser chrome; origin validation wrongly compared localhost to internal 0.0.0.0; body-only locking left a second root scrollbar. Both dialogs now lock root/body and use shared focus boundaries. Verification results follow below; no commit/push/merge/deploy or real Gemini/DB writes.

**Final local evidence:** TypeScript `tsc --noEmit --incremental false` PASS; changed-file ESLint PASS; 37 unit tests PASS (home 9, dictionary route 15, catalog 8, activity 5). Full guest home/landing E2E 55/55 PASS across 5 viewports (1854px, 1440px, 1024px, 393px, 320px), including modal scroll locks, first/last focus, Esc, link/filter/channel discovery, curated lookup/miss and guest AI recovery. Source-of-truth and diff whitespace checks PASS. Browser desktop/320px screenshots saved in the calling chat outputs. Tests skip real auth/DB seeding; successful authenticated Gemini runtime, RLS, audio quality and production remain unverified. No commit/push/merge/deploy.

## Home/search visual refinement — 2026-10-07

Owner compared Trancy and local screenshots, then authorized fixing the identified density/hierarchy problems. Removed visible modal/home title layers and redundant submit button; default picker explores 12 actual catalog channels. Typing switches to videos; clearing restores discovery. Thumbnail previews and representative video covers replace repeated monitor icons. Desktop topics use a side column; 320px uses compact wrapping rows, with one dialog scroller. Existing curated/dictionary/AI/data-state behavior preserved.

Channel selection now filters exact channel in the shared context: TED has 5 catalog videos; Stanford shares the TED topic but must not appear in TED's channel results. Free text/topic search remains broader. Home shows video sooner; compact widgets and Flashcard/statistics preceding the guest sign-in panel expose all four metric tiles on 1440x640. Activity and Progress remain on the document.

Evidence: final clean TypeScript and changed-file ESLint; 37 unit tests PASS. Full guest home/landing E2E 55/55 PASS across 5 viewports, including new channel/focus/thumbnail assertions and first-screen desktop statistics. After the final mobile chip spacing and clear-query regression, focused picker/reflow E2E 10/10 PASS. Browser screenshots inspected desktop 1440x640 and mobile 320x720; saved as v4 outputs. Formatter run on changed TSX/tests; source-of-truth and whitespace checks PASS. No commit/push/merge/deploy, DB writes or authenticated live AI validation.

## Curated Vietnamese title meanings — 2026-10-07

Owner authorized title translation following the recommendation: optional secondary Vietnamese meanings for discovery, original English/channel retained. Added `titleVi` to all 18 curated entries. One shared `Hiện nghĩa Việt` toggle (off by default, compact icon on mobile/search) controls catalog and search previews. Search indexes original/Vietnamese titles independently of visibility, with the existing diacritic/đ normalization. Reset preserves display choice; choice is page-session state, not persisted. Existing VideoCard takes an optional secondary meaning, so non-catalog resume cards remain unchanged. No official YouTube translation claim, runtime AI calls, migrations or DB/cache writes; titles outside catalog still original.

Validation: final TypeScript PASS, changed-file ESLint PASS, 38 unit tests PASS (catalog translation coverage included), full guest home/landing E2E 60/60 PASS across five viewports. New browser regression checks defaults, original link/title preservation, shared toggles, hidden Vietnamese search, reset behavior and zero dictionary/translation requests. Browser desktop and 320px inspected; screenshots saved in calling chat outputs. Source-of-truth/diff checks PASS. No commit/push/merge/deploy.

## Watch player layout and transcript follow — 2026-10-07

Owner continued with Trancy practice versus local watch screenshots. Bounded change to existing `/watch/[videoId]`: fix the iframe-size root cause and adapt theater/read layout and caption navigation. Preserved home/search/dictionary/title-meaning WIP. Same branch/HEAD `938a6908`; uncommitted local work.

- YouTube's default 640×390 iframe was smaller than the surrounding responsive frame. The constructor now sets width/height to 100%, and the wrapper styles the replaced iframe. Centered 16:9 desktop stage fits available height, with a separate caption strip; narrow phones preserve the documented 200px minimum player height. Official primary reference: https://developers.google.com/youtube/iframe_api_reference .
- Desktop theater uses one constrained transcript/empty-panel scroller and no document scrollbar. Mobile/read use document flow. Header falls back to catalog title/channel without a metadata request; player DOM/time survive mode changes. Timed rows carry timestamp pills and source labels; untimed text remains explicitly read-only.
- Progress slider seeks without forcing playback. Controls have accessible names, state and readiness/availability gates. Native button Space activation is preserved; typing/modifier shortcuts do not commandeer playback. Next before the first cue now seeks the first cue instead of the last.
- Manual wheel/touch/scrollbar/keyboard input pauses follow; explicit resume makes the current line visible by scrolling only the rail. Read/mobile never auto-scroll the document. Empty state explains the English-caption action, busy/error status and paste/upload fallback; no auto-fetch, synthetic translation or pretend saved state.

**Evidence on final local WIP:** TypeScript `tsc --noEmit --incremental false` PASS; changed-file ESLint PASS; 72 existing caption/parse/segment/action unit tests PASS. Deterministic guest watch E2E **55/55 PASS** over desktop 1854×950, short desktop 1440×640, tablet 1024×768, mobile 393×851 and narrow mobile 320×720. Stub now models actual DOM replacement/iframe dimensions. Regressions cover frame geometry, one scroller, seek/deep link, manual follow, native Space, typing, next-first and single player mount across mode changes. Browser inspected the real YouTube iframe: default viewport wrapper and iframe both 611.328×343.859px. Desktop/320px screenshots saved in calling chat outputs.

**Limits:** caption fixtures test UI/navigation only; browser fixture text explicitly says UI fixture and was cleared before handoff. Real upstream-caption E2E excluded because server telemetry may write DB; signed-in persistence, caption availability, VI alignment/contextual lookup and production remain unverified/unimplemented as applicable. No DB/provider changes, commit/push/merge/deploy. This finishes this layout/navigation increment, not the full mission 005 learning loop.

## Contextual watch lookup after live Trancy research — 07/10/2026

**Authority/outcome:** owner requested opening Trancy videos, learning their interaction and applying suitable internet/repo knowledge to the existing website. Same branch `docs/005-ejoy-trancy-system`, HEAD `938a69081ffd009a6ee2d67fcf5f29df0fc77061`, uncommitted WIP preserved. Live authenticated practice inspection covered video pause/seek, word definition, source examples and Settings; no Trancy settings/saves changed. Sources and decisions are in RESEARCH-NOTES/TECH-KNOWLEDGE/REDESIGN; no upstream code copied/dependency added.

**Implementation:** shared SentenceText separates word lookup from timestamp seek; existing DictionaryPanel reused via React context. Opening pauses, retains original sentence/title/time, shows labelled general gloss immediately and returns focus to the selected word on close without autoplay. Explicit replay returns to source. Two-endpoint phrase mode handles reverse order and same-sentence boundary; too-long selection rejected. Typographic contractions normalize while preserving source text. Untimed text has no fake replay. Contextual result precedes edit/AI form; focusing close rather than edit input keeps answer visible on mobile. A long-token regression found horizontal overflow; tokens/source now wrap without cutting original text. No save/VI-alignment or scheduler implementation claimed.

**Checks on local WIP:** final TypeScript `tsc --noEmit --incremental false` PASS; changed-file ESLint PASS; 102 tokenizer/gloss/dictionary/caption/action unit tests PASS. Isolated guest Home/Watch E2E **130/130 PASS** on five viewports before final long-token wrapping; after that change **5/5** new untimed/overlong-selection cases and **30/30** affected lookup/phrase/AI-mock/home-drawer/reflow/frame regressions PASS on all five viewports. Source-of-truth and diff whitespace PASS. Browser real iframe remained identical to wrapper (721.765625×405.984375px) before/after opening lookup. Desktop/mobile screenshots use explicitly labelled UI fixture captions, cleared before handoff; viewport override reset.

**Test-boundary incident:** initial 135-case attempt ran from repo cwd. Although the temporary config omitted dotenv/global setup, `e2e/helpers/auth.ts` independently loads `.env.local`. The signed-in Home test consequently ran and called `seedWatchedSource` for the existing E2E account at desktop, short-desktop and tablet: upserted YouTube source `dQw4w9WgXcQ`, title `Never Gonna Give You Up`, channel `E2E Channel`, duration 600000ms, resume 65000ms and refreshed updated_at. This was unintended configured-Neon-DB test state, not a schema migration or a claim of non-production isolation. Attempt interrupted (99 passed, 2 interrupted, 34 not run); not counted as successful validation. No deletion/rollback attempted because previous row values and environment classification are unverified. Corrected run starts from the calling workspace without `.env.local`, removes DB/Auth variables and explicitly excludes both signed-in viewer and real caption-fetch cases in its config. Subsequent checks used guest/UI fixtures and mocked AI. This corrects any inference that merely omitting global setup makes the earlier Home runs DB-free.

**Limits/handoff:** authenticated AI success, translation quality, aligned VI cache, source/card persistence/RLS, production and learner outcomes remain unverified or unfinished. No commit/push/merge/deploy. Plate THU-9 was read fresh, but the connector was removed from available tools before update; this checkpoint is not yet mirrored there. Continue the existing PLAN slice-2 alignment/understanding work, then the separately governed save/library/review slices.

## Free-first automatic subtitle translation research and foundation — 07/10/2026

**Authority:** owner prioritized automatic translation, free use and meaning quality, and requested live Trancy, GitHub translation repos and Google Translate research. Same existing AtoEnglish checkout/branch/HEAD; prior home/dictionary/player WIP preserved.

**Live research:** authenticated Trancy practice Settings showed Google selected under Free, SiliconFlow also Free, Advanced AI separate. Settings only inspected, no changes/saves. Tested six self-authored EN→VI cases in real Google Translate Advanced (menu says built with Gemini) and real Chrome Translator API inside the app. Google retained all six tested meanings in manual review; Chrome failed idiom, named program, father pronoun and funding metaphor. Interfaces differ and exact backend/downloaded model revisions are opaque: this is a small smoke comparison, not a global ranking or controlled same-model benchmark. Raw cases/reviews and screenshots are in the calling workspace outputs. Read pinned source/licenses for Hy-MT2 (Apache-2.0), VinAI Translate (AGPL-3.0), Argos (MIT) and Read Frog (GPL-3.0), plus MADLAD model card and official Google/Gemini/Chrome documentation; no upstream code incorporated. Hy-MT2 is a candidate, not installed/run/integrated.

**Implemented bounded increment:** existing watch supports bilingual/EN/VI/hidden modes; explicit quick native activation/download, progress/partial output, original source-ID/timing integrity, current-cue-first scheduling, cancellation and bounded account/provider/source/segmentation/prompt-version cache. Native output labelled machine translation with pre-activation quality limitations. Optional authenticated Gemini route uses bounded contextual batches, structured ID validation, source-origin checks and quota/timeout errors; server key plus explicit SUBTITLE_GEMINI_ENABLED required. Default remains false, including .env.example. No automatic cloud/paid fallback or implicit retries. Actual loaded segmentation version included in cache identity. Caption strip reserves 128px for bilingual text; explicit two-line-height cap handles inline lookup buttons defeating line-clamp on small screens.

**Verification:** TypeScript tsc --noEmit --incremental false and changed-file ESLint PASS after the final production change. Relevant unit run 97 PASS; after prompt-version/cached-gap refinement the affected five translation tests rerun PASS. Focused watch E2E run 32/35 PASS, identifying three real long-bilingual layout failures; after the cap fix, all 10 affected long-caption/frame cases PASS across five viewports. Other activation/cache/cancellation/partial-failure/unsupported/timing cases passed in that 35-case run. Initial attempted browser launch was blocked by the process sandbox, then rerun with approved execution permissions; not counted as app validation. Tests ran from the projectless cwd with DB/Auth vars removed and signed-in/real caption-fetch cases excluded, using mocked player/translator only. Source-of-truth and whitespace checks PASS. Real native translation quality evidence is separate from mocked UI tests. Real browser screenshot inspected; synthetic captions explicitly labelled and cleared by reload before handoff. Trancy, Google Translate and local watch tabs retained for comparison.

**Open gates:** six samples do not meet the documented 30-case semantic release gate. No real authenticated Gemini/API quality run, no broadly supported free provider chosen, no self-hosted model run, no authored-VI ingestion priority or persistent DB translation cache. Therefore this is a research-backed translation foundation, not completion of the core quality engine or mission 005. No DB/schema/billing changes, commit/push/merge/deploy. Plate connector unavailable; no mirrored checkpoint claimed.

## Actual free local model evaluation and watch adapter — 07/10/2026

Owner continued “Bây giờ nghiên cứu để phát triển đi”. Same branch `docs/005-ejoy-trancy-system`/HEAD `938a69081ffd009a6ee2d67fcf5f29df0fc77061`; uncommitted prior WIP preserved. Downloaded official pinned Tencent Hy-MT2-1.8B Q4_K_M and llama.cpp b11457 CPU archive, verified both SHA-256 against official metadata; no system runtime install. Baseline six-case model run caught a break-even/profit meaning error. Official contextual prompt shape plus general data/meaning/name constraints evaluated against 30 frozen authored cases through the actual new adapter: all completed, Codex reading detected no critical meaning error and three wording/name concerns. Not independent blinded review, not real-library release corpus. p50 4.3885s, empirical p95 11.041s, max 13.17s per cue on CPU two threads. Original Google/device outputs retained separately; no global ranking.

Integrated optional local model into existing `/api/translate`/`/watch`: source-bound single-cue outputs, adjacent context, provider-specific batch/character/timeout, private backend key, checked response model/profile, cache pinned to model/quantization/runtime/prompt, cancellation and no Gemini fallback. Auth cookie + user verification and rate limiter unchanged. Config sample disabled; no .env.local edits or default enablement. Temporary loopback evaluator stopped after use to return RAM; about 1.13GB model remains in calling workspace. No DB writes/schema/provider billing/production/auth configuration changes, commit/push/merge/deploy.

Local WIP verification: typecheck clean; changed-file lint clean. Focused unit 31 PASS (adapter/route/budget/hook), then three hook tests rerun PASS after correcting test-harness side effects without disabling lint. Guest translation E2E 25/25 PASS across five viewports, run from projectless cwd with DB/Auth env removed and integration cases excluded; player/translator mocks verify UI only. vinext/Cloudflare build PASS (existing route-classification warnings). Current real browser watch remains usable with the original embedded video and no synthetic subtitles. Source-of-truth/whitespace checks run after documentation update. Remaining: signed-in model/browser smoke, independent permitted-library semantic review, authored VI priority and DB cache. This is an experimental engine increment, not full core-quality or mission-005 completion. Plate connector unavailable, no mirror claimed.

## Subtitle spacing and reading presentation — 07/10/2026

**Owner outcome:** improve caption spacing/presentation for listening and reading, using the supplied screenshot. Existing watch route/WIP preserved. Removed per-token horizontal padding and silent two-line clipping; caption now has a 60ch measure, balanced wrapping, legible EN/VI sizes/leading/gap and natural height. Desktop grid fits video in the remaining space close to caption; mobile keeps the YouTube minimum viewport. Read/rail pairs have larger type, left alignment, comfortable leading and a bounded read measure. Source text/timestamps, lookup/replay, translation engine/config/cache unchanged.

**Evidence:** 40/40 guest E2E across five viewports (mocked player/translator), including full painted-line visibility under text-spacing overrides, no caption/control overlap, no horizontal/nested scroll, lookup/phrase/focus, player continuity and follow/manual-scroll checks. 9 tokenizer unit tests, changed-file lint and full TypeScript check PASS. Earlier typecheck failure came from incompatible Next validator + vinext-generated route declarations; regenerated via next typegen then checked cleanly, without suppressions. Actual browser desktop/mobile-width/read presentation inspected with authored layout sample, not real video captions or learner evidence. Source-of-truth/whitespace checks recorded at completion. Primary references/decisions in RESEARCH-NOTES and REDESIGN.

**Limits:** typography choices remain a learner-validation hypothesis; arbitrary huge transcripts, learner outcomes, model quality, signed-in persistence and production not certified. Fixture cleared, viewport reset before handoff. No DB/auth/provider configuration, commit/push/merge/deploy.

## Live smoke — Hy-MT2 local engine end-to-end (signed-in) — 2026-10-07

First authenticated live run of the local engine through the real app path:

- llama.cpp b11457 serving Hy-MT2-1.8B-Q4_K_M on `127.0.0.1:8321`, `--alias hymt2-1.8b-q4` (required — llama.cpp otherwise returns the .gguf filename in `model`, which the pinned-profile zod schema correctly rejects).
- `.env.local`: `SUBTITLE_LOCAL_ENABLED=true` + loopback URL/key (dev only, gitignored; production unchanged).
- Playwright live spec (`e2e/live-translate.smoke.spec.ts`, `LIVE_TRANSLATE_SMOKE=1`): login → paste 4-cue SRT → "Dùng Hy-MT2 · thử nghiệm" → real `/api/translate` → llama.cpp → validated → bilingual rail. PASS: cue 0 "Cha tôi đã dạy tôi mọi thứ mà tôi biết." in ~21s total; progressive "1/4 câu · đang dịch…" status verified.
- Two test-harness bugs fixed: revision-2 gate promise was never released (hook test hung), strict-mode/locator issues in the smoke spec.
- Earlier discovered constraint now proven live: model `model` field must echo the pinned identifier; deployment docs must note `--alias`.

**Full gate on the whole WIP increment: tsc ✓ · eslint 0/0 ✓ · 233 unit ✓ · 80/80 e2e ✓ · build ✓**

Remaining (still open): DB-backed translation cache, permitted-library semantic review of real captions, authored-VI ingestion, 7B-vs-1.8B quality comparison, deployed-backend story for Cloudflare (loopback is dev-only).

## Cross-platform translation — Workers AI engine + 3-way eval — 2026-10-07

Owner: "làm sao để sử dụng được trên đa nền tảng" → "làm đi". Chrome Translator API is Chrome-desktop-only; Firefox/Safari/iOS/Android need server-side translation. Hy-MT2 loopback cannot be reached from the Worker.

**Eval** (same 30 frozen authored cases as Hy-MT2, run via Cloudflare REST `/ai/run` on account `6b09…26b2`; production `TRANSLATION_SYSTEM_PROMPT`, one cue per call, context in `before`):

| Engine                                               | Meaning errors (my reading vs authored criteria)                                                                                                                                                          | Latency                          | Cost                                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `@cf/google/gemma-4-26b-a4b-it`, thinking off, t=0.2 | 1 weak: #6 "Thầy ấy là thầy của tôi" lost father context (Hy-MT2: "Ông ấy"). Others correct incl. break-even/profit, must-not vs don't-have-to, idioms, Tiny Desk name kept, injection translated as text | p50 ≈1.3 s; outliers 7.6 s, 37 s | ≈2.2–3.2 Neurons/cue (≈ 3,800 cues/day inside 10k free Neurons; $0.011/1k Neurons after) |
| `@cf/meta/m2m100-1.2b`                               | ≥8 critical: "dưới thời tiết", accordion→"cờ vua", break-even→"phá vỡ" (×2), must-not→"không nên", "piece of cake"/"call it a day"/"on her plate" literal                                                 | ≈0.7 s                           | cheapest                                                                                 |
| Hy-MT2-1.8B Q4 local (earlier run)                   | 0 critical, 3 wording concerns                                                                                                                                                                            | p50 4.4 s CPU                    | own host                                                                                 |

Decision recorded: **m2m100 rejected**. Gemma 4 implemented as opt-in engine. Not blind/independent review; authored corpus only.

Gotchas found: thinking mode on by default burns all `max_tokens` with empty `content` → `chat_template_kwargs.enable_thinking=false`; model wraps JSON in ```json fences → stripped before strict ID validation.

**Code:** `src/lib/video/workers-ai-translation.ts` (single-cue, shared prompt, fence strip, `WorkersAiOutputError`, abortable) + `workers-ai-binding.ts` (`cloudflare:workers` env.AI, isolated so Vitest/Node never resolve it); `serverTranslationConfig` order local → workers-ai → gemini, each behind its own flag (`SUBTITLE_WORKERS_AI_ENABLED`, default false); route pre-checks batch/char budget before auth, missing binding → 503 `ai_unavailable`, never falls through to Gemini; `cloudflare.config.ts` adds `AI: bindings.ai()` (verified in vinext `worker.config.json`). Same signed-in boundary + rate limit.

**Gate:** tsc ✓ · eslint 0/0 ✓ · 246 unit ✓ (+11) · 80/80 e2e (2 skipped live smoke) ✓ · next build ✓ · vinext/Cloudflare build ✓

**Not yet verified:** binding call inside the deployed Worker (REST shape verified; Node dev has no binding; previews lack auth secrets so signed-in translate cannot be smoked there). Still open: DB cache `transcript_translations`, guest read of cached translations, enabling the flag in production, deploy.

## Learner-first subtitle translation — research of 39 repos + implementation — 2026-10-07

Owner: "web này là học tiếng Anh" + "phải nghiên cứu tất cả thư viện repo về nó và phát triển hoàn chỉnh tính năng này". Re-extracted `research/ejoy-archive-2026-10-06` (192 MB packets); 28/39 repos have translation-related files; read real code of read-frog, LLPlayer, easysubs, zeeguu api/web, echo-type, lexweave (+ file inventory of bespoke, mLearn, LWT, openlingo). Synthesis table in RESEARCH-NOTES "Dịch phụ đề hướng học". GPL repos → ideas only; no code copied.

**Shipped (design from research):**

1. **Human Vietnamese first** (eJOY/Language Reactor; Slice-2 contract order): `fetchYoutubeCaptions` also fetches the uploader's _manual_ `vi` track (never ASR `vi`, never `tlang`), best-effort (failure/budget never breaks EN). `alignHumanTranslation` attaches it per sentence by cue midpoint/overlap, stored as `Sentence.vi` in the existing jsonb (no migration).
   - **Live check caught a real defect**: on TED `iG9CE55wbtY` the VI track is a differently timed cut — time alignment paired "I've been blown away…" with a later line. Added a structural gate: accept only if ≥80 % of VI cue starts sit within 300 ms of an EN cue start. Live over all 18 catalog videos: 2 accepted (0.99, 0.94 — pairs read correct), 6 rejected (0.12–0.61), 10 have no VI track. Rejected tracks fall back to labelled machine translation.
2. **Learner default `reveal` mode** ("Anh · Việt khi chạm"): English first, Vietnamese blurred per line until tapped (rail + caption strip), `V` reveals the current line; bilingual/en/vi/hidden still available. Mixed sources tag machine lines "· dịch máy"; status shows "Phụ đề tiếng Việt của kênh · n/m câu"; activation buttons hidden when every line is human.
3. **Playhead window** (LLPlayer 1 back / 12 ahead): no whole-video background translation; loop idles until the learner moves, resumes on seek; cancels on unmount.
4. **Context**: video title + preceding lines' existing Vietnamese (human or machine) for pronoun/term consistency; budget order source → nearest context → known VI → title (dropped, never truncated). `TRANSLATION_VERSION` → `en-vi-context-v4` (invalidates old caches by design).

**Gate:** tsc (src) ✓ · eslint ✓ · 257 unit ✓ (+11) · 82/82 e2e ✓ (+2: reveal default; bilingual tests now select their mode) · next build ✓ · vinext/Cloudflare build ✓ · live YouTube alignment check ✓ (above).

**Not done / open:** per-line 👍/👎 rating (Trancy) → `pilot_events`; word lookup → saved item (Zeeguu bookmark model) is Slice 3; DB translation cache; Workers AI flag + deploy; Hy-MT2 local prompt still ignores title/known VI (pinned p1 profile).

## Extension caption import (Trancy/easysubs mechanism) — 2026-10-08

Owner: "Vậy làm theo họ đi" → "làm extension đi". Investigated all fallback paths first: public Invidious API is effectively dead (1 instance up, its upstream blocked); `youtubei/v1/get_transcript` returns 400 "Precondition check failed" without full session; yt-dlp on the throttled IP gets the same 429. The only mechanism that reliably works is fetching inside the learner's own YouTube session — what every caption extension does.

**Shipped:**

1. `extension/` — MV3, no build step. `content-youtube-main.js` (`world: MAIN`) reads `getPlayerResponse()` + fetches each needed track's json3 same-origin (EN manual/ASR + uploader-authored VI only); `content-youtube-relay.js` writes the payload to `chrome.storage.local` and closes the import tab; `content-app.js` marks `documentElement.dataset.atoenglishExt` and relays `storage.onChanged` → `window.postMessage` into the page. `window.opener` is unusable — YouTube's COOP severs it — hence the storage relay.
2. `src/lib/video/extension-bridge.ts` — `validateCaptionsPayload` (untrusted postMessage shape check) + `payloadToTranscript` (same pick-EN → segment → align-VI pipeline as the server fetch). `importYoutubeCaptions` server action re-validates + persists for signed-in users; guests get the identical client-side path.
3. Watch page: "Lấy qua extension" opens `youtube.com/watch?v=…#atoenglish-import`; listener accepts the payload from youtube.com or same-origin relay; 45 s timeout with an honest error. `blocked` now also maps HTTP 429 (was 403-only) so throttling surfaces as "YouTube đang chặn…" instead of a generic error.

**Verified:** loaded unpacked in Chromium persistent context — flag set, button rendered, click opened the import tab, storage relay delivered, transcript rendered, tab auto-closed. Real timedtext fetch unverifiable right now (this IP is throttled — which is the problem the extension bypasses on a normal residential session); in-page fetch plumbing verified end-to-end with a routed fixture.

**Gate:** tsc ✓ · eslint ✓ · 274 unit ✓ (+8 bridge) · prettier ✓ · live browser extension loop ✓ (fixture-routed timedtext).

**Not done:** real-session timedtext re-check once this IP cools down; Chrome Web Store packaging; Firefox `world:"MAIN"` fallback.

## Automatic watch/translation/vocabulary — 2026-10-07 (owner's latest refinement)

Base observed `b4983877`, branch `docs/005-ejoy-trancy-system`. Concurrent shared-transcript migration/seed/actions/page/types WIP preserved; not run or released by this increment.

- Existing WatchClient now fetches once on opening a video with no initial transcript, defaults to visible bilingual captions, automatically prepares supported device translation, and starts already-configured free server translation only for authenticated scopes. A standard page/play gesture activates a first browser-model download; explicit setup/error retries remain. Late intake/save/import results cannot overwrite a newer chosen transcript. No auto-play, dictionary AI fan-out, automatic vocabulary save or scheduler changes.
- Active cue shows up to three curated dictionary terms/phrases directly, with labelled general meanings, longest known phrase and honest misses. Same desktop rail scroller; mobile document scrolling. Existing dictionary drawer/replay/phrase selection and extension compatibility retained.
- Translation cache now includes title and original Vietnamese anchors; old title results hidden during fingerprint/response replacement. Pending browser preparation cannot override an explicit server choice. Model/provider failure never automatically calls Gemini.
- Additional actual pinned Hy-MT2 budget experiment: 18 outputs on 9 frozen windows, candidate retained 3 critical semantic errors (baseline 5). Raw/review in projectless `outputs/translation-evaluation.json`; Codex reading, not independent blind review. No claim of best-model quality or release readiness.

Validation: 70 related unit tests passed; typecheck and targeted ESLint clean before the final test-only layout measurement update, followed by a final repeat. Initial 55 browser cases had 54 passes and one 320px measurement failure; root was document movement between separate rectangle reads, fixed by measuring the whole caption/controls in one snapshot. The 320px case passed, then 15 targeted regression cases passed across 1854×950, 1440×640, 1024×768, 393×851 and 320×720 (opening, cache, long captions). Browser fixtures prove flow/layout, not actual YouTube caption availability or model quality. Browser tests ran a separate port-3100 instance of this existing Next app with all .env credentials disabled and a loopback empty backend; caption actions, player and translations mocked. Source-of-truth check and diff whitespace check passed. No production DB writes, provider flag/billing/auth changes, commit, merge or deploy. Screenshots in projectless `outputs/automatic-player-{width}.png`, clearly headed synthetic test captions.

Remaining: actual production/session caption availability, supported-device download in each browser, authenticated configured-server runtime, independent real-library translation quality, vocabulary contextual sense selection and later persistence/learning gates. Native browser translation can fail idioms; general dictionary meanings can differ from the sense in a cue. Current unsupported browsers need available original Vietnamese or a configured authenticated server; source/paste/import remain usable.

## Caption acquisition root-cause research — 07/10/2026

Owner asked why Trancy obtains captions. Fresh official Chrome CRX v7.9.4 and Learning Center public JS inspected without installing/executing them; source hashes/function offsets stored in projectless `work/product-research/trancy-caption-assets/`. Authenticated Trancy UI shows 395 EN/VI lines for `oyRxhiAC9u8`, not proof of a fresh cache miss. Existing AtoEnglish fetch library probed once for the same public video with no actions/auth/DB: iOS/Android metadata both HTTP 200/playability OK/one track; caption body HTTP 429 four times; six-request budget exhausted, overall blocked. Corrected TRANCY-DEEP-DIVE §2/§5.4 and added §9: native-XHR capture and player track driving, optional current-session direct fetch/token reuse, raw-cache bridge to Learning Center, API/cached captions, distinct premium audio transcription. Earlier “extension avoids 429” wording is not a verified guarantee; ours currently lacks the native-response-first mechanism. Private backend cold-miss behavior remains unknown. Automatic-player/shared-cache WIP untouched; no DB writes, user/account changes, production code, commit or deploy. Existing repo typecheck rechecked; evidence distinguishes static code, UI and local upstream refusal.

## Native caption intake repair — 07/10/2026

Owner continuation: “Vậy giờ xử lý ntn ?” → “tiếp tục”. Existing web `/watch`
and caption companion repaired, preserving automatic translation/vocabulary
and shared-cache WIP. Companion 0.2.0 attaches MAIN and isolated relay at
document_start, captures native XHR/fetch json3 in the embedded player,
drives the chosen native track and attempts one same-session direct fallback
when not refused. Exact origin/frame/video and request-version guards;
StrictMode sends once; loaded/pasted content wins late races; optional VI
refusal preserves EN. Bounded passive/active observation cleanup preserves
later user choices and new-video settings. Tab closes after storage succeeds.
Server stops on 403/429 instead of repeating/changing client. Browser shape
validation cannot attest provenance: imported/pasted text is private, not a
public-cache seed. No audio/video download, token fabrication or copied
Trancy source/assets. PROJECT_STATE/TASK_CONTRACT reconcile the earlier
extension-closed wording with the later owner-authorized caption exception.

Validation: 142 relevant unit tests passed, final 11 collector cases repeated;
clean final typecheck and targeted ESLint. 3 installed-extension browser
fixtures passed (auto EN/VI, native refusal, explicit storage/tab handoff);
15 existing browser checks passed across five viewport sizes (automatic
understanding, long captions, device/cache/timing). Fixed a test-only iframe
navigation race rather than adding sleeps/retries. Isolated port-3100 Next
runtime, credentials blanked, loopback empty backend and routed synthetic
YouTube/actions/providers; no production writes. Source-of-truth/diff checks
clean. One real local public probe still returned 429/blocked, now stopping
after 2 requests (previously 6); before/after sanitized artifacts preserved.
See TRANCY-DEEP-DIVE §9.1 and extension/README for concrete flow and limits.

Not released: real-session native acquisition, deployed shared-cache state,
Firefox/distribution and production runtime remain unverified. No DB
migration/seed, provider/auth/billing change, commit, merge or deploy.

## Production deployment — 07/10/2026

Owner explicitly requested “deploy đi”. Deployed the existing working tree
on branch `docs/005-ejoy-trancy-system`, GitHub base
`b498387789033c473f0a9b1e2ce53b8a2eb75394`; this is not a deployment of
that committed SHA alone. Release source SHA-256
`59e0233355e183f51176a08fe1b8fddb6f4c2ee36efb959b57b177be0de2ce65`
(152 runtime/config/public/extension and source-test files) remained
unchanged between validation and release. Used the existing
`npm run deploy:vinext` build/manifest patch/Cloudflare CLI workflow.

Before release, read-only Neon production checks confirmed
`shared_transcripts`, RLS with public SELECT only and the write RPC executable
by service_role only. Migration `20261013000000_shared_transcripts.sql`
was already recorded at `2026-10-07T08:07:36.838Z`; shared cache held zero
videos before release. No migration, seed, secret/auth/provider-flag change,
commit, push or merge was performed in this release.

Validation: full ESLint, 309 unit tests across 30 files, standalone typecheck,
Next production build, vinext production build and diff checks passed.
Previous synthetic native-extension/browser regression evidence remains
fixture evidence, not a claim of native live-session availability.

Cloudflare deployed version `17b13453-7d40-40e6-b070-a617fe170add`
with 100% traffic, deployment `00eeb501-6398-41a3-b612-ca0d78c5818a`
at `2026-10-07T09:31:09.472936Z`. Previous version for recovery:
`2c209009-b5b3-4bbd-999e-e4fd87550520`. Public `/api/health` returned
200, database connected and matching version `17b1345`; `/discover` and
`/watch/8jPQjjsBbIc` returned 200. Public WatchClient JS and layout CSS
SHA-256 matched the local build; SSR referenced the new WatchClient asset
with the native caption request guard.

Actual production browser: discover and YouTube player rendered; opening
a video automatically started caption intake, then surfaced YouTube's
server refusal. No console warnings/errors observed. This browser had no
companion installed. Worker deployment does not update the local unpacked
extension: reload companion 0.2.0 and the app to test native capture in the
learner's own session. Native real-session captions and translation quality
remain unverified; do not claim the cache is populated or that all videos
now have captions. The manifest, file hashes and public checks are stored
in projectless `work/product-research/atoenglish-deploy-2026-10-07.json`.

## Account auth flow — 07/10/2026

Owner request “Xử lý đăng ký và đăng nhập tài khoản đi”. Verified on
production before changing anything: email signup already returned a live
session but left learners on `/login`; the legacy `signOut` server action
existed but no UI called it — and once wired it proved broken by design
(server-side `getAuth().signOut()` invalidates upstream but the compat
surface discards Set-Cookie, so the browser session cookie survived).

Changes: signup redirects immediately when `data.session` is present;
new `/me` surface shows the signed-in email and signs out through the
browser `/api/auth` proxy (the only path that clears the session cookie);
“Tôi” nav item enabled on icon-rail and bottom-nav; the watch-page
“Đăng nhập để lưu” link carries `?next=/watch/<id>`; `resolveAuthNext`
and `localizeAuthError` extracted to `src/app/login/auth-helpers.ts` and
shared with `/auth/callback` (open redirects fall back to `/discover`;
`INVALID_CREDENTIALS` underscore form now maps correctly). The dead
`src/app/actions/auth.ts` was removed.

Validation: 325/325 unit tests, ESLint, standalone typecheck, Next build,
vinext build, Playwright auth spec 10/10 (desktop + mobile). Production
verification on `1d5c2533-f69d-4a8e-b582-884809ab5175`: signup →
`/discover`, `/me` shows email, `POST /api/auth/sign-out` 200 with the
session cookie cleared (`/me` then bounces to `/login?next=/me`), re-login
honors `next`. An earlier `7fd432a6` deploy shipped the server-action
sign-out which failed live and was replaced before this deploy.
