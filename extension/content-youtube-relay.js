// Isolated-world relay on youtube.com. The MAIN-world collector cannot call
// extension APIs, so it posts the payload over window messaging; this script
// stores it in chrome.storage.local (the app-side content script picks it up
// via storage.onChanged) and then closes this import tab.
(() => {
  const STORAGE_KEY = "pendingCaptions";
  let gotPayload = false;

  window.addEventListener("message", (e) => {
    if (e.source !== window || !e.data || typeof e.data !== "object") return;
    if (e.data.type === "atoenglish:youtube-captions") {
      gotPayload = true;
      chrome.storage.local
        .set({ [STORAGE_KEY]: { payload: e.data, at: Date.now() } })
        .catch(() => {});
      return;
    }
    if (e.data.type === "atoenglish:collect-done") {
      // window.close() works because the app opened this tab via window.open.
      // Only close after a real payload was handed off — on collect failure
      // the user keeps the tab and can see what YouTube showed.
      if (gotPayload) window.close();
      else {
        // Show a small notice so the tab doesn't look broken.
        const note = document.createElement("div");
        note.textContent =
          "AtoEnglish: không lấy được phụ đề video này. Đóng tab và thử cách khác.";
        note.style.cssText =
          "position:fixed;top:0;left:0;right:0;z-index:99999;background:#f5b50a;color:#000;padding:8px 12px;font:13px sans-serif;text-align:center";
        document.documentElement.appendChild(note);
      }
    }
  });
})();
