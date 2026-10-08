# Trancy / eJOY / Migaku research — what survives for AtoEnglish

Owner-compiled benchmark (2026-10-07), confined to publicly verifiable
behaviour. We adopt their _product architecture_, not guesses at their
private implementation.

## The shared architectural move

All three escaped extension-only:

- **Trancy** — native mobile app: in-app YouTube search, subscription
  sync, bilingual subtitles, shadowing, AI summary. Publicly documents
  Whisper-based "AI Subtitle" (~2–5 min per video) when captions are
  absent.
- **eJOY** — mobile "YouTube Connect": search inside the app, or
  YouTube app → Share → eJOY. "AI Create Sub" generates a transcript for
  captionless videos. Captions saved on extension/web/mobile sync through
  the account.
- **Migaku** — in-app YouTube browser ("Watch & Listen"), dual subs,
  dictionary, card mining, AI subtitle generation, share-link handling,
  subtitle caching on Android, cross-device cloud progress.

Pattern in common:

```
YouTube video → resolver → existing captions OR generated transcript
            → normalized transcript → translation → learning layer
```

Extension is one ingestion surface. Account/backend is the join point.
Mobile is a first-class learner surface.

## What each is specifically good at (adopt selectively)

| Product     | Take                                                          |
| ----------- | ------------------------------------------------------------- |
| Trancy      | AI-subtitle product framing; sentence-first watch UX          |
| eJOY        | Share-sheet intake; exercise pipeline after transcript exists |
| Migaku      | Cross-device sync as a first-class object; subtitle caching   |
| LangReactor | (counter-example) extension-centric runtime — our trap today  |
| FluentU     | Curated path: imported video → lesson → multi-surface access  |
| Lingopie    | Vocabulary always bound to its source context                 |

## Unknown internals — do not assume

None of the three publish _how_ their backend obtains YouTube audio or
captions (private APIs, WebView interception, agreements). AtoEnglish
copies the product shape only; acquisition stays inside
`YOUTUBE_PLATFORM_BOUNDARY.md`.

## Consequence for AtoEnglish

The owner's call, implemented in this mission: the extension changes from
runtime dependency to importer; `content_transcripts`/`shared_transcripts`
become the account/library scopes of one `TranscriptResource` model;
`POST /api/transcripts` is the surface-agnostic sync endpoint; PWA
`share_target` + `/share` give mobile the Share-sheet path eJOY uses
(within PWA limits — iOS Safari does not support share_target).
