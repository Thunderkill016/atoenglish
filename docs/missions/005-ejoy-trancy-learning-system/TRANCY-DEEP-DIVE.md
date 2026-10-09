# Trancy Deep-Dive Research

> Owner request: "Lấy Trancy làm mẫu… nghiên cứu kỹ Trancy, đọc repo và trang web thật chi tiết trước khi build."
> Research date: 2026-10-06. No code written. All artifacts under `/tmp/trancy-research/` (manual/, site/, blog/, player/, extension/).
> Evidence types: **[DOC]** official docs/marketing, **[CODE]** read from the public extension package, **[LIVE]** observed HTTP/UI behavior, **[INFER]** our inference.

## 1. What Trancy actually is (verified)

Trancy (L2D LIMITED) is a **closed-source commercial product**. There is **no official public source repository** — GitHub search returns only unrelated projects and SEO spam. The "repo" material available for study is the **published Chrome extension package** (public, downloadable CRX, v7.9.4, 5.5 MB, ~300k users, 4.71★) and the obfuscated-but-readable JS inside it. **[LIVE][CODE]**

Product surface:

- **Browser extension** (Chrome/Edge/Firefox): content scripts inject a learning layer on YouTube, Netflix, Disney+, Udemy, Coursera, TED, edX, HBO Max, Bilibili, Vimeo (manifest `content_scripts.matches`), plus web-page translation on `<all_urls>`. **[CODE]**
- **Learning Center** web app at `learn.trancy.org` (requires login; email/Google/Apple via `api.trancy.org/1/{google,apple}/authURL`). **Fully captured live with a logged-in free account** — see §5. **[LIVE][CODE]**
- **Marketing site** `www.trancy.org` (Next.js): public `/youtube/<id>` player pages exist in the sitemap but **currently all return HTTP 500** — the public web player is effectively dead; the real player lives behind login in the Learning Center. **[LIVE]**
- **Mobile apps** iOS (`id6475022743`) and Android (`org.trancy.app`) — YouTube-focused, podcast on iOS. **[DOC]**
- **Trancy Air** — new macOS/Windows system-wide translator app (v7.9.3, Sept 2026). **[DOC]**
- **PDF AI Translator** at `learn.trancy.org/pdf` — PDF→Markdown extraction (OCR, formulas/tables), bilingual view, AI screenshot Q&A. **[DOC]**
- Backend API: `https://api.trancy.org` — versioned routes `/1/*`, `/2/*`, `/3/*`, `/6/*`. **[CODE]**

## 2. Core architecture learned from the extension code **[CODE]**

### Subtitle pipeline (YouTube)

1. Content script reads `ytInitialPlayerResponse.captions.captionTracks` from the page.
2. Checks Trancy cache: `GET /2/youtube/captions/{videoId}/status?target={lang}&source=json3`.
3. On miss, client downloads the **json3** track from YouTube itself (`timedtext …&fmt=json3`, replaying device params `cbr/cver/cos/cplatform` taken from `ytcfg` or context URL) and `POST /3/youtube/captions` to upload it → server caches processed captions for everyone ("shared, cached" per docs).
4. `GET /1/youtube/captions/{id}?target=` returns processed tracks. Line ids are `sid = "{vid}:{start}:{end}"`.
5. **Client-side normalization**: json3 `events[].segs[]` → classified into routes — `word` (>50% segs carry `tOffsetMs`, i.e. word-timed ASR), `block` (punctuated), `pair`, `line` — then converted to timed lines and split into sentences by a language-aware splitter (`maxLength` per language, punctuation regex `[.!?…]` plus CJK/Arabic/Devanagari marks). This is their "smart sentence segmentation" — **it runs in the extension**, not the server (for json3).
6. **Translation is client-side**: batches subtitle texts (~3000 chars/chunk, 10 parallel batches) through the selected engine via `translateWithEngine` with cache. Default engine = `google-translate` (free `translate_a/t?client=gtx` endpoint — the same trick we planned). Premium AI engines call `api.trancy.org` proxies (`/v1/chat/completions`, `/v1/messages`, `/v1beta/models/...`) or user's own key direct to provider.
7. **AI Subtitle (Whisper)**: `GET /3/youtube/captions/{vid}?target={lang}&source=audio` returns server-side Whisper transcription **with word-level `tokens`**. Server-side queue (`/2/youtube/queues`), 2–5 min, Premium-gated 40/day (60/day Advanced). Cached and shared between users.

### Provider registry (worth stealing the _idea_)

`background.js` embeds a declarative **provider registry**: 16 providers (`openai, siliconflow, anthropic, gemini, deepseek, glm, grok, openrouter, tencent, baidu, aliyun, qwen-mt, doubao, deepl, google-translate, microsoft-translate`), each with `protocol` (openai-chat / anthropic-messages / google-generative), `auth` kind, `endpoint.direct` + `endpoint.proxy` (api.trancy.org), `bodyMapping`, `responseMapping` (`textPath`, `streamDeltaPath`), `capabilities` (streaming, batchTranslate, customBody, reasoningEffort…), and `conditionalOverrides` (e.g. strip `temperature` for gpt-5 models). This is how they support BYOK for ~everything without per-provider code. **[CODE]**

### Other endpoints observed

`/1/words`, `/1/sents`, `/1/sentences/grammar`, `/1/word/definition`, `/1/word-contexts`, `/1/wordbooks`, `/2/wordbook/words`, `/2/videos`, `/2/sentences`, `/2/sentences/keyphrases`, `/2/summary`, `/2/grammar`, `/3/translations`, `/1/translation`, `/1/tts/speech`, `/1/meta` (external-dictionary schemes), `/1/user(/profile|/attributes)`, `/1/stripe/portal`, `/1/notification`, `/6/rules?device=desktop`, `/evaluations`, `/practice/typing`, `/practice/speech`. Player routes inside the extension UI: `/player`, `/player/collection/{word,sentence}`, `/player/options/{shortcuts,theme,language,highlight-theme,font,export-subtitle}`, `/player/aiplaylist`. **[CODE]**

### External dictionaries are server-configured

`GET /1/meta?recomendation=true` returns dictionary schemes (`Oxford`, `Collins`, …) with URL templates `$FROM/$TEXT`, popup options, and from/to language filters — so "external dictionary" links are data-driven per language pair. **[LIVE]**

## 3. Feature inventory (what the product really does)

### Player modes — confirmed 3 view modes + practice **[DOC][CODE]**

- **Theater Mode**: dim everything, video centered, dual subtitle overlay, loop/speed/lookup in place.
- **Read Mode**: video shrunk to the side; segmented bilingual transcript as scrollable text; click a line to seek; word/sentence save buttons per line; font controls.
- **Practice Mode** (`P`): line-by-line trainer. Embedded UI strings show 5 modes: `modelisten` **Listening** (dictation), `modespeech` **Speaking** (shadowing with recording), `modeselect` **Selection** (multiple-choice-ish), `modefill` **Filling** (fill-in-the-blank typing), `modetyping` **Dictation**. Scores accuracy + combo ("PracticeAccuracyRate", "PracticeCorrect/Wrong").
- Subtitle display modes: `oneline` (primary only), `multiline` (bilingual), `none` (hide).

### Keyboard shortcuts — confirmed in 7.9.4 changelog **[DOC]**

`Ctrl/Cmd+E` toggle Trancy, `A` prev line, `S` replay current line, `D` next line, `Q` auto-pause per line, `R` loop line, `P` practice, `M` theater/read, `Esc` exit, `?`/`/` shortcut help, `Space` play/pause, `↑` back 2s, `C` collection, `Alt+W/F` fullscreen, `=`/`-` font size, `]`/`[` subtitle width, `Alt+Z` toggle translation, `Alt+V` toggle video, `Alt+A` toggle word hiding, `|` toggle sentence segmentation, `Alt+C` caption toggle (manifest `commands`). Strings also include `ShortcutCopyCurrentSubtitle`.

### Word & sentence collection **[DOC][CODE]**

- Click word in subtitle → detail panel: syllable split, IPA, meaning; tabs **Sentence / OpenAI / Synonym**; "Saved sentences" + "Other sentences" (other lines containing that word); external-dictionary links (Oxford/Collins…).
- Save word (with pronunciation, meaning, source sentence+video+timestamp) / save sentence (with translation & context) / save video (Watch Later, shows collected-word count per video).
- Word states: Save / Known / Forgotten (`TooltipSaveWord`, `TooltipKnowWord`, `TooltipForgotWord`); saved words **highlighted inside subtitles**; per-video word list generation (7.9.4: "gather useful words from the current subtitles").
- Free limits: **100 words, 50 sentences**; Premium unlimited. **[DOC]**
- Hover-to-lookup in subtitles + word-by-word highlight (7.9.0).

### Learning Center (learn.trancy.org) **[DOC][CODE]**

- Watch Later (video library w/ duration, saved-word count, share) → live route `/saved`.
- Vocabulary: "Words to learn" vs "Already known" tabs, batch manage, word import (`/wordbook-import`), audio, **Flashcard Practice — the only confirmed free LC feature**. New Wordbook + Learning Wordbook (premium). Live: `/vocab-mode`, `/flashcard-home`, `/word-clean`.
- Practice: `/practice/typing`, `/practice/speech`, `/evaluations` endpoints; mistakes tracked per exercise+source: `GET /1/practice/mistakes?type=typing&sourceType=youtube&sourceId={vid}`. **[LIVE]**
- **FSRS is real**: changelog 7.9.3 — "Saved words and sentences sync to Trancy's Learning Center with **FSRS spaced repetition**." No FSRS strings in extension code → scheduling is server-side.
- AITalk: ChatGPT-based scenario conversations (custom "scenes"), follow-up & free-dialogue modes, voice or text input, Microsoft TTS voices, **Microsoft speech assessment** scoring, smart tips, authentic-expression suggestions. Premium. Live routes: `/talk-home`, `/aitalk-center`, `/talk/:id`, `/talk-report/:id`.
- AI Shadowing (LC, premium), AI Learning Assistant (premium), AI video summaries (10/day premium, 50/day adv — live button "Phiên âm AI" on practice page), channel subscriptions (YouTube + podcast search/subscribe, Learning Center 2.0 → live `/3/youtube/channels`, `/3/podcasts`).
- Reading surface we missed in docs: `/book-home`, `/library`, `/epub-reader/:id`, `/reader/:id` + `/1/shelf`, `/1/reading`, `/1/shelf/reading-stats` — a full ebook/reading wing. **[LIVE]**
- Assessments: `/assessment-home`, `/assessment/:id`, `/assessment/new`. Sentence-pack builder: `/sentence-pack-studio`, `/word-clean`. **[LIVE]**
- 6 devices per account; settings = UI language / mother tongue / learning language (10 learning languages)/theme.

### Web translation (out of our scope but in their product) **[DOC][CODE]**

Selection/hover translate, sentence translate w/ AI parse, part-of-speech tagging, unknown-word highlight, full-page bilingual "immersive" translate (`/6/rules` site rules engine), custom engines + BYOK. Built on separate bundles (`ld-main`, `tagger-main`, `edreader-main` — Reader for web articles/ebooks).

### Pricing (observed 2026-10) **[LIVE][DOC]**

- Free: bilingual subs, web translate, unlimited lookup, subtitle export (PDF/CSV), Google+Microsoft engines, custom engines, 100 words/50 sentences, PDF 50 pages/mo.
- Premium (~$3.49/mo ref): AI Subtitle 40 vids/day, PDF (2000 card / 4000 table — **their own pricing is inconsistent**), unlimited collections, AI definitions/grammar/POS, AITalk + pronunciation eval + shadowing + assistant, AI summaries 10/day, premium themes, Azure TTS.
- Premium + Advanced AI (~$8.79/mo ref): GPT-5-mini, GPT-4.1 mini, DeepSeek V3/V4, Claude 4.5 Haiku, Gemini 2.0/3.0 Flash; ~20M tokens/mo; 60 AI subs/day; summaries 50/day.
- Refund: 7d monthly / 30d yearly. Trial exists. iOS prices higher.

## 4. What we should copy vs not (implications for AtoEnglish)

| Trancy thing                          | Verdict for AtoEnglish | Why                                                                                |
| ------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| Read-mode layout (video side + lines) | **Copy**               | Core of the product; matches our /watch plan                                       |
| A/S/D line nav, Q autopause, R loop   | **Copy**               | Cheap, high-value interaction                                                      |
| Smart sentence segmentation           | **Copy concept**       | json3→route-classify→split; do our own impl. They keep it client-side too          |
| Client-side batched translation       | **Copy concept**       | Free google gtx endpoint, 3k-char chunks, cache — same approach we already specced |
| Word detail panel (IPA, tabs, dicts)  | **Copy shape**         | Sentence / AI / Synonym tabs + external dict links (server-driven scheme list)     |
| Save word/sentence/video + highlight  | **Copy**               | `sid = vid:start:end` style line identity is a good model                          |
| Word states: learning/known/forgotten | **Copy**               | 3-state model simpler than our card model; maps to FSRS states                     |
| FSRS                                  | **Use ts-fsrs**        | Confirmed Trancy uses FSRS (server-side); we already planned it                    |
| Watch Later library + word counts     | **Copy**               | matches /library                                                                   |
| Practice Mode 5 exercise types        | **Copy subset**        | Filling + Dictation + Speaking first; Selection later                              |
| Subtitle export PDF/CSV               | Defer                  | Nice-to-have                                                                       |
| Provider registry pattern             | **Copy pattern**       | Declarative engine config beats hardcoding per-provider                            |
| Server caption cache ("shared")       | **Copy concept**       | Cache processed captions per video; big cost saver                                 |
| Two-tier dict (static DB + SSE AI)    | **Copy**               | Instant structured vi def + streamed AI card; verified live §5.3                   |
| Token NLP on captions (lemma/pos/dep) | **Copy concept**       | Enables lemma dedup, POS-aware exercises; server-side in theirs §5.4               |
| Heartbeat play-progress (delta/3s)    | **Copy**               | Watch-time + resume in one call §5.5                                               |
| `?updatedAt=` incremental sync        | **Copy**               | Simple cross-device sync watermark §5.5                                            |
| Static-JSON wordbooks on CDN          | **Copy**               | Cheap curated vocab books §5.6                                                     |
| Whisper AI subtitles                  | Defer                  | Needs audio download + GPU/$$; Trancy gates it Premium 40/day                      |
| AITalk, pronunciation scoring         | Defer                  | Microsoft speech assessment + ChatGPT; heavy                                       |
| Web/PDF/Reader translation            | Reject (for now)       | Separate product surface; not our direction                                        |
| Browser extension itself              | Reject (for now)       | Web-app-first decision stands; also means no Netflix/etc (content scripts needed)  |
| Mobile apps, Trancy Air               | Reject                 | Later phases                                                                       |
| Netflix/Disney+/etc platforms         | Reject                 | Requires extension + DRM'd caption scraping; YouTube-only MVP                      |
| BYOK custom engines                   | Defer                  | v2 monetization/power feature                                                      |

### Things their code/doc warns us about

- Auto-caption json3 needs **device params** (`cbr`, `cver`, `cplatform`…) to download reliably — we hit 429 testing plain `tlang=vi`; Trancy downloads json3 **from the user's browser with real session params** (works because extension runs on youtube.com). Our web app fetches server-side — different threat surface; must test from Cloudflare Worker/our server IP, keep the "user uploads/pastes captions" fallback. **[INFER]**
- OpenAI engines excluded from _subtitle_ translation — their FAQ: sentence-breaking quality; they only use LLMs for fulltext/sentence translate + features. Batch MT (Google) for bulk, AI for point lookups. Same split makes sense for us. **[DOC]**
- Sentence `sid = vid:start:end` — cheap stable identity for saved contexts. **[CODE]**
- Their own docs are internally inconsistent (PDF limits 50/2000/4000; shortcut table stale; manual itself flags "EDITOR TODO: verify in-product") — trust code + live behavior over marketing. **[DOC]**

## 5. Learning Center — authenticated live capture (2026-10-06, free account) **[LIVE]**

Captured with a real logged-in free account over remote-debugging Chrome. Full request log: `/tmp/trancy-research/live/network.jsonl` (~900 requests); page texts under `/tmp/trancy-research/live/`.

### 5.1 Route map (all verified reachable)

```
/home  /youtube  /youtube/recommendations  /podcast  /movie  /book-home
/flashcard-home  /sentence-shadowing  /talk-home  /aitalk-center  /materials
/library  /history  /topics  /saved  /assessment-home  /vocab-mode
/advanced-ai  /word-clean  /sentence-pack-studio(/:id)  /practice/<videoId>
/assessment/:id  /assessment/new  /book-editor  /epub-reader/:id  /reader/:id
/talk/:id  /talk-report/:id  /shadowing/:id  /sentence-lists/:id  /topic/:topic
/wordbook-import  /review-vocabulary  /flashcard  /share  /setup  /settings  /ai-engine
```

Global `Ctrl+K` search/discovery. The product is much wider than "subtitle extension + review": it is a full content-consumption-and-practice suite (YouTube, podcasts, movies, books/epub, AI talk, assessments, PDF, materials).

### 5.2 Practice player anatomy (`/practice/<videoId>`)

- Embedded YouTube player + scrollable bilingual transcript: each line = timestamp + EN sentence + vi sentence + `copy`/`save-sentence` buttons (`btn-meta-action` classes).
- Controls: play/pause, prev/next line, **AB loop**, speed popover, caption popover, subtitle count badge ("Phụ đề 271"), "Phiên âm AI" (AI summary) button, "Bản dịch tốt / Bản dịch kém" (translation quality rating per line), 3 right-sidebar tabs (`practice-sidebar-tab`).
- Click a word → `dict-drawer` slides in (see 5.3).
- Nags free users: "Cài đặt/bật tiện ích trình duyệt để tải phụ đề nhanh hơn" — the LC deliberately pushes the extension (caption fetch is faster client-side).

### 5.3 Word lookup = two-tier, both verified

1. `GET /2/words/{word}?target=en&native=vi` → **server bilingual dictionary DB**:
   `{"_id","stl":"en_vi","text","dict":[{"pos":"tính từ","terms":["đầu tiên",…],"entry":[{"word":"<vi>","reverse_translation":["first","early",…]}],"base_form","pos_enum":3}]}`. Fast, structured, per-POS vi terms with reverse translations — this is a real dictionary dataset, not LLM output.
2. `POST /1/word/definition {text,target,native,useCache:true}` → **SSE stream** of a YAML-ish AI dictionary card (id `en_vi_first_260303`): etymology (localized), examples with vi translations, phrases, synonyms, related words.
3. Drawer UI: US/GB IPA, POS sections (each: vi terms + English gloss + en/vi example), plural forms, etymology, phrase list (at first, first of all, first name…), synonyms + related words with vi gloss, **"Ví dụ từ video · N"** (other lines in this video containing the word). Paywall string present: "Nâng cấp để xem định nghĩa chính xác" — deep AI sections gated, base dict free.

### 5.4 Captions API — the money payload

`GET /3/youtube/captions/{vid}?target=en&source=json3` → 271 lines, each:
`{start, end, text, sid, stared, tokens:[{text, lemma, pos, dep, meta}]}`
**Every token is NLP-annotated server-side**: lemma ("raided"→"raid"), POS (`NOUN VERB ADP DET AUX PRON PART PUNCT`), dependency (`nsubj ROOT pobj det auxpass punct xcomp advmod`…). `stared` = saved flag inline. The vi line is NOT in this response → translation still client-side even in the LC web app. Companion calls: `/3/youtube/videos/{vid}?target=en` (metadata), `/2/videos/youtube:{vid}` (saved state), `/2/youtube/captions/{vid}/status` (cache check), `/1/practice/mistakes?type=typing&sourceType=youtube&sourceId={vid}` (per-exercise error history).

### 5.5 Progress & sync model

- `PUT /3/play-progress` fires ~every 3 s during playback: `{resourceId, resourceType:"youtube", language, deltaDuration:3.04, position, totalDuration, dateKey:"YYYY-MM-DD"}` → server accumulates `duration` (watch-time stats) + last `position`. Heartbeat-delta design, not absolute writes.
- `GET /3/play-history` for history page.
- `GET /4/words?updatedAt=0` — incremental sync by `updatedAt` watermark, polled on every page nav (16× in the capture). Same pattern for `/2/sentences?target=&native=`.
- `PUT /1/flashcard/settings {autoMeaning, autoPronunciation, typing}`.

### 5.6 Catalog/content APIs (verified shapes)

| Endpoint                                                                         | Shape (interesting fields)                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/3/youtube/channels`                                                            | curated channels `{follow, recommend, poster(via /1/ytc_avatar proxy), title, videoCount, subscriberCount, id:"UC…", genres:["vlog","tech","talk","education",…]}`                                                                                                                                         |
| `/1/wordbooks`                                                                   | curated book catalog `{name:"CEFR_basic", title(localized vi), description, count:1425, source:"static.trancy.org/wordbook/wordbook_en/CEFR_basic.json", target, cover}` — **wordbooks are static JSON files on CDN**: BEC, CEFR A1/B1-B2/C1/beginner/intermediate, IELTS, TOEFL, GRE, GMAT, COCA, CET, IT |
| `/1/sentence/groups`                                                             | AI-generated sentence packs `{name(vi), category:"travel/health/career/life/education", emoji, prompt(original zh prompt stored verbatim!), length, target, locale}`                                                                                                                                       |
| `/1/shadowing/series`                                                            | shadowing courses `{slug, title+description(localized), category:"school/work", course_list:[ids]}` — TOEFL speaking mock, IELTS full test, workplace small talk                                                                                                                                           |
| `/1/practice/sentence-lists`                                                     | **Movies as content**: `{title:"Runner"/"Princess of the Row", type:"movie", category:["Drama",…], description(TMDB-style), metadata:{level:2,tags}, visibility:"public", featured, year}` — sentence lists built from film dialogue                                                                       |
| `/2/translator/engines`                                                          | `{quota:{tokens,dayTokens,dayFreeTokens,…}, engines:[{type:"built-in"                                                                                                                                                                                                                                      | "trancy", provider, model, name, enabled, role, available}]}`. Free sees Google + SiliconFlow `available:true`; trancy-hosted DeepSeek V4 Flash / GPT-5.6 Luna / GPT-5-mini `available:false` |
| `/1/tts/voices`                                                                  | Azure voice catalog `{provider:"azure", voiceId, displayName, locale, gender, previewUrl(static mp3), marks:"native", localeName(localized)}`                                                                                                                                                              |
| `/1/pdf/quota`                                                                   | `{quota:50, count:0}` — confirms free 50 pages/mo                                                                                                                                                                                                                                                          |
| `/1/conversations` `/1/topicMessages` `/2/topics` `/1/topics` `/1/vision-topics` | AITalk state + topic system                                                                                                                                                                                                                                                                                |
| `/1/shelf` `/1/reading` `/1/shelf/reading-stats`                                 | ebook shelf + reading stats (books wing)                                                                                                                                                                                                                                                                   |
| `/1/statis` `/2/materials` `/1/materials`                                        | stats + learning materials                                                                                                                                                                                                                                                                                 |
| `/1/meta` (76 calls)                                                             | shared config/dictionary schemes, fetched per page                                                                                                                                                                                                                                                         |

Auth: `GET /1/google/authURL` → Google OAuth → `GET /1/google/authcallback` → `/1/google/profile` → `/1/user/profile` + `/1/user/attributes` + `/1/user/marketing-email-preferences`.

## 6. What remains unverified

- Inside-session UX details: flashcard drill screen, FSRS grade buttons/parameters (server-side), AITalk live conversation + speech-scoring UI, assessment flow, epub reader internals, PDF translator workflow.
- Whisper pipeline internals (audio fetch method; only status/queue endpoints seen).
- Whether `/youtube/<id>` public marketing player ever worked (all 500 now).
- Premium-only behaviors (we tested a free account — paywalled surfaces render but paid internals don't run).
- Exact word/sentence save POST payloads (save click didn't reach the network log; `/2/sentences` GET shape confirmed).
- Learning-language list (docs say "up to 10").
- Trancy's learning effectiveness — no evidence; treat as UX precedent only.

## 7. Proposed Trancy-MVP mapping for mission 005 update

Trancy's actual core loop = **watch (bilingual segmented subs) → click word/sentence → save → practice in place + review later**. Our MVP:

1. `/watch` = Read-Mode-style player: embedded YouTube iframe + segmented bilingual transcript sidebar, per-line controls (loop, autopause, prev/replay/next via A/S/D/Q/R), speed.
2. Word click → detail panel (phonetic/IPA when we have it, vi meaning via AI/dictionary, "other sentences with this word in this video", external dict link, Save/Known/Forgotten).
3. Save sentence (one click per line) + save video (Watch Later = `/library`).
4. Practice Mode v1: Filling (fill-in-blank) + Dictation per line; Speaking/shadowing = record+compare later.
5. `/review` FSRS on saved words+sentences (ts-fsrs as planned).
6. Deferred explicitly: AI subtitles, AITalk, pronunciation scoring, extension, other platforms, BYOK, PDF/web translate, summaries, subscriptions.

New items surfaced by the live capture that should shape the MVP:

- **Two-tier word lookup**: fast static dictionary DB (per-POS vi terms + reverse translations) for instant display, AI card (SSE-streamed, cached by `en_vi_word_id`) for depth. Do the same: curated/static dict first, Gemini card second. **[LIVE]**
- **Server-side NLP on captions**: every token carries `lemma/pos/dep` — enables word-level click, lemma-based dedup for vocabulary, POS-aware fill-in-the-blank, "other sentences with this lemma". Worth building into our caption pipeline (e.g. compromise/wink-nlp client-side, or small spaCy offline job) rather than plain text lines. **[LIVE]**
- **Heartbeat progress**: `deltaDuration` every ~3 s keyed by `dateKey` — cheap watch-time analytics + resume position in one call. **[LIVE]**
- **Incremental sync**: `?updatedAt=` watermark polling for words/sentences — simple cross-device sync model to copy. **[LIVE]**
- **Curated catalogs are flat JSON on CDN** (wordbooks) or DB lists (channels, movies, shadowing series, sentence packs) — our curated video library + starter wordbooks can ship the same way, no recommendation engine needed v1. **[LIVE]**
- **Content beyond video**: their movie/book/podcast/assessment wings show the long-term shape, but all are "content repackaged into sentence lists + practice" — the same primitive everywhere (sentence → tokens → practice). Design our data model around that primitive. **[INFER]**

## 8. Source list

- `manual.trancy.org` — 24 pages fetched as markdown (`/tmp/trancy-research/manual/`).
- `www.trancy.org` — 11 product pages HTML+text + sitemap 624 URLs + changelog (5 pages exist; page 1 read) (`/tmp/trancy-research/site/`).
- Blog: 93 posts saved (`/tmp/trancy-research/blog/`).
- Chrome Web Store CRX `mjdbhokoopacimoekfgkcoogikbfgngb` v7.9.4 unpacked + prettified (`/tmp/trancy-research/extension/`).
- `learn.trancy.org` — **authenticated full crawl**: ~900 logged requests (`/tmp/trancy-research/live/network.jsonl`), per-page innerText dumps, practice-player + dictionary-drawer text captures.
- No official OSS repo exists (verified via GitHub search + org lookup). License: proprietary — we may take ideas/architecture, **not** code or assets.

## 9. Public surface sweep (09/10/2026, Playwright unauthenticated)

Re-captured all public surfaces via Playwright + direct fetches (`/tmp/trancy-research/` — ephemeral). Findings below.

### 9.1 Per-page feature inventory (trancy.org/vi/*)

| Page | Status | Features listed |
|---|---|---|
| `/` (vi) | 200 | Product pillars: bilingual subs (theater + read mode), AI word lookup, AI grammar analysis, NLP sentence segmentation, listen/speak practice, selective + full web translation, sentence/word translate, POS tagging, unfamiliar-word highlight, Watch Later, sentence library, speed control, font adjust, TTS, external dictionary links, keyboard shortcuts, speech recognition |
| `/aichat` | 200 | AITalk: ChatGPT dialogue trainer, Microsoft speech assessment scoring, follow-up mode + free-dialogue mode, one-click smart tips, original-text translation, realistic + custom scenes |
| `/ai-subtitle` | 200 | Whisper transcription pipeline: async 2–5 min, ~80% better segmentation claim, shared cache across users, Premium (40/day; 60/day on Premium+AI) — YouTube only |
| `/pdf` | 200 | PDF AI translator: markdown extraction via AI, OCR for scanned PDFs, bilingual compare, parallel reading, screenshot Q&A, Alt shortcut, word highlight, phrase select, autoscroll |
| `/trancy-air` | 200 | Desktop app (macOS/Windows): translate-in-place, double-tap Ctrl word lookup, sentence translate + grammar, compare 5 engines side-by-side, Compose window, screenshot OCR (local + Google), voice transcription + filler cleanup, pronunciation practice scored per word, collections sync → Learning Center FSRS |
| `/mobile` | 200 | iOS/Android apps: YouTube channel sync/subscriptions, shadowing, AI video summaries, personalized settings; podcast live on iOS |
| `/download` | 200 | Browser matrix: Chrome/Edge/Firefox/Safari/360/Brave/Arc/Others — extension is the main desktop surface |
| `/pricing` | 200 | See 9.3 |
| `/changelog` | 200 | Migrated from better.trancy.org/changelog — see 9.4 |
| `learn.trancy.org/*` | login wall | All routes 200 + sign-in page unauthenticated (email/Google/Apple) |

### 9.2 Manual facts (manual.trancy.org, 24 md pages)

- **8 subtitle platforms**: YouTube (desktop+mobile, AI Subtitle too), Netflix, Disney+, Udemy, Coursera, TED, edX, HBO Max (desktop only).
- **Three view modes**: Theater (video-centered, dimmed), Read (video aside, scrollable text — click line → play that line, save words/sentences), Practice (line-by-line exercises).
- **Practice Mode methods**: Filling (fill-in-blank, accuracy+combo scored realtime), shadowing/oral, dictation, word-mastery retype; AI grammar analysis inside; Esc exits.
- **Keyboard shortcuts** (verified ones): `Cmd/Ctrl+E` start, `J` auto-pause, `R` loop, `A/S/D` practice controls, `Esc` exit; configurable bindings; most others unverified.
- **Subtitle export**: PDF or CSV — free; options for saved/highlighted words, timestamps, collected-only.
- **Engines**: free = Google + Microsoft; Premium = DeepL + AI engines (GPT/Claude/Gemini/DeepSeek/Meta/Grok); BYOK custom API; OpenAI deliberately not used for subtitle translation (sentence-breaking quality issue).
- **Learning Deck**: Watch Later (saved videos w/ word counts), Practice Sentence (sentence library w/ translation + context + audio), Practice Words (vocab w/ example sentence + learning/known lists + batch + manual add), Flashcard Practice = the one confirmed free LC feature; account settings; 6 devices per account.
- **AITalk**: ChatGPT-based scenarios, Microsoft speech assessment multi-dimensional scoring, TTS replies, smart tips, custom scene creation guide (ChatGPT prompt walkthrough).
- **Wordbook import**: vocabulary import is Premium ("Premium Wordbook").
- **Storage quotas (free)**: 100 words, 50 sentences — enforced.

### 9.3 Pricing (verified 09/10)

| | Free | Premium | Premium + Advanced AI |
|---|---|---|---|
| Price (VN region) | — | 89.000₫/mo or 849.000₫/yr (~71k/mo) | 249.000₫/mo or 2.199.000₫/yr (~183k/mo) |
| Saved words/sentences | 100 / 50 | Unlimited | Unlimited |
| AI YouTube subs | No | 40/day | 60/day |
| PDF pages | 50/mo | 2.000/mo | 4.000/mo |
| AI video summaries | No | 10/day | 50/day |
| AI word def / AI shadowing / AI assistant / pronunciation assessment / AITalk | No | Yes | Yes |
| Advanced engines + ~20M tokens/mo | No | No | Yes |
| 14-day refund | — | ✓ | ✓ |

Note: manual's comparison table says free PDF = 50 pages/mo but the plan card says Premium 2.000 pages/mo — sources internally inconsistent; in-product behavior authoritative.

### 9.4 Changelog timeline (trancy.org/changelog, newest→oldest)

- **V7.9.4 (18/09/2026)**: Vimeo support, YouTube subtitle keyboard control (A prev / S replay / D next / Q pause-each-line / R loop), word-list-from-current-video + saved-word highlight, better word explanations via sentence+nearby-subtitle context.
- **V7.9.3 (08/09/2026)**: Trancy Air 1.0.0 — full desktop feature set (translate-in-place, hotkey lookup, 5-engine compare, Compose window, screenshot OCR, voice + filler cleanup, per-word pronunciation practice, collections→LC FSRS sync).
- **V7.9.0 (23/07/2026)**: hover word lookup, click for AI definitions, YouTube word-by-word highlighting.
- **V7.8.9 (29/05/2026)**: Trancy Reader 1.0 — word+sentence translation, side-by-side, unfamiliar-word highlight for books/EPUB.
- **V7.8.6 (17/04/2026)**: Learning Center 2.0 — bilingual player for YouTube/podcast/movies, 3 view modes, loop + auto-pause, shadowing + pronunciation assessment, AI subtitle transcription, multiple AI engines, subtitle export; NEW AITalk UI (role switching, difficulty, AI assessment report); channel subscriptions w/ realtime updates.
- **V7.8.0 (05/03/2026)**: vocabulary batch delete/export, immersive word review page, AI word lookup on LC homepage, video resource library; iOS 2.8.0 podcast + channel search.
- Older: Bilibili subs, Gemini 3 + GPT 5.2 engines, 700k users, LC 3.0 planned for 2026.

### 9.5 Implications for AtoEnglish (read-only, no commitment)

- Trancy keeps expanding the same primitive (content → sentences → tokens → practice) into new substrates: books (Reader), desktop (Air), PDF. Our text `/read` + video `/watch` already cover the two substrates most valuable to our users; PDF/desktop remain out of scope.
- Their free tier is deliberately thin on the LC side (100 words / 50 sentences, flashcards only). Ours is unlimited-but-honest — that's a real differentiator, not a gap.
- Two things they ship that we haven't: **Watch Later** (save-video queue — we have per-video save via library but no explicit "watch later" list semantics) and **channel subscriptions** (catalog push). Both are deferrable; current scope stays as-is per SPEC.
- Word-list-from-video + saved-word highlighting shipped V7.9.4 — we already have saved-word highlighting (C4).
- The pricing inconsistency in their own manual (50 vs 2.000 PDF pages) is a good reminder to keep our `/me` evidence copy honest and consistent.

## 10. Authenticated Learning Center capture (09/10/2026, free account)

Playwright persistent profile, Google OAuth login, headless crawl of 29 routes. Account: `premium:false`, `AIEngineActive:false`, JWT issued via `/1/user/profile`. Artifacts in `/tmp/trancy-research/live/` (ephemeral): per-route `text/*.txt`, `shots/*.png`, `network.jsonl` (260 API requests).

### 10.1 Route map — what each page actually is

| Route | Observed content |
|---|---|
| `/home` | Dashboard: YouTube feed + Podcast + AI Talk course cards + Premium upsell + **streak calendar + flashcard stats + activity heatmap + progress chart** |
| `/youtube`, `/library` | Content catalog: duration, channel, age, category (Sports/News/Arts...), difficulty tier (`Advanced`/`B1`/`B2`); "Edit featured" |
| `/youtube/recommendations` | **Discover Channels wizard**: 12 learning languages, vocab level (Beginner/Intermediate/Advanced), interest tags pick-1-8 (vlog/tech/ai/psychology/...), count selector |
| `/podcast` | Empty + "Add subscription" + Favorites/History/Followed tabs |
| `/movie` | Movie catalog: category list (Action→Western) + level filter — movies = sentence-list containers |
| `/book-home` | **Trancy Reader shelf**: empty state "Upload book", daily 20-min reading goal, weekly stats |
| `/sentence-shadowing` | AI Shadowing library: tabs YouTube/Podcasts/Sentence Packs/Movie; packs incl. "Everyday English 2000", Famous Quotes ×3 levels, Proverbs, slang |
| `/assessment-home` | Same AI Shadowing grid — sentence packs per topic (hospital, airport, hotel, IELTS self-intro, TOEFL essays, slang...) w/ sentence counts |
| `/talk-home` | AITalk course catalog: TOEFL mock (10), IELTS (8), workplace small talk, meetings, interviews, remote work... each with N courses |
| `/vocab-mode` | **Immersive Vocab flashcard**: word + US IPA + POS sections + vi meanings + example sentences (EN+VI) + "Detailed Definition" + "Mastered" button + `M` hotkey |
| `/flashcard-home` | Flashcard dashboard: Target 0/10, Learn/Review/Learning counters |
| `/review-vocabulary` | Vocabulary list: Learning/All/Recent/Today's Review/By-date; "Choose a learning wordbook" |
| `/wordbook-import` | Import UI: file drop `.txt/.csv`, words-only (sentences filtered), manual paste, preview → create wordbook |
| `/word-clean` | Minimal "steal · Delete" — likely word cleanup tool |
| `/topics` | "AI Tutor" default topic entries |
| `/share` | Referral: invite link `trancy.org?referrer=<id>` → both sides get 10 days Premium; anti-bot rule |
| `/history` | Watch history w/ "Clear" + per-item resume |
| `/saved` | Saved videos (empty state) — Watch Later surface |
| `/settings` | Account (email/membership/change-email/reset-pw/**delete-account**/logout), Language (UI/mother/learning), Preferences (theme, translation engine, TTS voice select, auto-pronounce, UI sounds, marketing emails) |
| `/setup` | Onboarding: native language + learning language picker |
| `/advanced-ai` (= `/ai-engine`) | Translation Engine Settings: Google built-in, **SiliconFlow FREE**, DeepSeek V4 Flash, GPT-5.6 Luna, GPT-5-mini/nano, Claude Haiku 4.5, Gemini 3 Flash + **Add Custom Engine (BYOK)**; applies to plugin translation/subtitle/PDF |
| `/practice/{videoId}` | Bilingual transcript player: EN line + VI line per cue, timestamps, `Subtitles 63` count, `AB` loop control, `AI transcribe` button, "Install/Enable Extension" upsell for faster subtitles |

### 10.2 API map (api.trancy.org)

```
/1/user/profile            → JWT, premium flags, target/native langs
/1/meta                    → external-dictionary schemes (Oxford/Collins/Longman/Youdao URL templates, per-lang)
/1/wordbooks               → CEFR/BEC wordbook catalog → static CDN JSON word lists
/1/flashcard/settings      → { dailyWords:10, autoMeaning, autoPronunciation, typing }
/1/tts/voices              → Azure neural voice catalog (displayName, locale, previewUrl)
/1/shadowing/series        → AITalk course series (TOEFL/IELTS/workplace…, course_list ids)
/1/sentence/groups         → sentence packs — each stores the AI GENERATION PROMPT
/1/practice/sentence-lists → movies as sentence packs (metadata.level, category, featured)
/1/practice/mistakes       → practice mistake log (paged)
/1/conversations(+stats)   → AITalk convs + stats {talkDuration, convTotal, userTurns, streak, todaySentences}
/1/materials  /2/materials → two catalogs: v1 ejoy/voicetube-sourced (level 3/4≈B1/B2),
                             v2 cron-ingested (tier advanced, transcribedAt — transcription pipeline)
/2/videos  /3/play-history → saved videos; history rows w/ progress fraction + position
/3/youtube/captions/{id}   → cues: {start,end,text,sid,stared,tokens[{text,lemma,pos,dep,meta}]}
/2/translator/engines      → engine list + quota {role:1=free(Google,SiliconFlow), role:2=premium}
/4/words  /4/translations  → user words/sentences sync; /4/translations → 403 premium-gate on free
/1/topics /1/topicMessages → AI Tutor topics
/1/pdf/list  /1/reading    → PDF list / reading items (Reader)
/1/shelf(+reading-stats)   → book shelf + daily reading minutes
```

### 10.3 Free-account observations

- `/4/translations` returns `403 "AI cao cấp đã hết hạn, vui lòng nâng cấp."` — the premium gate is enforced server-side per endpoint.
- Free translation engines visible: Google (built-in) + **SiliconFlow marked FREE**.
- Practice page works fully on free: bilingual cues, AB loop, timestamps — premium layer adds AI transcribe/definitions.
- Home dashboard ships **streak calendar + activity heatmap + progress chart** — engagement mechanics are central to their LC (we deliberately keep these out).
- `sentence/groups` packs store the generation `prompt` field — AI-authored packs (e.g. "Big Bang long sentences for shadowing" written in zh prompt), localized via `locale:vi`.
- Materials v2 rows carry `isTranscribed` + `transcribedAt` — server-side transcription pipeline pre-processes catalog items; users see ready subtitles instantly.
- History rows carry `progress` fraction + `position` — resume support (heartbeat sync model confirmed earlier).

### 10.4 Implications (read-only)

- Their "free" tier: full subtitle/practice player works; the paywall sits on AI depth (definitions, translations v4, AITalk) + storage quotas — consistent with pricing.
- `Discover Channels` wizard = language+level+interests → channel recommendations; our `/discover` curated catalog covers the same job without infra.
- Reader (`book-home`) runs the same sentence-primitive with a **daily minutes goal** — yet another substrate of the same loop.
- Sentence packs with stored prompts show how they mass-produce practice content cheaply — relevant if we ever add curated packs (defer).

## 11. Authenticated interactive session capture (09/10/2026, free account)

Deeper interactive pass on the same session: real clicks, real saves, one live AITalk turn. Artifacts `/tmp/trancy-research/live2/` (ephemeral). Mutations made: 1 saved video, 1 saved sentence, 1 AITalk conversation — all low-risk, reversible.

### 11.1 Practice player internals (`/practice/{videoId}`)

- **Word click** on `.subtitle-word` span opens drawer: `GET /2/words/{word}?target=en&native=vi` (static dict: `dict[]` vi terms w/ reverse_translation, `explains[]`, `inflections{NN,NNS}`, `phonetics[]` per-locale US/GB) + `POST /1/word/definition` SSE YAML card (`{text,target,native,useCache:true}`, cached `_id: en_vi_{word}_{date}`) + client-side `translate.googleapis.com` call to translate example sentences. Drawer free content: IPA US/GB, POS vi meanings + EN glosses + bilingual examples, plurals, etymology, phrases, synonyms, related words, **"Examples from the video · N"**; premium gate inline: "Upgrade to see precise definitions".
- **Sidebar tabs**: `Subtitles` (63 cues), `Words` (Saved/Learning/All **210** — per-video word index), `Sentences` (saved-in-video), `Summary`.
- **`POST /2/summary`** `{id, subtitle:[{text,start,end}…]}` → SSE YAML (summary + timestamped Key points). **Works on free account** — summary is generated client-requested, not premium-gated here.
- **Settings panel**: Layout Default/Theater/**Focus**; Subtitle segmentation Default/Sentence/Phrase.
- **Save video (watch later)**: bookmark icon → `POST /2/videos {id}` → record `{vid:"youtube:…", uid, author, channelId, duration, is_transcribed}`; `/saved` list reflects it.
- **Save sentence**: per-cue heart icon → `POST /2/sentences {text,start,end,vid,url}` → `sid`=sha256; `GET /2/sentences?target=en&native=vi` lists user saves w/ `type:"user"`.
- **Captions are an async pipeline**: `POST /2/youtube/captions {id,title,cover,duration,target,language,ipaddress}` → `{"data":"pending"}`; status via `/2/youtube/captions/{id}/status`; video meta `GET /3/youtube/videos/{id}`.
- **AI transcribe button**: opens "AI Subtitle Transcription" dialog (1–5 min, better segmentation for speaking practice) — dialog visible on free; actual processing is premium-gated.

### 11.2 AITalk — a full live turn on free tier

- Course catalog → card click opens **modal** (not a route): lesson list (numbered 01–10) + lesson detail w/ description, **Roles swap** (AI ROLE Test Taker ↔ YOUR ROLE Examiner), **AI response difficulty** Beginner/Intermediate/Advanced, Optional Tasks (Shadowing 22 sentences / AI roleplay "Start").
- "Start" → `POST /1/conversations {slug:"series:course", difficulty, role_id, target_language, native_language}` → **`/talk/{conversationId}`** — live session works on free tier.
- Response carries the **literal system_prompt**: scene description, role split, difficulty rules (Beginner: <10 words, slow, no idioms, gently rephrase mistakes), rules (stay in character, English only, 1–3 sentences, drive forward).
- Turn: `POST /1/conversations/{id}/messages {content, model:"gpt-4o"}` → AI replies in-role; `POST /4/translations {texts,from,to,model:"gpt-4.1-mini"}` auto-translates every bubble — **200 on free inside talk** (the same endpoint 403s elsewhere — gate is per-feature, not per-endpoint).
- Session chrome: per-message icons (translate/audio/hide/heart), Text-mode input, big mic button (push-to-talk), "AI Assistant" hint button, session stats `0:15 Practiced · N Sentences`, **Optional Tasks checklist** (e.g. "state a clear preference", "two distinct reasons", "concrete example", "wrap up").
- Exit telemetry: `POST /1/conversations/{id}/leave {duration, speech}`.
- Stats surface: `/1/conversations/stats {talkDuration, convTotal, userTurns, streak, todaySentences}`.

### 11.3 Sentence packs → shadowing session

- `/sentence-shadowing` card → pack modal: description + numbered sections (e.g. "2000 Essential" → 10 topics × 200 sentences) each with "Practice".
- Practice → **`/practice/sentences?list={id}&group={groupId}&title=…`** — session UI: current sentence prominent bilingual, `01/200` progress, `List` panel of all S1..S200 numbered pairs. Same "Install extension" upsell.

### 11.4 Vocabulary surfaces

- `/vocab-mode` "Immersive Vocab": card = word + US IPA + POS blocks w/ vi senses + EN example + vi translation + "Detailed Definition" link + **"Mastered" button (hotkey M)** — marks word learned, advances deck.
- `/vocabulary`: Saved Words count + **Featured Learning** grid (BEC 2825, CEFR A1 1425, Beginner 5078, B1-B2 3571, B2 3728, C2…) — enable a wordbook to seed the deck; import `.txt/.csv` words-only.
- `/1/flashcard/settings`: `{dailyWords:10, autoMeaning:true, autoPronunciation:true, typing:false}` — daily target + auto-lookup + typing-mode toggle.

### 11.5 What this adds beyond the earlier capture

- Save payloads are dead simple: `{text,start,end,vid,url}` / `{id}` — no token/span metadata; `sid` is a sha256 of content (dedupe by hash).
- The **free/premium line in-product** ≠ marketing page: bilingual practice player, video summaries, AITalk sessions, sentence packs, per-video word index all work on free; the gates are AI-definition *depth*, `/4/translations` outside talk, storage quotas (100/50), AI-transcribe processing.
- AITalk scenario model: `{series_slug, course_slug}` → server builds system prompt from stored scene+role+difficulty template — the pack/series catalog IS the prompt factory.
- AITalk on free tier observed working (text mode at least); manual's "Premium-only" claim is looser than in-product reality — voice/mic or report may still be gated.
