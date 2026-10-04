import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-18 — A2 Review & Real-life Communication  (A2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit18: UnitData = {
  unitId: "unit-18",
  title: "Unit 18: A2 Review & Real-life Communication",
  level: "A2",
  xp: 120,
  estimatedTime: 55,
  description: "Ôn tập toàn bộ ngữ pháp và từ vựng A2. Tổng hợp 4 kỹ năng: nói về quá khứ, tương lai, so sánh và kinh nghiệm.",
  badgeName: "Chuyên Gia A2",
  badgeEmoji: "🎓",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Buổi họp nhóm quốc tế cuối năm. Bạn cần báo cáo về những gì đã đạt được (Past Simple), những kế hoạch sắp tới (will/going to), so sánh kết quả với năm ngoái (comparative), và chia sẻ kinh nghiệm của bạn (Present Perfect).",
  learningOutcomes: [
    "Kết hợp thành thạo 4 thì quan trọng của A2",
    "Giao tiếp tự tin trong cuộc họp quốc tế",
    "Chia sẻ thành tích, kế hoạch và kinh nghiệm bằng tiếng Anh"
  ],

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "📊", en: "Last year, we achieved excellent results.", vn: "Năm ngoái, chúng tôi đã đạt được kết quả xuất sắc.", context: "Báo cáo thành tích quá khứ" },
    { emoji: "🚀", en: "Next quarter, we're going to launch three new products.", vn: "Quý tới, chúng tôi sẽ ra mắt ba sản phẩm mới.", context: "Kế hoạch tương lai" },
    { emoji: "🌟", en: "I've worked in this industry for over five years.", vn: "Tôi đã làm trong ngành này hơn năm năm.", context: "Kinh nghiệm Present Perfect" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Trong các cuộc họp quốc tế, người Việt thường khiêm tốn hơn so với văn hóa phương Tây. Tuy nhiên, khi nói tiếng Anh trong môi trường chuyên nghiệp quốc tế, hãy tự tin chia sẻ thành tích của mình. Sử dụng <span class=\"text-emerald-400 font-semibold\">'We achieved...'</span> thay vì <span class=\"text-emerald-400 font-semibold\">'I think we did OK...'</span> để thể hiện sự chuyên nghiệp.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "achieved", emoji: "🏆", phonetic: "/əˈtʃiːvd/", meaning: "đã đạt được", example: "We achieved 120% of our sales target.", example2: "She achieved remarkable results.", collocation: "achieved our goal / achieved success", audio: "/audio/unit-18/achieved.mp3", l1_interference_vn: "⚠️ 'Achieve' = đạt được (bằng nỗ lực). 'Achieve a goal/target'. Không nhầm 'achieve' với 'receive' (nhận được)." },
    { id: 2, word: "report", emoji: "📋", phonetic: "/rɪˈpɔːrt/", meaning: "báo cáo", example: "I will present my annual report.", example2: "Have you finished the report yet?", collocation: "annual report / submit a report", audio: "/audio/unit-18/report.mp3", l1_interference_vn: "⚠️ 'Report' (n/v): 'a report on...' hoặc 'report on...'. 'Present a report' (không phải 'say a report')." },
    { id: 3, word: "quarter", emoji: "📅", phonetic: "/ˈkwɔːrtər/", meaning: "quý (3 tháng)", example: "Sales increased in the third quarter.", example2: "Our targets for next quarter are higher.", collocation: "next quarter / quarterly review", audio: "/audio/unit-18/quarter.mp3", l1_interference_vn: "⚠️ 'Quarter' = quý (3 tháng). Q1=Jan-Mar, Q2=Apr-Jun. 'In the first quarter' — 'in', không phải 'at'." },
    { id: 4, word: "increased", emoji: "📈", phonetic: "/ɪnˈkriːst/", meaning: "đã tăng lên", example: "Revenue increased by 15% last year.", example2: "Our team's performance has increased.", collocation: "increased by / increased significantly", audio: "/audio/unit-18/increased.mp3", l1_interference_vn: "⚠️ 'Increase BY X%' (tăng X%). 'Increase TO X%' (tăng lên mức X%). Hai giới từ khác nhau hoàn toàn." },
    { id: 5, word: "target", emoji: "🎯", phonetic: "/ˈtɑːrɡɪt/", meaning: "mục tiêu / chỉ tiêu", example: "We met our sales target this month.", example2: "My target is to finish by Friday.", collocation: "meet a target / set a target", audio: "/audio/unit-18/target.mp3", l1_interference_vn: "⚠️ 'Target' = mục tiêu cụ thể. 'Hit/reach/meet a target' — các collocation phổ biến trong business English." },
    { id: 6, word: "compared to", emoji: "⚖️", phonetic: "/kəmˈpeərd tuː/", meaning: "so với", example: "Sales are higher compared to last year.", example2: "Compared to my first job, this is much better.", collocation: "compared to last year / compared with", audio: "/audio/unit-18/compared_to.mp3", l1_interference_vn: "⚠️ 'Compared TO' (so với) — giới từ chuẩn trong business. 'Compared WITH' cũng đúng nhưng ít formal hơn." },
    { id: 7, word: "challenge", emoji: "💪", phonetic: "/ˈtʃælɪndʒ/", meaning: "thách thức", example: "The biggest challenge was the pandemic.", example2: "I enjoy a good challenge at work.", collocation: "face a challenge / overcome a challenge", audio: "/audio/unit-18/challenge.mp3" , l1_interference_vn: "⚠️ Âm /ˈtʃælɪndʒ/ — 'ch' = /tʃ/. Vừa là danh từ vừa động từ. 'Face a challenge'." },
    { id: 8, word: "successful", emoji: "✅", phonetic: "/səkˈsesfəl/", meaning: "thành công", example: "The campaign was very successful.", example2: "She had a successful career.", collocation: "very successful / highly successful", audio: "/audio/unit-18/successful.mp3", l1_interference_vn: "⚠️ Stress: suc-CESS-ful (âm 2). 'Successful' (adj) vs 'success' (n) vs 'succeed' (v) — ba dạng khác nhau." },
    { id: 9, word: "strategy", emoji: "♟️", phonetic: "/ˈstrætɪdʒi/", meaning: "chiến lược", example: "We will change our marketing strategy.", example2: "A good strategy leads to success.", collocation: "business strategy / develop a strategy", audio: "/audio/unit-18/strategy.mp3", l1_interference_vn: "⚠️ Stress: STRAT-e-gy (âm 1). Số nhiều: 'strategies'. 'Develop a strategy' là collocation business chuẩn." },
    { id: 10, word: "progress", emoji: "🔄", phonetic: "/ˈprɒɡres/", meaning: "tiến độ / tiến bộ", example: "How is the project progress?", example2: "I've made great progress in English.", collocation: "make progress / track progress", audio: "/audio/unit-18/progress.mp3" , l1_interference_vn: "⚠️ PRO-gress (danh từ) vs pro-GRESS (động từ). 'Make progress' — không có 'a'." },
    { id: 11, word: "opportunity", emoji: "🌟", phonetic: "/ˌɒpərˈtjuːnɪti/", meaning: "cơ hội", example: "This is a great opportunity to grow.", example2: "I hope to get an opportunity to work abroad.", collocation: "take an opportunity / miss an opportunity", audio: "/audio/unit-18/opportunity.mp3" , l1_interference_vn: "⚠️ Stress: op-por-TU-ni-ty (âm 3). 5 âm tiết. 'An opportunity TO do something'." },
    { id: 12, word: "fluent", emoji: "🗣️", phonetic: "/ˈfluːənt/", meaning: "thành thạo / trôi chảy", example: "I'm becoming more fluent in English.", example2: "She speaks French fluently.", collocation: "speak fluently / become fluent", audio: "/audio/unit-18/fluent.mp3" , l1_interference_vn: "⚠️ Stress: FLU-ent (âm 1). 'Fluent IN English' — giới từ 'in'. 'Speak fluently' (trạng từ)." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Báo cáo cuối năm",
      audio: "/audio/unit-18/dialogue_1.mp3",
      desc: "Minh trình bày báo cáo cuối năm kết hợp tất cả thì A2.",
      lines: [
        { id: "d1-1", speaker: "Manager", text: "Minh, can you give us a quick year-end report?", translation: "Minh, bạn có thể cho chúng tôi biết tóm tắt báo cáo cuối năm không?" },
        { id: "d1-2", speaker: "Minh", text: "Of course! Last year, we achieved 115% of our annual target. Revenue increased by 20% compared to the previous year.", translation: "Được chứ! Năm ngoái, chúng tôi đã đạt 115% chỉ tiêu năm. Doanh thu tăng 20% so với năm trước." },
        { id: "d1-3", speaker: "Manager", text: "Excellent! And what about challenges?", translation: "Tuyệt vời! Còn những thách thức thì sao?" },
        { id: "d1-4", speaker: "Minh", text: "The biggest challenge was finding new clients. But we've already developed a new strategy for next year.", translation: "Thách thức lớn nhất là tìm khách hàng mới. Nhưng chúng tôi đã phát triển một chiến lược mới cho năm tới." },
        { id: "d1-5", speaker: "Manager", text: "What are your plans for next quarter?", translation: "Kế hoạch của bạn cho quý tới là gì?" },
        { id: "d1-6", speaker: "Minh", text: "We're going to launch two new products and expand to three new markets. I will personally lead the team. I've never been more confident!", translation: "Chúng tôi sẽ ra mắt hai sản phẩm mới và mở rộng sang ba thị trường mới. Cá nhân tôi sẽ dẫn dắt nhóm. Tôi chưa bao giờ tự tin đến vậy!" },
      ]
    },
    {
      id: 2,
      title: "Chia sẻ kinh nghiệm và kế hoạch",
      audio: "/audio/unit-18/dialogue_2.mp3",
      desc: "Tom và Lan nói chuyện về hành trình học tiếng Anh và kế hoạch tương lai.",
      lines: [
        { id: "d2-1", speaker: "Tom", text: "Lan, your English has improved so much! How long have you been studying?", translation: "Lan, tiếng Anh của bạn tiến bộ nhiều quá! Bạn đã học bao lâu rồi?" },
        { id: "d2-2", speaker: "Lan", text: "I've studied with AtoEnglish for six months. It's much better than my old method!", translation: "Tôi đã học với AtoEnglish được sáu tháng. Tốt hơn rất nhiều so với phương pháp cũ của tôi!" },
        { id: "d2-3", speaker: "Tom", text: "That's fantastic! What did you do differently?", translation: "Tuyệt vời! Bạn đã làm khác đi điều gì?" },
        { id: "d2-4", speaker: "Lan", text: "I focused on real situations, not just grammar. I've already completed 18 units and I feel confident now.", translation: "Tôi tập trung vào tình huống thực tế, không chỉ học ngữ pháp. Tôi đã hoàn thành 18 unit và cảm thấy tự tin rồi." },
        { id: "d2-5", speaker: "Tom", text: "That's impressive! Are you going to continue to B1?", translation: "Thật ấn tượng! Bạn có định tiếp tục lên B1 không?" },
        { id: "d2-6", speaker: "Lan", text: "Yes! I'm going to start B1 next month. My goal is to become fluent enough to lead international meetings. I hope you'll be there to support me!", translation: "Có! Tôi định bắt đầu B1 tháng tới. Mục tiêu của tôi là đủ thành thạo để dẫn dắt các cuộc họp quốc tế. Tôi hy vọng bạn sẽ ủng hộ tôi nhé!" },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "Revenue increased by twenty percent compared to last year", options: ["Revenue increased by twenty percent compared to last year", "Revenue increased twenty percent compared to last year", "Revenue increased by twenty percent compare to last year", "Revenue was increased by twenty percent compared to last year"], answer: "Revenue increased by twenty percent compared to last year" },
    { id: "lac2", audio_text: "We're going to launch two new products next quarter", options: ["We going to launch two new products next quarter", "We're going to launch two new products next quarter", "We will going to launch two new products next quarter", "We're going launch two new products next quarter"], answer: "We're going to launch two new products next quarter" },
    { id: "lac3", audio_text: "I've studied English for six months", options: ["I studied English for six months", "I've studied English for six months", "I've studied English since six months", "I have study English for six months"], answer: "I've studied English for six months" },
    { id: "lac4", audio_text: "The campaign was more successful than last year", options: ["The campaign was more successful than last year", "The campaign was successful more than last year", "The campaign was more successfuler than last year", "The campaign was most successful than last year"], answer: "The campaign was more successful than last year" },
    { id: "lac5", audio_text: "I've never been more confident", options: ["I've never been more confident", "I never been more confident", "I've never be more confident", "I haven't never been more confident"], answer: "I've never been more confident" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "This year, I achieved {input}. Next year, I'm going to {input}.",
    level1Placeholder: "Ví dụ: my sales target — expand to new markets...",
    level2Situation: "Bạn đang thuyết trình trong cuộc họp tổng kết cuối năm với đội nhóm quốc tế. Báo cáo: (1) những gì đã đạt được năm vừa rồi, (2) kế hoạch năm tới, (3) so sánh kết quả với năm trước, (4) kinh nghiệm bạn đã có được.",
    level2Hint: "Last year, we achieved [result]. Revenue [increased/decreased] by [%] compared to [time period]. I've [experience/accomplishment] since [time]. Next year, we're going to [plan]. I hope we will [prediction].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "A2 Grammar Review — 4 thì quan trọng",
    rule: "Past Simple: V-ed / irregular (yesterday, last...)\nFuture going to: am/is/are + going to + V (planned)\nFuture will: will + V (prediction/spontaneous)\nPresent Perfect: have/has + past participle (experience)",
    examples: [
      { en: "We achieved our target last year. (Past Simple)", vn: "Năm ngoái chúng tôi đã đạt chỉ tiêu." },
      { en: "We're going to expand next quarter. (Future going to)", vn: "Quý tới chúng tôi sẽ mở rộng." },
      { en: "Revenue will increase. (Future will)", vn: "Doanh thu sẽ tăng." },
      { en: "I've worked here for 5 years. (Present Perfect)", vn: "Tôi đã làm việc ở đây 5 năm." },
    ],
    tip: "Bí quyết phân biệt 4 thì: (1) Past Simple = xong rồi, có thời điểm cụ thể. (2) Going to = đã lên kế hoạch. (3) Will = vừa quyết định / dự đoán. (4) Present Perfect = đã từng / vẫn còn liên quan hiện tại.",
    vnNote: "⚠️ Lưu ý tổng hợp: Bốn thì chính — người Việt thường nhầm vì tiếng Việt không chia thì. Ghi nhớ: yesterday→Past Simple, now→Present Continuous, since/for→Present Perfect, always/every day→Present Simple.",
    dialogueExample: {
      speaker: "Minh",
      text: "Last year, we achieved 115%. We're going to launch new products. I've never been more confident!",
      translation: "Năm ngoái chúng tôi đạt 115%. Chúng tôi sẽ ra mắt sản phẩm mới. Tôi chưa bao giờ tự tin đến vậy!",
      highlight: "achieved (past) / going to launch (future plan) / 've never been (present perfect)",
    },
    ccq: {
      question: "Câu nào dùng ĐÚNG TẤT CẢ các thì?",
      options: [
        "Last year I achieved my goal. Next year I will achieving more.",
        "Last year I achieved my goal. I've been in this role since 2020. Next year I'm going to do better. ✅",
        "Last year I have achieved my goal. Next year I'm going to do better.",
        "Last year I achieved my goal. Since then I working harder.",
      ],
      answer: "Last year I achieved my goal. I've been in this role since 2020. Next year I'm going to do better. ✅",
      explanation: "Past Simple (achieved - thời điểm cụ thể) + Present Perfect (since 2020 - tính đến hiện tại) + Going to (kế hoạch đã lên sẵn) — ba thì kết hợp đúng hoàn toàn.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng thì: 'We ___ our sales target last quarter.' (đã đạt - quá khứ cụ thể)", options: ["have achieved", "achieved", "are achieving", "achieve"], answer: "achieved" },
    { id: "pq2", type: "multiple-choice", question: "Chọn đúng: 'She ___ (kế hoạch sẵn) study for the IELTS next year.'", options: ["will study", "is going to study", "studies", "was going to study"], answer: "is going to study" },
    { id: "pq3", type: "cloze", question: "Điền: 'This year's result is better ___ last year's.' (so sánh)", answer: "than" },
    { id: "pq4", type: "multiple-choice", question: "Câu Present Perfect đúng: 'I ___ in sales for 7 years.'", options: ["work", "worked", "have worked", "am working"], answer: "have worked" },
    { id: "pq5", type: "cloze", question: "Điền: 'Revenue ___ (increase) by 20% compared to last year.'", answer: "increased" },
  ],


  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "target", right: "mục tiêu" },
      { left: "challenge", right: "thách thức" },
      { left: "successful", right: "thành công" },
      { left: "strategy", right: "chiến lược" },
      { left: "opportunity", right: "cơ hội" },
    ],
  },


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Năm ngoái doanh thu tăng 20% so với năm trước.",
      answer: "Last year revenue increased by 20% compared to the previous year.",
    },
    {
      id: "pt-2",
      prompt_vn: "Chúng tôi đã đạt mục tiêu quý này.",
      answer: "We achieved the target this quarter.",
    },
    {
      id: "pt-3",
      prompt_vn: "Báo cáo cho thấy doanh số tăng mạnh.",
      answer: "The report shows that sales increased significantly.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc18-1",
      sentence: "I'd like order a coffee, please.",
      errorWord: "order",
      correction: "to order",
      explanation_vn: "'I'd like TO + infinitive'. Sau 'would like' cần 'to': 'I'd like TO order'. Khác với 'enjoy + V-ing'.",
    },
    {
      id: "sc18-2",
      sentence: "Can I have some informations about the flight?",
      errorWord: "informations",
      correction: "information",
      explanation_vn: "'Information' là danh từ không đếm được — không có dạng số nhiều. Không nói 'informations'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la18-1",
      audio_text: "I would like to order a large coffee please.",
      prompt_vn: "Tôi muốn gọi một cốc cà phê lớn.",
      words: ["I", "would", "like", "to", "order", "a", "large", "coffee", "please", ".", "want", "ordering"],
      answer: "I would like to order a large coffee please .",
    },
    {
      id: "la18-2",
      audio_text: "She is going to take the IELTS exam next month.",
      prompt_vn: "Cô ấy sẽ thi IELTS vào tháng tới.",
      words: ["She", "is", "going", "to", "take", "the", "IELTS", "exam", "next", "month", ".", "will", "takes"],
      answer: "She is going to take the IELTS exam next month .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Chúng tôi đã đạt 120% chỉ tiêu doanh số.",
      words: ["We", "achieved", "120%", "of", "our", "sales", "target", ".", "have", "has"],
      answer: "We achieved 120% of our sales target .",
    },
    {
      id: "wb2",
      prompt_vn: "Doanh thu tăng 15% so với năm ngoái.",
      words: ["Revenue", "increased", "by", "15%", "compared", "to", "last", "year", ".", "have", "has"],
      answer: "Revenue increased by 15% compared to last year .",
    },
    {
      id: "wb3",
      prompt_vn: "Tôi đang ngày càng trôi chảy hơn tiếng Anh.",
      words: ["I", "am", "becoming", "more", "fluent", "in", "English", ".", "have", "has"],
      answer: "I am becoming more fluent in English .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s18-1",
      prompt_vn: "Chúng tôi đã đạt 120% chỉ tiêu doanh số.",
      words: ["We", "achieved", "120%", "of", "our", "sales", "target", "."],
      answer: "We achieved 120% of our sales target .",
    },
    {
      id: "s18-2",
      prompt_vn: "Doanh thu tăng 15% so với năm ngoái.",
      words: ["Revenue", "increased", "by", "15%", "compared", "to", "last", "year", "."],
      answer: "Revenue increased by 15% compared to last year .",
    },
    {
      id: "s18-3",
      prompt_vn: "Tôi đang ngày càng trôi chảy hơn tiếng Anh.",
      words: ["I", "am", "becoming", "more", "fluent", "in", "English", "."],
      answer: "I am becoming more fluent in English .",
    },
  ],


  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch: 'Năm ngoái doanh thu tăng 20% so với năm trước.'", options: ["Last year revenue increases 20% compared previous year.", "Last year revenue increased by 20% compared to the previous year.", "Last year revenue has increased 20% compare to previous year.", "Revenue last year increased by 20% compare previous year."], answer: "Last year revenue increased by 20% compared to the previous year.", explanation_vn: "Tường thuật số liệu: 'increase BY X%'. 'Compared TO the previous year'. Simple Past 'increased' vì có mốc 'last year'. KHÔNG 'has increased' (không có mốc cụ thể)." },
    { id: "fq2", type: "cloze", question: "Điền: 'I ___ (work) in this company since 2021.'", answer: "have worked" },
    { id: "fq3", type: "multiple-choice", question: "Câu nào nói đúng về kế hoạch ĐÃ LÊN SẴN?", options: ["I will probably travel next month.", "I'm going to travel next month. ✅", "I travel next month.", "I travelled next month."], answer: "I'm going to travel next month. ✅", explanation_vn: "'Going to + infinitive' cho kế hoạch đã có sẵn. 'Will' cho quyết định tức thời. 'I'm going to travel' = đã lên kế hoạch rồi." },
    { id: "fq4", type: "translate", question: "Dịch sang tiếng Anh: 'Tôi đã học tiếng Anh được sáu tháng và tôi đang trở nên thành thạo hơn.'", answer: "I've studied English for six months and I'm becoming more fluent." },
    { id: "fq5", type: "multiple-choice", question: "Kết hợp đúng: Kể về kinh nghiệm + kế hoạch tương lai", options: ["I worked here for 5 years. I will going to expand next year.", "I've worked here for 5 years. I'm going to expand next year. ✅", "I've worked here since 5 years. I will expanding next year.", "I work here for 5 years. I'm going to expanding next year."], answer: "I've worked here for 5 years. I'm going to expand next year. ✅", explanation_vn: "Present Perfect cho kinh nghiệm: 'I've worked for 5 years'. 'Going to' cho kế hoạch: 'I'm going to expand'. Kết hợp hai thì đúng ngữ cảnh." },
    { id: "q-ex1", type: "multiple-choice", question: "Đâu là câu Present Perfect đúng?", options: ["She have been to Paris.", "She has been to Paris.", "She was been to Paris.", "She did been to Paris."], answer: "She has been to Paris.", explanation_vn: "'She has been to Paris' — she (số ít) → 'has'. Past participle của 'be/go' (đã đến, đã trải nghiệm) là 'been'. KHÔNG 'have been' với she." },
    { id: "q-ex2", type: "multiple-choice", question: "Câu tương lai với kế hoạch định sẵn:", options: ["I will go shopping (kế hoạch).", "I'm going to go shopping tomorrow.", "I go shopping tomorrow.", "I am going shopping was planned."], answer: "I'm going to go shopping tomorrow.", explanation_vn: "'Going to' cho kế hoạch cụ thể đã định sẵn. 'Will' cho dự đoán hoặc quyết định tức thời không có kế hoạch trước." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'It's the ___ film I've ever seen!'", answer: "best" },
    { id: "q-ex4", type: "multiple-choice", question: "Câu Quá khứ đơn đúng:", options: ["She goed to work.", "She gone to work.", "She went to work.", "She going to work."], answer: "She went to work.", explanation_vn: "Simple Past bất quy tắc: go → went → gone. 'Went' dùng cho quá khứ đơn. KHÔNG 'goed' (không có). 'Gone' chỉ dùng sau have/has." },
    { id: "q-ex5", type: "multiple-choice", question: "'Make a decision' hay 'do a decision'?", options: ["do a decision", "make a decision", "have a decision", "take a decision"], answer: "make a decision", explanation_vn: "Collocation đúng: 'make a decision'. KHÔNG 'do a decision'. Với 'make': make a mistake, make a plan, make progress, make an effort." },
    { id: "q-ex6", type: "multiple-choice", question: "Câu so sánh nhất đúng:", options: ["This is the more expensive.", "This is the most expensive.", "This is most expensive.", "This is expensivest."], answer: "This is the most expensive.", explanation_vn: "Superlative: 'THE most expensive'. BẮT BUỘC có 'the'. KHÔNG 'more expensive' (comparative) hay bỏ 'the'. Luôn: 'the + most + adj'." },
    { id: "q-ex7", type: "translate", question: "Dịch: 'Kế hoạch của bạn là gì?'", answer: "What are your plans?" },
  ],


  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr18-1",
      question: "Câu nào dùng Present Perfect ĐÚNG? (Unit 17)",
      options: [
        "I have went to London last year.",
        "I went to London last year.",
        "I have been to London.",
        "I am going to London before.",
      ],
      answer: "I have been to London.",
      type: "multiple-choice",
    },
    {
      id: "cr18-2",
      question: "Điền từ: 'She has ___ finished the project.' (Unit 17: Present Perfect + adverb)",
      options: [],
      answer: "already",
      type: "cloze",
    },
    {
      id: "cr18-3",
      question: "Bạn đã bao giờ làm việc ở nước ngoài chưa? (Unit 17)",
      options: [],
      answer: "Have you ever worked abroad?",
      type: "translate",
    },
    {
      id: "cr18-4",
      question: "Chọn thì đúng: 'I ___ here since 2020.' (Unit 17: Present Perfect + since)",
      options: ["work", "worked", "am working", "have worked"],
      answer: "have worked",
      type: "multiple-choice",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "noun vs verb stress",
    description: "Ôn tập: stress thay đổi nghĩa — noun vs verb pairs rất phổ biến trong A2",
    examples: [
        { word: "progress (n)", ipa: "/ˈprɒɡrəs/", tip: "Danh từ: PRO-gress — stress âm 1" },
        { word: "progress (v)", ipa: "/prəˈɡrɛs/", tip: "Động từ: pro-GRESS — stress âm 2" },
    ],
    minimalPairs: [
        ["REcord (n)", "reCORD (v)"],
        ["PROtest (n)", "proTEST (v)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I work every day", vn: "Tôi làm việc mỗi ngày" },
      { en: "She is working now", vn: "Cô ấy đang làm việc" },
      { en: "He worked yesterday", vn: "Anh ấy đã làm việc hôm qua" },
      { en: "We have worked here for years", vn: "Chúng tôi đã làm việc nhiều năm" },
      { en: "Did you finish?", vn: "Bạn đã hoàn thành chưa?" },
      { en: "Have you ever done this?", vn: "Bạn đã bao giờ làm điều này chưa?" },
      { en: "I am going to present", vn: "Tôi sẽ thuyết trình" },
      { en: "They didn't attend", vn: "Họ đã không tham dự" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit18-reading-1",
    title: "The Year-End Review",
    title_vn: "Buổi Đánh Giá Cuối Năm",
    level: "A2" as const,
    text: `Last year, Minh's team achieved 120% of their sales target. Revenue increased by 18% compared to the previous year, which was very successful. The biggest challenge was the new market strategy, but they overcame it. Minh has worked in this role for three years and has made great progress. He has already prepared the annual report for next quarter's review. Next year, the team is going to launch two new products and explore new opportunities abroad. Minh will probably lead the project himself. He says, "I've never been more motivated. Our progress shows that hard work and the right strategy always bring good results."`,
    questions: [
      {
        id: "unit18-q1",
        question_vn: "Nhóm của Minh đã đạt bao nhiêu phần trăm chỉ tiêu doanh số?",
        options: [
          "They achieved 100% of their target.",
          "They achieved 115% of their target.",
          "They achieved 120% of their target.",
          "They achieved 80% of their target.",
        ],
        answer: "They achieved 120% of their target.",
        explanation_vn: "'Minh's team achieved 120% of their sales target' — đạt 120% chỉ tiêu.",
      },
      {
        id: "unit18-q2",
        question_vn: "Doanh thu tăng bao nhiêu phần trăm so với năm trước?",
        options: [
          "Revenue increased by 15%.",
          "Revenue increased by 18%.",
          "Revenue increased by 20%.",
          "Revenue increased by 25%.",
        ],
        answer: "Revenue increased by 18%.",
        explanation_vn: "'Revenue increased by 18% compared to the previous year' — tăng 18%.",
      },
      {
        id: "unit18-q3",
        question_vn: "Minh đã chuẩn bị gì cho đợt đánh giá quý tới?",
        options: [
          "He has prepared a new marketing strategy.",
          "He has already prepared the annual report.",
          "He is going to prepare a presentation tomorrow.",
          "He will prepare the report next week.",
        ],
        answer: "He has already prepared the annual report.",
        explanation_vn: "'He has already prepared the annual report for next quarter's review' — đã chuẩn bị xong báo cáo thường niên.",
      },
      {
        id: "unit18-q4",
        question_vn: "Kế hoạch của nhóm cho năm tới là gì?",
        options: [
          "They are going to reduce their target.",
          "They are going to launch two new products and explore opportunities abroad.",
          "They will change their team strategy only.",
          "They plan to focus on the existing market.",
        ],
        answer: "They are going to launch two new products and explore opportunities abroad.",
        explanation_vn: "'the team is going to launch two new products and explore new opportunities abroad' — ra mắt sản phẩm mới và khám phá cơ hội ở nước ngoài.",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Báo cáo kết quả quý và kế hoạch năm sau trong họp team",
      focus: "achieved target, revenue increased, launch new products, explore abroad",
      context: "Quarterly business review với sếp và đồng nghiệp nước ngoài",
      l1Note: "⚠️ 'Minh's team achieved 120%'. 'Revenue increased by 18%'. 'is going to launch two new products'.",
      example: "We achieved 120% of target. Revenue increased by 18%. We are going to launch two new products."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "SiPTuOTqYn8",
};

export default unit18;
