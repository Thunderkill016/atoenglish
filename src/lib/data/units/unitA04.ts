import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-4 — Chào Hỏi & Câu Xã Giao  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-4 — Chào Hỏi & Câu Xã Giao (Greetings & Small Talk)
// Grammar: "How ARE you?" — Question with verb BE
// L1 Alert: VN "Bạn khỏe không?" → direct but English has formal/informal split
// CELTA: Dialogue shows register difference (formal boss vs casual friend)
// Lewis: "How are you", "I'm fine", "Nice to see you again" as fixed chunks

export const unitA04: UnitData = {
  unitId: "unit-a0-4",
  title: "Unit A0-4: Chào Hỏi & Câu Xã Giao",
  level: "A0",
  xp: 60,
  estimatedTime: 40,
  description:
    "Học cách chào hỏi phù hợp với từng tình huống — với sếp, với bạn bè, và cách kết thúc cuộc trò chuyện lịch sự.",
  badgeName: "Người Giao Tiếp",
  badgeEmoji: "👋",


  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Sáng thứ Hai đầu tuần làm việc. Bạn gặp sếp ở thang máy, rồi gặp đồng nghiệp thân thiết ở căng-tin. Cách chào hai người này hoàn toàn khác nhau!",

  learningOutcomes: [
    "Chào hỏi đúng lúc: morning, afternoon, evening",
    "Hỏi thăm sức khỏe và trả lời: How are you? / I'm fine",
    "Kết thúc cuộc trò chuyện lịch sự: See you later / Take care",
  ],


  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Người bản ngữ thường nói <span class="text-emerald-400 font-semibold">"How are you?"</span> như một câu chào — không nhất thiết muốn nghe câu trả lời dài. Câu trả lời chuẩn nhất: <span class="text-emerald-400 font-semibold">"Fine, thanks. And you?"</span> — luôn hỏi lại!',


  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🌅",
      en: "Good morning! How are you today?",
      vn: "Chào buổi sáng! Hôm nay bạn thế nào?",
      context: "Chào hỏi trang trọng buổi sáng",
    },
    {
      emoji: "😊",
      en: "I'm fine, thanks. And you?",
      vn: "Tôi ổn, cảm ơn. Còn bạn?",
      context: "Trả lời và hỏi lại — LUÔN hỏi lại!",
    },
    {
      emoji: "👋",
      en: "See you tomorrow! Take care!",
      vn: "Hẹn gặp lại ngày mai! Bảo trọng nhé!",
      context: "Tạm biệt thân thiện",
    },
  ],


  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "morning",
      emoji: "🌅",
      phonetic: "/ˈmɔːrnɪŋ/",
      meaning: "buổi sáng",
      example: "Good morning! How are you?",
      example2: "I work every morning.",
      collocation: "good morning / this morning / Monday morning",
      audio: "/audio/unit-a0-4/morning.mp3",
      l1_interference_vn: "⚠️ 'In the morning' (buổi sáng nói chung). 'This morning' (sáng nay, không có 'in the'). 'On Monday morning' (thứ Hai sáng).",
    },
    {
      id: 2,
      word: "fine",
      emoji: "😊",
      phonetic: "/faɪn/",
      meaning: "ổn, tốt",
      example: "I'm fine, thank you!",
      example2: "Everything is fine.",
      collocation: "I'm fine / fine thanks / that's fine",
      audio: "/audio/unit-a0-4/fine.mp3",
    },
    {
      id: 3,
      word: "tired",
      l1_interference_vn: "⚠️ \'Tired\' /ˈtaɪəd/ — 2 âm tiết: \'TI-red\'. Không phát 3 âm tiết \'tai-ơ-rét\' như đọc theo chữ.",
      emoji: "😴",
      phonetic: "/ˈtaɪərd/",
      meaning: "mệt",
      example: "I'm a little tired today.",
      example2: "Are you tired after work?",
      collocation: "feel tired / very tired / a bit tired",
      audio: "/audio/unit-a0-4/tired.mp3",
    },
    {
      id: 4,
      word: "busy",
      emoji: "📋",
      phonetic: "/ˈbɪzi/",
      meaning: "bận",
      example: "I'm very busy this week.",
      example2: "Are you busy right now?",
      collocation: "very busy / too busy / busy day / busy week",
      audio: "/audio/unit-a0-4/busy.mp3",
      l1_interference_vn: "⚠️ 'Busy WITH something': 'I'm busy with work'. 'Busy doing something': 'I'm busy studying'. KHÔNG 'busy for' hay 'busy in'.",
    },
    {
      id: 5,
      word: "great",
      emoji: "🌟",
      phonetic: "/ɡreɪt/",
      meaning: "tuyệt vời, rất tốt",
      example: "I'm great! Thanks for asking.",
      example2: "That's great news!",
      collocation: "great job / feel great / that's great",
      audio: "/audio/unit-a0-4/great.mp3",
      l1_interference_vn: "⚠️ 'Great!' = tuyệt vời (informal). 'Great' cũng = vĩ đại: 'Alexander the Great'. 'Sounds great!' = câu phổ biến khi đồng ý.",
    },
    {
      id: 6,
      word: "feeling",
      emoji: "💭",
      phonetic: "/ˈfiːlɪŋ/",
      meaning: "cảm thấy (danh từ/động từ)",
      example: "How are you feeling today?",
      example2: "I'm feeling much better.",
      collocation: "how are you feeling / feeling good / feeling tired",
      audio: "/audio/unit-a0-4/feeling.mp3",
      l1_interference_vn: "⚠️ 'Feel' là stative verb — KHÔNG 'I'm feeling sick' (thường). 'I feel sick' (đúng hơn trong hầu hết ngữ cảnh).",
    },
    {
      id: 7,
      word: "today",
      emoji: "📅",
      phonetic: "/təˈdeɪ/",
      meaning: "hôm nay",
      example: "How are you today?",
      example2: "I'm busy today.",
      collocation: "today is / how are you today / later today",
      audio: "/audio/unit-a0-4/today.mp3",
      l1_interference_vn: "⚠️ 'Today' không cần giới từ: 'I have a meeting today'. KHÔNG 'in today' hay 'on today'. Tương tự: 'tomorrow', 'yesterday'.",
    },
    {
      id: 8,
      word: "weekend",
      emoji: "🎉",
      phonetic: "/ˈwiːkend/",
      meaning: "cuối tuần",
      example: "How was your weekend?",
      example2: "I relax on weekends.",
      collocation: "have a great weekend / last weekend / this weekend",
      audio: "/audio/unit-a0-4/weekend.mp3",
      l1_interference_vn: "⚠️ 'At/on the weekend'. 'This weekend' không cần giới từ. 'On weekends' = thứ Bảy và Chủ Nhật nói chung.",
    },
    {
      id: 9,
      word: "see you",
      emoji: "👋",
      phonetic: "/siː juː/",
      meaning: "hẹn gặp lại",
      example: "See you tomorrow!",
      example2: "See you later!",
      collocation: "see you later / see you tomorrow / see you soon / nice to see you",
      audio: "/audio/unit-a0-4/seeyou.mp3",
      l1_interference_vn: "⚠️ 'See you later/tomorrow/soon' — KHÔNG thêm giới từ: 'See you at tomorrow' (SAI). Dùng trực tiếp: 'See you Monday!'",
    },
    {
      id: 10,
      word: "take care",
      emoji: "🤗",
      phonetic: "/teɪk keər/",
      meaning: "bảo trọng",
      example: "Take care! See you soon.",
      example2: "Take care of yourself.",
      collocation: "take care / take care of / take good care",
      audio: "/audio/unit-a0-4/takecare.mp3",
      l1_interference_vn: "⚠️ 'Take care' = lời chào tạm biệt HOẶC 'cẩn thận'. 'Take care OF' = chăm sóc. Ba nghĩa rất khác nhau!",
    },
  ],


  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "How ARE you? — Hỏi thăm với Verb BE",
    rule: "How + ARE/IS + Chủ ngữ? → Hỏi về trạng thái, cảm giác của ai đó.",

    conjugation: [
      { subject: "How are", form: "YOU?",     example: "How are you? — I'm fine!" },
      { subject: "How is",  form: "HE/SHE?",  example: "How is she? — She's great!" },
      { subject: "How are", form: "THEY?",    example: "How are they? — They're busy." },
    ],

    examples: [
      { en: "How are you today?",       vn: "Hôm nay bạn thế nào?" },
      { en: "I'm fine, thanks!",        vn: "Tôi ổn, cảm ơn!" },
      { en: "I'm a little tired.",      vn: "Tôi hơi mệt một chút." },
      { en: "How was your weekend?",    vn: "Cuối tuần của bạn thế nào?" },
    ],

    tip: "Khi ai hỏi 'How are you?' — LUÔN hỏi lại 'And you?' hoặc 'How about you?' Đây là lịch sự cơ bản trong văn hóa Anh-Mỹ!",

    vnNote:
      "⚠️ Formal vs Informal — người Việt thường không phân biệt:\n\n" +
      "VỚI SẾP/NGƯỜI LỚN:\n" +
      "✅ 'Good morning! How are you today?' (trang trọng)\n" +
      "✅ 'Fine, thank you. And you?' (trả lời đầy đủ)\n\n" +
      "VỚI BẠN BÈ:\n" +
      "✅ 'Hey! How's it going?' (thân mật)\n" +
      "✅ 'Not bad! You?' (ngắn gọn)\n\n" +
      "❌ ĐỪNG nói 'How are you?' với bạn thân — nghe rất cứng nhắc!\n" +
      "❌ ĐỪNG trả lời dài về bệnh tật — 'fine thanks' là đủ với người lạ",

    dialogueExample: {
      speaker: "Minh",
      text: "Good morning! How are you today?",
      translation: "Chào buổi sáng! Hôm nay bạn thế nào?",
      highlight: "are",
    },

    ccq: {
      question: "Trả lời nào PHÙ HỢP nhất khi sếp hỏi 'How are you?'",
      options: [
        "I am very sick and tired today.",
        "Fine, thank you. And you?",
        "Not your business.",
        "I don't know.",
      ],
      answer: "Fine, thank you. And you?",
    },
  },


  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối lời chào với thời điểm phù hợp",
    pairs: [
      { left: "Good morning",   right: "6am – 12pm" },
      { left: "Good afternoon", right: "12pm – 6pm" },
      { left: "Good evening",   right: "6pm – 9pm" },
      { left: "Good night",     right: "Khi đi ngủ" },
      { left: "See you later",  right: "Tạm biệt thân thiện" },
    ],
  },


  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq4-1",
      question: "Trả lời phù hợp nhất khi nghe 'How are you?'",
      options: [
        "I am from Vietnam.",
        "Fine, thanks. And you?",
        "My name is Minh.",
        "It's a good day.",
      ],
      answer: "Fine, thanks. And you?",
      type: "multiple-choice",
    },
    {
      id: "pq4-2",
      question: "Điền từ: 'I'm a little ___ today. Too much work!'",
      options: [],
      answer: "tired",
      type: "cloze",
    },
    {
      id: "pq4-3",
      question: "Câu nào dùng với BẠN BÈ (không trang trọng)?",
      options: [
        "Good morning, how do you do?",
        "Hey! How's it going?",
        "Good day, how are you today?",
        "Greetings, how are you?",
      ],
      answer: "Hey! How's it going?",
      type: "multiple-choice",
    },
    {
      id: "pq4-4",
      question: "Điền từ: 'How was your ___?' (cuối tuần)",
      options: [],
      answer: "weekend",
      type: "cloze",
    },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt4-1",
      prompt_vn: "Chào buổi sáng! Hôm nay bạn thế nào?",
      answer: "Good morning! How are you today?",
    },
    {
      id: "pt4-2",
      prompt_vn: "Tôi ổn, cảm ơn. Còn bạn?",
      answer: "I'm fine, thanks. And you?",
    },
    {
      id: "pt4-3",
      prompt_vn: "Tôi hơi mệt — tuần này bận lắm.",
      answer: "I'm a little tired — it's a busy week.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A04-1",
      sentence: "Thank you. You welcome.",
      errorWord: "You welcome",
      correction: "You're welcome",
      explanation_vn: "Đáp lại lời cảm ơn: 'You're welcome' (viết tắt của 'You are welcome'). Không nói 'You welcome'.",
    },
    {
      id: "sc-A04-2",
      sentence: "Good morning! How you?",
      errorWord: "How you",
      correction: "How are you",
      explanation_vn: "Câu hỏi thăm cần 'to be': 'How ARE you?' — không bỏ 'are'. Lỗi phổ biến khi dịch từ tiếng Việt.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA04-1",
      audio_text: "Good morning how are you today?",
      prompt_vn: "Chào buổi sáng bạn có khỏe không?",
      words: ["Good", "morning", "how", "are", "you", "today", "?", "How you", "Good day"],
      answer: "Good morning how are you today ?",
    },
    {
      id: "laA04-2",
      audio_text: "I am fine thank you very much.",
      prompt_vn: "Tôi khỏe cảm ơn bạn rất nhiều.",
      words: ["I", "am", "fine", "thank", "you", "very", "much", ".", "I fine", "Thanks"],
      answer: "I am fine thank you very much .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Hôm nay bạn thế nào?",
      words: ["How", "are", "you", "today", "?", "is"],
      answer: "How are you today ?",
    },
    {
      id: "wb2",
      prompt_vn: "Tôi tuyệt lắm, cảm ơn! Còn bạn?",
      words: ["I'm", "great,", "thanks!", "And", "you", "?", "is", "are"],
      answer: "I'm great, thanks! And you ?",
    },
    {
      id: "wb3",
      prompt_vn: "Bảo trọng! Hẹn gặp ngày mai!",
      words: ["Take", "care!", "See", "you", "tomorrow", "!", "is", "are"],
      answer: "Take care! See you tomorrow !",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s4-1",
      prompt_vn: "Hôm nay bạn thế nào?",
      words: ["How", "are", "you", "today", "?"],
      answer: "How are you today ?",
    },
    {
      id: "s4-2",
      prompt_vn: "Tôi tuyệt lắm, cảm ơn! Còn bạn?",
      words: ["I'm", "great,", "thanks!", "And", "you", "?"],
      answer: "I'm great, thanks! And you ?",
    },
    {
      id: "s4-3",
      prompt_vn: "Bảo trọng! Hẹn gặp ngày mai!",
      words: ["Take", "care!", "See", "you", "tomorrow", "!"],
      answer: "Take care! See you tomorrow !",
    },
  ],


  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Buổi sáng ở văn phòng — Gặp sếp",
      audio: "/audio/unit-a0-4/dialogue_1.mp3",
      desc: "Minh gặp sếp ở thang máy sáng thứ Hai — cần chào hỏi trang trọng.",
      lines: [
        {
          id: "d4-1-1",
          speaker: "Boss",
          text: "Good morning, Minh! How are you today?",
          translation: "Chào buổi sáng, Minh! Hôm nay bạn thế nào?",
        },
        {
          id: "d4-1-2",
          speaker: "Minh",
          text: "Good morning! I'm fine, thank you. A little tired — it's Monday morning! And you?",
          translation: "Chào buổi sáng! Tôi ổn, cảm ơn. Hơi mệt — sáng thứ Hai mà! Còn sếp?",
        },
        {
          id: "d4-1-3",
          speaker: "Boss",
          text: "I'm great, thanks! How was your weekend?",
          translation: "Tôi tuyệt lắm, cảm ơn! Cuối tuần của bạn thế nào?",
        },
        {
          id: "d4-1-4",
          speaker: "Minh",
          text: "It was great! I was not busy at all. Very relaxing.",
          translation: "Rất tuyệt! Tôi không bận chút nào. Rất thư giãn.",
        },
        {
          id: "d4-1-5",
          speaker: "Boss",
          text: "Good! See you at the meeting at nine. Take care!",
          translation: "Tốt! Hẹn gặp ở cuộc họp lúc chín giờ. Bảo trọng!",
        },
        {
          id: "d4-1-6",
          speaker: "Minh",
          text: "See you then! Have a good morning!",
          translation: "Hẹn gặp lúc đó! Chúc buổi sáng tốt lành!",
        },
      ],
    },
    {
      id: 2,
      title: "Gặp bạn bè — Không trang trọng",
      audio: "/audio/unit-a0-4/dialogue_2.mp3",
      desc: "Minh gặp bạn thân Linh ở căng-tin — chào theo kiểu thân mật.",
      lines: [
        {
          id: "d4-2-1",
          speaker: "Linh",
          text: "Hey Minh! How's it going today?",
          translation: "Này Minh! Hôm nay thế nào?",
        },
        {
          id: "d4-2-2",
          speaker: "Minh",
          text: "Not bad! A little tired — feeling very busy this week. You?",
          translation: "Không tệ! Hơi mệt — cảm thấy bận lắm tuần này. Còn mày?",
        },
        {
          id: "d4-2-3",
          speaker: "Linh",
          text: "Same! So busy. How was your weekend though?",
          translation: "Mình cũng vậy! Bận lắm. Nhưng cuối tuần của mày thế nào?",
        },
        {
          id: "d4-2-4",
          speaker: "Minh",
          text: "Great! I was not busy at all. Just chilled. See you at lunch?",
          translation: "Tuyệt! Mình không bận chút nào. Chỉ thư giãn thôi. Hẹn gặp lúc ăn trưa?",
        },
        {
          id: "d4-2-5",
          speaker: "Linh",
          text: "Sure! See you later. Take care!",
          translation: "Được! Hẹn gặp sau. Bảo trọng!",
        },
      ],
    },
  ],


  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac4-1",
      audio_text: "Fine thanks and you",
      options: ["Fine thanks and you", "Fine thanks for you", "I'm fine and you", "Fine thank you"],
      answer: "Fine thanks and you",
    },
    {
      id: "lac4-2",
      audio_text: "How was your weekend",
      options: [
        "How was your weekend",
        "How is your weekend",
        "How was your week",
        "How were your weekend",
      ],
      answer: "How was your weekend",
    },
    {
      id: "lac4-3",
      audio_text: "See you tomorrow take care",
      options: [
        "See you tomorrow take care",
        "See you tomorrow be careful",
        "See you later take care",
        "See you tomorrow good care",
      ],
      answer: "See you tomorrow take care",
    },
    {
      id: "lac4-4",
      audio_text: "I am a little tired today",
      options: ["Hôm nay tôi hơi mệt", "Hôm nay tôi rất bận", "Hôm nay tôi hơi buồn", "Hôm nay tôi rất vui"],
      answer: "Hôm nay tôi hơi mệt",
    },
    {
      id: "lac4-5",
      audio_text: "Good morning how are you today",
      options: ["Chào buổi sáng! Hôm nay bạn thế nào?", "Chào buổi chiều! Hôm nay bạn thế nào?", "Chào buổi tối! Hôm nay bạn thế nào?", "Chào buổi sáng! Tuần này bạn thế nào?"],
      answer: "Chào buổi sáng! Hôm nay bạn thế nào?",
    },
  ],


  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "crA04-1",
      question: "'Màu xanh lá' trong tiếng Anh là gì? (unitA03 - Màu sắc)",
      options: ["Red", "Blue", "Green", "Yellow"],
      answer: "Green",
      type: "multiple-choice",
    },
    {
      id: "crA04-2",
      question: "'Màu đỏ' trong tiếng Anh là gì? (unitA03 - Màu sắc)",
      options: ["Red", "Green", "Blue", "Black"],
      answer: "Red",
      type: "multiple-choice",
    },
    {
      id: "crA04-3",
      question: "Dịch sang tiếng Anh: 'Màu trắng' (unitA03)",
      options: [],
      answer: "White",
      type: "translate",
    },
    {
      id: "crA04-4",
      question: "Dịch sang tiếng Anh: 'Màu đen' (unitA03)",
      options: [],
      answer: "Black",
      type: "translate",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/æ/ vs /e/",
    description: "Phân biệt CAT /æ/ và BED /e/",
    examples: [
      { word: "bad", ipa: "/bæd/", tip: "Hạ hàm thấp nhất, kéo góc miệng ra — khác với 'bed'" },
      { word: "bed", ipa: "/bed/", tip: "Miệng mở vừa, không kéo căng như /æ/" },
    ],
    minimalPairs: [
      ["bad /æ/", "bed /e/"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Luyện nhanh: Chào hỏi đầy đủ",
    items: [
      { en: "Good morning!",                    vn: "Chào buổi sáng!" },
      { en: "How are you today?",               vn: "Hôm nay bạn thế nào?" },
      { en: "Fine, thanks. And you?",           vn: "Ổn, cảm ơn. Còn bạn?" },
      { en: "I'm a little tired.",              vn: "Tôi hơi mệt." },
      { en: "I'm very busy this week.",         vn: "Tuần này tôi rất bận." },
      { en: "How was your weekend?",            vn: "Cuối tuần bạn thế nào?" },
      { en: "See you later!",                   vn: "Hẹn gặp sau!" },
      { en: "Take care!",                       vn: "Bảo trọng!" },
    ],
  },


  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "Good morning! I'm {input} today.",
    level1Placeholder: "Nhập trạng thái: fine / tired / great / busy...",
    level2Situation:
      "Đóng vai Minh. Sếp gặp bạn và hỏi 'How are you today?' — Hãy trả lời đầy đủ, hỏi lại sếp, và nói thêm về cuối tuần.",
    level2Hint: "Fine, thanks! And you? / My weekend was... / See you at the meeting!",
  },


  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q4-1",
      question: "Trả lời phù hợp nhất khi sếp hỏi 'How are you?'",
      options: [
        "I am sick and very tired.",
        "Fine, thank you. And you?",
        "None of your business.",
        "I don't know how I am.",
      ],
      answer: "Fine, thank you. And you?",
      type: "multiple-choice",
    },
    {
      id: "q4-2",
      question: "Điền từ: 'I'm a little ___ — too much work today.'",
      options: [],
      answer: "tired",
      type: "cloze",
    },
    {
      id: "q4-3",
      question: "Câu chào nào TRANG TRỌNG nhất (dùng với sếp)?",
      options: [
        "Hey! What's up?",
        "Good morning! How are you today?",
        "Yo! How's it going?",
        "Hi! 'Sup?",
      ],
      answer: "Good morning! How are you today?",
      type: "multiple-choice",
    },
    {
      id: "q4-4",
      question: "Điền từ: 'How ___ your weekend?' (quá khứ)",
      options: [],
      answer: "was",
      type: "cloze",
    },
    {
      id: "q4-5",
      question: "Hôm nay bạn thế nào? (Dịch sang tiếng Anh)",
      options: [],
      answer: "How are you today?",
      type: "translate",
    },
    {
      id: "q4-6",
      question: "Tôi hơi mệt — tuần này bận lắm. (Dịch sang tiếng Anh)",
      options: [],
      answer: "I'm a little tired — it's a busy week.",
      type: "translate",
    },
    {
      id: "q4-7",
      question: "Bảo trọng! Hẹn gặp ngày mai! (Dịch sang tiếng Anh)",
      options: [],
      answer: "Take care! See you tomorrow!",
      type: "translate",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA04-reading-1",
    title: "Good Morning!",
    title_vn: "Đọc đoạn chào hỏi buổi sáng",
    level: "A0" as const,
    text:
      "Good morning! My name is Lan. " +
      "How are you? " +
      "I am fine, thank you! " +
      "This is my friend Tom. " +
      "Nice to meet you, Tom! " +
      "Goodbye! See you tomorrow!",
    questions: [
      {
        id: "uA04r-q1",
        question_vn: "Tên của người kể chuyện là gì?",
        options: ["Tom", "Mai", "Lan", "Nam"],
        answer: "Lan",
        explanation_vn: "'My name is Lan.'",
      },
      {
        id: "uA04r-q2",
        question_vn: "Người kể chuyện cảm thấy thế nào?",
        options: ["Tired", "Sad", "Fine", "Happy"],
        answer: "Fine",
        explanation_vn: "'I am fine, thank you!'",
      },
      {
        id: "uA04r-q3",
        question_vn: "Bạn của người kể chuyện tên là gì?",
        options: ["Nam", "Tom", "Mai", "Hoa"],
        answer: "Tom",
        explanation_vn: "'This is my friend Tom.'",
      },
      {
        id: "uA04r-q4",
        question_vn: "Người kể chuyện sẽ gặp Tom lại khi nào?",
        options: [
          "This afternoon",
          "Next week",
          "Tomorrow",
          "Next Monday",
        ],
        answer: "Tomorrow",
        explanation_vn: "'See you tomorrow!'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "sNvmqN2MBBo", // BBC Learning English — Greetings & small talk
  jobScenarios: [
    {
      id: 1,
      title: "Nói về kỹ năng máy tính cơ bản khi apply entry job",
      focus: "Office tools: email, Word, Excel basics for job",
      context: "Phỏng vấn hoặc training entry admin/sales",
      l1Note: "⚠️ 'I can use email and Microsoft Word.' 'I know basic Excel formulas.'",
      example: "I can send professional emails and use Word to write reports. I also know how to make simple tables in Excel."
    }
  ], 
};


