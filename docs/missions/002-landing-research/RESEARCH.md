# Research Synthesis — AtoEnglish Landing Page

Mission 002 · 2026-10-05 · 3 parallel streams (design trends / competitor
teardown / repo capability) · Lead synthesis at bottom.

---

## A. What "beautiful & modern" means in late-2025/2026 (design stream)

FACTS:

- Product-first heroes are the consensus: show a working/animated slice of
  the product, not a screenshot or illustration (Linear, Notion, Preply).
- Typography is the hero: oversized display `clamp(48px,8vw,96px)`, editorial
  serif + neutral sans. **Trap for VN**: trendy serifs (Playfair, DM Serif,
  Instrument Serif) have broken/missing Vietnamese diacritics.
- Bento grids are commoditized — fine only with real size hierarchy.
- Cliché/ban list: purple-blue "AI gradient" mesh, glassmorphism systems,
  gradient text on headings, noodle-arm illustration, stock 3D.
- Light + warm + saturated wins for learning products (Duolingo white+green,
  Preply pink #ff7aac, SDU coral, Babbel orange). Dark+purple = "generic AI
  startup" — the opposite of AtoEnglish's message.
- "Speaking" has a proven visual vocabulary: waveform states
  (idle/listening/processing/speaking) + transcript bubbles (ElevenLabs
  LiveWaveform pattern). Never reuse one animation for listen & speak.
- Motion: CSS scroll-driven timelines + framer-motion micro-interactions;
  `prefers-reduced-motion` fallback mandatory.
- Vietnam reality: mobile-first/only, mid-range Android + 4G, VN text runs
  15–20% longer than EN. LCP<2s on 4G is itself the local differentiator —
  local edtech sites are cluttered, desktop-led, diacritic-sloppy.

Closest award-level reference for us: **kraemeracademy.com** (language
school, minimalist + microanimations). Also: sdu-future-education (Awwwards),
speak.com, praktika.ai.

## B. What competitors actually do (teardown stream)

| Product                                         | Core mechanic                                                                                            | Dishonesty we must NOT copy                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| ELSA                                            | **Free CEFR-ish assessment as the funnel** ("Kiểm tra trình độ miễn phí"); founder story; stat wall      | "#1", asterisked 90%/68% claims                                |
| Duolingo                                        | **Lesson-before-signup** (~5min value before identity); "5 min/day"                                      | streak = attendance not learning (documented critique)         |
| Babbel                                          | Named method ("Babbel Method") + quiz funnel + real (asterisked) studies                                 | perpetual "save 60%"                                           |
| Busuu                                           | "22h Premium = 1 semester" — outcome in a known currency                                                 | survey-soft percentages                                        |
| VN local (MochiTalk, EnglishVui, Babilala, TFY) | Pain-mirroring headlines ("HỌC LÂU VẪN KHÔNG NÓI ĐƯỢC?"), "10 phút/ngày", cam kết "Nói được sau 30 ngày" | **cam kết theater** — VN consumers burned; exposé genre exists |

Whitespace findings (the opportunity):

1. **Nobody shows the receipt.** Every competitor promises; none publishes
   what the promised days actually buy. "28 ngày → X" as a _scoped, honest
   CEFR outcome_ is un-copyable positioning.
2. **The anti-claim lane is empty in VN.** Open by stating what we DON'T
   promise — exploits the exact distrust the cam kết exposés created.
3. **Streak/XP honesty is free positioning** — "Chuỗi ngày chứng nhận bạn
   quay lại. CEFR chứng nhận bạn tiến bộ."
4. **Diagnostic-first CTA is proven and unoccupied at the honest end** —
   a free placement that reports a real level with honest bounds.
5. Awwwards-contrast products win with restraint (one claim, one CTA color,
   real product imagery) — restraint is _on-message_ for an honest brand.

## C. What this repo can afford (capability stream)

HAVE: Tailwind v4 tokens (green primary, oklch, dark works), Plus Jakarta
Sans w/ Vietnamese subset via next/font, framer-motion 12 (app-wide,
reducedMotion=user), lucide, design-system components, `/api/audio` real TTS
samples, `pilot_events` analytics (landing sources already in enum), full
OG/SEO infra, RSC-first `/` route outside app chrome.

MISSING/RISKS: zero marketing components (all deleted); **font-wiring bug —
`--font-sans-var` never defined, Jakarta may silently fall back to system-ui**
(must fix + verify in browser); `next/image` unused (first use = landing,
unproven under vinext); CSP blocks remote imagery (self-host in `public/`);
no arbitrary TTS; 4 e2e files pin the placeholder and must flip same-diff.

SALVAGE (authorized copy): brand "Học tiếng Anh để nói được"; pilot pills
(28 ngày · 10–15 phút · từ A0); honest 28-day outcome contract (30–45s work
intro, spell name, 5 predictable questions, repair phrases); IPOR method
name; guest = first lesson free, then signup.

Old landing (screenshot + source recovered): dark hero, generic SaaS
sections, honest but text-heavy, no product moment. Not the direction to
repeat; copy/metadata is reusable.

---

## LEAD SYNTHESIS — recommended direction

**"Show the receipt" landing.** Light-first, warm, mobile-first, one
interactive product moment, honest scope as the headline differentiator.

Structure proposal (single scroll, ~6 sections):

1. **Hero** — promise + scope, not superlative. H1 ~ "28 ngày. Mỗi ngày
   10–15 phút. Đây là những gì bạn thật sự nói được." + honest subhead +
   dual CTA: primary "Học bài đầu tiên — miễn phí" (→ guest lesson, the
   Duolingo-proven funnel we already support), secondary "Kiểm tra trình độ
   CEFR · 5 phút" (→ /placement, the ELSA-proven funnel). Product UI slice
   beside headline (animated lesson card or lesson-path mini, not a phone
   screenshot).
2. **The receipt** — "28 ngày nói được gì" — the real outcome contract:
   30–45s work intro, spell name, 5 predictable questions, repair phrases.
   With a line stating what 28 days does NOT do. Anti-claim lane.
3. **Method** — named loop (IPOR: Input → Processing → Output → Review) as
   the mechanism that makes the promise earned. 4 blocks, restrained.
4. **Speaking visual** — waveform + transcript states (real vocabulary of
   the differentiator), optionally a real audio sample via `/api/audio`.
5. **Proof-honest band** — the existing honest stats pattern; CEFR sub-skill
   progress instead of XP/streaks.
6. **FAQ → final CTA.**

Design rules (from trends + VN constraints):

- Light base (#f5f5f7 canvas already in tokens), green primary accent, one
  dark contrast band max. No gradients-as-wallpaper, no glassmorphism, no
  purple AI mesh.
- Plus Jakarta Sans as backbone (fix the `--font-sans-var` bug first);
  display-face experiment only after verifying VN diacritics glyph-by-glyph;
  otherwise big bold Jakarta + italic-framed English is our serif-substitute.
- Vietnamese-first layout: budget +20% text length, `lang="vi"`, check
  diacritics on mid-range Android.
- framer-motion micro-interactions + CSS scroll reveals (ScrollReveal
  component already exists, unused); `prefers-reduced-motion` everywhere.
- Self-hosted assets only (CSP); verify next/image works on vinext first.
- e2e: update landing/protected-routes/a11y/mobile specs same-diff.
- Analytics: emit `landing_hero`/`landing_final_cta` pilot events (schema
  ready, zero callers today).

Confidence: HIGH on direction (3 streams converge + repo constraints
confirmed); MEDIUM on hero interactivity choice (needs owner taste call);
the design must NOT be built until owner approves this direction.

## NEXT

Owner picks the hero variant (A: interactive lesson widget — highest
impact/highest effort; B: auto-looping conversation preview w/ waveform;
C: animated lesson card — cheap, still product-first). Then a spec mission
can be scoped for implementation.
