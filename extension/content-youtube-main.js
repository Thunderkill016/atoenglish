// MAIN world collector — runs inside YouTube's page context so it can read
// player.getPlayerResponse() and fetch timedtext same-origin inside the
// learner's real YouTube session (the same mechanism Trancy/easysubs/
// asbplayer use; server-side fetches hit timedtext IP rate limits).
//
// Trigger: the app opens youtube.com/watch?v=…#atoenglish-import. The hash
// marks "this tab exists only to hand captions back", so collection starts
// automatically and the relay closes the tab once the payload is stored.
(() => {
  const MSG_TYPE = "atoenglish:youtube-captions";
  const IMPORT_HASH = "#atoenglish-import";
  if (location.hash !== IMPORT_HASH) return;

  const videoId = new URLSearchParams(location.search).get("v");
  if (!videoId) return;

  // The player + its response appear after the watch page boots.
  const PLAYER_WAIT_MS = 15_000;
  const PLAYER_POLL_MS = 400;

  function playerResponse() {
    const player = document.getElementById("movie_player");
    if (player && typeof player.getPlayerResponse === "function") {
      try {
        const r = player.getPlayerResponse();
        if (r) return r;
      } catch {}
    }
    return window.ytInitialPlayerResponse || null;
  }

  const kindOf = (t) => (t.kind === "asr" ? "asr" : "manual");

  // English (manual + ASR — the app picks the best) and uploader-authored
  // Vietnamese only. YouTube's tlang machine translations are never sent.
  const wanted = (t) => {
    const lang = String(t.languageCode || "");
    if (!lang || !t.baseUrl) return false;
    if (/^en([-_]|$)/i.test(lang)) return true;
    return /^vi([-_]|$)/i.test(lang) && kindOf(t) === "manual";
  };

  async function collect() {
    const deadline = Date.now() + PLAYER_WAIT_MS;
    while (Date.now() < deadline) {
      const resp = playerResponse();
      const tracks =
        resp?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (Array.isArray(tracks)) {
        const out = [];
        for (const t of tracks.filter(wanted)) {
          try {
            const r = await fetch(t.baseUrl + "&fmt=json3", {
              credentials: "include",
            });
            if (!r.ok) continue;
            const j = await r.json();
            if (Array.isArray(j.events) && j.events.length) {
              out.push({
                languageCode: t.languageCode,
                kind: kindOf(t),
                events: j.events,
              });
            }
          } catch {}
        }
        if (out.length) {
          const vd = resp.videoDetails || {};
          const durationMs = Number(vd.lengthSeconds) * 1000;
          return {
            type: MSG_TYPE,
            version: 1,
            videoId,
            title: vd.title || undefined,
            channel: vd.author || undefined,
            durationMs: Number.isFinite(durationMs) ? durationMs : undefined,
            tracks: out,
          };
        }
      }
      await new Promise((r) => setTimeout(r, PLAYER_POLL_MS));
    }
    return null;
  }

  collect().then((payload) => {
    if (payload) window.postMessage(payload, location.origin);
    // Payload or not, signal completion so the relay can close the tab.
    window.postMessage({ type: "atoenglish:collect-done" }, location.origin);
  });
})();
