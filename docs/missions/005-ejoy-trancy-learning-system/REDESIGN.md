# Thiết kế lại AtoEnglish theo Trancy (chọn lọc)

Ngày 2026-10-06. Dựa trên [TRANCY-DEEP-DIVE.md](./TRANCY-DEEP-DIVE.md) + 36 ảnh chụp live (`/tmp/trancy-research/live/shots/`). Spec sản phẩm: [SPEC.md](./SPEC.md). Tài liệu này chỉ nói **thiết kế giao diện & tương tác** — data model/API đã có trong SPEC.

Nguyên tắc chủ đạo: **lấy bố cục và tương tác đã được Trancy kiểm chứng với người dùng thật, bỏ phần không hợp** (gian lận dịch thuật, paywall, extension, 40 route, tối bắt buộc). AtoEnglish giữ 6 route đã chốt trong SPEC §3.

## 1. Những gì Trancy làm tốt → lấy

| #   | Thiết kế Trancy                                                                                                | Bằng chứng                                 | Áp vào AtoEnglish                                       |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| T1  | **Cột phải chứa transcript** — video 2/3 trái, transcript cuộn 1/3 phải, câu đang phát tô vàng + auto-scroll   | `practice.png`, `practice-dict-drawer.png` | `/watch` — bố cục chính                                 |
| T2  | **Dict drawer trượt từ phải** — tra từ không rời màn hình; nội dung 2 tầng (dict tĩnh tức thì → AI stream sau) | drawer đã chụp                             | `/watch`, `/read` — cùng một `WordDrawer`               |
| T3  | **Mỗi câu một hàng**: timestamp + EN + VI + nút copy/lưu hover                                                 | `practice.png`                             | component `TranscriptLine`                              |
| T4  | Icon rail trái ~50px, icon-only, chấm active                                                                   | mọi shot                                   | Desktop shell — thay header ngang                       |
| T5  | Right rail widget: lịch hoạt động, thẻ ôn hôm nay, số đếm, hoạt động gần                                       | `home.png`                                 | `/discover` right rail                                  |
| T6  | Card grid nội dung: thumb 16:9 + badge thời lượng + kênh + thời gian + icon "có phụ đề"                        | `home.png`, `library.png`                  | `/discover`, `/library`                                 |
| T7  | Filter chips ngang (chủ đề) + segmented level                                                                  | `movie.png`, `talk-detail.png`             | `/discover`                                             |
| T8  | Dark theme tập trung, accent vàng-gold trên nền gần đen                                                        | mọi shot                                   | Mặt `/watch` dark-first                                 |
| T9  | Phím tắt A/S/D/Q/R/P cho điều hướng câu                                                                        | docs + code                                | `/watch`                                                |
| T10 | Empty state nhỏ gọn có CTA rõ                                                                                  | `saved.png`, `podcast.png`                 | mọi danh sách                                           |
| T11 | Session page tối giản: câu lớn giữa màn, panel phải = bối cảnh + vai + nhiệm vụ đánh số                        | `shadowing-session.png`                    | bài shadowing sau này                                   |
| T12 | Modal upgrade liệt kê quyền lợi dạng icon+dòng                                                                 | `premium-paywall.png`                      | pattern modal giới thiệu tính năng (không phải paywall) |
| T13 | "Ví dụ từ video · N" — các câu khác chứa từ trong chính video đang xem                                         | dict drawer                                | `WordDrawer`                                            |
| T14 | Đánh giá "bản dịch tốt/kém" từng câu                                                                           | practice                                   | feedback loop chất lượng dịch AI của ta                 |

## 2. Những gì Trancy làm KHÔNG hợp → bỏ/sửa

| #   | Vấn đề của Trancy                                                                                                                                                       | Bằng chứng                                          | Quyết định AtoEnglish                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| B1  | **Tiếng Việt dịch máy lỗi hàng loạt**: "CHÚNG TA" thay "US (giọng Mỹ)", "Bà" thay "Review", "Nắm Bắt" thay "Mastered", "Cao và độ cả" (Advanced garbled), "CEFRsáp lập" | `vocabulary.png`, `movie.png`, `flashcard-home.png` | Viết tay toàn bộ chữ Việt; đây là điểm ta thắng rõ                             |
| B2  | 40+ route loãng (movies, books, podcast, PDF, assessment, studio…)                                                                                                      | route map §5.1                                      | Giữ 6 route; mở rộng chỉ khi vòng học lõi được kiểm chứng                      |
| B3  | Paywall chen vào mọi nơi (modal, banner, "Nâng cấp để xem…", nags cài extension)                                                                                        | `premium-paywall.png`, practice page                | Miễn phí hoàn toàn — không upsell, không quota                                 |
| B4  | Dark-only                                                                                                                                                               | mọi shot                                            | `/watch` dark-first; app shell hỗ trợ light/dark qua token hiện có             |
| B5  | Mật độ chữ quá nhỏ, khó đọc transcript dài                                                                                                                              | `practice.png`                                      | Cỡ chữ transcript lớn hơn một bậc + chỉnh được (Trancy cũng có chỉnh cỡ — lấy) |
| B6  | Tròn trang trí (mascot tím, emoji rườm rà)                                                                                                                              | `home.png` upsell                                   | Tối giản hơn: icon thật, không mascot                                          |
| B7  | Phụ thuộc extension để "tải phụ đề nhanh hơn"                                                                                                                           | nag trong practice                                  | Fetch phụ đề server-side + fallback dán/tải file (SPEC §4.2)                   |
| B8  | Chỉ số khuyến khích mơ hồ (streak ngọn lửa, "0/10" ring không rõ nghĩa)                                                                                                 | `talk-detail.png`, `home.png`                       | Bằng chứng có mẫu số theo SPEC §8 (từ lưu/xuất hiện lại, câu chép đúng)        |
| B9  | Bug live: click wordbook crash SPA                                                                                                                                      | đã chụp lỗi                                         | Test e2e các flow lưu                                                          |
| B10 | Nội dung phim/câu gói không rõ nguồn, prompt zh sót trong data                                                                                                          | §5.8–5.9                                            | Nội dung curated của ta ghi rõ nguồn + giấy phép                               |

## 3. Bản đồ IA: Trancy → AtoEnglish

| Trancy                                                   | AtoEnglish                                                   | Ghi chú                                             |
| -------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `/home` (feed tổng)                                      | `/discover`                                                  | ô dán link + feed video curated + right rail ôn tập |
| `/practice/<id>`                                         | `/watch/[videoId]`                                           | bản sao bố cục T1–T3                                |
| `/youtube`, `/youtube/recommendations`                   | `/discover` (mục "Video mới từ kênh", "Khám phá kênh" — sau) | v1 chỉ thư viện curated                             |
| `/vocabulary` + `/review-vocabulary` + `/flashcard-home` | `/library` (tab Từ) + `/review`                              | tách "kho" và "ôn" giữ nguyên ý tưởng 2 mặt         |
| `/sentence`                                              | `/library` (tab Câu)                                         |                                                     |
| `/saved`, `/history`                                     | `/library` (tab Video)                                       |                                                     |
| `/sentence-shadowing`, `/movie`, `/podcast`              | —                                                            | defer                                               |
| `/talk-home`, `/topics`                                  | —                                                            | defer (AITalk)                                      |
| `/book-home`                                             | `/read` (dán văn bản; sách sau)                              |                                                     |
| `/settings`, `/advanced-ai`                              | `/me` (tab cài đặt)                                          |                                                     |
| Sidebar trái icon rail                                   | Shell desktop: icon rail                                     |                                                     |
| Right rail widgets                                       | `/discover` right rail                                       |                                                     |

## 4. Ngôn ngữ thiết kế

### 4.1 Theme

- **`/watch` + màn luyện tập: dark-first.** Nền `#0c0c0e`, surface `#151518`, border `#232327`, chữ `#e8e8ea`/`#9d9da6`, accent vàng-gold `#f5b50a` (chỉ cho trạng thái active/đang phát/CTA chính — không lạm dụng). Đây là vùng video — dark giúp tập trung như Trancy.
- **Shell còn lại**: giữ hệ token light/dark hiện có (`theme-provider` đã có), dark map gần bảng trên.
- Câu đang phát: nền vàng-mờ + viền trái accent; từ đã lưu: gạch chân accent (Trancy dùng underline mảnh — đã kiểm chứng đọc tốt trên cả light).

### 4.2 Type & nhịp

- Transcript: EN 17–20px/1.55, VI 14–15px/1.5 muted; chỉnh cỡ bằng `=`/`-` (copy Trancy).
- Timestamp 11px mono muted, canh trái câu.
- Card title 15px/2 dòng ellipsis; meta 12px.
- Spacing: transcript line padding-y 10–12px (thưáng hơn Trancy ~6px — B5).

### 4.3 Layout shells

- **Desktop**: icon rail trái 56px (logo + Khám phá/Đọc/Ôn/Thư viện/Tôi + theme toggle đáy), content tối đa ~1280px, right rail 300–340px khi ≥1180px.
- **Mobile**: rail → bottom nav hiện có; right rail → section xếp dọc; `/watch` transcript → tab "Phụ đề" dưới video.
- Không top header to trên desktop (Trancy bỏ hẳn — chỉ search bar nổi trong content).

## 5. Thiết kế từng màn

### 5.1 `/discover` (trang chủ sau đăng nhập)

```
┌ rail │  🔍 Tìm / Khám phá (Ctrl+K)  [dán link YouTube → ▶]
│      │  ▸ Đang xem dở                    │ right rail │
│      │  [thumb 16:9 xN — progress bar]   │  Lịch tuần │
│      │  ▸ Thư viện chọn sẵn             │  Ôn hôm nay│
│      │    chips: chủ đề · level · ≤10'   │   N từ, M câu
│      │    [card grid 3 cột]              │  [Luyện]   │
│      │  ▸ Video mới từ kênh (v2)         │  Hoạt động │
```

- Card video: thumb + badge `mm:ss` + chấm "có phụ đề" + tiêu đề + kênh + level chip.
- Right rail = T5: lịch 7 ngày, số thẻ đến hạn (nếu >0 → nút "Ôn ngay"), đang xem dở 1 mục.

### 5.2 `/watch/[videoId]` — màn chính (bản sao cấu trúc `practice.png`)

```
┌ rail │ ← Tiêu đề video · kênh            [Phiên âm AI][⤓][🔖][⚙][⛶]
│      │ ┌──────────────────────────────┐ │ ┌ transcript rail ────┐
│      │ │   YouTube iframe             │ │ │ 1:13  câu EN        │
│      │ │                              │ │ │       câu VI        │
│      │ │   câu EN đang phát (vàng)    │ │ │ 1:16  ...           │
│      │ │   câu VI                     │ │ │                     │
│      │ └──────────────────────────────┘ │ │                     │
│      │ [◀◀][◀][▶][▶][🔁][00:13/AB][⏵x]  │ │  tab: Phụ đề | Từ | Luyện
│      └──────────────────────────────────┘ └─────────────────────┘
                                WordDrawer (trượt phải khi click từ)
```

- Video: phụ đề overlay 2 dòng ngay dưới player (câu đang phát) — không đè lên video (Trancy đè trong Theater; ta chọn strip riêng cho rõ).
- Controls: prev câu / replay / play / next câu / lặp câu / tự dừng mỗi câu / AB / tốc độ. Phím: `A` `S` `D` `Q` `R` `Space` `Esc`.
- Transcript rail: mỗi hàng timestamp + EN + VI + (hover) copy/lưu câu/đánh giá dịch; click câu → seek; click từ → `WordDrawer`; từ đã lưu underline accent.
- Tab rail: **Phụ đề** | **Từ** (từ đã lưu trong video này — copy ý "gather useful words") | **Luyện** (chọn dạng bài trên câu).
- `WordDrawer`: IPA khi có + loại + nghĩa vi (curated trước) → khối AI (phân tích ngữ cảnh, gắn nhãn "AI") + "Câu khác trong video chứa từ này" + link từ điển ngoài + [Lưu] [Đã biết] — copy T2/T13.
- Empty state phụ đề: 3 nút — "Lấy phụ đề" / "Dán hoặc tải file" / "Đọc không đồng bộ" (SPEC §4.2).

### 5.3 `/read`

- Vùng dán văn bản → chế độ đọc: câu EN đậm + VI mờ toggle, click từ → cùng `WordDrawer`, lưu từ/câu chung pipeline. Tối giản như Read Mode.

### 5.4 `/library`

- Tab: **Video** (đã xem + đang dở + đã lưu: thumb, % xem, số từ lưu — copy "Watch Later" meta) · **Từ** (bảng như `vocabulary.png`: từ + IPA + loại + nghĩa + nguồn video + trạng thái star/master + lọc Đang học/Đã thuộc/Theo ngày) · **Câu** (câu + dịch + nguồn + phát lại đoạn `?t=`).
- Mở lại đúng đoạn: link `/watch/vid?t=ms`.

### 5.5 `/review`

- Header: số thẻ đến hạn hôm nay (mẫu số thật) → vào phiên.
- Phiên: card giữa màn (tối giản như shadowing-session — không rail), mặt trước = ngữ cảnh gốc (câu + có thể phát lại đoạn video `?t=`), lật = nghĩa/đáp án + 4 nút FSRS (Lại/Khó/Nhớ/Dễ) — tên nút tiếng Việt viết tay.
- Dạng bài: fill-in-blank, nghe chép, chọn nghĩa, shadowing (ghi âm + độ khớp, nhãn "không phải điểm phát âm").

### 5.6 `/me`

- Bằng chứng tiến bộ có mẫu số (SPEC §8): từ đã lưu & tái xuất hiện, câu chép đúng, phút xem, phiên ôn — không streak lửa.
- Cài đặt: theme, cỡ chữ transcript, TTS voice, xoá dữ liệu.

## 6. Component inventory (mới/đổi)

`IconRail` · `RightRail` (+ `WidgetCard`) · `SearchBar(Ctrl+K)` · `VideoCard` · `FilterChips` · `LevelSegment` · `PlayerControls` · `SubtitleOverlay` · `TranscriptRail` > `TranscriptLine` (+`WordToken`) · `WordDrawer` (2-tier: `DictBlock` + `AiBlock` nhãn AI) · `SaveStar` / `MasterToggle` · `SentenceRow` · `ProgressStrip` · `EmptyState` (đã có — tái dùng) · `SessionShell` (luyện tập tối giản) · `GradeButtons(4)` · `Paywall`-free `FeatureModal`.

## 7. Pattern dữ liệu/tương tác cần giữ (đã chốt trong deep-dive)

- `sid` = hash text câu — gộp ngữ cảnh cùng câu (SPEC đã có mô hình "một thẻ nhiều ngữ cảnh").
- Heartbeat tiến độ ~3s (`deltaDuration` + `dateKey`) → thống kê + resume.
- Sync `?updatedAt=` cho từ/câu khi cần đa thiết bị.
- Token NLP (lemma/pos) trên câu → click từ, điền chỗ trống theo loại, dedup lemma.
- Dict 2 tầng: curated tức thì → AI stream sau (nhãn AI), cache theo `lang_word`.

## 8. Phi mục tiêu thiết kế

Không: extension, Netflix/podcast/movie/books/PDF surfaces, AITalk, chấm phát âm, whisper, premium/quota UI, mascot/gamification, đa ngôn ngữ học, dark-only, đăng ký kênh YouTube. Tất cả đều có thể mở lại sau bằng cùng primitive (nội dung → câu → token → luyện).
