# Current UI Inventory — AtoEnglish

Baseline audit evidence. Captured 2026-10-05 against local dev build
(Next.js 16.2.9, vinext/Cloudflare Workers target), Chromium headless.
Authenticated captures use the E2E test user (fresh account, starting unit B1
→ all units unlocked, ~0 lesson progress = "new returning" state).

Artifacts: `artifacts/ui-audit/current/{desktop,mobile,states}/`
Machine index: `artifacts/ui-audit/current/CAPTURE_INDEX.json`
Capture scripts: `scripts/ui-audit/capture.ts`, `capture-states.ts`,
`capture-dark.ts`, `capture-loading.ts`, `recapture-landing.ts`

Viewports: desktop 1440×900, mobile 390×844 (full-page).

## Legend

- Auth: **Anon** = public, **Auth** = session required (redirects to /login)
- Coverage: D = default captured, E = empty captured, L = loading captured,
  Err = error captured, S = success/done captured, M = modal/menu captured,
  T = dark theme captured. `-` = state not exercised yet.

## Inventory

| ID  | Route / Surface            | Purpose                                                         | Auth? | Desktop | Mobile | State Coverage                                     |
| --- | -------------------------- | --------------------------------------------------------------- | ----- | ------- | ------ | -------------------------------------------------- |
| 01  | `/`                        | Marketing landing (hero, method, science, FAQ, CTA)             | Anon  | 001     | 001    | D                                                  |
| 02  | `/login?mode=login`        | Sign-in form (Google + email)                                   | Anon  | 002     | 002    | D, Err (states/login-error)                        |
| 03  | `/login?mode=signup`       | Sign-up form                                                    | Anon  | 003     | 003    | D                                                  |
| 04  | `/zero-path`               | Anonymous trial speaking journey (28-day concept)               | Anon  | 004     | 004    | D                                                  |
| 05  | `/privacy`                 | Privacy policy                                                  | Anon  | 005     | 005    | D                                                  |
| 06  | `/terms`                   | Terms of service                                                | Anon  | 006     | 006    | D                                                  |
| 07  | `/learn/unit-a0-1` (anon)  | Trial lesson start screen for guests                            | Anon  | 007     | 007    | D                                                  |
| 08  | `/learn`                   | Dashboard: today's plan, word-of-day, continue, unit list A0–B2 | Auth  | 008     | 008    | D, L (states/learn-loading), T (states/learn-dark) |
| 09  | `/learn/[unit]` (auth)     | Unit start screen: mission card, objective, CTA                 | Auth  | 009     | 009    | D                                                  |
| 10  | `/learn/[unit]/checkpoint` | Unit checkpoint gate                                            | Auth  | 010     | 010    | D                                                  |
| 11  | `/checkpoint/trial`        | Trial checkpoint surface                                        | Auth  | 011     | 011    | D                                                  |
| 12  | `/placement`               | Placement test flow                                             | Auth  | 012     | 012    | D                                                  |
| 13  | `/quiz`                    | Vocabulary quiz list (45 rows, one per unit)                    | Auth  | 013     | 013    | D                                                  |
| 14  | `/read`                    | Reading practice: level-chipped texts + paste-your-own          | Auth  | 014     | 014    | D                                                  |
| 15  | `/review`                  | SRS review hub: due queue, done state, other actions            | Auth  | 015     | 015    | D, E/S (nothing due)                               |
| 16  | `/review/cards`            | Flashcard review session                                        | Auth  | 016     | 016    | D (empty queue)                                    |
| 17  | `/review/hard`             | "Hardest words" leech review                                    | Auth  | 017     | 017    | D (empty)                                          |
| 18  | `/roadmap`                 | CEFR roadmap / level path                                       | Auth  | 018     | 018    | D                                                  |
| 19  | `/me`                      | Profile hub: learning tools, account rows                       | Auth  | 019     | 019    | D                                                  |
| 20  | `/me/grammar`              | Grammar topics index                                            | Auth  | 020     | 020    | D                                                  |
| 21  | `/me/progress`             | Stats: completion, heatmap, SRS distribution                    | Auth  | 021     | 021    | D, E (0 activity)                                  |
| 22  | `/me/pronunciation`        | IPA practice hub                                                | Auth  | 022     | 022    | D                                                  |
| 23  | `/me/settings`             | Account settings                                                | Auth  | 023     | 023    | D                                                  |
| 24  | `/me/speaking`             | Speaking hub: IPA drill + 4 modes                               | Auth  | 024     | 024    | D, E (0 sessions)                                  |
| 25  | `/me/speaking/journal`     | Daily speaking journal                                          | Auth  | 025     | 025    | D                                                  |
| 26  | `/me/speaking/phoneme`     | Phoneme coach                                                   | Auth  | 026     | 026    | D                                                  |
| 27  | `/me/speaking/roleplay`    | AI roleplay                                                     | Auth  | 027     | 027    | D                                                  |
| 28  | `/me/speaking/shadowing`   | Shadowing practice                                              | Auth  | 028     | 028    | D                                                  |
| 29  | `/me/writing`              | Writing corrector: level tabs, samples, textarea                | Auth  | 029     | 029    | D                                                  |
| 30  | `/me/writing/history`      | Writing correction history                                      | Auth  | 030     | 030    | D (empty)                                          |

## Shared surfaces

| Surface                  | Where                                                                                | Evidence                  |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------- |
| Desktop header           | All auth pages: logo, Học / Ôn / Lộ trình / Tôi nav, theme toggle, user chip, logout | any desktop shot          |
| Mobile bottom nav        | Auth pages: Học / Ôn / Lộ trình / Tôi                                                | any mobile shot           |
| Command palette          | Ctrl+K page search (9 destinations)                                                  | states/\*-command-palette |
| Toast (sonner)           | top-center, e.g. login failure                                                       | states/\*-login-error     |
| Lesson chrome            | top bar: Thoát, progress bar, step n/N                                               | 009/010                   |
| Section-label + row-card | Small-caps gray label + white bordered rows w/ icon+title+desc+ ›                    | 015, 019, 021, 024        |

## Observed gaps in state coverage (to fill during diagnosis or redesign)

- Error states for in-app data fetches (only login error exercised).
- Populated SRS queue, populated writing history, populated progress
  (E2E user is fresh — "returning user with history" not seeded).
- Disabled/locked unit states on mobile list (visible partially in 008/018).
- Hover/focus rings — not captured as screenshots; check during
  accessibility pass.
- Any dialogs besides command palette — none found in route crawl.
- Tablet breakpoint — not captured; layout collapses to mobile nav early,
  verify during refactor.

## First findings already visible in baseline

1. **Feedback language mismatch** — login failure toast reads
   "Invalid email or password" (English) on a Vietnamese UI
   (states/desktop-login-error.png).
2. **Two near-identical flat lists** — `/learn` unit list (42 rows) and
   `/quiz` quiz list (45 rows) share the same row-card pattern with no
   grouping controls beyond level headings; long scroll on mobile.
3. **Consistent shell exists** — header nav + bottom nav + section-label
   - row-card pattern is already a de-facto design system; audit should
     codify rather than replace it.
4. **Dark mode works** end-to-end on dashboard (states/desktop-learn-dark).
5. **Landing below-fold lazy-render** — `content-visibility:auto` +
   `ScrollReveal` make screenshots fragile; capture requires the two-pass
   scroll+resize trick in `recapture-landing.ts`.
