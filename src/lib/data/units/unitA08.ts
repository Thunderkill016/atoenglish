import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-8 — Khẩn Cấp & Cụm Từ Sinh Tồn  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-8 — Khẩn Cấp & Cụm Từ Sinh Tồn (Emergency & Survival Phrases)
// Grammar: Imperative + Please (Commands and requests)
// L1 Alert: VN imperative = same verb; English uses base form (no subject)
// CELTA: High-stakes dialogue first — lost in a foreign city creates maximum motivation
// Lewis: "Call the police!", "I need help", "Can you help me?" as survival chunks
// NOTE: This is the MOST IMPORTANT unit — survival English

export const unitA08: UnitData = {
  unitId: "unit-a0-8",
  title: "Unit A0-8: Khẩn Cấp & Cụm Từ Sinh Tồn",
  level: "A0",
  xp: 80,
  estimatedTime: 40,
  description:
    "Học các cụm từ khẩn cấp thiết yếu nhất — cần thiết khi bạn bị lạc, ốm, hoặc gặp nguy hiểm ở nước ngoài. Đây là những câu bạn CẦN biết trước khi đi du lịch!",
  badgeName: "Người Sinh Tồn",
  badgeEmoji: "🆘",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn đang du lịch một mình ở nước ngoài. Đột nhiên bạn bị lạc, không tìm thấy khách sạn, và điện thoại sắp hết pin. Bạn cần nhờ người xung quanh giúp đỡ ngay lập tức!",

  learningOutcomes: [
    "Kêu cứu và nhờ giúp đỡ bằng tiếng Anh",
    "Mô tả tình huống khẩn cấp cơ bản: lost, sick, hurt",
    "Dùng câu mệnh lệnh lịch sự: Call..., Please help...",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Trong tình huống khẩn cấp tại Mỹ/Anh, gọi <span class="text-primary font-semibold">911 (Mỹ)</span> hoặc <span class="text-primary font-semibold">999 (Anh)</span>. Nói ngay: <span class="text-primary font-semibold">"I need help!"</span> và địa chỉ của bạn. Người điều hành sẽ hỏi thêm — cứ trả lời từng câu một, không cần nói dài.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🆘",
      en: "Help! I need help!",
      vn: "Cứu tôi với! Tôi cần giúp đỡ!",
      context: "Câu kêu cứu khẩn cấp nhất",
    },
    {
      emoji: "📍",
      en: "I'm lost. Can you help me?",
      vn: "Tôi bị lạc. Bạn có thể giúp tôi không?",
      context: "Khi bị lạc đường",
    },
    {
      emoji: "🚑",
      en: "Please call an ambulance!",
      vn: "Làm ơn gọi xe cấp cứu!",
      context: "Khi cần cấp cứu y tế",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "help",
      emoji: "🆘",
      phonetic: "/help/",
      meaning: "giúp đỡ / cứu",
      example: "Help! I need help!",
      example2: "Can you help me, please?",
      collocation: "I need help / call for help / help me / please help",
      audio: "/audio/unit-a0-8/help.mp3",
      l1_interference_vn:
        "⚠️ 'Help someone (to) do something': 'Help me carry this'. 'Can you help me?' KHÔNG 'Can you help to me?'",
    },
    {
      id: 2,
      word: "call",
      emoji: "📞",
      phonetic: "/kɔːl/",
      meaning: "gọi (điện thoại / kêu gọi)",
      example: "Please call the police!",
      example2: "Call an ambulance now!",
      collocation: "call the police / call 911 / call for help / make a call",
      audio: "/audio/unit-a0-8/call.mp3",
      l1_interference_vn:
        "⚠️ 'Call someone' (gọi điện): 'Call me at 9'. 'Call' cũng = gọi tên: 'They call him Bob'. KHÔNG 'call to someone'.",
    },
    {
      id: 3,
      word: "police",
      emoji: "👮",
      phonetic: "/pəˈliːs/",
      meaning: "cảnh sát",
      example: "Call the police!",
      example2: "I need the police.",
      collocation: "call the police / the police are here / police station",
      audio: "/audio/unit-a0-8/police.mp3",
      l1_interference_vn:
        "⚠️ 'Police' = số nhiều (danh từ tập hợp): 'The police ARE coming'. KHÔNG 'The police IS'. 'Call the police!' không có 's'.",
    },
    {
      id: 4,
      word: "hospital",
      emoji: "🏥",
      phonetic: "/ˈhɒspɪtəl/",
      meaning: "bệnh viện",
      example: "Take me to the hospital!",
      example2: "Is there a hospital nearby?",
      collocation: "go to hospital / take to hospital / nearest hospital",
      audio: "/audio/unit-a0-8/hospital.mp3",
      l1_interference_vn:
        "⚠️ 'In hospital' (Anh-Anh, đang điều trị) vs 'in the hospital' (Anh-Mỹ, ở tòa nhà). 'Go to hospital' = nhập viện.",
    },
    {
      id: 5,
      word: "lost",
      emoji: "📍",
      phonetic: "/lɒst/",
      meaning: "bị lạc",
      example: "I'm lost. Can you help me?",
      example2: "My bag is lost.",
      collocation: "I'm lost / get lost / lost and found / feel lost",
      audio: "/audio/unit-a0-8/lost.mp3",
    },
    {
      id: 6,
      word: "sick",
      l1_interference_vn:
        "⚠️ \'Sick\' /sɪk/ — âm /ɪ/ ngắn. Phân biệt với \'seek\' /siːk/ (dài). \'I\'m sick\' ≠ \'I\'m seek\'.",
      emoji: "🤒",
      phonetic: "/sɪk/",
      meaning: "ốm, bệnh",
      example: "I feel sick. I need a doctor.",
      example2: "He is very sick.",
      collocation: "feel sick / I'm sick / very sick / get sick",
      audio: "/audio/unit-a0-8/sick.mp3",
    },
    {
      id: 7,
      word: "hurt",
      emoji: "🤕",
      phonetic: "/hɜːrt/",
      meaning: "đau / bị thương",
      example: "I'm hurt! My leg hurts!",
      example2: "Are you hurt?",
      collocation: "I'm hurt / get hurt / my [body part] hurts / are you hurt",
      audio: "/audio/unit-a0-8/hurt.mp3",
      l1_interference_vn:
        "⚠️ 'Hurt' bất quy tắc: hurt-hurt-hurt (ba dạng giống nhau). 'I hurt my arm' vs 'My arm hurts' — hai cách diễn đạt khác nhau.",
    },
    {
      id: 8,
      word: "emergency",
      emoji: "🚨",
      phonetic: "/ɪˈmɜːrdʒənsi/",
      meaning: "trường hợp khẩn cấp",
      example: "This is an emergency!",
      example2: "Call 911 — it's an emergency!",
      collocation:
        "this is an emergency / emergency room / in an emergency / emergency number",
      audio: "/audio/unit-a0-8/emergency.mp3",
      l1_interference_vn:
        "⚠️ 'In an emergency'. 'Emergency services' = dịch vụ khẩn cấp. 'Emergency exit' = lối thoát hiểm.",
    },
    {
      id: 9,
      word: "careful",
      emoji: "⚠️",
      phonetic: "/ˈkeərfəl/",
      meaning: "cẩn thận",
      example: "Be careful! The road is dangerous.",
      example2: "Please be careful.",
      collocation:
        "be careful / very careful / careful please / drive carefully",
      audio: "/audio/unit-a0-8/careful.mp3",
      l1_interference_vn:
        "⚠️ 'Be careful!' / 'Careful OF': 'Be careful of the dog'. 'Carefully' là adverb. 'A careful driver' = adj.",
    },
    {
      id: 10,
      word: "safe",
      emoji: "🛡️",
      phonetic: "/seɪf/",
      meaning: "an toàn",
      example: "Are you safe?",
      example2: "Stay safe!",
      collocation: "stay safe / are you safe / feel safe / safe place",
      audio: "/audio/unit-a0-8/safe.mp3",
      l1_interference_vn:
        "⚠️ Safe (adj) → safety (n) → safely (adv). 'Stay safe!' rất thông dụng. 'Is it safe to...?' = liệu có an toàn không?",
    },
  ],

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Câu Mệnh Lệnh + Please (Imperative)",
    rule: "Câu mệnh lệnh = ĐỘNG TỪ (dạng nguyên thể) + ... — Không cần chủ ngữ!",

    conjugation: [
      {
        subject: "Call",
        form: "the police!",
        example: "Call the police! (Gọi cảnh sát!)",
      },
      {
        subject: "Go",
        form: "to the hospital!",
        example: "Go to the hospital!",
      },
      { subject: "Be", form: "careful!", example: "Be careful! (Cẩn thận!)" },
      { subject: "Stay", form: "safe!", example: "Stay safe! (Giữ an toàn!)" },
    ],

    examples: [
      { en: "Call the police!", vn: "Gọi cảnh sát!" },
      { en: "Please call an ambulance!", vn: "Làm ơn gọi xe cấp cứu!" },
      { en: "Be careful!", vn: "Cẩn thận!" },
      { en: "Don't go alone!", vn: "Đừng đi một mình!" },
    ],

    tip: "Thêm 'please' để nghe lịch sự hơn: 'Call the police!' → 'Please call the police!' Trong tình huống khẩn cấp, bạn không cần quá lịch sự — người bản ngữ sẽ hiểu!",

    vnNote:
      "⚠️ Câu mệnh lệnh tiếng Anh KHÔNG có chủ ngữ:\n\n" +
      "Tiếng Việt: 'Bạn hãy gọi cảnh sát!' — có 'Bạn'\n" +
      "Tiếng Anh:  'Call the police!' — KHÔNG CÓ 'You'\n\n" +
      "❌ SAI: 'You call the police!' (nghe không tự nhiên)\n" +
      "✅ ĐÚNG: 'Call the police!'\n\n" +
      "Phủ định: 'Don't + động từ'\n" +
      "✅ ĐÚNG: 'Don't go alone!' / 'Don't run!'\n" +
      "❌ SAI: 'You don't go alone!'",

    dialogueExample: {
      speaker: "Minh",
      text: "Please call the police! I'm lost and I don't feel safe!",
      translation:
        "Làm ơn gọi cảnh sát! Tôi bị lạc và tôi không cảm thấy an toàn!",
      highlight: "call",
    },

    ccq: {
      question: "Câu mệnh lệnh nào ĐÚNG?",
      options: [
        "You please call the police!",
        "Please call the police!",
        "Please you call the police!",
        "Calling the police please!",
      ],
      answer: "Please call the police!",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối tình huống với câu nói phù hợp",
    pairs: [
      { left: "Bị lạc đường", right: "I'm lost. Can you help me?" },
      { left: "Bị ốm nặng", right: "I feel sick. I need a doctor." },
      { left: "Bị thương", right: "I'm hurt! Please call an ambulance!" },
      { left: "Nguy hiểm", right: "Be careful! This is dangerous!" },
      { left: "Tình huống khẩn", right: "This is an emergency! Call 911!" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq8-1",
      question: "Câu mệnh lệnh nào ĐÚNG?",
      options: [
        "You call the police!",
        "Please calling the police!",
        "Call the police!",
        "Calling police please!",
      ],
      answer: "Call the police!",
      type: "multiple-choice",
    },
    {
      id: "pq8-2",
      question: "Điền từ: 'I'm ___. I need a doctor.' (ốm)",
      options: [],
      answer: "sick",
      type: "cloze",
    },
    {
      id: "pq8-3",
      question: "Khi gặp tai nạn, câu đầu tiên bạn nên nói là gì?",
      options: [
        "I'm very sorry about this.",
        "Help! This is an emergency!",
        "Can you speak Vietnamese?",
        "Where is the nearest restaurant?",
      ],
      answer: "Help! This is an emergency!",
      type: "multiple-choice",
    },
    {
      id: "pq8-4",
      question: "Điền từ: 'Are you ___?' (an toàn không?)",
      options: [],
      answer: "safe",
      type: "cloze",
    },
  ],

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt8-1",
      prompt_vn: "Tôi bị lạc. Bạn có thể giúp tôi không?",
      answer: "I'm lost. Can you help me?",
    },
    {
      id: "pt8-2",
      prompt_vn: "Làm ơn gọi xe cấp cứu! Anh ấy bị thương.",
      answer: "Please call an ambulance! He is hurt.",
    },
    {
      id: "pt8-3",
      prompt_vn: "Đây là tình huống khẩn cấp! Gọi cảnh sát!",
      answer: "This is an emergency! Call the police!",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A08-1",
      sentence: "Call a ambulance right now!",
      errorWord: "a ambulance",
      correction: "an ambulance",
      explanation_vn:
        "Trước nguyên âm (a, e, i, o, u) dùng 'AN': 'AN ambulance'. 'A' dùng trước phụ âm.",
    },
    {
      id: "sc-A08-2",
      sentence: "I need a help please.",
      errorWord: "a help",
      correction: "help",
      explanation_vn:
        "'Help' là danh từ không đếm được — không dùng 'a' trước 'help'. Đúng: 'I need HELP'.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA08-1",
      audio_text: "Please call an ambulance right away.",
      prompt_vn: "Vui lòng gọi xe cấp cứu ngay.",
      words: [
        "Please",
        "call",
        "an",
        "ambulance",
        "right",
        "away",
        ".",
        "a ambulance",
        "calling",
      ],
      answer: "Please call an ambulance right away .",
    },
    {
      id: "laA08-2",
      audio_text: "I need help this is an emergency.",
      prompt_vn: "Tôi cần giúp đỡ đây là tình huống khẩn cấp.",
      words: [
        "I",
        "need",
        "help",
        "this",
        "is",
        "an",
        "emergency",
        ".",
        "a help",
        "needs",
      ],
      answer: "I need help this is an emergency .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi bị lạc. Làm ơn giúp tôi!",
      words: ["I'm", "lost.", "Please", "help", "me", "!", "is", "are"],
      answer: "I'm lost. Please help me !",
    },
    {
      id: "wb2",
      prompt_vn: "Làm ơn gọi cảnh sát! Đây là tình huống khẩn cấp!",
      words: [
        "Please",
        "call",
        "the",
        "police!",
        "This",
        "is",
        "an",
        "emergency",
        "!",
        "are",
      ],
      answer: "Please call the police! This is an emergency !",
    },
    {
      id: "wb3",
      prompt_vn: "Cẩn thận! Con đường này nguy hiểm.",
      words: ["Be", "careful!", "This", "road", "is", "dangerous", ".", "are"],
      answer: "Be careful! This road is dangerous .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s8-1",
      prompt_vn: "Tôi bị lạc. Làm ơn giúp tôi!",
      words: ["I'm", "lost.", "Please", "help", "me", "!"],
      answer: "I'm lost. Please help me !",
    },
    {
      id: "s8-2",
      prompt_vn: "Làm ơn gọi cảnh sát! Đây là tình huống khẩn cấp!",
      words: [
        "Please",
        "call",
        "the",
        "police!",
        "This",
        "is",
        "an",
        "emergency",
        "!",
      ],
      answer: "Please call the police! This is an emergency !",
    },
    {
      id: "s8-3",
      prompt_vn: "Cẩn thận! Con đường này nguy hiểm.",
      words: ["Be", "careful!", "This", "road", "is", "dangerous", "."],
      answer: "Be careful! This road is dangerous .",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Bị lạc đường ở thành phố lạ",
      audio: "/audio/unit-a0-8/dialogue_1.mp3",
      desc: "Minh bị lạc ở Singapore và nhờ người đường phố giúp đỡ.",
      lines: [
        {
          id: "d8-1-1",
          speaker: "Minh",
          text: "Excuse me! Help! I'm lost!",
          translation: "Xin lỗi! Cứu tôi với! Tôi bị lạc!",
        },
        {
          id: "d8-1-2",
          speaker: "Passerby",
          text: "Are you okay? Are you safe?",
          translation: "Bạn có ổn không? Bạn có an toàn không?",
        },
        {
          id: "d8-1-3",
          speaker: "Minh",
          text: "I'm safe, but I'm lost. I can't find my hotel. Can you help me?",
          translation:
            "Tôi an toàn, nhưng tôi bị lạc. Tôi không tìm được khách sạn. Bạn có thể giúp tôi không?",
        },
        {
          id: "d8-1-4",
          speaker: "Passerby",
          text: "Of course! What's the name of your hotel? I'll help you.",
          translation: "Được! Tên khách sạn của bạn là gì? Tôi sẽ giúp bạn.",
        },
        {
          id: "d8-1-5",
          speaker: "Minh",
          text: "Marina Bay Hotel. Also — I feel sick. Is there a hospital nearby?",
          translation:
            "Khách sạn Marina Bay. Ngoài ra — tôi cảm thấy ốm. Có bệnh viện nào gần đây không?",
        },
        {
          id: "d8-1-6",
          speaker: "Passerby",
          text: "Are you hurt? Do I need to call an ambulance?",
          translation:
            "Bạn có bị thương không? Tôi có cần gọi xe cấp cứu không?",
        },
        {
          id: "d8-1-7",
          speaker: "Minh",
          text: "No, I'm not hurt. Just sick and tired. Please call a taxi — and be careful with my bag!",
          translation:
            "Không, tôi không bị thương. Chỉ ốm và mệt thôi. Làm ơn gọi taxi — và cẩn thận với túi của tôi!",
        },
      ],
    },
    {
      id: 2,
      title: "Bị ốm tại khách sạn",
      audio: "/audio/unit-a0-8/dialogue_2.mp3",
      desc: "Minh gọi điện cho lễ tân khách sạn vì bị ốm.",
      lines: [
        {
          id: "d8-2-1",
          speaker: "Minh",
          text: "Hello! This is Room 305. This is an emergency — I feel very sick!",
          translation:
            "Xin chào! Đây là phòng 305. Đây là tình huống khẩn cấp — tôi cảm thấy rất ốm!",
        },
        {
          id: "d8-2-2",
          speaker: "Reception",
          text: "Are you hurt? Do you need an ambulance?",
          translation: "Bạn có bị thương không? Bạn có cần xe cấp cứu không?",
        },
        {
          id: "d8-2-3",
          speaker: "Minh",
          text: "I'm not hurt. But I'm very sick. Please call a doctor!",
          translation:
            "Tôi không bị thương. Nhưng tôi rất ốm. Làm ơn gọi bác sĩ!",
        },
        {
          id: "d8-2-4",
          speaker: "Reception",
          text: "Stay safe and stay calm. I'll call a doctor now. Be careful — don't stand up too fast.",
          translation:
            "Hãy giữ an toàn và bình tĩnh. Tôi sẽ gọi bác sĩ ngay. Cẩn thận — đừng đứng dậy quá nhanh.",
        },
        {
          id: "d8-2-5",
          speaker: "Minh",
          text: "Thank you! Should I go to the hospital?",
          translation: "Cảm ơn! Tôi có cần đến bệnh viện không?",
        },
        {
          id: "d8-2-6",
          speaker: "Reception",
          text: "Wait for the doctor first. If it's an emergency, we'll take you to the hospital.",
          translation:
            "Đợi bác sĩ trước. Nếu đây là tình huống khẩn cấp, chúng tôi sẽ đưa bạn đến bệnh viện.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac8-1",
      audio_text: "I'm lost can you help me",
      options: [
        "I'm lost can you help me",
        "I'm last can you help me",
        "I'm lost can he help me",
        "I'm lost can you call me",
      ],
      answer: "I'm lost can you help me",
    },
    {
      id: "lac8-2",
      audio_text: "Please call an ambulance this is an emergency",
      options: [
        "Please call an ambulance this is an emergency",
        "Please call the police this is an emergency",
        "Please call an ambulance this is not an emergency",
        "Please call a doctor this is an emergency",
      ],
      answer: "Please call an ambulance this is an emergency",
    },
    {
      id: "lac8-3",
      audio_text: "Are you safe and are you hurt",
      options: [
        "Are you safe and are you hurt",
        "Are you safe and are you hard",
        "Are you save and are you hurt",
        "Are you safe and are you hot",
      ],
      answer: "Are you safe and are you hurt",
    },
    {
      id: "lac8-4",
      audio_text: "I feel sick I need a doctor",
      options: [
        "Tôi cảm thấy ốm, tôi cần bác sĩ",
        "Tôi bị thương, tôi cần bác sĩ",
        "Tôi cảm thấy ốm, tôi cần cảnh sát",
        "Tôi bị lạc, tôi cần bác sĩ",
      ],
      answer: "Tôi cảm thấy ốm, tôi cần bác sĩ",
    },
    {
      id: "lac8-5",
      audio_text: "Be careful this road is dangerous",
      options: [
        "Cẩn thận! Con đường này nguy hiểm.",
        "Cẩn thận! Con đường này rất dài.",
        "Cẩn thận! Khu vực này nguy hiểm.",
        "Dừng lại! Con đường này nguy hiểm.",
      ],
      answer: "Cẩn thận! Con đường này nguy hiểm.",
    },
  ],

  // ── CUMULATIVE REVIEW: Ôn lại unitA01-A07 (Thời gian + Ngày) ────────────

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "crA08-1",
      question: "'Buổi sáng' trong tiếng Anh là gì? (unitA07)",
      options: ["Morning", "Afternoon", "Evening", "Night"],
      answer: "Morning",
      type: "multiple-choice",
    },
    {
      id: "crA08-2",
      question: "'Thứ Hai' trong tiếng Anh là gì? (unitA07)",
      options: ["Sunday", "Monday", "Tuesday", "Wednesday"],
      answer: "Monday",
      type: "multiple-choice",
    },
    {
      id: "crA08-3",
      question: "Dịch sang tiếng Anh: 'Hôm nay là thứ Mấy?' (unitA07)",
      options: [],
      answer: "What day is it today?",
      type: "translate",
    },
    {
      id: "crA08-4",
      question: "Dịch sang tiếng Anh: 'Lúc mấy giờ?' (unitA07)",
      options: [],
      answer: "What time is it?",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/ŋ/ cuối từ",
    description: "Âm NG cuối — sing, ring, long",
    examples: [
      {
        word: "morning",
        ipa: "/ˈmɔːnɪŋ/",
        tip: "Cuối âm mũi mềm từ vòm — không bật thêm /g/",
      },
      {
        word: "working",
        ipa: "/ˈwɜːkɪŋ/",
        tip: "'-ing' kết thúc bằng /ŋ/, không phải /ng/",
      },
    ],
    minimalPairs: [["sing /ŋ/", "singer /ŋ/"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Luyện nhanh: Cụm từ sống còn",
    items: [
      { en: "Help!", vn: "Cứu tôi với!" },
      { en: "I need help!", vn: "Tôi cần giúp đỡ!" },
      { en: "I'm lost.", vn: "Tôi bị lạc." },
      { en: "I feel sick.", vn: "Tôi cảm thấy ốm." },
      { en: "I'm hurt.", vn: "Tôi bị thương." },
      { en: "Call the police!", vn: "Gọi cảnh sát!" },
      { en: "Please call an ambulance!", vn: "Làm ơn gọi xe cấp cứu!" },
      { en: "This is an emergency!", vn: "Đây là tình huống khẩn cấp!" },
      { en: "Are you safe?", vn: "Bạn có an toàn không?" },
      { en: "Be careful!", vn: "Cẩn thận!" },
    ],
  },

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "Help! I'm {input}. Can you help me?",
    level1Placeholder: "Nhập tình trạng: lost / sick / hurt...",
    level2Situation:
      "Bạn đang ở sân bay nước ngoài, mất ví và điện thoại. Nhờ một người xa lạ giúp bạn gọi cảnh sát và tìm đường đến khách sạn.",
    level2Hint:
      "Excuse me! I need help. I'm lost. My wallet is lost too. Please call the police. Is there a police station nearby?",
  },

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q8-1",
      question: "Câu mệnh lệnh nào ĐÚNG?",
      options: [
        "You please call the police!",
        "Please call the police!",
        "Please you call police!",
        "Calling the police now!",
      ],
      answer: "Please call the police!",
      type: "multiple-choice",
    },
    {
      id: "q8-2",
      question: "Điền từ: 'I'm ___. Can you help me find my hotel?' (bị lạc)",
      options: [],
      answer: "lost",
      type: "cloze",
    },
    {
      id: "q8-3",
      question: "Điền từ: 'This is an ___! Call 911!' (khẩn cấp)",
      options: [],
      answer: "emergency",
      type: "cloze",
    },
    {
      id: "q8-4",
      question: "Câu nào dùng khi bị thương?",
      options: [
        "I'm sick — call a doctor.",
        "I'm lost — help me.",
        "I'm hurt — please call an ambulance!",
        "I'm tired — I need a bed.",
      ],
      answer: "I'm hurt — please call an ambulance!",
      type: "multiple-choice",
    },
    {
      id: "q8-5",
      question: "Tôi bị lạc. Bạn có thể giúp tôi không? (Dịch)",
      options: [],
      answer: "I'm lost. Can you help me?",
      type: "translate",
    },
    {
      id: "q8-6",
      question: "Làm ơn gọi xe cấp cứu! Anh ấy bị thương. (Dịch)",
      options: [],
      answer: "Please call an ambulance! He is hurt.",
      type: "translate",
    },
    {
      id: "q8-7",
      question: "Đây là tình huống khẩn cấp! Gọi cảnh sát! Cẩn thận! (Dịch)",
      options: [],
      answer: "This is an emergency! Call the police! Be careful!",
      type: "translate",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA08-reading-1",
    title: "Help!",
    title_vn: "Đọc đoạn về các câu khẩn cấp và sinh tồn",
    level: "A0" as const,
    text:
      "Oh no! I am lost. " +
      "Excuse me! Can you help me, please? " +
      "I need a doctor! " +
      "Please call 115! " +
      "Thank you very much! " +
      "I am okay now. " +
      "Thank you!",
    questions: [
      {
        id: "uA08r-q1",
        question_vn: "Người kể chuyện gặp vấn đề gì?",
        options: [
          "They are hungry",
          "They are lost",
          "They are tired",
          "They are late",
        ],
        answer: "They are lost",
        explanation_vn: "'I am lost.'",
      },
      {
        id: "uA08r-q2",
        question_vn: "Câu lịch sự để nhờ giúp đỡ là gì?",
        options: [
          "'Help me!'",
          "'I need help!'",
          "'Can you help me, please?'",
          "'Where am I?'",
        ],
        answer: "'Can you help me, please?'",
        explanation_vn: "'Can you help me, please?'",
      },
      {
        id: "uA08r-q3",
        question_vn: "Người kể chuyện cần gọi số điện thoại nào?",
        options: ["111", "113", "115", "119"],
        answer: "115",
        explanation_vn: "'Please call 115!'",
      },
      {
        id: "uA08r-q4",
        question_vn: "Kết thúc câu chuyện, người kể chuyện cảm thấy thế nào?",
        options: ["Still lost", "Sad", "Okay", "Scared"],
        answer: "Okay",
        explanation_vn: "'I am okay now.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "mA-MK2bJA4I", // BBC Learning English — Travel & asking for help
  jobScenarios: [
    {
      id: 1,
      title: "Kết thúc ngày làm việc: chào tạm biệt và xác nhận deadline",
      focus: "End of day: goodbye, confirm tomorrow tasks (entry level)",
      context: "Cuối ngày với đồng nghiệp hoặc sếp trực tiếp",
      l1Note:
        "⚠️ 'Have a nice evening.' 'I'll finish the list tomorrow morning.' 'See you at 8.'",
      example:
        "I will send the file first thing tomorrow. Have a good evening! See you at eight.",
    },
  ],
};
