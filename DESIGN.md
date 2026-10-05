---
version: alpha
name: AtoEnglish — Trang sổ hội thoại
description: >-
  Sổ luyện nói cho người Việt mất gốc. Canvas là giấy sổ kem kẻ ngang với lề đỏ
  (`#faf6ee`); nội dung học bày như một cuộc hội thoại — tin nhắn xen kẽ,
  voice-message bubble mang waveform xanh lá. Ba tầng chữ: Plus Jakarta Sans cho
  chrome tiếng Việt, Georgia italic cho nội dung English (đóng khung highlight
  marker), Mali viết tay cho chú thích đỏ. Xanh lá `#25803a` mang nghĩa
  "nói / đi tiếp" trên mọi nền chứa chữ (đạt WCAG AA 4.97:1); `#2f9e44` sáng
  hơn chỉ cho waveform/checkbox/underline — đồ họa, không chứa chữ. Đỏ
  `#e05545` chỉ làm annotation, tuyệt đối không làm
  button. Card là giấy note dán băng keo nghiêng nhẹ; checklist có ô tick; số
  liệu viết như margin-note. Không mascot, không gamification, không gradient
  tím — sự thật học tập thay cho reward theater.

colors:
  primary: "#25803a"
  primary-bright: "#2f9e44"
  primary-deep: "#1b5c28"
  primary-tint: "#dcf2d9"
  secondary: "#6d6a60"
  tertiary: "#e05545"
  neutral: "#faf6ee"
  neutral-deep: "#f3eee1"
  surface: "#fffdf6"
  on-surface: "#2b2a26"
  ink: "#2b2a26"
  body: "#4a4840"
  muted-soft: "#a09a88"
  hairline: "#e2dccb"
  note-border: "#cfc7b0"
  tape: "rgba(210,200,170,0.5)"
  night: "#1c2a45"
  on-night: "#ffffff"
  on-night-soft: "#a8b4c9"
  error: "#b3261e"

typography:
  display:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 54px
    fontWeight: 800
    lineHeight: 1.07
    letterSpacing: -0.025em
  section-title:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 38px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  card-title:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  nav-link:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  label-caps:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 11px
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: 0.1em
  button:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: 0.01em
  en-content:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  annotation-hand:
    fontFamily: "Mali, cursive"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  margin-note:
    fontFamily: "Mali, cursive"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0

rounded:
  note: 4px
  card: 8px
  button: 10px
  input: 8px
  bubble: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 16px
  md: 20px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 84px

components:
  top-nav:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 60px
  wordmark:
    textColor: "{colors.ink}"
    typography: "{typography.annotation-hand}"
  day-label:
    textColor: "{colors.muted-soft}"
    typography: "{typography.label-caps}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-night}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: 12px 22px
  button-primary-active:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-night}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: 12px 22px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: 11px 21px
  notebook-page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
  ruled-hero:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: 88px
  chat-demo-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: 24px
  bubble-incoming:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.bubble}"
    padding: 13px 17px
  bubble-learner:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-night}"
    typography: "{typography.en-content}"
    rounded: "{rounded.bubble}"
    padding: 13px 17px
  voice-message:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.bubble}"
    padding: 12px 16px
  unit-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  pain-card:
    backgroundColor: "{colors.neutral-deep}"
    textColor: "{colors.ink}"
    typography: "{typography.card-title}"
    rounded: "{rounded.card}"
    padding: 22px
  checklist-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: 18px 22px
  lesson-note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.note}"
    padding: 24px 22px
  faq-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: 17px 22px
  final-band:
    backgroundColor: "{colors.night}"
    textColor: "{colors.on-night}"
    typography: "{typography.section-title}"
    rounded: "{rounded.card}"
    padding: 72px 48px
  band-sub:
    textColor: "{colors.on-night-soft}"
    typography: "{typography.body}"
  footer:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    padding: 30px 0
---

## Overview

AtoEnglish là **sổ luyện nói** — practice notebook, không phải game, không phải
feed mạng xã hội. Trang nhìn như một cuốn sổ bài tập mở ra: giấy kem kẻ ngang,
lề đỏ chạy dọc, chú thích viết tay bằng bút đỏ. Bên trong trang sổ, bài học hiện
ra như một **cuộc hội thoại voice**: tin nhắn của người hướng dẫn bên trái,
voice message có waveform của bản mẫu, câu trả lời của người học trong bubble
xanh bên phải.

Ba tầng chữ giữ nguyên tắc VI-chrome / EN-content: **Plus Jakarta Sans** cho
toàn bộ UI tiếng Việt; **Georgia italic** đóng khung nội dung English (câu mẫu,
transcript, highlight marker); **Mali** chỉ cho annotation viết tay — chú
thích lề, kicker, margin-note. Người đọc phân biệt được ngôn ngữ giao diện và
ngôn ngữ học mà không cần đọc.

Màu sắc có nghĩa vụ, không trang trí: **xanh lá** = "nói / đi tiếp / đúng" —
bubble người học, voice message, nút CTA, ô tick checklist, gạch chân
margin-note. **Đỏ** = annotation — lề giấy, kicker viết tay, gạch lỗi trong
pain-card. Không có accent thứ ba. Cam kết thiết kế của sản phẩm: honest
evidence, không mascot, không XP/streak/leaderboard, không gradient tím.

**Key characteristics:**

- Canvas giấy `{colors.neutral}` (#faf6ee) kẻ ngang 36px + lề đỏ `{colors.tertiary}` — notebook là nền, không phải trang trí.
- Chat demo card là hero payload: voice message + waveform + transcript serif + phản hồi — product UI thật, không illustration.
- `{component.lesson-note}` = giấy note dán băng keo (`{colors.tape}`), xoay ±0.7deg.
- Stats = margin-note Mali gạch chân xanh — số liệu viết tay vào lề sổ.
- `{component.final-band}` = tờ giấy navy dán băng keo, waveform trên đầu, nút mic.
- Section divider có nghĩa: dashed hairline (nép sổ) + chip marquee (curriculum thật A0→A2).

## Colors

### Canvas & surface

- **Paper** (`{colors.neutral}` — #faf6ee): nền trang. Ấm, kem — không phải gray lạnh.
- **Paper Deep** (`{colors.neutral-deep}` — #f3eee1): pain-cards, curriculum strip.
- **Bubble** (`{colors.surface}` — #fffdf6): giấy note, card, FAQ, bubble đến — trắng ấm trên nền kem.
- **Night** (`{colors.night}` — #1c2a45): duy nhất cho `{component.final-band}` — trang cuối sổ đậm.

### Text

- **Ink** (`{colors.ink}` — #2b2a26): display, heading, body-strong. Nâu-mực ấm, không đen thuần.
- **Body** (`{colors.body}` — #4a4840): chạy chữ.
- **Muted** (`{colors.secondary}` — #6d6a60): sub, meta, annotation phụ.
- **Muted Soft** (`{colors.muted-soft}` — #a09a88): label-caps, timestamp.

### Meaning colors

- **Primary** (`{colors.primary}` — #25803a): "nói / tiến bộ" — CTA, learner bubble, voice border, transcript link. **WCAG AA 4.97:1** trên surface/neutral — mọi nền xanh chứa chữ trắng dùng value này.
- **Primary Bright** (`{colors.primary-bright}` — #2f9e44): chỉ cho đồ họa — waveform bars, ô tick, gạch chân margin-note, play icon. Không bao giờ chứa chữ (3.45:1 — dưới AA text).
- **Primary Deep** (`{colors.primary-deep}` — #1b5c28): shadow đáy nút (`0 3px 0`), hover/press state.
- **Primary Tint** (`{colors.primary-tint}` — #dcf2d9): marker highlight sau chữ "nói được".
- **Annotation** (`{colors.tertiary}` — #e05545): lề đỏ, kicker Mali, gạch strikethrough vấn đề, marker trong FAQ. **Không bao giờ làm button** — đỏ là màu bút chữa, không phải màu hành động.

### Craft

- **Hairline** (`{colors.hairline}` — #e2dccb): viền card, dashed divider.
- **Note Border** (`{colors.note-border}` — #cfc7b0): dashed pain-card border.
- **Tape** (`{colors.tape}` — rgba(210,200,170,0.5)): băng keo dán note — pseudo-element, không phải icon.

## Typography

| Token | Size | Weight | Family | Use |
|-------|------|--------|--------|-----|
| `{typography.display}` | 54px | 800 | Plus Jakarta Sans | Hero h1, tracking -0.025em |
| `{typography.section-title}` | 38px | 800 | Plus Jakarta Sans | H2 section |
| `{typography.card-title}` | 17px | 700 | Plus Jakarta Sans | Card/row titles |
| `{typography.body}` | 16px | 400 | Plus Jakarta Sans | Body VI |
| `{typography.body-sm}` | 14–14.5px | 400 | Plus Jakarta Sans | Bubble, meta |
| `{typography.label-caps}` | 11–12px | 800 | Plus Jakarta Sans | Kicker latin, day-label |
| `{typography.button}` | 14px | 700 | Plus Jakarta Sans | CTA |
| `{typography.en-content}` | 16–18px | 400 italic | Georgia | Câu mẫu, transcript, quote EN |
| `{typography.annotation-hand}` | 20–26px | 700 | Mali | Kicker ✎/✗/✓/?, section hand-note, wordmark |
| `{typography.margin-note}` | 24px | 500 | Mali | Stat viết tay ở lề |

### Principles

- **Ngôn ngữ định font:** VI = Jakarta; EN học = Georgia italic; chú thích tay = Mali. Không trộn.
- *(Mali thay Caveat vì `next/font` Caveat không có subset `vietnamese` — chú thích viết tay cần hiển thị đúng dấu tiếng Việt.)*
- Mali chỉ ở annotation/kicker/margin-note/logo — **không bao giờ** trong UI text, button, label, paragraph.
- Display weight 800 với tracking âm — chữ lớn đứng được một mình, không cần gradient blob.
- Marker highlight (`{colors.primary-tint}` sau 55–96% chiều cao chữ) chỉ quanh từ-khóa outcome, vd "nói được".

## Layout

- **Container:** 1020px max, padding 28px; lề đỏ ở `50% − 540px`.
- **Section rhythm:** 84–92px top padding; hairline dashed chia section.
- **Hero:** 2 cột 1fr/1fr — copy trái (kicker Mali → h1 → sub → 2 CTA), chat-demo-card phải xoay +0.4deg.
- **Curriculum strip:** full-bleed marquee chip A0→A2, đứng yên khi reduced-motion.
- **Grids:** pains/notes 3-up → 1-up <840px; checklist/faq single-column ≤720px.

## Elevation & Depth

Paper-craft, không glassmorphism:

| Level | Treatment | Use |
|-------|-----------|-----|
| Page | ruled lines + margin line | hero canvas |
| Card | `0 8px 20px rgba(90,80,50,0.08)` + hairline | lesson-note |
| Hero payload | `0 14px 34px rgba(90,80,50,0.12)` + tape | chat-demo-card |
| Voice | `0 4px 12px rgba(47,158,68,0.14)` + accent border | voice-message |
| Button | `0 3px 0` màu đậm hơn — offset cứng, không blur | primary/secondary |
| Final | `0 18px 44px rgba(28,42,69,0.3)` | final-band |

Tape (`{colors.tape}`) là pseudo-element 22–28px cao, xoay ±2–4deg — không bao
giờ dùng shadow thay tape.

## Shapes

| Token | Value | Use |
|-------|-------|-----|
| `{rounded.note}` | 4px | lesson-note (giấy vuông) |
| `{rounded.card}` | 8px | pain/faq/demo/final |
| `{rounded.button}` | 10px | buttons, checklist-row |
| `{rounded.bubble}` | 16px | chat bubble — góc tail nhọn 5–6px về phía người nói |
| `{rounded.pill}` | 9999px | unit-chip, play button, voice icon |

Radius là ngôn ngữ: giấy sắc cạnh, thoại mềm, chip bo tròn.

## Components

> Schema note: component tokens chỉ hỗ trợ `backgroundColor / textColor /
> typography / rounded / padding / size / height / width`. Border, box-shadow
> và tape pseudo-elements được định nghĩa bằng prose dưới đây — chúng vẫn là
> normative, chỉ không nằm trong frontmatter.

**Border spec (prose-level):** `button-secondary`, `unit-chip`, `checklist-row`,
`faq-item` → `1–1.5px solid {colors.hairline}`; `pain-card` →
`1px dashed {colors.note-border}`; `voice-message` →
`1.5px solid {colors.primary}`. **Shadow spec:** `button-primary` →
`0 3px 0 {colors.primary-deep}`; `button-secondary` → `0 3px 0 {colors.hairline}`;
`chat-demo-card` → `0 14px 34px rgba(90,80,50,0.12)`; `lesson-note` →
`0 8px 20px rgba(90,80,50,0.08)`; `voice-message` →
`0 4px 12px rgba(47,158,68,0.14)`; `final-band` →
`0 18px 44px rgba(28,42,69,0.3)`. Tape: `{colors.tape}`, 22–28px cao,
rotate ±2–4deg.

### Navigation
`top-nav` — paper 92% + blur, dashed hairline đáy. Wordmark Mali 30px, chữ "E" đỏ annotation. Links Jakarta 14px/600.

### Hero — ruled page + chat demo
`ruled-hero`: kicker Mali đỏ → h1 54px → sub → `button-primary` + `button-secondary` + margin-note nhỏ "không cần tài khoản".
`chat-demo-card`: day-label caps → bubble-incoming → `voice-message` (play + waveform + transcript Georgia + duration) → bubble-learner → bubble phản hồi.

### Problem
`pain-card` × 3: tiêu đề `<s>` gạch đỏ 2px → mô tả → `.fix` Mali xanh "→ giải pháp". Vấn đề bị gạch như bút chữa, cách sửa viết tay.

### Method
`checklist-row` × 4: ô tick vuông bo 7px viền xanh + tên bước + label phase (input/processing/output/review — map đúng lesson-phase tokens trong globals.css) + mô tả 1 dòng.

### Lessons
`lesson-note` × 3: tape trên đỉnh, label-caps đỏ `Unit A0-N`, quote Georgia italic, mô tả, footer dashed `waveform + "luyện nói · N phút"`.

### Stats — margin notes
Số Mali đỏ + text mut, gạch chân xanh 2px — `28 ngày — một mục tiêu nói · 10–15' mỗi ngày · A0 theo CEFR · FSRS`.

### FAQ
`faq-item` details/summary: câu hỏi thật của người lo âu ("Mất gốc có học được không?"), `›` đỏ xoay.

### Final
`final-band` navy + tape × 2 + waveform xanh giữa → h2 trắng → sub `{colors.on-night-soft}` → `button-primary` size lớn kèm glyph mic.

## Do's and Don'ts

### Do

- Giữ EN content trong Georgia italic — kể cả trong bubble.
- Chỉ xanh lá cho "nói/đúng/tiến bộ"; chỉ đỏ cho annotation/gạch-sửa.
- Chat bubbles: tail nhọn về phía người nói (incoming: bottom-left 5px; learner: bottom-right).
- Curly-quote EN trong quote; VI giữ ngoặc thẳng.
- Honest footnote Mali: "mục tiêu học tập, không phải cam kết kết quả".
- prefers-reduced-motion: tắt marquee + tape rotation giữ nguyên (static craft).

### Don't

- ✗ Gradient tím/indigo/violet — reject list cứng.
- ✗ Mali cho UI text (button, nav, label, form).
- ✗ Đỏ cho CTA hoặc destructive action — đỏ là màu bút sửa.
- ✗ Mascot, XP bar, streak flame, confetti, leaderboard — non-goal của product.
- ✗ Testimonial/số liệu kết quả bịa — chỉ con số sản phẩm thật (28 ngày, 10–15').
- ✗ Glass blur card trên giấy — phá metaphor sổ tay.
- ✗ Centered hero + blob — hero phải có chat-demo payload.
- ✗ Waveform như decoration rải rác — waveform chỉ trong voice context.

## Responsive

| Breakpoint | Changes |
|------------|---------|
| <840px | hero-grid 1 cột (demo dưới copy), h1 36px, pains/notes 1-up, nav ẩn links, lề đỏ sát 10px |
| 840–1280px | full layout, container 1020px |

Touch targets: button ≥44px hiệu dụng; chip 34px+ padding ngang; FAQ summary full-row click.
