# Full Redesign Plan — AtoEnglish

Status: draft, pending owner direction inputs (Gate 0).
Scope: **visual + interaction layer only** — tokens, typography, color,
components, page layouts. No product-logic, data, curriculum, or
feature changes. Vietnamese-first stays; honest-evidence framing stays;
CEFR naming stays.

This supersedes `UI_REFACTOR_PLAN.md` as the active visual work. The
audit docs (`CURRENT_VS_REFERENCE_AUDIT.md`, `TARGET_DESIGN_SYSTEM.md`)
remain the evidence base — the redesign changes *look and feel*, not
the IA/accessibility findings they recorded.

## Decision gates (owner steers at each)

| Gate | What owner gets | Owner decides |
|------|-----------------|---------------|
| G0 | Direction questionnaire (below) | References, adjectives, hard no's |
| G1 | 2–3 direction boards: palette + type + density + one mocked screen each | Pick ONE direction |
| G2 | Token sheet on real product surface (login or /learn) | Approve/adjust tokens |
| G3 | One hero page fully redesigned (owner picks which) | Approve pattern → unlock rollout |
| G4 | Per-phase screenshot batch vs baseline | Approve each phase |

Nothing rolls out before G3 approval. Each phase is a separate branch/PR
so any stage can be reverted.

## Phase R0 — Direction capture (owner input required)

Owner answers (any form — links, screenshots, words):

1. **2–3 sites/products whose look you like** — doesn't need to be
   learning apps.
2. **Adjectives** for the feel (e.g., "sạch, lạnh, y tế" / "ấm, sách
   vở, mềm" / "đậm, neon, dark").
3. **Hard no's** (e.g., no gradients, no rounded, no dark-first).
4. Light-first, dark-first, or both-equal?

Output: 2–3 direction boards (each = palette, type pair, spacing
density, card treatment, one `/learn` mock) → owner picks at G1.

## Phase R1 — Foundation tokens (PR 1)

- Rewrite token layer in `globals.css`: color ramps, type scale,
  spacing scale, radius, elevation, focus ring — per chosen direction.
- Font loading decision (system vs one display face).
- Icon set: keep Lucide or switch — decided at G1.
- Dark theme parity in the same pass (tokens only).
- Verify: token sheet page renders all primitives; contrast ≥4.5:1
  body text, ≥3:1 large text; `tsc`+lint.

## Phase R2 — Component reskin (PR 2)

Re-skin existing primitives in place — same props, new look:

- Buttons, inputs, `FormField`, `ErrorSummary`, `CollapsibleGroup`,
  `EmptyState`, row-cards, nav chrome (top bar + bottom nav), lesson
  chrome (exit/progress/action bar), cards, badges/chips, dialogs,
  command palette, toasts.
- New/removed components only if the direction requires — each
  addition listed in the PR.
- Verify: component grid screenshot (all states), e2e a11y spec.

## Phase R3 — Page rollout by archetype (PRs 3–5)

Apply in order of user-visible risk (front door last is safer, but
owner may reorder at G1):

1. **Task/practice surfaces** (`/learn/[unit]`, `/checkpoint/*`,
   speaking modes, `/review/cards`) — focus chrome.
2. **Hubs + curriculum** (`/learn`, `/quiz`, `/roadmap`, `/me`,
   `/me/*`) — dashboard + list archetypes.
3. **Front door + marketing** (`/`, `/login`, `/zero-path`,
   `/placement`, `/privacy`, `/terms`).

Each PR: full 30-route capture in `artifacts/ui-audit/redesign-N/`,
diff vs baseline, owner review at G4.

## Phase R4 — Verification & cleanup (final PR)

- Full re-capture (desktop+mobile, key states incl. dark mode).
- axe/a11y pass, keyboard pass, reduced-motion pass, touch-target
  pass (≥44px).
- Dead-CSS/token cleanup; remove superseded variants.
- Update `TARGET_DESIGN_SYSTEM.md` to describe the *new* shipped
  system; mark old law superseded.

## Constraints (unchanged)

- No gamification surfaces, no XP/streak/league/badge expansion —
  frozen per `PROJECT_STATE.md`.
- No new nav destinations, no curriculum/product changes.
- Vietnamese chrome everywhere; English = framed content only.
- No DB/schema/API changes.
- Every PR: `tsc` + lint + vitest + focused Playwright + visual diff.

## Open logistics

- **PR #226** (audit fixes: labels, VI errors, list chunking,
  empty states) — recommend merge before R1: it's accessibility
  correctness, orthogonal to look. Alternative: close it and let
  redesign absorb the markup changes.
- Branch strategy: `redesign/<phase>` off main (or off #226 if merged).
- Dev server `:3001` + browser preview for live owner review at gates.
