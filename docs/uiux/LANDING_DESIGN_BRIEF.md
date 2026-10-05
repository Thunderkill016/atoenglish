# Landing Design Brief — AtoEnglish

Brief chuẩn theo workflow AI-design research (meez.design, superdesign.dev,
Anthropic artifacts-builder guidance): brief này là input bắt buộc cho mọi
visual pass; bất kỳ output nào vi phạm reject list = reject, không cần xem tiếp.

## Product truth (không được bóp méo)

- Đối tượng chính: người Việt **mất gốc / ngại nói**, không phải dev hay designer.
- Promise thật: 28 ngày × 10–15 phút → một bài nói thực tế (giới thiệu bản thân,
  công việc). Open Beta. **Mục tiêu học tập, không cam kết kết quả.**
- Chrome = tiếng Việt; English = nội dung học, phải đóng khung phân biệt được.
- Method cốt lõi: shadowing + roleplay + phản hồi phát âm + FSRS + CEFR.
- Non-goals: mascot, XP/streak theater, leaderboard, gamification, AI-tutor hype.

## Reject list (AI-slop bans)

- ✗ Gradient tím/indigo/violet bất kỳ dạng nào
- ✗ Hero centered với blob/glow mờ phía sau
- ✗ Row đúng 3 feature card + emoji/thin-line icon
- ✗ Font Inter mặc định không pairing
- ✗ Bo góc 8px đồng nhất cho mọi thứ (radius phải là ngôn ngữ)
- ✗ Soft blurred shadow trên mọi card (elevation phải có hierarchy)
- ✗ Copy "empower / unlock / transform / elevate / supercharge"
- ✗ Icon trừu tượng thay vì product UI thật
- ✗ Testimonial/stats fake (project rule: honest evidence only)

## Type system

- VI chrome: **Be Vietnam Pro** — weight ladder 400/600/800, tracking -0.02em @≥32px
- EN learning content: **Georgia italic** — phân biệt ngôn ngữ học bằng typeface
- Annotation/accent: **Caveat** (chỉ cho handwritten notes, không cho UI text)
- Scale: 13 / 16 / 19 / 28 / 40 / 60 · section title ≥34px, body 16–17px

## Color system

- Paper/ink neutral base — KHÔNG dùng gray lạnh generic
- Một accent xanh lá (voice/progress family `#12b76a`–`#2f9e44`) = "đi tiếp/nói",
  dùng có chủ đích, không rải đều
- Đỏ `#e05545` chỉ cho annotation/gạch vấn đề — không dùng cho button

## Layout grammar

- Max width 880–1040px; section padding ≥72px desktop
- Section divider = ý nghĩa (băng keo, waveform, lề đỏ, chip strip) — không phải
  đường kẻ default
- Rhythm phải có nhịp: hero → pain → method → proof → faq → final
- Mỗi section một "điểm nhấn chữ ký" gắn với identity direction

## Motion spec

- Một entrance orchestrated duy nhất (staggered fade-up ≤80ms gaps)
- Waveform/check animate on scroll vào viewport
- Prefers-reduced-motion: tắt hết, hiện trạng thái cuối

## Direction systems (mỗi cái là một identity, không phải theme)

| | A — Sổ tay luyện nói | B — Hội thoại | C — Education-warm |
|---|---|---|---|
| Metaphor | Cuốn sổ luyện tập VN | Tin nhắn voice | Khóa học thân thiện |
| Chữ ký | Giấy kẻ + lề đỏ + băng keo + viết tay | Bubble chat + waveform + mic | Chip strip + nút chunky border 2px |
| EN framing | Marker highlight + serif italic | Voice-message bubble + waveform | Card trắng shadow dưới |
| Anxiety lever | "Sổ của riêng bạn" — private | "Không ai nghe trừ bạn" | CTA chồng, cam kết thấp |
| Risk | Quá cute nếu lạm dụng Caveat | Chat-UI dễ nhìn như support-widget | Gần Duolingo, ít độc bản |

## Critique loop (bắt buộc sau mỗi render)

1. Chấm board bằng reject list — vi phạm → fix hoặc reject.
2. Chấm 6 generic tells — ≥2 tells → regen section đó.
3. Hỏi: "cái này có thể là landing của app nào khác không?" — nếu có, chưa xong.
4. Đối chiếu product truth — câu nào không đúng sự thật → viết lại.
