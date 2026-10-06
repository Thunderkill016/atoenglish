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
- Reading surface missed in docs: `/book-home`, `/library`, `/epub-reader/:id`, `/reader/:id` + `/1/shelf`, `/1/reading`, `/1/shelf/reading-stats` — a full ebook/reading wing. **[LIVE]**
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

| Endpoint                                                             | Shape (interesting fields)                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/3/youtube/channels`                                                | curated channels `{follow, recommend, poster(via /1/ytc_avatar proxy), title, videoCount, subscriberCount, id:"UC…", genres:["vlog","tech","talk","education",…]}`                                                                                                       |
| `/1/wordbooks`                                                       | curated book catalog `{name:"CEFR_basic", title(localized vi), description, count:1425, source:"static.trancy.org/wordbook/wordbook_en/CEFR_basic.json", target, cover}` — **wordbooks are static JSON on CDN**: BEC, CEFR A1-C1, IELTS, TOEFL, GRE, GMAT, COCA, CET, IT |
| `/1/sentence/groups`                                                 | AI-generated sentence packs `{name(vi), category:"travel/health/career/life/education", emoji, prompt(original prompt stored verbatim), length, target, locale}`                                                                                                         |
| `/1/shadowing/series`                                                | shadowing courses `{slug, title+description(localized), category:"school/work", course_list:[ids]}` — TOEFL speaking mock, IELTS full test, workplace small talk                                                                                                         |
| `/1/practice/sentence-lists`                                         | **Movies as content**: `{title:"Runner", type:"movie", category:["Drama"], description, metadata:{level,tags}, visibility:"public", featured, year}` — sentence lists built from film dialogue                                                                           |
| `/2/translator/engines`                                              | `{quota:{tokens,dayTokens,dayFreeTokens}, engines:[{type:"built-in"\|"trancy", provider, model, name, enabled, role, available}]}`. Free sees Google + SiliconFlow `available:true`; hosted DeepSeek V4 Flash / GPT-5.6 Luna / GPT-5-mini `available:false`              |
| `/1/tts/voices`                                                      | Azure voice catalog `{provider:"azure", voiceId, displayName, locale, gender, previewUrl(static mp3), marks:"native", localeName(localized)}`                                                                                                                            |
| `/1/pdf/quota`                                                       | `{quota:50, count:0}` — confirms free 50 pages/mo                                                                                                                                                                                                                        |
| `/1/conversations` `/1/topicMessages` `/2/topics` `/1/vision-topics` | AITalk state + topic system                                                                                                                                                                                                                                              |
| `/1/shelf` `/1/reading` `/1/shelf/reading-stats`                     | ebook shelf + reading stats (books wing)                                                                                                                                                                                                                                 |
| `/1/statis` `/2/materials` `/1/materials`                            | stats + learning materials                                                                                                                                                                                                                                               |
| `/1/meta` (76 calls)                                                 | shared config/dictionary schemes, fetched per page                                                                                                                                                                                                                       |

Auth: `GET /1/google/authURL` → Google OAuth → `GET /1/google/authcallback` → `/1/google/profile` → `/1/user/profile` + `/1/user/attributes` + `/1/user/marketing-email-preferences`.

### 5.7 Save flows — payloads verified

- Word: `POST /1/words {"text":"steal","target":"en","native":"vi"}` → `{pk:"{uid}#en", language, text, star:true, starAt, master:false, stl:"en_vi"}`. Mark known: `PATCH /1/words/{word} {master:true}`. **Word state = `star` (saved) + `master` (known)** — two flags, not one enum.
- Saved word syncs via `/4/words?updatedAt=` with embedded full dict payload + `ev:"v2-260427"` (dictionary dataset version) + `explains`.
- Sentence: `POST /2/sentences {text,start,end,vid,url}` → `{sid:"<sha256>", uid, type:"user", created_at, target}`.
- **`sid` = SHA-256 of the sentence text** — in the movie pack, "Oh you better run" repeats at orders 0,1,4 with the _same_ sid. Identity = normalized text, not position → the same sentence dedupes across all videos/contexts.
- Lookup is bidirectional: clicking a Vietnamese word in the translated line looked up the English lemma ("ăn cắp" → "steal") and opened the same drawer.

### 5.8 AITalk / shadowing — verified structure

- `/shadowing/{courseId}?role={A|B}` is the session route. Course = **scripted dialogue** (`/1/shadowing/courses/{id}?target=en`): 22 lines, roles `[{id:"A",label:"Giám khảo",description},{id:"B",label:"Thí sinh"}]`, `goals_hint` (5 mission items, localized), `scene_description`, `level`, `estimated_minutes`, `total_sentences`.
- Two modes on the card: "Bắt đầu quan sát" (walkthrough) and "Đóng vai AI" (roleplay chat); difficulty segmented control basic/medium/advanced; role-swap button.
- Progress: `/1/shadowing/progress/{courseId}` → `{status:"not_started", total_practiced, total_sentences, avg_score, three_star_count, sentences:{"s_xxxxxxxx":score|null}}` — per-sentence scoring with 3-star ratings.
- TTS proxied: `GET /1/tts/audio?text=…&id=azure:en-…` → base64 MP3 (Azure voices through their API).
- Batch translation: `POST /4/translations {texts:[22 lines], from:"en", to:"vi", model:"gpt-4.1-mini"}` — shadowing translations go through **their AI proxy, not free Google** → free account gets `403 "AI cao cấp đã hết hạn"`.
- `/1/conversations` (list) + `/1/conversations/{convId}/messages`; stats: `{talkDuration, convTotal, userTurns, streak, todaySentences}`.
- Catalog: `/talk-home` = ~35+ scenario series across work/travel/school/life categories, each "N khóa học" (courses); series → `course_list` ids.

### 5.9 Content & practice surfaces — verified

- `/vocabulary`: 21 curated wordbooks (CEFR A1–C2, beginner, BEC, CET-4/6, COCA 20k, GMAT, GRE, IELTS + IELTS Core, IT, Oxford 5000, PTE, SAT, TOEFL, TOEIC). Words via `/3/wordbook/words?name=…` (dict + translation + `ev` version + `book`) — static CDN JSON also listed as `source`.
- `/movie`: ~30 films = `type:"movie"` sentence-lists; card detail shows CEFR level (A2) + sentence count (1455) + localized description; genre + A1–C1 filters. `/sentence-lists/{id}` redirects to `/sentence-pack-studio/{id}` = **pack editor** (cover/name/description/chapters/numbered sentences) — users can build & share their own packs. Untranslated Chinese `更改封面` leaks → product originated in Chinese; several AI-pack `prompt` fields are zh.
- `/1/sentence/groups` + `/assessment-home`: community/user AI sentence packs by category — **premium-gated** (click → upgrade modal listing: unlimited AITalk + AI shadowing feedback, AI subs 40/day, unlimited word/sentence, PDF 2000 p/mo, AI summaries, realistic AI voices).
- `/sentence-shadowing`: shadowing pack library (Daily 2000 sentences, famous quotes by level, idioms, travel phrases, business letters, slang) + tabs YouTube/Podcast/Collections/Movies.
- `/review-vocabulary` (= `/flashcard` redirect): review queue filters Đang học/Tất cả/Gần đây/Đánh giá hôm nay/Theo ngày + "Chọn sổ học" (pick wordbook as study window). Mastered words leave the learn queue.
- `/wordbook-import`: create wordbook from .txt/.csv or paste — words only, sentences auto-filtered.
- `/podcast`: subscription manager (add/favorites/history/manage). `/saved`: Watch-Later videos. `/history`: watch history (worked live). `/book-home`: bookshelf + 20-min daily reading goal + weekly stats. `/topics`: AI Tutor topics. `/youtube/recommendations`: channel discovery — **11 learning languages confirmed** (en, ja, ko, es, fr, de, it, pt, ru, zh-Hans, zh-Hant) + vocab-level + interest filters.
- `/1/user/profile`: `{id, token(JWT), name, avatar, email, premium:false, AIEngineActive:false, stripePremiumActive, target, native, lastLogin/lastActive}` (fields only; values omitted for privacy).
- `/1/meta` dictionary schemes: Oxford, Collins, Longman/LDOCE with URL templates + per-language `to` filters + popup sizes.
- Their app has live bugs: clicking a wordbook crashed the SPA (`insertBefore` in `word-context-sentences` chunk); assessment click opened the paywall correctly.

## 6. What remains unverified

- Flashcard drill screen and FSRS grade buttons/parameters (scheduling is server-side; we saw only queue empty/non-empty states).
- Free-dialogue AITalk turn exchange (needs mic/voice; the scripted "quan sát" mode was captured, the "đóng vai AI" chat mode not run).
- Speech-assessment scoring UI and Microsoft-eval payload.
- Assessment flow, epub reader internals, PDF translator workflow (premium-gated or needs upload).
- Whisper pipeline internals (audio fetch method; only status/queue endpoints seen).
- Whether `/youtube/<id>` public marketing player ever worked (all 500 now).
- Premium behaviors beyond the paywall copy (tested on a free account).
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
- **Server-side NLP on captions**: every token carries `lemma/pos/dep` — enables word-level click, lemma-based dedup for vocabulary, POS-aware fill-in-the-blank, "other sentences with this lemma". Build into our caption pipeline rather than shipping plain-text lines. **[LIVE]**
- **Heartbeat progress**: `deltaDuration` every ~3 s keyed by `dateKey` — cheap watch-time analytics + resume position in one call. **[LIVE]**
- **Incremental sync**: `?updatedAt=` watermark polling for words/sentences — simple cross-device sync model to copy. **[LIVE]**
- **Curated catalogs are flat JSON on CDN** (wordbooks) or DB lists (channels, movies, shadowing series, sentence packs) — our curated video library + starter wordbooks can ship the same way, no recommendation engine needed v1. **[LIVE]**
- **Content beyond video**: their movie/book/podcast/assessment wings show the long-term shape, but all are "content repackaged into sentence lists + practice" — the same primitive everywhere (sentence → tokens → practice). Design our data model around that primitive. **[INFER]**

## 8. Source list

- `manual.trancy.org` — 24 pages fetched as markdown (`/tmp/trancy-research/manual/`).
- `www.trancy.org` — 11 product pages HTML+text + sitemap 624 URLs + changelog (5 pages exist; page 1 read) (`/tmp/trancy-research/site/`).
- Blog: 93 posts saved (`/tmp/trancy-research/blog/`).
- Chrome Web Store CRX `mjdbhokoopacimoekfgkcoogikbfgngb` v7.9.4 unpacked + prettified (`/tmp/trancy-research/extension/`).
- `learn.trancy.org` — **authenticated full crawl**: ~1400 logged requests (`/tmp/trancy-research/live/network*.jsonl`), per-page innerText dumps (`live/pages/`), **36 screenshots** (`live/shots/`: all routes + practice player, dict drawer, AITalk session, movie detail, pack studio, premium paywall).
- No official OSS repo exists (verified via GitHub search + org lookup). License: proprietary — we may take ideas/architecture, **not** code or assets.
