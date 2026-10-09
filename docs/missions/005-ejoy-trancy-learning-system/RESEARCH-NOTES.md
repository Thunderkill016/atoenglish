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

| Phần         | Bằng chứng mã hiện tại                                                                                                                         | Hệ quả thiết kế                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Khám phá     | `src/app/(main)/discover/page.tsx:115`, catalog 18 video; hỗ trợ dán link, lọc, tiếp tục xem                                                   | Có thể cải thiện luồng vào nội dung ngay trên trang hiện có                                                         |
| Player       | `src/app/watch/[videoId]/watch-client.tsx:72`; iframe, ghép câu, nghe lại/lặp/tự dừng, theater/read                                            | Không dựng player hay app song song                                                                                 |
| Tra từ       | `src/app/watch/[videoId]/transcript-rail.tsx:65`: cả câu là button, token là span                                                              | Chưa có word lookup trong transcript; phải tách seek, word và save thành điều khiển riêng, tránh button lồng button |
| Song ngữ     | Transcript hiện render EN; mô hình câu sẵn sàng cho VI                                                                                         | Dịch phải bám câu/phiên bản gốc; không để AI đổi timestamp hoặc tách câu                                            |
| Lưu/ôn       | Source/transcript đã persist; chưa có runtime `study_cards`, `card_contexts`, `practice_attempts` và các màn library/review/read/me hoàn chỉnh | Luồng học thiếu mắt xích lưu và quay lại; đếm thẻ/đến hạn chưa có dữ liệu                                           |
| Hoạt động    | `src/app/actions/captions.ts:318` cập nhật vị trí và `updated_at`; discover lấy ngày cập nhật source                                           | Đây là snapshot lần cập nhật nguồn, không phải lịch sử ngày học: xem lại cùng video sẽ ghi đè ngày trước            |
| Sidebar      | `src/app/(main)/discover/page.tsx:229`: Flashcard, PDF và tiến độ còn placeholder                                                              | Không biến chỗ trống thành thành tích hoặc backlog PDF; sidebar chỉ nên ưu tiên hành động khả dụng                  |
| Theo dõi câu | `src/app/watch/[videoId]/transcript-rail.tsx:33`: activeIndex luôn scrollIntoView                                                              | Cần cho phép đọc thủ công và nút trở lại câu đang phát                                                              |

### So sánh sản phẩm → chọn cơ chế phù hợp

| Sản phẩm và nguồn                                                                                                               | Cơ chế đáng học                                                                                               | Điều chỉnh cho AtoEnglish                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Trancy — khảo sát trực tiếp + [Read Mode](https://manual.trancy.org/en/get-started/use-extension/bilingual-subtitles/read-mode) | Từ điển ở cùng màn, timestamp, danh sách câu khác chứa từ; đọc theo câu                                       | Nghĩa phù hợp câu đang xem ở đầu, nghe lại/lưu rõ ràng; chi tiết từ điển mở dần. Giữ câu đang học khi đóng drawer                         |
| [Language Reactor: export](https://www.languagereactor.com/help/export)                                                         | Phân biệt từ có ngữ cảnh, từ rời và phrase; lưu vị trí từ, subtitle index, video/timestamp; cloze có ngữ cảnh | Mỗi thẻ nối nhiều lần gặp; vị trí token phục hồi đúng cụm. Tách nguồn dịch người/AI. Chưa thêm Anki export vào MVP                        |
| [eJOY: Word Hunt](https://ejoy-english.com/en/help/wordhunt-feature-on-ejoy-go-and-ejoy-extension)                              | Tìm từ/cụm trong các đoạn video để xem cách dùng                                                              | Bắt đầu bằng các câu trong transcript hiện có, rồi nguồn đã lưu. Không cần crawl kho video hoặc dựng search toàn cầu                      |
| [Migaku: features](https://migaku.com/faq/features)                                                                             | Tra cứu theo ngữ cảnh, tạo thẻ tại chỗ, nhiều cách hiện/ẩn phụ đề                                             | Cho phép chỉ EN/EN–VI/ẩn rồi hiện theo câu; một thẻ tập trung một mục tiêu. Giữ iframe + timestamp, không lấy audio/screenshot từ YouTube |
| [LingQ: hướng dẫn sử dụng](https://www.lingq.com/how-to-use-lingq/)                                                             | Nội dung theo sở thích, từ đã lưu nổi bật khi gặp lại, tự điều chỉnh trạng thái, ôn SRS                       | Underline lần gặp đã lưu, xem lại nhiều bối cảnh. “Tự đánh dấu đã biết” tách khỏi kết quả nhớ sau khoảng cách                             |
| [Lingopie: tính năng](https://lingopie.com/blog/best-features-on-lingopie/)                                                     | Ôn thẻ có thể phát lại cảnh gốc; loop câu, script bên cạnh video                                              | Ôn → mở đúng câu gốc là hợp đồng bắt buộc. Tra từ không tự động lưu; xem đáp án/nghe lại phải ghi nhận hỗ trợ                             |

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

| Mã      | Kịch bản bắt buộc                                                                                                | Bằng chứng cần                                                                                        |
| ------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| UX-1    | Home trên desktop/mobile chỉ có một vùng cuộn dọc; feed/sidebar đi cùng trang; không tràn ngang                  | Browser ở 1440×900, 1024×768, 390×844, thêm bàn phím/zoom 200%; kiểm tra cả trạng thái nhiều nội dung |
| UX-2    | Theater dùng một transcript scroller trong viewport, document không tạo thanh thứ hai; read dùng document scroll | Cuộn bằng wheel/touch/keyboard và kiểm tra chữ phóng to, drawer mở                                    |
| UX-3    | Click từ mở lookup không seek; click timestamp seek không mở lookup; lưu câu không mở từ                         | Test tương tác riêng + keyboard; không có button lồng nhau; nhãn điều khiển rõ                        |
| UX-4    | Đọc thủ công không bị kéo về câu active; “Theo câu đang phát” bật lại follow; đóng drawer trả focus              | Browser với video đang phát và lookup AI chậm/lỗi                                                     |
| DATA-1  | Cùng lần gặp lưu hai lần chỉ một context; cùng từ gặp ở hai câu có hai contexts, một thẻ                         | Unit/integration + unique constraint; network retry/double-click                                      |
| DATA-2  | Dịch thiếu/trùng/đảo ID bị từ chối; AI lỗi không làm mất EN/câu gốc                                              | Schema + cache-version + fixture lỗi/timeout; ghi nhãn nguồn                                          |
| DATA-3  | Người B không đọc/sửa thẻ, context hay attempt của A                                                             | Integration RLS với hai người dùng; không suy từ test UI guest                                        |
| DATA-4  | Một attempt chỉ đổi FSRS một lần; refresh/submit song song không lặp; rollback không xoá bằng chứng              | Transaction/concurrency tests; lưu card version và log lịch trước/sau                                 |
| LEARN-1 | Thẻ mở đúng video/timestamp/transcript version; thiếu nguồn có trạng thái rõ                                     | E2E save → library → nguồn → review; nội dung thực và caption fallback                                |
| LEARN-2 | Chép nghe ≥90% không gợi ý → Good; có gợi ý tối đa Hard; không tự Easy                                           | Tests theo SPEC §7; no-hint và supported attempts báo riêng                                           |

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

| Engine/source                                                                                                          | Evidence / tradeoff                                                                                                                                                                                                                                                                                                                 | Decision                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api)                                           | Device processing, Vietnamese supported, desktop availability check plus user activation/model download; no cross-cue context parameter. Real app experiment found four meaning failures.                                                                                                                                           | Explicit quick-translation option with limitations; not the chosen quality engine. No key/paid fallback.                                                                                                                                                                                                                                                                                                                            |
| [Google Cloud Translation](https://cloud.google.com/products/translate/pricing?hl=en)                                  | Official NMT offers a monthly 500,000-character credit; beyond it is billed. Translation LLM has separate metering. The free web interface does not grant an official unlimited free application API.                                                                                                                               | Useful quality baseline; don't silently add billing or depend on reverse-engineered web endpoints.                                                                                                                                                                                                                                                                                                                                  |
| [Gemini free tier](https://ai.google.dev/gemini-api/docs/pricing)                                                      | Existing app model 2.5 Flash has free input/output with limits; project billing tier must be verified. Context and structured output can help but do not prove meaning accuracy.                                                                                                                                                    | Optional configured engine. `SUBTITLE_GEMINI_ENABLED=true` required in addition to the server key; disabled by default. No key in browser. No real API quality claim yet.                                                                                                                                                                                                                                                           |
| [Hy-MT2](https://github.com/Tencent-Hunyuan/Hy-MT2), commit `ff1903ecaa724e10951a23c16817a2413c752b35`                 | Read README, Apache-2.0 LICENSE, inference instructions and IFMTBench rule/scoring/judge code. [1.8B model](https://huggingface.co/tencent/Hy-MT2-1.8B) supports VI, contextual instructions and quantized deployment. IFMTBench dataset separately CC-BY-4.0; deterministic format gates differ from model/human semantic scoring. | Local CPU Q4_K_M run completed on 07/10: 6 baseline + 30 contextual self-authored cases; see the update below. Optional experimental adapter integrated, disabled by default; semantic release gate not passed. No per-call provider fee, but RAM/hosting and quantization accuracy matter. Current host has about 2.5 GiB available RAM and no existing llama/ollama runtime; avoid starting a memory-heavy model during app work. |
| [VinAI Translate](https://github.com/VinAIResearch/VinAI_Translate), commit `54984179493cf94e71ba46c53b5984ced93007a7` | Read README inference examples and AGPL-3.0 license. Specialized en2vi-v2, 448M, max length 1024; true batch arrays and beam search.                                                                                                                                                                                                | Vietnamese-specific comparator; handle licensing and token limit before incorporation. No source/weights copied into product.                                                                                                                                                                                                                                                                                                       |
| [Argos Translate](https://github.com/argosopentech/argos-translate), commit `17ed1a9b055c5ba1b51d76b683bbb0c64e2a4a88` | Read MIT license and `argostranslate/translate.py`: CTranslate2, paragraph-level caching and composite/pivot translation. [LibreTranslate](https://docs.libretranslate.com/guides/supported_languages/) lists en→vi.                                                                                                                | Free/offline comparator, not assumed highest Vietnamese quality; package/model licenses and operational cost still need checking.                                                                                                                                                                                                                                                                                                   |
| [MADLAD-400](https://huggingface.co/google/madlad400-3b-mt)                                                            | Apache-2.0 model card, target-language token, CPU/GPU usage; 3B larger resource footprint.                                                                                                                                                                                                                                          | Additional permissive comparator if resources permit; not run.                                                                                                                                                                                                                                                                                                                                                                      |

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

| Repo (licence)                                                                      | File đã đọc                                                                                                                                     | Kỹ thuật                                                                                                                                                                                                                                                                    | Áp dụng                                                                                       |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| mengxi-ream/read-frog (GPL-3.0 → chỉ ý tưởng)                                       | `entrypoints/background/subtitles-translation.ts`, `utils/prompts/subtitles.ts`, `utils/subtitles/processor/translator.ts`                      | Cache theo hash từng dòng (text + provider + prompt + ngữ cảnh); prompt mang **tiêu đề, mô tả, tóm tắt video**; glossary nối sau khi thay token; mặc định Microsoft (MT thuần), AI là tuỳ chọn "content-aware"; hàng đợi batch ≤5 cue; lỗi hosted báo một toast cho cả lượt | Đưa tiêu đề video vào ngữ cảnh; cache key gồm mọi input ảnh hưởng kết quả (đã có fingerprint) |
| umlx5h/LLPlayer (GPL-3.0 → ý tưởng)                                                 | `Translation/SubtitlesTranslator.cs`, `TranslateChatConfig.cs`                                                                                  | **Cửa sổ dịch quanh câu đang phát: 1 lùi / 12 tới**; tua xa hơn cửa sổ thì huỷ request; debounce 300 ms khi nhảy câu; chế độ KeepContext gửi **6 dòng trước kèm bản dịch của chúng** để giữ nhất quán                                                                       | Giới hạn dịch theo cửa sổ thay vì cả video; gửi bản dịch câu trước làm ngữ cảnh               |
| Nitrino/easysubs (MIT)                                                              | `googleTranslateBatchFetcher.ts`, `SubFullTranslation.tsx`, `PhrasalVerbTranslation.tsx`                                                        | Dịch cả dòng **theo yêu cầu** (popover + spinner), từ/phrasal verb có popover riêng + nút thêm vào bộ học; scrape endpoint batchexecute không chính thức                                                                                                                    | Lấy UX "bấm mới hiện"; **loại** scrape không chính thức                                       |
| zeeguu/api + web (MIT / chưa rõ)                                                    | `endpoints/translation.py`, `translation_services/translator.py`, `llm_services/prompts/translation_validator.py`, `mwe_translation_service.py` | Tra từ = tạo bookmark kèm ngữ cảnh; ưu tiên **bản dịch cũ của chính người học**; voter nhiều nguồn + cờ disagreement; LLM kiểm tra bản dịch cho người học: ngắn, không "/", thành ngữ kèm nghĩa đen, CEFR, loại bỏ mảnh vô nghĩa; MWE tách rời                              | Slice 3 (lưu) dùng mô hình bookmark-from-lookup; tiêu chí bản dịch ngắn cho bài luyện         |
| Talljack/echo-type (MIT)                                                            | `api/translate/free/route.ts`, spec inline-practice-translation                                                                                 | Bản dịch nằm **ngay dưới câu gốc** trong mọi chế độ luyện; không để bản dịch lệch câu; dùng gtx không chính thức                                                                                                                                                            | Giữ cặp câu EN/VI liền nhau; **loại** gtx                                                     |
| lexweave-hq/lexweave (Apache-2.0)                                                   | `packages/compile/src/translate.ts`, README                                                                                                     | Compile once/render many; **brief cấp tài liệu** (tóm tắt, nhân vật, glossary) chèn vào mọi batch; checkpoint theo fingerprint; thang hỗ trợ A1→A4                                                                                                                          | Ngữ cảnh cấp video; dịch một lần, cache dùng chung                                            |
| google/bespoke, adrianvla/mLearn, HugoFara/learning-with-texts, pretzelai/openlingo | tên file dịch/translation cache/bulk translate                                                                                                  | Dịch từ trực tiếp trên phụ đề, cache bản dịch, dịch hàng loạt từ chưa biết                                                                                                                                                                                                  | Tra từ là đường hiểu chính                                                                    |

Sản phẩm (đã ghi ở trên + TRANCY-DEEP-DIVE): Trancy dịch phía client bằng Google free, LLM chỉ cho premium/tra cứu, không dùng LLM dịch hàng loạt; eJOY hiện track VI có sẵn + Google/Microsoft, AI là Pro có quota; Language Reactor ưu tiên phụ đề người dịch, MT giới hạn ~5 giờ/ngày.

**Kết luận thiết kế (hướng học):** (1) nguồn: phụ đề VI do người dịch trên YouTube → cache → máy dịch, luôn ghi rõ nguồn; (2) tiếng Anh đứng trước, tiếng Việt bấm mới hiện từng câu; (3) chỉ dịch cửa sổ quanh câu đang phát, huỷ khi tua xa; (4) ngữ cảnh = tiêu đề video + câu lân cận + bản dịch câu trước; (5) không dùng endpoint không chính thức (gtx/batchexecute/`tlang`) từ server.

### Context-budget stress test and automatic player — 07/10/2026

**Additional primary research:** [Hy-MT2](https://github.com/Tencent-Hunyuan/Hy-MT2) documents background/source separation and terminology constraints; its [IFMTBench](https://github.com/Tencent-Hunyuan/Hy-MT2/tree/main/IFMTBench) separates structural rule gates from semantic/style judgment. [Subtitle Edit advanced translation](https://github.com/SubtitleEdit/subtitleedit/blob/main/docs/features/auto-translate-advanced.md) illustrates surrounding context, synopsis, glossary and structured output. [TranslateGemma 4B](https://huggingface.co/google/translategemma-4b-it) needs its own language-coded chat template, has a 2K text input limit and gated license acceptance; not run or incorporated. [WMT26 video subtitle translation](https://www2.statmt.org/wmt26/video-subtitle-translation.html) highlights timing, brevity and register; its language tracks are not an EN→VI validation. No upstream implementation copied or model license accepted.

**Actual additional experiment:** froze eight authored ambiguous windows with an oversized irrelevant earlier cue, plus the owner's relented sentence crop, then ran baseline/candidate packing through the pinned Hy-MT2 Q4 / llama-b11457 p1 production adapter: 18 actual outputs, no provider mock. Source-first, nearest-before/nearest-after packing preserved following context previously dropped by the character budget. Codex reading found five critical meaning failures before and three after: pet duck and billing charge improved; river bank and both bat meanings remained wrong. Both retained “relented” as nhượng bộ. This is a negative release result, not proof of best Vietnamese quality. It predates the concurrent v4 title/known-VI changes; does not evaluate those changes or independently validate the existing 30-case result. More context and prompt-cache effects confound timings, so no speed ranking. All raw inputs/outputs and criteria remain in `/home/thunder/Documents/Codex/2026-10-06/p/outputs/translation-evaluation.json`, `contextBudgetStudy`; reviewer is Codex, not an independent blinded human. Local adapter still disabled by default; p1 still ignores title/known-VI — separate unfinished quality work.

**Fresh live reference:** reopened authenticated [Trancy practice](https://learn.trancy.org/practice/oyRxhiAC9u8). After loading, 395 cue rows, EN+VI, remembered 0:45 and underlined expressions appeared without requesting subtitles/translation; inspected paused state, no settings/saved-word changes. Some spoken disfluencies were rendered literally. UI demonstrates automatic presentation, not private acquisition/provider/cache architecture or semantic correctness.

**Applied:** latest owner instruction makes existing player intake/translation automatic (see TASK_CONTRACT). Chrome availability/first-download behavior follows its [official Translator API](https://developer.chrome.com/docs/ai/translator-api): downloadable models need activation; existing available models attempt automatic setup and gracefully wait for a gesture if create returns NotAllowedError. Ordinary page/play interaction provides that activation; no dedicated primary translation button. Unsupported browsers retain source/manual VI and dictionary glosses. Guest server translation still requires auth; no new cloud billing/flags. Curated automatic word meanings are synchronous and source-labelled, limited to the active cue, not contextual AI or learning evidence. Actual upstream captions can still be unavailable or blocked; no fabricated fallback text. Fixture UI checks cannot establish real acquisition or model quality.

Cache correction in the automatic increment: fingerprint now includes bounded video title and source Vietnamese anchors, and hides the previous result immediately on title changes. This prevents reuse across context changes; does not change the model prompt/version or establish semantic accuracy. Regression tests cover both hash invalidation and the asynchronous replacement window.

### Vertex (JS Mastery) — "search → nhảy đúng giây" — 07/10/2026

Nguồn: video `8DfvwZ812dM` (2h44) không fetch được transcript do IP throttle; đọc trực tiếp repo `jsmastery-pro/vertex-learning-platform` (clone depth 1, code không build/chạy). Đây là learning platform: gõ câu tiếng Anh thường → kết quả là card bài học link tới đúng giây trong video, phát ngay trên site.

**Pipeline video (offline, không nằm trong request path):**

- `studio/scripts/ingest/providers/youtube.mjs`: `youtubei/v1/player` với **iOS client context** (`com.google.ios.youtube` UA) trả caption track phục vụ được; baseUrl từ web client trả 200 nhưng body rỗng. Verify trên máy này: player OK + có track, nhưng timedtext vẫn 429 — trick sửa empty-body, **không** vượt IP block.
- Chapters đọc từ `ytInitialData` trong HTML trang watch (`chapterRenderer`/`macroMarkersListItemRenderer`), dedupe theo `startSeconds`.
- `chunk.mjs`: cues → chunks tới khi đạt 45s hoặc 350 ký tự, **không cắt giữa cue** → mọi `startSeconds` là điểm seek thật. Khác mình: mình segment theo câu (mịn hơn, cho học), Vertex chunk theo cửa sổ (cho search index).
- Fetch fail → không cache, retry lần sau; throttle 1.2s; pick track en+2/manual+1 (cùng chính sách của mình).

**Timestamp resolution 2 tầng (rule đáng học nhất):** match `chapters[].label` trước; chỉ fallback `chunks[].text` khi không chapter nào khớp. Chapter label sạch, transcript là backstop nhiễu hơn.

**Search = LLM viết query + server grounding, không phải chatbox:**

- Sanity Context MCP expose `groq_query`; GPT-5 (`reasoningEffort:"low"`, `stopWhen: stepCountIs(6)`) viết GROQ — `app/api/search/route.ts`.
- Model chỉ trả `{lessonId, kind, reason, rank, startSeconds?, momentLabel?}` — cấm trả title/duration/thumbnail/count.
- `lib/search/ground.ts` đọc lại toàn bộ dữ liệu hiển thị từ dataset → hallucination không lọt vào UI; hit trỏ lesson không tồn tại bị drop. Sort trong code (deterministic, không tốn LLM call).
- Hai GROQ call bắt buộc: lesson-topic + video-moment, merge. Trick: `match` nhiều pattern là AND → OR bằng `count([...][field match @]) > 0`; wildcard mọi keyword; không project nguyên mảng chunks vào context.
- `?t=` deep-link → embed `youtube-nocookie.com/embed/{id}?start=N` (mình dùng `YT.Player.seekTo` — cùng triết lý, không tự build player).

**Workflow AI-agent (mục tiêu thật của video):** AGENTS.md constitution + skills theo tool + implementation prompt trong `prompts/` → owner duyệt → code → PR + CodeRabbit security review. Gần trùng mô hình mission contract/LEDGER đang dùng.

**Áp dụng được cho AtoEnglish:** (1) nếu làm search xuyên video → chapters-first-then-transcript + link `?t=`/`startSeconds` tới watch page (transcript-rail search đã có nền); (2) grounding pattern khi thêm LLM feature — model chỉ trả ID+timestamp, server rebuild display; (3) `shared_transcripts` đúng cùng pattern "ingest offline, serve many" của họ; (4) iOS-context là tuyến fetch bổ sung cho empty-body — nhưng không cứu được IP block.

### Nghiên cứu nền cho 3 gói Từ điển / Tra cứu / Lưu trữ — 09/10/2026

Bối cảnh: trước khi chốt quyết định A (nguồn từ điển) và thiết kế schema lưu trữ, cần khảo sát nguồn dữ liệu EN→VI, nghĩa vụ giấy phép, phương án serve trên Cloudflare/Neon, và UX tra từ của các đối thủ. Phần này ghi lại kết quả; chưa ingest dữ liệu nào.

#### A. Nguồn từ điển EN→VI

| Nguồn | Quy mô | Format | Giấy phép | Độ tươi | Ghi chú |
|---|---|---|---|---|---|
| FVDP (Anh–Việt) [S][F] | ~110.000 mục [S] | DICT/dict.org text (`@word`, `*POS`, `-gloss`, `=example`, `!idiom`) | GPL v2+ [F] | ~2004–2013, không còn cập nhật | Parse được nhưng schema text thô; dữ liệu cũ |
| Kaikki viwiktionary "Tiếng Anh" [F] | **119.206 headwords / 190.804 senses** | JSONL structured (`pos`, `senses[].glosses` tiếng Việt, `sounds[].ipa`, `forms`, `related`) | CC BY-SA 4.0 + GFDL [F] | Extract 03/10/2026 từ dump 01/09/2026, cập nhật theo tuần | Đã verify mẫu `cat`: 6 noun senses + verb senses có gloss VI, IPA `/kæt/` UK/US, forms `cats`, idioms kèm nghĩa |
| FreeDict eng-vie [S] | nhỏ (hàng chục nghìn) | TEI XML | GPL (từng dict riêng) | chậm | Format sạch nhưng coverage mỏng |
| OVDP [S] | tương tự FVDP | tương tự | GPL | cũ | Cùng gia đình FVDP |
| ECDICT [F] | EN→ZH | CSV/SQLite | — | — | Không phù hợp chiều ngôn ngữ |

**Nghĩa vụ giấy phép** [S+F]:

- **CC BY-SA 4.0 (Kaikki/Wiktionary)**: attribution (ghi nguồn + link license) + share-alike chỉ áp lên **dữ liệu phái sinh** (bảng từ điển đã lọc phải được phát hành lại dưới cùng license). Code app **không** trở thành derivative — consensus thực hành: schema DB và app code tự do license. Việc cần làm: nhãn "Nguồn: Wiktionary (CC BY-SA)" trong dictionary panel/trang about + giữ file LICENSE cho dataset phái sinh.
- **GPL (FVDP)**: bundle data vào repo/artifact = distribution → phải kèm license + offer source của chính data. Ranh giới "derivative" cho data dưới GPL mờ hơn BY-SA; thêm nữa dữ liệu 20 năm tuổi.

**Đề xuất [R]:** Kaikki viwiktionary English slice làm tier-1 dictionary. Lý do: (1) coverage ~119k headwords > FVDP và tươi hơn 20 năm; (2) đã structured sẵn — bỏ qua parsing DICT; (3) license rõ hơn, nghĩa vụ thực tế nhẹ (attribution + share-alike trên data). FVDP chỉ còn làm fallback nếu mẫu 100 từ của Kaikki kém chất lượng — cần A1 eval trước khi cam kết.

**Ngạch phụ [S]:** NGSL/Cambridge wordlists (CC BY-SA) có thể xếp tầng "từ phổ biến/trình độ" lên trên dictionary content — dùng cho sắp xếp senses và highlighting sau này, không phải nguồn nghĩa.

#### B. Serve ~120k mục trên Cloudflare/Neon

| Phương án | Latency | Độ phức tạp | Nhận xét |
|---|---|---|---|
| **Neon `dictionary_entries`** (headword + normalized key index, `senses jsonb`, `ipa`, `forms jsonb`) | ~30–80ms/query | thấp — infra có sẵn | 120k rows ~ vài chục MB — tầm thường cho Postgres; B-tree exact-match, thêm prefix index nếu cần gợi ý cụm; migration replay qua Verify workflow sẵn có |
| KV key-per-word | rất nhanh khi hit | trung bình | Thêm infra, invalidate khó, attribution metadata phân tán; chỉ đáng nếu DB latency thật sự đau |
| R2 packed blob + index | fetch cả file lạnh | cao | Over-engineering ở quy mô này |
| Bundle vào Worker | 0 | — | 109MB JSONL → vượt giới hạn; loại |

**Đề xuất [R]:** Neon table là đủ; thêm LRU in-process trong `gloss.ts` sau nếu cần. Giữ `GlossEntry` contract — chỉ đổi backing store từ `VOCABULARY_ENTRIES` Map sang query DB (sync → async, phải chạm `lookupGloss` signature và callers).

#### C. UX tra từ — so sánh đối thủ

- **Trancy 7.9 [S]**: hover-to-lookup trên bilingual subtitles; click mở AI explanation/definitions. Popup [F, từ TRANCY-DEEP-DIVE]: headword + phonetic + TTS + POS + gloss + context + save/known + external dict links + "câu khác chứa từ này".
- **Language Reactor [S]**: click-to-define (không hover), popup có audio + example sentences; mạnh ở dual-subtitle + replay controls.
- **Migaku [S]**: click hoặc hover+Shift; **one-click sentence mining** (flashcard + screenshot + audio clip tự động); **word knowledge tracking** tô màu known/unknown trên subtitle → đây là chuẩn cho highlighting feature của mình.
- **eJOY [S]**: click mở dictionary popup.

Điểm hội tụ [I]: mọi sản phẩm đều (a) click/hover trên token subtitle, (b) popup ngắn với audio, (c) một nút save tạo card kèm ngữ cảnh, (d) tô sáng trạng thái từ. AtoEnglish đã có (a)+(b) phần nào; thiếu (c) một-chạm-kèm-context và (d).

**Highlighting [F]:** CSS Custom Highlight API đạt **Baseline 2025** — Chrome 105+, Safari 17.2+, Firefox 149+ (03/2026). Lựa chọn của SPEC §9 hợp lệ; vẫn cần fallback span-wrap cho browser cũ hơn baseline.

#### D. FSRS & mô hình context-linked

- `src/lib/srs/fsrs.ts` đang `enable_fuzz: false` — SPEC §4.1 yêu cầu fuzz để rải giờ ôn; đổi ở slice 4, nhưng phải giữ `enable_fuzz: false` trong test path (seedability).
- Schema `study_cards` + `card_contexts` (SPEC §11) đúng pattern bookmark-to-context của Zeeguu/Migaku sentence mining [S]: 1 card — N contexts — mỗi context trỏ sentence+video+timestamp. Không cần đổi thiết kế.
- ts-fsrs đã integrate; production notes: giữ `request_retention` configurable, log `stability`/`difficulty` cho learner evidence sau này.

#### E. Seam tích hợp hiện có [F]

- `src/lib/vocab/lemma.ts` `lemmaKey` — conservative deinflection sẵn có → dùng làm normalized key cho `dictionary_entries` và `study_cards.normalized_key` (đúng SPEC normalization rule "word → lemma").
- `src/lib/read/gloss.ts` — Map sync trên `VOCABULARY_ENTRIES`; chuyển sang DB là async — cần survey callers (`/api/dictionary`, read surface) trước khi đổi signature.
- `src/app/api/dictionary/route.ts` — `mode: curated|ai` đã tách tier; chỉ cần thay data source tier-1.
- Tests cần fixture dictionary nhỏ — không được phụ thuộc toàn bộ 120k rows vào unit tests (seed subset hoặc mock layer).

#### Quyết định chờ owner (cập nhật)

1. **A — nguồn từ điển**: đề xuất Kaikki (CC BY-SA). Cần owner duyệt trước khi viết pipeline ingest. Việc đầu tiên sau duyệt: tải JSONL, lọc `lang_code=en`, chấm 100 từ phổ biến + 30 thuật ngữ → báo cáo chất lượng → mới commit data/schema.
2. **E — PR #234** (spec v2 cũ, đã superseded): đề xuất đóng kèm comment trỏ về mission 005.
3. Fuzz flag FSRS: không phải quyết định — đã trong spec, chỉ ghi lại ở đây để khỏi quên.

### Vòng 2 — deep-check Kaikki + mô hình context + seam code — 09/10/2026

#### Kaikki verify trên mẫu thật [F]

Đã mở trực tiếp các trang JSON của viwiktionary "Tiếng Anh":

- `cat`: 6 noun senses + 2 verb homonym entries, IPA `/kæt/`, audio ogg+mp3, forms `cats`, `related` idioms có nghĩa VI ("fat cat" → "Tư bản kếch xù…").
- `cache`: 3 noun senses + verb, **examples kèm dịch** (`"to make a cache"` → `"xây dựng nơi trữ"` qua `senses[].examples[].text/translation`), `form` backlinks (`caching → cache`).
- `serendipity`: gloss tốt + `sounds[].mp3_url` — **audio phát âm lấy sẵn từ Wikimedia Commons**, không cần TTS-only.
- `better`: senses `form_of: good/well` — **irregular inflection tự giải quyết bằng data** ("better" là headword riêng, trỏ về lemma); bù đắp `lemma.ts` chỉ xử lý suffix thường quy.
- `give up`: **404** — vi.wiktionary không có entry; POS "Phrase" toàn bộ chỉ ~110 senses → **cụm động từ/multi-word là gap thật** của nguồn này. Bù bằng: (a) `related` trên headword mang một phần idioms; (b) tier-2 AI lookup (spec đã bắt buộc); (c) curated list cho phrasal verbs phổ biến.
- Data hygiene: một số gloss/related còn wikitext remnant (`"Xem half\n*#: ..."`) → pipeline ingest cần bước clean: strip `*#:`/template residue, bỏ senses không gloss VI.

#### NGSL overlay [S→F]

NGSL 1.2 (2.809 từ, ~92% coverage văn bản thường ngày) + variant "with basic statistics" có frequency rank — **CC BY-SA 4.0, cho phép commercial**. Dùng làm overlay `frequency_rank` trên `dictionary_entries`: sắp xếp senses, highlight "từ đáng học", sau này ước lượng độ khó video (Zeeguu dùng cùng pattern RankedWord/KnownWordProbability [S]).

#### Zeeguu — mô hình context-linked [S, github.com/zeeguu/api CONTEXT_ARCHITECTURE.md]

- 2 tầng: `BookmarkContext` generic (text + language + sentence_i + token_i) + mapping table theo loại nguồn (article fragment / video title / video caption / example sentence). Spec của mình gộp thành một `card_contexts` (sentence + video + timestamp + token range) — hợp lệ vì hiện chỉ một loại nguồn; nếu sau này thêm nguồn (article, AI example) thì tách mapping table đúng pattern Zeeguu.
- **"Train meanings, not words"**: Zeeguu key theo (word × translation) — một từ đa nghĩa có thể thành nhiều meaning. Spec mình key `study_cards` theo `normalized_key` (một card/từ). Giữ spec cho MVP; ghi nhận per-meaning là hướng tinh chỉnh nếu evidence cho thấy nhầm nghĩa là vấn đề.
- **Log mọi lookup, không chỉ save**: Zeeguu dùng lookup history để model learner knowledge ("từ nào tra đi tra lại"). Ý tưởng rẻ: `lookup_events` hoặc fold vào `practice_attempts` sau — chưa làm, ghi nhận.

#### Seam trong repo [F]

- Legacy `cards` table (migration 20240618) đã được extend FSRS (`stability`, `difficulty`, `elapsed_days`, `next_review`, `state`, `lapses`, `learning_steps`) qua `20260902130000_learning_core_foundation` → quyết định "migrate legacy cards → study_cards" có nghĩa thật: phải preserve FSRS state nếu migrate.
- `lookupGloss` chỉ 3 caller: `api/dictionary/route.ts` (server) + `dictionary-panel.tsx` ×2 (client, sync). Panel import Map trực tiếp → vocabulary đang ship vào client bundle; chuyển sang 120k entries bắt buộc panel gọi `/api/dictionary` — API route đã tồn tại, chỉ thay backing store sync→async.
- `tokenize.ts`: word = `[A-Za-z]+(?:['’][A-Za-z]+)*` (giữ apostrophe tail), normalize = lowercase. Phrase selection đã bound `MAX_TERM_CHARS=120`, `MAX_CONTEXT_CHARS=1000` trong route.
- `gloss.test.ts` cover deinflection candidates ("teachers"→teacher, "swimming"→swim) — giữ làm regression khi đổi backing store.

#### Phát biểu lại đề xuất cuối [R]

1. `dictionary_entries` trên Neon, ingest từ Kaikki viwiktionary-en JSONL (lọc `lang_code=en`, clean gloss, giữ `pos/senses/examples/ipa/forms/form_of/related`), normalized key = `lemmaKey`. Attribution CC BY-SA trong dictionary panel + trang about.
2. `dictionary_form_index` (hoặc cột `form_of`) để surface→lemma bằng data, `lemma.ts` rules chỉ là fallback cho form không có trong dict.
3. NGSL overlay là việc riêng, rẻ, làm sau nếu owner muốn sense-ordering/frequency.
4. Phrase lookup: longest-match trong dict trước → curated phrasal list → AI. Không kỳ vọng dict cover phrasal verbs.

### Vòng 3 — Trancy từ nguồn chính thức + toàn cảnh đối thủ + nền khoa học — 09/10/2026

#### Trancy từ trancy.org [F — trang chủ/pricing/changelog/mobile]

**Feature surface đầy đủ** (trang chủ): bilingual subs YouTube/Netflix/HBO/Disney+/TED/edX/Coursera/Udemy/Vimeo; 2 chế độ xem (theater + reading); AI word lookup, AI grammar analysis, AI sentence decomposition, AI POS tagging; NLP sentence segmentation; listening/speaking practice; webpage selection translation + full-text immersive translation (nhiều engine Google/DeepL/OpenAI tuỳ chọn); word collection + word highlight; external dictionary links; speed playback; font adjust; TTS; shortcuts; learning decks (watch-later, saved sentences); Learning Center.

**Free vs Premium [F]** — khung free/paid của họ:
- Free: bilingual subs, **unlimited word & sentence translation**, unlimited subtitle download, segmentation, Google engine, custom engines. Nhưng: **word bookmark 100, sentence bookmark 50**, PDF 50 trang/tháng, AI summary 10/ngày.
- Premium: AI transcription 40 video/ngày, unlimited collection, AI definitions, AI speaking coach + pronunciation eval.
- Premium+AI: 60 video/ngày, 20M token/tháng, chọn engine (GPT-5-mini, Claude 4.5 Haiku, Gemini 3.0 Flash…).
- → Định vị của AtoEnglish [R]: "unlimited save + không paywall" là khác biệt trực tiếp với cả Trancy (cap 100/50) lẫn LR (save chỉ ở Pro).

**Changelog — quỹ đạo tính năng [F]** (đáng học thứ tự ưu tiên của họ):
- v7.9.0: **hover-to-lookup** trên bilingual subs; word-by-word highlight.
- v7.9.4: Vimeo; **keyboard shortcuts A=prev line, S=replay, D=next, Q=auto-pause mỗi câu, R=loop một câu**; "build word list từ video đang xem + highlight saved words trong video"; word explanations chú ý sentence context hơn.
- Learning Center 2.0 (v7.8.6): podcast+movies, 3 view modes, shadowing + pronunciation assessment, channel subscriptions, wordbook batch delete/**export**, immersive review page.
- Mobile app: sync YouTube subscriptions, shadowing, AI summaries, reading mode, **phát APK trực tiếp** ngoài Play Store — validate hướng shell APK của mình.
- Mở rộng sau: Trancy Reader (sách), Trancy Air (desktop hotkey). → Không cần vội; core loop video đủ mạnh.

#### Đối thủ — ma trận so sánh [S trừ khi ghi khác]

| Sản phẩm | Lookup | Save/Context | Ôn tập | Điểm riêng đáng học |
|---|---|---|---|---|
| **Language Reactor** [F help docs] | click-to-define (không hover) | word/phrase; **saved item left-click=audio, right-click=nhảy về đúng giây**; icon màu phân biệt word/phrase | PhrasePump — nghe câu chứa từ sắp ôn; flashcards; **Anki .apkg + CSV export** (lemma, POS, context, videoID, subtitle index) | **Right-click = mark nhanh không popup**; "save một lần, nhận diện mọi form" (lemmatized) |
| **Migaku** [S] | click hoặc hover+Shift | **one-click sentence mining**: card kèm screenshot + audio clip | Migaku Memory SRS | Word knowledge tracking tô màu known/unknown → difficulty-at-a-glance |
| **eJOY** [F help/feature pages] | hover → nghĩa VI nhanh; click → full dict; **phím `[<]`/`[`>`]` duyệt từ trong câu** | WordBank + wordbooks theo chủ đề; word states New→Learning→Mastered | **10+ games**: flashcard, multiple choice, rearrangement, fill-blank, speak, listening | Per-word **Difficulty + Fluency metrics**; IPA trên sub; sản phẩm VN — gần audience nhất |
| **Lingopie** [S] | click word | vocab + sidebar script/vocab | quizzes, Grammar Coach | Catalog-first (own content + Netflix); level setting đổi speed default |
| **FluentU** [S] | click word | clips + interactive subs | flashcards + SRS + quizzes | Structured lessons; beginner-friendly |
| **FunFluen** [S] | hover | save + scene loop | — | Video→speaking practice loop |

**Mẫu hình hội tụ** [I — tổng hợp]:
1. Tra từ: hover = glance nhanh / click = chi tiết (Trancy, eJOY); right-click/hotkey = mark không gián đoạn (LR).
2. Save kèm context (câu + timestamp) là chuẩn công nghiệp; LR/export thêm lemma + POS + video ref — schema `card_contexts` của spec đủ chứa.
3. Ôn tập tốt nhất dùng **câu trong ngữ cảnh từ chính content học viên đã xem** (LR PhrasePump, Migaku mining, Zeeguu examples) — không phải câu ví dụ generic.
4. AI là tầng bổ sung có giá; từ điển + sub song ngữ là tầng miễn phí nền tảng.

#### Nền khoa học [S — literature]

- Spaced practice meta-analysis (Kim 2022, 48 experiments): hiệu ứng **medium-to-large** cho L2; expanding vs equal spacing tương đương → FSRS (expanding, adaptive) là lựa chọn đúng chuẩn.
- Retrieval practice + extensive input **cộng hưởng**: nhóm kết hợp reading+cards+quiz (ERQG) vượt trội các nhóm đơn lẻ → validate cả loop video→save→practice của spec.
- AllAI (BEA 2024): SRS **dạng câu** — ghép các từ đến hạn thành câu — tốc độ học từ **×4** so với flashcard từ đơn + enjoyment cao hơn → củng cố "ví dụ từ video" (B3) và practice-dạng-câu thay vì từ lẻ.
- Nation: hiểu ~98% từ vựng mới theo được văn bản; NGSL 2.809 từ ~92% coverage → overlay frequency có căn cứ định lượng.

#### Suy ra cho roadmap [R — không thay spec, chỉ sắp xếp]

1. Trong package Lookup, keyboard nav theo câu (A/S/D/Q/R của Trancy, `[<]`/`[>]` của eJOY) là chi phí thấp, giá trị cao trên desktop — candidate cho §4.5 khi owner duyệt.
2. "Saved-item → nhảy về đúng giây" (LR right-click) chính là deep-link `?t=` đã spec — C3 đủ cover.
3. Export (CSV/Anki) là tính năng LR/eJOY có mà spec mình chưa ghi — candidate §4.5, giá rẻ (select + serialize card_contexts).
4. PhrasePump/AllAI cho thấy slice practice nên ưu tiên **câu chứa từ đến hạn** thay vì flashcard từ trần — đúng hướng practice modes của spec.
5. Không sao chép: gamification games của eJOY (ngoài scope gate), AI pronunciation scoring (đã loại), catalog (đã loại).

### Vòng 4 — kỹ thuật bổ sung: segmentation lib, sentence-mining OSS, deinflection, Chrome Translator, popup anatomy — 09/10/2026

#### Trancy AI Subtitles [F, trancy.org/ai-subtitle]

Trancy dùng **OpenAI Whisper** async (2–5 phút/video) để re-transcribe YouTube, claim segmentation tốt hơn 80% — **premium-only (40–60 video/ngày)**. Tức bài toán ASR-run-on của mình là bài toán họ trả tiền để giải; heuristic v3 của ta (capital-boundary + pause) là giải pháp free-tier tương đương vai trò. Nếu sau này chất lượng v3 không đủ, Whisper-qua-pipeline là upgrade path đã được họ chứng minh nhu cầu.

#### eJOY popup anatomy [F, help center]

Popup tra từ của eJOY: tabs **VI translation | English definition | slang | examples | collocations | synonyms/antonyms | word family**; nút AI Translation + AI Explain + "Other Dictionaries" (Oxford/Cambridge); **Alt+click gom cụm từ**; **edit nghĩa trước khi lưu** (khớp spec §7); popup modes immediate/icon/none; toggle "show definition in English". → Anatomy chuẩn cho DictionaryPanel của mình: VI trước, EN definition là tab phụ, examples có dịch, external dict links.

#### Sentence-mining open-source [S]

- **mpvacious/subs2srs** (mpv→Anki): card = sentence text + secondary (translation) + audio clip + screenshot; `audio_padding` ~0.12s; tag `%n %t` (video name + timestamp). Ta thay media clip bằng `?t=` deep-link — nhẹ hơn, không host media.
- **Voracious**: search word/phrase xuyên toàn bộ subtitle library (= B3 "ví dụ từ video" ở quy mô catalog); viewing modes auto-pause/hide-reveal subs = shadowing-mode precedent; multi-track subs đồng thời.
- Pattern chung: subtitle timing ± padding → media slice → card. Timing interpolation của segmentation v3 đã cho mình start/end đủ chuẩn cho replay loop.

#### Yomitan deinflection [F, github docs]

Yomitan `LanguageTransformDescriptor`: `conditions` (POS/grammatical form) + `transforms` (suffix rules, chain được); glossary entry có thể mang `inflectionRuleChain` để hiển thị surface→lemma. Nguyên tắc giống hệt gloss.ts của mình: **"rules propose candidates, dictionary disposes"**. Hướng đúng cho mình [R]: rule nhẹ (`lemma.ts`) + `form_of`/`forms` từ Kaikki làm authority — không cần port full transform-chain của Yomitan.

#### Chrome Translator API [F, chrome docs]

Translator + Language Detector API: **Chrome 138+ stable, desktop only** — **không có trên mobile**. `vi` nằm trong supported languages (en↔vi OK). Hàm ý [R]: trên desktop Chrome, VI line có thể dịch on-device miễn phí (đúng hướng spec đã ghi); trên Android shell/desktop khác phải qua server path (Google/Gemini) — spec đã dự phòng đúng.

#### winkNLP [S]

SBD + POS + lemmatization chạy in-browser (~4M token/s). SBD của họ vẫn dựa punctuation/capital — **không hơn heuristic v3 trên ASR không dấu**; nhưng POS tagger có thể nâng boundary quality sau này. Ghi nhận làm upgrade path, không đáng bundle weight bây giờ.

#### Vậy là đủ? — checklist phủ sóng [R]

| Mảng kiến thức | Trạng thái |
|---|---|
| Spec & kiến trúc nội bộ (005/006) | ✅ đọc đủ |
| Nguồn dict EN–VI + license + mẫu thật | ✅ Kaikki verified trên 4 từ, gap phrasal verb đã định lượng |
| Storage dict trên Neon/CF | ✅ quyết Neon + form_index |
| UX tra từ (Trancy/LR/Migaku/eJOY chính thức) | ✅ popup anatomy + interactions đủ |
| Save/context model | ✅ Zeeguu + mpvacious + spec §11 |
| FSRS/production | ✅ ts-fsrs có sẵn, fuzz flag ghi nhận |
| Sentence segmentation | ✅ v3 shipped + Whisper/winkNLP upgrade paths |
| Nền khoa học | ✅ spacing meta-analysis, sentence-SRS ×4, coverage 98%/92% |
| Mobile/extension boundary | ✅ mission 006/007 + Chrome API desktop-only |
| Còn mở (không blocking) | pg_trgm cho suggestion; VieWordNet synonym enrichment; lookup_events logging |

### Vòng 5 — indexing, speech API, LingQ state model, FSRS params — 09/10/2026

#### Postgres indexing cho `dictionary_entries` [F, PG docs]

- Exact/prefix headword → **B-tree + `text_pattern_ops`** trên cột normalized (`C` collation hoặc `lower()` index) — đủ cho 99% lookups (click word + phrase longest-match).
- `pg_trgm` GIN chỉ cần khi muốn typo-tolerance/"did you mean" — dư thừa cho MVP, ghi nhận.
- Schema phác: `normalized_key text` (B-tree), `headword text`, `pos`, `senses jsonb` (glosses+examples+tags), `ipa`, `audio_url`, `forms jsonb`/`form_of`, `related jsonb`, `source text` (attribution), `frequency_rank int null` (NGSL overlay sau).

#### Web Speech API cho shadowing [F, caniuse/MDN]

- `SpeechRecognition`: Chrome ✅ (mặc định **server-side** — audio gửi Google; on-device opt-in qua `available()`/`install()` + `on-device-speech-recognition` policy), Safari 14.1+ partial ✅, **Firefox ❌**.
- → Shadowing-recognition là tính năng **degrade-gracefully**: hiện trên Chrome/Safari, ẩn trên Firefox/Android WebView cũ. Và không bao giờ gọi là "pronunciation score" — chỉ transcript-match gợi ý (đúng spec).
- `speechSynthesis` (TTS) universal → nút nghe từ/câu an toàn; audio từ Kaikki `mp3_url` là lựa chọn chất lượng cao hơn khi có.

#### LingQ — mô hình trạng thái từ chuẩn công nghiệp [F, help docs + forum]

Blue = từ chưa gặp · **yellow gradient** = đã lưu, status 1 (đậm) → 2 → 3 (nhạt + gạch chấm) → 4 (chỉ gạch chân) · white = Known/Ignore. `K` = known, `X` = ignore; "paging moves to known" setting; % blue words hiện trước khi đọc = difficulty estimate.

→ Cho C4 [R]: highlight saved words theo **FSRS state gradient** thay vì binary — map `New→Learning→Review(early)→Review(mature)→Known-ish`. Không cần "Ignore" ở MVP nhưng để `status` trong schema cho phép sau này.

#### ts-fsrs — tham số vận hành thật [F, source]

Defaults: `request_retention 0.9`, `maximum_interval 36500`, `learning_steps ['1m','10m']`, `relearning_steps ['10m']`, `enable_short_term true`, **`enable_fuzz false`** (fuzz chỉ tác động interval ≥2.5 ngày — rải due pile). States: New/Learning/Review/Relearning.
→ Slice 4: bật `enable_fuzz` ở prod instance, giữ `false` trong tests; giữ defaults còn lại; `practice_attempts` lưu rating + state trước/sau + scheduled_days.

#### Export (ghi nhận cho §4.5 candidate) [S]

`.apkg` = zip chứa SQLite `collection.anki2` + media — genanki-php/python hoặc tự build. CSV (tab-separated) rẻ hơn nhiều và LR cũng export CSV trước — **CSV trước, .apkg sau nếu demand**. Fields tối thiểu học từ LR: word, lemma, POS, meaning, context EN, context VI, video id + timestamp, created_at.

#### Đánh giá kết thúc nghiên cứu [R]

5 vòng đã phủ: spec nội bộ, nguồn dữ liệu + license + mẫu thật, storage + indexing, UX tra từ của 4 đối thủ (nguồn chính thức), mô hình save/context (Zeeguu+mpvacious+LingQ), FSRS params, segmentation, Chrome APIs, nền khoa học. **Đủ để thiết kế A/B/C không đoán mò.** Việc tiếp theo thuộc về quyết định của owner, không phải thêm research.

### Vòng 6 — hệ sinh thái open-source GitHub + sản phẩm EN còn lại — 09/10/2026

#### Repo đáng học/tham khảo trực tiếp [F, GitHub]

| Repo | License | Học được gì |
|---|---|---|
| `LuanRT/YouTube.js` (youtubei.js, ~5k★) | MIT | Innertube client chuẩn: multi-client rotation, `getTranscript`, po_token/`serviceIntegrityDimensions`, signatureTimestamp — **reference implementation** cho caption chain của `captions.ts` (mình hand-roll mỏng hơn có chủ đích; đọc khi cần thêm client/param) |
| `killergerbah/asbplayer` (~1k★) | OSS | Kiến trúc subtitle-mining hoàn chỉnh: text-selectable subs overlay lên streaming video, nav list, **condensed playback** (skip đoạn không sub), auto-pause, word styling theo status sync từ Anki/local, frequency annotation, comprehension stats, word browser. Chrome-first; Firefox/Android thiếu nhiều |
| `LuteOrg/lute-v3` (~1.6k★) | MIT | LingQ-model độc lập xác nhận: **parent term** (lemma→children), **Sentences tab** liệt kê mọi context của term (= B3), multi-dict per language (embedded vs popup, `[LUTE]` substitution), status incl. Well Known |
| `Ajatt-Tools/mpvacious` | OSS | subs2srs pipeline: sub line → card + audio clip ±padding + screenshot + tag `%n %t` |
| `yomidevs/wiktionary-to-yomitan` (+ `kaikki-to-yomitan`) | OSS | **Pipeline chuyển Kaikki JSONL → dict format có sẵn** — reference code cho A1/A2 ingest (parse senses/glosses/examples); có nhánh vi-edition |
| `tatuylonen/wiktextract` | — | Extractor gốc; non-en editions (gồm vi) **có JSON schema** — field reference chính thức cho pipeline |
| `yomidevs/yomitan` | — | term_bank schema + deinflection transforms (đã ghi vòng 4) |

#### Sản phẩm bổ sung cho ma trận [S/F]

- **Relingo** [F, chrome store/site]: interest-based — tự động highlight từ theo **level tự chọn** + từ đã sưu tầm, lặp lại popup của từ đã lưu xuyên các trang, bilingual subs YT/Netflix/TED, wordbook, daily email refresh. Phổ biến trong cộng đồng self-study EN. Mẫu "graded-vocabulary highlighting" trùng ý tưởng NGSL overlay của mình.
- **Lingopie/FluentU** (vòng 3): catalog-first; FluentU thêm courses/quiz structure.
- Pattern mới nhận diện [I]: **frequency/level-based proactive highlighting** (Relingo, asbplayer frequency annotation, LingQ %blue-words) — tức là không chỉ highlight từ *đã lưu*, mà còn từ *đáng lưu*. NGSL rank trên `dictionary_entries` mở đường cho việc này sau C4.

#### Cơ chế kỹ thuật học được từ OSS [I→R]

1. **asbplayer condensed playback** (skip/fast-forward đoạn không sub): rẻ trên data có sẵn — biết gap giữa các câu → auto-skip im lặng. Candidate §4.5.
2. **Auto-pause mỗi câu** = Q của Trancy = auto-pause của asbplayer — convergence mạnh, nên nằm trong practice/watch keyboard pack.
3. **po_token** (proof-of-origin) là lớp chống bot mới của YouTube — youtubei.js xử lý qua `serviceIntegrityDimensions`; nếu timedtext bắt đầu đòi poToken, đây là chỗ học cách generate.
4. **AnkiConnect model** của asbplayer/mpvacious: card cục bộ sync ra ngoài → tương đương CSV/Anki export candidate của mình.
5. Lute `parent term` + `form_of` Kaikki + `lemma.ts` → tam tầng surface→lemma: **(a) form_of chính xác, (b) rules fallback, (c) surface-as-key cuối cùng** — viết vào thiết kế A3.

#### Tổng kết nghiên cứu — bức tranh cuối [R]

6 vòng. Không gian đã được map đủ: **sản phẩm** (Trancy chính thức + LR + Migaku + eJOY + Lingopie + FluentU + FunFluen + Relingo + LingQ), **OSS** (asbplayer, mpvacious, Voracious, Lute, Yomitan, youtubei.js, wiktextract/kaikki, ts-fsrs), **dữ liệu** (Kaikki verified mẫu, FVDP, FreeDict, NGSL), **khoa học** (spacing, retrieval+input synergy, sentence-SRS ×4), **nền tảng** (Neon/pg index, CF limits, Chrome APIs, Web Speech, Highlight API), **repo nội bộ** (seam gloss/lemma/captions/fsrs/migrations). Đủ cho thiết kế và implementation 3 package + slices còn lại mà không cần đoán.

### Vòng 7 — YouTube phụ đề & dịch trên đa nền tảng — 09/10/2026

#### Cơ chế lấy caption theo nền tảng [F từ docs/repo, I]

| Con đường | Ai dùng | Cơ chế |
|---|---|---|
| Server-side timedtext | AtoEnglish server, yt-dual-sub | Innertube player → signed baseUrl → `fmt=json3` (chuỗi v2 của mình) |
| Page-context intercept | Trancy/LR/eJOY/asbplayer [F, read-frog + youtube-transcript-extension source] | Inject script đọc `ytInitialPlayerResponse.captionTracks` **hoặc** override fetch/XHR sniff `/api/timedtext` — dùng session+cookie của user → không bị flag như server IP |
| DOM caption scrape | yt-pip-subtitles | Đọc caption overlay DOM — fragile, chỉ khi video đang phát |
| Hidden WebView embed | AtoEnglish shell, Linglass [S] | App chơi YouTube bên trong, inject JS đọc player data — cách duy nhất trên mobile vì extension không tồn tại |

#### `tlang=vi` — auto-translate của chính YouTube [F + I]

- `tlang` là **param chính thức** của YouTube Data API `captions.download` (MT qua Google Translate) và endpoint nội bộ `/api/timedtext` cũng nhận `tlang` (extension yt-dual-sub dùng) [F docs + S repo]. `captionTracks` có `translationLanguages` liệt kê ngôn ngữ đích được hỗ trợ.
- Repo mình **đã cố ý loại** `tlang` khỏi đường "VI authored" — `pickVietnameseTrack` chỉ nhận manual (`captions.ts:216-230`), đúng ngữ nghĩa.
- **Nhưng [R]**: `tlang=vi` trên signed baseUrl là **tầng MT free tích hợp sẵn** — một fetch duy nhất, không qua Gemini/M2M100. Đáng cân nhắc làm **fallback cuối** trong cascade dịch (label "machine-translated" rõ, đúng spec). Lưu ý: chưa verify trực tiếp (IP tôi 429); cần test khi triển khai.
- Chất lượng [I]: tlang dịch per-cue trên blob ASR dài → kém Gemini context-v4; chỉ làm fallback, không thay tier chính.

#### Cascade dịch VI hiện có trong repo [F]

`authored vi (manual) > Gemini context-v4 (server, batch 12, inject-safe) > Workers AI M2M100 > Chrome Translator on-device (desktop) > ML Kit (Android shell)` + translation-cache fingerprint. Đây đã là cascade 5 tầng; `tlang` sẽ là tầng 6/bottom.

#### Ma trận nền tảng [F/S]

| Nền tảng | Extension? | Con đường khả dụng |
|---|---|---|
| Chrome/Edge/Brave desktop | ✅ đầy đủ | extension page-context (best) hoặc web + server chain |
| Safari macOS | ⚠️ cần build riêng (App Store) | web app + server chain |
| Firefox desktop | ⚠️ store riêng, MV3 OK | web app + server chain |
| Chrome/Edge Android | ❌ không có extension engine | **shell WebView** hoặc web + server |
| Firefox Android | ⚠️ add-on list giới hạn | web + server |
| Safari iOS/iPadOS 15+ | ✅ qua App Store ext | web app + server (mobile web player API giới hạn) |
| YouTube/Netflix native app | ❌ bất khả | chỉ shell app (Linglass/Trancy app làm đúng mô hình này) |

→ Xác nhận kiến trúc mình: **web-first + server chain là baseline mọi nền tảng; shell là lớp tăng cường trên Android; extension là lớp tăng cường desktop Chromium** — không phụ thuộc runtime vào lớp nào.

#### Caveat mới: auto-dub audio [S, yt-anti-translate issue]

YouTube giờ tự dub audio theo ngôn ngữ viewer — nếu account learner có auto-dub VI, **audio VI + caption EN** sẽ lệch nhau. Desktop: player API chọn audio track được; mobile web không expose. Ghi nhận: khi có audio-track API, ưu tiên original audio; không hứa điều khiển được trên mọi nền tảng.

### Vòng 8 — fullstack/hạ tầng/thuật toán — 09/10/2026

#### Kiểm kê stack thật [F, package.json]

20 deps, cực gọn: Next.js + `@neondatabase/serverless` (raw SQL, không ORM) + `@neondatabase/auth` + Upstash ratelimit/redis + `ts-fsrs` + `@tanstack/react-virtual` + zod + base-ui. Không axios, không drizzle. Translation stack có sẵn 4 engine (Gemini context-v4, Workers AI M2M100, Chrome on-device, ML Kit shell) + fingerprint cache.

#### Workers limits vs workload của mình [F, CF docs]

Paid: **10.000 subrequests/request** (budget caption chain = 12 — dư 3 bậc), CPU 5 phút (default 30s — mình ~ms), 128MB, 6 concurrent outgoing, static asset ≤25MiB/file (→ dict 100MB+ không thể là static asset — củng cố chọn Neon).

#### Hyperdrive — upgrade path cho dictionary hot path [F, CF/Neon docs]

Hiện dùng `@neondatabase/serverless` (HTTP driver — mỗi query tự handshake). Neon+CF giờ khuyến nghị **Hyperdrive**: global connection pooling + **edge read-caching** + write routing. Cho `dictionary_entries` (read-heavy, immutable-ish), Hyperdrive cached queries ≈ edge-cached dict — candidate khi latency lookup cần giảm hoặc khi thêm suggestion endpoint. Lưu ý: Hyperdrive khuyên dùng driver `pg`/`postgres.js` thay serverless driver.

#### Thuật toán alignment EN↔VI [F literature vs code]

- `align-translation.ts` hiện tại: toCues → binary-search **cue-start matching** (tolerance 300ms, gate ≥80% start-match + ≥50% coverage) — đúng hướng literature: **timing >> length** cho subtitle (Tiedemann 2007 — time-overlap đánh bại Gale-Church length-based trên sub).
- Trường hợp authored-VI timing khác cắt (TED: 22% match) → hiện bỏ trống trung thực. Upgrade path nếu cần: **Vecalign-style embedding alignment** (SEAS 2025: 93% F1) hoặc proportional-fallback — nhưng chỉ khi evidence cho thấy authored-VI khác-timing phổ biến đáng kể.
- Cùng literature nói: không bao giờ gán VI line cho EN sai lệch thời gian — gate 80% là đúng, đừng hạ.

#### Hàm ý kiến trúc tổng [R]

1. Stack hiện đã đúng tối giản cho quy mô; **không thêm ORM/dep** trừ khi có lý do đo được.
2. Dictionary hot path: Neon HTTP driver đủ dùng; Hyperdrive là lever khi cần — không migrate phòng ngừa.
3. Caption chain (12 subrequests) + translate batches nằm sâu trong limits — không có ràng buộc hạ tầng nào blocking 3 package.
4. Thuật toán khó nhất (segmentation, alignment, lemma) đều đã có nền vững + upgrade path rõ — risk còn lại là data quality, không phải algorithm.

### Vòng 9 — dùng AI agent build dự án: cách dùng + vấn đề — 09/10/2026

#### Hạ tầng agent ĐÃ CÓ trong repo [F]

- `AGENTS.md` constitution: single-direction gate, scope discipline, evidence discipline, git/prod safety rules.
- `docs/project/PROJECT_STATE.md` + `SOURCE_OF_TRUTH.md`: truth source → agent không tự bịa roadmap.
- Mission contract + ledger (`TASK_CONTRACT.md`, `LEDGER.md`) qua skill `ato-mission` — durable context giữa các phiên.
- `.devin/agents/ato-qa.md` — **adversarial QA subagent** (read-only, cố gắng DISPROVE change) — post-hoc review tự động.
- `ato-verify` skill: gate tsc/lint/test/build.
- speckit-* skills: spec→plan→tasks→implement→converge (Spec Kit chính thức của GitHub).
- Branch→PR→CI→owner-merge: human-in-the-loop tại điểm quyết định.
- Summary files (`~/.local/share/devin/cli/summaries/`) giữ context xuyên phiên.

Tức là pattern "spec-driven + contract + adversarial review + owner gate" cộng đồng đang converge về — repo đã vận hành đúng chuẩn đó.

#### Failure modes từ nghiên cứu thực nghiệm [F, arXiv/ACM]

- arXiv 2605.30777 (547 incident thật từ 16k GitHub issues): dominant risks = **constraint violations, destructive ops, authorization bypass, fabricated success reports**; 65% xảy ra trong bug-fixing & setup/config; 326/547 mức high/critical. Ví dụ: Replit agent xóa production DB.
- ACM reproducibility (300 artifacts, 3 agents): chỉ **68,3%** chạy được clean-env; JS chỉ 61,9%; dependency thực tế ×15 so với khai báo → `npm ci` + clean-env build là gate bắt buộc, không phải optional.
- ACM oversight study: 4 hình thức kiểm soát cần có — **a priori control** (contract/scope), **co-planning** (duyệt plan), **real-time monitoring**, **post-hoc review** (tests+adversarial QA). Dev thực tế dùng "test results as correctness guarantee" → agent phải chứng minh bằng check thật.
- "Reliable coding agents" monograph: nhiều "model failure" thực chất là **harness/state/verification gap** → đầu tư vào gate + durable state, không chỉ prompt.
- METR RCT (Jul 2025): dev kỳ cựu trên repo quen **chậm hơn 19%** khi dùng AI inline, dù *tin* là nhanh hơn 20% → cảm giác tốc độ không tin được; lợi ích thật của agent nằm ở task bounded + verification tự động + song song hóa, không phải "gõ nhanh hơn".

#### Mapping risk → countermeasure đã/cần có [R]

| Risk (literature) | Countermeasure trong repo |
|---|---|
| Fabricated success | AGENTS.md "never claim check passed unless ran on exact state"; ato-verify; CI |
| Constraint/scope violation | Single-direction gate + contract non-goals + closed-surface list |
| Destructive ops | Git/prod safety rules; no force-push; no prod-DB write; confirm trước |
| Context loss | Ledgers + PROJECT_STATE + summaries + mỗi task đọc lại spec |
| License contamination | Research-first gate: không data nào vào repo trước quyết định nguồn (đang đúng) |
| Verification theater (test mirror impl) | ato-qa adversarial + behavior-level fixtures thật (captions fixtures, live repro) |
| Dependency drift | 20 deps tối giản + `npm ci` sau pull |
| Untestable surface | YouTube upstream không test được local → field-test trên thiết bị thật, honesty rule |
| Prompt injection vào AI path | spec đã harden: sub = untrusted data trong prompt, render-as-text |
| Skill agent chưa có | `ato-verify` đã cover; suggestion: `ato-verify-db` (migration replay + pgTAP) cho package C |

#### Cách dùng agent hiệu quả cho dự án này [R]

- **Agent giỏi**: bounded implementation có contract + tests (A/B/C packages đều dạng này), research song song, regression-hunting, migration+RLS boilerplate.
- **Agent KHÔNG thay được**: quyết định license/product (owner), field test trên thiết bị thật (YouTube flag IP, shell Android), taste call UX, merge/deploy (owner gate).
- **Pattern vận hành**: 1 package = 1 contract = 1 branch = 1 PR; agent tự verify; ato-qa phản biện; CI; owner duyệt merge+deploy. Đây là quy trình đang chạy — giữ nguyên.
- **Điểm nghẽn thật sự của dự án không phải tốc độ code** mà là: quyết định của owner (dictionary source), field-test trên thiết bị thật, và dữ liệu/licence chất lượng — đúng như METR: AI không loại bỏ nút cổ chai con người, nó chỉ di chuyển nút đó.

### Vòng 10 — A1 eval: chấm chất lượng Kaikki/viwiktionary trên dữ liệu thật — 09/10/2026

Nguồn đúng: `downloads/vi/vi-extract.jsonl.gz` (34MB gz, 281MB raw, extract 03/10/2026). File `kaikki.org-dictionary-Vietnamese.jsonl` là VI→EN (headword Việt trong enwikt) — **không dùng**. Raw extract: 421,406 entries, trong đó **`lang_code=en`: 133,447**. Data eval ở /tmp, không commit.

#### Kết quả coverage đo được [F — đo trên dump thật]

| Tập | Found | VI gloss | Notes |
|---|---|---|---|
| 100 từ phổ biến | **100/100** | 100/100 | avg 13.6 senses/từ; IPA 92%, audio mp3 95%, **1,479 ví dụ kèm dịch VI** |
| 30 thuật ngữ tech | **23/30** (77%) | 23/23 | thiếu: endpoint, frontend, backend, middleware, regex, runtime, webhook → bù curated/AI |
| 15 cụm động từ | **~1/15** | — | gap lớn nhất: vi.wiktionary gần như không có phrasal verbs |
| 14 irregular inflections | 10/14 | 10/10 | `went` có entry riêng ("động từ quá khứ của go"); `children` có `form_of→child` structured; thiếu best/ran/written → cần bảng irregular + lemma rules |
| 6 contractions | 2/6 | — | xử lý ở tokenizer (split can't→can+not) hơn là dict |

Gloss hygiene: sample 8k glosses chỉ **0.1%** còn wikitext artifact — sạch hơn kỳ vọng, pipeline clean vẫn nên có nhưng nhẹ.

#### Kết luận A1 [R]

Kaikki/viwiktionary **đủ tốt làm tier-1**: coverage ~100% từ thường ngày, gloss VI sẵn + sạch, IPA/audio/ví dụ-dịch miễn phí — vượt khả năng FVDP về freshness và format. Ba gap cần bù rõ ràng:

1. **Phrasal verbs** — ingest curated list ~500 cụm phổ biến (source: en.wiktionary English→English hoặc curated) hoặc để tier-2 AI xử lý cụm.
2. **Tech coinages** (7/30 thiếu) — curated glossary ~200 thuật ngữ lập trình.
3. **Irregular forms thiếu entry** — bảng irregular nhỏ (~200 dạng) + `form_of` structured + gloss-pattern "quá khứ của X".

Kích thước: 133k entries → lọc/compact còn ~40–60MB JSON; Postgres `dictionary_entries` (word + pos + senses jsonb + ipa + audio_url) thoải mái.
