// Runs on the AtoEnglish app itself (isolated world).
// 1. Marks the DOM so the watch page knows the extension is installed.
// 2. Relays caption payloads the YouTube tab stored in chrome.storage into
//    the page via window.postMessage.
(() => {
  const STORAGE_KEY = "pendingCaptions";
  // Ignore stale payloads — an old entry belongs to a previous visit.
  const PAYLOAD_MAX_AGE_MS = 60_000;

  document.documentElement.dataset.atoenglishExt =
    chrome.runtime.getManifest().version;

  const videoId = () => location.pathname.match(/^\/watch\/([\w-]+)/)?.[1];

  function deliver(entry) {
    const { payload, at } = entry || {};
    if (!payload || typeof payload !== "object") return;
    if (typeof at !== "number" || Date.now() - at > PAYLOAD_MAX_AGE_MS) return;
    if (payload.videoId !== videoId()) return;
    window.postMessage(payload, location.origin);
    chrome.storage.local.remove(STORAGE_KEY).catch(() => {});
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORAGE_KEY]?.newValue) {
      deliver(changes[STORAGE_KEY].newValue);
    }
  });
  // Covers the race where storage was written before this script attached.
  chrome.storage.local.get(STORAGE_KEY).then((r) => deliver(r[STORAGE_KEY]));
})();
