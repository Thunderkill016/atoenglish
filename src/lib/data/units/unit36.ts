import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-36 — Academic & Formal Passive  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit36: UnitData = {
  unitId: "unit-36",
  title: "Unit 36: Academic & Formal Passive",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Advanced Passive Voice — Thể bị động nâng cao với động từ tường thuật (reporting verbs: said, believed, claimed, reported). Cực kỳ hữu ích cho IELTS Writing Task 1 & 2 và đọc hiểu báo chí học thuật.",
  badgeName: "Nhà Nghiên Cứu",
  badgeEmoji: "🔬",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Trình bày kết quả nghiên cứu thị trường tại một hội thảo quốc tế. Bạn cần báo cáo thông tin một cách khách quan, tránh dùng chủ ngữ cá nhân (I, We) bằng cách sử dụng các cấu trúc bị động học thuật như 'It is reported that...' hoặc 'The product is believed to...'.",
  learningOutcomes: [
    "Sử dụng thể bị động nâng cao với các động từ tường thuật (It is claimed that... / S is believed to V)",
    "Báo cáo kết quả nghiên cứu và thông tin học thuật một cách khách quan, khoa học",
    "Áp dụng từ vựng nghiên cứu và học thuật B2 trong viết và nói",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong văn phong học thuật và báo chí tiếng Anh, sự khách quan (<span class="text-emerald-400">objectivity</span>) được đề cao tối đa. Sử dụng thể bị động khách quan giúp người viết tránh đưa ra các khẳng định mang tính cá nhân, tạo cảm giác tin cậy và có cơ sở khoa học hơn. Ví dụ, thay vì nói <span class="text-zinc-400">"I think this is true"</span>, hãy nói <span class="text-emerald-400">"It has been verified that..."</span>.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "📊", en: "It is reported that global temperatures are rising rapidly.", vn: "Có báo cáo cho thấy nhiệt độ toàn cầu đang tăng lên nhanh chóng.", context: "It is reported that + clause — bị động khách quan" },
    { emoji: "🔬", en: "The experiment is claimed to have been successful.", vn: "Thí nghiệm được khẳng định là đã thành công.", context: "Subject + is claimed to + have + PP" },
    { emoji: "🔍", en: "New evidence was obtained to verify the hypothesis.", vn: "Bằng chứng mới đã được thu thập để xác minh giả thuyết.", context: "was obtained ... to verify — bị động thường kết hợp mục đích" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "claim", emoji: "🗣️", phonetic: "/kleɪm/", meaning: "tuyên bố / khẳng định (chưa chứng minh)", example: "The company claims that its product is completely organic.", example2: "It is claimed that the new drug has no side effects.", collocation: "make a claim / claim that / widely claimed", audio: "/audio/unit-36/claim.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "evidence", emoji: "🔍", phonetic: "/ˈevɪdəns/", meaning: "bằng chứng / chứng cứ", example: "There is no scientific evidence to support this theory.", example2: "We gathered evidence to prove his innocence.", collocation: "scientific evidence / clear evidence / search for evidence", audio: "/audio/unit-36/evidence.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'evidence' trong câu trang trọng." },
    { id: 3, word: "examine", emoji: "🧐", phonetic: "/ɪɡˈzæmɪn/", meaning: "khảo sát / nghiên cứu / xem xét kỹ", example: "The researchers examined the samples under a microscope.", example2: "We need to examine the financial records in detail.", collocation: "examine the details / examine a patient / carefully examine", audio: "/audio/unit-36/examine.mp3", l1_interference_vn: "⚠️ 'examine' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 4, word: "isolate", emoji: "🧬", phonetic: "/ˈaɪsəleɪt/", meaning: "cô lập / tách biệt", example: "Scientists have managed to isolate the gene responsible for the disease.", example2: "The village was isolated by the heavy snowstorm.", collocation: "isolate a virus / isolate yourself / socially isolated", audio: "/audio/unit-36/isolate.mp3", l1_interference_vn: "⚠️ Phát âm cuối âm tiết của 'isolate' rõ (/s/, /t/, /d/) — IELTS speaking." },
    { id: 5, word: "hypothesize", emoji: "💡", phonetic: "/haɪˈpɒθɪsaɪz/", meaning: "đưa ra giả thuyết", example: "It is hypothesized that early humans lived in this cave.", example2: "Scientists hypothesize that there is water on Mars.", collocation: "hypothesize that / widely hypothesized", audio: "/audio/unit-36/hypothesize.mp3", l1_interference_vn: "⚠️ 'hypothesize' là danh từ không đếm được hoặc đếm được — không thêm 's' sai ngữ cảnh." },
    { id: 6, word: "obtain", emoji: "📥", phonetic: "/əbˈteɪn/", meaning: "thu được / đạt được / lấy được", example: "You must obtain permission before using the database.", example2: "Valuable data was obtained from the customer survey.", collocation: "obtain permission / obtain results / obtain information", audio: "/audio/unit-36/obtain.mp3", l1_interference_vn: "⚠️ Trong email B2, 'obtain' đứng trong cụm trang trọng — tránh cấu trúc câu kiểu tiếng Việt." },
    { id: 7, word: "publish", emoji: "📚", phonetic: "/ˈpʌblɪʃ/", meaning: "công bố / xuất bản", example: "The research findings were published in a medical journal.", example2: "She published her first novel last year.", collocation: "publish a report / publish an article / publish a book", audio: "/audio/unit-36/publish.mp3", l1_interference_vn: "⚠️ 'Publish' thường passive trong học thuật: 'It is published'. Người VN hay dùng active sai." },
    { id: 8, word: "verify", emoji: "✔️", phonetic: "/ˈverɪfaɪ/", meaning: "xác minh / kiểm chứng", example: "Please verify your email address to complete registration.", example2: "We need to verify the source of the information.", collocation: "verify details / verify facts / verify identity", audio: "/audio/unit-36/verify.mp3", l1_interference_vn: "⚠️ 'Verify' trang trọng. 'Check' casual. 'Verify that' + clause." },
    { id: 9, word: "demonstrate", emoji: "👩‍🏫", phonetic: "/ˈdemənstreɪt/", meaning: "chứng minh / giải thích / trình bày", example: "The study demonstrates the link between stress and health.", example2: "Let me demonstrate how the new software works.", collocation: "demonstrate that / clearly demonstrate / demonstrate a skill", audio: "/audio/unit-36/demonstrate.mp3", l1_interference_vn: "⚠️ 'Demonstrate' formal. 'Show' casual. Thường 'demonstrate + that'." },
    { id: 10, word: "identify", emoji: "🏷️", phonetic: "/aɪˈdentɪfaɪ/", meaning: "nhận diện / xác định", example: "The police are trying to identify the suspect.", example2: "We must identify the key factors causing the delay.", collocation: "identify a problem / identify a trend / identify opportunities", audio: "/audio/unit-36/identify.mp3", l1_interference_vn: "⚠️ 'Identify' + noun. 'Identify with' = đồng cảm. Thường passive 'is identified'." },
    { id: 11, word: "illustrate", emoji: "📊", phonetic: "/ˈɪləstreɪt/", meaning: "minh họa / làm rõ qua ví dụ", example: "The graph illustrates the growth in sales over the last year.", example2: "To illustrate my point, let's look at this case study.", collocation: "illustrate a point / graph illustrates / illustrate with examples", audio: "/audio/unit-36/illustrate.mp3", l1_interference_vn: "⚠️ 'Illustrate' formal. 'Show' casual. 'Illustrate + with'." },
    { id: 12, word: "conduct", emoji: "🧪", phonetic: "/kənˈdʌkt/", meaning: "tiến hành / thực hiện", example: "The university is conducting a study on sleep deprivation.", example2: "We must conduct a risk analysis before we start.", collocation: "conduct research / conduct a study / conduct an interview", audio: "/audio/unit-36/conduct.mp3", l1_interference_vn: "⚠️ 'Conduct' formal. 'Do' casual. 'Conduct + research/study'." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Báo cáo kết quả nghiên cứu thị trường",
      audio: "/audio/unit-36/dialogue_1.mp3",
      desc: "Linh trình bày các phát hiện mới về hành vi người tiêu dùng.",
      lines: [
        { id: "d1-1", speaker: "Linh", text: "Good morning. Today, I'd like to present the study we conducted last month. It is believed that consumer habits are changing.", translation: "Chào buổi sáng. Hôm nay, tôi muốn trình bày nghiên cứu chúng tôi đã tiến hành tháng trước. Người ta tin rằng thói quen của người tiêu dùng đang thay đổi." },
        { id: "d1-2", speaker: "Manager", text: "Interesting. Has this been verified by solid evidence?", translation: "Thú vị đấy. Điều này đã được xác minh bằng bằng chứng vững chắc chưa?" },
        { id: "d1-3", speaker: "Linh", text: "Yes. Valuable data was obtained from over one thousand surveys. As illustrated in the chart, online shopping has increased.", translation: "Vâng. Dữ liệu giá trị đã thu được từ hơn một nghìn khảo sát. Như được minh họa trong biểu đồ, việc mua sắm trực tuyến đã gia tăng." },
        { id: "d1-4", speaker: "Manager", text: "Great. Is the new trend claimed to be permanent?", translation: "Tuyệt vời. Xu hướng mới này được khẳng định là lâu dài chứ?" },
        { id: "d1-5", speaker: "Linh", text: "Most experts hypothesize that it will continue. The full analysis will be published next week.", translation: "Hầu hết các chuyên gia đưa ra giả thuyết rằng nó sẽ tiếp tục. Bản phân tích đầy đủ sẽ được công bố vào tuần tới." },
      ],
    },
    {
      id: 2,
      title: "Xác minh mẫu sinh học",
      audio: "/audio/unit-36/dialogue_2.mp3",
      desc: "Hai nhà khoa học trong phòng thí nghiệm thảo luận về việc cô lập virus.",
      lines: [
        { id: "d2-1", speaker: "Scientist A", text: "The new virus is claimed to have been isolated yesterday.", translation: "Loại virus mới được tuyên bố là đã được cô lập vào ngày hôm qua." },
        { id: "d2-2", speaker: "Scientist B", text: "Excellent. Have we examined the structure under the microscope yet?", translation: "Tuyệt vời. Chúng ta đã khảo sát cấu trúc của nó dưới kính hiển vi chưa?" },
        { id: "d2-3", speaker: "Scientist A", text: "Yes. The results demonstrate that it is highly contagious. We must verify this with more tests.", translation: "Rồi. Kết quả chứng minh rằng nó cực kỳ dễ lây lan. Chúng ta phải xác minh điều này bằng nhiều xét nghiệm hơn." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "It is believed that consumer habits are changing.", options: ["Consumer habits will not change.", "It is believed that consumer habits are changing.", "We changed our habits yesterday.", "I believe that I need to shop online."], answer: "It is believed that consumer habits are changing." },
    { id: "lac2", audio_text: "The research findings were published in a medical journal.", options: ["The research findings were published in a medical journal.", "We will publish a book about medicine next month.", "The medical journal was rejected by the university.", "No articles were published last year."], answer: "The research findings were published in a medical journal." },
    { id: "lac3", audio_text: "Valuable data was obtained from the customer survey.", options: ["Customer surveys are not valuable.", "Valuable data was obtained from the customer survey.", "We lost the data from the survey.", "We will obtain data tomorrow."], answer: "Valuable data was obtained from the customer survey." },
    { id: "lac4", audio_text: "The new virus is claimed to have been isolated yesterday.", options: ["The virus was not isolated yesterday.", "The new virus is claimed to have been isolated yesterday.", "We will isolate the virus next week.", "I claim that the virus is dangerous."], answer: "The new virus is claimed to have been isolated yesterday." },
    { id: "lac5", audio_text: "The graph illustrates the growth in sales over the last year.", options: ["The graph illustrates the growth in sales over the last year.", "Sales decreased significantly last year.", "We need to draw a new graph for sales.", "The illustration was drawn by a designer."], answer: "The graph illustrates the growth in sales over the last year." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "It is {input} that the virus was {input} after a study was {input}.",
    level1Placeholder: "Ví dụ: claimed — isolated — conducted...",
    level2Situation: "Bạn đang viết phần mở đầu của một bài báo cáo khoa học hoặc thuyết trình học thuật. Hãy: (1) Nói rằng nghiên cứu được tiến hành để xác minh giả thuyết, (2) Dùng cấu trúc bị động 'It is reported that...' để báo cáo kết quả, (3) Nêu rằng bằng chứng đã được thu thập đầy đủ.",
    level2Hint: "This study was conducted to examine the local ecosystem. It is reported that several species have been threatened by pollution. Sufficient evidence was obtained to demonstrate the loss of biodiversity.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Academic & Formal Passive — Bị Động Tường Thuật Học Thuật",
    rule: "Trong các văn bản khoa học, tin tức báo chí và bài luận IELTS Writing, cấu trúc bị động với động từ tường thuật (claim, say, believe, report, expect, think) được sử dụng rộng rãi để báo cáo thông tin khách quan.\n\nCấu trúc 1 (Cấu trúc giả định với IT):\nIt + is/was + Past Participle (said/believed/reported...) + that + Clause (Mệnh đề)\n  → 'It is believed that the market will grow.' (Người ta tin rằng thị trường sẽ phát triển)\n\nCấu trúc 2 (Cấu trúc chuyển chủ ngữ lên đầu):\nSubject + is/are/was/were + Past Participle + to + Verb-infinitive (cho hiện tại/tương lai)\n  → 'The company is said to be very successful.'\nSubject + is/are/was/were + Past Participle + to + have + Past Participle (cho quá khứ)\n  → 'The virus is claimed to have been isolated yesterday.'",
    examples: [
      { en: "It is reported that a new gene was identified. (It + passive + that clause)", vn: "Có báo cáo cho rằng một gen mới đã được xác định." },
      { en: "The company is expected to publish its financial results tomorrow. (Subject + passive + to-V)", vn: "Công ty được kỳ vọng sẽ công bố kết quả tài chính vào ngày mai." },
      { en: "He is believed to have left the country. (Subject + passive + to have + PP - sự việc đã xảy ra)", vn: "Anh ta được tin là đã rời khỏi đất nước." },
    ],
    tip: "Khi viết IELTS Writing Task 2, thay vì dùng 'People believe that education is important', hãy nâng cấp lên cấu trúc bị động học thuật: 'It is widely believed that education plays a crucial role...' hoặc 'Education is widely believed to play a crucial role...'. Điểm Grammatical Range của bạn sẽ cải thiện rõ rệt.",
    vnNote: "⚠️ Người Việt thường gặp khó khăn khi chuyển đổi sang Cấu trúc 2 (Subject + passive + to-V). Hãy nhớ chia động từ 'To be' ở đầu câu theo đúng chủ ngữ chính (số ít/số nhiều) chứ không chia theo chủ ngữ giả 'It'.",
    dialogueExample: {
      speaker: "Linh",
      text: "It is believed that consumer habits are changing.",
      translation: "Người ta tin rằng thói quen của người tiêu dùng đang thay đổi.",
      highlight: "It is believed that (bị động tường thuật khách quan, trang trọng)",
    },
    ccq: {
      question: "Chuyển câu sau sang dạng bị động bắt đầu bằng 'The company': 'People report that the company lost millions last year.'",
      options: [
        "The company is reported to lose millions last year.",
        "The company is reported to have lost millions last year.",
        "It is reported that the company lost millions last year.",
        "The company is reported lost millions last year.",
      ],
      answer: "The company is reported to have lost millions last year.",
      explanation: "Vì hành động 'lost' xảy ra trong quá khứ (last year) trước thời điểm báo cáo (is reported), ta phải dùng 'to have + Past Participle' (to have lost).",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: 'The prime minister is said ___ the country yesterday.'", options: ["to leave", "to have left", "leaving", "has left"], answer: "to have left" },
    { id: "pq2", type: "multiple-choice", question: "Chọn cấu trúc đúng: 'It is reported ___ the inflation rate has dropped.'", options: ["that", "which", "to", "what"], answer: "that" },
    { id: "pq3", type: "cloze", question: "Điền dạng đúng: 'The findings are expected ___ (publish) next month.'", answer: "to be published" },
    { id: "pq4", type: "multiple-choice", question: "Điền từ: 'We need clear scientific ___ before we can accept the theory.'", options: ["evidence", "claim", "hypothesis", "isolation"], answer: "evidence" },
    { id: "pq5", type: "cloze", question: "Điền dạng đúng: 'It is hypothesized that the virus ___ (be) contagious.'", answer: "is" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng học thuật B2 với nghĩa tiếng Việt",
    pairs: [
      { left: "examine", right: "khảo sát / xem xét kỹ" },
      { left: "verify", right: "xác minh / kiểm chứng" },
      { left: "demonstrate", right: "chứng minh / giải thích" },
      { left: "identify", right: "nhận diện / xác định" },
      { left: "conduct", right: "tiến hành / thực hiện" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Người ta tin rằng biến đổi khí hậu đang đẩy nhanh.",
      answer: "It is believed that climate change is accelerating.",
    },
    {
      id: "pt-2",
      prompt_vn: "Bằng chứng cho thấy giả thuyết đã được kiểm chứng.",
      answer: "Evidence shows that the hypothesis has been examined.",
    },
    {
      id: "pt-3",
      prompt_vn: "Kết quả được thu thập từ nhiều nguồn khác nhau.",
      answer: "The results were obtained from multiple sources.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc36-1",
      sentence: "The results was analyzed by the research team.",
      errorWord: "was",
      correction: "were",
      explanation_vn: "'Results' số nhiều → 'WERE analyzed'. Passive: was (số ít) / were (số nhiều) + past participle.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la36-1",
      audio_text: "The results were analyzed by the research team.",
      prompt_vn: "Kết quả được phân tích bởi nhóm nghiên cứu.",
      words: ["The", "results", "were", "analyzed", "by", "the", "research", "team", ".", "was", "analyse"],
      answer: "The results were analyzed by the research team .",
    },
    {
      id: "la36-2",
      audio_text: "It is believed that renewable energy is the future.",
      prompt_vn: "Người ta tin rằng năng lượng tái tạo là tương lai.",
      words: ["It", "is", "believed", "that", "renewable", "energy", "is", "the", "future", ".", "was", "believes"],
      answer: "It is believed that renewable energy is the future .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Thí nghiệm được khẳng định là đã thành công.",
      words: ["The", "experiment", "is", "claimed", "to", "have", "been", "successful", ".", "might", "should"],
      answer: "The experiment is claimed to have been successful .",
    },
    {
      id: "wb2",
      prompt_vn: "Biểu đồ minh họa sự tăng trưởng trong doanh thu.",
      words: ["The", "chart", "illustrates", "the", "growth", "in", "revenue", ".", "might", "should"],
      answer: "The chart illustrates the growth in revenue .",
    },
    {
      id: "wb3",
      prompt_vn: "Các nhà khoa học đã tiến hành một nghiên cứu về giấc ngủ.",
      words: ["Scientists", "conducted", "a", "study", "on", "sleep", "deprivation", ".", "might", "should"],
      answer: "Scientists conducted a study on sleep deprivation .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s36-1", prompt_vn: "Thí nghiệm được khẳng định là đã thành công.", words: ["The", "experiment", "is", "claimed", "to", "have", "been", "successful", "."], answer: "The experiment is claimed to have been successful ." },
    { id: "s36-2", prompt_vn: "Biểu đồ minh họa sự tăng trưởng trong doanh thu.", words: ["The", "chart", "illustrates", "the", "growth", "in", "revenue", "."], answer: "The chart illustrates the growth in revenue ." },
    { id: "s36-3", prompt_vn: "Các nhà khoa học đã tiến hành một nghiên cứu về giấc ngủ.", words: ["Scientists", "conducted", "a", "study", "on", "sleep", "deprivation", "."], answer: "Scientists conducted a study on sleep deprivation ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Điền từ: 'The product is claimed ___ outstanding results during testing.'", options: ["to produce", "to have produced", "producing", "produced"], answer: "to have produced" },
    { id: "fq2", type: "cloze", question: "Điền từ: 'The researchers managed to ___ (cô lập) the rare bacteria.'", answer: "isolate" },
    { id: "fq3", type: "multiple-choice", question: "Chọn từ điền: 'Please ___ your database credentials before logging in.'", options: ["verify", "claim", "examine", "illustrate"], answer: "verify" },
    { id: "fq4", type: "translate", question: "Dịch: 'Người ta tin rằng biến đổi khí hậu đang đẩy nhanh.'", answer: "It is believed that climate change is accelerating." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào đồng nghĩa với 'carry out'?", options: ["examine", "conduct", "verify", "identify"], answer: "conduct" },
    { id: "q-ex1", type: "multiple-choice", question: "Bị động phức (complex passive) với modal: cấu trúc đúng:", options: ["must + V3", "must + be + V3", "must + been + V3", "must + being + V3"], answer: "must + be + V3" },
    { id: "q-ex2", type: "multiple-choice", question: "Câu bị động trang trọng đúng:", options: ["The report is being written.", "The report being written.", "The report is been written.", "The report are being written."], answer: "The report is being written." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'The decision has ___ made by the board.'", answer: "been" },
    { id: "q-ex4", type: "multiple-choice", question: "'It is believed that...' là cấu trúc:", options: ["Active voice", "Impersonal passive", "Causative", "Reported speech"], answer: "Impersonal passive" },
    { id: "q-ex5", type: "translate", question: "Dịch trang trọng: 'Vấn đề này cần được xem xét.'", answer: "This issue needs to be addressed." },
    { id: "q-ex6", type: "multiple-choice", question: "'It is said that he is wealthy.' = :", options: ["He is said to be wealthy.", "He said to be wealthy.", "He is saying to be wealthy.", "He was said being wealthy."], answer: "He is said to be wealthy." },
    { id: "q-ex7", type: "multiple-choice", question: "Trong văn bản học thuật/khoa học, tại sao hay dùng bị động?", options: ["Để câu ngắn hơn", "Để tập trung vào hành động, không phải tác nhân", "Vì luôn chính xác hơn chủ động", "Vì dễ viết hơn"], answer: "Để tập trung vào hành động, không phải tác nhân" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr36-1", question: "Ôn tập Unit 35 — Chọn liên từ: 'We will not sign the contract ___ you pay the penalty.'", options: ["provided that", "as long as", "unless", "even if"], answer: "unless", type: "multiple-choice" },
    { id: "cr36-2", question: "Ôn tập Unit 34 — Điền: 'If we had foreseen the risk, we ___ (avoid) the complication.'", options: [], answer: "would have avoided", type: "cloze" },
    { id: "cr36-3", question: "Ôn tập Unit 33 — Chọn dạng đúng: 'If she ___ more time, she would invest in our startup.'", options: ["has", "had", "have", "would have"], answer: "had", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "impersonal passive",
    description: "Impersonal passive — It is said that — linking và stress",
    examples: [
        { word: "It is said", ipa: "/ɪt ɪz sɛd/", tip: "It is SAID that... — said nhấn, it is nói nhanh/nhẹ" },
        { word: "It is believed", ipa: "/ɪt ɪz bɪˈliːvd/", tip: "Stress vào V3: it is be-LIEVED that — âm /d/ cuối nhẹ" },
    ],
    minimalPairs: [
        ["It's said (spoken)", "It is said (formal)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "It is believed that habits are changing", vn: "Người ta tin rằng thói quen đang thay đổi" },
      { en: "Valuable data was obtained from surveys", vn: "Dữ liệu quý giá được thu thập từ khảo sát" },
      { en: "The research findings were published", vn: "Kết quả nghiên cứu đã được công bố" },
      { en: "The virus is claimed to have been isolated", vn: "Virus được tuyên bố là đã được cô lập" },
      { en: "We need scientific evidence", vn: "Chúng ta cần bằng chứng khoa học" },
      { en: "The graph illustrates the growth", vn: "Biểu đồ minh họa sự tăng trưởng" },
      { en: "Please verify your email address", vn: "Vui lòng xác minh địa chỉ email của bạn" },
      { en: "We conducted a detailed risk analysis", vn: "Chúng tôi đã tiến hành phân tích rủi ro chi tiết" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit36-reading-1",
    title: "A Study on Remote Work",
    title_vn: "Đọc đoạn Academic Passive — nghiên cứu về làm việc từ xa",
    level: "B2" as const,
    text:
      "A comprehensive study on remote work practices was conducted by researchers at a leading university. " +
      "Over 5,000 employees from 12 countries were surveyed between 2022 and 2024. " +
      "The research was funded by a major technology foundation. " +
      "Participants were selected from diverse industries, including finance, education, and healthcare. " +
      "Data were collected through online questionnaires and structured interviews. " +
      "The findings were published in the Journal of Workplace Management in January 2025. " +
      "It was found that employees who worked remotely reported 23% higher job satisfaction. " +
      "However, it was also noted that remote workers experienced greater difficulty maintaining " +
      "work-life boundaries. " +
      "It is recommended that companies implement clear remote work policies " +
      "to address these challenges. " +
      "The study is expected to influence workplace legislation in several countries.",
    questions: [
      {
        id: "u36r-q1",
        question_vn: "Nghiên cứu được thực hiện bởi ai?",
        options: [
          "A government agency",
          "Researchers at a leading university",
          "A private consulting firm",
          "A technology company",
        ],
        answer: "Researchers at a leading university",
        explanation_vn: "'A comprehensive study...was conducted by researchers at a leading university.'",
      },
      {
        id: "u36r-q2",
        question_vn: "Bao nhiêu nhân viên đã được khảo sát?",
        options: ["500", "1,000", "5,000", "10,000"],
        answer: "5,000",
        explanation_vn: "'Over 5,000 employees from 12 countries were surveyed.'",
      },
      {
        id: "u36r-q3",
        question_vn: "Những nhân viên làm việc từ xa báo cáo mức độ hài lòng công việc cao hơn bao nhiêu?",
        options: ["10%", "15%", "23%", "30%"],
        answer: "23%",
        explanation_vn: "'employees who worked remotely reported 23% higher job satisfaction.'",
      },
      {
        id: "u36r-q4",
        question_vn: "Khuyến nghị của nghiên cứu là gì?",
        options: [
          "All companies should ban remote work",
          "Companies should implement clear remote work policies",
          "Employees should work longer hours",
          "Governments should regulate all workplaces",
        ],
        answer: "Companies should implement clear remote work policies",
        explanation_vn: "'It is recommended that companies implement clear remote work policies.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Hỏi xin feedback và review từ manager sau dự án",
      focus: "Feedback conversation: strengths, areas to improve, next goals",
      context: "1:1 with manager post project delivery",
      l1Note: "⚠️ 'What went well?' 'One thing I would improve is...' 'For the next quarter I want to focus on X.'",
      example: "I think the launch went smoothly thanks to the team. Where can I improve? I would like more exposure to client presentations."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "9O8E7Bxwrjo",
};

export default unit36;
