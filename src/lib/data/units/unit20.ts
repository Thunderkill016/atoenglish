import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-20 — News & Current Events  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// UNIT 20 — News & Current Events (B1)
// Grammar: Past Perfect (had + past participle)
// L1 Alert: Vietnamese has no equivalent — learners use Past Simple for all past events

export const unit20: UnitData = {
  unitId: "unit-20",
  title: "Unit 20: News & Current Events",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description:
    "Học Past Perfect để nói về sự kiện xảy ra TRƯỚC một mốc thời gian khác trong quá khứ — kỹ năng thiết yếu khi đọc tin tức và kể chuyện phức tạp.",
  badgeName: "Phóng Viên",
  badgeEmoji: "📰",


  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn đang trình bày tóm tắt tin tức tại cuộc họp sáng thứ Hai. Đồng nghiệp hỏi: 'Why did the stock price drop yesterday?' Để giải thích đúng nguyên nhân và hệ quả, bạn cần Past Perfect: 'By the time the market opened, the company had already announced the losses.'",

  learningOutcomes: [
    "Dùng Past Perfect để nói về sự kiện xảy ra TRƯỚC một mốc quá khứ khác",
    "Phân biệt Past Perfect vs Past Simple trong cùng một câu chuyện",
    "Đọc và thảo luận tin tức thời sự bằng tiếng Anh tự nhiên",
  ],


  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Trong tiếng Anh, <span class="text-emerald-400 font-semibold">Past Perfect</span> giúp phân biệt THỨ TỰ của các sự kiện. Ví dụ: <span class="text-zinc-400">"When I arrived, the meeting started."</span> → nghe như hai việc xảy ra đồng thời. Còn <span class="text-emerald-400">"When I arrived, the meeting <strong>had already started</strong>."</span> → rõ ràng cuộc họp bắt đầu TRƯỚC khi tôi đến. Người Việt thường bỏ qua sự phân biệt này vì tiếng Việt dùng "đã" cho mọi trường hợp.',


  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "📊", en: "By the time I arrived, the presentation had already started.", vn: "Khi tôi đến, buổi thuyết trình đã bắt đầu rồi.", context: "Sự kiện xảy ra trước" },
    { emoji: "📰", en: "The company had announced the results before the market opened.", vn: "Công ty đã công bố kết quả trước khi thị trường mở cửa.", context: "Nguyên nhân trước hệ quả" },
    { emoji: "✉️", en: "She had already sent the report when her boss asked for it.", vn: "Cô ấy đã gửi báo cáo rồi khi sếp yêu cầu.", context: "Hành động hoàn thành trước" },
  ],


  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "announce", emoji: "📢", phonetic: "/əˈnaʊns/", meaning: "thông báo / công bố", example: "The CEO announced the merger last Friday.", example2: "They had announced the results before we arrived.", collocation: "announce a decision / publicly announce", audio: "/audio/unit-20/announce.mp3", l1_interference_vn: "⚠️ \'Announce\' + that/N: \'announce the decision\'. Không dùng \'announce someone that\' — dùng \'tell someone\'." },
    { id: 2, word: "merger", emoji: "🤝", phonetic: "/ˈmɜːdʒər/", meaning: "sự sáp nhập (công ty)", example: "The merger created the largest bank in the region.", example2: "By the time we heard, the merger had already been approved.", collocation: "company merger / merger deal / agree to a merger", audio: "/audio/unit-20/merger.mp3" },
    { id: 3, word: "decline", emoji: "📉", phonetic: "/dɪˈklaɪn/", meaning: "sụt giảm / từ chối", example: "Sales had declined by 20% before the new strategy was introduced.", example2: "He declined the offer after careful consideration.", collocation: "sharp decline / decline an offer / decline in sales", audio: "/audio/unit-20/decline.mp3", l1_interference_vn: "⚠️ Hai nghĩa: (1) từ chối \'decline an offer\', (2) sụt giảm \'a decline in sales\'. Đừng nhầm lẫn." },
    { id: 4, word: "investigate", emoji: "🔍", phonetic: "/ɪnˈvestɪɡeɪt/", meaning: "điều tra", example: "By the time police arrived, they had already investigated the scene.", example2: "The committee is investigating the fraud allegations.", collocation: "investigate a case / under investigation", audio: "/audio/unit-20/investigate.mp3", l1_interference_vn: "⚠️ \'Investigate\' + N trực tiếp: \'investigate the case\'. \'Under investigation\' = đang bị điều tra." },
    { id: 5, word: "resign", emoji: "🚪", phonetic: "/rɪˈzaɪn/", meaning: "từ chức", example: "The minister had resigned before the scandal became public.", example2: "She resigned from her position after 10 years.", collocation: "resign from a post / letter of resignation", audio: "/audio/unit-20/resign.mp3", l1_interference_vn: "⚠️ \'Resign from\': \'resign from the position\' — bắt buộc giới từ \'from\'." },
    { id: 6, word: "reveal", emoji: "💡", phonetic: "/rɪˈviːl/", meaning: "tiết lộ / cho thấy", example: "The investigation revealed that they had hidden the losses.", example2: "The report revealed serious problems in the process.", collocation: "reveal the truth / reveal details / reveal a secret", audio: "/audio/unit-20/reveal.mp3", l1_interference_vn: "⚠️ \'Reveal\' cần tân ngữ: \'reveal the truth\'. Không dùng \'reveal\' mà không có object." },
    { id: 7, word: "consequence", emoji: "⚡", phonetic: "/ˈkɒnsɪkwəns/", meaning: "hậu quả / kết quả", example: "The consequences of the decision had been severe.", example2: "As a consequence, the company lost several key clients.", collocation: "serious consequences / face the consequences / as a consequence", audio: "/audio/unit-20/consequence.mp3", l1_interference_vn: "⚠️ \'Consequence OF\': \'consequences of climate change\'. Giới từ \'of\', không phải \'from\'." },
    { id: 8, word: "previously", emoji: "⏪", phonetic: "/ˈpriːviəsli/", meaning: "trước đây / trước đó", example: "He had previously worked at a rival company.", example2: "This policy had previously been rejected by the board.", collocation: "previously unknown / as mentioned previously", audio: "/audio/unit-20/previously.mp3", l1_interference_vn: "⚠️ Formal hơn \'before\'. Thường đứng đầu câu: \'Previously, the law required...\'" },
    { id: 9, word: "launch", emoji: "🚀", phonetic: "/lɔːntʃ/", meaning: "ra mắt / khởi động", example: "They had launched the product six months before the competition.", example2: "The startup launched its app last quarter.", collocation: "launch a product / launch a campaign / product launch", audio: "/audio/unit-20/launch.mp3" },
    { id: 10, word: "confirm", emoji: "✅", phonetic: "/kənˈfɜːm/", meaning: "xác nhận", example: "The spokesperson confirmed that the CEO had resigned.", example2: "Please confirm your attendance by Friday.", collocation: "confirm a booking / officially confirm / confirm the news", audio: "/audio/unit-20/confirm.mp3", l1_interference_vn: "⚠️ \'Confirm that...\': \'confirm that the meeting is on Friday\'. Không phải \'confirm to/for\'." },
    { id: 11, word: "acquire", emoji: "💰", phonetic: "/əˈkwaɪər/", meaning: "mua lại / thâu tóm", example: "By 2023, the company had acquired three smaller firms.", example2: "They are planning to acquire a competitor this year.", collocation: "acquire a company / acquisition deal", audio: "/audio/unit-20/acquire.mp3", l1_interference_vn: "⚠️ = có được qua nỗ lực/mua. Không dùng \'acquire to\'. Danh từ: \'acquisition\'." },
    { id: 12, word: "impact", emoji: "💥", phonetic: "/ˈɪmpækt/", meaning: "tác động / ảnh hưởng", example: "The scandal had a major impact on the company's reputation.", example2: "What impact will this decision have on our team?", collocation: "major impact / have an impact on / economic impact", audio: "/audio/unit-20/impact.mp3" },
  ],


  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Tin tức buổi sáng",
      audio: "/audio/unit-20/dialogue_1.mp3",
      desc: "Minh và Lan thảo luận về vụ sáp nhập đã được công bố.",
      lines: [
        { id: "d1-1", speaker: "Lan", text: "Did you hear the news? TechVN just announced a merger with GlobalCorp.", translation: "Bạn có nghe tin không? TechVN vừa thông báo sáp nhập với GlobalCorp." },
        { id: "d1-2", speaker: "Minh", text: "Yes! Apparently they had been negotiating for over a year before the announcement.", translation: "Đúng vậy! Rõ ràng họ đã đàm phán hơn một năm trước khi thông báo." },
        { id: "d1-3", speaker: "Lan", text: "That explains a lot. By the time we heard about it, the deal had already been signed.", translation: "Điều đó giải thích nhiều thứ. Khi chúng ta nghe về nó, thỏa thuận đã được ký rồi." },
        { id: "d1-4", speaker: "Minh", text: "I know. The CEO had previously worked with GlobalCorp's founder, so the connection made sense.", translation: "Tôi biết. CEO trước đây đã từng làm việc với người sáng lập GlobalCorp, vậy nên sự kết nối này có lý." },
        { id: "d1-5", speaker: "Lan", text: "What impact do you think this will have on the market?", translation: "Bạn nghĩ điều này sẽ có tác động gì đến thị trường?" },
        { id: "d1-6", speaker: "Minh", text: "It's hard to say. By next quarter, we'll see whether the merger has created real value or not.", translation: "Khó nói. Đến quý tới, chúng ta sẽ thấy liệu vụ sáp nhập có tạo ra giá trị thực sự hay không." },
      ],
    },
    {
      id: 2,
      title: "Vụ từ chức bất ngờ",
      audio: "/audio/unit-20/dialogue_2.mp3",
      desc: "Cuộc họp sau khi CEO đột ngột từ chức.",
      lines: [
        { id: "d2-1", speaker: "Manager", text: "As you've heard, our CEO resigned this morning. This was unexpected.", translation: "Như các bạn đã nghe, CEO của chúng ta từ chức sáng nay. Điều này thật bất ngờ." },
        { id: "d2-2", speaker: "Tom", text: "Had there been any warning signs? I hadn't noticed anything unusual.", translation: "Có dấu hiệu cảnh báo nào không? Tôi không nhận thấy gì bất thường cả." },
        { id: "d2-3", speaker: "Manager", text: "The board had received his letter last week, but they had asked him to reconsider.", translation: "Hội đồng đã nhận được thư của ông ấy tuần trước, nhưng họ đã yêu cầu ông ấy xem xét lại." },
        { id: "d2-4", speaker: "Lan", text: "So by the time the announcement came, a decision had already been made.", translation: "Vậy là khi thông báo được đưa ra, quyết định đã được đưa ra rồi." },
        { id: "d2-5", speaker: "Manager", text: "Exactly. The company has confirmed that operations will continue as normal. Let's stay focused.", translation: "Đúng vậy. Công ty đã xác nhận rằng hoạt động sẽ tiếp tục bình thường. Chúng ta hãy tiếp tục tập trung." },
      ],
    },
  ],


  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "By the time I arrived the meeting had already started", options: ["By the time I arrived the meeting had already started", "By the time I arrived the meeting already started", "By the time I arrived the meeting has already started", "By the time I arrived the meeting was already starting"], answer: "By the time I arrived the meeting had already started" },
    { id: "lac2", audio_text: "The company had announced the merger before the market opened", options: ["The company announced the merger before the market opened", "The company had announced the merger before the market opened", "The company has announced the merger before the market opened", "The company had announced the merger before the market opens"], answer: "The company had announced the merger before the market opened" },
    { id: "lac3", audio_text: "He had previously worked at a rival company", options: ["He previously worked at a rival company", "He had previously worked at a rival company", "He has previously worked at a rival company", "He was previously working at a rival company"], answer: "He had previously worked at a rival company" },
    { id: "lac4", audio_text: "She confirmed that the CEO had resigned", options: ["She confirmed that the CEO resigned", "She confirmed that the CEO has resigned", "She confirmed that the CEO had resigned", "She confirmed that the CEO was resigned"], answer: "She confirmed that the CEO had resigned" },
    { id: "lac5", audio_text: "By 2023 the company had acquired three smaller firms", options: ["By 2023 the company acquired three smaller firms", "By 2023 the company had acquired three smaller firms", "By 2023 the company has acquired three smaller firms", "By 2023 the company was acquiring three smaller firms"], answer: "By 2023 the company had acquired three smaller firms" },
  ],


  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "By the time {input}, the company had already {input}.",
    level1Placeholder: "Ví dụ: we heard the news — announced the merger...",
    level2Situation: "Bạn đang tóm tắt tin tức kinh doanh trong cuộc họp buổi sáng. Trình bày: (1) Điều gì đã xảy ra? (2) Điều gì đã xảy ra TRƯỚC sự kiện đó? (3) Tác động là gì? (4) Điều gì sẽ xảy ra tiếp theo?",
    level2Hint: "By the time [event], [company/person] had already [action]. Previously, they had [background]. The announcement revealed that [consequence]. Going forward, [prediction].",
  },


  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Past Perfect — Sự Kiện Xảy Ra Trước Trong Quá Khứ",
    rule: "Past Perfect: had + past participle (V3)\n→ Dùng khi muốn nói rõ một hành động xảy ra TRƯỚC một hành động khác trong quá khứ\n\nCông thức:\n(+) I/You/He/She/We/They had finished\n(-) I/You/He/She/We/They hadn't started\n(?) Had you already left?\n\nKết hợp thường gặp:\n→ By the time + Past Simple → Past Perfect\n→ When + Past Simple → Past Perfect (hành động trước)\n→ Before/After + Past Simple → Past Perfect",
    examples: [
      { en: "When I arrived, the meeting had already started. (cuộc họp bắt đầu TRƯỚC khi tôi đến)", vn: "Khi tôi đến nơi, cuộc họp đã bắt đầu rồi." },
      { en: "She had submitted the report before the deadline. (nộp báo cáo TRƯỚC hạn chót)", vn: "Cô ấy đã nộp báo cáo trước thời hạn." },
      { en: "By 2020, they had expanded to 10 countries. (kết quả đạt được TRƯỚC mốc 2020)", vn: "Đến năm 2020, họ đã mở rộng sang 10 quốc gia." },
    ],
    tip: "Mẹo nhớ: Khi kể chuyện có 2 sự kiện quá khứ, sự kiện nào xảy ra TRƯỚC → dùng Past Perfect (had + V3). Sự kiện xảy ra SAU → dùng Past Simple. 'She HAD LEFT when he ARRIVED.' = She left first, then he arrived.",
    vnNote: "⚠️ Lưu ý người Việt: Tiếng Việt dùng 'đã' cho mọi việc trong quá khứ. Trong tiếng Anh cần phân biệt: Past Simple = sự kiện bình thường; Past Perfect = sự kiện xảy ra TRƯỚC một sự kiện khác. Bỏ qua → câu mơ hồ, người nghe không biết thứ tự sự kiện.",
    dialogueExample: {
      speaker: "Minh",
      text: "By the time we heard about it, the deal had already been signed. The CEO had previously worked with GlobalCorp's founder.",
      translation: "Khi chúng tôi nghe về nó, thỏa thuận đã được ký rồi. CEO trước đây đã từng làm việc với người sáng lập GlobalCorp.",
      highlight: "had already been signed (before we heard) | had previously worked (background info)",
    },
    ccq: {
      question: "Câu nào dùng Past Perfect ĐÚNG?",
      options: [
        "When I arrived, the meeting started already.",
        "When I arrived, the meeting had already started.",
        "When I arrived, the meeting has already started.",
        "When I arrived, the meeting was already started.",
      ],
      answer: "When I arrived, the meeting had already started.",
      explanation: "'had already started' = Past Perfect → cuộc họp bắt đầu TRƯỚC khi tôi đến. Đây là cách dùng chuẩn của Past Perfect để chỉ thứ tự sự kiện.",
    },
  },


  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng: 'By the time she called, I ___ the report.'", options: ["finished", "had finished", "have finished", "was finishing"], answer: "had finished" },
    { id: "pq2", type: "multiple-choice", question: "Chọn đúng: 'When we arrived at the airport, the plane ___ already ___.'", options: ["already / departed", "had / already departed", "has / already departed", "was / already departing"], answer: "had / already departed" },
    { id: "pq3", type: "cloze", question: "Điền: 'The CEO ___ (resign) before the scandal became public.'", answer: "had resigned" },
    { id: "pq4", type: "multiple-choice", question: "Câu nào ĐÚNG về thứ tự sự kiện: resign → announce?", options: ["He announced his resignation and then he resigned.", "He had resigned before they announced it publicly.", "He resigned after they had announced it publicly.", "He resigned when they announced it publicly."], answer: "He had resigned before they announced it publicly." },
    { id: "pq5", type: "cloze", question: "Điền: 'By 2025, the company ___ (acquire) five new markets.'", answer: "had acquired" },
  ],


  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "announce", right: "thông báo" },
      { left: "resign", right: "từ chức" },
      { left: "consequence", right: "hậu quả" },
      { left: "acquire", right: "mua lại" },
      { left: "previously", right: "trước đây" },
    ],
  },


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Khi chúng tôi nghe tin, thỏa thuận đã được ký rồi.",
      answer: "When we heard the news, the deal had already been signed.",
    },
    {
      id: "pt-2",
      prompt_vn: "Công ty đã tuyên bố sáp nhập trước khi thị trường biết.",
      answer: "The company had announced the merger before the market knew.",
    },
    {
      id: "pt-3",
      prompt_vn: "Giám đốc đã từ chức sau khi điều tra kết thúc.",
      answer: "The director had resigned after the investigation ended.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc20-1",
      sentence: "By the time he arrived, she already left.",
      errorWord: "already left",
      correction: "had already left",
      explanation_vn: "Past Perfect: hành động xảy ra TRƯỚC → 'had + past participle'. 'Had already left' = đã rời đi rồi.",
    },
    {
      id: "sc20-2",
      sentence: "When I got home, I realized I forgot my keys.",
      errorWord: "forgot",
      correction: "had forgotten",
      explanation_vn: "'Realized' (quá khứ đơn) xảy ra sau → 'forgetting' xảy ra trước → cần Past Perfect 'had forgotten'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la20-1",
      audio_text: "By the time she called I had already left.",
      prompt_vn: "Khi cô ấy gọi tôi đã rời đi rồi.",
      words: ["By", "the", "time", "she", "called", "I", "had", "already", "left", ".", "left", "gone"],
      answer: "By the time she called I had already left .",
    },
    {
      id: "la20-2",
      audio_text: "When we arrived the meeting had already started.",
      prompt_vn: "Khi chúng tôi đến cuộc họp đã bắt đầu rồi.",
      words: ["When", "we", "arrived", "the", "meeting", "had", "already", "started", ".", "began", "start"],
      answer: "When we arrived the meeting had already started .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Khi tôi đến, cuộc họp đã bắt đầu rồi.",
      words: ["When", "I", "arrived", ",", "the", "meeting", "had", "already", "started", ".", "would", "could"],
      answer: "When I arrived , the meeting had already started .",
    },
    {
      id: "wb2",
      prompt_vn: "Công ty đã công bố kết quả trước khi thị trường mở cửa.",
      words: ["The", "company", "had", "announced", "the", "results", "before", "the", "market", "opened", ".", "would", "could"],
      answer: "The company had announced the results before the market opened .",
    },
    {
      id: "wb3",
      prompt_vn: "Đến năm 2024, họ đã mua lại ba công ty nhỏ hơn.",
      words: ["By", "2024", ",", "they", "had", "acquired", "three", "smaller", "companies", ".", "would", "could"],
      answer: "By 2024 , they had acquired three smaller companies .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s20-1", prompt_vn: "Khi tôi đến, cuộc họp đã bắt đầu rồi.", words: ["When", "I", "arrived", ",", "the", "meeting", "had", "already", "started", "."], answer: "When I arrived , the meeting had already started ." },
    { id: "s20-2", prompt_vn: "Công ty đã công bố kết quả trước khi thị trường mở cửa.", words: ["The", "company", "had", "announced", "the", "results", "before", "the", "market", "opened", "."], answer: "The company had announced the results before the market opened ." },
    { id: "s20-3", prompt_vn: "Đến năm 2024, họ đã mua lại ba công ty nhỏ hơn.", words: ["By", "2024", ",", "they", "had", "acquired", "three", "smaller", "companies", "."], answer: "By 2024 , they had acquired three smaller companies ." },
  ],


  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch: 'Khi chúng tôi nghe tin, thỏa thuận đã được ký rồi.'", options: ["When we heard the news, the deal was already signed.", "When we heard the news, the deal had already been signed.", "When we heard the news, the deal has already been signed.", "When we heard the news, the deal already signed."], answer: "When we heard the news, the deal had already been signed." },
    { id: "fq2", type: "cloze", question: "Điền: 'She ___ (send) the email before he ___ (ask) for it.'", answer: "had sent / asked" },
    { id: "fq3", type: "multiple-choice", question: "Câu nào kết hợp Past Perfect + Past Simple ĐÚNG nhất?", options: ["By the time the report was due, she finished it.", "By the time the report was due, she had finished it.", "By the time the report was due, she has finished it.", "By the time the report was due, she was finishing it."], answer: "By the time the report was due, she had finished it." },
    { id: "fq4", type: "translate", question: "Dịch: 'CEO đã từ chức trước khi vụ bê bối trở nên công khai.'", answer: "The CEO had resigned before the scandal became public." },
    { id: "fq5", type: "multiple-choice", question: "Chọn câu diễn đạt đúng thứ tự: (1) investigated → (2) revealed", options: ["They revealed the results and then investigated.", "After they investigated, they revealed the results.", "They had revealed the results before investigating.", "They revealed the results before they had investigated."], answer: "After they investigated, they revealed the results." },
    { id: "q-ex1", type: "multiple-choice", question: "Bị động hiện tại đơn: cấu trúc đúng:", options: ["is + V3", "are + Ving", "was + V3", "be + V-ing"], answer: "is + V3" },
    { id: "q-ex2", type: "multiple-choice", question: "Chuyển sang bị động: 'Reporters write the news.'", options: ["The news is written by reporters.", "The news was written by reporters.", "The news are written by reporters.", "The news write by reporters."], answer: "The news is written by reporters." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'The building ___ constructed last year.' (bị động QK)", answer: "was" },
    { id: "q-ex4", type: "multiple-choice", question: "'According to the report' nghĩa là:", options: ["Mặc dù có báo cáo", "Theo báo cáo", "Trái với báo cáo", "Ngoài báo cáo"], answer: "Theo báo cáo" },
    { id: "q-ex5", type: "multiple-choice", question: "Headline tin tức viết theo kiểu nào?", options: ["Câu đầy đủ mọi từ", "Rút gọn: bỏ articles và to be", "Chỉ dùng quá khứ đơn", "Luôn dùng bị động"], answer: "Rút gọn: bỏ articles và to be" },
    { id: "q-ex6", type: "multiple-choice", question: "'Deny' nghĩa là:", options: ["Xác nhận", "Phủ nhận", "Báo cáo", "Đề xuất"], answer: "Phủ nhận" },
    { id: "q-ex7", type: "translate", question: "Dịch: 'Bệnh viện mới sẽ được xây dựng.'", answer: "A new hospital will be built." },
  ],


  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr20-1", question: "Ôn tập Unit 19 — Chọn Past Continuous đúng: 'I ___ the report when my boss called.'", options: ["wrote", "was writing", "had written", "have written"], answer: "was writing", type: "multiple-choice" },
    { id: "cr20-2", question: "Ôn tập Unit 19 — Điền: 'While she ___ (present), the projector ___ (stop) working.'", options: [], answer: "was presenting / stopped", type: "cloze" },
    { id: "cr20-3", question: "Ôn tập A2 — Câu nào dùng Present Perfect đúng?", options: ["I worked here since 2020.", "I've worked here since 2020.", "I was working here since 2020.", "I work here since 2020."], answer: "I've worked here since 2020.", type: "multiple-choice" },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "politics /ˈpɒlɪtɪks/",
    description: "Stress trong từ tin tức/chính trị — hay bị stress sai",
    examples: [
        { word: "politics", ipa: "/ˈpɒlɪtɪks/", tip: "Stress âm 1: POL-i-tics — 3 âm tiết" },
        { word: "economy", ipa: "/ɪˈkɒnəmi/", tip: "Stress âm 2: e-CON-o-my — 4 âm tiết, âm 3 là schwa" },
    ],
    minimalPairs: [
        ["POL-i-tics (đúng)", "po-LIT-ics (sai)"],
        ["e-CON-o-my (đúng)", "e-co-NO-my (sai)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "By the time I arrived, it had already started", vn: "Khi tôi đến, nó đã bắt đầu rồi" },
      { en: "She had submitted the report before the deadline", vn: "Cô ấy đã nộp báo cáo trước hạn chót" },
      { en: "They had negotiated for a year before announcing the deal", vn: "Họ đã đàm phán một năm trước khi thông báo thỏa thuận" },
      { en: "Had you heard the news before the meeting?", vn: "Bạn đã nghe tin trước cuộc họp chưa?" },
      { en: "The CEO had previously worked at a competitor", vn: "CEO trước đây đã từng làm việc ở đối thủ cạnh tranh" },
      { en: "By 2025, the company had expanded to Asia", vn: "Đến 2025, công ty đã mở rộng sang châu Á" },
      { en: "She hadn't seen the report before the presentation", vn: "Cô ấy chưa xem báo cáo trước khi thuyết trình" },
      { en: "The decision had been made before we were consulted", vn: "Quyết định đã được đưa ra trước khi chúng tôi được tham khảo" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit20-reading-1",
    title: "This Week in Tech News",
    title_vn: "Đọc đoạn tin tức công nghệ",
    level: "B1" as const,
    text:
      "This week, several major tech companies announced significant changes. " +
      "A leading smartphone manufacturer has just launched a new foldable phone. " +
      "According to early reviews, it is thinner and lighter than previous models. " +
      "Meanwhile, a social media platform has reportedly introduced new privacy settings " +
      "following pressure from regulators in Europe. " +
      "In economic news, a major e-commerce company announced that it is planning to hire " +
      "50,000 new employees across Southeast Asia. " +
      "Analysts say this reflects the rapid growth of online shopping in the region. " +
      "In Vietnam, technology investment has increased by 40% this year, " +
      "according to a report published yesterday. " +
      "Experts believe this trend will continue into next year.",
    questions: [
      {
        id: "u20r-q1",
        question_vn: "Nhà sản xuất điện thoại thông minh vừa ra mắt loại điện thoại gì?",
        options: [
          "A new tablet",
          "A new smartwatch",
          "A new foldable phone",
          "A new laptop",
        ],
        answer: "A new foldable phone",
        explanation_vn: "'A leading smartphone manufacturer has just launched a new foldable phone.'",
      },
      {
        id: "u20r-q2",
        question_vn: "Tại sao mạng xã hội phải thay đổi cài đặt quyền riêng tư?",
        options: [
          "To attract more users",
          "Following pressure from regulators in Europe",
          "To compete with rivals",
          "Because of a data breach",
        ],
        answer: "Following pressure from regulators in Europe",
        explanation_vn: "'following pressure from regulators in Europe.'",
      },
      {
        id: "u20r-q3",
        question_vn: "Công ty thương mại điện tử có kế hoạch tuyển dụng bao nhiêu nhân viên?",
        options: ["10,000", "20,000", "50,000", "100,000"],
        answer: "50,000",
        explanation_vn: "'it is planning to hire 50,000 new employees across Southeast Asia.'",
      },
      {
        id: "u20r-q4",
        question_vn: "Đầu tư công nghệ ở Việt Nam tăng bao nhiêu % trong năm nay?",
        options: ["20%", "30%", "40%", "50%"],
        answer: "40%",
        explanation_vn: "'technology investment has increased by 40% this year.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Thảo luận xu hướng công nghệ và tuyển dụng trong họp kinh doanh",
      focus: "launch new product, hire employees, investment increase, privacy changes",
      context: "Họp chiến lược với team marketing / HR về kế hoạch mở rộng ở VN",
      l1Note: "⚠️ 'has just launched', 'is planning to hire 50,000', 'has increased by 40%'.",
      example: "A manufacturer has launched a new foldable phone. The company is planning to hire 50,000 across SE Asia."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "F1C8IaAFgPo",
};

export default unit20;
