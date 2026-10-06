# Ghi chú nghiên cứu — eJOY, Trancy và 39 repo tham khảo

Ngày 2026-10-06. Nguồn: nhánh `research/ejoy-archive-2026-10-06` (commit `aa2d6678`), file `research-support.zip` ghép từ 9 phần. Gói gồm báo cáo sản phẩm eJOY (`ejoy-product-research/bao-cao-ejoy.md`), hồ sơ Trancy (`github-research/TRANCY.md`, `trancy/official-pages.md`) và nghiên cứu tĩnh 39 repo (`github-research/BAO-CAO.md`, `DANH-MUC-REPO.md`, `SCOPE.md`).

## Giới hạn bằng chứng

- eJOY và Trancy: nghiên cứu tài liệu công khai (website, help center, cửa hàng ứng dụng); **chưa cài, chưa dùng thử**. Trancy không có mã nguồn công khai để xác minh.
- **Cập nhật cùng ngày**: Trancy sau đó đã được khảo sát xác thực (đăng nhập Learning Center, đọc gói extension, bắt API live, 36 ảnh chụp) — xem [TRANCY-DEEP-DIVE.md](./TRANCY-DEEP-DIVE.md). Quyết định chủ dự án: **Trancy là chuẩn duy nhất**; eJOY chỉ còn vai trò tham khảo.
- 39 repo: nghiên cứu **tĩnh** — đã lập chỉ mục ~27.000 blob (~1,83 GB) nhưng chỉ khoảng 56 file được đọc ngữ nghĩa thủ công; **không build, không chạy repo nào**.
- Vì vậy gói này là **chuẩn sản phẩm và bằng chứng thiết kế** (mức "market/product evidence" trong `SOURCE_OF_TRUTH.md`), không phải bằng chứng học tập của AtoEnglish.

## Chuẩn sản phẩm rút ra từ eJOY và Trancy

Vòng học chung của hai sản phẩm: **chọn nội dung → hiểu tại chỗ (phụ đề song ngữ, tra từ, giải thích AI) → lưu từ/câu kèm ngữ cảnh → luyện nghe/nói trên chính video → ôn lặp lại ngắt quãng → dùng lại**. Ba điểm báo cáo eJOY khuyên học: giảm thao tác từ nội dung đến bài học; giữ ngữ cảnh; nối đầu vào với thực hành. Trancy bổ sung: ghép phụ đề thành câu trước khi dịch, chế độ đọc, phân tích ngữ pháp câu, lưu câu riêng với lưu từ, Practice Mode. Bảng đối chiếu từng tính năng và quyết định: [SPEC.md §2](./SPEC.md).

Căn cứ phương pháp (theo báo cáo eJOY): phân tích gộp 2022 (34 nghiên cứu) ghi nhận video có phụ đề giúp học từ, phụ đề cùng ngôn ngữ lời nói tác động lớn nhất → cho phép chế độ "chỉ EN" và "ẩn phụ đề", không mặc định song ngữ là tối ưu. Kim & Webb 2022 (48 thí nghiệm) ghi nhận ôn ngắt quãng có tác động trung bình–lớn → giữ FSRS nhưng không tuyên bố thuật toán tự nó vượt trội.

## Bản đồ repo → phần việc

Chỉ liệt kê repo hữu ích trực tiếp cho từng phần; danh mục đủ 39 repo nằm ở `DANH-MUC-REPO.md` trong gói.

| Phần | Việc                                  | Repo tham khảo                                                                                                                                              | Giấy phép → cách dùng                                                                               |
| ---- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | Chuỗi lấy phụ đề YouTube phía server  | `Talljack/echo-type` (player client iOS → Android → watch page → timedtext list, ngân sách 6 request)                                                       | MIT → được tham khảo mã, ghi nguồn khi mượn                                                         |
| 1    | Ghép câu từ `asr` `json3`             | `mengxi-ream/read-frog` (`parseScrollingAsrSubtitles` + test); `Nitrino/easysubs` (end từ `tOffsetMs`); `TideSparrow/shadowing-english` (cache ASR theo từ) | read-frog GPL-3.0 → chỉ ý tưởng; easysubs, shadowing-english MIT                                    |
| 1    | Render phụ đề chọn được, phụ đề kép   | `rsimmons/subadub`, `gmertes/NflxMultiSubs`, `asbplayer/asbplayer`                                                                                          | subadub, NflxMultiSubs MIT; asbplayer AGPL → chỉ ý tưởng                                            |
| 1, 4 | Lặp câu, shadowing, timestamp editor  | `TideSparrow/shadowing-english`, `xiaoshuangsu/dictation-shadowing-tool`, `Oliviaviaviavia/english-trainer`                                                 | shadowing-english, english-trainer MIT; dictation-shadowing-tool chưa có LICENSE root → chỉ ý tưởng |
| 2    | Song ngữ theo câu bằng LLM            | `lexweave-hq/lexweave` (compile bằng LLM, render xác định), `read-frog`                                                                                     | lexweave Apache-2.0; read-frog GPL → chỉ ý tưởng                                                    |
| 2    | Popup tra từ, nhiều nguồn từ điển     | `Nitrino/easysubs`, `pnlpal/dictionariez`, `FreeLanguageTools/vocabsieve`                                                                                   | easysubs MIT; dictionariez GPL-2.0, vocabsieve GPL-3.0 → chỉ ý tưởng                                |
| 3    | Một từ – nhiều ngữ cảnh               | `zeeguu/api` (`UserWord` mang lịch ôn, `Bookmark` mỗi lần gặp kèm nguồn, câu, vị trí token)                                                                 | MIT                                                                                                 |
| 3    | Trạng thái từ, tô sáng từ đã biết/lưu | `LuteOrg/lute-v3`, `word-hunter/word-hunter`, `simjanos-dev/LinguaCafe`                                                                                     | lute-v3 MIT; word-hunter chưa xác nhận, LinguaCafe GPL → chỉ ý tưởng                                |
| 3    | Thẻ có câu + mốc giờ từ video         | `asbplayer` (`exportCard`), `knowclip/knowclip`                                                                                                             | AGPL → chỉ ý tưởng                                                                                  |
| 4    | So khớp lời nói ↔ transcript          | `english-trainer` (khi không có Azure chỉ so transcript), `pstepanovum/Cadence`                                                                             | MIT; Cadence cho thấy điểm âm vị 96/48 là quy ước, không phải xác suất → không chấm phát âm         |
| 5    | FSRS trong ứng dụng web               | `echo-type` (`ts-fsrs`, `accuracyToRating` ngưỡng 50/70/90), `google/bespoke` (SRS đa kỹ năng trong ngữ cảnh)                                               | MIT; Apache-2.0                                                                                     |
| 5    | Bài tập AI dùng từ đã lưu             | `pretzelai/openlingo` (Next.js + Better Auth + Postgres, SM-2), `baturyilmaz/wordpecker-app`                                                                | MIT                                                                                                 |
| 6    | Thư viện nội dung theo chủ đề         | `usemoslinux/aprelendo`, `LinguaCafe`                                                                                                                       | GPL → chỉ ý tưởng                                                                                   |

Quy tắc chung: chỉ mượn mã từ repo MIT/Apache-2.0/Unlicense, ghi nguồn trong comment và PR; repo GPL/AGPL/chưa rõ giấy phép chỉ dùng làm ý tưởng. `mLearn` (Sustainable Use License) và `openkoto` (Apache + điều kiện riêng) không mượn mã.

**Đọc sâu code thật** (cùng ngày, reading-packets): kỹ thuật cụ thể trích từng repo — parser ASR, PO Token, FSRS helpers, model bookmark, CSS Highlight, similarity, dictation blanking, prompt agent — xem [TECH-KNOWLEDGE.md](./TECH-KNOWLEDGE.md). §9 của file đó liệt kê các thay đổi đề xuất cho SPEC/TASK_CONTRACT.

## Kiểm chứng kỹ thuật của mission này (06/10)

Một lần thử trên một video công khai từ IP dân dụng (không phải từ Cloudflare Worker):

- `youtubei/v1/player` client Android trả `OK`, có track EN do người đăng tạo và EN `asr`; `translationLanguages` có `vi`.
- `baseUrl` có sẵn `fmt=srv3`; nối thêm `&fmt=json3` vẫn nhận XML → phải **thay** `fmt`.
- `asr` `json3` có thời gian từng từ (`segs[].tOffsetMs`) và cắt giữa câu → cần ghép câu (SPEC §4.3).
- `tlang=vi` (YouTube tự dịch) trả 429 ngay lần đầu → không dựa vào nó; dịch bằng Gemini theo câu.

Chưa kiểm chứng: hành vi khi gọi từ IP của Cloudflare Worker (phần 1 bắt buộc kiểm tra live).

## Những gì không lấy

- Quota Free/Premium, gói trả phí, Game Center, chỉ số Fluency/Difficulty, streak — phạm vi đã đóng.
- AI Subtitle bằng Whisper (phải tải âm thanh), AITalk / AI Speaking World, chấm phát âm.
- Extension, Netflix, dịch web/PDF — chỉ web và YouTube cho tới khi vòng học được kiểm chứng.
