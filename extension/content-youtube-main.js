// Caption companion, injected at document_start. Read native timedtext bodies
// before trying a single direct fetch in this same YouTube session. No audio,
// cookies, signed URLs or attestation tokens leave this document.
(() => {
  const PAYLOAD_TYPE = "atoenglish:youtube-captions";
  const REQUEST_TYPE = "atoenglish:request-captions";
  const DONE_TYPE = "atoenglish:collect-done";
  const IMPORT_HASH = "#atoenglish-import";
  const POLL_MS = 200; // Poll player initialization, never repeat network fetches.
  const COLLECT_MS = 30_000; // Within the app's existing 45-second import ceiling.
  const NATIVE_WAIT_MS = 3000; // Give a selected native track time to load first.
  const DIRECT_FETCH_MS = 5000; // One bounded fallback per selected track.
  const MAX_JSON_CHARS = 1_000_000; // Bound caption parsing/relay memory.
  const MAX_EVENTS = 50_000; // Same event ceiling as extension-bridge validation.
  const APP_ORIGINS = new Set([
    "http://localhost:3000",
    "http://localhost:3100", // Isolated development/browser checks.
    "https://atoenglish.thunderkill016.workers.dev",
  ]);
  const url = new URL(location.href);
  const embedded = /^\/embed\//.test(url.pathname);
  const currentId = () =>
    location.pathname.match(/^\/embed\/([\w-]{11})$/)?.[1] ??
    new URLSearchParams(location.search).get("v");
  const videoId = currentId();
  const importTab = !embedded && url.hash === IMPORT_HASH;
  if (!videoId || !/^[\w-]{11}$/.test(videoId) || (!embedded && !importTab))
    return;

  const originalFetch = window.fetch;
  const originalOpen = XMLHttpRequest.prototype.open;
  const captured = new Map();
  const contexts = new Map(); // Request context stays in this document only.
  const refused = new Set();
  let observing = false;
  let finished = false;
  let running = false;
  let destination = null;
  let originalTrack;
  let drivenTrack = null;
  let lastPlayer = null;
  let fetchController = null;
  let idleObserverTimer = null;

  const kind = (track) => (track.kind === "asr" ? "asr" : "manual");
  const key = (language, trackKind) => `${language}:${trackKind}`;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const validEvents = (events) =>
    Array.isArray(events) &&
    events.length > 0 &&
    events.length <= MAX_EVENTS &&
    events.every(
      (event) =>
        event &&
        Number.isFinite(event.tStartMs) &&
        (event.dDurationMs === undefined ||
          (Number.isFinite(event.dDurationMs) && event.dDurationMs >= 0)) &&
        (event.segs === undefined ||
          (Array.isArray(event.segs) &&
            event.segs.every((segment) => typeof segment?.utf8 === "string"))),
    ) &&
    events.some((event) => event.segs?.some((segment) => segment.utf8.trim()));

  function trackUrl(raw) {
    try {
      const parsed = new URL(raw, location.origin);
      const language = parsed.searchParams.get("lang") ?? "";
      const trackKind =
        parsed.searchParams.get("kind") === "asr" ? "asr" : "manual";
      if (
        parsed.origin !== location.origin ||
        parsed.pathname !== "/api/timedtext" ||
        parsed.searchParams.get("v") !== videoId ||
        parsed.searchParams.has("tlang") ||
        !(
          /^en(?:[-_]|$)/i.test(language) ||
          (/^vi(?:[-_]|$)/i.test(language) && trackKind === "manual")
        )
      )
        return null;
      return { parsed, language, trackKind, id: key(language, trackKind) };
    } catch {
      return null; // Unrelated/non-URL player traffic is not a caption.
    }
  }

  function receive(rawUrl, status, body) {
    if (!observing || finished || currentId() !== videoId) return;
    const track = trackUrl(rawUrl);
    if (!track) return;
    contexts.set(track.id, track.parsed);
    if (status === 403 || status === 429) {
      refused.add(track.id);
      return;
    }
    if (status !== 200 || track.parsed.searchParams.get("fmt") !== "json3")
      return;
    if (typeof body === "string") {
      if (body.length > MAX_JSON_CHARS) return;
      try {
        body = JSON.parse(body);
      } catch {
        return;
      }
    }
    if (!validEvents(body?.events)) return;
    captured.set(track.id, {
      languageCode: track.language,
      kind: track.trackKind,
      events: body.events,
    });
  }

  function observedOpen(...args) {
    const rawUrl = args[1];
    if (trackUrl(rawUrl)) {
      this.addEventListener(
        "load",
        () => {
          if (
            this.responseType !== "" &&
            this.responseType !== "text" &&
            this.responseType !== "json"
          )
            return;
          receive(
            this.responseURL || rawUrl,
            this.status,
            this.responseType === "json" ? this.response : this.responseText,
          );
        },
        { once: true },
      );
    }
    return originalOpen.apply(this, args);
  }

  function observedFetch(...args) {
    const response = originalFetch.apply(this, args);
    const input = args[0];
    const rawUrl =
      typeof input === "string" || input instanceof URL
        ? String(input)
        : input?.url;
    if (trackUrl(rawUrl)) {
      void response
        .then(async (value) => {
          // Observe a clone: never consume or delay the native player's body.
          receive(
            value.url || rawUrl,
            value.status,
            await value.clone().text(),
          );
        })
        .catch(() => {}); // Native fetch rejection remains on the original promise.
    }
    return response;
  }

  function observe() {
    if (observing) return;
    observing = true;
    // A cache hit may never ask us to collect. Bound passive interception too.
    if (!running)
      idleObserverTimer = setTimeout(() => {
        finished = true;
        cleanup();
      }, COLLECT_MS);
    XMLHttpRequest.prototype.open = observedOpen;
    window.fetch = observedFetch;
  }

  function playerResponse() {
    const player = document.getElementById("movie_player");
    let response;
    try {
      response =
        player?.getPlayerResponse?.() ?? window.ytInitialPlayerResponse;
    } catch {
      return null;
    } // Player not initialized; bounded poll continues.
    return response?.videoDetails?.videoId === videoId
      ? { player, response }
      : null;
  }

  function selectTrack(player, track) {
    if (!player?.setOption) return;
    // Native methods may be absent during initialization or an ad. That is a
    // bounded unavailable path; direct fetch/paste remain available.
    try {
      if (!lastPlayer) {
        originalTrack = player.getOption?.("captions", "track");
        lastPlayer = player;
      }
      player.loadModule?.("captions");
      const nativeTracks = player.getOption?.("captions", "tracklist") ?? [];
      const selected =
        nativeTracks.find(
          (item) =>
            (track.vssId && (item.vss_id ?? item.vssId) === track.vssId) ||
            (item.languageCode === track.languageCode &&
              kind(item) === kind(track)),
        ) ?? track;
      player.setOption("captions", "track", selected);
      drivenTrack = selected;
    } catch {
      drivenTrack = null;
    }
  }

  function cleanup() {
    observing = false;
    if (idleObserverTimer) clearTimeout(idleObserverTimer);
    idleObserverTimer = null;
    fetchController?.abort();
    if (XMLHttpRequest.prototype.open === observedOpen)
      XMLHttpRequest.prototype.open = originalOpen;
    if (window.fetch === observedFetch) window.fetch = originalFetch;
    if (lastPlayer && drivenTrack && currentId() === videoId) {
      try {
        // Restore only our own selection, preserving later user track changes.
        const selected = lastPlayer.getOption?.("captions", "track");
        const drivenId = drivenTrack.vss_id ?? drivenTrack.vssId;
        if (
          selected?.languageCode === drivenTrack.languageCode &&
          kind(selected) === kind(drivenTrack) &&
          (!drivenId || (selected.vss_id ?? selected.vssId) === drivenId)
        ) {
          lastPlayer.setOption("captions", "track", originalTrack ?? {});
        }
      } catch {
        /* Player may already be destroyed on navigation. */
      }
    }
    contexts.clear();
    captured.clear();
    window.removeEventListener("message", onRequest);
    window.removeEventListener("pagehide", onPageHide);
  }

  function send(message) {
    if (destination) window.parent.postMessage(message, destination);
    else window.postMessage(message, location.origin);
  }

  async function getTrack(player, track, deadline) {
    const id = key(track.languageCode, kind(track));
    if (captured.has(id)) return captured.get(id);
    selectTrack(player, track);
    const nativeDeadline = Math.min(deadline, Date.now() + NATIVE_WAIT_MS);
    while (
      !finished &&
      currentId() === videoId &&
      Date.now() < nativeDeadline
    ) {
      if (captured.has(id)) return captured.get(id);
      if (refused.has(id)) return null;
      await sleep(POLL_MS);
    }
    if (
      finished ||
      currentId() !== videoId ||
      Date.now() >= deadline ||
      refused.has(id)
    )
      return null;
    const source = contexts.get(id) ?? trackUrl(track.baseUrl)?.parsed;
    if (!source) return null;
    const direct = new URL(source);
    direct.searchParams.set("fmt", "json3"); // Replace duplicate/existing fmt.
    const device = window.ytcfg?.get?.("DEVICE");
    if (typeof device === "string") {
      // Use actual session parameters, never a hard-coded browser identity.
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
    fetchController = new AbortController();
    const timeout = setTimeout(
      () => fetchController?.abort(),
      Math.min(DIRECT_FETCH_MS, deadline - Date.now()),
    );
    try {
      const response = await originalFetch.call(window, direct.toString(), {
        credentials: "include",
        signal: fetchController.signal,
      });
      receive(direct.toString(), response.status, await response.text());
    } catch (error) {
      // A failed/aborted single direct attempt is final for this track.
      if (error?.name !== "AbortError") refused.add(id);
    } finally {
      clearTimeout(timeout);
      fetchController = null;
    }
    return captured.get(id) ?? null;
  }

  async function collect() {
    if (running || finished) return;
    running = true;
    if (idleObserverTimer) clearTimeout(idleObserverTimer);
    idleObserverTimer = null;
    observe();
    const deadline = Date.now() + COLLECT_MS;
    try {
      let state = null;
      while (!finished && currentId() === videoId && Date.now() < deadline) {
        state = playerResponse();
        if (
          Array.isArray(
            state?.response.captions?.playerCaptionsTracklistRenderer
              ?.captionTracks,
          )
        )
          break;
        await sleep(POLL_MS);
      }
      if (finished || currentId() !== videoId) return;
      const tracks =
        state?.response.captions?.playerCaptionsTracklistRenderer
          ?.captionTracks ?? [];
      const english = tracks.filter((track) =>
        /^en(?:[-_]|$)/i.test(track.languageCode ?? ""),
      );
      const score = (track) =>
        (track.languageCode === "en" ? 0 : 2) +
        (kind(track) === "manual" ? 0 : 1);
      english.sort((a, b) => score(a) - score(b));
      const output = [];
      // At most manual/ASR fallback plus one human VI track; no bulk download.
      for (const track of english.slice(0, 2)) {
        const data = await getTrack(state.player, track, deadline);
        if (data) {
          output.push(data);
          break;
        }
      }
      const vietnamese = tracks.find(
        (track) =>
          /^vi(?:[-_]|$)/i.test(track.languageCode ?? "") &&
          kind(track) === "manual",
      );
      if (output.length && vietnamese) {
        const data = await getTrack(state.player, vietnamese, deadline);
        if (data) output.push(data);
      }
      if (!finished && currentId() === videoId && output.length) {
        const details = state.response.videoDetails;
        const durationMs = Number(details.lengthSeconds) * 1000;
        send({
          type: PAYLOAD_TYPE,
          version: 1,
          videoId,
          title: details.title,
          channel: details.author,
          durationMs: Number.isFinite(durationMs) ? durationMs : undefined,
          tracks: output,
        });
      }
    } finally {
      if (!finished) send({ type: DONE_TYPE, videoId });
      finished = true;
      cleanup();
    }
  }

  function onRequest(event) {
    if (
      event.source !== window.parent ||
      !APP_ORIGINS.has(event.origin) ||
      event.data?.type !== REQUEST_TYPE ||
      event.data.videoId !== videoId
    )
      return;
    destination = event.origin;
    void collect();
  }
  function onPageHide() {
    finished = true;
    cleanup();
  }
  window.addEventListener("pagehide", onPageHide);
  if (importTab) void collect();
  else {
    window.addEventListener("message", onRequest);
    // Attach before native requests on our embedded player. Other embeds
    // only activate after a verified request from the allowed parent origin.
    try {
      if (APP_ORIGINS.has(new URL(document.referrer).origin)) observe();
    } catch {
      /* Empty referrer: wait for the validated parent message. */
    }
  }
})();
