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
- 2026-10-07 — CI uses the ubuntu-latest runner's preinstalled SDK
  (`$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager`) instead of
  `android-actions/setup-android@v3`, which fails upstream installing
  the removed legacy `tools` package.
- 2026-10-07 — Debug signing key pinned in `app/debug.keystore` (PKCS12,
  standard debug credentials): per-run ephemeral keys made every APK
  uninstallable over the previous install.
- 2026-10-07 — On-device translation = Google ML Kit (owner decision:
  "dịch free không mất phí"). Chrome's `Translator` API does not exist
  inside Android WebView, and server engines (`SUBTITLE_*_ENABLED`) were
  never configured on production + are login-gated. The shell exposes
  `AtoTranslate` on the app WebView; `use-translations` gains a `shell`
  provider that wins when the bridge is present (`SHELL_TRANSLATION_PROFILE`
  `mlkit-translate-en-vi-v1`). Bundled SDK ⇒ ~66MB APK but fully offline.

## BLOCKERS

- Local machine has no JDK/Android SDK — compile verify happens in CI.
- ~~`mobile-apk` run 37633678816 failed: `setup-android` requested the
  removed `tools` SDK package.~~ Fixed by using the runner's
  preinstalled SDK directly (commits `e3b7be86`, `464c90d3`).
  preinstalled SDK directly (commits `3ac4040b`, `ca88f53f`).
  Run 37633986504 green: `app-debug.apk` (~14KB) artifact
  `atoenglish-debug-apk` uploaded.

## SESSIONS

- 2026-10-07 — lead: plan approved; scaffolding mission + shell.
- 2026-10-07 — lead: fixed `mobile-apk` workflow (2 SDK-package
  failures) → APK artifact produced; unverified on-device behavior
  remains pending QA.
- 2026-10-07 — lead: on-device QA — WebView error toasts + collector
  `onStatus` diagnostics added; signing key pinned after install-over
  failure; ML Kit `AtoTranslate` bridge + `shell` provider shipped
  (build `37647840379`); field test pending.
