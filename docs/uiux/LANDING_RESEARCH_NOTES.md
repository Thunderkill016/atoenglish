# Landing Redesign — Research Notes

Sources consulted before building direction boards. Every board in
`/tmp/redesign-landing/` (dev preview) cites these measured specs —
not invented aesthetics.

## Measured design systems

| Source | Key facts used |
|--------|----------------|
| apple.com (designlang, shadcn.io/design/apple, layout.design, fudge) | H1 56px/w600 · body 17px · nav 12px · weights 300/400/600/700 (no 500) · `#0066cc` links / `#0071e3` fills — blue = action only · edge-to-edge tiles `#fff`/`#f5f5f7` as section dividers · radius 0 tiles / pill interactive · one drop shadow (product imagery) |
| linear.app (reseed, kage, shadcn.io/design/linear) | canvas `#08090a` (not pure black) · surface ladder `#0f1011→#1c1c1f` · hairlines `#23252a` · ONE chromatic accent `#5e6ad2` for status/CTA only · hero: left-aligned 2-line headline + radial glow + "New →" on baseline row · repeating template: heading-left / paragraph-right / dense UI composite · FIG-numbered columns · mono font for literal values · zero drop shadows |
| vercel.com (webdesignhot diff, shadcn.io/design/vercel) | canvas `#fafafa` · ink `#171717` · multi-stop mesh gradient = the only decoration · sentence-case headlines, -2.4px tracking @48px · black primary button + outline secondary · hairline cards + stacked soft shadows (1px/2px/8px layers) · dark polarity band mid-page |
| duolingo.com (kage, refero styles, tasu teardown) | white storybook canvas · ONE green `#58cc02` = progress/go · rounded display 48–64px w700-800 -0.02em · buttons 12px radius + 2px border + bottom shadow (outlined = first-class) · body #777 17px · blue `#1cb0f6` links only · structure: slim nav (no links, funnel) → 2-col hero → scrolling course-chip strip divider → alternating L/R bands → centered CTA → colored footer band · onboarding = investment before ask |
| elsaspeak.com (live, Vietnamese competitor) | trust-stats first (`50M downloads, 195 countries, 4.5★, 90% clearer pronunciation`) · uppercase bracketed section labels · outcome numbers over feature lists · promo-heavy tone — we keep honest framing instead |
| mobbin flows (Speak/Babbel/Duolingo/Quizlet) | language-app onboarding = quiz → personalization → plan before account ask |

## Trend docs 2025–26

- Bento grid (designmd.app, godrichstory): hero = headline tile spanning
  2 rows + stat tiles + accent block; size encodes importance; consistent
  padding; mix media; break rhythm intentionally; risk = sameness.
- RationalGo/trend surveys: glassmorphism on dark, oversized type, mesh
  gradients, pill navbars w/ sliding chip, scroll-triggered reveals,
  micro-interactions, asymmetric layouts.
- Awwwards SOTD pattern: expressive typography + 3D + interaction —
  high wow factor, higher cost; out of scope for v1 landing.

## EdTech conversion research

- Golden structure: hook → curriculum → method → outcome → social proof →
  trust → FAQ.
- Highest-impact elements: progress indicators, course/unit cards, social
  proof, trust signals.
- Design for learner anxiety: answer "học được không? bao lâu? đúng trình
  độ? tin được không?" before they ask.
- SaaS hero rules: one message in <5s, proof row near headline, real
  product UI (not illustration), outcome-labeled CTA.

## Board mapping

| Board | Base spec | Education adaptation |
|-------|-----------|----------------------|
| A — Bento 2025 | designmd/godrich bento | hero tiles = stats + A0 accent; can-do app card; IPOR as mixed-size grid; honesty footnote |
| B — Linear dark | linear.app measured | FIG 01-03 = science pillars; PAIN/FAQ as mono-labeled rows; lesson composite w/ sidebar |
| C — Education-warm | duolingo + edtech | can-do chip marquee = curriculum strip; stacked CTAs reduce commitment; "môi trường an toàn" pain cards; green footer band |

## AI-assisted web design workflow (round-3 research)

Sources: superdesign.dev (generic-tell taxonomy + section-by-section prompting),
meez.design (de-slop spec habits), dev.to/apogeewatcher (reject-list approach),
Anthropic artifacts-builder docs (slop warnings), tasarim.ai (tool layers:
Relume=skeleton/IA, Figma AI=direction, v0=code, Framer=publish),
metanow + zabalmedia (brief-focused workflow, AI generates options at scale,
humans refine).

Key lessons applied:

- Vague brief → statistical-average output ("slop"). Fix = explicit design
  brief with token specs + reject list, not a cleverer prompt.
- Generate → name the generic tells → regenerate sections with constraints.
  Refinement pass is where a page stops looking generic.
- 6 generic tells: mad-lib headline / centered hero+blob / 3-card icon row /
  flat spacing / uniform radius / empower-unlock-transform copy.
- De-slop spec: name real font pairs, token-based color, structural layout
  description, one orchestrated motion spec, real product assets.

Working brief + reject list: `docs/uiux/LANDING_DESIGN_BRIEF.md`.
Critique pass on the 3 boards is recorded per board below.

## Critique pass results (round 3)

| Board | Reject list | 6 tells | "Could be another app's landing?" | Fixes applied |
|-------|------------|---------|-----------------------------------|---------------|
| A — Sổ tay | clean | borderline tell 3 (pain row, mitigated by strikethrough) | no — distinctive | stats row → handwriting margin-notes |
| B — Hội thoại | clean | tell 2 (centered hero) | no — voice-native only fits speaking products | hero → asymmetric 2-col (copy left, chat demo right) |
| C — Edu-warm | clean | — | borderline yes (generic edtech feel) | kept as baseline for contrast |

## GitHub design repos (round-4 research)

Curated from GitHub search — repos chuyên web design/UIUX, sắp theo giá trị
cho task này:

### DESIGN.md format & collections (quan trọng nhất)

| Repo | ★ | Giá trị |
|------|---|---------|
| google-labs-code/design.md | 28k | Format spec chuẩn (Google Stitch): YAML front-matter tokens + prose rationale + `npx @google/design.md lint` kiểm tra WCAG contrast |
| VoltAgent/awesome-design-md | 119k | 73 DESIGN.md phân tích từ site thật (apple, linear, notion, elevenlabs, intercom, wise, airbnb…) — tokens + do's/don'ts đo được |
| bergside/awesome-design-skills | 3k | 67 DESIGN.md/SKILL.md cho agentic tools |

### Awesome lists / resource indexes

| Repo | ★ | Giá trị |
|------|---|---------|
| goabstract/Awesome-Design-Tools | 41k | Tool index lớn nhất |
| alexpate/awesome-design-systems | 26k | Index design system công khai |
| gztchan/awesome-design | 17k | Resource toàn cầu |
| nicolesaidy/awesome-web-design | 2.7k | Web-design specific |
| emmabostian/design-inspiration | 1.2k | Website inspiration list |
| robinstickel/awesome-design-principles | 775 | Principles index |
| sturobson/Awesome-Design-Tokens | 1.3k | Design tokens |

### Principles → rules for AI

| Repo | ★ | Giá trị |
|------|---|---------|
| erikuus/good-ui | 240 | Refactoring UI book summary — rule list thực dụng |
| s0xDk/refactoring-ui-skill | 582 | Refactoring UI rules as agent skill |
| xiaopu-ai/web-design | 779 | Spec-first web-design skill (spec → code) |
| jgthms/web-design-in-4-minutes | 4.4k | Minimal web-design fundamentals |
| dickwu/apple-design-skill | 959 | Apple HIG rules for AI review |

### Design systems / reference impls

uswds/uswds (7.2k, gov standard) · figma/sds (Figma SDS) · primer/css (GitHub
Primer) · radix-ui/primitives (19k) · cosscom/coss (Cal.com DS)

### Landing/inspiration

nordicgiant2/awesome-landing-page (3.8k) · cruip templates (4.7k/4.5k) ·
INSANE0777/Awwwards-mcp (Awwwards MCP for agents)

## Key extractions from pulled DESIGN.md files

Six files pulled to `/tmp/designmd/{apple,airbnb,elevenlabs,intercom,notion,wise}/`.
Điểm chống lưu cho direction của mình:

- **ElevenLabs** (voice-AI!): off-white `#f5f5f5` + warm ink `#292524`, display
  serif **weight 300** là editorial signature, ink-pill CTA, pastel gradient orbs
  chỉ là atmosphere (không phải fill), `audio-waveform-card` + `voice-row` là
  component chính thức — waveform-as-UI là pattern có tiền lệ của sản phẩm voice.
- **Intercom**: cream canvas `#f5f1ec` ≈ paper của mình; charcoal làm system
  primary (CTA đen), accent cam chỉ cho sản phẩm AI; rhythm = product mockup
  cards làm payload mỗi section — chrome im để product là protagonist.
- **Notion**: navy hero + sticky-note dots + pastel feature tiles; button 8px
  (KHÔNG pill) — sober geometry; real workspace mockup card trong hero.
- **Wise**: lime-green `#9fe870` CTA pill trên sage canvas `#e8ebe6`, display
  weight 900, radius 24px làm signature — gần nhất với hướng "ấm + green" của mình.
- **Airbnb**: một accent Rausch `#ff385c` dùng rất ít, type modest weight,
  radius là ngôn ngữ (pill search orb, 14px cards), photo làm visual weight.
- **Apple**: (đã đo trước — 56px/600, `#0066cc` chỉ cho action, tile dividers).

Pattern chung của cả 6: canvas ấm/neutral + MỘT accent có nghĩa + type pairing
có signature weight + component đặc thù ngành (waveform/voice row cho voice AI,
converter card cho fintech) + product UI thật trong hero.

## Constraints retained

Vietnamese-first chrome · honest evidence (no fake testimonials/results) ·
no mascots/gamification (project non-goal) · real copy only.
