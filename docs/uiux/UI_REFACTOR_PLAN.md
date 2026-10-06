# UI Refactor Plan — AtoEnglish

System-first sequencing per the audit mission. Each phase is
independently shippable and verified against baseline screenshots.

## Non-goals

- No visual rebrand; no new gamification; no new nav destinations;
  no landing marketing redesign beyond paint reliability.
- No behavior/product-logic changes beyond what UI requires
  (e.g., error copy localization needs a small copy map, not a rewrite).

## Phase order

### Phase 0 — Foundations (low risk, everything depends on it)

1. Codify layout tokens: content measures (720/1080), spacing scale
   comment block in `globals.css` documenting the 4px scale usage law.
2. Accessibility sweep: `aria-current` on nav items, `aria-expanded` on
   accordions, focus-visible ring audit, touch-target pass on icon
   buttons (header, lesson chrome) → min 44–48px.
3. Error-system components: shared `FormField` (label+hint+error wiring)
   and `ErrorSummary` per TARGET_DESIGN_SYSTEM §6.
4. `prefers-reduced-motion` guard on ScrollReveal + shake animations.
   _Verification:_ axe/keyboard pass + typecheck + existing e2e.

### Phase 1 — Front door & language integrity (S2 fixes)

5. `/login`: real labels on email/password, inline VI error text
   (replace English toast for auth failures; keep toast for info),
   `aria-invalid` wiring. Localize better-auth error strings via a
   VI message map — small, bounded.
6. `/zero-path`: session descriptions in Vietnamese (can-do EN kept as
   framed learning content), remove duplicated session block + dead gap.
   _Verification:_ login-error + zero-path after-shots vs baseline.

### Phase 2 — List architecture (the big IA fix)

7. Extract `/roadmap`'s stage-accordion into a shared component
   (`src/components/curriculum/` or similar).
8. `/learn`: keep today's-plan + word-of-day + continue; replace the
   flat 42-unit inventory with the stage-accordion (or a compact
   "see full roadmap" link if duplication with `/roadmap` is judged
   cleaner — decide during implementation with a screenshot diff).
9. `/quiz`: group rows by level accordion (A0/A1/A2/B1/B2) or merge
   into unit context; add nothing new.
   _Verification:_ list pages after-shots vs 008/013/018 baseline.

### Phase 3 — Empty states & dashboards

10. Shared `EmptyState` component; apply to `/review/cards`,
    `/review/hard`, `/me/progress` (first-run), `/me/speaking`,
    `/me/writing/history`, `/quiz` states.
11. `/review/cards` + `/review/hard`: either inline into `/review`
    sections or gain proper empty-state content (decide by nav weight —
    keep routes, fill content, simpler).
12. `/read`: visible label for paste textarea; row metadata (level +
    ~word count) to aid selection.
    _Verification:_ empty-state after-shots vs 016/017/021/024/030.

### Phase 4 — Consistency polish

13. Icon consistency: replace emoji icons on placement level rows with
    lucide equivalents matching the icon-squircle row style.
14. `/me/writing`: make sample-sentence insertion affordance clearer
    (explicit "+ Dùng câu này" hint or different affordance than ">").
15. `/learn/[unit]` start screen: reduce dead vertical space (center
    mission block or add objective preview).
16. Landing: evaluate `content-visibility`/`ScrollReveal` reliability on
    slow devices; keep if harmless after reduced-motion guard.
    _Verification:_ after-shots + visual diff vs baseline.

## Redesign matrix (route → action)

| Route(s)                                           | Action                                            |
| -------------------------------------------------- | ------------------------------------------------- |
| `/`                                                | Preserve; motion/paint reliability only (16)      |
| `/login`                                           | Fix (5): labels, VI inline errors                 |
| `/zero-path`                                       | Fix (6): VI copy, remove duplication              |
| `/learn`                                           | Fix (8): adopt stage-accordion for inventory      |
| `/learn/[unit]`                                    | Polish (15): vertical balance                     |
| `/learn/[unit]/checkpoint`                         | Preserve (reference lesson chrome)                |
| `/checkpoint/trial`, `/placement`                  | Preserve; icon consistency (13)                   |
| `/quiz`                                            | Fix (9): grouped list                             |
| `/read`                                            | Polish (12): label + metadata                     |
| `/review*`                                         | Fix (10/11): empty states, possible consolidation |
| `/roadmap`                                         | Preserve; becomes shared component source (7)     |
| `/me` hub                                          | Preserve                                          |
| `/me/progress`                                     | Fix (10): first-run empty state                   |
| `/me/speaking` + 4 modes                           | Polish (10): empty-state CTAs                     |
| `/me/writing` (+history)                           | Polish (10/14)                                    |
| `/me/grammar`, `/me/pronunciation`, `/me/settings` | Preserve; archetype alignment                     |

## Risk & rollback

- All changes are presentational; each phase = separate commit on the
  work branch, so any phase reverts cleanly.
- Highest risk: Phase 2 list changes touch the most-used page —
  ship behind the same route, verify both viewports, keep the flat-list
  component until the accordion proves out in screenshots.
- Auth error localization must not alter better-auth behavior — copy
  map at the UI layer only.
- No DB/schema changes anywhere in this plan.

## Verification (per phase)

1. `npx tsc --noEmit`, `npm run lint`, targeted vitest.
2. `scripts/ui-audit/capture*.ts` re-run → `artifacts/ui-audit/after/`
   with identical viewports (1440×900, 390×844, same states).
3. Screenshot diff review vs `current/` baseline — every change must be
   traceable to an audit finding ID (SYS-\*, or a page row above).
4. Accessibility: keyboard tab order, focus rings, aria attributes;
   run existing `e2e/accessibility-smoke.spec.ts`.
