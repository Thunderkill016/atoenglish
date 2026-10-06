# Spec 004 — Video learning loop v1

> **Superseded 2026-10-06** by `docs/missions/005-ejoy-trancy-learning-system/` (owner: eJOY + Trancy as the product standard, new spec instead of amending 004). This document is historical reference only and does not authorize work.

Ngày 2026-10-06. Ngôn ngữ spec: tiếng Việt; code/schema: tiếng Anh. Hướng sản phẩm: `docs/project/PROJECT_STATE.md`. Hợp đồng: [TASK_CONTRACT.md](./TASK_CONTRACT.md).

## 1. Hành trình người học (lát cắt đầu tiên)

1. Vào `/watch`, dán link YouTube → video phát bằng trình phát nhúng chính thức (IFrame Player API).
2. Phụ đề: hệ thống tự lấy phụ đề YouTube đã công bố cho video (mục 2). Nếu lỗi hoặc không có: thông báo rõ, vẫn cho xem video, và cho dán văn bản có mốc thời gian / tải file `.srt`/`.vtt` / dán văn bản thường (chỉ đọc). Không tạo dữ liệu giả.
3. Xem: dòng đang phát được tô sáng và tự cuộn; bấm dòng để tua; lặp dòng; tốc độ 0.75×/0.5×.
4. Bấm từ hoặc chọn cụm từ → nghĩa tiếng Việt theo thứ tự: spine/từ điển hiện có → giải thích AI (gắn nhãn "AI", lưu cache) → "chưa có nghĩa".
5. Lưu: cụm từ + nghĩa (người học sửa được) + câu gốc + video + mốc thời gian.
6. Ôn (trong hàng đợi ôn hiện có): thấy câu gốc với chỗ trống/nghĩa tiếng Việt → tự nhớ → lật đáp án → tự chấm (Again/Hard/Good/Easy) → FSRS. Có nút "xem lại đoạn gốc".
7. Dùng lại: cuối phiên ôn, viết một câu dùng cụm từ trong tình huống mới; phản hồi AI (nếu có) chỉ là gợi ý, gắn nhãn AI.

## 2. Nguồn transcript (quyết định chủ dự án 06/10/2026)

Điều khoản YouTube cấm truy cập tự động/scraper và tải nội dung không được phép; `captions.download` chỉ dùng được khi có quyền sửa video. Chủ dự án đã xem hai điểm này và **chọn tự lấy phụ đề như eJOY GO**, chấp nhận rủi ro điều khoản và rủi ro endpoint bị đổi/chặn. Thứ tự nguồn:

| Thứ tự | Nguồn                                                                                                                    | Ghi chú                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Phụ đề YouTube đã công bố cho video (endpoint timed-text không chính thức, gọi từ Worker khi người học bấm "lấy phụ đề") | Ưu tiên track tiếng Anh do người đăng tạo, rồi track tự động (asr); hiện rõ loại track. Cache theo video + learner; không lấy lại nếu đã có. Rate limit theo user. |
| 2      | Người học dán/tải `.srt`/`.vtt`/văn bản có mốc thời gian                                                                 | Fallback khi bước 1 lỗi, không có phụ đề, hoặc bị chặn. Luôn hiển thị lựa chọn này.                                                                                |
| 3      | Văn bản thường không mốc thời gian                                                                                       | Chỉ đọc, không đồng bộ.                                                                                                                                            |

Giới hạn bắt buộc: không tải video/âm thanh; không quét hàng loạt; chỉ lưu văn bản phụ đề cho người học đã yêu cầu; không chia sẻ lại. Bộ phân tích đặt sau một interface duy nhất (`fetchYoutubeCaptions(videoId)`) với fixture ghi sẵn để khi YouTube đổi định dạng chỉ sửa một chỗ; đếm số lần lấy thất bại để thấy khi hỏng.

## 3. Dữ liệu (đề xuất, sẽ xác nhận ở bước plan)

Không mở rộng `cards`. Lý do: `saveCardToSRS` dừng khi lemma đã tồn tại, nên cùng một từ ở hai ngữ cảnh sẽ bị gộp; bảng cũng không có trường nguồn. Bảng mới đều có `user_id → neon_auth.user(id) on delete cascade` và RLS chỉ cho chủ sở hữu, theo mẫu `learner_known_words`.

- `video_sources`: user_id, provider (`youtube`), external_id (11 ký tự), title (tùy chọn), created_at; unique (user_id, provider, external_id).
- `video_transcripts`: video_source_id, origin (`youtube_manual` | `youtube_auto` | `learner_upload` | `learner_paste`), language, format, lines jsonb `[{start_ms, end_ms, text}]` với giới hạn kích thước, version, created_at.
- `saved_expressions`: user_id, expression, meaning_vi, meaning_origin (`dictionary` | `ai` | `learner`), source_sentence, video_source_id (nullable), start_ms (nullable), transcript_version, các trường FSRS, created_at; unique (user_id, lower(expression), video_source_id, start_ms) để lưu lặp không tạo bản ghi mới.
- `expression_review_logs`: saved_expression_id, rating, review_at, kết quả FSRS trước/sau.
- `expression_reuse_attempts`: saved_expression_id, prompt, learner_text, ai_feedback (nullable), created_at.

Ghi bằng server action có kiểm tra Zod và rate limit giống `cards.ts`. Chỉ thêm migration mới, không sửa dữ liệu cũ.

## 4. Tái sử dụng code hiện có

- `src/lib/read/tokenize.ts`, `src/lib/vocab/lemma.ts`: tách từ/lemma cho dòng transcript.
- `src/lib/read/gloss.ts`: từ điển hiện có; bổ sung spine từ `atoenglish-content` nếu cần (quyết định ở plan).
- `src/lib/srs/fsrs.ts`: lập lịch; hàng đợi ôn `src/lib/review/due-queue.ts` gộp thêm saved expressions.
- `src/lib/ai/gemini.ts`: giải thích AI và phản hồi câu viết; có timeout, giới hạn lượt và xử lý khi lỗi.

## 5. Bảo mật và quyền riêng tư

- Transcript là đầu vào không đáng tin: render dạng text, không bao giờ dùng HTML; giới hạn kích thước file và số dòng.
- Khi gửi cho AI chỉ gửi câu chứa từ cần giải thích, không gửi toàn bộ transcript; nội dung transcript không được coi là chỉ dẫn cho AI.
- Chỉ lưu ID video, không tải hoặc lưu lại nội dung video.
- Cho phép xóa video, transcript và từ đã lưu của mình.

## 6. Đo lường cho giai đoạn một người học

Ghi sự kiện tối thiểu để trả lời: tỷ lệ lấy phụ đề tự động thành công / thất bại / phải dùng fallback; số mục đã lưu được ôn khi đến hạn trên số mục thực sự đến hạn; tỷ lệ nhớ lại theo khoảng trì hoãn; số câu dùng lại. Không dùng tổng số từ đã lưu làm thước đo tiến bộ.

## 7. Quyết định cần chủ dự án duyệt

1. ~~v1 chỉ dùng transcript do người học cung cấp~~ Đã quyết: tự lấy phụ đề như eJOY GO, fallback người học cung cấp (mục 2).
2. Dùng bảng `saved_expressions` mới thay vì mở rộng `cards` (mục 3).
3. Trang landing hiện vẫn quảng bá IELTS. Cần sửa ở một task riêng trước khi giới thiệu công khai.
