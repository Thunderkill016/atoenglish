# AtoEnglish mobile shell (mission 007)

A minimal Android shell so a phone gets YouTube captions without a
browser extension. Two WebViews:

- **appView** — loads the production web app, unmodified.
- **collector** — hidden; loads `youtube.com/embed/<id>` as its own main
  frame so injected JS can read the player response and fetch timedtext
  inside the device's own YouTube session (same trust position as the
  browser extension's import tab — caption text/timing only, never
  cookies or request URLs).

The relay into the app page is `window.postMessage` on the existing
same-origin listener — the web app needed exactly one hook:
`window.__atoTranscriptReady`, which the watch page sets once a
transcript exists so a late collector result can never overwrite a
learner's transcript.

Intake: YouTube app → Share → AtoEnglish (`ACTION_SEND`) or "Open with"
on a youtube/youtu.be link — both route through the web app's `/share`
canonicalizer.

## Build

No local Android SDK needed — CI builds it:

- GitHub → Actions → `mobile-apk` → Run workflow, or push changes under
  `mobile/` on `docs/005-ejoy-trancy-system`.
- Download the `atoenglish-debug-apk` artifact (debug-signed, no Play
  account needed).

## Install

Copy the APK to the phone → open → allow "install unknown apps" for the
source. Debug APK, `minSdk 26` (Android 8+).

## iOS

Same pattern applies (`WKWebView` + hidden view + `evaluateJavaScript` +
`WKScriptMessageHandler`) but needs macOS/Xcode + Apple signing — not
buildable on Linux. Deferred until hardware/account exists.
