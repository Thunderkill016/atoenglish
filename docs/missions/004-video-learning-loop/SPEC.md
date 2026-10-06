# Spec 004 — Video learning loop v1

Ngày 2026-10-06. Ngôn ngữ spec: tiếng Việt; code/schema: tiếng Anh. Hướng sản phẩm: `docs/project/PROJECT_STATE.md`. Hợp đồng: [TASK_CONTRACT.md](./TASK_CONTRACT.md).

## 1. Hành trình người học (lát cắt đầu tiên)

1. Vào `/watch`, dán link YouTube → video phát bằng trình phát nhúng chính thức (IFrame Player API).
2. Gắn transcript: dán văn bản có mốc thời gian, tải file `.srt`/`.vtt`, hoặc dán văn bản thường (không đồng bộ, chỉ đọc). Nếu không có transcript: thông báo rõ, vẫn cho xem video, không tạo dữ liệu giả.
3. Xem: dòng đang phát được tô sáng và tự cuộn; bấm dòng để tua; lặp dòng; tốc độ 0.75×/0.5×.
4. Bấm từ hoặc chọn cụm từ → nghĩa tiếng Việt theo thứ tự: spine/từ điển hiện có → giải thích AI (gắn nhãn "AI", lưu cache) → "chưa có nghĩa".
5. Lưu: cụm từ + nghĩa (người học sửa được) + câu gốc + video + mốc thời gian.
6. Ôn (trong hàng đợi ôn hiện có): thấy câu gốc với chỗ trống/nghĩa tiếng Việt → tự nhớ → lật đáp án → tự chấm (Again/Hard/Good/Easy) → FSRS. Có nút "xem lại đoạn gốc".
7. Dùng lại: cuối phiên ôn, viết một câu dùng cụm từ trong tình huống mới; phản hồi AI (nếu có) chỉ là gợi ý, gắn nhãn AI.

## 2. Nguồn transcript (ràng buộc pháp lý)

Đã xác minh ngày 06/10/2026: điều khoản YouTube cấm truy cập tự động/scraper và tải nội dung khi không được cho phép; `captions.download` chỉ dùng được khi người dùng có quyền sửa video. Vì vậy v1 **chỉ** nhận transcript do người học cung cấp. Các nguồn khác cần quyết định riêng:

| Nguồn                                           | v1         | Ghi chú                                                                           |
| ----------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| Người học dán/tải `.srt`/`.vtt`/văn bản         | Có         | Người học chịu trách nhiệm quyền dùng; lưu riêng tư theo user                     |
| API chính thức cho video người học có quyền sửa | Không      | Cần OAuth YouTube; giá trị thấp với người học xem phim                            |
| Nội dung tuyển chọn có quyền sử dụng            | Không (v2) | Cần xác minh giấy phép từng nguồn trước khi dùng                                  |
| Lấy phụ đề tự động từ video bất kỳ              | **Không**  | Trái điều khoản đã dẫn; cần quyết định riêng của chủ dự án sau khi xem điều khoản |

## 3. Dữ liệu (đề xuất, sẽ xác nhận ở bước plan)

Không mở rộng `cards`. Lý do: `saveCardToSRS` dừng khi lemma đã tồn tại, nên cùng một từ ở hai ngữ cảnh sẽ bị gộp; bảng cũng không có trường nguồn. Bảng mới đều có `user_id → neon_auth.user(id) on delete cascade` và RLS chỉ cho chủ sở hữu, theo mẫu `learner_known_words`.

- `video_sources`: user_id, provider (`youtube`), external_id (11 ký tự), title (tùy chọn), created_at; unique (user_id, provider, external_id).
- `video_transcripts`: video_source_id, origin (`learner_upload` | `learner_paste`), format, lines jsonb `[{start_ms, end_ms, text}]` với giới hạn kích thước, version, created_at.
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

Ghi sự kiện tối thiểu để trả lời: bao nhiêu video có transcript (tỷ lệ bị chặn ở bước 2); số mục đã lưu được ôn khi đến hạn trên số mục thực sự đến hạn; tỷ lệ nhớ lại theo khoảng trì hoãn; số câu dùng lại. Không dùng tổng số từ đã lưu làm thước đo tiến bộ.

## 7. Quyết định cần chủ dự án duyệt

1. v1 chỉ dùng transcript do người học cung cấp (mục 2). Nếu nhiều video không có transcript, cần chọn nguồn khác cho v2.
2. Dùng bảng `saved_expressions` mới thay vì mở rộng `cards` (mục 3).
3. Trang landing hiện vẫn quảng bá IELTS. Cần sửa ở một task riêng trước khi giới thiệu công khai.
