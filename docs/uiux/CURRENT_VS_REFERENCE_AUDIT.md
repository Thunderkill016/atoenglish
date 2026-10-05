# Current vs Reference Audit

Page-by-page diagnosis against `PATTERN_CATALOG.md` principles.
Evidence = `artifacts/ui-audit/current/` screenshots; principles cited as
pattern IDs (N1, L1, F2…). Severity: **S1** blocks/damages core tasks,
**S2** degrades experience measurably, **S3** polish/consistency.

## A. Systemic findings (apply across pages)

| # | Finding | Evidence | Principle | Sev |
|---|---------|----------|-----------|-----|
| SYS-1 | **Three list archetypes for the same content.** Units appear as a flat 42-row list on `/learn`, a flat 45-row list on `/quiz`, and a chunked stage-accordion on `/roadmap`. The accordion model (roadmap) already solves the long-list problem the other two pages still have. | 008, 013, 018 | L1, L2 | S2 |
| SYS-2 | **Feedback language leaks English into VI chrome.** Auth error toast: "Invalid email or password". Zero-path session descriptions: English can-do statements as primary text. Checkpoint banner does it right (Vietnamese). | states/login-error, 004 | F2, A6, P2 | S2 |
| SYS-3 | **Toast-only error reporting for blocking failures.** Login failure surfaces only a transient sonner toast — no inline form error. | states/login-error | F2, F3 | S2 |
| SYS-4 | **Forms lack persistent labels.** Login inputs = icon + placeholder only; no `<label>`-visible text. | 002 | F1, A2 | S2 |
| SYS-5 | **De-facto design system exists but is uncodified.** Section-label + row-card + narrow column (~730px) + bordered cards on muted bg is consistent across 019/021/024/029 — this is good and should be formalized, not replaced. | all | R1–R3, E3 | — |
| SYS-6 | **Dark mode exists and works**, but was only verified manually; no automated state coverage in e2e. | states/learn-dark | — | S3 |
| SYS-7 | **Empty states inconsistently actionable.** `/review` empty = good ("Học bài mới" CTA). `/me/speaking` shows "0 buổi luyện" with no inline CTA pointing at the first action (though the mode rows below serve). `/me/progress` shows empty heatmap + zeroed stats with no "start" guidance — dead dashboard for new users. | 015, 024, 021 | E1 | S2 |
| SYS-8 | **"Continue" is present but competes with full inventory.** `/learn` shows the continue card then immediately the entire 42-unit inventory; the next-action signal drowns on mobile (very long scroll). | 008 | L2, N1 | S2 |
| SYS-9 | **Icon-button hit areas in chrome are unverified ≤40px**; WCAG floor is 24px but mobile guidance is 48px. Header icons (theme, logout) and lesson chrome buttons need a target-size pass. | header shots | A1 | S3 |
| SYS-10 | **Lazy-render fragility.** `content-visibility:auto` + ScrollReveal on the landing makes the page paint in two passes — real users on slow devices may see delayed sections; screenshots needed a scroll+resize workaround. | 001 | E2, R4 | S3 |

## B. Page-by-page

### `/` Landing (Anon)
- Good: clear hero, single CTA, honest "small project" stats section,
  method explanation, FAQ. Can-do/product framing present.
- Issue: mid-page sections lazy-paint (SYS-10); hero product-preview card
  is small text — check contrast of muted captions (A4). Sev S3.

### `/login` (Anon)
- Good: focused single-purpose page, OAuth + email, visible terms links,
  Vietnamese throughout the form chrome.
- Issues: F1 missing labels (SYS-4), F2/F3 toast-only English error
  (SYS-2/3). Sev S2 — this is the front door.

### `/zero-path` (Anon trial)
- Good: session list with per-session can-do + current state
  ("Buổi 2 · đang mở") — strong CEFR framing.
- Issues: can-do descriptions in English under Vietnamese chrome
  (SYS-2/P2); mid-page dead gap + duplicated "Buổi học" content block
  (R2); no obvious "why" for a cold visitor before the session list. Sev S2.

### `/learn` Dashboard (Auth)
- Good: greeting + today's-plan card with progress bar + prioritized
  checklist ("ƯU TIÊN — LÀM TRƯỚC" … "CÁC BƯỚC CÒN LẠI"), word-of-day
  card, continue card — the top of this page is the best IA in the app.
- Issues: flat unit inventory below (SYS-1/8); the same units exist
  better-organized in `/roadmap` — consolidate or cross-link rather than
  duplicate (L1). Sev S2.

### `/learn/[unit]` Unit start (Auth)
- Good: mission framing card, explicit objective, one dominant CTA —
  matches D1/D4 exactly. Top progress bar + Thoát exit (N3).
- Issue: large dead space below CTA on desktop (R2 — center the card
  block or add session-preview content). Sev S3.

### `/learn/[unit]/checkpoint` (Auth)
- Good: mastery banner states the can-do in Vietnamese, numbered
  one-question blocks, radio rows, "Cần 4/4" requirement counter, quiet
  exit. Nearly textbook D1+D3.
- Issue: radio option rows are text-dense English — fine (learning
  content). Check tap target of radio rows ≥48px (A1). Sev — preserve.

### `/placement` (Auth)
- Good: self-select level cards (label + description + starting unit) =
  GOV.UK "check a service is suitable" pattern; clear alternative path
  (full test) with honest scope (45 câu · ~15–25 phút).
- Issue: emoji-as-icon in level rows vs lucide icons elsewhere
  (E3 consistency). Sev S3 — mostly preserve.

### `/quiz` (Auth)
- Issue: 45 identical rows, level chips only, no search/filter/grouping —
  worst L1 violation. Quiz should hang off units or offer grouped mode.
  Sev S2.

### `/read` (Auth)
- Good: text list with level chips + paste-your-own = two clear modes.
- Issues: paste textarea has no visible label above it (F1); row list
  could carry difficulty/word-count metadata to aid choice (L3/D4).
  Sev S3.

### `/review` + `/review/cards` + `/review/hard` (Auth)
- Good: honest "nothing due" state with next action (E1 done right);
  queue sub-pages keep the same shell.
- Issues: `/review/cards` and `/review/hard` with empty queues render
  near-empty pages — should collapse into `/review` with inline empty
  sections, or explain *why* the queue is empty + expected time to next
  due (E1). Sev S2.

### `/roadmap` (Auth)
- Good: 4 collapsible stages with month ranges + unit counts + expanded
  unit list + "Học tiếp" row — the L1 reference implementation **inside
  the product already**. Tip line "Output sớm giúp não biết gì học tiếp
  theo" is honest pedagogy.
- Issues: stage descriptions are English-content titles mixed into VI
  chrome (acceptable — unit titles are the content); chevrons on collapsed
  groups small (A1). Sev — preserve as the list-archetype model.

### `/me` hub (Auth)
- Good: settings-hub pattern (grouped rows, collapsible "Công cụ luyện
  thêm"), scannable. Preserve.

### `/me/progress` (Auth)
- Good: honest stats (no inflated gamification), activity heatmap,
  SRS distribution bars.
- Issue: for a fresh user this is a page of zeros with no guidance —
  needs a first-run empty state explaining what will appear (E1). Sev S2.

### `/me/speaking` hub (Auth)
- Good: mode rows with one-line contracts (D4), honest note that
  auto-scoring isn't trusted ("Chấm phát âm tự động chưa đủ tin cậy…") —
  exemplary product honesty.
- Issue: "0 buổi luyện gần đây" count could deep-link the recommended
  first mode (E1 minor). Sev S3.

### Speaking modes (journal/phoneme/roleplay/shadowing)
- Good: each is a focused surface. (Default states captured.)
- To verify in implementation phase: in-session chrome follows N3/D1
  (screenshot only shows entry screens). Sev —

### `/me/writing` + history (Auth)
- Good: level tabs (A1→B2 with plain-Vietnamese descriptors), sample
  sentences as tappable rows, big textarea, char counter, explicit
  "Phân tích" action — clean D1 form.
- Issues: sample-sentence rows show only ">" affordance — looks like a
  collapsed accordion, unclear they insert into the editor (L3); "Lịch sử"
  top-right is a small ghost-button target (A1). Sev S3.

### `/me/grammar`, `/me/pronunciation`, `/me/settings` (Auth)
- Captured; share hub/list patterns — fold into unified page archetypes
  (hub index / list / form) rather than bespoke layouts.

## C. Preserve list (already meets/exceeds reference patterns)

1. App shell nav (N1) — 4 destinations, correct desktop/mobile split.
2. Command palette (N4).
3. `/roadmap` stage accordions (L1 model).
4. Checkpoint + unit-start lesson chrome (D1/N3 model).
5. Review empty state (E1 model).
6. Token layer + dark mode (SYS-5/6).
7. Honest-content copy style (placement scope note, speaking disclaimer).

## D. Final audit answers

**What systemic problems exist?**
Three competing list archetypes for the same unit content (SYS-1);
English chrome leaks into VI product copy (SYS-2); toast-only blocking
errors + missing form labels (SYS-3/4); fresh-user surfaces render zeros
without guidance (SYS-7); the next action competes with full inventory on
the most-visited page (SYS-8).

**Which references/patterns are most useful and why?**
GOV.UK patterns (S3) — validation recovery, one-thing-per-page, and
visible-label forms map directly onto login/placement/checkpoint fixes.
WCAG 2.2 + APG (S1/S2) — normative floor for targets, focus, aria. The
product's own `/roadmap` accordion was the strongest reference of all:
an internal implementation already correct — reused rather than invented.

**Largest mismatch vs good practice?**
List IA: 42–45 unchunked rows on `/learn` and `/quiz` violate Miller/
Hick directly in front of near-A0 users — the audience least able to
absorb choice overload. Fixed via `CollapsibleGroup` (verified in
`after/` screenshots).

**Target design language?**
"Practice workbook" — quiet bordered cards, narrow reading measure, one
green accent reserved for actionable affordances, Vietnamese chrome with
framed English content, honest scope notes. Codified in
TARGET_DESIGN_SYSTEM.md §1–6.

**Site-wide standards?**
Row-card atomic action; stage-accordion for any grouped inventory;
EmptyState with CTA on every data surface; three-tier error system
(inline field → form summary → toast only for confirmations); visible
form labels; ≥48px touch targets; Vietnamese-all-chrome copy rule.

**Strongest-redesign pages?**
`/learn` inventory + `/quiz` picker (done — accordion). `/login` error
handling (done). `/review/cards`, `/review/hard` remain candidates for
consolidation into `/review` (deferred — current empty states are
acceptable). `/zero-path` dedup done.

**Preserve?**
App shell nav + command palette; checkpoint/unit-start lesson chrome;
roadmap accordion; review empty state; token layer + dark mode; the
honest-copy voice (placement scope note, auto-scoring disclaimer).

**First implementation phase and why?**
Foundations (labels, aria, touch targets, error tiers) — they are the
lowest-risk, highest-leverage changes and every later page fix depends
on them. Done in commit a17d10a8 alongside Phases 1–3 quick wins.
