# Development Ledger — 007-mobile-webview-shell

## MISSION

Android WebView shell so phones get YouTube captions without an
extension. See TASK_CONTRACT.md.

## STATE

`IN-PROGRESS` — 2026-10-07

## ACTIVE WORKSTREAMS

- `mobile/android` shell (visible + hidden WebView)
- `ato-bridge.js` collector port
- CI APK workflow
- Docs + PROJECT_STATE owner-decision line

## DECISIONS

- 2026-10-07 — Owner: "làm webview đi". Thin shell loads production URL;
  `mobile/` lives in this repo; Android first, iOS-ready architecture.
- 2026-10-07 — Hidden-WebView collector chosen over iframe JS injection:
  `evaluateJavascript`/`addWebMessageListener` cannot run arbitrary JS
  inside a cross-origin iframe, but a youtube.com/embed document as the
  hidden view's MAIN frame has full access — same as the extension's
  import tab. Zero web-app changes: relay uses the existing same-origin
  `window.postMessage` listener branch.
- 2026-10-07 — Java (not Kotlin) + no AndroidX: keeps the toolchain
  minimal (no kotlin plugin, no androidx deps) for a single-activity
  shell; CI builds with plain Gradle.

## BLOCKERS

- Local machine has no JDK/Android SDK — compile verify happens in CI.

## SESSIONS

- 2026-10-07 — lead: plan approved; scaffolding mission + shell.
