# Devin Spec — AtoEnglish M0 + M1: Vocabulary spine & Content pipeline

> **Superseded 2026-10-06.** The owner replaced the IELTS 0→9.0 direction with the video-learning direction in `docs/project/PROJECT_STATE.md`. This document is historical reference only and does not authorize work. The vocabulary spine (Part A) may be reused as a gloss/difficulty asset; see `docs/missions/004-video-learning-loop/SPEC.md`.

Ngày 2026-10-05. Spec này đủ chi tiết để Devin làm ngay không cần hỏi lại. Ngôn ngữ spec: tiếng Việt; code/YAML/schema: tiếng Anh.

## 0. Bối cảnh & quyết định đã chốt (không thay đổi giữa chừng)

- AtoEnglish: web học tiếng Anh cho **một người duy nhất (Hoàng)** dùng cá nhân. Bỏ qua paywall, monetization, pháp lý thương mại.
- Flow bài học đã duyệt: 5 phase **DẪN → MẪU → DÙNG → CHỨNG MINH → GIỮ**, 25 phút/bài (chi tiết sư phạm: `atoenglish-lesson-flow-final-2026-10-05.md`).
- Kiến trúc đo lường 3 tầng đã duyệt (habit / learning / proficiency) + **cấm**: XP, streak-as-progress, điểm % trong bài, bảng xếp hạng, gems.
- Portfolio: tự động lưu artifact Phase 4, có nút xóa.
- Nguyên tắc: **nội dung trước, code sau**. M0+M1 không đụng vào lesson player hiện tại, không redesign UI.

---

## PART A — M0: Vocabulary spine

### A1. Mục tiêu

Một bảng từ vựng duy nhất, mỗi từ gắn band CEFR. Mọi unit chỉ dùng từ trong spine. Xóa tình trạng hiện tại có 2 nguồn vocab vênh nhau (`unit.vocab[]` vs `UNIT_VOCABULARY`).

### A2. Repo & file layout

Tạo repo mới **`atoenglish-content`** (tách khỏi repo app để deploy nội dung độc lập):

```
atoenglish-content/
  README.md                  # quy trình pipeline tóm tắt + cách chạy script
  spine/
    vocabulary-spine.yaml    # source of truth
    SOURCES.md               # ghi nguồn CEFR-J, ngày import, phiên bản
  units/
    sequence.yaml            # thứ tự units (quyết định "đã học gì trước")
    A0/
      unit-a0-1.yaml
      ...
  scripts/
    validate-spine.mjs
    check-unit.mjs
  .github/workflows/content-gates.yml
  BLUEPRINT-TEMPLATE.md
```

### A3. Schema `vocabulary-spine.yaml`

Mỗi entry (YAML list):

```yaml
- word: work
  pos: verb # noun | verb | adjective | adverb | interjection | determiner | preposition | pronoun | conjunction | phrase
  band: A1 # A0 | A1 | A2 | B1 | B2
  forms: [works, worked, working] # biến thể cần match khi tính coverage (xem A5)
  vi_gloss: "làm việc"
  first_introduced_unit: unit-a0-3 # unit đầu tiên dạy từ này (để trống nếu chưa gán)
  notes: "người Việt hay nuốt -s ở works" # optional
```

Ràng buộc (script `validate-spine.mjs` kiểm tra, fail nếu vi phạm):

1. `word` duy nhất toàn file (so sánh case-insensitive, trim).
2. `band` thuộc {A0,A1,A2,B1,B2}; `pos` thuộc enum trên.
3. `forms` không trùng `word`, không trùng nhau.
4. Cụm từ (`pos: phrase`, vd "good morning") được phép; khi tính coverage, match cụm trước rồi mới match từ đơn (xem A5).
5. File phải parse được, không entry rỗng.

### A4. Import band CEFR từ CEFR-J

- Devin tự tìm nguồn CEFR-J Wordlist (bản mới nhất), tải về, map band → A0..B2.
- Ghi vào `spine/SOURCES.md`: URL nguồn, ngày tải, phiên bản, số entry import được, quy tắc map band (nếu CEFR-J dùng ký hiệu khác).
- **Seed tối thiểu M0:** ≥ 500 entries band A0–A1 (đủ cho 5 pilot units + dự phòng). Không cần đủ 2.500–3.000 từ ngay — spine sẽ lớn dần theo từng unit (mỗi blueprint được phép đề xuất thêm từ vào spine, xem Part B).
- Personal-use: không lo bản quyền thương mại (đã xác minh), nhưng vẫn ghi nguồn đầy đủ.

### A5. Thuật toán coverage gate (script `check-unit.mjs`) — QUAN TRỌNG NHẤT M0

**Định nghĩa:** với unit U ở vị trí thứ N trong `sequence.yaml`:

- `known_words` = union `target_vocab` của TẤT CẢ units đứng trước U trong sequence + `target_vocab` của U.
- `text` = toàn bộ text tiếng Anh trong `dialogue` + `worked_examples` của U (xem schema Part B).
- Tokenize: lowercase → tách theo whitespace/punctuation → bỏ token rỗng. Không stemming, không NLP.
- Match theo thứ tự: (1) cụm từ trong spine (`pos: phrase`, match greedy cụm dài nhất), (2) từ đơn: token khớp `word` hoặc bất kỳ phần tử nào trong `forms` (case-insensitive).
- `proper_nouns` khai báo trong unit (tên riêng: Lan, Hanoi…) được **loại khỏi mẫu số**.
- `coverage = matched_tokens / total_tokens` (sau khi trừ proper nouns).

**Gate:**

- `coverage < 0.95` → **FAIL** (exit 1, CI đỏ, không merge).
- `0.95 ≤ coverage < 0.98` → **WARN** (pass nhưng in cảnh báo + liệt kê từ chưa known).
- Mọi từ trong text **không có trong spine và không phải proper noun** → liệt kê thành `unknown_words[]` trong report (tác giả phải hoặc thêm vào spine, hoặc viết lại câu).

**CLI:**

```
node scripts/validate-spine.mjs [--json]
node scripts/check-unit.mjs units/A0/unit-a0-1.yaml [--json]
node scripts/check-unit.mjs --all [--json]     # chạy cho mọi unit trong sequence
```

- `--json` in ra JSON machine-readable: `{unit, coverage, threshold_pass, unknown_words[], band_violations[], timing: {...}}`.
- Không có `--json`: in bảng đọc được cho người.

**CI** (`.github/workflows/content-gates.yml`): chạy trên mọi PR đụng vào `spine/` hoặc `units/`: `validate-spine.mjs` + `check-unit.mjs --all`. Đỏ là block merge.

### A6. Acceptance criteria M0 (Devin tự check, Hoàng nghiệm thu)

- [ ] Repo `atoenglish-content` tồn tại, đúng layout A2.
- [ ] `vocabulary-spine.yaml` ≥ 500 entries A0–A1, `validate-spine.mjs` chạy xanh.
- [ ] `SOURCES.md` ghi đầy đủ nguồn CEFR-J.
- [ ] `check-unit.mjs` implement đúng thuật toán A5 (Hoàng sẽ test bằng 1 unit mẫu cố tình coverage thấp → phải FAIL).
- [ ] CI chạy gate trên PR mẫu và block đúng.
- [ ] Đo coverage 5 units A0 **hiện tại** (viết YAML tạm từ nội dung cũ hoặc đo thủ công) → ra con số baseline để đối chứng (dự kiến thấp, đúng như audit đã ghi nhận 5–22%).

---

## PART B — M1: Content pipeline (bản sửa 20:45 — bài học LẤY TỪ TƯ LIỆU THẬT)

> **Thay đổi theo ý Hoàng:** bài học không phải do AI bịa ra từ blueprint. Mỗi unit bắt đầu từ **một bài báo / video / hội thoại THẬT**, AI chỉ làm công việc sư phạm: trích từ vựng, viết worked examples từ câu thật, ra câu hỏi về nội dung thật, thiết kế transfer task từ chủ đề thật. Blueprint của Hoàng quyết định **chủ đề + can-do**; Devin đi tìm tư liệu thật khớp chủ đề đó.
>
> **Về bản quyền (nói thẳng):** app chỉ một mình bạn dùng, không republish, không bán, không chia sẻ ra ngoài → rủi ro bản quyền gần như bằng 0. Đọc báo, xem YouTube, lưu transcript để tự học là việc hàng triệu người làm mỗi ngày. Mỗi unit ghi `source.url` là đủ minh bạch. Cái duy nhất không làm: copy nguyên xi sách giáo trình thương mại (kiểu English File) vào app — mà mình cũng không cần, vì nguồn của mình là báo/video công khai.

### B0. Chọn nguồn tư liệu (bước mới, trước blueprint)

Devin tìm 3–5 ứng viên cho mỗi unit theo thang level (đã nghiên cứu):

| Level unit | Nguồn được phép                                                                            |
| ---------- | ------------------------------------------------------------------------------------------ |
| A0–A1      | News in Levels Level 1–2, VOA Learning English Beginning (tin THẬT, ngôn ngữ đơn giản hóa) |
| A2         | News in Levels Level 3, VOA Intermediate, BBC 6 Minute English                             |
| B1         | VOA Advanced, VnExpress International, BBC Learning English, YouTube có transcript         |
| B2         | Báo thật (BBC, Reuters…), podcast có transcript, YouTube không phụ đề                      |

Tiêu chí chọn: (1) đúng chủ đề blueprint, (2) độ dài vừa bài 25 phút (báo ~300–600 từ / video 3–8 phút), (3) có audio hoặc transcript, (4) 5-finger rule: đọc thử 1 đoạn, 2–3 từ lạ/đoạn là chuẩn, 5+ thì đổi bài.
Hoàng chốt 1 nguồn trong 3–5 ứng viên (hoặc ủy quyền cho Devin chọn theo tiêu chí).

### B1. `units/sequence.yaml`

```yaml
# Thứ tự học. Quyết định "known_words" của coverage gate.
order:
  - unit-a0-1
  - unit-a0-2
  - unit-a0-3
  - unit-a0-4
  - unit-a0-5
```

### B2. Schema đầy đủ `units/<LEVEL>/<id>.yaml`

```yaml
id: unit-a0-1 # required, khớp tên file và sequence
level: A0 # required, enum A0|A1|A2|B1|B2
title_en: "Meeting a new colleague" # required
title_vi: "Gặp đồng nghiệp mới" # required
can_do: # required — 1 objective duy nhất
  en: "I can greet someone and introduce my name and job when meeting for the first time."
  vi: "Tôi có thể chào hỏi và giới thiệu tên + nghề nghiệp khi gặp lần đầu."
prerequisites: [] # list unit id; rỗng = không yêu cầu
target_vocab: [hello, hi, name, ...] # required, 8–15 từ, PHẢI có trong spine
proper_nouns: [Lan] # tên riêng, loại khỏi coverage
source: # required — tư liệu THẬT làm gốc bài học
  url: "https://www.newsinlevels.com/..." # link gốc
  title: "New colleagues at the office" # tiêu đề gốc
  publisher: "News in Levels" # tên nguồn
  type: article | video | audio # loại tư liệu
  level_original: "Level 2" # cấp độ gốc của nguồn (nếu có)
  adapted: true # true nếu AI đã rút gọn/đơn giản hóa câu gốc
  notes: "giữ nguyên 5 câu gốc ở worked_example 1–3" # optional
phases: # required, đúng 5 phase theo thứ tự
  - n: 1
    name: goal_setting
    est_minutes: 2
    steps: [...]
  - n: 2
    name: observe_learn
    est_minutes: 6
    steps: [...]
  - n: 3
    name: guided_practice
    est_minutes: 8
    steps: [...]
  - n: 4
    name: prove
    est_minutes: 5
    steps: [...]
  - n: 5
    name: lock_in
    est_minutes: 4
    steps: [...]
```

**Step chung:** mỗi step có `id` (duy nhất trong unit) + `type`. Dưới đây là toàn bộ `type` hợp lệ theo phase, kèm field bắt buộc:

**Phase 1 — goal_setting (2')**
| type | fields |
|---|---|
| `objective_card` | (lấy từ `can_do` của unit, không field thêm) |
| `prereq_check` | `items: [{id, prompt_vi, prompt_en?, expected: [..], refresher_step: <step id>}]` — 2–3 items, **không chấm điểm**, sai → route tới `refresher_step` |
| `refresher` | `content_vi` (giải thích ngắn), `example_en`, `audio?` |

**Phase 2 — observe_learn (6')**
| type | fields |
|---|---|
| `worked_example` | `situation_vi` (1 dòng bối cảnh), `lines: [{speaker, en, vi_gloss, audio?, target_words: []}]` — 3–5 examples/unit, `noticing_prompt_vi`, `noticing_answer_vi` |
| `elicited_explanation` | `prompt_vi` (câu hỏi gợi mở), `expected_points: []`, `feedback_explain_vi` — đúng 1 cái/unit ở A0–A1 |
| `brief_rule` | `rule_vi` (tối đa 2 câu, đứng SAU worked_example), `rule_en?`, `example_en` |

**Phase 3 — guided_practice (8')**
| type | fields |
|---|---|
| `comprehension` | `stimulus_ref` (ref tới dialogue hoặc audio), `question_en`, `question_vi`, `choices: []?`, `expected`, `feedback_explain_vi` |
| `controlled_production` | `prompt_en`, `prompt_vi`, `expected: []` (các đáp án chấp nhận), `feedback_explain_vi`. **BẮT BUỘC mang nghĩa thật** (điền từ vào câu có ngữ cảnh, không drill thay thế cơ học kiểu "I \_\_\_ (go) → goes" trần trụi) |
| `guided_dialogue` | `scenario_vi`, `turns: [{role: learner\|partner, learner_prompt_vi?, expected_patterns: [], hint_vi?, partner_line_en}]` |
| `error_repair` | `error_pattern_en` (lỗi sai điển hình), `elicit_vi` (câu gợi ý sửa — KHÔNG đưa đáp án ngay), `feedback_explain_vi` |
| `pronunciation_loop` | `target` (vd "phụ âm cuối /s/ trong works, tests"), `target_words: []`, `model_audio`, `minimal_pairs: [{a_en, b_en}]?`, `try_sentence_en`, `feedback_focus_vi` (nghe cái gì), `max_retries: 3` |

**Phase 4 — prove (5')**
| type | fields |
|---|---|
| `transfer_task` | `mode: speak\|write`, `scenario_en`, `scenario_vi` (tình huống MỚI, không copy bài học), `constraints` (vd "dùng ít nhất 3 từ target"), `speak_seconds: [30,60]?`, `write_sentences: [3,4]?`, `rubric: [{criterion: task_completion\|target_language_use\|intelligibility, descriptors_vi}]` — đúng 3 criteria, **không thang %** |
| `model_answer` | `text_en`, `audio?`, `notes_vi` (vì sao bài mẫu tốt) — **chỉ hiện SAU khi nộp bài** |

**Phase 5 — lock_in (4')**
| type | fields |
|---|---|
| `interleaved_retrieval` | `items: [{source_unit, prompt_vi (VI→EN), expected_en: [], feedback_explain_vi}]` — lấy từ `retrieval_items` của 2–3 units TRƯỚC (xem B3) |
| `can_do_tick` | `statement_vi` (tự đánh giá, vd "Tôi có thể chào và giới thiệu tên/nghề") |
| `preview_next` | `teaser_vi` (1 câu nhá hàng bài sau) |
| `habit_tick` | (không field — hệ thống ghi nhận) |

**`retrieval_items`** (top-level, dùng cho unit SAU): `[{id, prompt_vi, expected_en: [], feedback_explain_vi}]` — 3–5 items/unit, dạng VI→EN.

### B3. Deterministic gates cho unit (chạy trong `check-unit.mjs`, theo thứ tự — fail ở gate nào dừng ở đó)

1. **Schema gate:** YAML parse được; đủ field required; `phases` đúng 5 phase theo thứ tự; mỗi step có `id` duy nhất và `type` hợp lệ với phase của nó.
2. **Spine gate:** mọi từ trong `target_vocab` có trong spine; mọi token trong dialogue/worked_examples có trong spine HOẶC `proper_nouns` (liệt kê unknown).
3. **Coverage gate:** ≥ 0.95 (thuật toán A5).
4. **Band gate:** band của mỗi từ trong `target_vocab` ≤ `level` của unit (A0<A1<A2<B1<B2). Từ band cao hơn → FAIL kèm danh sách.
5. **Target vocab size:** 8–15 từ. Ngoài khoảng → WARN.
6. **Timing gate:** tổng `est_minutes` ≤ 27; mỗi phase trong khoảng target ± 2 (targets: 2/6/8/5/4).
7. **Feedback gate:** mọi step loại `comprehension`, `controlled_production`, `guided_dialogue`, `elicited_explanation`, `interleaved_retrieval` PHẢI có `feedback_explain_vi` (không rỗng).
8. **Rubric gate:** Phase 4 có đúng 1 `transfer_task` với `rubric` đủ 3 criteria enum chuẩn; không xuất hiện ký tự `%` trong rubric/descriptors.
9. **Banned-pattern gate:** FAIL nếu phát hiện: bài tập `controlled_production` không có `prompt_vi` mang nghĩa (drill cơ học); text chứa "XP", "streak", "điểm" như phần thưởng; Phase 1 có chấm điểm prereq_check.
10. **Retrieval gate:** `retrieval_items` 3–5 items, tất cả dạng VI→EN (prompt_vi bắt buộc, expected_en bắt buộc).
11. **Source gate:** `source.url` + `source.title` + `source.publisher` bắt buộc; `source.type` thuộc enum; Phase 2 phải có ít nhất 2 `worked_example` ghi `adapted_from_source: true` (câu lấy từ tư liệu gốc, được phép rút gọn nhưng không bịa mới hoàn toàn).

### B4. Prompt template sinh draft bằng AI — PHIÊN BẢN TƯ LIỆU THẬT (Devin dùng cho từng unit)

Devin paste prompt này (điền phần trong ngoặc) vào model. Mỗi unit sinh **3–5 drafts**, mỗi draft là 1 file YAML đầy đủ. **Điểm khác biệt với bản cũ: AI không bịa nội dung — nó ĐỌC tư liệu thật và xây bài học từ đó.**

```
Bạn là chuyên gia viết giáo trình tiếng Anh cho người Việt đi làm, trình độ [A0].
Nhiệm vụ: đọc TƯ LIỆU THẬT dưới đây và xây 1 unit hoàn chỉnh (YAML) theo 5 phase, BÁM VÀO tư liệu.

TƯ LIỆU GỐC:
Tiêu đề: [paste title]
Nguồn: [paste publisher + url]
Nội dung (toàn văn / transcript):
[paste toàn bộ text bài báo hoặc transcript video]

RÀNG BUỘC BẮT BUỘC (vi phạm là draft bị loại):
1. Blueprint (bám sát tuyệt đối):
   - Can-do: [paste can_do]
   - Target vocab (từ mới của bài — ƯU TIÊN từ xuất hiện trong tư liệu gốc; chỉ thêm từ ngoài khi thật cần): [paste list]
2. NỘI DUNG LẤY TỪ TƯ LIỆU THẬT:
   - Phase 2 (worked_example): ít nhất 2/3–5 ví dụ PHẢI là câu thật từ tư liệu (được rút gọn cho vừa trình độ nhưng không bịa câu mới hoàn toàn); mỗi ví dụ ghi adapted_from_source: true.
   - Phase 3 (comprehension): câu hỏi PHẢI hỏi về nội dung tư liệu thật (ai, cái gì, ở đâu trong bài).
   - Phase 4 (transfer_task): tình huống MỚI nhưng cùng chủ đề với tư liệu (vd: đọc tin về đồng nghiệp mới → transfer: tự giới thiệu với đồng nghiệp mới).
   - Không bịa số liệu, tên riêng, sự kiện ngoài tư liệu gốc.
3. Chỉ dùng từ trong danh sách cho phép (spine excerpt đính kèm). Từ nào ngoài danh sách → phải là tên riêng và khai vào proper_nouns.
4. Mỗi phase đúng số phút: 2/6/8/5/4 (tổng ≤ 27).
5. Phase 2: 3–5 worked_example, mỗi cái có noticing_prompt_vi; brief_rule đứng SAU ví dụ, tối đa 2 câu.
6. Mọi bài tập phải có feedback_explain_vi bằng tiếng Việt, giải thích TẠI SAO — không chỉ "sai rồi".
7. KHÔNG mở bài bằng task lạnh (không ném người học vào bài tập khi chưa dạy gì).
8. KHÔNG drill thay thế cơ học không ngữ cảnh. Mọi câu đều phải có nghĩa thật.
9. Phase 4: rubric đúng 3 tiêu chí task_completion/target_language_use/intelligibility, KHÔNG dùng thang %.
10. Phase 5: retrieval_items dạng Việt→Anh, 3–5 items (lấy câu từ tư liệu đã học).
11. Phát âm: ưu tiên lỗi người Việt (phụ âm cuối, -s/-ed, trọng âm từ). Không drill /θ, ð/ như mục tiêu chính.
12. Điền đầy đủ block `source:` (url, title, publisher, type, adapted: true/false).
13. Output: CHỈ YAML, không giải thích ngoài YAML.

Spine excerpt (từ được phép dùng):
[paste các entry spine: word, band, vi_gloss — chỉ các từ band ≤ level + từ các unit trước]

Schema YAML:
[Devin paste toàn bộ B2 rút gọn: field required + ví dụ 1 step mỗi type]
```

Sau khi sinh 3–5 drafts → chạy `check-unit.mjs` cho từng draft → **chỉ giữ draft pass đủ 11 gates** → trong các draft pass, Devin chọn 1 (tiêu chí: bám sát tư liệu gốc nhất, transfer task mới mẻ nhất) → mở PR → Hoàng duyệt cuối.

### B5. Human review checklist (Hoàng dùng khi duyệt PR unit)

- [ ] Can-do objective có quan sát được trong 1 bài 25 phút không?
- [ ] **Nội dung có bám tư liệu gốc không?** (mở link source, đối chiếu 2–3 câu worked_example — có thật trong bài không hay AI bịa?)
- [ ] Câu trích từ tư liệu có bị rút gọn quá đà / sai nghĩa gốc không?
- [ ] Gloss tiếng Việt có chính xác, tự nhiên không?
- [ ] Target vocab có đúng thứ tôi cần cho công việc không?
- [ ] Phase 2 có "dạy trước" đàng hoàng, không ném vào task lạnh không?
- [ ] Feedback tiếng Việt có giải thích được TẠI SAO không (hay chỉ chữa đáp án)?
- [ ] Transfer task có cùng chủ đề với tư liệu nhưng là tình huống MỚI không?
- [ ] Pronunciation target có trúng lỗi người Việt không?
- [ ] Có chỗ nào "game hóa" lố (XP/streak/điểm %) lọt vào không?

### B6. BLUEPRINT-TEMPLATE.md (Hoàng điền cho mỗi unit)

```markdown
# Blueprint <unit-id>

## 1. Can-do (1 câu, quan sát được)

_Tôi có thể ... (khi/ở đâu)_

## 2. Chủ đề (để Devin đi tìm tư liệu thật)

_Chủ đề tin tức/video: ... (vd: tin công nghệ, chuyện công sở, du lịch...)_

## 3. Target vocab (10–15 từ, ưu tiên từ tôi cần cho việc)

1. ...

## 4. Từ mới đề xuất thêm vào spine (nếu có, kèm nghĩa + band đoán)

## 5. Transfer task (việc làm được sau bài, cùng chủ đề với tư liệu nhưng tình huống mới)

_Nói/Viết: ..._

## 6. Ghi chú đặc biệt

_Ngữ cảnh văn hóa, lỗi tôi hay mắc, ..._
```

**Blueprint mẫu đã điền (unit-a0-1) để Hoàng nhìn theo:**

```markdown
# Blueprint unit-a0-1

## 1. Can-do

Tôi có thể chào hỏi và giới thiệu tên + nghề nghiệp khi gặp đồng nghiệp mới lần đầu.

## 2. Chủ đề (để Devin tìm tư liệu thật)

Tin/chuyện công sở: ngày đầu đi làm, gặp gỡ đồng nghiệp mới. Nguồn gợi ý: News in Levels Level 1–2, VOA Beginning.

## 3. Target vocab (12 từ)

hello, hi, morning, name, my, your, I, am, meet, nice, work, colleague

## 4. Từ mới đề xuất thêm vào spine

colleague (A0, "đồng nghiệp"); nice to meet you (phrase A0, "rất vui được gặp bạn")

## 5. Transfer task (nói, 30–60 giây)

Đọc xong bài báo về ngày đầu đi làm → tưởng tượng bạn gặp một đồng nghiệp mới tên Lan ở thang máy. Tự giới thiệu: chào, tên bạn, bạn làm nghề gì, kết thúc lịch sự.

## 6. Ghi chú

Tôi hay quên -s ở "works"; bài này cần drill "I work as..." vs "She works...".
```

### B7. Devin task breakdown M1 (thứ tự làm)

1. Viết `BLUEPRINT-TEMPLATE.md` + schema docs trong README.
2. Mở rộng `check-unit.mjs` đủ 11 gates B3 (B2 schema là nền).
3. Devin **tìm 3–5 tư liệu thật ứng viên cho mỗi unit** (A0-1 → A0-5, theo thang B0, đúng chủ đề blueprint) → **Hoàng chốt 1 nguồn/unit** (hoặc ủy quyền cho Devin).
4. Devin **tự soạn 5 blueprint** (theo mẫu B6, logic nối tiếp: chào hỏi → giới thiệu → hỏi thăm → số/điện thoại/email → tạm biệt + hẹn gặp) → **Hoàng duyệt/sửa blueprint** (gate người 1).
5. Mỗi blueprint + nguồn đã chốt → sinh 3–5 drafts bằng prompt B4 → chạy gate → chọn 1 → PR.
6. Hoàng duyệt PR theo checklist B5 (trong đó có đối chiếu tư liệu gốc) → merge (gate người 2).

### B8. Acceptance criteria M1

- [ ] `check-unit.mjs` implement đủ 11 gates B3; test với unit cố tình vi phạm từng gate → fail đúng gate.
- [ ] 5 blueprint A0-1→A0-5 được Hoàng duyệt (bằng tin nhắn/xác nhận); mỗi blueprint đã chốt 1 nguồn tư liệu thật (B0).
- [ ] 5 file YAML pilot pass đủ 11 gates, merge vào `units/A0/`; mỗi file có block `source` đầy đủ, ít nhất 2 worked_example lấy câu từ tư liệu gốc.
- [ ] Mỗi pilot có đủ: dialogue + audio refs (audio có thể placeholder `audio: TBD` ở M1 — thu âm ở M2), 3–5 worked examples, transfer task + rubric 3 criteria, 3–5 retrieval_items VI→EN.
- [ ] Hoàng học thử 5 bài trên giấy/file (đọc YAML hoặc bản render đơn giản) và cho feedback → ghi lại thành revision notes.

---

## PART C — Non-goals (M0+M1 KHÔNG làm)

- Không sửa lesson player hiện tại, không đụng mission stage-machine (đó là M2).
- Không redesign UI/UX, không làm dashboard (M4).
- Không thu âm audio thật (dùng `audio: TBD` placeholder; thu âm ở M2).
- Không viết quá 5 pilot units. Không đụng 45 units còn lại.

## PART D — Cách Devin làm việc (quy trình repo)

- Làm trên branch riêng, mở PR vào main của `atoenglish-content`.
- Mọi PR chạy CI content-gates; đỏ thì không merge.
- Hoàng có quyền merge khi CI xanh (standing preference: tự merge, không cần nhắc).
- Commit message rõ ràng: `content(unit-a0-1): add pilot draft`, `chore(spine): import CEFR-J A0 band`, v.v.
