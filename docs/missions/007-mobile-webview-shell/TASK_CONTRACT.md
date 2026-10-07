# Task Contract — 007-mobile-webview-shell

## MISSION

A learner on a phone gets YouTube captions inside an AtoEnglish shell app
even when the server-side caption chain fails — no browser extension.

## PROBLEM

Mobile web has no caption-acquisition path when YouTube refuses the
server fetch: no extension on mobile, and the embedded iframe is opaque
to the page (cross-origin). Verified gap reported by the owner and
recorded in mission 006.

## WHY IT MATTERS

Trancy/eJOY/Migaku all escaped extension-only via an app surface that owns
a WebView/native layer inside the user's own YouTube session. Owner
decision 2026-10-07: "làm webview đi" — build the shell.

## CURRENT EVIDENCE

- Extension collector works via a youtube.com document fetching its own
  timedtext: `extension/content-youtube-main.js` (import-tab flow).
- The watch page already accepts same-origin `window.postMessage`
  payloads: `src/app/watch/[videoId]/watch-client.tsx:429-445`.
- A hidden WebView loading `youtube.com/embed/<id>` as its main frame has
  full `evaluateJavascript` access — the same trust position as the
  extension's import tab (caption text/timing only, device session).

## SCOPE

- `mobile/android/`: minimal native Android app — visible WebView (loads
  production URL) + hidden collector WebView (youtube.com/embed as main
  frame) + `AtoBridge` @JavascriptInterface relay →
  `window.postMessage` into the app page.
- `ato-bridge.js` — collector ported from `content-youtube-main.js`
  (playerResponse tracks → json3 timedtext fetch → payload).
- `.github/workflows/mobile-apk.yml` — CI builds debug APK artifact.
- Mission docs + one owner-decision line in `docs/project/PROJECT_STATE.md`.

## NON-GOALS

- No iOS build (needs macOS/Xcode + Apple signing — Linux cannot verify);
  the pattern is documented for a later WKWebView port.
- No Play Store, no signing keys — debug APK, sideload install.
- No web-app code changes; the shell speaks the existing protocol.
- No learning features, no media download — captions text/timing only,
  same YouTube boundary as the extension.
- Not merged to `main` — draft PR only.

## DEPENDENCIES

- Extension collector logic (`extension/content-youtube-main.js`) — ported.
- Watch-page postMessage contract — consumed unchanged.
- GitHub Actions for builds (no local Android SDK on dev machine).

## RISKS

- Cannot compile/run locally — verification = CI green + owner on-device
  test. Rollback: delete `mobile/`; web app untouched.
- YouTube may refuse embed playback/captions in a fresh WebView session →
  falls back to existing empty/paste states.
- `ytInitialPlayerResponse` shape can drift → timedtext `type=list`
  fallback retained.

## ACCEPTANCE CRITERIA

- [ ] CI workflow produces `app-debug.apk` artifact.
- [ ] On owner's phone: install → open video not in cache → captions
      appear without any extension.
- [ ] Bridge only fires for the `/watch/<id>` the learner opened; one
      collector at a time; 45 s timeout teardown.
- [ ] Repo gates stay green (tsc/eslint/vitest/build/SOT) — no src
      regressions.
- [ ] ato-qa review recorded in LEDGER.

## VERIFICATION METHOD

CI assembleDebug + repo gates + owner on-device check + ato-qa review.

## OWNERSHIP

- Writer: lead session (Devin). Files: `mobile/**`, `.github/workflows/
mobile-apk.yml`, `docs/missions/007-*`, `PROJECT_STATE.md` (one line).

## OUTPUT

APK artifact + docs; draft PR unchanged state.

## STATUS

`IN-PROGRESS`
