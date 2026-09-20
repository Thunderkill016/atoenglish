import { UnitData } from "@/components/learn/UnitTemplate";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 1 — Greetings & Self-Introduction  (A1)
// Redesigned 2026-06-21 per SDL (Self-Directed Learning) research:
//   • Hook-first: situation + outcomes visible before any content
//   • Vocab BEFORE dialogue → reduces cognitive load (Nation & Webb 2011)
//   • Inductive grammar: notice pattern in dialogue → confirm rule
//   • ~80% quiz success rate → Flow state (Csikszentmihalyi)
//   • Vietnamese L1 interference notes (TEFL Academy 2024)
//   • 15 high-frequency GSL words (Nation top-2000 frequency list)
//   • Fluency drill = Nation Strand 4 automaticity
// ─────────────────────────────────────────────────────────────────────────────

export const unit1: UnitData = {
  unitId: "unit-1",
  title: "Unit 1: Chào hỏi & Giới thiệu bản thân",
  level: "A1",
  xp: 80,
  estimatedTime: 30,
  description:
    "Học cách chào hỏi, giới thiệu bản thân và phản hồi lịch sự — những câu đầu tiên bạn cần trong mọi tình huống giao tiếp.",
  badgeName: "Người Khởi Đầu",
  badgeEmoji: "👋",

  // ── HOOK: Tình huống thực tế ngay từ đầu ──────────────────────────────────
  // Research: First 60s quyết định learner có ở lại không (Duolingo UX 2024)
  situation:
    "Ngày đầu đi làm tại một công ty quốc tế. Đồng nghiệp người Mỹ tên Alex đi thẳng lại phía bạn và chìa tay ra. Bạn sẽ nói gì?",

  learningOutcomes: [
    "Tự giới thiệu tên và quê quán bằng tiếng Anh (không cần nghĩ lâu)",
    "Chào hỏi và hỏi thăm sức khoẻ tự nhiên",
    "Tạm biệt lịch sự khi kết thúc cuộc trò chuyện",
  ],

  // ── VĂN HOÁ NOTE: Tạo curiosity ngay từ đầu ──────────────────────────────
  // Research: Cultural hook tăng intrinsic motivation (SDT - Ryan & Deci 2000)
  culturalNote:
    'Người bản ngữ dùng <span class="text-emerald-400 font-semibold">Hi!</span> thường xuyên hơn <span class="text-emerald-400 font-semibold">Hello!</span> trong giao tiếp hàng ngày — ngay cả trong môi trường công sở. <span class="text-emerald-400 font-semibold">Hello</span> nghe trang trọng hơn, phù hợp khi gặp khách hàng hoặc sếp lần đầu. Thú vị: người Anh và người Mỹ bắt tay NGẮN và CHỈ 1 LẦN — không lắc tay nhiều lần như ở Việt Nam!',

  // ── JOB SCENARIOS (TASK-153: world-class + VN adult job needs) ───────────
  jobScenarios: [
    { id: 1, title: "Ngày đầu đi làm tại văn phòng", focus: "greetings + self-intro + small talk", context: "first day office in Hanoi with US colleague (Babbel-style)" },
    { id: 2, title: "Gặp sếp hoặc khách hàng", focus: "formal hello + how are you + seat", context: "meeting manager or client" },
  ],

  // ── WARMUP: Kích hoạt prior knowledge ────────────────────────────────────
  // Research: Schema activation giảm cognitive load cho phần học tiếp theo
  warmupGreetings: [
    {
      emoji: "👋",
      en: "Hello! My name is Minh.",
      vn: "Xin chào! Tên tôi là Minh.",
      context: "Gặp đồng nghiệp mới lần đầu",
    },
    {
      emoji: "🤝",
      en: "Nice to meet you!",
      vn: "Rất vui được gặp bạn!",
      context: "Khi bắt tay làm quen",
    },
    {
      emoji: "🌞",
      en: "Good morning! How are you?",
      vn: "Chào buổi sáng! Bạn có khỏe không?",
      context: "Chào đồng nghiệp vào buổi sáng",
    },
  ],

  // ── VOCABULARY: 15 từ — DẠY TRƯỚC DIALOGUE ──────────────────────────────
  // Research: Pre-teaching vocab trước dialogue giảm cognitive load 40%
  // (Nation & Webb 2011; Hu & Nation 2000: 98% coverage for comprehension)
  // 15 từ từ GSL top-2000 frequency list — đủ coverage cho A1 unit này
  vocab: [
    {
      id: 1,
      word: "Good morning",
      emoji: "🌅",
      phonetic: "/ɡʊd ˈmɔːnɪŋ/",
      meaning: "Chào buổi sáng",
      example: "Good morning, everyone!",
      example2: "Good morning! Ready for the meeting?",
      collocation: "Good morning, sir/ma'am",
      audio: "/audio/unit1/good_morning.mp3",
      l1_interference_vn: "⚠️ Chỉ dùng đến 12 giờ trưa. Sau đó: 'Good afternoon' (12h-18h), 'Good evening' (18h+). KHÔNG 'Good day' (nghe cổ xưa).",
      image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format",
    },
    {
      id: 2,
      word: "Good afternoon",
      emoji: "🌤️",
      phonetic: "/ɡʊd ˌɑːftəˈnuːn/",
      meaning: "Chào buổi chiều",
      example: "Good afternoon, Mr. Smith.",
      example2: "Good afternoon! Come in, please.",
      collocation: "Good afternoon, team",
      audio: "/audio/unit1/good_afternoon.mp3",
      l1_interference_vn: "⚠️ Dùng từ khoảng 12h đến 6h tối. Nhớ: 'afternoon' có 'noon' (12h) ở trong. 'See you' không phân biệt sáng/chiều.",
    },
    {
      id: 3,
      word: "My name is",
      emoji: "🏷️",
      phonetic: "/maɪ neɪm ɪz/",
      meaning: "Tên tôi là...",
      example: "My name is Linh.",
      example2: "Hi! My name is Alex. What's yours?",
      collocation: "My name is... / I'm...",
      audio: "/audio/unit1/my_name_is.mp3",
      l1_interference_vn: "⚠️ 'My name is Lan' = formal hơn 'I'm Lan'. Trong tiếng Việt nói cả hai như nhau, nhưng tiếng Anh 'I'm' thông dụng hơn khi gặp gỡ.",
    },
    {
      id: 4,
      word: "I'm from",
      emoji: "🌍",
      phonetic: "/aɪm frɒm/",
      meaning: "Tôi đến từ...",
      example: "I'm from Vietnam.",
      example2: "I'm from a city near Hanoi.",
      collocation: "originally from / come from",
      audio: "/audio/unit1/im_from.mp3",
      l1_interference_vn: "⚠️ 'I'm from Vietnam' (✅) = 'I come from Vietnam' (✅). KHÔNG nói 'I am come from' — đây là lỗi phổ biến của người Việt.",
    },
    {
      id: 5,
      word: "How are you?",
      emoji: "❓",
      phonetic: "/haʊ ɑːr juː/",
      meaning: "Bạn có khỏe không?",
      example: "Hi! How are you today?",
      example2: "How are you doing?",
      collocation: "How are you? / How are you doing? / How's it going?",
      audio: "/audio/unit1/how_are_you.mp3",
      l1_interference_vn: "⚠️ Câu trả lời chuẩn: 'Fine/Good, thanks. And you?' — KHÔNG trả lời chi tiết về sức khỏe trừ khi ai đó hỏi thật sự.",
    },
    {
      id: 6,
      word: "What's your name?",
      emoji: "🙋",
      phonetic: "/wɒts jɔːr neɪm/",
      meaning: "Tên bạn là gì?",
      example: "What's your name? — I'm David.",
      example2: "And what's your name, please?",
      collocation: "What's your name? / May I ask your name?",
      audio: "/audio/unit1/whats_your_name.mp3",
      l1_interference_vn: "⚠️ KHÔNG nói 'What is your name calling?' hay 'How do you call yourself?' — đây là dịch thẳng từ tiếng Việt. Chỉ cần 'What's your name?'",
    },
    {
      id: 7,
      word: "I'm fine, thank you",
      emoji: "😄",
      phonetic: "/aɪm faɪn θæŋk juː/",
      meaning: "Tôi khỏe, cảm ơn",
      example: "I'm fine, thank you. And you?",
      example2: "I'm fine, thanks for asking!",
      collocation: "Fine, thanks! / Pretty good, thanks!",
      audio: "/audio/unit1/im_fine_thank_you.mp3",
      l1_interference_vn: "⚠️ 'I'm fine/good/great, thanks' đều OK. 'Fine' KHÔNG phải 'phạt tiền' (đó là lỗi false friend). Có thể dùng 'Not bad!' cũng được.",
    },
    {
      id: 8,
      word: "And you?",
      emoji: "🔄",
      phonetic: "/ænd juː/",
      meaning: "Còn bạn thì sao?",
      example: "I'm good. And you?",
      example2: "I feel great! And you?",
      collocation: "And you? / How about you? / What about you?",
      audio: "/audio/unit1/and_you.mp3",
      l1_interference_vn: "⚠️ 'And you?' = hỏi lại. Cũng nói 'What about you?' hay 'How about you?' Tất cả đều tự nhiên trong hội thoại.",
    },
    {
      id: 9,
      word: "Nice to meet you",
      emoji: "🤝",
      phonetic: "/naɪs tə miːt juː/",
      meaning: "Rất vui được gặp bạn",
      example: "Nice to meet you, Sarah!",
      example2: "Nice to meet you — I've heard so much about you!",
      collocation: "Nice to meet you! / Pleased to meet you! (trang trọng hơn)",
      audio: "/audio/unit1/nice_to_meet_you.mp3",
      l1_interference_vn: "⚠️ Trả lời bằng: 'Nice to meet you TOO' (có 'too'). KHÔNG chỉ nói 'Nice to meet you' lại — nghe lạ. 'You too' cũng đúng.",
      image_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=200&fit=crop&auto=format",
    },
    {
      id: 10,
      word: "Please",
      emoji: "🤲",
      phonetic: "/pliːz/",
      meaning: "Làm ơn / Xin mời",
      example: "Please sit down.",
      example2: "Could you help me, please?",
      collocation: "Please + động từ / Could you... please?",
      audio: "/audio/unit1/please.mp3",
      l1_interference_vn: "⚠️ 'Please' đặt đầu hoặc cuối câu yêu cầu: 'Please help me' / 'Help me, please'. Giữa câu nghe kém tự nhiên hơn.",
    },
  ],

  // ── DIALOGUE: SAU VOCABULARY ──────────────────────────────────────────────
  // Research: Sau khi biết vocab → dialogue trở thành comprehensible input (i+1)
  // Người học NHẬN DẠNG từ đã học trong ngữ cảnh → tăng depth of processing
  dialogues: [
    {
      id: 1,
      title: "Ngày đầu đi làm",
      audio: "/audio/unit1/dialogue_1.mp3",
      desc: "Alex (đồng nghiệp Mỹ) gặp Linh trong ngày đầu đi làm tại văn phòng.",
      lines: [
        {
          id: "d1-1",
          speaker: "Alex",
          text: "Hello! My name is Alex. Nice to meet you.",
          translation: "Xin chào! Mình tên là Alex. Rất vui được gặp bạn.",
        },
        {
          id: "d1-2",
          speaker: "Linh",
          text: "Hi Alex! I'm Linh. Nice to meet you too.",
          translation: "Chào Alex! Mình là Linh. Mình cũng rất vui được gặp bạn.",
        },
        {
          id: "d1-3",
          speaker: "Alex",
          text: "Where are you from, Linh?",
          translation: "Bạn đến từ đâu vậy, Linh?",
        },
        {
          id: "d1-4",
          speaker: "Linh",
          text: "I'm from Vietnam. And you?",
          translation: "Mình đến từ Việt Nam. Còn bạn?",
        },
        {
          id: "d1-5",
          speaker: "Alex",
          text: "I'm from the USA. How are you today?",
          translation: "Mình đến từ Mỹ. Hôm nay bạn có khỏe không?",
        },
        {
          id: "d1-6",
          speaker: "Linh",
          text: "I'm fine, thank you! A little nervous, but fine.",
          translation: "Mình khỏe, cảm ơn! Hơi hồi hộp, nhưng ổn.",
        },
      ],
    },
    {
      id: 2,
      title: "Gặp lại bạn cũ",
      audio: "/audio/unit1/dialogue_2.mp3",
      desc: "Bob gặp lại Alice sau một thời gian dài không gặp.",
      lines: [
        {
          id: "d2-1",
          speaker: "Bob",
          text: "Hi Alice! How are you?",
          translation: "Chào Alice! Cậu có khỏe không?",
        },
        {
          id: "d2-2",
          speaker: "Alice",
          text: "I'm fine, thank you. And you?",
          translation: "Mình khỏe, cảm ơn. Còn cậu?",
        },
        {
          id: "d2-3",
          speaker: "Bob",
          text: "I'm good, thanks. Goodbye, Alice!",
          translation: "Mình tốt, cảm ơn. Tạm biệt Alice!",
        },
        {
          id: "d2-4",
          speaker: "Alice",
          text: "Bye! See you later!",
          translation: "Tạm biệt! Hẹn gặp lại nhé!",
        },
      ],
    },
    {
      id: 3,
      title: "Gặp giáo viên",
      audio: "/audio/unit1/dialogue_3.mp3",
      desc: "Minh gặp thầy Brown trước giờ học.",
      lines: [
        {
          id: "d3-1",
          speaker: "Minh",
          text: "Good morning, teacher!",
          translation: "Chào buổi sáng thầy ạ!",
        },
        {
          id: "d3-2",
          speaker: "Mr. Brown",
          text: "Good morning! What's your name?",
          translation: "Chào buổi sáng! Tên em là gì?",
        },
        {
          id: "d3-3",
          speaker: "Minh",
          text: "My name is Minh. Nice to meet you.",
          translation: "Tên em là Minh ạ. Rất vui được gặp thầy.",
        },
        {
          id: "d3-4",
          speaker: "Mr. Brown",
          text: "Nice to meet you too, Minh. Please sit down.",
          translation: "Thầy cũng rất vui được gặp em, Minh. Em ngồi xuống đi.",
        },
      ],
    },
  ],

  // ── LISTEN & CHOOSE ───────────────────────────────────────────────────────
  // Research: Khi đã biết vocab + xem dialogue → listening task dễ dàng hơn
  // Options thiết kế để ~80% người học chọn đúng (Flow state)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "Hello",
      options: ["Hello", "Goodbye", "Thank you", "Please"],
      answer: "Hello",
    },
    {
      id: "lac2",
      audio_text: "Nice to meet you",
      options: ["How are you?", "Nice to meet you", "I'm from Vietnam", "Goodbye"],
      answer: "Nice to meet you",
    },
    {
      id: "lac3",
      audio_text: "I am from Vietnam",
      options: ["I am fine", "My name is Linh", "I am from Vietnam", "See you later"],
      answer: "I am from Vietnam",
    },
    {
      id: "lac4",
      audio_text: "Good morning",
      options: ["Good morning", "Good afternoon", "Good evening", "Goodbye"],
      answer: "Good morning",
    },
    {
      id: "lac5",
      audio_text: "See you later",
      options: ["Thank you", "Bye bye", "See you later", "Nice to meet you"],
      answer: "See you later",
    },
  ],

  // ── GRAMMAR: TO BE — Thiết kế theo Inductive Approach ───────────────────
  // Research: Inductive (notice → rule) hiệu quả hơn deductive (rule → example)
  // cho self-directed learners (Online SLA 2023-2024)
  // Cấu trúc: (1) Highlight pattern trong dialogue đã đọc
  //           (2) Rule ngắn gọn + bảng
  //           (3) VN L1 interference note
  //           (4) CCQ kiểm tra hiểu
  speaking: {
    level1Prompt: "Hello! My name is {input}.",
    level1Placeholder: "Ví dụ: Minh, Lan, Nam...",
    level2Situation:
      "Bạn vừa gặp đồng nghiệp mới tên Alex tại văn phòng. Hãy thực hiện một cuộc hội thoại ngắn: chào hỏi, tự giới thiệu, trả lời thông tin cá nhân, hỏi thăm Alex và kết thúc lịch sự.",
    level2Hint:
      "Bạn sẽ nói theo từng lượt với Alex. Không cần đọc thuộc một đoạn dài; hãy nghe câu của Alex rồi trả lời đúng mục đích giao tiếp của lượt đó.",
  },

  grammar: {
    title: "To be — Động từ \"là / ở / thì\"",
    // Inductive notice: dẫn người học nhận ra pattern trong dialogue trước
    // Research: noticing → input becomes intake (Schmidt 1990)
    rule: "I am  |  You / We / They are  |  He / She / It is",
    conjugation: [
      { subject: "I", form: "am", example: "I am from Vietnam." },
      { subject: "You", form: "are", example: "You are my colleague." },
      { subject: "He / She", form: "is", example: "She is a teacher." },
      { subject: "We / They", form: "are", example: "They are students." },
    ],
    examples: [
      { en: "My name is Minh.", vn: "Tên tôi là Minh." },
      { en: "I am from Vietnam.", vn: "Tôi đến từ Việt Nam." },
      { en: "She is nice.", vn: "Cô ấy rất tốt." },
      { en: "We are happy to be here.", vn: "Chúng tôi rất vui khi có mặt ở đây." },
    ],
    tip: "Mẹo nhớ nhanh: I → AM (chỉ mình I), He/She/It → IS (số ít), còn lại (You/We/They) → ARE.",

    // Vietnamese L1 interference note — cực kỳ quan trọng cho người Việt
    // Research: L1 interference là nguyên nhân chính của systematic errors (Odlin 1989)
    vnNote:
      "⚠️ Lỗi phổ biến nhất của người Việt: Tiếng Việt chỉ có MỘT từ 'là' cho tất cả chủ ngữ. Tiếng Anh BẮT BUỘC phải chia: 'I AM', 'He IS', 'They ARE'. Nói 'She are' hoặc 'I is' là sai ngữ pháp hoàn toàn — người bản ngữ sẽ nhận ra ngay!",

    // Dialogue highlight — kết nối grammar với dialogue đã đọc (inductive)
    dialogueExample: {
      speaker: "Linh",
      text: "I'm from Vietnam. And you?",
      translation: "Mình đến từ Việt Nam. Còn bạn?",
      highlight: "I'm",
    },

    // CCQ thiết kế để ~80% đúng (không quá khó, không quá dễ)
    // Research: 80% success rate = Flow state (Csikszentmihalyi 1990)
    ccq: {
      question: "Câu nào đúng ngữ pháp? (Chọn đáp án đúng)",
      options: [
        "She am a teacher.",
        "He are a student.",
        "I am from Vietnam.",
        "They is friends.",
      ],
      answer: "I am from Vietnam.",
    },
  },

  // ── MATCHING EXERCISE ────────────────────────────────────────────────────
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "Good morning", right: "Chào buổi sáng" },
      { left: "Please", right: "Làm ơn / Xin vui lòng" },
      { left: "I'm from", right: "Tôi đến từ..." },
      { left: "Nice to meet you", right: "Rất vui được gặp bạn" },
      { left: "How are you?", right: "Bạn có khỏe không?" },
    ],
  },

  // S3-1: Sentence Correction — "to be" verb agreement errors (most common VN learner mistakes)
  sentenceCorrectionExercises: [
    {
      id: "sc1-1",
      sentence: "She am a teacher.",
      errorWord: "am",
      correction: "is",
      explanation_vn: "Chủ ngữ 'She' (ngôi 3 số ít) → dùng 'IS', không dùng 'am'. Quy tắc: I AM / You·We·They ARE / He·She·It IS.",
    },
    {
      id: "sc1-2",
      sentence: "My name are Linh.",
      errorWord: "are",
      correction: "is",
      explanation_vn: "'My name' là số ít → dùng 'IS'. 'Are' dùng cho 'you, we, they'. Ví dụ đúng: 'My name IS Linh.'",
    },
  ],

  // ── PRACTICE QUIZ: Thiết kế ~80% success rate ───────────────────────────
  // Research: Quá dễ → bored; Quá khó → dropout; 80% correct = Flow state
  practiceQuiz: [
    {
      id: "pq1",
      question: "Hoàn thành câu: 'My name ___ Minh.'",
      options: ["am", "is", "are", "be"],
      answer: "is",
      type: "multiple-choice",
      explanation_vn: "'My name' là số ít (singular) → dùng 'IS'. Quy tắc: I AM / You·We·They ARE / He·She·It·My name IS.",
    },
    {
      id: "pq2",
      question: "'Nice to meet you' nghĩa là gì?",
      options: ["Tạm biệt", "Cảm ơn", "Rất vui được gặp bạn", "Xin chào"],
      answer: "Rất vui được gặp bạn",
      type: "multiple-choice",
      explanation_vn: "'Nice to meet you' = Rất vui được gặp bạn — dùng khi gặp lần đầu. Trả lời: 'Nice to meet you TOO!' (phải có 'too').",
    },
    {
      id: "pq3",
      question: "Điền từ còn thiếu: 'I ___ from Vietnam.'",
      options: [],
      answer: "am",
      type: "cloze",
    },
  ],

  // ── TRANSLATION: VN→EN (Pushed Output) ──────────────────────────────────
  // Research: Swain's Output Hypothesis — pushed output = noticing gaps
  practiceTranslate: [
    {
      id: "pt1-1",
      prompt_vn: "Xin chào, tên tôi là Minh.",
      answer: "Hello, my name is Minh.",
    },
    {
      id: "pt1-2",
      prompt_vn: "Tôi đến từ Việt Nam.",
      answer: "I am from Vietnam.",
    },
    {
      id: "pt1-3",
      prompt_vn: "Rất vui được gặp bạn.",
      answer: "Nice to meet you.",
    },
  ],

  // ── S4-1: Listen + Arrange ───────────────────────────────────────────────
  listenAndArrangeExercises: [
    {
      id: "la1-1",
      audio_text: "Nice to meet you.",
      prompt_vn: "Rất vui được gặp bạn.",
      words: ["Nice", "to", "meet", "you", ".", "Hello", "sorry"],
      answer: "Nice to meet you .",
    },
    {
      id: "la1-2",
      audio_text: "I am from Vietnam.",
      prompt_vn: "Tôi đến từ Việt Nam.",
      words: ["I", "am", "from", "Vietnam", ".", "in", "come"],
      answer: "I am from Vietnam .",
    },
  ],

  // ── SCRAMBLE: Productive recall ──────────────────────────────────────────
  scrambleExercises: [
    {
      id: "s1",
      prompt_vn: "Tên tôi là Alex.",
      words: ["My", "name", "is", "Alex", "."],
      answer: "My name is Alex .",
    },
    {
      id: "s2",
      prompt_vn: "Cô ấy là giáo viên.",
      words: ["She", "is", "a", "teacher", "."],
      answer: "She is a teacher .",
    },
    {
      id: "s3",
      prompt_vn: "Tôi đến từ Việt Nam.",
      words: ["I", "am", "from", "Vietnam", "."],
      answer: "I am from Vietnam .",
    },
  ],

  // ── WORD BANK: Duolingo-style tap-to-build sentences ─────────────────────
  // Research: Pushed output (Swain 1985) — production beats recognition alone
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tên tôi là Minh.",
      words: ["My", "name", "is", "Minh", "am", "are", "."],
      answer: "My name is Minh .",
      hint: "My name is...",
    },
    {
      id: "wb2",
      prompt_vn: "Tôi đến từ Việt Nam.",
      words: ["I", "am", "from", "Vietnam", "is", "are", "."],
      answer: "I am from Vietnam .",
      hint: "I am from...",
    },
    {
      id: "wb3",
      prompt_vn: "Rất vui được gặp bạn!",
      words: ["Nice", "to", "meet", "you", "see", "hello", "!"],
      answer: "Nice to meet you !",
      hint: "Nice to meet you",
    },
  ],

  // ── FINAL QUIZ: Retrieval Practice (Testing Effect) ─────────────────────
  // Research: Testing effect d≈0.5-1.0 — quiz SAU học > đọc lại
  // Mix types: MC (easy) → cloze (medium) → translate (hard) = graded difficulty
  quiz: [
    // Easy — build confidence first
    {
      id: "q1",
      question: "Câu nào dùng để nói 'Rất vui được gặp bạn'?",
      options: ["Goodbye", "Nice to meet you", "How old are you?", "Where are you from?"],
      answer: "Nice to meet you",
      type: "multiple-choice",
      explanation_vn: "'Nice to meet you' = lời chào khi lần đầu gặp mặt. 'Goodbye' = tạm biệt, không dùng khi gặp nhau.",
    },
    {
      id: "q2",
      question: "Cách chào hỏi thân mật nhất hàng ngày là gì?",
      options: ["Good morning", "Hi!", "Goodbye", "Please"],
      answer: "Hi!",
      type: "multiple-choice",
      explanation_vn: "'Hi!' là lời chào thân mật, dùng hàng ngày. 'Good morning' trang trọng hơn, chỉ dùng buổi sáng.",
    },
    // Medium
    {
      id: "q3",
      question: "Câu nào đúng ngữ pháp?",
      options: ["She am a teacher.", "He are my friend.", "She is a teacher.", "They is nice."],
      answer: "She is a teacher.",
      type: "multiple-choice",
      explanation_vn: "Động từ 'to be': I am / You are / He·She·It IS / They are. 'She' → dùng 'is', không dùng 'am' hay 'are'.",
    },
    {
      id: "q4",
      question: "Khi ai đó nói 'How are you?', câu trả lời phù hợp nhất là gì?",
      options: ["Nice to meet you", "I am fine, thank you", "My name is Linh", "Goodbye"],
      answer: "I am fine, thank you",
      type: "multiple-choice",
      explanation_vn: "'How are you?' hỏi về tình trạng. Đáp: 'I am fine / I'm good / I'm well'. 'Nice to meet you' chỉ dùng khi lần đầu gặp mặt.",
    },
    // Hard — productive
    {
      id: "q5",
      question: "Điền từ còn thiếu: 'She ___ a teacher.'",
      options: [],
      answer: "is",
      type: "cloze",
    },
    {
      id: "q6",
      question: "Tên tôi là Minh. (Dịch sang tiếng Anh)",
      options: [],
      answer: "My name is Minh.",
      type: "translate",
    },
    {
      id: "q7",
      question: "Rất vui được gặp bạn. (Dịch sang tiếng Anh)",
      options: [],
      answer: "Nice to meet you.",
      type: "translate",
    },
    // S2-4 True/False/Not Given demo
    {
      id: "q8",
      question: "Theo đoạn hội thoại, Linh đến từ Việt Nam và Alex đến từ Mỹ.",
      options: ["Đúng", "Sai", "Không đề cập"],
      answer: "Đúng",
      type: "true-false",
      explanation_vn: "Trong hội thoại: Linh nói 'I'm from Vietnam' và Alex nói 'I'm from the USA' — cả hai đều đúng.",
    },
  ],

  // ── CUMULATIVE REVIEW: Ôn lại A0 trước khi bắt đầu A1 ──────────────────
  // Research: Spaced retrieval of A0 material consolidates before new input
  cumulativeReviewQuestions: [
    {
      id: "cr1-1",
      question: "Màu đỏ trong tiếng Anh là gì? (A0 — Màu sắc)",
      options: ["Blue", "Red", "Green", "Yellow"],
      answer: "Red",
      type: "multiple-choice",
      explanation_vn: "Red = đỏ. Blue = xanh dương. Green = xanh lá. Yellow = vàng. Đây là 4 màu cơ bản nhất.",
    },
    {
      id: "cr1-2",
      question: "Số 10 trong tiếng Anh là gì? (A0 — Con số)",
      options: ["Eleven", "Twelve", "Ten", "Eight"],
      answer: "Ten",
      type: "multiple-choice",
      explanation_vn: "Ten = 10. Eight = 8. Eleven = 11. Twelve = 12. Nhớ: Eleven và Twelve là 2 số bất quy tắc (không theo quy luật -teen).",
    },
    {
      id: "cr1-3",
      question: "Dịch sang tiếng Anh: 'Mẹ tôi' (A0 — Gia đình)",
      options: [],
      answer: "My mother",
      type: "translate",
    },
    {
      id: "cr1-4",
      question: "Từ nào có nghĩa là 'Cảm ơn'? (A0 — Chào hỏi)",
      options: ["Sorry", "Please", "Thank you", "Hello"],
      answer: "Thank you",
      type: "multiple-choice",
      explanation_vn: "Thank you = Cảm ơn. Sorry = Xin lỗi. Please = Xin / Làm ơn. Hello = Xin chào. Bốn từ lịch sự thiết yếu nhất.",
    },
    {
      id: "cr1-5",
      question: "Dịch sang tiếng Anh: 'Tôi hiểu.' (A0 — Giao tiếp cơ bản)",
      options: [],
      answer: "I understand.",
      type: "translate",
    },
  ],

  // ── FLUENCY DRILL: Nation Strand 4 — Automaticity ───────────────────────
  // Research: Nation (2007) — Fluency = tốc độ + độ chính xác với material đã biết
  // 8 cặp từ QUAN TRỌNG NHẤT của unit — phản xạ trong 60 giây
  pronunciationFocus: {
    phoneme: "/θ/",
    description: "Âm \"th\" vô thanh — lưỡi chạm nhẹ răng trên, thổi hơi (thank, think)",
    examples: [
        { word: "thank", ipa: "/θæŋk/", tip: "Đặt lưỡi giữa hai hàm răng, thổi hơi — KHÔNG cuộn lưỡi" },
        { word: "three", ipa: "/θriː/", tip: "Giữ lưỡi ở răng, hơi ra đều" },
    ],
    minimalPairs: [
        ["thank", "tank"],
        ["think", "tink"],
    ],
  },

  fluencyDrill: {
    title: "Phản xạ chào hỏi",
    items: [
      { en: "Hello", vn: "Xin chào (trang trọng)" },
      { en: "Hi", vn: "Chào (thân mật)" },
      { en: "Goodbye", vn: "Tạm biệt" },
      { en: "Thank you", vn: "Cảm ơn" },
      { en: "Nice to meet you", vn: "Rất vui được gặp bạn" },
      { en: "How are you?", vn: "Bạn có khỏe không?" },
      { en: "I'm fine, thank you", vn: "Tôi khỏe, cảm ơn" },
      { en: "My name is...", vn: "Tên tôi là..." },
      { en: "Good morning", vn: "Chào buổi sáng (công sở)" },
      { en: "How are you today?", vn: "Hôm nay bạn thế nào?" },
    ],
  },

  readingPassage: {
    id: "unit1-reading-1",
    title: "Hello! Nice to Meet You!",
    title_vn: "Đọc đoạn hội thoại chào hỏi",
    level: "A1" as const,
    text:
      "Hello! My name is Mai. I am from Vietnam. " +
      "This is my friend, Tom. He is from England. " +
      "We work together at a company in Hanoi. " +
      "Tom says: 'Nice to meet you, Mai!' " +
      "Mai says: 'Nice to meet you too, Tom! How are you?' " +
      "Tom says: 'I am fine, thank you. And you?' " +
      "Mai says: 'I am very well, thanks!'",
    questions: [
      {
        id: "u1r-q1",
        question_vn: "Mai đến từ đâu?",
        options: ["England", "Vietnam", "Australia", "America"],
        answer: "Vietnam",
        explanation_vn: "Đoạn văn nói 'I am from Vietnam.'",
      },
      {
        id: "u1r-q2",
        question_vn: "Tom và Mai làm việc ở đâu?",
        options: ["A school in England", "A hospital in Vietnam", "A company in Hanoi", "A bank in Saigon"],
        answer: "A company in Hanoi",
        explanation_vn: "Đoạn văn nói 'We work together at a company in Hanoi.'",
      },
      {
        id: "u1r-q3",
        question_vn: "Tom nói gì khi gặp Mai?",
        options: ["How are you?'", "'Nice to meet you, Mai!'", "'Good morning!'", "'See you later!'"],
        answer: "'Nice to meet you, Mai!'",
        explanation_vn: "Đoạn văn nói Tom says: 'Nice to meet you, Mai!'",
      },
      {
        id: "u1r-q4",
        question_vn: "Mai cảm thấy thế nào?",
        options: ["Tired", "Sad", "Very well", "Sick"],
        answer: "Very well",
        explanation_vn: "Mai nói 'I am very well, thanks!'",
      },
    ],
  },
  shadowingVideoId: "sNvmqN2MBBo", // BBC Learning English — How to Greet People in English
};

export default unit1;
