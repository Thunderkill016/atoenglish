# AtoEnglish Captions extension

Companion miễn phí cho player AtoEnglish: đọc phụ đề trong phiên YouTube
của chính người học. Phiên trình duyệt vẫn có thể bị YouTube từ chối; extension
không bảo đảm lấy được mọi video. Cơ chế phát triển từ nghiên cứu phản hồi
phụ đề native, không sao chép code/asset Trancy.

## Cài hoặc cập nhật bản dev 0.2.0

1. Mở `chrome://extensions`, bật **Developer mode**.
2. **Load unpacked** và chọn thư mục `extension/` này. Nếu đã cài, bấm
   **Reload** để nạp manifest và script mới.
3. Tải lại trang `/watch/<videoId>` trong AtoEnglish. Các origin được hỗ trợ:
   `http://localhost:3000`, `http://localhost:3100` (kiểm thử cách ly),
   `https://atoenglish.thunderkill016.workers.dev`.

Đường tự động cần cả extension 0.2.0 và WatchClient mới. Cập nhật source
không tự cập nhật bản web đang chạy trên production. Firefox chưa được xác minh.

## Khi mở video

- App dùng phụ đề đã lưu trước. Nếu chưa có, gửi một yêu cầu lấy phụ đề khi
  player sẵn sàng, không cần bấm nút hay tự phát video.
- Collector chạy ở `document_start` trong iframe YouTube: kiểm tra video,
  chọn track English, đọc phản hồi XHR/fetch json3 native mà player tải.
  Nó đọc bản clone của fetch, không tiêu thụ body mà player cần.
- Nếu chưa có body native, thử một lượt direct fetch cho track được chọn:
  thay `fmt` thành `json3`, dùng ngữ cảnh request/device có thật trong phiên.
  Không thử lại track vừa trả 403/429. Tối đa hai track EN dự phòng và một
  track VI do kênh cung cấp, trong hạn thu thập 30 giây.
- Chỉ caption text/timing và metadata video qua `postMessage` tới đúng parent
  origin/video/frame. Cookie, signed URL và token không rời document YouTube.
  Hook/track/listener được dọn khi hoàn tất, đổi video hoặc rời trang.
- App kiểm tra payload, phân câu và căn VI theo thời gian. Khi có bản VI hợp
  lệ của kênh thì giữ nó; nếu thiếu, luồng dịch hiện có xử lý riêng. Lỗi track
  VI không làm mất track EN đã lấy được. Phản hồi đến muộn không thay bản vừa dán.

Không có extension: phụ đề đã lưu, lần lấy từ máy chủ có giới hạn và nhập
`.srt`/`.vtt`/paste vẫn sử dụng được. Máy chủ dừng lần lấy ngay khi gặp 403/429;
không thay client hay lặp URL bị từ chối để tiêu hết budget.

## Nhập qua tab YouTube dự phòng

Nút **Lấy qua extension** vẫn mở `youtube.com/watch?v=…#atoenglish-import`.
Collector native dùng cùng nguyên tắc ở trên. Relay isolated chạy từ
`document_start`, lưu payload vào `chrome.storage.local`; app relay nhận
`storage.onChanged` rồi chuyển cho WatchClient. Tab chỉ đóng sau khi storage
lưu thành công. `window.opener` không phải kênh dữ liệu: YouTube COOP có thể
cắt opener. Timeout app giữ mức 45 giây, và vẫn cho nhập thủ công.

Guest dùng caption trong phiên hiện tại. Người đăng nhập có thể lưu vào thư
viện riêng. Payload trình duyệt không được ghi vào cache công khai: kiểm tra
shape không chứng minh nguồn YouTube. Cache dùng chung chỉ nhận kết quả từ
đường lấy của máy chủ; migration/runtime cache chưa được xác minh ở checkpoint này.

## Kiểm chứng

`scripts/native-caption-collector.test.ts` kiểm tra collector/relay bằng VM.
`e2e/native-captions.spec.ts` nạp **extension thật** vào Chromium profile mới,
chạy player AtoEnglish thật với backend cách ly và response YouTube giả lập:
tự nhập EN/VI, dừng khi 429, storage handoff và tab tự đóng.
Thiết lập persistent Chromium theo [Playwright](https://playwright.dev/docs/chrome-extensions).
Các test này chứng minh wiring và giới hạn request, không chứng minh timedtext
thật đang tải được trong phiên người dùng hoặc production.
