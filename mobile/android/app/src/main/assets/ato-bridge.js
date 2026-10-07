/**
 * Caption collector — injected into a hidden WebView whose main frame is
 * youtube.com/embed/<id> (mission 007).
 *
 * Ported from extension/content-youtube-main.js, simplified for the shell:
 * we own the frame, so there is no request-to-collect handshake and no
 * fetch/XHR observation — just read the player response and fetch the
 * timedtext bodies directly inside this YouTube session. Only caption
 * text/timing leaves via AtoBridge.onCaptions; cookies and request URLs
 * never cross.
 */
(() => {
  const POLL_MS = 200;
  const COLLECT_MS = 30_000; // inside the app's 45 s import ceiling
  const FETCH_MS = 8_000;
  const MAX_EVENTS = 50_000;
  const videoId = location.pathname.match(/^\/embed\/([\w-]{11})$/)?.[1];

  const done = (payload) => {
    try {
      AtoBridge.onCaptions(payload ? JSON.stringify(payload) : null);
    } catch {
      /* Bridge absent — page must not die on it. */
    }
  };
  if (!videoId || typeof AtoBridge === "undefined") return;

  const kind = (track) => (track.kind === "asr" ? "asr" : "manual");

  const validEvents = (events) =>
    Array.isArray(events) &&
    events.length > 0 &&
    events.length <= MAX_EVENTS &&
    events.every(
      (e) =>
        e &&
        Number.isFinite(e.tStartMs) &&
        (e.dDurationMs === undefined ||
          (Number.isFinite(e.dDurationMs) && e.dDurationMs >= 0)) &&
        (e.segs === undefined ||
          (Array.isArray(e.segs) &&
            e.segs.every((s) => s && typeof s.utf8 === "string"))),
    ) &&
    events.some((e) => e.segs?.some((s) => s.utf8.trim()));

  function playerResponse() {
    const player = document.getElementById("movie_player");
    let response;
    try {
      response =
        player?.getPlayerResponse?.() ?? window.ytInitialPlayerResponse;
    } catch {
      return null;
    }
    return response?.videoDetails?.videoId === videoId ? response : null;
  }

  /**
   * Direct timedtext fetch — carries the baseUrl signature from the player
   * response plus this session's DEVICE params (never a hard-coded client
   * identity). credentials:include reuses the WebView's YouTube session.
   */
  async function fetchTrack(track, deadline) {
    if (!track?.baseUrl) return null;
    const direct = new URL(track.baseUrl, location.origin);
    direct.searchParams.set("fmt", "json3");
    const device = window.ytcfg?.get?.("DEVICE");
    if (typeof device === "string") {
      for (const [name, value] of new URLSearchParams(device)) {
        if (
          /^(?:c|cbr|cbrver|cbrand|cver|cplayer|cos|cosver|cplatform)$/.test(
            name,
          ) &&
          !direct.searchParams.has(name)
        )
          direct.searchParams.set(name, value);
      }
    }
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.max(1, Math.min(FETCH_MS, deadline - Date.now())),
    );
    try {
      const response = await fetch(direct.toString(), {
        credentials: "include",
        signal: controller.signal,
      });
      if (response.status !== 200) return null;
      const body = await response.json();
      return validEvents(body?.events)
        ? {
            languageCode: track.languageCode,
            kind: kind(track),
            events: body.events,
          }
        : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function collect() {
    const deadline = Date.now() + COLLECT_MS;
    let response = null;
    while (Date.now() < deadline) {
      response = playerResponse();
      if (
        Array.isArray(
          response?.captions?.playerCaptionsTracklistRenderer?.captionTracks,
        )
      )
        break;
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    const tracks =
      response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) return done(null);

    // English: uploader-authored first, then ASR — first success wins.
    const english = tracks
      .filter((t) => /^en(?:[-_]|$)/i.test(t.languageCode ?? ""))
      .sort(
        (a, b) =>
          (a.languageCode === "en" ? 0 : 2) + (kind(a) === "asr" ? 1 : 0) -
          ((b.languageCode === "en" ? 0 : 2) + (kind(b) === "asr" ? 1 : 0)),
      );
    const output = [];
    for (const track of english.slice(0, 2)) {
      const data = await fetchTrack(track, deadline);
      if (data) {
        output.push(data);
        break;
      }
    }
    // One human-authored Vietnamese track for alignment — never ASR'd VI.
    const vietnamese = tracks.find(
      (t) => /^vi(?:[-_]|$)/i.test(t.languageCode ?? "") && kind(t) === "manual",
    );
    if (output.length && vietnamese) {
      const data = await fetchTrack(vietnamese, deadline);
      if (data) output.push(data);
    }
    if (!output.length) return done(null);

    const details = response.videoDetails;
    const durationMs = Number(details.lengthSeconds) * 1000;
    done({
      type: "atoenglish:youtube-captions",
      version: 1,
      videoId,
      title: details.title,
      channel: details.author,
      durationMs: Number.isFinite(durationMs) ? durationMs : undefined,
      tracks: output,
    });
  }

  void collect();
})();
