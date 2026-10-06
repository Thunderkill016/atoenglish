# UI/UX Source Index — Legal Reference Library

Every source below is free, open-access, or open-licensed. We study
**principles and patterns**, not visuals to copy. Verified 2026-10-05.

## Tier 1 — Standards & open design systems (normative)

| #   | Source                                   | URL                                          | License / Access             | What we take                                                                                                                                                              |
| --- | ---------------------------------------- | -------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | WCAG 2.2 Understanding Docs (W3C WAI)    | https://www.w3.org/WAI/WCAG22/Understanding/ | W3C Document License, free   | SC 2.5.8 target ≥24×24 CSS px; 1.4.3 contrast ≥4.5:1 text / ≥3:1 large; 2.4.7 visible focus; 3.3.x error identification & suggestion                                      |
| S2  | WAI-ARIA Authoring Practices Guide (APG) | https://www.w3.org/WAI/ARIA/apg/             | W3C Document License, free   | Dialog/menu/tabs/disclosure keyboard contracts, roving tabindex, aria-current for nav                                                                                     |
| S3  | GOV.UK Design System                     | https://design-system.service.gov.uk/        | Open Government Licence v3.0 | Form patterns (question pages, validation recovery, "check answers"), error summary → field-level error linking, one-thing-per-page, honest plain-language content design |
| S4  | US Web Design System (USWDS)             | https://designsystem.digital.gov/            | CC0 / public domain portions | Step indicator, process list, summary box patterns for structured flows (placement test, checkpoint)                                                                      |
| S5  | Material Design 3 guidelines             | https://m3.material.io/                      | Apache-2.0 code; docs free   | Touch target ≥48×48dp guidance (stricter than WCAG min), bottom navigation spec, progressive disclosure                                                                   |
| S6  | Apple Human Interface Guidelines         | https://developer.apple.com/design/          | Free docs (read-only)        | 44×44pt hit areas, iOS tab bar behavior, modal sheet conventions — for mobile ergonomics                                                                                  |

## Tier 2 — Evidence-based UX research

| #   | Source                                  | URL                                             | License / Access | What we take                                                                                                                                                                      |
| --- | --------------------------------------- | ----------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S7  | Nielsen Norman Group articles           | https://www.nngroup.com/articles/               | Free articles    | 10 usability heuristics (visibility of system status, match real world, error prevention, recognition over recall); mobile navigation findings                                    |
| S8  | Laws of UX (Jon Yablonski)              | https://lawsofux.com/                           | Free site        | Hick's Law (choice count ↔ decision time) → the 42/45-row flat lists; Goal-Gradient Effect → progress visibility; Miller/Chunking → list grouping; Jakob's Law → conventional nav |
| S9  | Inclusive Components (Heydon Pickering) | https://inclusive-components.design/            | Free articles    | Accessible card/collapsible/toggle implementations, reduced-motion respect                                                                                                        |
| S10 | web.dev Learn / patterns.dev            | https://web.dev/learn https://www.patterns.dev/ | CC BY 4.0 / free | Loading UX (skeletons vs spinners), CLS avoidance, responsive media                                                                                                               |

## Tier 3 — Product-domain references (language learning)

| #   | Source                                    | URL                                                                      | License / Access                 | What we take                                                                                                                                                                |
| --- | ----------------------------------------- | ------------------------------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S11 | CEFR Companion Volume (Council of Europe) | https://www.coe.int/en/web/common-european-framework-reference-languages | Free PDF, © CoE (fair quotation) | Action-oriented "can-do" framing — already the product's curriculum backbone; UI copy should surface can-do outcomes, not abstract scores                                   |
| S12 | Repo research corpus                      | `research/` (in-repo)                                                    | Internal                         | Learning-science constraints already gathered: spaced repetition, retrieval practice, comprehensible input, speaking-first for Vietnamese learners                          |
| S13 | Duolingo design/engineering blog          | https://blog.duolingo.com/                                               | Free articles                    | What to NOT copy (streak/league gamification is out of scope per PROJECT_STATE) + what to learn (lesson chrome, single-task lesson screens, minimal chrome during practice) |

## Tier 4 — In-repo current state (already-built design system)

| #   | Source               | URL/Path                                                                 | Notes                                                                                                                                        |
| --- | -------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| S14 | Token layer          | `src/app/globals.css`                                                    | shadcn-style semantic vars + domain tokens: `--state-new/learning/known/due`, `--phase-input/processing/output/review`, success/warning/info |
| S15 | Component primitives | `src/components/ui/`                                                     | shadcn/ui primitives (button, card, command palette, toast via sonner)                                                                       |
| S16 | App shell            | `src/components/layout/{header,bottom-nav,main-nav,command-palette}.tsx` | Existing nav pattern: 4-destination top nav on desktop, 4-tab bottom nav on mobile, ⌘K palette                                               |

## Rules for use

1. Patterns are extracted as **principles** into `PATTERN_CATALOG.md` —
   no pixel/asset copying from any source.
2. GOV.UK/USWDS patterns are the strongest external models for forms,
   validation, and honest content — both are government-grade
   accessibility references and explicitly re-usable.
3. Competitor products (Duolingo etc.) inform **structure only**; no
   gamification mechanics may enter scope (out-of-bounds per
   `docs/project/PROJECT_STATE.md`).
4. WCAG 2.2 AA is the floor, not the ceiling — where sources disagree
   (24px WCAG vs 44pt Apple vs 48dp Material), adopt the largest
   reasonable value per context.
