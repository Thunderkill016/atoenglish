# Spec 005 — Hệ thống học mới của AtoEnglish theo chuẩn Trancy

Ngày 2026-10-06. Ngôn ngữ spec: tiếng Việt; code/schema: tiếng Anh. Hướng sản phẩm: `docs/project/PROJECT_STATE.md`. Hợp đồng: [TASK_CONTRACT.md](./TASK_CONTRACT.md). Căn cứ nghiên cứu: [RESEARCH-NOTES.md](./RESEARCH-NOTES.md), [TRANCY-DEEP-DIVE.md](./TRANCY-DEEP-DIVE.md). Thiết kế giao diện/tương tác: [REDESIGN.md](./REDESIGN.md).

Spec này **viết lại từ đầu** theo quyết định của chủ dự án ngày 06/10: **Trancy** là quy chuẩn trải nghiệm duy nhất (đã khảo sát xác thực sâu — xem TRANCY-DEEP-DIVE); eJOY và **39 repo** trong gói nghiên cứu chỉ còn là nguồn tham khảo. Nó thay mission 004 (v1 trên `main`, v2 ở PR #234). Những phần đúng của 004 (chuỗi lấy phụ đề, tách năm đối tượng dữ liệu, kế hoạch gỡ hệ cũ) được giữ lại ở đây; phần còn thiếu so với Trancy được bổ sung.

## 1. Nguyên lý

1. **Chuẩn sản phẩm là Trancy**: mọi tính năng cốt lõi của Trancy (mục 2) phải có trong AtoEnglish, trừ khi bị loại có lý do ghi rõ (mục 2, cột "Quyết định"). eJOY chỉ là tham khảo bổ sung.
2. **Học từ nội dung thật người học tự chọn**: video YouTube (thư viện chọn sẵn hoặc dán link) và văn bản dán vào. Không có giáo trình cố định A0–B2, không xếp trình độ đầu vào.
3. **Câu là đơn vị trung tâm**: phụ đề được ghép thành câu hoàn chỉnh; dịch, tra, lưu, luyện đều theo câu (như "Intelligent Sentence Segmentation" của Trancy).
4. **Năm đối tượng tách rời**: nguồn nội dung → câu + timestamp (+ bản dịch) → mục đã lưu kèm ngữ cảnh → thẻ + lịch FSRS → kết quả từng lần luyện. Scheduler chỉ nhận kết quả luyện. AI chỉ đọc dữ liệu học qua server action có kiểm soát, không ghi vào lịch.
5. **Một thẻ, nhiều ngữ cảnh**: cùng một từ/cụm/câu gặp ở hai video là hai ngữ cảnh trên cùng một thẻ; không mất ngữ cảnh, không tạo hai lịch ôn.
6. **Trung thực**: không bịa nghĩa; mọi đầu ra AI (dịch, nghĩa theo ngữ cảnh, phân tích câu, phản hồi) gắn nhãn "AI"; độ khớp nhận dạng giọng nói không gọi là chấm phát âm; số mục đã lưu, số video đã xem, thời gian dùng không phải tiến bộ.
7. **Miễn phí, không giới hạn lượt**: không gói trả phí, không quota như eJOY/Trancy. Mọi bước có đường chạy không cần API trả phí; Gemini (qua AI Gateway) là lớp bổ sung, hỏng thì vẫn xem, tra curated, lưu và ôn được.

## 2. Đối chiếu tính năng Trancy (eJOY tham khảo) → AtoEnglish

| Tính năng                                         | eJOY                         | Trancy                           | Quyết định AtoEnglish                                                                 | Phần |
| ------------------------------------------------- | ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------------- | ---- |
| Phụ đề song ngữ trên video                        | Có                           | Có (AI Bilingual Subtitles)      | **Có** — EN + VI, bật/tắt từng dòng                                                   | 2    |
| Ghép phụ đề vụn thành câu                         | —                            | Có (Intelligent Segmentation)    | **Có** — xác định, có test fixture                                                    | 1    |
| Chế độ rạp / chế độ đọc                           | —                            | Theater Mode, Read Mode          | **Có**                                                                                | 1    |
| Lặp câu, giảm tốc, tự dừng sau câu, phím tắt      | Loop, Slow                   | Có                               | **Có**                                                                                | 1    |
| Tra từ / cụm từ ngay trên phụ đề                  | Có                           | AI Word Lookup                   | **Có** — curated → AI theo ngữ cảnh → "chưa có nghĩa"                                 | 2    |
| Phát âm từ (TTS), phiên âm                        | Có                           | Có                               | **Có** — Web Speech `speechSynthesis`; IPA khi có trong dữ liệu curated               | 2    |
| AI phân tích câu / ngữ pháp                       | AI giải thích                | AI Grammar Analysis              | **Có** — theo yêu cầu, nhãn AI, cache                                                 | 2    |
| Lưu từ/cụm kèm ngữ cảnh + mốc giờ                 | Có (wordbook)                | Wordbook                         | **Có**                                                                                | 3    |
| Lưu cả câu                                        | Lưu phụ đề                   | Saved sentences                  | **Có**                                                                                | 3    |
| Tô sáng từ đã lưu trong phụ đề                    | —                            | —                                | **Có** (từ word-hunter/LingQ-style; rẻ, hỗ trợ nhận lại)                              | 3    |
| Kho từ / Learning Center                          | WordBank                     | Learning Center                  | **Có** — `/library`                                                                   | 3    |
| Nghe chép chính tả theo câu                       | Active Listening             | Practice Mode                    | **Có**                                                                                | 4    |
| Shadowing / nói lại lời nhân vật                  | Shadow, Role Play (video)    | AI Shadowing                     | **Có** — chỉ độ khớp nhận dạng, ghi rõ không phải điểm phát âm                        | 4    |
| Ôn theo lặp lại ngắt quãng                        | Game Center, nhắc ôn         | Flashcard Practice               | **Có** — FSRS (`ts-fsrs`), nhiều dạng luyện                                           | 5    |
| Viết dùng từ trong tình huống mới                 | Write                        | —                                | **Có** — `write_reuse`, phản hồi AI có nhãn                                           | 5    |
| Thư viện video chọn sẵn theo chủ đề/độ khó        | Có (lọc chủ đề/trình độ)     | —                                | **Có** — danh mục do chủ dự án chọn, độ khó là nhận định của người chọn               | 6    |
| Tìm video YouTube trong ứng dụng                  | YouTube Connect              | —                                | **Tuỳ chọn** — chỉ qua YouTube Data API chính thức nếu chủ dự án cấp API key (mục 11) | 6    |
| Dán văn bản để đọc, tra, lưu                      | Đọc tài liệu                 | Dịch web                         | **Có** — `/read` dùng chung cơ chế                                                    | 3    |
| Tạo phụ đề bằng AI từ âm thanh                    | —                            | AI Subtitle (Whisper)            | **Không** — phải tải âm thanh, trái ràng buộc YouTube                                 | —    |
| Netflix / nền tảng khác, dịch web toàn trang, PDF | Extension                    | Có                               | **Không** — chỉ web, chỉ YouTube; extension đóng tới khi vòng web được kiểm chứng     | —    |
| Hội thoại AI / chấm phát âm                       | AI Speaking World (Pro Plus) | AITalk, Pronunciation Assessment | **Không** — phạm vi đã đóng; chấm phát âm không đo trung thực được trên web miễn phí  | —    |
| Bài học giao tiếp có cấu trúc                     | Có (app)                     | —                                | **Không** — hệ thống mới không có giáo trình cố định                                  | —    |
| Gói Free/Pro, quota                               | Có                           | Có                               | **Không** — miễn phí, không giới hạn                                                  | —    |
| Chỉ số Fluency/Difficulty, game, streak           | Có                           | —                                | **Không** — thay bằng bằng chứng có mẫu số (mục 8)                                    | —    |

## 3. Bề mặt sản phẩm

| Route              | Người học làm gì                                                                                     | Thay cho                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/discover`        | Ô dán link YouTube; thư viện video chọn sẵn lọc theo chủ đề/thời lượng/độ khó; video đang xem dở     | `/learn`, `/roadmap` (trang chủ sau đăng nhập)                           |
| `/watch/[videoId]` | Xem với phụ đề song ngữ theo câu; tra, phân tích, lưu; chuyển sang luyện nghe chép/shadowing         | — (mới)                                                                  |
| `/read`            | Dán văn bản → đọc, tra, dịch câu, lưu cùng cơ chế với `/watch`                                       | `/read` hiện có (giữ, nối vào mô hình dữ liệu mới)                       |
| `/library`         | Video đã xem, từ/cụm đã lưu, câu đã lưu; lọc theo nguồn/loại; mở lại đúng đoạn; xoá dữ liệu của mình | `/review/cards`, `/review/hard`                                          |
| `/review`          | Hàng đợi FSRS; nhiều dạng luyện trên cùng thẻ; "xem lại đoạn gốc"                                    | `/review` hiện có (viết lại trên thẻ mới), `/quiz`                       |
| `/me`              | Bằng chứng tiến bộ (mục 8), cài đặt, xoá tài khoản/dữ liệu                                           | `/me/progress`, `/me/grammar`, `/placement`, `/checkpoint`, `/zero-path` |

Điều hướng chính: **Khám phá · Đọc · Ôn · Thư viện · Tôi** — trên desktop hiển thị dạng icon rail trái 56px theo REDESIGN §4.3. `/watch/[videoId]` mở từ Khám phá, Thư viện hoặc nút "xem lại đoạn gốc"; tham số `?t=<ms>` tua tới mốc giờ.

## 4. Trình phát và phụ đề (`/watch/[videoId]`)

Bố cục và tương tác chi tiết theo [REDESIGN.md](./REDESIGN.md) §5.2 (video trái + cột transcript phải, dict drawer trượt từ phải, dark-first).

### 4.1 Nhận link

Chấp nhận `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/live/`, `/embed/`, `m.youtube.com`, `music.youtube.com`; video ID đúng 11 ký tự `[A-Za-z0-9_-]`. Từ chối host giả (`youtube.com.evil.tld`, `notyoutube.com`) và URL không hợp lệ, không lưu gì. Phát video chỉ bằng **IFrame Player API chính thức**.

### 4.2 Lấy phụ đề (quyết định chủ dự án 06/10/2026)

Chỉ chạy khi người học bấm "Lấy phụ đề" hoặc mở video lần đầu bằng thao tác rõ ràng; đã có transcript thì không lấy lại. Chuỗi nguồn:

| Thứ tự | Nguồn                                                                                           | Ghi chú                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1      | Player metadata (`/youtubei/v1/player`, client iOS rồi Android) → `captionTracks` → tải `json3` | Ưu tiên track tiếng Anh do người đăng tạo → tiếng Anh tự động (`kind=asr`) → track EN khác |
| 2      | `captionTracks` nhúng trong trang watch                                                         | Khi bước 1 không có track dùng được                                                        |
| 3      | `/api/timedtext?type=list` → dựng URL track → `json3`                                           | Khi 1–2 rỗng                                                                               |
| 4      | Người học dán/tải `.srt`/`.vtt`/văn bản có mốc giờ                                              | Luôn hiển thị; dùng khi 1–3 lỗi, không có phụ đề, hoặc bị chặn                             |
| 5      | Văn bản thường                                                                                  | Chỉ đọc, không đồng bộ                                                                     |

Ràng buộc kỹ thuật:

- Một interface `fetchYoutubeCaptions(videoId, { fetch, delay, signal })` trong `src/lib/video/`, nhận `fetch`/`delay` tiêm vào để test bằng fixture.
- `baseUrl` của track đã có sẵn `fmt=srv3`: phải **thay** tham số `fmt` bằng `json3`, không nối thêm (đã kiểm chứng 06/10: nối thêm vẫn trả XML).
- **Ngân sách 6 request** upstream cho toàn chuỗi mỗi lần gọi; backoff 300/600/1200 ms chỉ khi lỗi mạng/403/429/5xx; phản hồi rỗng chuyển bước ngay; abort dừng hẳn.
- Lỗi trả về ổn định `invalid_url` / `no_captions` / `blocked` / `error`, không lộ nội dung upstream. Đếm thành công / thất bại / fallback trong `pilot_events` để thấy khi YouTube thay đổi.
- Rate limit theo người học bằng `src/lib/security/rate-limit.ts` hiện có. Không tải video/âm thanh, không quét hàng loạt, không chia sẻ lại; chỉ lưu văn bản phụ đề.
- Rủi ro riêng: IP egress của Cloudflare Worker có thể bị YouTube chặn. Phần 1 phải có một lần kiểm tra live từ Worker; nếu tỷ lệ `blocked` cao, fallback thành đường chính và báo chủ dự án — không tự thêm proxy trả phí.

### 4.3 Ghép câu (sentence segmentation)

Một hàm thuần `segmentTranscript(track) → Sentence[]` trong `src/lib/video/`, có phiên bản (`segmentation_version`) để có thể tính lại:

- **Track tự động (`asr`)**: `json3` có thời gian từng từ (`tStartMs` + `segs[].tOffsetMs`; event `aAppend` chỉ chứa `"\n"`). Dựng lại dòng từ với mốc tuyệt đối, bỏ event xuống dòng, rồi tách câu tại dấu kết câu (`.`, `?`, `!`); nếu không có dấu câu thì tách tại khoảng lặng ≥ 700 ms; luôn tách khi câu vượt 25 từ hoặc 12 giây. Giữ thời gian từng từ để tô sáng từ đang nói và để luyện chép chính tả.
- **Track người đăng / file người học**: gộp các cue liên tiếp chưa kết thúc bằng dấu kết câu, giới hạn 12 giây hoặc 40 từ; bỏ ký hiệu nhạc thuần (`[♪♪♪]`) khỏi danh sách câu luyện được nhưng vẫn hiển thị.
- Ngưỡng 700 ms / 25 từ / 12 s / 40 từ là **giá trị khởi đầu** cần hiệu chỉnh bằng fixture thật ở phần 1; mọi thay đổi ngưỡng tăng `segmentation_version`.
- Không dùng AI để thêm dấu câu ở bản đầu; chỉ cân nhắc khi fixture cho thấy track `asr` không dấu câu phổ biến.

Tham khảo: `read-frog` có `parseScrollingAsrSubtitles` kèm test cho đúng cấu trúc `json3` này (GPL-3.0 → **chỉ tham khảo ý tưởng**, không chép mã).

### 4.4 Điều khiển trình phát

- Câu đang phát tô sáng, tự cuộn; từ đang nói tô sáng khi có thời gian từng từ.
- Bấm câu để tua; lặp câu hiện tại; câu trước / câu sau; tốc độ 1× / 0.75× / 0.5×; **tự dừng sau mỗi câu** (bật/tắt).
- Phím tắt: `Space` phát/dừng, `A`/`D` câu trước/sau, `S` lặp câu, `R` tự dừng; có danh sách phím tắt, không chặn phím khi đang gõ vào ô nhập.
- **Chế độ rạp**: video lớn, phụ đề song ngữ dưới video, transcript bên cạnh (desktop) hoặc bên dưới (mobile).
- **Chế độ đọc**: video thu nhỏ, transcript hiển thị như văn bản liền mạch theo câu; tra/lưu giống chế độ rạp.
- Nhớ vị trí xem cuối (`last_position_ms`) để tiếp tục từ `/discover` / `/library`.

## 5. Song ngữ, tra cứu và phân tích AI

### 5.1 Phụ đề tiếng Việt

Thứ tự nguồn bản dịch, cho từng transcript:

1. **Track tiếng Việt do người đăng tạo** (nếu `captionTracks` có `vi` không phải `asr`) — căn theo thời gian vào câu EN; nhãn "Phụ đề tiếng Việt của video".
2. **Dịch máy bằng Gemini theo câu** — gửi danh sách câu đã ghép (chỉ văn bản, không gửi dữ liệu người học), theo lô, trả JSON `[{i, vi}]` kiểm bằng Zod; câu thiếu thì để trống, không bịa; nhãn "Dịch máy (AI)"; cache theo (transcript, `segmentation_version`, model).
3. Không có bản dịch → chỉ hiện EN, có thông báo.

Không phụ thuộc tham số `tlang=vi` (tự dịch của YouTube): kiểm chứng 06/10 trả **429** ngay lần gọi đầu. Có thể thử như nguồn phụ sau này nếu đo được ổn định.

Chế độ hiển thị: EN + VI / chỉ EN / chỉ VI / ẩn hết (nghe không phụ đề). Bản dịch chỉ dịch khi người học bật song ngữ (không dịch mọi video mở ra).

### 5.2 Tra từ / cụm từ

- Bấm một từ → popup: từ, phiên âm (nếu có), nút phát âm (`speechSynthesis`), nghĩa theo thứ tự: **từ điển curated** → **nghĩa theo ngữ cảnh do AI** (nhãn AI, chỉ gửi câu chứa từ) → "chưa có nghĩa". Người học sửa nghĩa trước khi lưu.
- Kéo chọn nhiều từ trong cùng câu → tra cụm (cùng thứ tự nguồn).
- Từ điển curated tách khỏi `UNIT_VOCABULARY` thành dữ liệu độc lập trước khi gỡ giáo trình; bổ sung từ spine `atoenglish-content`. Nguồn từ điển mở rộng (bộ dữ liệu EN–VI mở) là quyết định còn mở (mục 11) — cần kiểm tra giấy phép trước khi dùng.

### 5.3 Phân tích câu bằng AI

Nút "Phân tích" trên mỗi câu → Gemini trả JSON (Zod): bản dịch tự nhiên, cấu trúc câu (chủ ngữ / động từ chính / mệnh đề), 1–3 cụm từ đáng học kèm nghĩa, điểm ngữ pháp chính. Nhãn AI; cache theo (người học, hash câu, model); timeout và giới hạn lượt; lỗi AI hiển thị thông báo, không chặn xem/lưu.

### 5.4 Ranh giới AI

- Văn bản phụ đề và văn bản dán là **dữ liệu không đáng tin**: render như text, không HTML; đặt trong prompt dưới dạng dữ liệu có phân cách, không phải chỉ dẫn.
- Gửi AI tối thiểu: lô câu để dịch, hoặc một câu để tra/phân tích, hoặc câu người học viết. Không gửi lịch ôn, danh sách thẻ hay dữ liệu cá nhân khác.

## 6. Lưu và Thư viện

- Lưu **từ/cụm** từ popup tra cứu, hoặc **cả câu** bằng nút trên câu. Mỗi lần lưu tạo hoặc nối vào một `study_cards` theo (người học, loại, khoá chuẩn hoá) và thêm một `card_contexts` cho lần gặp này (câu gốc EN, bản dịch VI nếu có, vị trí token, nguồn, mốc giờ). Lưu lại đúng lần gặp đã lưu không tạo dòng mới.
- Khoá chuẩn hoá: từ → lemma (`src/lib/vocab/lemma.ts`); cụm → chữ thường, gộp khoảng trắng, bỏ dấu câu đầu/cuối; câu → chuỗi chuẩn hoá tương tự.
- Từ/cụm đã lưu được tô sáng trong mọi transcript của người học đó.
- `/library`: tab Video (tiến độ xem, số mục đã lưu, mở lại), tab Từ & cụm, tab Câu; lọc theo nguồn; mỗi mục có "xem lại đoạn gốc", sửa nghĩa, xoá; xoá một nguồn xoá transcript/bản dịch của nguồn đó nhưng giữ thẻ nếu còn ngữ cảnh khác.

## 7. Luyện trên video

Mở từ `/watch/[videoId]` (nút "Luyện"), chạy trên chính các câu của video:

| Dạng          | Cách làm                                                                                                                                           | Ghi nhận                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `dictation`   | Phát một câu (lặp được, giảm tốc được) → gõ lại → so sánh từng từ đã chuẩn hoá, hiện đúng/sai/thiếu; gợi ý mở chữ cái đầu (đếm số gợi ý); câu tiếp | Mỗi câu một `practice_attempts`: độ chính xác từ, số gợi ý, số lần nghe |
| `shadowing`   | Phát câu → người học nói theo → Web Speech API trả transcript → hiện độ khớp từ. **Nhãn: "Độ khớp nhận dạng, không phải điểm phát âm"**            | Độ khớp; không đổi FSRS                                                 |
| `speak_first` | (biến thể "nói lại lời nhân vật") Tắt tiếng câu, hiện phụ đề → người học nói trước → rồi nghe bản gốc để tự so                                     | Độ khớp; không đổi FSRS                                                 |

Chỉ hiện `shadowing`/`speak_first` khi trình duyệt hỗ trợ nhận dạng giọng nói; có thể ghi âm cục bộ (`MediaRecorder`) để nghe lại, **không tải lên**. Câu sai trong `dictation` có nút "Lưu câu này để ôn".

## 8. Ôn và dùng lại (`/review`)

Một thẻ có một lịch FSRS (`src/lib/srs/fsrs.ts`, `ts-fsrs`) nhưng nhiều dạng luyện; mỗi lượt tạo một `practice_attempts`.

| Dạng                 | Áp dụng cho | Mô tả                                                                                                    | Kết quả ghi                              |
| -------------------- | ----------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `recall`             | từ/cụm      | Câu gốc có chỗ trống + nghĩa VI → tự nhớ → lật → tự chấm Again/Hard/Good/Easy                            | rating → FSRS (mức "có hỗ trợ")          |
| `listen_fill`        | từ/cụm      | Nghe lại đoạn gốc (IFrame seek + phát đúng đoạn), gõ phần còn thiếu; so sánh chuẩn hoá                   | đúng → Good, sai → Again (mức "độc lập") |
| `sentence_dictation` | câu         | Nghe đoạn gốc, gõ lại cả câu; độ chính xác từ ≥ 90% không gợi ý → Good, có gợi ý → Hard, còn lại → Again | rating tự động                           |
| `sentence_meaning`   | câu         | Thấy bản VI → nói/gõ lại câu EN → lật xem câu gốc → tự chấm                                              | rating → FSRS                            |
| `speak_repeat`       | mọi thẻ     | Nói lại câu gốc; độ khớp nhận dạng có nhãn như mục 7                                                     | độ khớp; không đổi FSRS                  |
| `write_reuse`        | từ/cụm      | Cuối phiên, tối đa một lượt: viết câu mới dùng cụm; Gemini phản hồi nếu có (nhãn AI)                     | câu viết + phản hồi; không đổi FSRS      |

Quy tắc: thẻ `New/Learning` chỉ dùng `recall` (từ/cụm) hoặc `sentence_meaning` (câu); từ `Review` trở đi xen `listen_fill` / `sentence_dictation` khi nguồn là video. Ngưỡng 90% là giá trị khởi đầu, ghi trong code cùng lý do. Nút "xem lại đoạn gốc" mở `/watch/[videoId]?t=<start_ms>`.

## 9. Bằng chứng tiến bộ (`/me`)

Bốn mức, mỗi mức có mẫu số, không CEFR/band/XP/streak:

1. **Gặp** — số mục đã lưu và số video đã xem (ghi rõ: chỉ là phơi nhiễm).
2. **Làm được có hỗ trợ** — `recall`/`sentence_meaning` Good/Easy khi đến hạn ÷ số lượt thực sự đến hạn; `dictation` đúng nhưng có gợi ý ÷ số câu đã luyện.
3. **Làm được độc lập** — `listen_fill` đúng, `sentence_dictation`/`dictation` ≥ 90% không gợi ý, `write_reuse` đã nộp ÷ số lượt đủ điều kiện.
4. **Nhớ sau khoảng cách** — tỷ lệ Good/Easy ở các lượt có khoảng cách ≥ 7 ngày.

Mức "dùng được ngoài đời" không đo được trong sản phẩm → không hiển thị, không tuyên bố.

## 10. Khám phá (`/discover`)

- **Danh mục chọn sẵn** lưu dạng file dữ liệu trong repo (`src/content/catalog/videos.json`, kiểm bằng Zod + test): `videoId`, tiêu đề, kênh, chủ đề, thời lượng, loại phụ đề (`manual`/`asr`), **độ khó do người chọn gắn** (Dễ/Vừa/Khó, nhãn "theo người chọn"), ngày chọn. Không phải bảng DB, không crawl.
- Chủ dự án là người chọn video; phần 6 seed tối thiểu 30 video phủ ít nhất 5 chủ đề, mỗi video đã được mở thử trên `/watch` và có phụ đề tiếng Anh lấy được.
- Lọc theo chủ đề, thời lượng, độ khó; mục "Đang xem dở" từ `content_sources.last_position_ms`.
- **Tìm video YouTube trong app** (tuỳ chọn, mục 11): chỉ qua YouTube Data API v3 `search.list` chính thức với `type=video` và `videoCaption=closedCaption` (chỉ video có phụ đề do người đăng tạo); cần API key do chủ dự án cấp; giới hạn theo quota miễn phí của Google; không có key thì ẩn tính năng.

## 11. Mô hình dữ liệu

Tất cả bảng mới: `user_id → neon_auth.user(id) on delete cascade`, RLS chỉ chủ sở hữu theo mẫu `learner_known_words`; chỉ thêm migration, không sửa dữ liệu cũ; giới hạn kích thước cột jsonb.

| Bảng                      | Trường chính                                                                                                                                                                                                                                                                                    | Ghi chú                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `content_sources`         | user_id, kind (`youtube` \| `text`), external_id (11 ký tự khi youtube), title, channel, duration_ms, last_position_ms, created_at, updated_at; unique (user_id, kind, external_id)                                                                                                             | Nguồn nội dung                            |
| `content_transcripts`     | source_id, user_id, origin (`youtube_manual` \| `youtube_asr` \| `learner_upload` \| `learner_paste` \| `plain_text`), language, segmentation_version, sentences jsonb `[{i, start_ms, end_ms, text, words?}]`, created_at                                                                      | Câu + timestamp (+ thời gian từng từ)     |
| `transcript_translations` | transcript_id, user_id, language (`vi`), origin (`youtube_manual` \| `ai`), model (nullable), segmentation_version, lines jsonb `[{i, text}]`, created_at; unique (transcript_id, language, segmentation_version)                                                                               | Bản dịch theo câu                         |
| `ai_results`              | user_id, kind (`context_gloss` \| `sentence_analysis` \| `write_feedback`), input_hash, model, output jsonb, created_at; unique (user_id, kind, input_hash, model)                                                                                                                              | Cache đầu ra AI                           |
| `study_cards`             | user_id, kind (`word` \| `phrase` \| `sentence`), key, display, meaning_vi, meaning_origin (`dictionary` \| `ai` \| `youtube_vi` \| `learner`), FSRS (state, stability, difficulty, due, reps, lapses, last_review), created_at; unique (user_id, kind, key)                                    | Thẻ + lịch ôn                             |
| `card_contexts`           | user_id, card_id, source_id, sentence_index, token_start, token_count, sentence_text, sentence_vi, start_ms, end_ms, created_at; unique (user_id, card_id, source_id, sentence_index, token_start)                                                                                              | Một dòng / lần gặp (kiểu Bookmark Zeeguu) |
| `practice_attempts`       | user_id, card_id (nullable), source_id (nullable), sentence_index (nullable), mode, rating (nullable), correct (nullable), word_accuracy (nullable), hints_used, plays, similarity (nullable), learner_text, ai_result_id (nullable), interval_days_before, fsrs_before/after jsonb, created_at | Kết quả từng lần luyện                    |

Ràng buộc: `practice_attempts` phải có `card_id` hoặc (`source_id` + `sentence_index`). Liên hệ bảng cũ: `cards` không mở rộng (dedupe theo lemma, không có nguồn); có thể nhập một lần `cards` → `study_cards` (không ngữ cảnh, giữ FSRS) nếu chủ dự án muốn (mục 13). `learner_known_words` giữ vai trò tự đánh dấu, không thành bằng chứng.

## 12. Tái sử dụng code hiện có

- `src/lib/read/tokenize.ts`, `src/lib/vocab/lemma.ts`: tách từ/lemma cho câu transcript và văn bản.
- `src/lib/read/gloss.ts`: lớp nghĩa curated (tách dữ liệu khỏi `UNIT_VOCABULARY`).
- `src/lib/srs/fsrs.ts`: lập lịch (`ts-fsrs`); hàng đợi viết mới đọc `study_cards`.
- `src/lib/ai/gemini.ts` (`GEMINI_MODEL`, `geminiGenerateUrl` qua AI Gateway): dịch, nghĩa theo ngữ cảnh, phân tích câu, phản hồi câu viết.
- `src/lib/speech.ts`: Web Speech API cho shadowing.
- `src/lib/security/rate-limit.ts`, auth Neon, mẫu server action + Zod trong `src/app/actions/cards.ts`.

## 13. Gỡ hệ cũ theo giai đoạn

| Giai đoạn | Việc làm                                                                                                                                                                              | Điều kiện                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A         | Khi điều hướng mới ra mắt (phần 3 trở đi): bỏ các mục cũ khỏi điều hướng chính; route cũ vẫn chạy; không làm thêm gì cho hệ cũ                                                        | Cùng PR thêm điều hướng mới                                     |
| B         | PR riêng (phần 7): xoá route/UI/dữ liệu bài học cũ, `/discover` thành trang chủ sau đăng nhập, landing/metadata/manifest bỏ "IELTS", điều chỉnh `test:content-standard` và smoke test | Chủ dự án duyệt + Hoàng đã dùng vòng mới ≥ 1 tuần               |
| C         | Bảng dữ liệu người học cũ (`user_progress`, `lesson_history`, `learning_attempts`, `zero_path_*`, `cards`)                                                                            | **Không bao giờ** xoá trong cùng PR gỡ UI; chờ quyết định riêng |

## 14. Bảo mật và quyền riêng tư

- Transcript và văn bản dán là đầu vào không đáng tin: render text, không HTML; giới hạn kích thước và số câu; không coi là chỉ dẫn cho AI.
- Chỉ lưu ID video, metadata và văn bản phụ đề; không lưu hay tải media. Ghi âm shadowing chỉ ở trình duyệt.
- Người học xoá được từng nguồn, transcript, thẻ và toàn bộ dữ liệu của mình.
- Không ghi key/secret vào log; API key YouTube (nếu có) chỉ ở Worker secret.

## 15. Quyết định đã có / còn mở

Đã quyết (chủ dự án, 06/10): thay hẳn hệ cũ; chuẩn sản phẩm là **Trancy** (eJOY hạ xuống tham khảo); 39 repo là nguồn tham khảo kỹ thuật; viết spec mới thay 004; đưa vào phụ đề song ngữ + ghép câu, lưu câu + luyện trên video, AI phân tích câu + chế độ đọc, thư viện video gợi ý; chỉ web; một người học kiểm chứng, kiến trúc nhiều người; không thu phí; tự lấy phụ đề với fallback; đóng PR #232; duyệt thiết kế lại theo Trancy (REDESIGN.md — lấy layout/tương tác đã kiểm chứng, bỏ dark-only/paywall/chữ VI dịch máy/loãng route).

Còn mở:

1. Cấp YouTube Data API key (miễn phí, có quota) cho tìm video trong app và kiểm tra phụ đề khi chọn video? Không có key thì phần 6 chỉ có danh mục chọn sẵn.
2. Nguồn từ điển EN–VI mở rộng ngoài curated + AI (cần kiểm tra giấy phép), hay chỉ curated + AI?
3. Nhập `cards` cũ sang `study_cards` khi gỡ `/review` cũ, hay bỏ?
4. Thời điểm giai đoạn B (đề xuất: sau ≥ 1 tuần Hoàng dùng vòng mới).
5. Đóng PR #234 (spec 004 v2) vì đã được spec này thay?
