# Kiến thức kỹ thuật rút ra từ 39 repo tham khảo

Ngày 2026-10-06. Nguồn: reading-packets trong `research/ejoy-archive-2026-10-06` (code thật đã trích text, đọc trực tiếp tại `/tmp/ejoy-archive/x/github-research/reading-packets/`). Mỗi mục ghi: repo → file → kỹ thuật → áp dụng vào phần nào của AtoEnglish. Quy tắc giấy phép: **chỉ mượn mã MIT/Apache/Unlicense** (ghi nguồn); GPL/AGPL/chưa rõ → chỉ ý tưởng.

## 1. Lấy phụ đề YouTube (slice 1 — rủi ro kỹ thuật cao nhất)

### `Talljack/echo-type` (MIT) — `src/lib/youtube-transcript.ts`

Chuỗi server-side đầy đủ, đúng như SPEC §4.2 đã dựa trên nó:

- **Một ngân sách 6 request** chia cho toàn chuỗi; backoff `300/600/1200` chỉ cho lỗi retryable (mạng, 403, 429, 5xx); phản hồi rỗng/lỗi khác chuyển bước ngay; abort dừng hẳn — code thật khớp design doc `docs/superpowers/specs/2026-07-13-youtube-request-budget-design.md`.
- **Phân loại lỗi thành error code ổn định**: 401/403/429 → `aborted` + `source_forbidden`/`source_rate_limited` (không retry); ≥500 → `source_unavailable` + backoff; AbortError/TimeoutError → `source_timeout`; mạng → `source_network`. Thông điệp lỗi luôn gợi ý fallback "add your transcript / SRT / VTT".
- **Thứ tự client**: iOS `20.10.4` (`iPhone16,2`, iOS 18.3.2) → Android `20.10.38` (Pixel 9 Pro, sdk 35). `playabilityStatus=LOGIN_REQUIRED` → abort ngay.
- **Track scoring** (`orderYouTubeCaptionTracks`): preferred-manual=0, preferred-asr=1, en-manual=2, en-asr=3, other-manual=4, other-asr=5 — sort ổn định theo index gốc.
- **`baseUrl` xử lý `\\u0026` escape** trước khi parse URL; `fmt` **set** thành `json3` (khớp probe của ta: nối thêm vẫn trả XML).
- **Trích `captionTracks` từ HTML bằng bracket-counting** (`extractJsonByMarker('"captionTracks":')`) — bền hơn regex cho JSON lồng.
- **Timed-text list**: `GET /api/timedtext?type=list` → XML `<track>` → dựng URL track bằng `v/lang/name/kind` params → fetch json3 bình thường.
- Có thêm fallback cuối: package `youtube-transcript` (npm). Ta không dùng — tự implement.
- `parseYouTubeJson3` chỉ gộp text + start/duration (giây) — KHÔNG giữ word timing. Ta cần giữ `segs[].tOffsetMs` → parse sâu hơn.

### `mengxi-ream/read-frog` (GPL-3.0, chỉ ý tưởng) — `src/utils/subtitles/fetchers/youtube/`

Extension-side, nhưng chứa tri thức quan trọng về cách YouTube bảo vệ timedtext:

- **PO Token**: `pot`/`potc` lấy từ `audioCaptionTracks[].url` (match vssId → lang+kind → lang → [0]) hoặc `cachedTimedtextUrl`. YouTube yêu cầu token này trên timedtext cho nhiều request — **đây chính là lý do server-side fetch bị chặn**. Extension lấy được vì chạy trong session thật.
- **`buildSubtitleUrl`**: params cố định `fmt=json3, xorb=2, xobt=3, xovt=3, c=WEB, cplayer=UNIPLAYER` + `cver` + device params (`cbrand,cbr,cbrver,cos,cosver,cplatform`) + `pot,potc`. → Khi Worker fetch thử, nên gửi kèm device params giả lập client WEB; `pot` thì không có → sẽ fail với nhiều video → fallback bắt buộc.
- **Track hash để cache**: `${videoId}:${languageCode}:${kind}:${vssId}` — khi user đổi track/video phát hiện được mà không fetch lại.
- **`hasSelectedTrack`/`ensureTrackSelection`**: track người dùng chọn trong player ưu tiên hơn default.
- **`noise-filter`**: bỏ `\[.*?\]`, `\(.*?\)`, `♪…♪`, `🎵…🎵`, `🎶…🎶` trong `segs[].utf8` — chạy TRƯỚC khi ghép câu (bổ sung SPEC §4.3: hiện spec chỉ bỏ `[♪♪♪]`).
- **4 format track**: `standard` (có sẵn timestamp) / `scrolling-asr` / `karaoke` / `stylized-karaoke` / `animated` — detect bằng `format-detector.ts`.

## 2. Ghép câu ASR (slice 1 — thuật toán cốt lõi)

### `read-frog` `scrolling-asr-parser.ts` (GPL-3.0, chỉ ý tưởng)

Thuật toán `parseScrollingAsrSubtitles` — đúng bài toán của ta, đã chạy production:

- **`aAppend` events là separator**: event `aAppend=1` không chứa text mà đánh dấu "dòng trước kết thúc" — dùng nó để tính `lastSegEnd` thật (`event.tStartMs + dDurationMs`), KHÔNG phải chỉ là xuống dòng bỏ qua như spec hiện ghi.
- **Cross-event buffer + `pendingSplit`**: gom text qua nhiều event; khi gặp dấu kết câu hoặc vượt độ dài → đánh `pendingSplit=true`, flush khi separator hoặc event/seg mới tới → câu không bị cắt cụt mà lấy được end-time chuẩn.
- **Space-merge cho ngôn ngữ tách bằng dấu cách**: khi nối seg đầu của event mới vào buffer, thêm " " nếu cả hai phía đều không có khoảng trắng (EN cần; CJK thì không).
- **`lastSegEnd` cho seg cuối event**: nếu có seg kế tiếp → `max(segStart + 200ms, event.tStartMs + nextOffsetMs)`; nếu không → `max(segStart + 200ms, tStartMs + dDurationMs)`. `ESTIMATED_WORD_DURATION_MS = 200` — comment trong code giải thích: 200ms cố định có thể làm cả câu "hết hạn" giữa hai timeupdate nếu YouTube gộp câu vào một seg → phải lấy `dDurationMs` làm chân.
- **`getMaxLength(isCJK)`**: giới hạn độ dài câu khác nhau cho CJK và space-separated — ta chỉ cần EN (25 từ/12s như spec) nhưng nên giữ ý tưởng lang-aware.
- **Fix overlap**: `pushFragment` sửa `last.end = fragment.start` khi fragment mới chồng lên cái trước.
- **Filter special tag**: `[Music]`, `[Applause]` (toàn bộ text là tag) bị bỏ.

→ SPEC §4.3 cần sửa: `aAppend` không chỉ là "event xuống dòng" mà là **tín hiệu kết thúc dòng** dùng để tính end-time và trigger flush. Thêm bước lọc noise trước ghép câu.

### `Nitrino/easysubs` (MIT) — `src/streamings/youtube.ts`

- Cách đơn giản hơn: `end = segs.at(-1).tOffsetMs + tStartMs` nếu có, else `tStartMs + dDurationMs`. Nhanh nhưng câu vẫn bị cắt theo event — chỉ phù hợp khi không cần ghép câu.
- Pattern extension: inject script đọc URL caption thật của player (event `esYoutubeCaptionsData` chứa timedtext URL với đầy đủ session params) → fetch trực tiếp. Không dùng được server-side nhưng quan trọng nếu sau này làm extension.

## 3. Token/NLP trên câu (slice 2–3)

### `zeeguu/api` (MIT) — `zeeguu/core/model/bookmark.py`, `bookmark_context.py`

Mô hình một-thẻ-nhiều-ngữ-cảnh chính xác là `study_cards` + `card_contexts` của ta:

- `UserWord` = thẻ (mang lịch ôn); `Bookmark` = một lần gặp: `sentence_i + token_i + total_tokens` (cụm nhiều từ gộp: token đầu + số token) + `context` (BookmarkContext) + `source` + `starred` + `is_mwe + mwe_partner_token_i` (MWE tách rời).
- `translation_source` enum bắt buộc (`reading|exercise|article_preview|generated_example|user_added`) — **provenance**: phân biệt từ tra khi đọc vs từ prefetch cho bài tập vs từ user thêm tay. Ta nên có `context_origin` tương tự (`watch_lookup|read_lookup|manual|import`).
- `BookmarkContext.cached_tokenized` (JSON): tokenize lười, cache, `clear_tokenization_cache()` khi content đổi — pattern cho transcript token cache của ta.
- `starred` tách khỏi trạng thái học — cờ ưu tiên, giống `star`/`master` của Trancy.

### `word-hunter` (chưa rõ giấy phép, chỉ ý tưởng) — `src/content/highlight.ts`

- **CSS Custom Highlight API**: `new Highlight()` + `CSS.highlights.set('wh-unknown', hl)` — tô sáng từ bằng `Range` mà KHÔNG đụng vào DOM. Hai registry: `wh-unknown` (chưa biết) + `wh-context` (đã lưu) — đúng ý tưởng "từ đã lưu underline accent" của REDESIGN. Không phải wrap `<span>` vào transcript → không vỡ layout, dễ xóa.
- `WeakMap<Node, Set<Range>>` theo container để `getRangeAtPoint(e)` tìm từ dưới con trỏ — tra từ bằng click mà không cần listener per-word.
- `isOriginFormSame` — so khớp theo lemma thay vì surface form.
- Context capture kèm **mốc giờ video**: khi đang youtube.com/watch, ghi `?t=<currentTime>` vào URL lưu → quay lại đúng đoạn (y hệt ý tưởng `?t=` của ta).
- `IntersectionObserver` + insert `<w-mark-t>` node sau `range.endContainer` — lazy-render inline translation chỉ khi scroll tới.
- `autoPauseForYoutubeSubTitle` — pause video khi gặp từ chưa biết lần đầu (ý tưởng cho "auto-pause on saved word" sau này, không phải MVP).

## 4. So khớp lời nói / shadowing (slice 4)

### `Oliviaviaviavia/english-trainer` (MIT) — `index.html`

- **Free-tier similarity**: in-order subsequence matching — `p=0`, với mỗi từ target quét `said[]` từ vị trí `p` tìm bằng nhau → `pct = matched/target*100`. Không Levenshtein, đơn giản đủ dùng cho "độ khớp nhận dạng" của ta.
- **Azure path**: phoneme-level scoring (`accuracy/fluency/completeness/prosody` + per-phoneme) chỉ khi có key; `<60` tô đỏ, `≥80` tô xanh, `Omission| Mispronunciation` gắn cờ — xác nhận chấm phát âm thật cần dịch vụ trả phí, ta không làm (giữ nhãn "không phải điểm phát âm").
- `lw = before.match(/(\S+)$/)` — lấy từ cuối câu trước đó (kỹ thuật nối ngữ cảnh).

### `TideSparrow/shadowing-english` (MIT) — `lib/features/player/…/asr_subtitle_*.dart`, `word_lookup_service.dart`

- `AsrSubtitleService`: audio → chunk (`AsrAudioChunk{file, offsetMs}`) → POST remote service → subtitle có word timing; `typedef` mọi HTTP call để test inject (`AsrPostJsonOverride`…) — pattern testable cho network layer (đúng kiểu `fetchImpl/delay` inject của ta).
- Cache ASR theo hash file (`crypto` sha) → không xử lý lại.
- `word_lookup_service`: prompt AI trả JSON `{word, phonetic, type, definitionEn, usageEn, exampleSentenceEn, definitionCn}` — gần shape `context_gloss` của ta; ghi chú: gửi `contextSentence` trong prompt khi có.
- **ECDICT** (`scripts/build_ecdict_core.py`): bộ từ điển mở (word → [translation, phonetic, pos]) lọc 80k entry theo tần suất `frq`/`bnc` — **nguồn dữ liệu từ điển mở miễn phí** có thể dùng cho curated dictionary của ta (kiểm tra giấy phép ECDICT trước — SPEC §15 mục 2).

### `xiaoshuangsu/dictation-shadowing-tool` (chưa rõ giấy phép, ý tưởng) — `src/components/WordMode.tsx`

- **`sentence.blanks` precomputed** `{word, index}` — KHÔNG random khi chạy (random làm trúng từ blacklist "my, that, is"). Chọn từ để khoét phải là quyết định có chủ đích (từ đáng học / từ đã lưu) — validate `blankIndex` trong range + so khớp word (bỏ dấu câu, lowercase).
- **Hai lớp token**: `spaceTokens = text.split(' ')` cho index; `renderTokens = text.match(/([a-zA-Z0-9'\u2019-]+|[.,!?;:]+|\s+)/g)` cho render — giữ nguyên dấu câu và **curly apostrophe U+2019** ("It's" không tách). Map index space→render bằng đếm token không-phải-punctuation.
- "Valid answer time": đếm thời gian trừ pause + inactivity (timer ref) — số liệu luyện trung thực.

## 5. FSRS + ôn tập (slice 5)

### `Talljack/echo-type` (MIT) — `src/lib/fsrs.ts`

- `accuracyToRating`: `<50` Again, `<70` Hard, `<90` Good, `≥90` Easy — ngưỡng auto-rating cho dictation/listen_fill (SPEC dùng 90% cho Good: khớp).
- Serialize `FSRSCardData` phẳng (due/stability/difficulty/elapsed/scheduled/reps/lapses/state/last_review) — khớp cột `study_cards` của ta; `dataToCard`/`cardToData` hai chiều.
- `previewRatings` → `{nextReview, interval}` mỗi nút — hiện "3d"/"1mo" trên nút rating (UX hay, copy).
- `enable_fuzz: true`, `migrateToFSRS` cho card cũ: stability ≈ interval cũ, difficulty=5, state=Review nếu có attempts — đúng cho bước nhập `cards` cũ (SPEC §15 mục 3).
- `formatInterval` hiển thị ngắn.

### `google/bespoke` (Apache-2.0) — `bespoke/urgency.py`

- **Multi-skill SRS**: mỗi unit có rating riêng theo `Mode` (listen/speak/read/write) — mỗi kỹ năng lịch riêng. Ta chọn 1 lịch FSRS chung + nhiều mode luyện (đơn giản hơn, hợp MVP); ghi nhớ ý tưởng nếu sau muốn tách nghe/nói.
- Score chỉ 0/1/2/3 (không Maybe); red reset streak ×0.5; block interval scale theo green streak (max −20h, red 10min) — tham khảo cho logic "blocked" khác FSRS.

## 6. AI pipeline (slice 2, 5)

### `lexweave` (Apache-2.0) — `packages/compile/src/{intelligence,translate}.ts`

- **Compile-time LLM pass → deterministic render**: 1 lần đọc LLM chấm `salience` (keyness theo sách, không phải tần suất thô) + gom variant/synonym về `conceptCanonical` → dedupe theo concept. Batch 200, sort trước để variant vào cùng batch. `flattenConcepts` collapse chuỗi A→B→C (hop-cap 8, cycle-safe).
- Ý nghĩa cho ta: mọi đầu ra AI (dịch câu, gloss, phân tích) nên **compile một lần, cache, render thuần deterministic** — đúng `ai_results` cache theo hash của SPEC.

### `baturyilmaz/wordpecker-app` (MIT) — `backend/src/agents/*/prompt.md`

- **Agent-per-purpose**: mỗi tác vụ AI = một agent + prompt riêng (definition / examples / exercise / quiz / similar-words / validation). Exercise prompt định nghĩa format chặt cho 5 loại (multiple_choice A–D, fill_blank, true_false, sentence_completion, matching+pairs shuffled) + bắt `hint` + `feedback`. Ta gộp thành ít endpoint hơn nhưng giữ nguyên tắc "prompt chuyên + schema chặt (Zod)".
- `language-validation-agent` — validate đầu vào trước khi sinh bài (guardrail).

### `TideSparrow/shadowing-english` — word lookup prompt

- Prompt trả JSON cố định field; khi có `contextSentence` thì "Explain X **in the sentence**" — khớp ý tưởng context gloss.

## 7. Trạng thái từ & thư viện (slice 3, 6)

### `LuteOrg/lute-v3` (MIT) — `db/schema`

- Status scale số: `0 Unknown` / `1–2 New` / `3–4 Learning` / `5 Learned` / `98 Ignored` / `99 Well Known` — thang mức độ hơn `star/master` của Trancy. Ta giữ `star`/`master` (đơn giản, đủ MVP) + FSRS state; thang Lute là tham khảo nếu sau muốn chi tiết.

### `usemoslinux/aprelendo`, `simjanos-dev/LinguaCafe` (GPL, ý tưởng)

- Thư viện nội dung theo chủ đề + "stage = ngày có ít thẻ nhất trong khoảng" (LinguaCafe) — ý tưởng rải bài ôn.
- LinguaCafe: tokenizer riêng per-language (Python service), hỗ trợ nhiều định dạng sách — ngoài phạm vi.

## 8. Không áp dụng được / lưu ý

- `asbplayer` (AGPL), `knowclip` (AGPL): clip→Anki card với audio cut bằng FFmpeg — cần tải media, trái ràng buộc; chỉ ý tưởng.
- `umlx5h/LLPlayer` (GPL): whisper.cpp / faster-whisper local ASR — ta không tạo phụ đề từ audio.
- `adrianvla/mLearn` (Sustainable Use License), `hikariming/openkoto` (Apache+điều kiện): **không mượn mã**.
- `subadub`, `NflxMultiSubs`, `jimaku-player`, `SubMiner`, `GameSentenceMiner`, `mpvacious`, `voracious`, `Kalba`, `dejima`, `dualsub`, `subtitles-rs`, `learning-with-texts`, `vocascan`, `chippeddog/english.now`, `openlingo`: extension/player riêng lẻ hoặc trùng lặp — đã đọc nhanh, không thêm kỹ thuật nào cần cho 6 route của ta.

## 9. Thay đổi đề xuất vào SPEC/TASK_CONTRACT từ đợt đọc này

1. SPEC §4.3: `aAppend` event là **tín hiệu kết dòng** (dùng tính end-time + trigger flush), không chỉ "xuống dòng bỏ qua". Thêm bước lọc noise `[…]`, `(…)`, `♪…♪` trước ghép câu.
2. SPEC §4.2: thêm device params + `xorb/xobt/xovt/cplayer` vào timedtext URL (bắt chước `buildSubtitleUrl`) để giảm tỉ lệ bị chặn; ghi rõ `pot` không lấy được server-side → lý do giữ fallback.
3. `card_contexts`: thêm `context_origin` enum (`watch_lookup|read_lookup|manual`) — học từ zeeguu `translation_source`.
4. Tô sáng từ đã lưu: ưu tiên **CSS Custom Highlight API** (không đụng DOM) thay vì wrap span — kỹ thuật word-hunter.
5. Dictation: blank index dùng cặp `spaceTokens`/`renderTokens`, regex token phải chứa `\u2019` (curly apostrophe); blank chọn có chủ đích, không random.
6. `migrateToFSRS` khi nhập `cards` cũ: stability = interval cũ, difficulty=5, state=Review nếu có attempts.
7. Auto-rating: `<50/70/90` → Again/Hard/Good/Easy (khớp ngưỡng 90% trong SPEC).
8. Shadowing similarity: in-order subsequence match (không cần Levenshtein).
9. Dictionary mở rộng: ECDICT (80k entry lọc theo tần suất, có phonetic/POS/translation) là ứng viên cho curated dict — **kiểm tra giấy phép trước**.
10. Testability: inject `fetch`/`delay`/`storage` theo typedef như echo-type & shadowing-english — khớp SPEC đã có.
