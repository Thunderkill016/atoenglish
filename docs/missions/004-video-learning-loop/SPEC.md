# Spec 004 — Hệ thống học mới của AtoEnglish (v2, thay hệ cũ)

Ngày 2026-10-06. Ngôn ngữ spec: tiếng Việt; code/schema: tiếng Anh. Hướng sản phẩm: `docs/project/PROJECT_STATE.md`. Hợp đồng: [TASK_CONTRACT.md](./TASK_CONTRACT.md). Căn cứ nghiên cứu: [RESEARCH-NOTES.md](./RESEARCH-NOTES.md).

**Thay đổi so với v1 (06/10, PR #233):** chủ dự án nói rõ muốn **một hệ thống học mới thay hẳn hệ hiện tại**, không chỉ nối thêm vòng video vào hệ cũ. Vì vậy spec này mô tả toàn bộ hệ thống mới, kế hoạch gỡ hệ cũ theo giai đoạn, và vẫn giữ `/watch` là lát cắt đầu tiên.

## 1. Nguyên lý

1. **Học từ nội dung thật người học tự chọn** (video YouTube trước; văn bản dán vào sau). Không có giáo trình cố định A0–B2, không xếp trình độ đầu vào.
2. **Năm đối tượng tách rời** (kết luận của báo cáo): nguồn nội dung → câu + timestamp → cụm từ kèm ngữ cảnh → thẻ + lịch ôn → kết quả từng lần luyện. Scheduler chỉ nhận kết quả luyện. AI chỉ đọc dữ liệu học qua server action có kiểm soát, không ghi vào lịch.
3. **Một thẻ, nhiều ngữ cảnh**: cùng một cụm từ gặp ở hai video là hai lần gặp trên cùng một thẻ; không gộp mất ngữ cảnh, không tạo hai lịch ôn.
4. **Trung thực về nghĩa và về bằng chứng**: không bịa nghĩa; AI gắn nhãn AI; độ khớp transcript không gọi là chấm phát âm; số thẻ, thời gian dùng, streak không phải tiến bộ.
5. **Miễn phí vận hành**: mọi bước đều có đường chạy không cần API trả phí (phụ đề có sẵn, Web Speech API của trình duyệt, từ điển curated); Gemini qua AI Gateway là lớp bổ sung, hỏng thì vẫn học được.

## 2. Bề mặt sản phẩm mới

| Route      | Việc người học làm                                                         | Thay cho                                                                 |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/watch`   | Dán link YouTube → xem với transcript đồng bộ → bấm từ/cụm để tra và lưu   | — (mới)                                                                  |
| `/read`    | Dán văn bản → đọc, tra, lưu cùng cơ chế với `/watch`                       | `/read` hiện có (giữ, nối vào mô hình dữ liệu mới)                       |
| `/library` | Nguồn đã xem/đọc, cụm đã lưu (lọc theo nguồn), xoá dữ liệu của mình        | `/roadmap`, `/learn`                                                     |
| `/review`  | Hàng đợi FSRS; mỗi thẻ có nhiều dạng luyện (mục 5); nút "xem lại đoạn gốc" | `/review` hiện có (viết lại trên thẻ mới), `/quiz`                       |
| `/me`      | Tiến độ theo bằng chứng (mục 6), cài đặt, xoá tài khoản/dữ liệu            | `/me/progress`, `/me/grammar`, `/placement`, `/checkpoint`, `/zero-path` |

Điều hướng chính chỉ còn: Xem · Đọc · Ôn · Thư viện · Tôi.

## 3. Hành trình lát cắt đầu tiên (`/watch`)

1. Dán link (`watch?v=`, `youtu.be/`, `/shorts/`, `/live/`, `/embed/`; từ chối host giả) → video phát bằng IFrame Player API chính thức.
2. Bấm "Lấy phụ đề" (hành động rõ ràng của người học) → server lấy theo chuỗi ở mục 4. Hiện loại track (người đăng / tự động, ngôn ngữ). Nếu lỗi: thông báo rõ, vẫn xem được video, luôn hiện lựa chọn dán/tải `.srt`/`.vtt`.
3. Dòng đang phát tô sáng, tự cuộn; bấm dòng để tua; lặp dòng; tốc độ 0.75×/0.5×; ẩn/hiện transcript để luyện nghe trước.
4. Bấm từ hoặc kéo chọn cụm → nghĩa theo thứ tự: từ điển curated (`gloss.ts`, spine) → giải thích AI theo câu (nhãn "AI", cache theo cụm + hash câu) → "chưa có nghĩa". Người học sửa được nghĩa trước khi lưu.
5. Lưu → tạo/nối vào thẻ (mục 7) kèm câu gốc, vị trí token, nguồn, mốc giờ.

## 4. Lấy phụ đề (quyết định chủ dự án 06/10/2026)

Điều khoản YouTube cấm truy cập tự động và tải nội dung không được phép; `captions.download` chỉ dùng được khi có quyền sửa video. Chủ dự án đã xem và **chọn tự lấy phụ đề như eJOY GO**, chấp nhận rủi ro. Chuỗi nguồn (theo mô tả của echo-type, chưa được AtoEnglish chạy thử — xem RESEARCH-NOTES mục 4):

| Thứ tự | Nguồn                                                                                               | Ghi chú                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1      | Player metadata (`/youtubei/v1/player`, client iOS rồi Android) → `captionTracks` → tải `fmt=json3` | Ưu tiên: track tiếng Anh do người đăng tạo → tiếng Anh tự động (asr) → track khác do người đăng tạo |
| 2      | `captionTracks` nhúng trong trang watch                                                             | Khi bước 1 không có track dùng được                                                                 |
| 3      | `/api/timedtext?type=list` → dựng URL track → `json3`                                               | Khi 1–2 rỗng                                                                                        |
| 4      | Người học dán/tải `.srt`/`.vtt`/văn bản có mốc giờ                                                  | Luôn hiển thị; dùng khi 1–3 lỗi, không có phụ đề, hoặc bị chặn                                      |
| 5      | Văn bản thường                                                                                      | Chỉ đọc, không đồng bộ                                                                              |

Ràng buộc kỹ thuật:

- Một interface duy nhất `fetchYoutubeCaptions(videoId, preferredLang)` trong `src/lib/video/`, nhận `fetch` và `delay` tiêm vào để test bằng fixture; mỗi lần gọi có **ngân sách 6 request** cho toàn chuỗi; backoff 300/600/1200 ms chỉ khi lỗi mạng/403/429/5xx; phản hồi rỗng chuyển bước ngay; abort dừng hẳn.
- Rate limit theo người học (Upstash đã có). Cache transcript theo (người học, video); không lấy lại khi đã có.
- Không tải video/âm thanh, không quét hàng loạt, không chia sẻ lại; chỉ lưu văn bản phụ đề.
- Lỗi trả về ổn định (`invalid_url` / `no_captions` / `blocked` / `error`), không lộ nội dung upstream. Đếm kết quả thành công / thất bại / fallback trong `pilot_events` để thấy khi YouTube đổi.
- Rủi ro riêng của Cloudflare Worker: IP egress có thể bị YouTube chặn bot. Khi tỷ lệ `blocked` cao, fallback là đường chính; không thêm proxy trả phí nếu chủ dự án chưa quyết.

## 5. Ôn và dùng lại (`/review`)

Một thẻ có một lịch FSRS (`ts-fsrs`, đã có) nhưng nhiều **dạng luyện**; mỗi lượt luyện tạo một `practice_attempts`. Dạng luyện chọn theo trạng thái thẻ:

| Dạng           | Mô tả                                                                                                                   | Kết quả ghi                                          | Mức hỗ trợ                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------- |
| `recall`       | Thấy câu gốc có chỗ trống + nghĩa tiếng Việt → tự nhớ → lật → tự chấm Again/Hard/Good/Easy                              | rating → FSRS                                        | supported (có nghĩa gợi ý) |
| `listen_fill`  | Nghe lại đoạn gốc (IFrame seek + play đoạn), gõ cụm còn thiếu; so sánh chuẩn hoá                                        | đúng/sai → rating tự động (sai = Again, đúng = Good) | independent                |
| `speak_repeat` | Nói lại câu gốc; Web Speech API trả transcript; hiện độ khớp từ. **Nhãn: "độ khớp nhận dạng, không phải điểm phát âm"** | độ khớp; không đổi FSRS                              | supported                  |
| `write_reuse`  | Cuối phiên: viết một câu dùng cụm trong tình huống mới; Gemini phản hồi nếu có (nhãn AI; lỗi AI không chặn lưu)         | câu viết + phản hồi; không đổi FSRS                  | independent                |

Quy tắc: thẻ ở trạng thái `New/Learning` chỉ dùng `recall`; từ `Review` trở đi xen `listen_fill`; `write_reuse` tối đa một lượt/phiên; `speak_repeat` là tuỳ chọn, chỉ hiện khi trình duyệt hỗ trợ. Nút "xem lại đoạn gốc" mở `/watch?v=…&t=…`.

## 6. Bằng chứng tiến bộ (`/me`)

Hiển thị bốn mức, mỗi mức có mẫu số:

1. **Gặp** — số cụm đã lưu (chỉ là phơi nhiễm, ghi rõ không phải tiến bộ).
2. **Làm được có hỗ trợ** — `recall` Good/Easy khi đến hạn / số thẻ thực sự đến hạn.
3. **Làm được độc lập** — `listen_fill` đúng và `write_reuse` đã nộp / số thẻ đủ điều kiện.
4. **Nhớ sau khoảng cách** — tỷ lệ Good/Easy ở các lượt có khoảng cách ≥ 7 ngày.

Mức "tương tác thật ngoài đời" không đo được trong sản phẩm → không hiển thị, không tuyên bố. Không CEFR/band.

## 7. Mô hình dữ liệu

Tất cả bảng mới: `user_id → neon_auth.user(id) on delete cascade`, RLS chỉ chủ sở hữu theo mẫu `learner_known_words`; chỉ thêm migration, không sửa dữ liệu cũ.

| Bảng                  | Trường chính                                                                                                                                                                                                                        | Ghi chú                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `content_sources`     | user_id, kind (`youtube` \| `text`), external_id (11 ký tự khi youtube), title, created_at; unique (user_id, kind, external_id)                                                                                                     | Nguồn nội dung                                  |
| `content_transcripts` | source_id, origin (`youtube_manual` \| `youtube_auto` \| `learner_upload` \| `learner_paste` \| `plain_text`), language, lines jsonb `[{i, start_ms, end_ms, text}]` (giới hạn kích thước/số dòng), version, created_at             | Câu + timestamp                                 |
| `expression_cards`    | user_id, key (lemma hoặc cụm chuẩn hoá), display, meaning_vi, meaning_origin (`dictionary` \| `ai` \| `learner`), các trường FSRS (state, stability, difficulty, due, reps, lapses, last_review), created_at; unique (user_id, key) | Thẻ + lịch ôn                                   |
| `saved_expressions`   | user_id, card_id, source_id, line_index, token_start, token_count, source_sentence, start_ms, end_ms, created_at; unique (user_id, source_id, line_index, token_start)                                                              | Lần gặp kèm ngữ cảnh (kiểu Bookmark của Zeeguu) |
| `practice_attempts`   | user_id, card_id, mode (`recall` \| `listen_fill` \| `speak_repeat` \| `write_reuse`), rating (nullable), correct (nullable), learner_text, ai_feedback (nullable), interval_days_before, fsrs_before/after jsonb, created_at       | Kết quả từng lần luyện                          |

Liên hệ với bảng cũ: `cards` không mở rộng (dedupe theo lemma, không có nguồn); khi gỡ `/review` cũ, cung cấp một lần nhập `cards` → `expression_cards` (không ngữ cảnh, giữ FSRS) nếu chủ dự án muốn giữ lịch ôn cũ. `learner_known_words` giữ nguyên vai trò tự đánh dấu, không thành bằng chứng.

## 8. Tái sử dụng code hiện có

- `src/lib/read/tokenize.ts`, `src/lib/vocab/lemma.ts`: tách từ/lemma cho dòng transcript và văn bản.
- `src/lib/read/gloss.ts` + spine `atoenglish-content`: lớp nghĩa curated.
- `src/lib/srs/fsrs.ts`: lập lịch; `due-queue.ts` viết lại để đọc `expression_cards`.
- `src/lib/ai/gemini.ts`: nghĩa theo ngữ cảnh và phản hồi câu viết; timeout, giới hạn lượt, lỗi không chặn.
- `src/lib/speech.ts`: Web Speech API cho `speak_repeat`.
- Rate limit Upstash, auth Neon, mẫu server action + Zod trong `cards.ts`.

## 9. Gỡ hệ cũ theo giai đoạn

| Giai đoạn       | Việc làm                                                                                                                                                                                                                                                                                                                                                                                         | Điều kiện                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| A — song song   | Xây `/watch`, dữ liệu mới, `/review` mới. Route cũ vẫn chạy nhưng bỏ khỏi điều hướng chính                                                                                                                                                                                                                                                                                                       | Lát cắt 1–3 của hợp đồng                                           |
| B — gỡ route/UI | Xoá `/learn/**`, `/checkpoint/**`, `/placement`, `/roadmap`, `/zero-path`, `/quiz`, `/me/grammar`, `/me/pronunciation`, `/me/speaking/{roleplay,phoneme,journal}`, `/me/writing/**` (nội dung dùng lại chuyển vào `write_reuse`), trình phát bài học 5 pha, dữ liệu units trong `src/lib`; sửa landing/metadata/manifest hết chữ IELTS; điều chỉnh `test:content-standard` theo nội dung còn lại | Hoàng đã dùng vòng mới trên video thật ≥ 1 tuần và chủ dự án duyệt |
| C — dọn dữ liệu | Giữ bảng `user_progress`, `lesson_history`, `learning_attempts`, `zero_path_*`, `cards` (không xoá dữ liệu người học); đánh dấu bảng không còn ghi; cân nhắc drop ở migration riêng sau                                                                                                                                                                                                          | Quyết định riêng của chủ dự án                                     |

Không bao giờ: xoá bảng dữ liệu cũ trong cùng PR gỡ UI; đổi stack; gỡ auth/RLS.

## 10. Bảo mật và quyền riêng tư

- Transcript và văn bản dán là đầu vào không đáng tin: render text, không HTML; giới hạn kích thước; không coi là chỉ dẫn cho AI.
- Gửi AI chỉ câu chứa cụm cần giải thích hoặc câu người học viết; không gửi toàn transcript.
- Chỉ lưu ID video và văn bản phụ đề; không lưu hay tải media.
- Người học xoá được từng nguồn, transcript, thẻ và toàn bộ dữ liệu của mình.

## 11. Quyết định đã có / còn mở

Đã quyết (chủ dự án, 06/10): thay hẳn hệ cũ; học qua video/phim; một người học kiểm chứng, kiến trúc nhiều người; không thu phí; tự lấy phụ đề như eJOY GO với fallback.

Còn mở:

1. Nhập `cards` cũ sang `expression_cards` khi gỡ `/review` cũ, hay bỏ hẳn?
2. Thời điểm giai đoạn B (đề xuất: sau ≥ 1 tuần Hoàng dùng vòng mới).
3. Nhánh `docs/free-english-recovery-20261006` (hướng "0 → B2/C1 miễn phí") coi là nháp cũ và đóng?
