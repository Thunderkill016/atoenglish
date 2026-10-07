# AtoEnglish Captions extension

Lấy phụ đề YouTube **trong chính phiên trình duyệt của người học** — cùng cơ
chế Trancy/easysubs/asbplayer dùng. Khác với server fetch: request timedtext
đi từ IP + cookie YouTube thật của user nên không bị 429 như datacenter.

## Cài (dev)

1. `chrome://extensions` → bật **Developer mode**.
2. **Load unpacked** → chọn thư mục `extension/` này.
3. Mở `http://localhost:3000/watch/<videoId>` — nút **"Lấy qua extension"**
   xuất hiện trong panel Phụ đề (app phát hiện extension qua
   `document.documentElement.dataset.atoenglishExt`).

## Flow

```
app watch page ──window.open──▶ youtube.com/watch?v=…#atoenglish-import
                                 │ content-youtube-main.js (world: MAIN)
                                 │  getPlayerResponse() → captionTracks
                                 │  fetch baseUrl&fmt=json3 (same-origin)
                                 │  postMessage → window
                                 │ content-youtube-relay.js (isolated)
                                 │  chrome.storage.local[pendingCaptions]
                                 └─ tab tự đóng ◀──┘
content-app.js (app domain) ◀─ storage.onChanged
  → window.postMessage(payload) → watch page → validate → segment → render
```

`window.opener` không dùng được: YouTube gửi `Cross-Origin-Opener-Policy`
nên popup bị cắt opener — vì vậy payload đi qua `chrome.storage`.

Chỉ gửi track English (manual + ASR) và Vietnamese do kênh dịch. Không gửi
bản dịch máy `tlang` của YouTube.
