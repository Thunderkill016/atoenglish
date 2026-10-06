# Target Design System — AtoEnglish

Direction: codify the de-facto system that already works (narrow reading
column, bordered cards, section labels, row actions, green accent) and fix
the systemic gaps (list IA, form labels, error language, empty states).
Not a rebrand. Vietnamese-first, evidence-honest, CEFR-framed.

## 1. Design language

**"Cẩm nang luyện tập" — a practice workbook, not a game.**

- Quiet, structured, trustworthy. A workbook that tells you exactly what
  to do next and records honest evidence.
- One accent (green) means "actionable". Warm neutrals do everything else.
- Vietnamese chrome everywhere; English is _content_, visually framed
  (italic serif or distinct weight acceptable) so learner instantly
  separates "language being studied" from "instructions".
- No decorative reward surfaces, no mascots, no streak theater —
  motivation comes from visible can-do progress (Goal-Gradient), not
  points.

## 2. Page archetypes (all pages must be one of these)

| Archetype                | Contract                                                          | Pages                                                               |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| **A. Marketing**         | Centered prose, section rhythm, 1 primary CTA per section         | `/`, `/privacy`, `/terms`                                           |
| **B. Auth/Form**         | Single card ≤480px, visible labels, inline errors, one submit     | `/login`                                                            |
| **C. Hub/Index**         | Section-label + row-card groups, ≤2 levels deep                   | `/me`, `/me/speaking`, `/me/grammar`, `/review`                     |
| **D. Dashboard**         | Next-action block first, then evidence, then inventory            | `/learn`, `/me/progress`                                            |
| **E. Curriculum list**   | Chunked accordion groups (stage → units), continue row pinned top | `/roadmap`, `/quiz`, unit inventory inside `/learn`                 |
| **F. Task/Practice**     | Full-bleed focus chrome: exit + n/N progress + one action         | `/learn/[unit]/*`, `/checkpoint/*`, speaking modes, `/review/cards` |
| **G. Picker/Onboarding** | Labeled choice cards + one alternative path                       | `/placement`, `/zero-path`                                          |

Rule: adding a page = choosing an archetype. No bespoke layouts.

## 3. Layout & rhythm

- Content measure: **720px** column for text tasks (A/B/C/F), **1080px**
  max for dashboards (D). Already ≈current — codify as tokens.
- Spacing scale: 4px base — `4 8 12 16 20 24 32 48 64`.
  Section gaps ≥32px (desktop) / ≥24px (mobile). Row-list gap 8–12px.
- Surfaces: `bg-background` muted page → `bg-card` white content, 1px
  `border`, `radius-lg` (12px), one elevation level (subtle shadow) only
  for floating UI (palette, toasts, dropdowns).
- Breakpoints: `<1024px` mobile shell (bottom nav), `≥1024px` desktop
  shell (top bar). Nothing between is a distinct layout.

## 4. Typography

- VI chrome: system sans (`--font-sans`), weights 400/600/700 only.
- Scale: 12 caps-label / 14 body-secondary / 16 body / 18 row-title /
  24 page-title / 32 hero. No other sizes on product surfaces.
- English learning content may use a secondary treatment (serif or
  italic) to signal "study material" — one rule, applied everywhere.
- Section labels: small-caps, `--muted-foreground`, `letter-spacing` —
  the existing pattern, with contrast checked ≥4.5:1.

## 5. Color & tokens

Keep the existing token layer; add usage law on top:

- `primary` (green): interactive affordances ONLY — buttons, links,
  active nav, progress-fill. Never decoration.
- Domain tokens stay semantic: `state-new/learning/known/due` for vocab,
  `phase-input/processing/output/review` for lesson phases, `success/
warning/info/destructive` for status. No new ad-hoc colors.
- Locked/unavailable = `muted` + lock icon + reduced contrast, never
  just a different chevron.
- Dark theme: keep token parity; verify muted text ≥4.5:1 on dark bg
  (audit found light-mode good; dark needs a contrast spot-check pass).

## 6. Core components (site-wide standards)

**Row-card** — the atomic unit. Full-width, min-height 56px (mobile 64px
preferred), icon-squircle + title(18/600) + one supporting line(14) +
trailing affordance (›). One action per row. Used on every C/E surface.

**Stage-accordion** — collapsible group: header row (stage title +
subtitle "Tháng 1–3 · 0/20 unit" + expander), body = row-card list.
`/roadmap` implementation becomes the canonical component; `/learn`
inventory and `/quiz` adopt it.

**Next-action block** — dashboard header unit: plan card with progress
bar + prioritized checklist + continue row. Exists on `/learn`; becomes
the required D-archetype opener.

**Lesson chrome** — fixed top bar: exit left, step progress center,
n/N or requirement counter right. No global nav inside tasks (F-archetype).

**Form field** — visible label above input, hint text optional below,
error text below in `destructive` + `aria-invalid` + `aria-describedby`.
Placeholder = format example only.

**Error system** — three tiers, chosen by scope:

1. Field-level inline (form errors) — always.
2. Error summary card top-of-form (multi-field or server errors) —
   GOV.UK pattern, anchored to fields.
3. Toast — confirmations and non-blocking notices ONLY. Never the sole
   channel for a blocking error. All copy in Vietnamese.

**Empty state** — icon + one-line explanation + primary CTA + optional
"when this fills" note (e.g., "Từ đến hạn sẽ xuất hiện ở đây sau buổi
học đầu tiên"). Every list/queue/stats surface must define one.

**Focus ring** — `:focus-visible` 2px `ring` offset — verify on all
rows/buttons/nav; skip-link already correct.

## 7. Interaction standards

- Touch targets: ≥48px on mobile for anything tappable (rows already
  pass; audit icon buttons).
- Motion: 200–300ms ease transitions; `prefers-reduced-motion` →
  opacity-only/instant. Scroll-reveal kept subtle or removed on
  product surfaces (it's landing-only today — keep it there).
- Loading: skeleton mirrors final layout for list/hub pages; button
  spinners for <1s ops; >4s shows explanatory copy.
- Keyboard: all row-cards are real `<a>`/`<button>`; palette traps focus;
  Escape exits overlays; lesson exit always reachable via keyboard.

## 8. Copy rules

- Chrome = Vietnamese. Feedback, errors, empty states, labels: VI always.
- Can-do outcomes are the primary naming for units ("Gặp đồng nghiệp
  mới") with unit codes secondary — already true, keep it.
- English appears only as learning content, framed visually.
- Honest scope notes stay (placement test stats, speaking-score
  disclaimer) — they are a product asset.

## 9. Explicit non-goals

- No gamification redesign (no XP bars as hero, leagues, badges,
  confetti, streak celebration). Out of scope per PROJECT_STATE.
- No new color/theme systems, no rebrand, no illustration language.
- No landing marketing redesign beyond fixing paint reliability.
- No new top-level nav destinations.
