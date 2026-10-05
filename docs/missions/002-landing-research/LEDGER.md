# Development Ledger — 002-landing-research

## STATE

`ACCEPTED` — research delivered, owner approved direction
("show the receipt" + hero variant C — animated lesson card) and
authorized implementation ("Duyệt — implement luôn").

## WORKSTREAMS

| Stream | Session | Result |
| ------ | ------- | ------ |
| Design trends 2025–26 | research subagent (parallel) | light-first, product-first hero, restrained motion; banned: purple AI gradients, glassmorphism, equal bento |
| Competitor teardown | research subagent (parallel) | ELSA funnel test, Duolingo learn-before-signup, VN "30 ngày" claim fatigue → whitespace = show the receipt |
| Repo capability | research subagent (parallel) | tokens/framer-motion/analytics present; found `--font-sans-var` never defined; CSP blocks remote images |

## DECISIONS

- Direction: "Show the receipt" — honest 28-day CEFR scope instead of
  fluency promises (approved by owner).
- Hero variant C: animated lesson card (approved by owner).
- Primary CTA → `/learn/unit-a0-1` (guest-accessible first lesson).
- Secondary CTA → on-page scope anchor (rejected `/placement` — it
  requires auth and would bounce guests to login).

## IMPLEMENTED CHANGES

Commit `91bedbab` — `feat(landing): light-first honest landing with
animated lesson-card hero`:

- `src/app/page.tsx` — 6-section landing (hero/receipt/method/speaking
  demo/evidence/FAQ+CTA), RSC-first.
- `src/components/landing/` — `HeroLessonCard`, `SpeakingDemo`,
  `LandingCtas` (pilot analytics via existing client).
- `src/app/layout.tsx` + `globals.css` — `--font-jakarta` wiring fix;
  `body { overflow-x }` removed (it created a scroll container that
  broke sticky nav; `clip` downlevels to `hidden` via Lightning CSS, so
  clipping now lives on `html` only).
- e2e specs updated for landing + dev prerender meta-refresh redirects.

## VERIFICATION

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean.
- Vitest — 795/795 pass.
- `npm run build` (vinext) — pass, `/` prerendered static.
- Playwright full suite — 90/90 pass after fixes:
  - landing, a11y smoke, mobile overflow, protected routes all green.
  - Fixed: duplicate CTA role match (`getByRole` → `.first()`);
    `/learn/unit-1` dev prerender emits meta-refresh redirect (1s),
    test now waits for URL settle (prod still 307).
- Browser inspection — desktop hero + scrolled sections render;
  mobile 360/390px no overflow; sticky nav top: 0 confirmed.

## OPEN FINDINGS

- Independent ato-qa review ran once on the diff; blocking findings
  (sticky nav overflow, duplicate CTA match) and copy/accuracy findings
  (speaking-demo feedback phrasing, disclaimer scope wording) were fixed
  before commit.
- Landing analytics events (`trackPilotEventOnce`) wired but funnel
  data review is deferred until traffic exists.

## FINAL ACCEPTANCE

Lead accepted after QA findings resolved and full gates re-ran green.
Not pushed/deployed — awaiting owner authorization.
