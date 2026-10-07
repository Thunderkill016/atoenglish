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

- `accuracyToRating`: `<50` Again, `<70` Hard, `<90` Good, `≥90` Easy — ngưỡng của repo; **không khớp** SPEC: ta dùng ≥90% không gợi ý → Good và không tự Easy.
- Serialize `FSRSCardData` phẳng (due/stability/difficulty/elapsed/scheduled/reps/lapses/state/last_review) — khớp cột `study_cards` của ta; `dataToCard`/`cardToData` hai chiều.
- `previewRatings` → `{nextReview, interval}` mỗi nút — hiện "3d"/"1mo" trên nút rating (UX hay, copy).
- `enable_fuzz: true`, `migrateToFSRS` cho card cũ: stability ≈ interval cũ, difficulty=5, state=Review nếu có attempts — chỉ là mẫu migration; nhập `cards` cũ chưa được chốt (SPEC §15.3).
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
6. `migrateToFSRS` chỉ là mẫu nếu owner chọn nhập `cards` cũ; chưa có quyết định migration. Không suy state từ interval khi dữ liệu FSRS đầy đủ đã tồn tại.
7. Auto-rating của repo: `<50/70/90` → Again/Hard/Good/Easy; không áp nguyên mapping này, theo SPEC §7.
8. Shadowing similarity: in-order subsequence match (không cần Levenshtein).
9. Dictionary mở rộng: ECDICT là nguồn EN→ZH, có thể tham khảo phonetic/POS sau khi kiểm tra giấy phép; không dùng trường translation làm nghĩa tiếng Việt và không coi 80k mục là dictionary EN→VI sẵn có.
10. Testability: inject `fetch`/`delay`/`storage` theo typedef như echo-type & shadowing-english — khớp SPEC đã có.


## 10. Kiểm chứng repo bổ sung 06/10/2026

Đọc tĩnh chọn lọc mã/test/LICENSE ở SHA bên dưới; đã lấy 33 file gồm tài liệu và giấy phép. Không cài dependency, không chạy repo, không nhập mã vào sản phẩm. 7 repo đã có trong gói 39; thêm nguồn upstream `ts-fsrs` để đối chiếu adapter đang dùng. Repo thử tìm `gsantiago/subtitle` trả 404, bị loại, không dùng làm nguồn.

| Repo @ commit | Mã/test đã đối chiếu | License đọc tại commit | Bài học và giới hạn |
| --- | --- | --- | --- |
| `zeeguu/api@3cfe269b2bb2` | [zeeguu/core/model/bookmark.py:31](https://github.com/zeeguu/api/blob/3cfe269b2bb2b098e5262640ba1e1aecdd4e1878/zeeguu/core/model/bookmark.py#L31) | [MIT](https://github.com/zeeguu/api/blob/3cfe269b2bb2b098e5262640ba1e1aecdd4e1878/LICENSE) | UserWord giữ trạng thái học; Bookmark giữ lần gặp và token span; UserWord kiểm tra preferred bookmark thuộc thẻ và không có thẻ mồ côi. Áp dụng invariant lúc ghi, không tự sửa dữ liệu khi đọc; cần test riêng vì file test_user_word đọc trong đợt này chủ yếu kiểm tra Phrase. |
| `LuteOrg/lute-v3@933d0840aede` | [tests/unit/term/test_Term_status_follow.py:110](https://github.com/LuteOrg/lute-v3/blob/933d0840aede93b3999e6017ba7f5eba5e41206d/tests/unit/term/test_Term_status_follow.py#L110) | [MIT](https://github.com/LuteOrg/lute-v3/blob/933d0840aede93b3999e6017ba7f5eba5e41206d/LICENSE.txt) | Test trạng thái lan lên/xuống theo liên kết và cả vòng tham chiếu. Bài học: quyết định rõ lemma/form nào dùng chung trạng thái; không nhập thang trạng thái hoặc tự lan “đã thuộc” sang mọi nghĩa. |
| `Talljack/echo-type@deccdf5e644d` | [src/lib/youtube-transcript.ts:150](https://github.com/Talljack/echo-type/blob/deccdf5e644d5f0b5e2b010f0ac81ee17f66e065/src/lib/youtube-transcript.ts#L150) | [MIT](https://github.com/Talljack/echo-type/blob/deccdf5e644d5f0b5e2b010f0ac81ee17f66e065/LICENSE) | Ngân sách dùng chung 6 request, deadline và dừng 401/403/429; test kiểm tra số call và timeout. Áp dụng ý tưởng budget/error taxonomy; không sao chép catch rộng hoặc con số vào Worker mà không test theo môi trường. |
| `lexweave-hq/lexweave@2b31f8683c5e` | [packages/compile/src/compiler.ts:44](https://github.com/lexweave-hq/lexweave/blob/2b31f8683c5e14cc0f2b8a9ab21de15fe6eb490e/packages/compile/src/compiler.ts#L44) | [Apache-2.0](https://github.com/lexweave-hq/lexweave/blob/2b31f8683c5e14cc0f2b8a9ab21de15fe6eb490e/LICENSE) | Cache/checkpoint phân biệt producer, prompt, glossary, model; compile trước rồi render xác định. AtoEnglish cần key chứa phiên bản transcript, segmentation, ngôn ngữ, prompt/model; output map theo ID, không để LLM sửa thời gian. |
| `mengxi-ream/read-frog@001e0b2984fb` | [src/utils/subtitles/fetchers/youtube/parser/scrolling-asr-parser.ts:37](https://github.com/mengxi-ream/read-frog/blob/001e0b2984fbdb267e7dd68dd1b1b32e170d7310/src/utils/subtitles/fetchers/youtube/parser/scrolling-asr-parser.ts#L37) | [GPL-3.0](https://github.com/mengxi-ream/read-frog/blob/001e0b2984fbdb267e7dd68dd1b1b32e170d7310/LICENSE) | Buffer qua ASR events, pending split, separator kết thúc, sửa overlap; test thiếu duration, newline, tags, empty segs. Chỉ học ý tưởng; viết fixture độc lập. Không dùng duration 200ms ước lượng làm timing gốc cho shadowing. |
| `asbplayer/asbplayer@4a1843293b2e` | [common/anki/anki.ts:186](https://github.com/asbplayer/asbplayer/blob/4a1843293b2e1aa9d01d500f455ebac1fdbf9652/common/anki/anki.ts#L186) | [AGPL-3.0](https://github.com/asbplayer/asbplayer/blob/4a1843293b2e1aa9d01d500f455ebac1fdbf9652/LICENSE) | Thẻ giữ câu, các track, nguồn, URL và đoạn gốc; test escape query và duplicate handling. Chỉ học cách giữ nguồn/ngữ cảnh và phân loại trùng; không mượn mã, không thêm export/download media vào MVP. |
| `Nitrino/easysubs@c81dada27a9d` | [src/streamings/youtube.ts:49](https://github.com/Nitrino/easysubs/blob/c81dada27a9d1fcd8da3fd9f620b6e76e86e6486/src/streamings/youtube.ts#L49) | [MIT](https://github.com/Nitrino/easysubs/blob/c81dada27a9d1fcd8da3fd9f620b6e76e86e6486/LICENSE) | JSON3 dùng event start + word offset; đoạn cuối fallback duration. Điểm cần thận trọng: offset từ cuối không tự chứng minh end audio đúng; invariant end>start, gap/overlap và duration phải kiểm tra bằng fixture/video. |
| `open-spaced-repetition/ts-fsrs@c8ca282edc3f` | [packages/fsrs/__tests__/rollback.test.ts:17](https://github.com/open-spaced-repetition/ts-fsrs/blob/c8ca282edc3fe1cdfa1c24912437938b63a25cb3/packages/fsrs/__tests__/rollback.test.ts#L17) | [MIT](https://github.com/open-spaced-repetition/ts-fsrs/blob/c8ca282edc3fe1cdfa1c24912437938b63a25cb3/LICENSE) | repeat preview, next chọn rating và rollback từ log được test qua các rating. Giữ adapter src/lib/srs/fsrs.ts, không nâng dependency chỉ để giống upstream; test ngày/serialization, schedule+attempt atomic và replay chống lặp. |

### Hiệu chỉnh các kết luận cũ

- Mapping `<50/70/90` của echo-type **không khớp** mapping thận trọng trong SPEC §7. ≥90% không gợi ý của ta → Good; có gợi ý tối đa Hard; không tự Easy. Đây là quyết định sản phẩm, không phải ngưỡng được paper xác nhận.
- `migrateToFSRS` là tham khảo migration legacy có mất thông tin, không phải phần việc đã duyệt. SPEC §15.3 còn quyết định nhập/bỏ dữ liệu cũ; không suy stability/difficulty từ interval nếu đang có state đầy đủ.
- Cache `lang_word` chỉ phù hợp lookup từ điển tổng quát. AI nghĩa theo câu phải khóa theo ngữ cảnh và version; không trả nghĩa ở cữ cho câu biệt giam chỉ vì chung lemma.
- Text hash giúp nhận diện nội dung nhưng không thay ID lần gặp: hai câu giống nhau ở hai timestamp/nguồn vẫn có hai contexts. Dùng nguồn + transcript version + sentence index/token span để xác định lần gặp; không dedupe chỉ bằng text.
- CSS Highlight phục vụ trang trí, không thay semantics/focus/hit target cho tra từ/lưu; phải có fallback trình duyệt. Token span phải bảo toàn apostrophe, contraction và cụm nhiều từ.
- Không chuyển các heuristic/điểm tự chấm thành mastery khách quan, không nhập auto-repair của repo vào hot read path.

### 07/10 targeted watch-lookup source inspection

| Source @ pinned SHA | Inspected contract | Applied choice |
| --- | --- | --- |
| `LuteOrg/lute-v3@933d0840aede93b3999e6017ba7f5eba5e41206d` | `lute/static/js/lute.js`: first/last selection endpoints; MIT LICENSE.txt read | Independent two-endpoint phrase selection, including reverse order, same-sentence boundary. No jQuery, UA detection or long-press dependency. |
| `mengxi-ream/read-frog@001e0b2984fbdb267e7dd68dd1b1b32e170d7310` | `src/components/ui/selection-popover/__tests__/selection-source-content.test.tsx`: source expansion sizing; GPL-3.0 | Keep source readable, no fixed empty region; one native-dialog scroller. Concept only, no copied implementation/test. |
| `zeeguu/api@3cfe269b2bb2b098e5262640ba1e1aecdd4e1878` | `zeeguu/core/model/bookmark_context.py`: source coords separate from fragments; MIT | Keep sentence/video/timestamp beside meaning. Persistence coordinates remain governed by SPEC, not text-only dedupe. |

Raw files/licenses were cached in the calling chat's `work/product-research/repos`. Static selective reading only; upstream repos were not installed or run. SHA identifies the inspected revision, not a promise that it is latest. No additional dependencies introduced. Existing tokenizer now recognizes typographic apostrophes and supports bounded phrase endpoints; original rendered text is retained.

### Translation invariants and candidate audit — 07/10/2026

See RESEARCH-NOTES for pinned Hy-MT2/VinAI/Argos source and licenses, Google/Chrome/Gemini primary docs and the live six-case comparison. `src/lib/video/translation.ts` owns source-ID validation, budgets, adjacent context and versioned provider/source fingerprint. `src/app/watch/[videoId]/use-translations.ts` manages activation, sequential progressive device results, cancellation and account-scoped bounded local cache. `/api/translate` reuses authenticated Gemini/gateway/rate-limit infrastructure and requires explicit subtitle enablement. Original timestamps stay client/source-owned. Cache is localStorage, not the planned DB cache; Chromium expert translation has no contextual prompt and its exact downloaded model revision is opaque. Native browser failure and unsupported/device states are distinct from server AI/quota errors. Cloud-disabled and mocked tests do not establish provider quality or distributed quota persistence.


Hy-MT2 local engine refinement (07/10): provider descriptors carry model/profile/batch/character/timeout budgets only; credentials/endpoint remain server-side. Local source IDs are assigned from the selected single cue, never generated/parsed by a model. Contextual prompt uses actual adjacent source cues; one response cannot move clocks or merge lines. Native/Gemini/Hy-MT cache identities stay distinct, and pinned quantization/runtime/prompt changes invalidate local answers. Stop on local errors, cancellation or mismatched model/profile; never fall through to Gemini. Tested CPU deployment uses 2048 context, 2000-character source+context cap, 512 output tokens and 45s request timeout; oversize/truncation is an honest failure, not clipped source/success. Loopback is a local-Next capability, not a Cloudflare-hosted provider. Same auth boundary; production/model semantics remain separately gated.
