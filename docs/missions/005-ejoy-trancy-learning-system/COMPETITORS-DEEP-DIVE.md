# Competitor Deep-Dive — Language Reactor, LingQ, eJOY, LangHub, Dreaming Spanish

> Owner request: "tiếp tục mở rộng tìm kiếm nghiên cứu tất cả sản phẩm top và đăng nhập vào web để nghiên cứu."
> Research date: 2026-10-10. Sibling to `TRANCY-DEEP-DIVE.md` (Trancy covered there).
> Method: Playwright + persistent Chromium profile `/tmp/trancy-research/profile`; authenticated via Google OAuth (`hoangn36th3a@gmail.com`) where a free tier existed. Raw captures under `/tmp/competitor-research/`.
> Evidence types: **[LIVE]** observed HTTP/UI behavior, **[DOC]** marketing/docs, **[API]** captured request/response, **[INFER]** our inference.

## 0. TL;DR — what the landscape actually looks like

| Product | Model | Free tier reality | Paywall shape | Auth backend |
|---|---|---|---|---|
| Trancy | Extension + Learning Center web | Wide: practice player, AI summary, AITalk, sentence packs all usable | AI depth/quota, `/4/translations` outside talk, storage quota, Whisper subs | `api.trancy.org` custom |
| Language Reactor | Web app + extension | Catalog/browse anonymous; PhrasePump/saved items need login; **14-day Pro trial auto-granted** | After trial: speech rec, Netflix MT, save words, Aria chat | Firebase Identity Toolkit → `diocoToken` |
| LingQ | Web app + extension + apps | **Very tight: 20 saved words (LingQs), 5 imported lessons**, small Lynx credit | $10/mo Premium (unlimited saves), $22.50/mo Plus (Lynx credits, ElevenLabs, 6x transcription) | Custom + Google/Facebook/Apple OAuth |
| eJOY | Web app (`/go`) + EPIC + extension + mobile | Anonymous: catalog + Listen-mode player. Practice tabs, save → login | Pro Dict 53kđ/mo · Pro Voca 153kđ/mo · Pro Plus 300kđ/mo; AI quota 3,000–5,000 queries/mo | `sso.ejoyspace.com` (Google/FB/Apple/email) |
| LangHub | Fully client-side web app | **Everything local; saved to device**; no account needed for core loop | Listening packs, ElevenLabs voices, AI story gen | None for core (localStorage) |
| Dreaming Spanish | Web app | Anonymous browse; progress/login needed to watch+track | ~$8/mo premium videos | Custom |

**Shared paywall insight (reinforces Trancy finding):** everyone sells *AI depth* and *unlimited saving*, not the core learning loop. The video→sentence→word→practice loop is free almost everywhere; LingQ is the exception (20-word cap is aggressive).

## 1. Language Reactor (languagereactor.com) — authenticated

### 1.1 Anonymous surface

- Catalog visible without login: YouTube, Netflix, books, courses, media files, podcasts, user text/documents as source categories.
- Vocabulary-level filter chips on catalog: Tắt / Dễ / Thử thách / Khó (Off / Easy / Challenging / Hard) — internally this is a **`freq95` word-frequency-rank filter** (see API below).
- ALC/DLI English course: 12 modules, structured curriculum — they license real courseware.
- Aria chatbot visible anonymous; PhrasePump and saved items require login.

### 1.2 Auth

- Google OAuth → Firebase **Identity Toolkit** (`identitytoolkit.googleapis.com/v1/accounts:lookup`) → Cloud Function `us-central1-nlle-b0128.cloudfunctions.net/getUserData_3` returns `{licenseStatus:"TRIAL", paymentProvider:"NONE", trialStarted, trialExpiresAt, diocoToken}`.
- **Every new account gets a 14-day Pro trial automatically** — no card. Pro upsell showed `₫158,488/tháng` (~$6).
- All API calls then carry `{diocoToken, userEmail}` in POST bodies.

### 1.3 Backend architecture **[API]**

- API hosts: `api-cdn.dioco.io` (bulk) + `api-cdn-plus.dioco.io` (premium-ish paths) — "dioco" is the internal engine name.
- Key endpoints (all POST JSON):
  - `base_media_getMediaDocs_5` / `base_media_getMediaPlaylists_5` — catalog queries; filters include `freq95:{min,max}` (word-frequency rank window), `mediaTab`, duration, sort.
  - `base_items_getItemKeys_3` `{alreadyHaveRevisionId}` — **incremental saved-items sync by revision id** (efficient resync pattern).
  - `base_study_getStudyMeta` `{studyMode:"BOTH", endOfDayUser_unixms, dateStr}` — SRS state.
  - `base_lexa_getConversation` — Aria chatbot history ("lexa" = their AI layer).
  - `api.dioco.io/stats` — client posts per-endpoint latency telemetry back to them.

### 1.4 Authenticated surfaces

- **PhrasePump** (`/phrasepump`): daily practice counter, urgent-review count, "Bắt đầu luyện tập", activity heatmap, period filters, saved-for-learning count, suggested/learning/learned counts.
- **Saved items** (`/saved-items`): tabs Từ vựng / Từ đã lưu / Câu đã lưu / Xuất; search; source filter; **3-state marking: Đã đánh dấu là đã biết / Đã đánh dấu để học / Đừng học** (known / to-learn / don't-learn — richer than a binary save).
- **Player** (`/c/en/yt/t_yt_mix_en/yt_{videoId}`): works in-browser without the extension (but nags "Cài đặt tiện ích… 😢"). Modes: VĂN BẢN / TỪ / 👉 (text / word / phrase). Each sentence shows EN + auto VI machine translation inline.
- **Aria chatbot** (`/chatbot`): sent a real message — reply is **bilingual** (EN answer + VI translation of everything, including its own sentences). Mic input "Hold to speak" (permission-gated). Conversation persists server-side (`base_lexa_getConversation`).
- Settings: account email, `MIỄN PHÍ` license, Pro trial countdown, logout, account deletion, language settings.
- Pro-gated examples observed: speech recognition, Netflix machine translation, saving words/phrases, Aria chat (post-trial).

### 1.5 Takeaways for AtoEnglish

- `freq95` catalog filter = "show me content whose vocabulary is in my reachable window" — a more honest difficulty signal than CEFR labels; equivalent idea for us: difficulty by *known-word coverage* once we have learner word state.
- 3-state word marking (known/learning/don't-learn) is strictly better than binary save — maps cleanly onto our study-card states.
- Auto-trial is a conversion pattern we won't copy (no paywall) — but the *shape* "full product free, sell AI depth" validates our free-first design.
- Incremental sync (`alreadyHaveRevisionId`) is the right pattern if saved-items lists grow.

## 2. LingQ (lingq.com) — authenticated (new free account)

### 2.1 Signup funnel (every step is a product decision)

Google OAuth → new-account form (prefilled name/email/username) → **daily-goal picker with coins** (10/20/40/60 min → 50/100/200/400 coins, "you'll learn 1500 words in 1 year" claim) → topic picker (~20 topics) → **accent picker** (British/Canadian/American/Australian/NZ/Scottish/Irish — prioritizes TTS+content accent) → **extension install push** (LingQ Importer for YouTube/Netflix 1-click import) → **paywall screen** before the app (with "continue free" escape).

### 2.2 Pricing/gating **[LIVE]**

- Free: **20 LingQs max** (saved words/phrases — extremely tight), **5 imported lessons**, small one-time Lynx credit, standard TTS (InWorld AI).
- Premium $10/mo ($119.99/yr): unlimited LingQs + imports, Lynx AI, 600 min/mo transcription.
- Premium Plus $22.50/mo ($269.99/yr): 5× Lynx credits, ElevenLabs voices, 3,600 min/mo (6×) transcription, AI lesson simplification.
- Limit check is a live API call: `GET /api/languages/en/user_reached_limits/`.

### 2.3 Library & reader

- Library (`/learn/en/web/library`): tabs Leçons/Playlists/Vocabulaire; guided courses (Mini-stories per accent; Guided Débutant→Avancé 1/2); news feed from real outlets (BBC, NPR, WaPo).
- **Every lesson card shows "% Nouveaux Mots"** — the new-word percentage *for you* — their central discovery metric (content difficulty is personalized, not labeled).
- Reader (`/learn/en/web/reader/{id}`): words are `<span class="sentence-item blue-word|known-word">` — **blue = never seen, yellow = LingQ in progress, plain = known**; status is rendered inline in text.
- View modes: Vue Phrase / LingQs / Nouveaux Mots / Tous les Mots — same four-view pattern as Trancy's tabs.
- Word click → side pane: POS tags (`Nom, Verbe, present`), external dictionary links (WordReference/Linguee/Reverso popups, Google Translate), **"Traductions Populaires" = community-ranked hints**, **"Phrases Connexes" = n-gram context expansions** ("peter when", "peter when does the restaurant" — progressively wider windows), grade buttons 1-4.
- Grading creates the LingQ:
  ```
  POST /api/v3/en/cards/
  {"term":"peter","hints":[{"text":"Peter","locale":"fr"}],
   "fragment":"Peter: When does the restaurant…",
   "tags":["Verb","present","Noun"],"content":17384}
  ```
  **[API]** — card = term + chosen hint + context fragment + POS + source. Same shape as our study cards.

### 2.4 API shape **[API]**

- `GET /api/v3/en/lessons/{id}/simple/` + `GET .../words/?init=1&chunk_size=200&cardsTranslitFormat=list` — **all word data + hints prefetch with the lesson** (each word: `text, tags, importance, status, hints[]` where hints carry `popularity`, `is_google_translate`, `flagged`). No per-click dictionary call for the common case.
- `GET /api/v2/en/related-phrases/?word=X&fragment=Y` — n-gram expansions fetched on click.
- `POST /api/v3/en/lessons/{id}/lipp/ {sentence_start, sentence_count}` — reading-position ping.
- `POST /api/v3/en/lessons/{id}/bookmark/ {wordIndex}` — resume position.
- `POST /api/v2/en/progress/{lesson}/ {readingUsage}` — time/amount tracker.
- `GET /api/v3/en/chat/` + `GET /api/v3/en/chat/bots/` — Lynx.
- `GET /api/v2/tts/free-ai-tts/?language=en` — free-tier TTS voice check.
- `GET /api/v2/en/milestones/badges/`, `GET /api/v2/en/study-stats/`, `GET /api/v2/en/timeline-events/simple/` — gamification + stats.

### 2.5 Lynx AI (`/lynx`) — works on free tier

- Chat UI with **contextual starters derived from the lesson just read** ("Aide-moi à comprendre « When does it open? »", "Fais-moi pratiquer les questions simples au présent").
- Answered a real question on free; each turn ends with an engagement question + follow-up suggestion chips + disclaimer "Lynx AI peut faire des erreurs."
- **"Importer comme Leçon"** — converts a chat into a reader lesson (chat→study content pipeline — novel).
- Coins counter ticks up during activity (`3/50 → 17/50 Pièces`) — persistent gamification.

### 2.6 Takeaways for AtoEnglish

- "% new words for you" on content cards is the best personalization pattern we've seen — computable once we track known-word state; honest (it's a coverage stat, not a level claim).
- Blue/yellow/plain inline word status is proven UX; our equivalent = saved/known/ignored states.
- Prefetch hints with the lesson (like LR's inline approach) beats per-word dict calls; we already tier dict/AI — the community-hints idea maps to "top VI glosses by frequency".
- Lynx "chat→lesson import" and lesson-context starters are strong AI-chat differentiators for a later slice.
- Gamification (coins, streak, daily goal, badges) is core to LingQ — we deliberately do **not** copy (single-direction gate: no XP/streak economies).

## 3. eJOY (ejoy-english.com/go) — authenticated

Closest **Vietnamese** competitor. Product family: eJOY Go (web), eJOY EPIC, mobile apps, eJOY eXtension (Chrome), **glotdojo.com** sister brand (Video Translator + IPA tools).

### 3.1 Anonymous surface

- Full catalog browseable: curated sections "Video được đề xuất" / "Mới cập nhật"; cards show duration + **difficulty number 1–5 + level label** (Beginner/Intermediate/Low Advanced).
- Filters: Chủ đề / Trình độ / Thời lượng — same three axes as our `/discover`.
- Player opens anonymous in **Listen mode** with full transcript; practice tabs visible but inert.

### 3.2 Player anatomy **[LIVE]**

- Practice as a **sequential pipeline**: `Listen → Quiz → Write → Speak` (stepper arrows, not just tabs).
- YouTube **official iframe embed** (`youtube.com/embed/{id}?controls=0`) — same approach as ours.
- Subtitle tools: **"AI Sửa phụ đề"** toggle (Phụ đề gốc vs Phụ đề AI — AI-corrected captions as a feature), "Tách câu" (sentence segmentation), "Văn bản" (transcript view), "Câu đã lưu" (saved sentences), `+` save per sentence, download/copy.
- "Chọn phân đoạn" = AB segment picker + loop/slow controls in player bar.
- Subtitle CDN: `das.ejoyspace.com/subtitles-video/{id}` **[API]**.
- Top bar: **streak flame + coin counter** (gamification), flag (language), avatar.

### 3.3 Authenticated additions

- Nav gains "Của Bạn": Sổ từ vựng (vocab notebook) / Hồ sơ / Hướng dẫn / Yêu thích.
- Home promotes "EPIC COURSE — 1.500 bài học" and "+30 bộ từ TOEIC/IELTS" (VocaEasy — paid word packs).
- Standalone exercise types: `/exercises/{missing-word, listen-and-write, build-a-phrase, sentence, preposition, listening}` — exercised one: movie-clip dictation (Raging Bull: "You call those carrots") with Back/Slow/Repeat/Next.
- `/movie-exercises/{movie}` — exercises built from movie scenes.
- Tools: "Tìm Cụm Từ" (phrase search), "Dịch PDF" (PDF translate), "Từ điển Video" (video dictionary), "Tra phiên âm IPA", "Dịch video".
- Wordstore: 30+ prebuilt lists (505 Phrase List, 600 IELTS words, Phrasal Verbs, 280 Travel) — gated behind "Voca Easy" paid product.
- Support via Zalo/WhatsApp/Messenger — very local touch.

### 3.4 Pricing **[LIVE]** (`/vi/plans`, durations 3mo/1yr/2yr)

- PRO DICT 53.000đ/mo: bilingual viewing + lookup/translate + **AI assistant — 3,000 queries/mo**.
- PRO VOCA 153.000đ/mo: + save words anywhere, vocab review, 30+ word sets, **AI — 5,000 queries/mo**, advanced AI features.
- PRO PLUS 300.000đ/mo: + communication courses / EPIC.
- The AI is sold as a **monthly query quota** — same "sell AI depth" model as Trancy.

### 3.5 Takeaways for AtoEnglish

- The 7-step loop they market (watch → active listen → quiz → shadow → dictation → **dubbing** → vocab games) — dubbing/role-dub is a mode we don't have; candidate for later.
- "AI Sửa phụ đề" (AI-corrected captions) is the feature we'd approximate only via Whisper/AI path — currently deferred by design.
- Sequential Listen→Quiz→Write→Speak stepper is a clean way to turn one sentence into a drill circuit; our practice panel has the modes, not the guided sequence.
- Difficulty = `1–5 numeric + label` per video, curated — comparable to our easy/medium/hard.
- Localized monetization (VND pricing, Zalo support) confirms the target audience is exactly ours.

## 4. LangHub (lang-hub.com) — no account needed

- **Entirely client-side** ("saved to this device"): app at `/app` with tabs Speak / Flashcards / Reader / Practice / Pronunciation.
- Flashcards use **4-button SRS** (Anki convention) + Shadow button inside cards.
- "Fetch article" (import URL → reader), "Generate story" (AI story from your saved words — same reuse idea as our "reuse saved language"), "Ask AI".
- Monetization: Listening Pack PRO, ElevenLabs voices at Super tier, ~10 min/day voice free.
- Takeaway: proves the core loop can be nearly free and local-first; their gating is on premium content packs + voice quality — not features.

## 5. Dreaming Spanish / Dreaming (app.dreaming.com) — anonymous

- Pure **comprehensible-input** thesis: no subtitles/word tools at all — deliberately.
- `/spanish/browse` anonymous: cards = duration + level (Beginner/Intermediate/Advanced only) + some Premium locks; filters: Levels/Countries/Guides/Topics.
- **Daily goal measured in minutes watched** (`0/15 min`) — input-hours tracking is *the* metric (their famous "1,500 hours" roadmap).
- Teachers as content brands; Series + Library + Progress tabs.
- Takeaway: the extreme of "just watch" — validates that video-first works, but their anti-subtitle dogma is a different bet than ours; their time-based goal is honest evidence (vs our explicit-denominator stats).

## 6. Cross-product synthesis

### Everyone converges on the same loop

`video/content → sentence (segmented, timestamped) → word click → context save → SRS → practice modes (dictation/shadow/speak) → stats`. AtoEnglish's surface (`/discover → /watch → save → /practice → /review → /library`) is structurally aligned — the differentiation must be **free tier + honest evidence + Vietnamese-first**, not a new loop.

### Paywall comparison

| Gate | Trancy | LR | LingQ | eJOY |
|---|---|---|---|---|
| Save words | quota | post-trial | **20 total** | Pro Voca |
| AI chat/depth | depth/quota | Aria post-trial | Lynx credits | 3k–5k queries/mo |
| AI subs | Whisper 40/day | — | transcription min | "AI Sửa phụ đề" toggle |
| Practice modes | free | PhrasePump post-trial | free | Pro Plus |

We can legitimately be **the most generous free product** in this set on saves + practice, while keeping AI features labeled and rate-limited.

### Features worth borrowing (ranked by fit)

1. **% new words on content cards** (LingQ) — personalized difficulty, honest metric.
2. **3-state word marking: known / learning / don't-learn** (LR) — better than binary save.
3. **N-gram context expansions in word pane** (LingQ "Phrases Connexes") — cheap, builds phrase intuition.
4. **Lesson-context AI starters** (Lynx) — AI chat that knows what you just watched.
5. **Chat → lesson/sentence import** (Lynx) — reuse pipeline.
6. **Sequential Listen→Quiz→Write→Speak stepper** (eJOY) — guided per-sentence circuit.
7. **Incremental saved-items sync** (LR `alreadyHaveRevisionId`) — perf pattern for later.
8. **Dubbing mode** (eJOY 7-step) — record-your-voice-over; later slice.

### Features deliberately rejected (per PROJECT_STATE)

- Coins/streak/league gamification (LingQ, eJOY) — closed/non-core surface.
- CEFR/level claims as marketing (eJOY "CEFR-aligned", cert LinkedIn) — unsupported mastery claims.
- Extension-first dependency (all of them) — we stay web-first.
- Auto-trial→paywall conversion funnel (LR 14-day) — no paywall exists to convert to.

### Auth/architecture notes

- LR proves Firebase-auth → custom-token → POST-everything is workable, but our Neon Auth + server actions is equivalent and simpler.
- LingQ's hint prefetch + community-ranked translations: our Kaikki tier-1 + curated glosses already gives the same UX without community ops.
- Everyone runs a CDN subtitle store (`das.ejoyspace.com`, LR media endpoints, Trancy `/2/youtube/captions`) — caption caching is table stakes; ours is already server-cached.
