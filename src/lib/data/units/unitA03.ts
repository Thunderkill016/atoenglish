import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-3 — Màu Sắc & Mô Tả  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-3 — Màu Sắc & Mô Tả (Colors & Description)
// Level 0 / Foundation — Pre-CEFR A0
// Grammar:  Adjective BEFORE noun ("a red shirt" not "a shirt red")
// L1 Alert: Vietnamese puts adjective AFTER noun → direct L1 transfer error
// CELTA:    Dialogue shows colors IN CONTEXT (shopping) before grammar
// Lewis:    "looking for", "do you have", "I prefer" as fixed chunks
// ─────────────────────────────────────────────────────────────────────────────

export const unitA03: UnitData = {
  unitId: "unit-a0-3",
  title: "Unit A0-3: Màu Sắc & Mô Tả",
  level: "A0",
  xp: 60,
  estimatedTime: 40,
  description:
    "Học màu sắc và cách mô tả đồ vật bằng tiếng Anh — cần thiết khi mua sắm, mô tả đồ vật, hoặc tìm thứ bị mất.",
  badgeName: "Người Quan Sát",
  badgeEmoji: "🎨",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn vào cửa hàng quần áo để mua áo. Nhân viên nói tiếng Anh. Bạn cần mô tả màu sắc và kích cỡ bạn muốn.",

  learningOutcomes: [
    "Nói được 8 màu cơ bản bằng tiếng Anh",
    "Mô tả đồ vật: màu + kích cỡ (a big blue bag)",
    "Dùng 'I'm looking for...' khi mua sắm",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Khi mua sắm, người bản ngữ hay dùng <span class="text-primary font-semibold">"I\'m looking for..."</span> thay vì "I want..." vì nghe lịch sự hơn. <span class="text-primary font-semibold">"Do you have this in blue?"</span> là câu hỏi rất phổ biến khi muốn màu khác.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🔍",
      en: "I'm looking for a blue shirt.",
      vn: "Tôi đang tìm một cái áo màu xanh.",
      context: "Câu mở đầu khi mua sắm",
    },
    {
      emoji: "🎨",
      en: "Do you have this in red?",
      vn: "Bạn có cái này màu đỏ không?",
      context: "Hỏi màu khác",
    },
    {
      emoji: "👍",
      en: "I prefer the black one.",
      vn: "Tôi thích cái màu đen hơn.",
      context: "Chọn màu yêu thích",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "red",
      l1_interference_vn:
        "⚠️ \'Red\' /red/ — phân biệt với \'read\' /riːd/ (đọc, hiện tại) và \'read\' /red/ (đọc, quá khứ). Đồng âm!",
      emoji: "🔴",
      phonetic: "/red/",
      meaning: "màu đỏ",
      example: "I want a red bag.",
      example2: "The red shirt is beautiful.",
      collocation: "red car / red light / little red riding hood",
      audio: "/audio/unit-a0-3/red.mp3",
    },
    {
      id: 2,
      word: "blue",
      l1_interference_vn:
        "⚠️ \'Blue\' /bluː/ — /l/ trước /uː/ tạo âm \'dark L\'. Không phát \'boo\' — phải có âm /l/.",
      emoji: "🔵",
      phonetic: "/bluː/",
      meaning: "màu xanh dương",
      example: "Do you have this in blue?",
      example2: "The sky is blue.",
      collocation: "navy blue / light blue / blue jeans",
      audio: "/audio/unit-a0-3/blue.mp3",
    },
    {
      id: 3,
      word: "green",
      l1_interference_vn:
        "⚠️ \'Green\' /ɡriːn/ — /r/ Anh-Mỹ: lưỡi cong không chạm. KHÔNG rung lưỡi như \'r\' tiếng Việt.",
      emoji: "🟢",
      phonetic: "/ɡriːn/",
      meaning: "màu xanh lá",
      example: "I love green vegetables.",
      example2: "The green dress looks nice.",
      collocation: "dark green / light green / green tea",
      audio: "/audio/unit-a0-3/green.mp3",
    },
    {
      id: 4,
      word: "black",
      emoji: "⚫",
      phonetic: "/blæk/",
      meaning: "màu đen",
      example: "I prefer the black one.",
      example2: "Black coffee, please.",
      collocation: "black shirt / black coffee / in black and white",
      audio: "/audio/unit-a0-3/black.mp3",
      l1_interference_vn:
        "⚠️ 'Black coffee' = cà phê đen (không sữa). 'In black and white' = rõ ràng bằng văn bản. Màu sắc không cần 'the'.",
    },
    {
      id: 5,
      word: "white",
      emoji: "⚪",
      phonetic: "/waɪt/",
      meaning: "màu trắng",
      example: "Do you have a white shirt?",
      example2: "The walls are white.",
      collocation: "snow white / white shirt / black and white",
      audio: "/audio/unit-a0-3/white.mp3",
      l1_interference_vn:
        "⚠️ 'White' /waɪt/ — đọc rõ âm /w/. 'White-collar' = văn phòng. Màu trắng dùng trực tiếp: 'a white shirt'.",
    },
    {
      id: 6,
      word: "big",
      emoji: "🐘",
      phonetic: "/bɪɡ/",
      meaning: "to, lớn",
      example: "I need a bigger size.",
      example2: "This bag is too big.",
      collocation: "big size / big deal / too big / big city",
      audio: "/audio/unit-a0-3/big.mp3",
      l1_interference_vn:
        "⚠️ 'Big' (informal) = 'large' (formal). 'A big mistake' vs 'a large order'. Tính từ đứng TRƯỚC danh từ trong tiếng Anh.",
    },
    {
      id: 7,
      word: "small",
      emoji: "🐭",
      phonetic: "/smɔːl/",
      meaning: "nhỏ",
      example: "This is too small for me.",
      example2: "Do you have a smaller size?",
      collocation: "too small / small size / small talk / small change",
      audio: "/audio/unit-a0-3/small.mp3",
      l1_interference_vn:
        "⚠️ 'Small' vs 'little': 'small' = kích thước, 'little' = ít + cảm xúc ('a little dog' — dễ thương). Cả hai đứng trước danh từ.",
    },
    {
      id: 8,
      word: "color",
      emoji: "🎨",
      phonetic: "/ˈkʌlər/",
      meaning: "màu sắc",
      example: "What color do you prefer?",
      example2: "I love bright colors.",
      collocation: "what color / favorite color / bright color",
      audio: "/audio/unit-a0-3/color.mp3",
      l1_interference_vn:
        "⚠️ 'Color' (Anh-Mỹ) = 'colour' (Anh-Anh). 'What color is it?' KHÔNG 'What is the color of it?' — câu hỏi ngắn gọn hơn.",
    },
    {
      id: 9,
      word: "prefer",
      emoji: "❤️",
      phonetic: "/prɪˈfɜːr/",
      meaning: "thích hơn, muốn hơn",
      example: "I prefer the blue one.",
      example2: "Which color do you prefer?",
      collocation: "I prefer / prefer to / which do you prefer",
      audio: "/audio/unit-a0-3/prefer.mp3",
      l1_interference_vn:
        "⚠️ 'Prefer A TO B': 'I prefer coffee to tea'. KHÔNG 'prefer than'. 'Prefer doing' hay 'prefer to do' — cả hai đều đúng.",
    },
    {
      id: 10,
      word: "looking for",
      emoji: "🔍",
      phonetic: "/ˈlʊkɪŋ fɔːr/",
      meaning: "đang tìm kiếm",
      example: "I'm looking for a blue shirt.",
      example2: "What are you looking for?",
      collocation:
        "looking for something / I'm looking for / what are you looking for",
      audio: "/audio/unit-a0-3/lookingfor.mp3",
      l1_interference_vn:
        "⚠️ 'Look FOR' = tìm. 'Look AT' = nhìn. 'Look AFTER' = chăm sóc. Ba phrasal verbs khác nghĩa hoàn toàn!",
    },
  ],

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Tính từ đứng TRƯỚC danh từ",
    rule: "Tiếng Anh: Tính từ (màu sắc, kích cỡ) đứng TRƯỚC danh từ.\nTiếng Việt: Tính từ đứng SAU danh từ.",

    conjugation: [
      {
        subject: "a RED",
        form: "shirt",
        example: "a red shirt ✓ (không phải 'a shirt red')",
      },
      { subject: "a BIG", form: "blue bag", example: "a big blue bag" },
      { subject: "a SMALL", form: "black car", example: "a small black car" },
    ],

    examples: [
      { en: "a red bag", vn: "một cái túi màu đỏ" },
      { en: "a big blue shirt", vn: "một cái áo xanh to" },
      { en: "a small white cup", vn: "một cái cốc trắng nhỏ" },
      {
        en: "I'm looking for a green hat.",
        vn: "Tôi đang tìm một cái mũ màu xanh.",
      },
    ],

    tip: "Thứ tự: Kích cỡ + Màu + Đồ vật. Ví dụ: 'a BIG BLUE bag'. Không bao giờ đảo lại!",

    vnNote:
      "⚠️ LỖI KINH ĐIỂN của người Việt:\n\n" +
      "Tiếng Việt:   'Túi xanh' → [Danh từ] + [Tính từ]\n" +
      "Tiếng Anh:    'Blue bag' → [Tính từ] + [Danh từ]\n\n" +
      "❌ SAI:  'a bag blue' / 'a shirt red'\n" +
      "✅ ĐÚNG: 'a blue bag' / 'a red shirt'\n\n" +
      "Mẹo nhớ: Tiếng Anh mô tả TRƯỚC khi nói đến vật.\n" +
      "Tiếng Việt mô tả SAU khi đã nói đến vật.",

    dialogueExample: {
      speaker: "Minh",
      text: "I'm looking for a big blue bag.",
      translation: "Tôi đang tìm một cái túi to màu xanh.",
      highlight: "big blue",
    },

    ccq: {
      question: "Câu nào ĐÚNG ngữ pháp tiếng Anh?",
      options: [
        "I want a shirt red.",
        "I want a red shirt.",
        "I want a shirt is red.",
        "I want red a shirt.",
      ],
      answer: "I want a red shirt.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối màu sắc với ý nghĩa",
    pairs: [
      { left: "red", right: "đỏ" },
      { left: "blue", right: "xanh dương" },
      { left: "green", right: "xanh lá" },
      { left: "black", right: "đen" },
      { left: "white", right: "trắng" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq3-1",
      question: "Câu nào ĐÚNG ngữ pháp?",
      options: [
        "I want a shirt blue.",
        "I want a blue shirt.",
        "I want blue shirt a.",
        "I want shirt a blue.",
      ],
      answer: "I want a blue shirt.",
      type: "multiple-choice",
      explanation_vn:
        "Tiếng Anh: Số + Tính từ + Danh từ. 'A blue shirt' (số trước, tính từ trước danh từ). KHÔNG 'a shirt blue' hay 'blue a shirt'.",
    },
    {
      id: "pq3-2",
      question: "Điền từ: 'I'm ___ for a red bag.'",
      options: [],
      answer: "looking",
      type: "cloze",
    },
    {
      id: "pq3-3",
      question: "'Tôi thích màu xanh hơn' dịch thế nào?",
      options: [
        "I like the blue more.",
        "I prefer the blue one.",
        "I want blue better.",
        "Blue is good for me.",
      ],
      answer: "I prefer the blue one.",
      type: "multiple-choice",
      explanation_vn:
        "'Prefer' = thích hơn. 'I prefer the blue one' = Tôi thích cái xanh hơn. 'One' thay cho danh từ đã nói trước (ở đây = shirt/bag).",
    },
    {
      id: "pq3-4",
      question: "Điền từ: 'Do you have this in ___?' (màu đỏ)",
      options: [],
      answer: "red",
      type: "cloze",
    },
  ],

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt3-1",
      prompt_vn: "Tôi đang tìm một cái áo màu xanh.",
      answer: "I'm looking for a blue shirt.",
    },
    {
      id: "pt3-2",
      prompt_vn: "Bạn có màu đỏ không?",
      answer: "Do you have this in red?",
    },
    {
      id: "pt3-3",
      prompt_vn: "Tôi thích cái màu đen, to hơn.",
      answer: "I prefer the big black one.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A03-1",
      sentence: "The apples is red and sweet.",
      errorWord: "is",
      correction: "are",
      explanation_vn:
        "'Apples' số nhiều → 'The apples ARE red'. 'Is' chỉ dùng cho số ít.",
    },
    {
      id: "sc-A03-2",
      sentence: "She wearing a blue dress today.",
      errorWord: "wearing",
      correction: "is wearing",
      explanation_vn:
        "Present Continuous cần 'to be': 'She IS WEARING'. Không bỏ 'is' — lỗi phổ biến khi dịch thẳng từ tiếng Việt.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA03-1",
      audio_text: "The bag is red and the dress is blue.",
      prompt_vn: "Túi màu đỏ và váy màu xanh.",
      words: [
        "The",
        "bag",
        "is",
        "red",
        "and",
        "the",
        "dress",
        "is",
        "blue",
        ".",
        "are",
        "was",
      ],
      answer: "The bag is red and the dress is blue .",
    },
    {
      id: "laA03-2",
      audio_text: "She is wearing a white shirt today.",
      prompt_vn: "Hôm nay cô ấy mặc áo trắng.",
      words: [
        "She",
        "is",
        "wearing",
        "a",
        "white",
        "shirt",
        "today",
        ".",
        "wearing",
        "wears",
      ],
      answer: "She is wearing a white shirt today .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi đang tìm một cái túi màu xanh to.",
      words: [
        "I'm",
        "looking",
        "for",
        "a",
        "big",
        "blue",
        "bag",
        ".",
        "is",
        "are",
      ],
      answer: "I'm looking for a big blue bag .",
    },
    {
      id: "wb2",
      prompt_vn: "Bạn có màu trắng không?",
      words: ["Do", "you", "have", "this", "in", "white", "?", "is", "are"],
      answer: "Do you have this in white ?",
    },
    {
      id: "wb3",
      prompt_vn: "Cái áo đỏ nhỏ rất đẹp.",
      words: ["The", "small", "red", "shirt", "is", "beautiful", ".", "are"],
      answer: "The small red shirt is beautiful .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s3-1",
      prompt_vn: "Tôi đang tìm một cái túi màu xanh to.",
      words: ["I'm", "looking", "for", "a", "big", "blue", "bag", "."],
      answer: "I'm looking for a big blue bag .",
    },
    {
      id: "s3-2",
      prompt_vn: "Bạn có màu trắng không?",
      words: ["Do", "you", "have", "this", "in", "white", "?"],
      answer: "Do you have this in white ?",
    },
    {
      id: "s3-3",
      prompt_vn: "Cái áo đỏ nhỏ rất đẹp.",
      words: ["The", "small", "red", "shirt", "is", "beautiful", "."],
      answer: "The small red shirt is beautiful .",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Mua áo tại cửa hàng",
      audio: "/audio/unit-a0-3/dialogue_1.mp3",
      desc: "Linh vào cửa hàng quần áo tìm mua áo màu xanh.",
      lines: [
        {
          id: "d3-1-1",
          speaker: "Linh",
          text: "Hi! I'm looking for a blue shirt.",
          translation: "Xin chào! Tôi đang tìm một cái áo màu xanh.",
        },
        {
          id: "d3-1-2",
          speaker: "Staff",
          text: "Of course! What color do you prefer — light blue or dark blue?",
          translation: "Được! Bạn thích màu gì hơn — xanh nhạt hay xanh đậm?",
        },
        {
          id: "d3-1-3",
          speaker: "Linh",
          text: "I prefer light blue. And I need a small size — this big one is too big.",
          translation:
            "Tôi thích xanh nhạt hơn. Và tôi cần size nhỏ — cái to này quá to.",
        },
        {
          id: "d3-1-4",
          speaker: "Staff",
          text: "Here's a small light blue shirt. And we also have white and green in small.",
          translation:
            "Đây là áo xanh nhạt size nhỏ. Và chúng tôi cũng có trắng và xanh lá trong size nhỏ.",
        },
        {
          id: "d3-1-5",
          speaker: "Linh",
          text: "I prefer the blue one. How much is the blue shirt?",
          translation: "Tôi thích cái xanh hơn. Áo xanh giá bao nhiêu?",
        },
        {
          id: "d3-1-6",
          speaker: "Staff",
          text: "The small blue shirt is twenty dollars.",
          translation: "Áo xanh size nhỏ là hai mươi đô la.",
        },
      ],
    },
    {
      id: 2,
      title: "Mô tả đồ vật bị mất",
      audio: "/audio/unit-a0-3/dialogue_2.mp3",
      desc: "Minh mất túi và cần mô tả cho bảo vệ.",
      lines: [
        {
          id: "d3-2-1",
          speaker: "Minh",
          text: "Excuse me! I'm looking for my bag. I lost it.",
          translation: "Xin lỗi! Tôi đang tìm túi của tôi. Tôi bị mất nó.",
        },
        {
          id: "d3-2-2",
          speaker: "Guard",
          text: "What color is your bag?",
          translation: "Túi của bạn màu gì?",
        },
        {
          id: "d3-2-3",
          speaker: "Minh",
          text: "It's a big black bag. Not small — a big one.",
          translation: "Đó là một cái túi đen to. Không nhỏ — một cái to.",
        },
        {
          id: "d3-2-4",
          speaker: "Guard",
          text: "I found a black bag. Is this your bag?",
          translation:
            "Tôi tìm thấy một cái túi đen. Đây có phải túi của bạn không?",
        },
        {
          id: "d3-2-5",
          speaker: "Minh",
          text: "Yes! That's my bag. The big black one. Thank you!",
          translation: "Vâng! Đó là túi của tôi. Cái đen to đó. Cảm ơn!",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac3-1",
      audio_text: "a big blue bag",
      options: [
        "a big black bag",
        "a big blue bag",
        "a small blue bag",
        "a big green bag",
      ],
      answer: "a big blue bag",
    },
    {
      id: "lac3-2",
      audio_text: "I'm looking for a red shirt",
      options: [
        "I'm looking for a red skirt",
        "I'm looking for a red shirt",
        "I'm looking for a big shirt",
        "I'm looking for a blue shirt",
      ],
      answer: "I'm looking for a red shirt",
    },
    {
      id: "lac3-3",
      audio_text: "I prefer the white one",
      options: [
        "I prefer the white one",
        "I prefer the right one",
        "I prefer the bright one",
        "I prefer the wide one",
      ],
      answer: "I prefer the white one",
    },
    {
      id: "lac3-4",
      audio_text: "Do you have this in green",
      options: [
        "Bạn có cái này màu xanh lá không",
        "Bạn có cái này màu đỏ không",
        "Bạn có cái này màu đen không",
        "Bạn có cái này màu xanh dương không",
      ],
      answer: "Bạn có cái này màu xanh lá không",
    },
    {
      id: "lac3-5",
      audio_text: "The small black bag is beautiful",
      options: [
        "Cái túi đen nhỏ rất đẹp",
        "Cái túi đen to rất đẹp",
        "Cái túi xanh nhỏ rất đẹp",
        "Cái áo đen nhỏ rất đẹp",
      ],
      answer: "Cái túi đen nhỏ rất đẹp",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "crA03-1",
      question: "Số 5 trong tiếng Anh là gì? (unitA02 - Mua sắm/Số đếm)",
      options: ["Four", "Five", "Six", "Seven"],
      answer: "Five",
      type: "multiple-choice",
    },
    {
      id: "crA03-2",
      question:
        "'Bao nhiêu tiền?' nghĩa là gì trong tiếng Anh? (unitA02 - Mua sắm)",
      options: ["How much is it?", "I want this", "Do you have", "Where is"],
      answer: "How much is it?",
      type: "multiple-choice",
    },
    {
      id: "crA03-3",
      question: "Dịch sang tiếng Anh: 'Mười lăm' (unitA02)",
      options: [],
      answer: "Fifteen",
      type: "translate",
    },
    {
      id: "crA03-4",
      question: "Dịch sang tiếng Anh: 'Xin lỗi' (unitA01)",
      options: [],
      answer: "Sorry/Excuse me",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/ɜː/",
    description: "Âm 'ER' dài — bird, word, learn",
    examples: [
      {
        word: "colour",
        ipa: "/ˈkʌlə/",
        tip: "Âm cuối '-our' = schwa /ə/, không phát 'o-u-r'",
      },
    ],
    minimalPairs: [["bird /ɜː/", "bead /iː/"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Luyện nói: Màu sắc + Mô tả",
    items: [
      {
        en: "Red, blue, green, black, white",
        vn: "Đỏ, xanh dương, xanh lá, đen, trắng",
      },
      { en: "a red bag", vn: "một cái túi đỏ" },
      { en: "a big blue shirt", vn: "một cái áo xanh to" },
      { en: "a small white cup", vn: "một cái cốc trắng nhỏ" },
      { en: "I'm looking for...", vn: "Tôi đang tìm..." },
      { en: "Do you have this in blue?", vn: "Bạn có cái này màu xanh không?" },
      { en: "I prefer the black one.", vn: "Tôi thích cái màu đen hơn." },
      { en: "What color do you prefer?", vn: "Bạn thích màu gì hơn?" },
    ],
  },

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I'm looking for a {input} shirt.",
    level1Placeholder: "Nhập màu sắc (red, blue, green, black, white)...",
    level2Situation:
      "Bạn đang mua đồ. Mô tả 3 thứ bạn đang tìm kiếm: màu sắc + kích cỡ + loại đồ vật.",
    level2Hint: "I'm looking for a [size] [color] [object]. Do you have...?",
  },

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q3-1",
      question: "Câu nào ĐÚNG ngữ pháp tiếng Anh?",
      options: [
        "a shirt red big",
        "a big red shirt",
        "a red big shirt",
        "shirt big red a",
      ],
      answer: "a big red shirt",
      type: "multiple-choice",
    },
    {
      id: "q3-2",
      question: "Điền từ: 'I'm ___ for a green bag.'",
      options: [],
      answer: "looking",
      type: "cloze",
    },
    {
      id: "q3-3",
      question: "Màu nào là 'xanh lá'?",
      options: ["blue", "black", "green", "white"],
      answer: "green",
      type: "multiple-choice",
    },
    {
      id: "q3-4",
      question: "Điền từ: 'Do you have this in ___?' (màu đen)",
      options: [],
      answer: "black",
      type: "cloze",
    },
    {
      id: "q3-5",
      question: "Tôi thích cái màu xanh hơn. (Dịch sang tiếng Anh)",
      options: [],
      answer: "I prefer the blue one.",
      type: "translate",
    },
    {
      id: "q3-6",
      question: "Tôi đang tìm một cái túi đen to. (Dịch sang tiếng Anh)",
      options: [],
      answer: "I'm looking for a big black bag.",
      type: "translate",
    },
    {
      id: "q3-7",
      question: "Câu nào đúng để hỏi màu khác?",
      options: [
        "Do you have in blue this?",
        "Do you have this in blue?",
        "Have you this in blue?",
        "This do you have blue?",
      ],
      answer: "Do you have this in blue?",
      type: "multiple-choice",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA03-reading-1",
    title: "My Bag",
    title_vn: "Đọc đoạn mô tả màu sắc và đồ vật",
    level: "A0" as const,
    text:
      "This is my bag. " +
      "It is blue and big. " +
      "My pen is red. " +
      "My book is white and yellow. " +
      "My phone is black and small. " +
      "I love my bag!",
    questions: [
      {
        id: "uA03r-q1",
        question_vn: "Chiếc túi có màu gì?",
        options: ["Red", "Green", "Blue", "Black"],
        answer: "Blue",
        explanation_vn: "'It is blue and big.'",
      },
      {
        id: "uA03r-q2",
        question_vn: "Cây bút có màu gì?",
        options: ["Blue", "Red", "Yellow", "White"],
        answer: "Red",
        explanation_vn: "'My pen is red.'",
      },
      {
        id: "uA03r-q3",
        question_vn: "Điện thoại có màu gì và kích thước như thế nào?",
        options: [
          "Blue and big",
          "Red and small",
          "Black and small",
          "White and big",
        ],
        answer: "Black and small",
        explanation_vn: "'My phone is black and small.'",
      },
      {
        id: "uA03r-q4",
        question_vn: "Quyển sách có màu gì?",
        options: [
          "Red and blue",
          "White and yellow",
          "Black and green",
          "Blue and white",
        ],
        answer: "White and yellow",
        explanation_vn: "'My book is white and yellow.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "48MDYwdwMvY", // BBC Learning English — Easy English: Colours
  jobScenarios: [
    {
      id: 1,
      title: "Đặt câu hỏi về giờ giấc và nghỉ trưa tại công ty",
      focus: "Ask about work hours, lunch break, office rules (A0)",
      context: "Hỏi HR hoặc đồng nghiệp entry level",
      l1Note:
        "⚠️ 'What time is lunch?' 'We start at 8 and finish at 5.' 'Is there a break?'",
      example:
        "Do we have a one-hour lunch break? Can I leave at 5:30 if I finish my work?",
    },
  ],
};
