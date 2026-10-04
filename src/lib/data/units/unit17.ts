import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-17 — Experiences & Present Perfect  (A2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit17: UnitData = {
  unitId: "unit-17",
  title: "Unit 17: Experiences & Present Perfect",
  level: "A2",
  xp: 90,
  estimatedTime: 45,
  description: "Học Present Perfect để nói về kinh nghiệm sống và thành tích của bản thân.",
  badgeName: "Người Nhiều Trải Nghiệm",
  badgeEmoji: "🌟",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Buổi phỏng vấn xin việc hoặc buổi trà dư tửu hậu với đội nhóm quốc tế. Bạn cần chia sẻ về kinh nghiệm, những nơi bạn đã đến, và những thành tích bạn đã đạt được.",
  learningOutcomes: [
    "Nói về kinh nghiệm trong cuộc sống bằng Present Perfect",
    "Phân biệt Present Perfect với Past Simple",
    "Hỏi về kinh nghiệm của người khác một cách tự nhiên"
  ],

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🌍", en: "Have you ever traveled abroad?", vn: "Bạn đã từng đi nước ngoài chưa?", context: "Hỏi về kinh nghiệm" },
    { emoji: "🏆", en: "I've won a sales award three times.", vn: "Tôi đã giành được giải thưởng bán hàng ba lần.", context: "Thành tích" },
    { emoji: "🍣", en: "I have never eaten sushi before.", vn: "Tôi chưa bao giờ ăn sushi.", context: "Chưa từng làm gì" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Present Perfect (<span class=\"text-emerald-400 font-semibold\">have/has + past participle</span>) thường gây nhầm lẫn cho người học tiếng Việt vì tiếng Việt không có thì này. Quy tắc nhớ nhanh: dùng Present Perfect khi <strong>thời điểm cụ thể không quan trọng</strong>, chỉ quan trọng là <strong>đã từng làm chưa</strong>. Ngược lại, Past Simple dùng khi có thời điểm cụ thể.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "experience", emoji: "🌟", phonetic: "/ɪkˈspɪəriəns/", meaning: "kinh nghiệm / trải nghiệm", example: "I have three years of experience in marketing.", example2: "It was an amazing experience.", collocation: "work experience / life experience", audio: "/audio/unit-17/experience.mp3" , l1_interference_vn: "⚠️ 'Have experience' (không đếm được) vs 'have an experience' (trải nghiệm cụ thể)." },
    { id: 2, word: "ever", emoji: "❓", phonetic: "/ˈevər/", meaning: "từng / bao giờ", example: "Have you ever worked abroad?", example2: "It's the best meal I've ever had!", collocation: "have you ever / best ever", audio: "/audio/unit-17/ever.mp3" , l1_interference_vn: "⚠️ 'Have you EVER been...?' — 'ever' giữa have và V3 trong câu hỏi." },
    { id: 3, word: "never", emoji: "❌", phonetic: "/ˈnevər/", meaning: "chưa bao giờ", example: "I have never been to Europe.", example2: "She has never tried Vietnamese coffee.", collocation: "have never / never before", audio: "/audio/unit-17/never.mp3" , l1_interference_vn: "⚠️ 'I've NEVER been' — vị trí giữa have và V3. 'Haven't never' = double negative — SAI." },
    { id: 4, word: "already", emoji: "✅", phonetic: "/ɔːlˈredi/", meaning: "đã (rồi)", example: "I've already sent the report.", example2: "She has already left the office.", collocation: "have already / already done", audio: "/audio/unit-17/already.mp3" , l1_interference_vn: "⚠️ Vị trí: giữa 'have' và V3: 'I've ALREADY done it'. Cuối câu cũng đúng." },
    { id: 5, word: "yet", emoji: "⏳", phonetic: "/jet/", meaning: "chưa / rồi chưa (trong câu hỏi)", example: "Have you finished yet?", example2: "I haven't replied yet.", collocation: "not yet / have you... yet", audio: "/audio/unit-17/yet.mp3" , l1_interference_vn: "⚠️ 'Yet' trong câu phủ định/hỏi, cuối câu: 'Have you eaten yet?' / 'I haven't eaten yet'." },
    { id: 6, word: "just", emoji: "⚡", phonetic: "/dʒʌst/", meaning: "vừa mới", example: "I've just arrived at the office.", example2: "She has just sent the email.", collocation: "have just / just finished", audio: "/audio/unit-17/just.mp3" , l1_interference_vn: "⚠️ 'I've JUST arrived' — 'just' giữa have và V3. Nghĩa: vừa mới xong (rất gần đây)." },
    { id: 7, word: "achieve", emoji: "🏆", phonetic: "/əˈtʃiːv/", meaning: "đạt được", example: "She has achieved excellent results.", example2: "I've achieved my sales target.", collocation: "achieve a goal / achieve results", audio: "/audio/unit-17/achieve.mp3" , l1_interference_vn: "⚠️ Stress: a-CHIEVE (âm 2). Âm /tʃ/ trong '-chieve'. 'Achieve a goal' — không 'reach a goal'." },
    { id: 8, word: "since", emoji: "📅", phonetic: "/sɪns/", meaning: "từ khi (mốc thời gian)", example: "I've worked here since 2020.", example2: "She has lived in Hanoi since she was a child.", collocation: "since then / since last year", audio: "/audio/unit-17/since.mp3" , l1_interference_vn: "⚠️ 'Since' + mốc thời gian: 'since 2020'. 'For' + khoảng thời gian: 'for 3 years'. Hay nhầm." },
    { id: 9, word: "for", emoji: "⏱️", phonetic: "/fɔːr/", meaning: "trong (khoảng thời gian)", example: "I've lived here for five years.", example2: "We've been partners for a long time.", collocation: "for years / for a long time", audio: "/audio/unit-17/for.mp3" , l1_interference_vn: "⚠️ 'For 5 years' (present perfect duration). Không nhầm với 'since 2020' (mốc thời gian)." },
    { id: 10, word: "recently", emoji: "🕐", phonetic: "/ˈriːsəntli/", meaning: "gần đây", example: "I've recently started learning Spanish.", example2: "Have you read any good books recently?", collocation: "recently completed / recently joined", audio: "/audio/unit-17/recently.mp3" , l1_interference_vn: "⚠️ Thường dùng với present perfect: 'I've recently moved'. Ít dùng với past simple." },
    { id: 11, word: "accomplished", emoji: "✨", phonetic: "/əˈkʌmplɪʃt/", meaning: "có thành tích / đã hoàn thành", example: "She is a very accomplished engineer.", example2: "I've accomplished all my goals this year.", collocation: "accomplished professional / feel accomplished", audio: "/audio/unit-17/accomplished.mp3", l1_interference_vn: "⚠️ 'Accomplished' (adj) = có thành tích. 'Accomplish' (v) = hoàn thành/đạt được. 'Accomplished professional' = chuyên gia giỏi." },
    { id: 12, word: "certificate", emoji: "🎓", phonetic: "/sərˈtɪfɪkət/", meaning: "chứng chỉ / chứng nhận", example: "I have a certificate in project management.", example2: "She received a certificate for her work.", collocation: "get a certificate / certified professional", audio: "/audio/unit-17/certificate.mp3", l1_interference_vn: "⚠️ Stress: cer-TIF-i-cate (n, /kəˈtɪfɪkɪt/). 'A certificate IN English'. KHÔNG nhầm với 'certification' (quá trình cấp chứng chỉ)." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Phỏng vấn xin việc",
      audio: "/audio/unit-17/dialogue_1.mp3",
      desc: "Minh tham gia phỏng vấn và chia sẻ kinh nghiệm của mình.",
      lines: [
        { id: "d1-1", speaker: "Interviewer", text: "Tell me about yourself. Have you ever worked in an international environment?", translation: "Hãy kể về bản thân bạn. Bạn đã từng làm việc trong môi trường quốc tế chưa?" },
        { id: "d1-2", speaker: "Minh", text: "Yes, I have. I've worked with foreign clients for three years at my current company.", translation: "Vâng, đã từng. Tôi đã làm việc với khách hàng nước ngoài được ba năm tại công ty hiện tại." },
        { id: "d1-3", speaker: "Interviewer", text: "Impressive! Have you ever led a team?", translation: "Ấn tượng! Bạn đã từng dẫn dắt một nhóm chưa?" },
        { id: "d1-4", speaker: "Minh", text: "Yes, I've led a team of five people since 2022. We've achieved excellent sales results.", translation: "Vâng, tôi đã dẫn dắt nhóm năm người từ năm 2022. Chúng tôi đã đạt được kết quả bán hàng xuất sắc." },
        { id: "d1-5", speaker: "Interviewer", text: "Have you finished your project management certificate yet?", translation: "Bạn đã hoàn thành chứng chỉ quản lý dự án chưa?" },
        { id: "d1-6", speaker: "Minh", text: "Yes! I've just received it last month. I've never stopped learning!", translation: "Rồi! Tôi vừa nhận được nó tháng trước. Tôi chưa bao giờ ngừng học hỏi!" },
      ]
    },
    {
      id: 2,
      title: "Khám phá ẩm thực",
      audio: "/audio/unit-17/dialogue_2.mp3",
      desc: "Tom và Lan nói chuyện về những trải nghiệm ẩm thực.",
      lines: [
        { id: "d2-1", speaker: "Tom", text: "Lan, have you ever tried Japanese food?", translation: "Lan, bạn đã từng ăn thức ăn Nhật Bản chưa?" },
        { id: "d2-2", speaker: "Lan", text: "Yes! I've tried sushi many times. I love it! Have you ever had Vietnamese pho?", translation: "Rồi! Tôi đã ăn sushi nhiều lần. Tôi thích lắm! Bạn đã từng ăn phở Việt Nam chưa?" },
        { id: "d2-3", speaker: "Tom", text: "Yes, I've already tried pho. I had it at a restaurant near the hotel.", translation: "Rồi, tôi đã thử phở rồi. Tôi ăn ở nhà hàng gần khách sạn." },
        { id: "d2-4", speaker: "Lan", text: "What did you think? Did you enjoy it?", translation: "Bạn thấy thế nào? Có thích không?" },
        { id: "d2-5", speaker: "Tom", text: "It was delicious! I've never tasted anything so fresh. I've been to 12 countries but Vietnamese food is the best I've ever had!", translation: "Ngon tuyệt! Tôi chưa bao giờ nếm thứ gì tươi ngon đến vậy. Tôi đã đến 12 quốc gia nhưng đồ ăn Việt Nam là ngon nhất tôi từng ăn!" },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "Have you ever worked in an international environment", options: ["Did you ever work in an international environment", "Have you ever worked in an international environment", "Have you ever work in an international environment", "Do you ever work in international environment"], answer: "Have you ever worked in an international environment" },
    { id: "lac2", audio_text: "I've worked here since 2020", options: ["I've worked here since 2020", "I've worked here for 2020", "I work here since 2020", "I worked here since 2020"], answer: "I've worked here since 2020" },
    { id: "lac3", audio_text: "I've never tasted anything so fresh", options: ["I never tasted anything so fresh", "I've never tasted anything so fresh", "I've never taste anything so fresh", "I've never tasted something so fresh"], answer: "I've never tasted anything so fresh" },
    { id: "lac4", audio_text: "Have you finished the report yet", options: ["Have you finished the report yet", "Have you finish the report yet", "Did you finish the report yet", "Have you yet finished the report"], answer: "Have you finished the report yet" },
    { id: "lac5", audio_text: "I've just received my certificate", options: ["I just received my certificate", "I've just received my certificate", "I've just receive my certificate", "I just have received my certificate"], answer: "I've just received my certificate" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I have {input} in my career.",
    level1Placeholder: "Ví dụ: led a team of five people, completed three projects, received an award...",
    level2Situation: "Trong buổi networking với chuyên gia quốc tế, hãy chia sẻ về kinh nghiệm của bạn: nước ngoài bạn đã đến, loại công việc bạn đã làm, và thành tích bạn đã đạt được trong sự nghiệp.",
    level2Hint: "I've worked in [field] for [duration] years. I've [achievement 1]. Have you ever [experience]? I've never [thing], but I hope to [goal]. Recently, I've [recent achievement].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Present Perfect — Kinh nghiệm và thành tích",
    rule: "Have/Has + past participle\nKeywords: ever, never, already, yet, just, since, for, recently",
    examples: [
      { en: "I have worked here for 3 years.", vn: "Tôi đã làm việc ở đây được 3 năm. (for = khoảng thời gian)" },
      { en: "She has worked here since 2021.", vn: "Cô ấy làm ở đây từ năm 2021. (since = mốc thời gian)" },
      { en: "Have you ever visited Japan?", vn: "Bạn đã từng đến Nhật Bản chưa? (ever = từng)" },
      { en: "I've just finished the report.", vn: "Tôi vừa hoàn thành báo cáo. (just = vừa mới)" },
    ],
    tip: "Phân biệt FOR và SINCE: <strong>For</strong> + khoảng thời gian (for 3 years, for a week). <strong>Since</strong> + mốc thời điểm cụ thể (since 2020, since Monday). Cách nhớ: 'for a period, since a point'.",
    vnNote: "⚠️ Lưu ý: Present Perfect (have/has + V3) không có tương đương trực tiếp trong tiếng Việt. Người Việt hay dùng Past Simple thay vì Present Perfect. 'I saw him before' (quá khứ đơn) vs 'I have seen him' (kinh nghiệm, thời điểm không xác định).",
    dialogueExample: {
      speaker: "Minh",
      text: "I've worked with foreign clients for three years. I've led a team since 2022.",
      translation: "Tôi đã làm với khách hàng nước ngoài được ba năm. Tôi dẫn dắt nhóm từ năm 2022.",
      highlight: "for (duration) / since (starting point)",
    },
    ccq: {
      question: "Câu nào dùng Present Perfect ĐÚNG?",
      options: [
        "I have went to Japan last year.",
        "I have been to Japan. ✅",
        "I have go to Japan.",
        "I been to Japan.",
      ],
      answer: "I have been to Japan. ✅",
      explanation: "Present Perfect: have/has + past participle. 'Go' → past participle là 'been' (khi nói về địa điểm). 'I went to Japan last year' cũng đúng nhưng đó là Past Simple với thời điểm cụ thể.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng: 'She ___ a team for two years.'", options: ["lead", "led", "has led", "have led"], answer: "has led" },
    { id: "pq2", type: "multiple-choice", question: "Điền đúng: 'I've worked here ___ 2019.'", options: ["for", "since", "from", "at"], answer: "since" },
    { id: "pq3", type: "cloze", question: "Điền: 'Have you ___ (finish) the proposal yet?'", answer: "finished" },
    { id: "pq4", type: "multiple-choice", question: "Câu nào ĐÚNG? Bạn vừa gửi email xong.", options: ["I sent the email just.", "I just sent the email.", "I've just sent the email.", "I have just send the email."], answer: "I've just sent the email." },
    { id: "pq5", type: "cloze", question: "Điền: 'I have ___ been to Europe before. (chưa bao giờ)'", answer: "never" },
  ],


  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "ever", right: "từng / bao giờ" },
      { left: "never", right: "chưa bao giờ" },
      { left: "already", right: "đã (rồi)" },
      { left: "yet", right: "chưa / rồi chưa" },
      { left: "just", right: "vừa mới" },
    ],
  },


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Tôi đã làm việc với khách hàng nước ngoài được ba năm.",
      answer: "I've worked with foreign clients for three years.",
    },
    {
      id: "pt-2",
      prompt_vn: "Bạn đã từng đi Nhật Bản chưa?",
      answer: "Have you ever been to Japan?",
    },
    {
      id: "pt-3",
      prompt_vn: "Chúng tôi chưa bao giờ gặp vấn đề này.",
      answer: "We have never experienced this issue.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc17-1",
      sentence: "I have went to London twice.",
      errorWord: "went",
      correction: "gone",
      explanation_vn: "Present Perfect dùng past participle: 'go → GONE'. 'Went' là Simple Past, không dùng với 'have'.",
    },
    {
      id: "sc17-2",
      sentence: "She has already leave the office.",
      errorWord: "leave",
      correction: "left",
      explanation_vn: "'Leave' → 'left' (bất quy tắc). Sau 'has/have' luôn dùng past participle, không nguyên mẫu.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la17-1",
      audio_text: "I have never been to Paris before.",
      prompt_vn: "Tôi chưa bao giờ đến Paris.",
      words: ["I", "have", "never", "been", "to", "Paris", "before", ".", "went", "gone"],
      answer: "I have never been to Paris before .",
    },
    {
      id: "la17-2",
      audio_text: "She has already finished her report.",
      prompt_vn: "Cô ấy đã hoàn thành báo cáo rồi.",
      words: ["She", "has", "already", "finished", "her", "report", ".", "have", "finish"],
      answer: "She has already finished her report .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Bạn đã từng đến Nhật Bản chưa?",
      words: ["Have", "you", "ever", "been", "to", "Japan", "?", "have", "has"],
      answer: "Have you ever been to Japan ?",
    },
    {
      id: "wb2",
      prompt_vn: "Tôi vừa mới gửi báo cáo xong.",
      words: ["I", "have", "just", "sent", "the", "report", ".", "has"],
      answer: "I have just sent the report .",
    },
    {
      id: "wb3",
      prompt_vn: "Cô ấy đã làm việc ở đây từ năm 2020.",
      words: ["She", "has", "worked", "here", "since", "2020", ".", "have"],
      answer: "She has worked here since 2020 .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s17-1",
      prompt_vn: "Bạn đã từng đến Nhật Bản chưa?",
      words: ["Have", "you", "ever", "been", "to", "Japan", "?"],
      answer: "Have you ever been to Japan ?",
    },
    {
      id: "s17-2",
      prompt_vn: "Tôi vừa mới gửi báo cáo xong.",
      words: ["I", "have", "just", "sent", "the", "report", "."],
      answer: "I have just sent the report .",
    },
    {
      id: "s17-3",
      prompt_vn: "Cô ấy đã làm việc ở đây từ năm 2020.",
      words: ["She", "has", "worked", "here", "since", "2020", "."],
      answer: "She has worked here since 2020 .",
    },
  ],


  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch: 'Tôi đã làm việc với khách hàng nước ngoài được ba năm.'", options: ["I worked with foreign clients for three years.", "I've worked with foreign clients for three years.", "I've worked with foreign clients since three years.", "I work with foreign clients for three years."], answer: "I've worked with foreign clients for three years.", explanation_vn: "Present Perfect: 'I've worked... for three years' = đã và đang làm (kéo dài đến hiện tại). Simple Past 'I worked' = đã làm xong. 'Since three years' sai — dùng 'for'." },
    { id: "fq2", type: "cloze", question: "Điền: 'Have you ___ tried Vietnamese pho? (từng)'", answer: "ever" },
    { id: "fq3", type: "multiple-choice", question: "Câu nào ĐÚNG về FOR và SINCE?", options: ["I've lived here since five years.", "I've lived here for five years.", "I've lived here since five years ago.", "I've lived here for since 2019."], answer: "I've lived here for five years.", explanation_vn: "'FOR + khoảng thời gian' (for five years). 'SINCE + mốc thời gian' (since 2019). KHÔNG nói 'since five years' hay 'for since'." },
    { id: "fq4", type: "translate", question: "Dịch sang tiếng Anh: 'Bạn đã hoàn thành báo cáo chưa?'", answer: "Have you finished the report yet?" },
    { id: "fq5", type: "multiple-choice", question: "Chọn câu ĐÚNG: Mô tả kinh nghiệm của bạn", options: ["I have never went abroad.", "I have never been abroad.", "I never have been abroad.", "I haven't never been abroad."], answer: "I have never been abroad.", explanation_vn: "Present Perfect: 'have never BEEN' — past participle của 'go' (đã đến) là 'been'. KHÔNG 'have never went'." },
    { id: "q-ex1", type: "multiple-choice", question: "Khi nào dùng Present Perfect?", options: ["Hành động xác định trong quá khứ", "Kinh nghiệm/kết quả liên quan hiện tại", "Hành động đang xảy ra", "Kế hoạch tương lai"], answer: "Kinh nghiệm/kết quả liên quan hiện tại", explanation_vn: "Present Perfect dùng khi: kinh nghiệm (ever/never), kết quả vẫn liên quan hiện tại, sự kiện gần đây (just/already/yet). KHÔNG dùng khi có thời gian cụ thể (yesterday, last week)." },
    { id: "q-ex2", type: "multiple-choice", question: "Chọn câu Present Perfect đúng:", options: ["I have saw that movie.", "I have seen that movie.", "I have see that movie.", "I seen that movie."], answer: "I have seen that movie.", explanation_vn: "Present Perfect: have/has + past participle. 'See' → past participle là 'SEEN'. KHÔNG 'saw' (Simple Past) hay 'see' sau 'have'." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'She ___ never been to London.'", answer: "has" },
    { id: "q-ex4", type: "multiple-choice", question: "Chọn đúng: 'Since' hay 'for'?", options: ["I've lived here since 5 years.", "I've lived here for 2020.", "I've lived here for 5 years.", "I've lived here since 5 years ago."], answer: "I've lived here for 5 years.", explanation_vn: "'FOR 5 years' (khoảng thời gian). 'SINCE 2020' (mốc bắt đầu). KHÔNG 'since 5 years' hay 'for 2020'." },
    { id: "q-ex5", type: "multiple-choice", question: "'Yet' đứng ở đâu trong câu phủ định?", options: ["Đầu câu", "Sau have", "Cuối câu", "Trước V3"], answer: "Cuối câu", explanation_vn: "'Yet' trong câu phủ định đứng CUỐI câu: 'I haven't finished yet.' 'Already' đứng trước V3 trong câu khẳng định: 'I've already finished.'" },
    { id: "q-ex6", type: "multiple-choice", question: "'I've just arrived.' — 'just' nghĩa là:", options: ["Chưa bao giờ", "Vừa mới", "Đã từ lâu", "Luôn luôn"], answer: "Vừa mới", explanation_vn: "'Just' trong Present Perfect = vừa mới xảy ra: 'I've just arrived' = Tôi vừa đến. 'Just' đứng giữa have/has và V3." },
    { id: "q-ex7", type: "translate", question: "Dịch: 'Tôi chưa ăn sáng.'", answer: "I haven't had breakfast yet." },
  ],


  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr17-1",
      question: "Chọn câu đúng về vị trí: (Unit 16: Prepositions of Place)",
      options: [
        "The office is in the corner of Main Street.",
        "The office is at the corner of Main Street.",
        "The office is on the corner at Main Street.",
        "The office is by of the corner.",
      ],
      answer: "The office is at the corner of Main Street.",
      type: "multiple-choice",
    },
    {
      id: "cr17-2",
      question: "Điền từ: 'Turn ___ at the traffic lights.' (Unit 16: Directions)",
      options: [],
      answer: "left",
      type: "cloze",
    },
    {
      id: "cr17-3",
      question: "Đi thẳng rồi rẽ phải ở ngã tư. (Unit 16)",
      options: [],
      answer: "Go straight and turn right at the intersection.",
      type: "translate",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "have /hæv/ vs /həv/",
    description: "Have trong Present Perfect — dạng mạnh và yếu",
    examples: [
        { word: "have (mạnh)", ipa: "/hæv/", tip: "Khi nhấn: I HAVE done it! — âm /æ/ rõ ràng" },
        { word: "I've", ipa: "/aɪv/", tip: "Trong câu: I've done it /aɪv/ — kết hợp nhanh với I" },
    ],
    minimalPairs: [
        ["I've /aɪv/", "I have /aɪ həv/"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I have worked here for 2 years", vn: "Tôi đã làm việc ở đây 2 năm" },
      { en: "She has never been to London", vn: "Cô ấy chưa bao giờ đến London" },
      { en: "Have you ever tried?", vn: "Bạn đã bao giờ thử chưa?" },
      { en: "He has just arrived", vn: "Anh ấy vừa mới đến" },
      { en: "We have already finished", vn: "Chúng tôi đã hoàn thành rồi" },
      { en: "I haven't eaten yet", vn: "Tôi chưa ăn" },
      { en: "She has worked here since 2020", vn: "Cô ấy đã làm ở đây từ 2020" },
      { en: "They have been friends for years", vn: "Họ đã là bạn bè nhiều năm" },
    ],
  },


  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit17-reading-1",
    title: "An Interview to Remember",
    title_vn: "Buổi Phỏng Vấn Đáng Nhớ",
    level: "A2" as const,
    text: `Lan has just finished her job interview at an international company. She has five years of work experience in marketing and has recently received a project management certificate. During the interview, the manager asked, "Have you ever worked with foreign clients?" Lan answered, "Yes, I have worked with overseas clients since 2021 and I have already led three successful campaigns." She has never felt so confident in an interview before. The manager was impressed. He said, "You are a very accomplished candidate. We have never seen such great results." Lan has not heard the final decision yet, but she feels very hopeful about this opportunity.`,
    questions: [
      {
        id: "unit17-q1",
        question_vn: "Lan đã làm việc với khách hàng nước ngoài từ khi nào?",
        options: [
          "Since 2019.",
          "Since 2021.",
          "For three months.",
          "Since she got her certificate.",
        ],
        answer: "Since 2021.",
        explanation_vn: "'I have worked with overseas clients since 2021' — từ năm 2021.",
      },
      {
        id: "unit17-q2",
        question_vn: "Lan đã hoàn thành bao nhiêu chiến dịch thành công?",
        options: [
          "She has led two campaigns.",
          "She has led three successful campaigns.",
          "She has achieved five campaign targets.",
          "She has never led a campaign before.",
        ],
        answer: "She has led three successful campaigns.",
        explanation_vn: "'I have already led three successful campaigns' — đã dẫn dắt ba chiến dịch thành công.",
      },
      {
        id: "unit17-q3",
        question_vn: "Điều gì mà Lan chưa từng cảm thấy trước đây trong phỏng vấn?",
        options: [
          "She has never felt nervous before.",
          "She has never felt so confident before.",
          "She has never answered questions before.",
          "She has never been to an interview before.",
        ],
        answer: "She has never felt so confident before.",
        explanation_vn: "'She has never felt so confident in an interview before' — chưa bao giờ tự tin đến vậy.",
      },
      {
        id: "unit17-q4",
        question_vn: "Lan đã nhận được kết quả phỏng vấn chưa?",
        options: [
          "Yes, she has already received the decision.",
          "No, she has not heard the final decision yet.",
          "Yes, she just got a job offer.",
          "No, she recently withdrew her application.",
        ],
        answer: "No, she has not heard the final decision yet.",
        explanation_vn: "'Lan has not heard the final decision yet' — chưa nhận được quyết định cuối cùng.",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Chia sẻ trải nghiệm phỏng vấn xin việc với đồng nghiệp",
      focus: "Present Perfect: have led, have not heard yet, have never felt so confident",
      context: "Cà phê sau phỏng vấn hoặc mentor talk với junior ở công ty",
      l1Note: "⚠️ 'I have already led three campaigns'. 'I have not heard the final decision yet'.",
      example: "I have led three successful campaigns. I have never felt so confident in an interview before."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "d_ndXSKm5po",
};

export default unit17;
