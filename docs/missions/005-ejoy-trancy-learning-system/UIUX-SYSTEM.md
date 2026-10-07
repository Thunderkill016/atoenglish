# AtoEnglish UI/UX System — audit, research synthesis, design rules, P0 plan

Date: 2026-10-07. Scope: the live product as deployed (`1d5c2533`) and local
working tree. Method: real browser sessions (Playwright, 1440px + 390px),
full code read of every screen, prior mission research (Trancy/eJOY/LR,
39-repo scan, Vertex).

This document follows the owner's redesign brief: research first, design
second, implement P0, verify in the browser. It deliberately does **not**
cover speaking/pronunciation, XP, streaks, or curriculum/course surfaces —
those are closed/non-core per `docs/project/PROJECT_STATE.md`.

---

## 1. Current-product audit (Phase 1 + 6)

### 1.1 The actual product surface

AtoEnglish today has exactly five real surfaces — the brief's curriculum /
lesson / exercise taxonomy does not exist here and should not be invented:

| Route         | Surface             | Role in the learning loop                             |
| ------------- | ------------------- | ----------------------------------------------------- |
| `/`           | Landing             | marketing + working YouTube-link input                |
| `/login`      | Auth                | email signup/login + Google OAuth (mode toggle)       |
| `/discover`   | Home                | catalog feed + search + filters + right rail          |
| `/watch/[id]` | **Learning screen** | player + caption strip + transcript rail + dictionary |
| `/me`         | Account             | email display + sign-out                              |

Supporting states: transcript fetching / error-with-paste-fallback on watch,
empty transcript, dictionary slide-over, read mode, reveal mode, transcript
search, mobile bottom nav.

### 1.2 What is already good (KEEP)

- **The learning screen is genuinely learning-shaped**: video left,
  sentence-level transcript right, active line follows playback, click-to-seek,
  per-word lookup, loop/auto-pause per sentence, keyboard map (`?`),
  read mode with 68ch measure. This matches the strongest pattern in the
  category (Language Reactor/Trancy) — sentence-anchored watching.
- **Honest empty states**: widgets show "—" / "chưa có dữ liệu" instead of
  fabricated progress. Keep the honesty, reduce the footprint (below).
- **Discover feed anatomy**: chromeless video cards with duration, level dot,
  caption badge, resume bar + "Xem tiếp" deep link. Clean, YouTube-familiar.
- **Caption/translate provenance labels** ("Phụ đề tiếng Việt của kênh" vs
  "Dịch máy/Dịch AI") — epistemically honest, keep.
- **Auto acquisition** (server fetch → iframe extension → fallback) with real
  error copy — good invisible plumbing.
- Touch targets ≥44px on rail controls; `aria-pressed`, `role=status`,
  `aria-current` present; `prefers-reduced-motion` honored.

### 1.3 Concrete defects (screenshots in `/tmp/audit-shots`, kept out of repo)

**P0-severity**

1. **Two parallel visual systems.** The token layer (`globals.css`
   `--background/--card/--primary/…`) is honored by landing/discover/login/me,
   but the entire watch surface hardcodes a second palette: `#0c0c0e`,
   `#111114`, `#232327`, `#19191c`, `#f5b50a`, `#9d9da6`, `#e8e8ea`,
   `#c5c5ce`, `white/5`, `white/10` (≈40 occurrences across
   `watch-client.tsx`, `transcript-rail.tsx`, `empty-transcript.tsx`,
   `dictionary-panel.tsx`). The gold `#f5b50a` _is_ `--primary` re-litigated
   by hand. One design system means these must collapse into tokens.
   Classification: **REBUILD (mechanically — swap values, keep layout).**

2. **`/404` contrast failure.** `not-found.tsx` sets `bg-foreground` — the
   _text_ color token — which is light in dark theme, so `text-white` copy
   sits on a light surface (see `desktop-watch-invalid.png`: heading nearly
   invisible). Root cause is naming: `background/foreground` invite exactly
   this mistake. Fix = real semantic tokens + correct usage.
   Classification: **REBUILD + token rename.**

3. **Discover right rail is a widget collection.** Seven stacked widgets
   (Lịch tuần, Flashcard, Thống kê, Tiến trình xem, Activity, Progress,
   Học với video). For guests — the majority — Flashcard, Activity and
   Progress render only "—"/"chưa có dữ liệu". The rail answers nothing about
   "what should I learn now"; it advertises unconnected plumbing.
   Classification: **REMOVE for guests (unconnected widgets), REFINE
   for signed-in.**

4. **Mobile nav reserves 5 slots for 2 real destinations.** Đọc/Ôn/Thư viện
   are permanently disabled with "Sắp ra mắt" sublabels — the tallest,
   noisiest nav items on the smallest screen.
   Classification: **REMOVE disabled items from BottomNav** (keep the
   icon-rail placeholders on desktop where space is cheap — consistent
   behavior, different density).

**P1**

5. **Button/radius vocabulary is ad-hoc.** `controlBtn` string, pill buttons,
   rounded-xl vs rounded-2xl vs rounded-full vs rounded-lg all coexist;
   `Button` component exists but watch/rail bypass it.
6. **Duplicate chrome on the player.** YouTube's in-iframe controls plus our
   custom control bar — acceptable (seek-row is ours), but the caption strip
   - control bar + transcript header stack three chrome rows on mobile.
7. **Landing `/` uses `text-primary` accent for "bạn tự chọn"** — fine — but
   mixes `rounded-xl` cards with `bg-primary/10` CTA panel; acceptable for a
   marketing surface.
8. **`me-redirect` on mobile**: bottom nav still visible under the login wall —
   harmless but sloppy (login is outside `(main)`, so this was actually the
   /login page + icon-rail "N" dev artifact — verify before change; dev
   overlay only).

### 1.4 UX consistency table (same action → same pattern)

| Action                                | Current pattern                       | Verdict                                  |
| ------------------------------------- | ------------------------------------- | ---------------------------------------- |
| Back to discover                      | Header ← circle (watch); logo (shell) | OK                                       |
| Play/pause                            | Gold filled circle                    | OK, consistent                           |
| Toggle modes (loop/auto-pause/follow) | `aria-pressed` + gold tint            | OK                                       |
| Destructive/danger                    | none in product                       | n/a                                      |
| Feedback                              | `role=status`/`role=alert` inline     | OK — keep inline, no toasts for learning |
| Lookup a word                         | token `<button>` → slide-over         | OK                                       |
| Save                                  | "Đăng nhập để lưu" link               | OK                                       |

---

## 2. Benchmark synthesis (Phase 2–5)

Grounded in the mission's existing Trancy deep-dive + 39-repo scan + Vertex
read, plus well-documented category knowledge. Honesty note: this section is
synthesis of documented product behavior, not fresh paywalled screenshots.

| Product                       | What it does best                                                                              | Steal for AtoEnglish                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Trancy / Language Reactor** | Video+transcript dual pane; per-sentence loop; click-to-seek; subtitle modes incl. blur-reveal | Already our shape — keep; add their _rail density discipline_ (timestamp chip is small, quiet) |
| **LingQ**                     | Known/learning/new word states inline in text                                                  | Our `--state-*` tokens exist — extend to underline/heat only on demand                         |
| **Duolingo**                  | One primary action per screen; session = one bounded loop                                      | Home should say "continue this" not show 7 widgets                                             |
| **Anki**                      | Review is a queue with a number due; progress = retention                                      | When review lands, "N thẻ cần ôn" is the only honest headline                                  |
| **Khan Academy**              | Calm page, generous whitespace, skill-first nav                                                | Right rail should be _quiet_ or gone for guests                                                |
| **Brilliant**                 | Learning screen = single column, no nav chrome mid-lesson                                      | Watch already approximates this; protect it                                                    |
| **BBC Learning English**      | Serif-ish readable transcript, level labels                                                    | Confirm level chips; typography for learning text ≥16px                                        |
| **Memrise/ELSA**              | —                                                                                              | Speaking/pronunciation out of scope                                                            |
| **YouTube**                   | Chromeless card, duration badge, resume bar                                                    | Already matched                                                                                |
| **Vertex (video research)**   | Chapters-first timestamp search                                                                | transcript search exists; `?t=` deep links exist                                               |

**Where products diverge, the rule for AtoEnglish**: navigation and stats
must never compete with the sentence being studied. Progress indicators must
measure _acquisition_ (words known, review retention), not activity (opens,
clicks).

### Evidence → rule extraction (Phase 4)

| Learning principle        | Interface rule                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Extraneous cognitive load | During watch/read, hide global nav, widgets, promos; one accent color                                            |
| Signaling                 | Active sentence = the only strong color on the page                                                              |
| Segmenting                | Transcript segmented per sentence; controls operate per sentence                                                 |
| Modality                  | Listening (audio+caption) and reading (read mode) are different modes — already right                            |
| Progressive disclosure    | Search/phrase-select hidden until invoked; advanced keys behind `?`                                              |
| Retrieval practice        | Reveal mode = blur until touch; never auto-show answer                                                           |
| Immediate feedback        | Feedback adjacent to the word/sentence (lookup popover, inline status) — no detached toasts in the learning loop |
| Desirable difficulty      | "Theo câu phát" can be paused; auto-pause per sentence                                                           |
| Recognition vs recall     | Word lookup (recognition) is free; review (recall) is the future surface that must _not_ pre-show answers        |
| Long-session comfort      | Dark learning surface, ≤68ch measure, ≥1.6 line-height, minimal animation                                        |

---

## 3. Design philosophy (Phase 7)

1. **Câu đang học là trung tâm thị giác.** Whatever the learner is doing —
   watching, reading, reviewing — exactly one element is allowed the strongest
   color: the active sentence or the learner's answer.
2. **Một hành động chính mỗi trạng thái.** Every screen state answers "bấm
   gì tiếp?" without reading: play a video, continue watching, paste a link.
3. **Không hiển thị dữ liệu không tồn tại.** A widget that can only render
   "—" is removed for that user state, not shown empty.
4. **Feedback nằm cạnh hành động.** Lookup opens where the word was;
   errors live in the panel that caused them; learning feedback never uses
   global toasts.
5. **Tiến độ = năng lực, không phải hoạt động.** Show words learned and
   review due; never turn "video đã mở" into a fake achievement.
6. **Tối giản chrome trong buổi học.** The watch/read surfaces get one
   accent (gold), one surface elevation, and no unrelated navigation.
7. **Một hệ token duy nhất.** Semantic names describe _roles_ (canvas,
   surface, ink, accent, state), never raw hues; no hex in components.

---

## 4. Information architecture (Phase 8)

```
/            marketing + working link input            (outside shell)
/login       auth                                       (outside shell)
/discover    HOME — "học gì bây giờ?"                   (shell)
/watch/[id]  LEARNING SCREEN                            (intentionally shell-free)
/me          account                                    (shell, authed)
/read /review /library   reserved — hidden from nav until built
```

Justification: two primary destinations only (Học = discover feed; Tôi =
account). Everything else hangs off the learning screen (the product is the
watch surface). This matches the single-direction gate — no invented
curriculum IA.

## 5. Design tokens (Phase 12) — implemented in P0

New semantic layer in `globals.css` (dark-first product; light values kept
for the toggle):

```
--bg-canvas      page backdrop          (was --background)
--bg-surface     panels, cards           (was --card)
--bg-elevated    overlays, inputs        (new)
--ink-1/2/3      text primary/secondary/muted (was foreground/muted-foreground)
--accent         the ONE action color (gold)  (= --primary)
--line           hairline borders        (was --border)
--focus          focus ring              (was --ring)
--state-new/-learning/-known/-due   unchanged learning roles
--mark / --review                    unchanged
```

Implementation choice: keep the existing shadcn variable names **and** add
the semantic aliases pointing at them (`--bg-canvas: var(--background)`), so
`bg-card`, `text-muted-foreground` etc. keep working while watch surfaces
migrate to `watch-*`/semantic utilities. Renaming every consumer is churn;
the semantic layer is the contract going forward, and `not-found` proves the
old names are a trap worth fencing.

Typography scale (unchanged values, now named in the system):

| Role              | Spec                                   |
| ----------------- | -------------------------------------- |
| Learning EN text  | 16px / 1.65 (rail), 18px read mode     |
| Learning VI gloss | 15px / 1.65 muted                      |
| Caption strip     | 16–18px medium, accent color, 60ch max |
| Page title        | 18–24px bold                           |
| Meta/labels       | 12px muted                             |
| Timestamps        | 12px tabular-nums                      |

Spacing: existing 4px grid (Tailwind default) — keep; radius: `xl` (cards),
`lg` (controls), `full` (chips) — ban `2xl` on small surfaces; elevation:
border-only, no shadow stack (current code already does this).

Motion: state transitions only; transcript scroll is instant-or-nearest;
reduced-motion honored globally.

## 6. Component architecture (Phase 13)

Current components are already near-right. The gap is **variant
discipline**, not count:

- `Button` (primary/secondary/icon) — extend to cover `controlBtn` round
  transport buttons and gold-tint toggles so watch stops hand-rolling.
- `WidgetCard`/`RightRail` — keep; add "renders only with data" contract.
- `SentenceText`, `TranscriptRail` — keep; colors → tokens.
- `EmptyTranscript` — keep; colors → tokens.
- `DictionaryPanel` — keep; colors → tokens.
- `BottomNav` — render only available items.
- `ThemeToggle` — keep.
- New (small): `SectionTitle`, `MetaText` only if reused — do not
  pre-create.

## 7. Responsive rules (Phase 14)

- Watch ≥lg: video+rail side-by-side, document locked (`lg:h-dvh
overflow-hidden`). <lg: stacked, document scrolls — already correct.
- Discover ≥xl: rail 300px right; below: rail stacks under feed (widgets
  trimmed as §1.3.3 makes mobile stack short).
- Bottom nav: only functional destinations.
- Login/me/landing: single-column, max-w-sm/5xl — already right.

## 8. Accessibility (Phase 15)

- Fix `not-found` contrast (done in P0).
- Active-sentence gold on dark: `#f5b50a` on `#0c0c0e` ≈ 10.5:1 — AA.
- Muted `#9d9da6` on `#111114` ≈ 6.9:1 — AA for 12px labels is borderline;
  `--ink-3` should floor at the AA-large ratio for ≥11px only; body meta
  should use `--ink-2`.
- Focus rings: `outline-ring` everywhere — watch hardcodes `outline-[#f5b50a]`
  → becomes `outline-ring` (same gold, tokenized).
- Don't rely on color alone: level dot has label text; reveal blur is a
  control with aria-label — already compliant.

## 9. Dark mode (Phase 16)

Product is dark-first (defaultTheme="dark") — justified: long video sessions.
Light theme stays a theme toggle, driven by the same tokens; watch stays dark
in both (media surface, like YouTube theater) — achieved by scoping the watch
root to `.dark` tokens regardless of app theme.

## 10. P0 implementation (Phase 20) — DONE in this change

1. `globals.css`: added `--elevated`/`--color-elevated` to the existing
   shadcn-style semantic set (`bg-elevated` utility); the `.dark
.discover-home` per-page override was removed — one token set now covers
   every surface.
2. `not-found.tsx`: token colors — contrast fixed.
3. Watch surfaces (`watch-client`, `transcript-rail`, `empty-transcript`):
   every hardcoded hex/`white/*` value replaced by semantic tokens
   (`background`/`card`/`elevated`, `border`, `foreground`/`muted-foreground`,
   `primary`/`ring`). The watch root carries the `dark` class so the learning
   surface stays dark under either app theme. `dictionary-panel` was already
   tokenized.
4. `discover/page.tsx`: right rail keeps only widgets backed by real data —
   Thống kê (catalog numbers), Tiến trình xem (real for signed-in, login CTA
   for guests), Học với video. Lịch tuần/Flashcard/Activity/Progress rendered
   "—" for every user and were removed with their dead helpers
   (`week-strip`, `activity-grid`, `ProgressChart`). Widgets return when a
   data source lands.
5. `nav-items.ts`/`bottom-nav.tsx`/`icon-rail.tsx`: only reachable routes
   render (Khám phá, Tôi); the `available` flag and "Sắp ra mắt" branches
   are gone; mobile bar is equal-width flex, not a fixed grid.

## 11. P1 / P2 backlog (not in this diff)

- ~~P1: unify button variants~~ — done: `control` variant + `icon-xl` size
  added to `buttonVariants`; watch transport cluster and empty-transcript
  CTAs now derive from it (`aria-pressed` handles the active gold state,
  no manual conditional classes). Remaining P1: landing + login onto
  semantic utilities.
- ~~P1: caption strip / transport on mobile~~ — done: in read mode below
  `sm`, the transport cluster collapses behind a "Điều khiển" disclosure;
  video + caption anchor stay visible.
- P2: when review ships, home gets a real "N từ cần ôn" card fed by FSRS —
  the only progress stat worth a hero position. (Gated: no saved-word data
  source is wired today — dictionary is lookup-only.)
- ~~P2: `?t=` deep links (Vertex pattern)~~ — done: every deliberate seek
  (sentence click, prev/next, dictionary replay) writes `?t=` to the URL
  via `replaceState`; opening `/watch/id?t=ms` lands on that sentence.

## 12. Before/after rationale

- 404: unreadable → readable (contrast).
- Watch: 8 hardcoded colors → tokens; the file can now be rethemed in one
  place and can no longer diverge from the system.
- Discover guest rail: 7 widgets (4 dead for every viewer) → 3 that carry
  real information: catalog stats, resume state/login CTA, how-to tips.
- Mobile nav: 5 slots/3 dead → 2 real destinations.
