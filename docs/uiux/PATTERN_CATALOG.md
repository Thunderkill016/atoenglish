# Pattern Catalog — Principles Extracted from References

Each pattern: principle → why it matters for AtoEnglish → source IDs.
Source IDs refer to `UIUX_SOURCE_INDEX.md`.

## 1. Navigation & wayfinding

**N1. One primary destination set, consistently placed.**
App nav should be a small, fixed set (≤5) of top-level destinations with a
persistent position per viewport: top bar on desktop, bottom tab bar on
mobile. The current 4-item set (Học / Ôn / Lộ trình / Tôi) already matches.
— Jakob's Law (S8), M3 bottom nav (S5), HIG tab bar (S6).
_Rule: never grow the tab set; new surfaces hang under the four sections._

**N2. Current location is always visible.**
Active nav item uses `aria-current="page"` + distinct visual state.
Lesson surfaces use a step indicator "n/N" + progress bar.
— S2 (aria-current), S4 step indicator, S7 heuristic #1 visibility of status.

**N3. In-task chrome shrinks; out-of-task chrome exits.**
During a lesson/practice, global nav disappears; only Thoát + progress
remain — reduces distraction and accidental exits. Deep-linkable exit
("save & leave") must preserve state.
— S13 lesson chrome observation, S7 heuristic #3 user control.

**N4. Command palette is power-user surface, not a crutch.**
⌘K palette exists already; keep it as accelerator, never required
for core tasks. — S15, S8 Postel's Law.

## 2. Information architecture & lists

**L1. Chunk long lists; never render >9 ungrouped rows without hierarchy.**
42–45 flat rows violate Miller's Law / Hick's Law. Group by CEFR band
(current headings exist but are weak), collapse completed groups,
surface "continue" above the fold.
— S8 (Miller, Hick, Chunking), S4 process list.

**L2. Continue/resume is the primary action, above the fold.**
Returning users should see the next actionable item immediately
(Goal-Gradient: proximity to goal drives motivation).
— S8 Goal-Gradient, S7 recognition over recall.

**L3. Row-card = one atomic action.**
Each list row is a full-width touch target (≥48px), icon + title +
supporting line + trailing affordance. No nested clickables inside rows.
— S5 list spec, S9 card pattern.

**L4. Locked vs unlocked must be scannable at a glance.**
Availability state needs more than a chevron difference: muted content

- lock icon + reason on demand ("hoàn thành Bài X trước").
  — S7 error prevention, S3 "check a service is suitable" pattern.

## 3. Lesson & practice delivery

**D1. One thing per screen in active learning.**
Each exercise step asks for exactly one action (read/listen/speak/answer).
Chrome: exit, position indicator, then the task. No sidebar, no nav.
— S3 one-thing-per-page, S13 lesson screens, S8 Flow.

**D2. Feedback is immediate, specific, and kind.**
Right/wrong signaled instantly with the reason in Vietnamese; errors show
what good looks like rather than just marking failure.
— S7 heuristic #1/#9, S3 validation recovery, S12 retrieval-practice framing.

**D3. Progress is shown as journey position, not points.**
"n of 7 steps", unit completion %, CEFR can-do coverage — not XP bars.
XP exists in data but should not be the visual hero (scope rule).
— S4 step indicator, S8 Goal-Gradient, PROJECT_STATE scope.

**D4. Practice modes declare their contract up-front.**
Each speaking mode (shadowing/roleplay/journal/phoneme) states: what you
do, how long, what counts as done — one line each, before start.
— S3 "check a service is suitable", S7 match real world.

## 4. Forms & validation

**F1. Labels are permanent, placeholders are hints — never both job.**
Floating label or visible label above input; placeholder gives format
example only. Current login does icon+placeholder without visible label
— fails this. — S3/S4 form guidance, S7 heuristic #6.

**F2. Errors: summary → field, in the product's language.**
On submit failure: inline field error + (multi-field forms) error summary
at top anchored to fields. All copy in Vietnamese. The current
"Invalid email or password" English toast violates this.
— S3 validation pattern, S7 heuristic #9, product VI-first.

**F3. No toast-only errors for auth/critical flows.**
Toasts are for confirmations; persistent inline errors for blocking
problems. — S3, S9.

**F4. Submit buttons state the action.**
"Đăng nhập bằng Email" (current, good) not "Submit". Loading state on
button during request; double-submit guarded. — S3, S4.

## 5. Feedback, status & empty states

**E1. Empty states teach the next action.**
"0 buổi luyện" / "Không có thẻ đến hạn" must always answer "what now?"
with a primary CTA. Current review empty state does this ("Học bài mới").
— S7 heuristic #10, S3.

**E2. Honest loading: skeleton for structure, spinner for short ops only.**
Pages that re-render large structure use skeletons matching final layout
(prevents CLS). Spinners acceptable <1s ops; >4s needs a message.
— S10, S7 visibility of status.

**E3. Status vocabulary is finite and colored once.**
Word states (new/learning/known/due) and lesson phases
(input/processing/output/review) already have tokens — use them
consistently; don't invent ad-hoc colors.
— S14 existing tokens, S8 Law of Similarity.

**E4. Success is quiet; errors are loud.**
Completion checkmarks/toasts small and brief; failures get persistent
surface + recovery path. No confetti/reward surfaces (scope).
— S7, S3 confirmation pages, PROJECT_STATE.

## 6. Accessibility & input

**A1. Touch targets ≥48×48px on mobile surfaces; ≥24×24px absolute floor.**
Primary row targets are already ≥56px; icon buttons in headers/lesson
chrome must reach 48px (or 44px min). — S1 2.5.8 floor, S5 48dp, S6 44pt.

**A2. Focus is always visible and follows DOM order.**
`:focus-visible` ring using `--ring` token on every interactive element;
skip-link already exists (keep it). — S1 2.4.7, S2.

**A3. Dialogs trap focus; disclosures toggle `aria-expanded`.**
Command palette (good: has close button) and any future dialog/menu must
trap focus, return focus on close, Escape closes.
— S2 dialog/menu patterns.

**A4. Contrast ≥4.5:1 body text, ≥3:1 large text & UI chrome.**
Muted gray labels on light bg are the main risk (section labels, row
descriptions, disabled rows). — S1 1.4.3/1.4.11.

**A5. Respect `prefers-reduced-motion`.**
Scroll-reveal, transitions, and shake animations must reduce to
instant/opacity-only under reduced-motion. — S1 2.3.3/animation, S9.

**A6. Vietnamese-first copy everywhere.**
No English chrome text (buttons, errors, labels) in the VI product
surface; English appears only as learning content with clear framing.
— product direction, S7 match real world.

## 7. Layout & rhythm

**R1. Fixed content measure per archetype.**
Reading/list column ~700–760px centered for text tasks; wider (≤1100px)
only for dashboards/data. Current ~730px column is right — codify it.
— S10 line-length guidance (45–75ch), S3 layout.

**R2. 4px spacing grid; section gaps ≥32px desktop / ≥24px mobile.**
Consistent vertical rhythm; section-label + rows already approximate it —
make it a token. — S5 spacing, S8 Law of Proximity.

**R3. Cards group; borders separate; shadows spare.**
Bordered white cards on muted bg (current) is the right model — one
elevation level max, no deep shadows. — S8 Common Region, S9.

**R4. Mobile-first breakpoints; tablet uses mobile nav until ≥1024px.**
Two layouts (mobile stacked + desktop) is enough if the breakpoint is
chosen right. — S5 responsive, S10.

## 8. Language-product specifics

**P1. Can-do framing on every surface.**
Unit cards and progress show what the learner _can do_ ("Giới thiệu bản
thân", "Mua đồ và thanh toán") — already partially true; make it the
primary label, with unit numbers secondary. — S11 CEFR, S12.

**P2. L1 scaffold where it reduces failure, never as crutch.**
Vietnamese instructions/feedback are correct at A0–A2; fade scaffold
density as level rises (B1+ more English in chrome of tasks).
— S12, S11 action-oriented approach.

**P3. Speaking surfaces dominate the shell hierarchy.**
The product's differentiator is speaking evidence — speaking entry
points should be reachable in ≤2 taps from dashboard (currently true via
Tôi → Luyện nói and today's-plan row). — product direction.
