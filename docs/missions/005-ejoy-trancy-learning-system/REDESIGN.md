# Thiết kế lại AtoEnglish theo Trancy (chọn lọc)

Ngày 2026-10-06. Dựa trên [TRANCY-DEEP-DIVE.md](./TRANCY-DEEP-DIVE.md) + 36 ảnh chụp live (`/tmp/trancy-research/live/shots/`). Spec sản phẩm: [SPEC.md](./SPEC.md). Tài liệu này chỉ nói **thiết kế giao diện & tương tác** — data model/API đã có trong SPEC.

Nguyên tắc chủ đạo: **học bố cục và tương tác quan sát được ở Trancy, đối chiếu nhiều sản phẩm rồi điều chỉnh cho AtoEnglish**. Bỏ paywall, extension, mở rộng 40 route và theme tối bắt buộc. AtoEnglish giữ 6 route đích đã chốt trong SPEC §3. Quan sát một sản phẩm đang hoạt động không chứng minh hiệu quả học hoặc usability; yêu cầu owner mới và tiêu chí hiện hành ở §9.

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
| `/practice/<id>`                                         | `/watch/[videoId]`                                           | thích nghi cơ chế T1–T3, theo §9                                |
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
- Câu đang phát: nền vàng-mờ + viền trái accent; từ đã lưu: gạch chân accent (Trancy dùng underline mảnh — cần kiểm tra độ đọc trên cả light/dark).

### 4.2 Type & nhịp

- Transcript: EN 17–20px/1.55, VI 14–15px/1.5 muted; chỉnh cỡ bằng `=`/`-` (tham chiếu Trancy).
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

### 5.2 `/watch/[videoId]` — màn chính (tham chiếu `practice.png`, thích nghi theo §9)

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
- Tab rail: **Phụ đề** | **Từ** (từ đã lưu trong video này — học ý "gather useful words") | **Luyện** (chọn dạng bài trên câu).
- `WordDrawer`: IPA khi có + loại + nghĩa vi (curated trước) → khối AI (phân tích ngữ cảnh, gắn nhãn "AI") + "Câu khác trong video chứa từ này" + link từ điển ngoài + [Lưu] [Đã biết] — thích nghi T2/T13.
- Empty state phụ đề: 3 nút — "Lấy phụ đề" / "Dán hoặc tải file" / "Đọc không đồng bộ" (SPEC §4.2).

### 5.3 `/read`

- Vùng dán văn bản → chế độ đọc: câu EN đậm + VI mờ toggle, click từ → cùng `WordDrawer`, lưu từ/câu chung pipeline. Tối giản như Read Mode.

### 5.4 `/library`

- Tab: **Video** (đã xem + đang dở + đã lưu: thumb, % xem, số từ lưu — học meta "Watch Later") · **Từ** (bảng như `vocabulary.png`: từ + IPA + loại + nghĩa + nguồn video + trạng thái star/master + lọc Đang học/Đã thuộc/Theo ngày) · **Câu** (câu + dịch + nguồn + phát lại đoạn `?t=`).
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


## 9. Thiết kế chọn lọc sau khảo sát đa sản phẩm — 06/10/2026

Yêu cầu owner mới: hiểu dự án trước, học Trancy cùng nhiều sản phẩm/repo để cải thiện, không cứ copy giống họ. Mục này cập nhật những chi tiết mô phỏng trong §1–§7; SPEC vẫn quyết định scope/data model. Căn cứ và packet nghiệm thu UX/DATA/LEARN nằm trong [RESEARCH-NOTES.md](./RESEARCH-NOTES.md); mã và giấy phép tại [TECH-KNOWLEDGE.md §10](./TECH-KNOWLEDGE.md).

### Home và thanh phải

- Giữ một document scroll cho cả feed và sidebar. Không `overflow-y-auto`/height cố định riêng từng cột. Sidebar không sticky nếu nội dung cao hơn viewport. Mobile chuyển thành phần xếp dọc; không thêm thanh kéo để cố giữ bố cục tham chiếu.
- Khi mới vào: dán link và chọn video là hành động chính. Khi đã có nguồn: đưa tiếp tục xem lên trước. Khi queue ôn có thật: thêm số từ/câu đến hạn và “Ôn ngay”. Loading, chưa có thẻ, không có thẻ đến hạn và lỗi dữ liệu là bốn trạng thái khác nhau.
- Lịch tuần phục vụ định hướng thời gian; ngày được đánh dấu phải dựa trên event thật. `content_sources.updated_at` chỉ cho biết lần cập nhật gần nhất mỗi nguồn, không dựng được lịch sử học đầy đủ.
- Theo sửa đổi trực tiếp của owner (06–07/10), giữ Flashcard, thống kê, Activity và Progress trên home. Count cá nhân chưa kết nối hiển thị “—” kèm trạng thái; dữ liệu lỗi khác dữ liệu thật bằng 0. Từ/câu đã lưu lấy count thật sau slice 3. Không thêm PDF (ngoài scope), target 0/10, mascot/upsell hoặc đường biểu đồ giả.
- Activity/Progress vẫn có nơi xem ở sidebar home theo yêu cầu owner. Khi chưa có event/attempt thật, khung lịch/biểu đồ giữ vị trí cùng trạng thái chưa có dữ liệu; không tô ngày từ resume snapshots. /me chưa phải nơi thay thế cho thống kê home.
- Navigation chỉ điều hướng tới màn hoạt động; route dự kiến thiếu thì thể hiện chưa khả dụng, không đưa người dùng qua đăng nhập rồi gặp 404.

### Search và tra từ nhanh — owner correction 07/10

- Một launcher search gọn cạnh nút Tra từ. Ctrl/⌘ K mở modal có duy nhất một ô nhập: từ khóa tìm video/kênh trong catalog, link/ID YouTube mở video. Không thêm ô search thứ hai bên dưới.
- Sau đối chiếu ảnh 07/10: ô nhập nằm ngay trên cùng, bỏ tiêu đề nhìn thấy và nút submit dư. Mặc định khám phá Kênh; gõ từ khóa chuyển Video, xoá từ khóa trở về Kênh. Tab gạch chân; chủ đề ở cột phải desktop và hai hàng gọn trên 320px. Một scroller cho toàn modal.
- Kênh dùng ảnh video đại diện trong catalog, không giả ảnh avatar chính thức/subscriber. Video có thumbnail và metadata gọn. Chọn kênh lọc đúng channel, không kéo video của kênh khác cùng chủ đề; query/chủ đề/reset đồng bộ với thư viện. Chỉ hiện liên kết xem toàn bộ khi preview chưa đủ.
- Đầu home giữ search/tra từ và h1 cho screen reader; video xuất hiện sớm hơn. Bộ lọc chung hàng khi đủ chỗ. Sidebar giảm padding và đưa Flashcard/thống kê trước thông báo tiến trình xem, giữ Activity/Progress và trạng thái dữ liệu thật.
- Nút “Hiện nghĩa Việt” ở hàng tiêu đề thư viện (icon gọn trên mobile) và trong search dùng chung trạng thái bật/tắt. Mặc định ẩn; khi bật, nghĩa Việt nằm dưới tiêu đề Anh, không thay tên kênh hoặc video ID. 18 nghĩa biên soạn sẵn trong catalog; tìm kiếm Anh/Việt không dấu hoạt động cả khi ẩn. Xoá bộ lọc không xoá lựa chọn hiển thị; lựa chọn chỉ giữ trong phiên trang hiện tại. Video ngoài catalog chưa có dịch tiêu đề tự động.
- Ctrl/⌘ D mở drawer tra từ riêng: từ/cụm, phiên âm/ví dụ có sẵn, nghĩa Việt. Từ điển curated chạy local; miss rõ. AI chỉ chạy khi bấm nút, có câu ngữ cảnh tùy chọn; kết quả gắn nhãn AI, không ghi schedule hoặc giả lưu thẻ.
- Khi modal mở: khóa root/body, một scroller trong bảng; Esc đóng ngay, Tab/Shift+Tab giữ trong modal, đóng trả focus về launcher. Không chồng search/dictionary modal.

### Player, tra cứu và đọc

- Theater: player và transcript chia cột, chỉ transcript cuộn dọc trong viewport; document không có thanh thứ hai. Read: transcript chảy theo document, không scroll lồng. Drawer thay vùng bên cạnh hoặc là dialog mobile; không thêm một cột cuộn cạnh transcript vẫn hoạt động.
- Triển khai player local 07/10: iframe 100% trong khung responsive, video 16:9 căn giữa với vùng caption riêng; desktop theater giới hạn theo viewport, transcript là scroller duy nhất. Mobile/read dùng cuộn document. Header lấy tên/kênh từ transcript hoặc catalog; slider tua không ép phát, chuyển mode giữ player/time. Manual wheel/touch/scrollbar/keyboard tắt follow; nút “Theo câu đang phát” bật lại và chỉ cuộn rail. Lấy phụ đề vẫn là thao tác rõ của người học; song ngữ/contextual lookup chưa triển khai trong lượt bố cục này.
- Tra từ giữ câu/đoạn đang học, pause nếu cần và không tự phát lại khi đóng. Drawer mở ngắn: từ/cụm, nghĩa phù hợp câu, nguồn nghĩa, nghe lại câu, Lưu. Định nghĩa khác/IPA/ví dụ/AI mở dần, không chen trước nhiệm vụ chính.
- Từ đã lưu và câu đang phát cần hai dấu hiệu riêng, không chỉ dựa màu. Tự đánh dấu đã biết là ghi nhận của người học, không nhãn “đã thuộc” khách quan.
- Timestamp/seek, token lookup và save là các nút độc lập có tên truy cập; không lồng button. Có thao tác chạm và keyboard thay hover/right-click. Đóng drawer trả focus về từ đã mở; Esc và hotkeys không chiếm input đang gõ.
- Manual scroll tạm ngưng follow; nút “Theo câu đang phát” bật lại. Dịch phải bám cùng câu/version. Cache AI giữ sentence context, prompt/model version và ngôn ngữ; source EN vẫn dùng được khi AI lỗi.
- `sid` text hash và heartbeat của Trancy ở §7 là tham khảo kỹ thuật, không hợp đồng của ta. Không dùng text hash làm khóa duy nhất cho lần gặp, không áp cadence 3s nếu chưa cần. Resume snapshot và lịch sử ngày học có mục đích khác nhau.

### Một đường học để nghiệm thu trước

Chọn video → chọn câu → tra/lưu có nguồn → mở lại đúng câu trong library → chép nghe → ôn khi đến hạn. Dùng primitive hiện có (Sentence, curated gloss, iframe, FSRS adapter); không dựng app mới hoặc thêm 6 màn rỗng để hoàn thành inventory. Áp các tiêu chí UX-1…LEARN-2 trong RESEARCH-NOTES; typecheck, tests và browser thật cần đi cùng từng thay đổi code. Deploy/migration dữ liệu thật có quyết định riêng.

### Contextual watch lookup implemented locally — 07/10

The later lookup increment supersedes the earlier layout-only limitation: caption and transcript words now open the same dictionary drawer; timestamp remains a separate seek button. One source section (original sentence/title/time/replay) and the labelled meaning appear before the editable form. Opening pauses; closing retains pause and returns word focus; replay is explicit. Phrase mode uses first/last word buttons within one sentence, supports reverse order, no hover-only or drag-only action. No button nesting, fabricated untimed replay, automatic AI request, automatic save or translated replacement of source text. Native modal locks background root/body so only its content scrolls. Slice-2 aligned VI translation and later save/library/review remain separate unfinished work.

### Watch translation controls — 07/10/2026

Reuse the existing subtitle rail and caption area (natural height after the reading-layout correction below). One native selector chooses Anh+Việt / Anh / Việt / hidden; original word lookup remains available only when EN is shown, independent timestamps remain replay controls. Device model creation is an explicit click/download, followed by automatic translation of available English captions. Label this quick machine translation and explain its idiom/name limitation; it is not the chosen quality engine. Progress shows translated/total cues, errors keep source intact, retries are explicit, unsupported browsers show a clear state. Mobile retains document scrolling; theater retains the rail scroller. Server AI is visible only when explicitly configured and signed in, never an implicit fallback. No premium/credit purchase UX added.


### Khoảng cách phụ đề và bản đọc — owner correction 07/10/2026

- Các từ tra cứu dùng đúng khoảng trắng trong nguồn; không thêm padding ngang từng từ. Hover/focus và tô từ theo thời gian vẫn hoạt động, không thay câu hoặc timestamp.
- Phụ đề đang phát: khối chữ tối đa 60ch, căn giữa, ngắt dòng cân bằng khi trình duyệt hỗ trợ. Anh 16px mobile / 18px desktop, Việt 15px / 16px; line-height 1.5, gap Anh–Việt 8px, padding dọc 16px. Đây là lựa chọn bố cục cần đánh giá với người học, không phải giới hạn ký tự hay tốc độ đọc bắt buộc.
- Bỏ clamp hai dòng và chiều cao cố định khiến cuối câu mất khỏi màn hình. Khối caption lấy chiều cao tự nhiên; video desktop co trong phần còn lại của grid và áp sát caption. Mobile giữ viewport YouTube tối thiểu 200px, nội dung đi theo document. Không thêm scroller cho caption.
- Rail: Anh 16px, Việt 15px, line-height 1.65, mỗi cặp cách 8px. Read: căn trái, tối đa 68ch, Anh 18px / Việt 16px khi đủ chiều rộng; mỗi cặp câu thành đoạn rõ. Timestamp/nghe lại độc lập, source EN vẫn tra từ/cụm được.
- Nghiệm thu kỹ thuật: mọi rect chữ của câu mẫu dài phải nằm trong vùng caption, không chồng slider, không cuộn ngang; spacing override phải giữ chữ đọc được. Desktop theater chỉ rail cuộn; read/mobile chỉ document. Nguồn/model/cache không thay đổi. Mẫu bố cục không chứng minh kết quả học hay chất lượng dịch.
