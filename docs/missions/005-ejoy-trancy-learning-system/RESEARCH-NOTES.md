# Ghi chú nghiên cứu — eJOY, Trancy và 39 repo tham khảo

Ngày 2026-10-06. Nguồn: nhánh `research/ejoy-archive-2026-10-06` (commit `aa2d6678`), file `research-support.zip` ghép từ 9 phần. Gói gồm báo cáo sản phẩm eJOY (`ejoy-product-research/bao-cao-ejoy.md`), hồ sơ Trancy (`github-research/TRANCY.md`, `trancy/official-pages.md`) và nghiên cứu tĩnh 39 repo (`github-research/BAO-CAO.md`, `DANH-MUC-REPO.md`, `SCOPE.md`).

## Giới hạn bằng chứng

- eJOY và Trancy: nghiên cứu tài liệu công khai (website, help center, cửa hàng ứng dụng); **chưa cài, chưa dùng thử**. Trancy không có mã nguồn công khai để xác minh.
- **Cập nhật cùng ngày**: Trancy sau đó đã được khảo sát xác thực (đăng nhập Learning Center, đọc gói extension, bắt API live, 36 ảnh chụp) — xem [TRANCY-DEEP-DIVE.md](./TRANCY-DEEP-DIVE.md). Quyết định tại thời điểm deep-dive: **Trancy là chuẩn duy nhất**; eJOY chỉ còn vai trò tham khảo. Yêu cầu chủ dự án sau đó mở rộng đối chiếu sản phẩm để học chọn lọc — xem mục khảo sát bổ sung ở cuối file.
- 39 repo: nghiên cứu **tĩnh** — đã lập chỉ mục ~27.000 blob (~1,83 GB) nhưng chỉ khoảng 56 file được đọc ngữ nghĩa thủ công; **không build, không chạy repo nào**.
- Vì vậy gói này là **chuẩn sản phẩm và bằng chứng thiết kế** (mức "market/product evidence" trong `SOURCE_OF_TRUTH.md`), không phải bằng chứng học tập của AtoEnglish.

## Chuẩn sản phẩm rút ra từ eJOY và Trancy

Vòng học chung của hai sản phẩm: **chọn nội dung → hiểu tại chỗ (phụ đề song ngữ, tra từ, giải thích AI) → lưu từ/câu kèm ngữ cảnh → luyện nghe/nói trên chính video → ôn lặp lại ngắt quãng → dùng lại**. Ba điểm báo cáo eJOY khuyên học: giảm thao tác từ nội dung đến bài học; giữ ngữ cảnh; nối đầu vào với thực hành. Trancy bổ sung: ghép phụ đề thành câu trước khi dịch, chế độ đọc, phân tích ngữ pháp câu, lưu câu riêng với lưu từ, Practice Mode. Bảng đối chiếu từng tính năng và quyết định: [SPEC.md §2](./SPEC.md).

Căn cứ phương pháp (theo báo cáo eJOY): phân tích gộp 2022 (34 nghiên cứu) ghi nhận video có phụ đề giúp học từ, phụ đề cùng ngôn ngữ lời nói tác động lớn nhất → cho phép chế độ "chỉ EN" và "ẩn phụ đề", không mặc định song ngữ là tối ưu. Kim & Webb 2022 (48 thí nghiệm) ghi nhận ôn ngắt quãng có tác động trung bình–lớn → giữ FSRS nhưng không tuyên bố thuật toán tự nó vượt trội.

## Bản đồ repo → phần việc

Chỉ liệt kê repo hữu ích trực tiếp cho từng phần; danh mục đủ 39 repo nằm ở `DANH-MUC-REPO.md` trong gói.

| Phần | Việc                                  | Repo tham khảo                                                                                                                                              | Giấy phép → cách dùng                                                                               |
| ---- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | Chuỗi lấy phụ đề YouTube phía server  | `Talljack/echo-type` (player client iOS → Android → watch page → timedtext list, ngân sách 6 request)                                                       | MIT → được tham khảo mã, ghi nguồn khi mượn                                                         |
| 1    | Ghép câu từ `asr` `json3`             | `mengxi-ream/read-frog` (`parseScrollingAsrSubtitles` + test); `Nitrino/easysubs` (end từ `tOffsetMs`); `TideSparrow/shadowing-english` (cache ASR theo từ) | read-frog GPL-3.0 → chỉ ý tưởng; easysubs, shadowing-english MIT                                    |
| 1    | Render phụ đề chọn được, phụ đề kép   | `rsimmons/subadub`, `gmertes/NflxMultiSubs`, `asbplayer/asbplayer`                                                                                          | subadub, NflxMultiSubs MIT; asbplayer AGPL → chỉ ý tưởng                                            |
| 1, 4 | Lặp câu, shadowing, timestamp editor  | `TideSparrow/shadowing-english`, `xiaoshuangsu/dictation-shadowing-tool`, `Oliviaviaviavia/english-trainer`                                                 | shadowing-english, english-trainer MIT; dictation-shadowing-tool chưa có LICENSE root → chỉ ý tưởng |
| 2    | Song ngữ theo câu bằng LLM            | `lexweave-hq/lexweave` (compile bằng LLM, render xác định), `read-frog`                                                                                     | lexweave Apache-2.0; read-frog GPL → chỉ ý tưởng                                                    |
| 2    | Popup tra từ, nhiều nguồn từ điển     | `Nitrino/easysubs`, `pnlpal/dictionariez`, `FreeLanguageTools/vocabsieve`                                                                                   | easysubs MIT; dictionariez GPL-2.0, vocabsieve GPL-3.0 → chỉ ý tưởng                                |
| 3    | Một từ – nhiều ngữ cảnh               | `zeeguu/api` (`UserWord` mang lịch ôn, `Bookmark` mỗi lần gặp kèm nguồn, câu, vị trí token)                                                                 | MIT                                                                                                 |
| 3    | Trạng thái từ, tô sáng từ đã biết/lưu | `LuteOrg/lute-v3`, `word-hunter/word-hunter`, `simjanos-dev/LinguaCafe`                                                                                     | lute-v3 MIT; word-hunter chưa xác nhận, LinguaCafe GPL → chỉ ý tưởng                                |
| 3    | Thẻ có câu + mốc giờ từ video         | `asbplayer` (`exportCard`), `knowclip/knowclip`                                                                                                             | AGPL → chỉ ý tưởng                                                                                  |
| 4    | So khớp lời nói ↔ transcript          | `english-trainer` (khi không có Azure chỉ so transcript), `pstepanovum/Cadence`                                                                             | MIT; Cadence cho thấy điểm âm vị 96/48 là quy ước, không phải xác suất → không chấm phát âm         |
| 5    | FSRS trong ứng dụng web               | `echo-type` (`ts-fsrs`, `accuracyToRating` ngưỡng 50/70/90), `google/bespoke` (SRS đa kỹ năng trong ngữ cảnh)                                               | MIT; Apache-2.0                                                                                     |
| 5    | Bài tập AI dùng từ đã lưu             | `pretzelai/openlingo` (Next.js + Better Auth + Postgres, SM-2), `baturyilmaz/wordpecker-app`                                                                | MIT                                                                                                 |
| 6    | Thư viện nội dung theo chủ đề         | `usemoslinux/aprelendo`, `LinguaCafe`                                                                                                                       | GPL → chỉ ý tưởng                                                                                   |

Quy tắc chung: chỉ mượn mã từ repo MIT/Apache-2.0/Unlicense, ghi nguồn trong comment và PR; repo GPL/AGPL/chưa rõ giấy phép chỉ dùng làm ý tưởng. `mLearn` (Sustainable Use License) và `openkoto` (Apache + điều kiện riêng) không mượn mã.

**Đọc sâu code thật** (cùng ngày, reading-packets): kỹ thuật cụ thể trích từng repo — parser ASR, PO Token, FSRS helpers, model bookmark, CSS Highlight, similarity, dictation blanking, prompt agent — xem [TECH-KNOWLEDGE.md](./TECH-KNOWLEDGE.md). §9 của file đó liệt kê các thay đổi đề xuất cho SPEC/TASK_CONTRACT.

## Kiểm chứng kỹ thuật của mission này (06/10)

Một lần thử trên một video công khai từ IP dân dụng (không phải từ Cloudflare Worker):

- `youtubei/v1/player` client Android trả `OK`, có track EN do người đăng tạo và EN `asr`; `translationLanguages` có `vi`.
- `baseUrl` có sẵn `fmt=srv3`; nối thêm `&fmt=json3` vẫn nhận XML → phải **thay** `fmt`.
- `asr` `json3` có thời gian từng từ (`segs[].tOffsetMs`) và cắt giữa câu → cần ghép câu (SPEC §4.3).
- `tlang=vi` (YouTube tự dịch) trả 429 ngay lần đầu → không dựa vào nó; dịch bằng Gemini theo câu.

Chưa kiểm chứng: hành vi khi gọi từ IP của Cloudflare Worker (phần 1 bắt buộc kiểm tra live).

## Những gì không lấy

- Quota Free/Premium, gói trả phí, Game Center, chỉ số Fluency/Difficulty, streak — phạm vi đã đóng.
- AI Subtitle bằng Whisper (phải tải âm thanh), AITalk / AI Speaking World, chấm phát âm.
- Extension, Netflix, dịch web/PDF — chỉ web và YouTube cho tới khi vòng học được kiểm chứng.


## Khảo sát bổ sung 06/10/2026 — học cơ chế, thiết kế cho AtoEnglish

Yêu cầu chủ dự án trong phiên này: đọc kho tài liệu và dự án hiện tại, khảo sát Trancy sau đăng nhập, nghiên cứu thêm sản phẩm và repo để phát triển thông minh hơn; không sao chép nguyên giao diện. Yêu cầu này cập nhật cách sử dụng chuẩn Trancy trước đó: Trancy vẫn là tham chiếu chính của vòng học, nhưng lựa chọn giao diện phải được giải thích bằng nhu cầu người học và dữ liệu AtoEnglish. Không mở hướng sản phẩm thứ hai.

### Trạng thái thực tế và độ tin cậy

- Checkout nghiên cứu: `docs/005-ejoy-trancy-system`, HEAD `938a69081ffd009a6ee2d67fcf5f29df0fc77061`; có WIP home/sidebar chưa commit. Main xác minh qua GitHub: `a0043069938c841a9bfa406a4c963da521e65ba8`; PR #233 đã merge, PR #235 đang mở. Không suy trạng thái production từ checkout.
- Đã đọc PROJECT_STATE, SOURCE_OF_TRUTH, SPEC, PLAN, TASK_CONTRACT, REDESIGN, RESEARCH-NOTES, TECH-KNOWLEDGE, LEDGER và mã liên quan. Kho đã có nghiên cứu 39 repo; không lập thêm danh mục thay thế. Đợt này lấy 33 file mã/test/tài liệu/LICENSE từ 8 repo, đọc chọn lọc các phần liên quan và ghim SHA. **Không build/chạy các repo tham khảo.**
- Trancy: truy cập thực tế sau đăng nhập; quan sát home, player với phụ đề EN–VI, tra từ, các câu chứa từ trong video, thư viện từ ở trạng thái rỗng. Chưa thử ghi thẻ, hoàn tất phiên ôn, paywall hay đo hiệu quả học. Player có lúc hiện thời lượng `00:00` dù có phụ đề; không dùng phiên này để kết luận độ chính xác đồng bộ audio.
- Các sản phẩm khác: tài liệu chính thức công khai; chưa dùng thử tài khoản. Tính năng nhà cung cấp mô tả là bằng chứng về thiết kế, không chứng minh học tốt hơn.
- Plate Control Tower đã đọc: Product Truth THU-8 và Current State THU-9 còn hướng curriculum/mission 004, PR #232 và trạng thái cũ; Active Work/Next không phản ánh checkout 005. Ghi nhận lệch để đồng bộ khi cập nhật quản trị; không dùng thông tin cũ đó để quay lại curriculum. Chưa sửa Plate.

### Phần đang chạy và phần còn thiếu

| Phần | Bằng chứng mã hiện tại | Hệ quả thiết kế |
| --- | --- | --- |
| Khám phá | `src/app/(main)/discover/page.tsx:115`, catalog 18 video; hỗ trợ dán link, lọc, tiếp tục xem | Có thể cải thiện luồng vào nội dung ngay trên trang hiện có |
| Player | `src/app/watch/[videoId]/watch-client.tsx:72`; iframe, ghép câu, nghe lại/lặp/tự dừng, theater/read | Không dựng player hay app song song |
| Tra từ | `src/app/watch/[videoId]/transcript-rail.tsx:65`: cả câu là button, token là span | Chưa có word lookup trong transcript; phải tách seek, word và save thành điều khiển riêng, tránh button lồng button |
| Song ngữ | Transcript hiện render EN; mô hình câu sẵn sàng cho VI | Dịch phải bám câu/phiên bản gốc; không để AI đổi timestamp hoặc tách câu |
| Lưu/ôn | Source/transcript đã persist; chưa có runtime `study_cards`, `card_contexts`, `practice_attempts` và các màn library/review/read/me hoàn chỉnh | Luồng học thiếu mắt xích lưu và quay lại; đếm thẻ/đến hạn chưa có dữ liệu |
| Hoạt động | `src/app/actions/captions.ts:318` cập nhật vị trí và `updated_at`; discover lấy ngày cập nhật source | Đây là snapshot lần cập nhật nguồn, không phải lịch sử ngày học: xem lại cùng video sẽ ghi đè ngày trước |
| Sidebar | `src/app/(main)/discover/page.tsx:229`: Flashcard, PDF và tiến độ còn placeholder | Không biến chỗ trống thành thành tích hoặc backlog PDF; sidebar chỉ nên ưu tiên hành động khả dụng |
| Theo dõi câu | `src/app/watch/[videoId]/transcript-rail.tsx:33`: activeIndex luôn scrollIntoView | Cần cho phép đọc thủ công và nút trở lại câu đang phát |

### So sánh sản phẩm → chọn cơ chế phù hợp

| Sản phẩm và nguồn | Cơ chế đáng học | Điều chỉnh cho AtoEnglish |
| --- | --- | --- |
| Trancy — khảo sát trực tiếp + [Read Mode](https://manual.trancy.org/en/get-started/use-extension/bilingual-subtitles/read-mode) | Từ điển ở cùng màn, timestamp, danh sách câu khác chứa từ; đọc theo câu | Nghĩa phù hợp câu đang xem ở đầu, nghe lại/lưu rõ ràng; chi tiết từ điển mở dần. Giữ câu đang học khi đóng drawer |
| [Language Reactor: export](https://www.languagereactor.com/help/export) | Phân biệt từ có ngữ cảnh, từ rời và phrase; lưu vị trí từ, subtitle index, video/timestamp; cloze có ngữ cảnh | Mỗi thẻ nối nhiều lần gặp; vị trí token phục hồi đúng cụm. Tách nguồn dịch người/AI. Chưa thêm Anki export vào MVP |
| [eJOY: Word Hunt](https://ejoy-english.com/en/help/wordhunt-feature-on-ejoy-go-and-ejoy-extension) | Tìm từ/cụm trong các đoạn video để xem cách dùng | Bắt đầu bằng các câu trong transcript hiện có, rồi nguồn đã lưu. Không cần crawl kho video hoặc dựng search toàn cầu |
| [Migaku: features](https://migaku.com/faq/features) | Tra cứu theo ngữ cảnh, tạo thẻ tại chỗ, nhiều cách hiện/ẩn phụ đề | Cho phép chỉ EN/EN–VI/ẩn rồi hiện theo câu; một thẻ tập trung một mục tiêu. Giữ iframe + timestamp, không lấy audio/screenshot từ YouTube |
| [LingQ: hướng dẫn sử dụng](https://www.lingq.com/how-to-use-lingq/) | Nội dung theo sở thích, từ đã lưu nổi bật khi gặp lại, tự điều chỉnh trạng thái, ôn SRS | Underline lần gặp đã lưu, xem lại nhiều bối cảnh. “Tự đánh dấu đã biết” tách khỏi kết quả nhớ sau khoảng cách |
| [Lingopie: tính năng](https://lingopie.com/blog/best-features-on-lingopie/) | Ôn thẻ có thể phát lại cảnh gốc; loop câu, script bên cạnh video | Ôn → mở đúng câu gốc là hợp đồng bắt buộc. Tra từ không tự động lưu; xem đáp án/nghe lại phải ghi nhận hỗ trợ |

Những đề xuất này là suy luận thiết kế từ nguồn, cần kiểm chứng trên AtoEnglish. Không lấy các tuyên bố quảng cáo “học nhanh”, “nhớ mãi”, số phần trăm ghi nhớ hoặc “fluency” làm mục tiêu kỹ thuật.

### Khác biệt AtoEnglish cần xây

1. **Tiếng Việt viết có chủ đích**: nghĩa ngắn theo câu trước; nghĩa từ điển tổng quát sau; bản dịch AI có nhãn và nguồn. Không dịch máy tên nút, nhãn giọng US/GB hoặc trạng thái học.
2. **Lưu là một quyết định rõ**: click tra không tự lưu. Chỉ hiện “Đã lưu” khi server xác nhận; lỗi giữ nguyên lựa chọn và có thử lại. Lưu từ/cụm và lưu toàn câu là hai thao tác phân biệt.
3. **Luyện trực tiếp trên câu đã chọn**: từ drawer/line đến bài chép nghe không cần tìm lại video; nguồn và đoạn gốc luôn truy cập được. Shadowing cho phép tự đối chiếu, không gắn điểm phát âm.
4. **Ôn có dấu vết**: lưu attempt, gợi ý, lần nghe lại, rating, lịch trước/sau. AI không tự đổi lịch. Tự đánh dấu biết, lượt xem và số thẻ lưu đều không thay kết quả nhớ.
5. **Home phục vụ quyết định tiếp theo**: chọn video, tiếp tục đoạn đang xem, ôn thẻ thực sự đến hạn. Chỉ số đưa ra phải trả lời “hôm nay làm gì?” hoặc “mình nhớ được gì?”.

### Thứ tự làm tiếp trong PLAN hiện có

Đây là cách cụ thể hóa các slice đã có, không thay PLAN bằng roadmap mới:

- **Hoàn tất điều kiện slice 1**: phụ đề có lỗi phân loại + fallback dán SRT/VTT; xác minh từ Worker preview; giữ một vùng cuộn dọc chủ đạo. Không coi bản chạy local là proof Worker/production.
- **Slice 2 — hiểu câu**: curated lookup dùng nguồn gloss hiện có; nghĩa ngữ cảnh AI theo yêu cầu; dịch VI bám `source_id + transcript_version + sentence_index`. Tách cấu trúc DOM trước khi thêm WordToken. Chốt một bảng phím tắt dựa trên code và cập nhật nhãn/tests, tránh hai mapping trái nhau.
- **Slice 3 — lưu và mở lại**: `study_cards` + `card_contexts`, unique constraints và RLS theo SPEC; save idempotent, một thẻ nhiều ngữ cảnh; library mở lại đúng câu. Chưa tạo/áp migration vào DB thật trong đợt nghiên cứu này.
- **Slice 4/5 — luyện và ôn**: nối một dạng chép nghe trên câu có nguồn trước, sau đó review thẻ đến hạn qua adapter FSRS hiện có; ghi attempt và cập nhật lịch trong một transaction, có chống double-submit. Các mode khác theo SPEC sau khi đường này hoạt động.
- **Sidebar và /me**: ôn hôm nay lấy queue thực, nguồn đang xem lấy resume; hoạt động theo log sự kiện/attempt thực. Chưa có lịch sử thì dùng thông báo ngắn thay biểu đồ giả. Không thêm PDF/target vòng tròn chỉ vì tham chiếu có.

### Tiêu chí nghiệm thu để nghiên cứu thành sản phẩm

| Mã | Kịch bản bắt buộc | Bằng chứng cần |
| --- | --- | --- |
| UX-1 | Home trên desktop/mobile chỉ có một vùng cuộn dọc; feed/sidebar đi cùng trang; không tràn ngang | Browser ở 1440×900, 1024×768, 390×844, thêm bàn phím/zoom 200%; kiểm tra cả trạng thái nhiều nội dung |
| UX-2 | Theater dùng một transcript scroller trong viewport, document không tạo thanh thứ hai; read dùng document scroll | Cuộn bằng wheel/touch/keyboard và kiểm tra chữ phóng to, drawer mở |
| UX-3 | Click từ mở lookup không seek; click timestamp seek không mở lookup; lưu câu không mở từ | Test tương tác riêng + keyboard; không có button lồng nhau; nhãn điều khiển rõ |
| UX-4 | Đọc thủ công không bị kéo về câu active; “Theo câu đang phát” bật lại follow; đóng drawer trả focus | Browser với video đang phát và lookup AI chậm/lỗi |
| DATA-1 | Cùng lần gặp lưu hai lần chỉ một context; cùng từ gặp ở hai câu có hai contexts, một thẻ | Unit/integration + unique constraint; network retry/double-click |
| DATA-2 | Dịch thiếu/trùng/đảo ID bị từ chối; AI lỗi không làm mất EN/câu gốc | Schema + cache-version + fixture lỗi/timeout; ghi nhãn nguồn |
| DATA-3 | Người B không đọc/sửa thẻ, context hay attempt của A | Integration RLS với hai người dùng; không suy từ test UI guest |
| DATA-4 | Một attempt chỉ đổi FSRS một lần; refresh/submit song song không lặp; rollback không xoá bằng chứng | Transaction/concurrency tests; lưu card version và log lịch trước/sau |
| LEARN-1 | Thẻ mở đúng video/timestamp/transcript version; thiếu nguồn có trạng thái rõ | E2E save → library → nguồn → review; nội dung thực và caption fallback |
| LEARN-2 | Chép nghe ≥90% không gợi ý → Good; có gợi ý tối đa Hard; không tự Easy | Tests theo SPEC §7; no-hint và supported attempts báo riêng |

### Giả thuyết kiểm chứng nhỏ

Dùng một người học thực (Hoàng) trước: chọn nội dung tự thích, ghi mức ma sát từ câu chưa hiểu đến lưu và quay lại câu gốc. So sánh các phiên bằng nhật ký định tính, không gọi là A/B test với một người. Đo thời gian/thao tác, chỗ phải tự sửa nghĩa, số lần bị auto-scroll giật, lỗi mất nguồn và khả năng nhớ không gợi ý sau khoảng cách. Mốc ≥7 ngày trong SPEC là cohort báo cáo nội bộ, không phải bằng chứng rằng mọi thẻ đều cần ôn đúng ngày thứ bảy.

[Kim & Webb (2022)](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479) tổng hợp 48 thí nghiệm (3.411 người), tìm thấy lợi ích của luyện ngắt quãng và khác biệt ở kiểm tra trì hoãn. Nghiên cứu hỗ trợ đo nhớ sau khoảng cách; không xác nhận riêng FSRS, UI Trancy hay kết quả của AtoEnglish. Muốn nói “học tốt hơn” phải có dữ liệu nhớ độc lập và mẫu số đủ điều kiện của chính sản phẩm.


### Home packet implemented — 06/10/2026

Owner continued home development after the research checkpoint. The current implementation applies REDESIGN §9: useful filters and count/reset, one document scroll, honest viewer-state recovery, concise sidebar and non-navigable future surfaces. See the Home v6 ledger entry for exact local checks and limits. Research on [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) informed the 320 CSS px expanded-filter check; passing this check alone does not establish WCAG conformance. No claim of learning improvement is made.

### Home/search/dictionary refinement — 07/10/2026

Owner corrected the removed statistics and requested the Trancy discovery picker and AI dictionary affordance. Restored Flashcard/statistics/Activity/Progress in the single-scroll sidebar; unavailable personal counts stay “—”, not simulated zero/history. One search launcher now opens a Video/Channels/topic picker with a single field, direct YouTube-link intake and a shared catalog filter. Curated channel counts use only the actual catalog.

Quick dictionary reuses `lookupGloss` (501 curated entries) and existing speech helper. Explicit AI requests use the existing Gemini model/gateway helper, authenticated session, rate limiter, bounded term/context and validated JSON; no Data API writes or scheduling effects. Curated misses, AI misses, login/configuration/provider/timeout failures remain visible. Real authenticated Gemini/runtime output and audio quality remain unverified.

Research: [W3C modal dialog keyboard/focus pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Gemini generateContent JSON response documentation](https://ai.google.dev/api/generate-content). Native dialog behavior required explicit focus boundaries and Escape handling for search inputs. Next dev origin can use its internal 0.0.0.0 bind; same-origin checks use the request Host/protocol and reject external Origin. Browser regression captured both issues before release.

### Trancy practice research → contextual lookup — 07/10/2026

Authenticated live inspection of `https://learn.trancy.org/practice/y64RDBeR19c`: paused the video, chose the 3:26 timestamp, opened **versatility** from its source caption, inspected AI Definition and “Examples from the video”, then read Settings. Settings expose layout, sentence/phrase segmentation, translation engine, typography, karaoke and saved-word highlighting. No preferences/saves/premium actions changed. The source-example action keeps the original line and timestamp; the inspected definition includes general meanings and a premium gate. This is observed interaction, not proof of learning benefit or provider accuracy.

Selective implementation in existing `/watch`: independent timestamp controls seek/play; word controls open the existing dictionary without seeking and pause playback. A source section keeps sentence, video title and timestamp; explicit replay closes lookup and seeks that source. Closing returns focus to the selected word without autoplay. “Chọn cụm” uses two endpoints inside one sentence, supports reverse order and keyboard/touch, resets when another sentence is chosen and rejects overlong selections without truncation. Untimed text never invents replay/timestamps. Curated meaning is labelled general; AI receives the sentence only on explicit request. Source+meaning precede the edit form, which avoided scrolling the actual answer out of view on mobile.

Choice of technology: reuse React context, the existing tokenizer/gloss, native dialog, iframe and dictionary endpoint. No new dependency or parallel player/dictionary. [React](https://react.dev/reference/react/useImperativeHandle) favors declarative state/props over unnecessary imperative handles; [WAI dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) informs focus containment/return. Existing root/body locks mean one dialog scroller while background content is inert.

Sources adapted as concepts: [Lute endpoint selection](https://github.com/LuteOrg/lute-v3/blob/933d0840aede93b3999e6017ba7f5eba5e41206d/lute/static/js/lute.js) (MIT), [Read Frog selection/source handling](https://www.readfrog.app/en/docs/selection-translation) and [video subtitles](https://www.readfrog.app/en/docs/video-subtitles), and [Zeeguu source context](https://github.com/zeeguu/api/blob/3cfe269b2bb2b098e5262640ba1e1aecdd4e1878/zeeguu/core/model/bookmark_context.py) (MIT). Read Frog is GPL-3.0: no source copied. Lute's pointer/long-press behavior became explicit buttons rather than browser/device-specific gestures. Zeeguu source identity informs the later save contract; this increment does not implement persistence.

Remaining slice-2 work: aligned Vietnamese translation and versioned sentence cache; live authenticated AI validation. Later save must retain source/transcript version/sentence/token span; viewing or looking up cannot imply saved/mastered. See the latest LEDGER checkpoint for final checks and the E2E configuration incident.

### Free-first subtitle translation research — 07/10/2026

**User priority:** automatic translation is the core feature; prefer no provider fees and the best Vietnamese meaning quality available. Price and fluency alone cannot choose the engine.

**Live Trancy evidence:** opened the authenticated practice video at `/practice/y64RDBeR19c`, read Settings → Translation Engine. Google was selected under **Free**, alongside SiliconFlow; Advanced AI was separate. Only inspected the menu, then closed it; no engine/settings/account changes or premium purchases. The page showed a named NPR program translated literally and a father subsequently called “anh ấy”. This identifies weaknesses in the observed output, not Trancy's internal request architecture. Their [manual](https://manual.trancy.org/en/get-started/use-extension/custom-translation-engine) also identifies sentence breaking as a source of translation error. We cannot infer their private API, batching or caching from UI.

**Google Translate experiment:** six self-authored EN→VI cases tested in the live website. The model menu showed **Advanced, built with Gemini** selected. All six retained the tested meaning in manual review: negation, currency, illness idiom, proper program name, father pronoun, startup funding metaphor. AtoEnglish's real Chrome Translator API passed the two basic meaning checks but failed the four idiom/name/context cases. Input interfaces differ (Google received six lines together; Chrome received individual full cues). This is a small smoke comparison, not a benchmark proving a globally best model; Google's exact backend model and Chrome's downloaded model version are not exposed. No mocked success is counted as quality evidence. Raw samples/review: projectless `outputs/translation-evaluation.json`; screenshots `google-translate-quality-study.png`, `atoenglish-free-translation-live.png`, `trancy-translation-engines-study.png`.

**Shortlist and source/code audit:**

| Engine/source | Evidence / tradeoff | Decision |
| --- | --- | --- |
| [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api) | Device processing, Vietnamese supported, desktop availability check plus user activation/model download; no cross-cue context parameter. Real app experiment found four meaning failures. | Explicit quick-translation option with limitations; not the chosen quality engine. No key/paid fallback. |
| [Google Cloud Translation](https://cloud.google.com/products/translate/pricing?hl=en) | Official NMT offers a monthly 500,000-character credit; beyond it is billed. Translation LLM has separate metering. The free web interface does not grant an official unlimited free application API. | Useful quality baseline; don't silently add billing or depend on reverse-engineered web endpoints. |
| [Gemini free tier](https://ai.google.dev/gemini-api/docs/pricing) | Existing app model 2.5 Flash has free input/output with limits; project billing tier must be verified. Context and structured output can help but do not prove meaning accuracy. | Optional configured engine. `SUBTITLE_GEMINI_ENABLED=true` required in addition to the server key; disabled by default. No key in browser. No real API quality claim yet. |
| [Hy-MT2](https://github.com/Tencent-Hunyuan/Hy-MT2), commit `ff1903ecaa724e10951a23c16817a2413c752b35` | Read README, Apache-2.0 LICENSE, inference instructions and IFMTBench rule/scoring/judge code. [1.8B model](https://huggingface.co/tencent/Hy-MT2-1.8B) supports VI, contextual instructions and quantized deployment. IFMTBench dataset separately CC-BY-4.0; deterministic format gates differ from model/human semantic scoring. | Local CPU Q4_K_M run completed on 07/10: 6 baseline + 30 contextual self-authored cases; see the update below. Optional experimental adapter integrated, disabled by default; semantic release gate not passed. No per-call provider fee, but RAM/hosting and quantization accuracy matter. Current host has about 2.5 GiB available RAM and no existing llama/ollama runtime; avoid starting a memory-heavy model during app work. |
| [VinAI Translate](https://github.com/VinAIResearch/VinAI_Translate), commit `54984179493cf94e71ba46c53b5984ced93007a7` | Read README inference examples and AGPL-3.0 license. Specialized en2vi-v2, 448M, max length 1024; true batch arrays and beam search. | Vietnamese-specific comparator; handle licensing and token limit before incorporation. No source/weights copied into product. |
| [Argos Translate](https://github.com/argosopentech/argos-translate), commit `17ed1a9b055c5ba1b51d76b683bbb0c64e2a4a88` | Read MIT license and `argostranslate/translate.py`: CTranslate2, paragraph-level caching and composite/pivot translation. [LibreTranslate](https://docs.libretranslate.com/guides/supported_languages/) lists en→vi. | Free/offline comparator, not assumed highest Vietnamese quality; package/model licenses and operational cost still need checking. |
| [MADLAD-400](https://huggingface.co/google/madlad400-3b-mt) | Apache-2.0 model card, target-language token, CPU/GPU usage; 3B larger resource footprint. | Additional permissive comparator if resources permit; not run. |

Read Frog's pinned `src/utils/subtitles/processor/translator.ts` (`001e0b2984fbdb267e7dd68dd1b1b32e170d7310`, GPL-3.0) separates provider capability, provider/source/context cache identity, queue scheduling and friendly quota errors. Learn those invariants without copying code. [Video subtitle docs](https://www.readfrog.app/en/docs/video-subtitles) warn that model segmentation adds latency and may worsen timing. AtoEnglish keeps the existing deterministic segmentation and original clocks.

**Implemented bounded foundation:** existing `/watch` now has EN+VI/EN/VI/hidden modes, progressive free device translation after an explicit activation/download, current-cue-first serial scheduling, per-account bounded device cache keyed by full source/timing/actual segmentation version/provider/prompt version, and cancellation when modes/transcripts change. Gemini's optional server route accepts capped batches and neighboring context, validates `{i,vi}` by source ID, rejects foreign/duplicate IDs, retains honest missing/null output, reports quota/timeouts without automatic paid fallback or retry storms. Original EN/timestamps are never generated/rewritten by a model. Native output is labelled quick machine translation after the real quality result above.

**Quality acceptance for the next engine:** freeze 30 cases (15 real permitted library subtitle windows + 15 authored edge cases); blind manual review of meaning, negation/amount/name/pronoun/idiom failures and naturalness. Zero critical semantic errors on the release corpus; 100% source-ID/timing integrity independently enforced. Report exact model/quantization/source revision, cold download separately from inference latency, partial failures/cache hit rate, and actual provider spend. Six cases today do not satisfy that release gate. Human-authored VI priority, persistent per-user DB translation cache, live authenticated Gemini validation, and a broadly supported free provider remain open slice-2 work. No new DB table/migration/deploy in this increment.


### Hy-MT2 contextual adapter and actual CPU evaluation — 07/10/2026

User asked to move research into development. Continued the existing `/watch`/`/api/translate` increment, preserving other WIP and learner-auth ownership. Downloaded **official Tencent Hy-MT2-1.8B Q4_K_M** at HF revision `a0c709d9fac510f2c807aa3af52872340dc37a4a`; weights SHA-256 `dc5f44fcf1fa496ee7ad725982c0c8c553a4de00259b53af84c4b89fb0c06699` verified against official LFS metadata. Used official llama.cpp **b11457**, commit `5ad1c5da0ad7f6176256b823925aad19134f0263`, archive SHA-256 `210eaa41a16e0d24fa44071cb62f95702ef903c84d86506d6482ac919bcee078` verified. CPU two threads, context 2048, one slot, low process priority; GPU driver unavailable. Software/model stay under the calling workspace, no system install.

Baseline six-case run fixed the illness idiom and father pronoun but translated break-even as profit, a critical meaning error. Implemented the official model's **background + source** prompt shape with general meaning/name/amount/instruction-as-data constraints; no per-case output replacements. Froze **30 self-authored development cases before the contextual run**, including cross-cue father pronoun, held-out break-even/profit contrast, obligations versus prohibition, financial/river bank ambiguity, duck disambiguation, quoted hostile instructions, names/codes/email, units, dates and idioms. The live contextual run called the actual production adapter `translateLocally`; no provider mocks. All 30 completed with `stop`; no runtime failures. Codex reading against the stated criteria detected no critical meaning error, but flagged three wording/constraint concerns: partly translated named program, awkward financial term, unnatural “xe tàu”. This was **not independent blinded human review**, and the corpus is all authored, not the planned permitted-library release corpus. No globally-best-model or production-readiness claim.

Timing: p50 **4.3885s**, empirical lower-index p95 **11.041s**, max **13.17s** per cue on this host. Record cold startup separately (about 3 seconds according to server log); no inference-latency comparison to Google web/Chrome is claimed. Contextual/baseline inputs differ, so this supports an implementation hypothesis, not a controlled model ranking. Full source, actual output, criteria, review and timing remain in calling workspace `outputs/translation-evaluation.json`; artifact hashes/version metadata in `work/translation-engine/artifacts.json`.

Adapter uses one source cue per request, two existing adjacent context cues, 2000-character intake ceiling and 512-token output ceiling for the tested context deployment, a 45-second CPU timeout, exact `stop`/model/text validation, and source-owned ID assignment. English/timestamps never enter model-generated metadata. HTTPS or loopback HTTP only; no URL credentials/query/hash, no redirected credential forwarding. Backend key stays on server, only a safe engine descriptor reaches React. Cache identity includes pinned weights/quantization/runtime/prompt profile plus existing source/clock/segmentation version. Scheduler uses provider-specific batch and character budgets, progressive display and cancellation; rejects response from another model/profile. Local failure never calls Gemini.

Config example adds `SUBTITLE_LOCAL_ENABLED=false`, local endpoint and key. Local is selected only explicitly with complete config; an incomplete local choice never falls through to Gemini. Same signed-in boundary/rate limit as existing optional server translation. Runtime config **not changed** and no signed-in browser/model flow claimed. The temporary loopback evaluator used an ephemeral key, restricted CORS and no UI/slots; stopped after evaluation to return RAM. Model download remains about 1.13 GB on disk. Cloudflare Worker cannot use this machine's loopback address; a separately validated reachable backend is required for deployed operation. No hosting/billing/proxy/auth changes or deployment.

Verification on uncommitted local WIP: typecheck and changed-file lint PASS; 31 focused adapter/contract/route/React-hook unit tests PASS, affected three hook tests rerun PASS after making the test harness render pure; 25 guest translation E2E PASS across five viewports with mocked translator/player and no dotenv/DB/auth test setup. vinext/Cloudflare production bundle build PASS; existing route-classification warnings remain. Authenticated live model UI, permitted real-caption review, independent quality assessment, authored-VI ingestion and persistent DB cache remain open. This advances the translation engine increment, not full mission 005 acceptance.


## Readable bilingual caption presentation — 07/10/2026

Owner supplied a crop showing an English sentence stretched across the player with a much smaller Vietnamese line. Actual browser inspection with explicitly authored layout-sample captions also found the final word hidden by the two-line clamp. Root causes: horizontal padding on every lookup token, full-player reading measure, and fixed 128px caption/clamp assumptions.

Primary references read:
- [W3C SC 1.4.8 Visual Presentation](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation): AAA guidance supports bounded line width, regular spacing and non-justified text. Its 80-character mechanism requirement is not a broadcast-caption rule or a claim of full AAA conformance here. Adopt 60ch for the active caption and 68ch for read prose as local layout choices, not exact character counts.
- [W3C SC 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing): content must tolerate user overrides without loss. Its 1.5 line-height / .12em letter / .16em word spacing thresholds are test overrides, not prescribed default spacing.
- [MDN text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap): balance suits short caption blocks; unsupported/long blocks retain ordinary wrapping. Use progressive CSS balance only in the active EN/VI caption, not forced source line breaks or segmentation changes.

Local implementation: unpadded inline lookup words preserve natural whitespace and punctuation; 16/18px EN and 15/16px VI with line-height 1.5 and 8px language gap; full caption text grows naturally and the desktop video fits the remaining row. Rail/read uses comfortable left-aligned paired paragraphs (1.65 leading), larger text and bounded prose width. No new model, translation semantics, provider, timings, dictionary API or dependencies.

Verification on uncommitted WIP: 40 guest browser checks across 1854x950, 1440x640, 1024x768, 393x851 and 320x720 passed with mocked player/translation. New checks inspect every painted text rect, no clipping/overlap/horizontal overflow, tolerance for user spacing override, read layout/no nested scroll, and source replay. Existing lookup/phrase/focus, mode continuity, follow/manual scrolling and iframe geometry checks passed. Nine tokenizer tests passed. Changed-file lint and full typecheck passed after regenerating Next route types: the prior vinext build had overwritten routes.d.ts while leaving a Next validator importing incompatible exports; no generated-file hand edits or type suppressions.

Actual IAB desktop, mobile-width and read views inspected using a clearly labelled authored layout sample; Chrome's real quick translation output is visible in the screenshot and is not a model-quality evaluation. Screenshots under calling workspace outputs/caption-spacing-{desktop,mobile,reading}.png. These checks establish layout behavior for the tested fixtures/viewports, not learner comprehension, every extreme transcript length or full WCAG conformance. No deploy, DB write, real-caption fetch or production readiness claim.

### Dịch phụ đề hướng học — tổng hợp 39 repo + sản phẩm — 07/10/2026

Owner: "phải nghiên cứu tất cả thư viện repo về nó và phát triển hoàn chỉnh tính năng này" + "web này là học tiếng Anh". Đã giải nén lại gói `research/ejoy-archive-2026-10-06` (192 MB reading-packets, 39 repo, SHA ghim trong `DANH-MUC-REPO.md`) và quét mọi file có tên liên quan dịch/song ngữ: 28/39 repo có file liên quan. Đọc mã thật (không build/chạy) các repo có logic dịch đáng kể:

| Repo (licence) | File đã đọc | Kỹ thuật | Áp dụng |
|---|---|---|---|
| mengxi-ream/read-frog (GPL-3.0 → chỉ ý tưởng) | `entrypoints/background/subtitles-translation.ts`, `utils/prompts/subtitles.ts`, `utils/subtitles/processor/translator.ts` | Cache theo hash từng dòng (text + provider + prompt + ngữ cảnh); prompt mang **tiêu đề, mô tả, tóm tắt video**; glossary nối sau khi thay token; mặc định Microsoft (MT thuần), AI là tuỳ chọn "content-aware"; hàng đợi batch ≤5 cue; lỗi hosted báo một toast cho cả lượt | Đưa tiêu đề video vào ngữ cảnh; cache key gồm mọi input ảnh hưởng kết quả (đã có fingerprint) |
| umlx5h/LLPlayer (GPL-3.0 → ý tưởng) | `Translation/SubtitlesTranslator.cs`, `TranslateChatConfig.cs` | **Cửa sổ dịch quanh câu đang phát: 1 lùi / 12 tới**; tua xa hơn cửa sổ thì huỷ request; debounce 300 ms khi nhảy câu; chế độ KeepContext gửi **6 dòng trước kèm bản dịch của chúng** để giữ nhất quán | Giới hạn dịch theo cửa sổ thay vì cả video; gửi bản dịch câu trước làm ngữ cảnh |
| Nitrino/easysubs (MIT) | `googleTranslateBatchFetcher.ts`, `SubFullTranslation.tsx`, `PhrasalVerbTranslation.tsx` | Dịch cả dòng **theo yêu cầu** (popover + spinner), từ/phrasal verb có popover riêng + nút thêm vào bộ học; scrape endpoint batchexecute không chính thức | Lấy UX "bấm mới hiện"; **loại** scrape không chính thức |
| zeeguu/api + web (MIT / chưa rõ) | `endpoints/translation.py`, `translation_services/translator.py`, `llm_services/prompts/translation_validator.py`, `mwe_translation_service.py` | Tra từ = tạo bookmark kèm ngữ cảnh; ưu tiên **bản dịch cũ của chính người học**; voter nhiều nguồn + cờ disagreement; LLM kiểm tra bản dịch cho người học: ngắn, không "/", thành ngữ kèm nghĩa đen, CEFR, loại bỏ mảnh vô nghĩa; MWE tách rời | Slice 3 (lưu) dùng mô hình bookmark-from-lookup; tiêu chí bản dịch ngắn cho bài luyện |
| Talljack/echo-type (MIT) | `api/translate/free/route.ts`, spec inline-practice-translation | Bản dịch nằm **ngay dưới câu gốc** trong mọi chế độ luyện; không để bản dịch lệch câu; dùng gtx không chính thức | Giữ cặp câu EN/VI liền nhau; **loại** gtx |
| lexweave-hq/lexweave (Apache-2.0) | `packages/compile/src/translate.ts`, README | Compile once/render many; **brief cấp tài liệu** (tóm tắt, nhân vật, glossary) chèn vào mọi batch; checkpoint theo fingerprint; thang hỗ trợ A1→A4 | Ngữ cảnh cấp video; dịch một lần, cache dùng chung |
| google/bespoke, adrianvla/mLearn, HugoFara/learning-with-texts, pretzelai/openlingo | tên file dịch/translation cache/bulk translate | Dịch từ trực tiếp trên phụ đề, cache bản dịch, dịch hàng loạt từ chưa biết | Tra từ là đường hiểu chính |

Sản phẩm (đã ghi ở trên + TRANCY-DEEP-DIVE): Trancy dịch phía client bằng Google free, LLM chỉ cho premium/tra cứu, không dùng LLM dịch hàng loạt; eJOY hiện track VI có sẵn + Google/Microsoft, AI là Pro có quota; Language Reactor ưu tiên phụ đề người dịch, MT giới hạn ~5 giờ/ngày.

**Kết luận thiết kế (hướng học):** (1) nguồn: phụ đề VI do người dịch trên YouTube → cache → máy dịch, luôn ghi rõ nguồn; (2) tiếng Anh đứng trước, tiếng Việt bấm mới hiện từng câu; (3) chỉ dịch cửa sổ quanh câu đang phát, huỷ khi tua xa; (4) ngữ cảnh = tiêu đề video + câu lân cận + bản dịch câu trước; (5) không dùng endpoint không chính thức (gtx/batchexecute/`tlang`) từ server.
