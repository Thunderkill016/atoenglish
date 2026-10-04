import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-2 — Số Đếm & Giá Tiền  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-2 — Số Đếm & Giá Tiền (Numbers & Prices)
// Level 0 / Foundation — Pre-CEFR A0
// Grammar:  "How much IS it?" — Question with verb BE
// L1 Alert: VN "bao nhiêu" = both "how much" + "how many"; English splits them
// CELTA:    Dialogue introduces numbers in real context FIRST
// Lewis:    Teach "how much", "the total is", "keep the change" as chunks
// ─────────────────────────────────────────────────────────────────────────────

export const unitA02: UnitData = {
  unitId: "unit-a0-2",
  title: "Unit A0-2: Số Đếm & Giá Tiền",
  level: "A0",
  xp: 60,
  estimatedTime: 40,
  description:
    "Học số từ 1–20 và cách hỏi giá tiền — kỹ năng thiết yếu khi mua sắm, đặt hàng, hoặc trả tiền bằng tiếng Anh.",
  badgeName: "Người Đếm Số",
  badgeEmoji: "🔢",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn đang mua đồ tại cửa hàng tiện lợi có thu ngân người nước ngoài. Giá hiển thị $12. Làm sao bạn hỏi giá và xử lý thanh toán bằng tiếng Anh?",

  learningOutcomes: [
    "Đọc và nói số từ 1 đến 20 bằng tiếng Anh",
    "Hỏi giá bằng cụm 'How much is it?'",
    "Xử lý giao dịch mua bán đơn giản",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Người bản ngữ hay dùng <span class="text-primary font-semibold">"How much is this?"</span> khi chỉ vào món hàng, hoặc <span class="text-primary font-semibold">"What\'s the total?"</span> khi muốn biết tổng. Không cần nói "How much money" — chỉ "How much" là đủ!',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "💰",
      en: "How much is it?",
      vn: "Cái này giá bao nhiêu?",
      context: "Hỏi giá một món hàng",
    },
    {
      emoji: "💵",
      en: "It's twelve dollars.",
      vn: "Giá là mười hai đô la.",
      context: "Trả lời giá tiền",
    },
    {
      emoji: "🧾",
      en: "Here's your change. Thank you!",
      vn: "Đây là tiền thừa của bạn. Cảm ơn!",
      context: "Kết thúc giao dịch",
    },
  ],

  // ✅ Lewis: 10 chunks — all in dialogue, not isolated words

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "price",
      l1_interference_vn:
        "⚠️ \'Price\' vs \'prize\': /praɪs/ vô thanh. Đừng rung dây thanh ở cuối — sẽ thành \'prize\'.",
      emoji: "🏷️",
      phonetic: "/praɪs/",
      meaning: "giá, giá tiền",
      example: "What's the price of this?",
      example2: "The price is ten dollars.",
      collocation: "the price is / full price / sale price / price tag",
      audio: "/audio/unit-a0-2/price.mp3",
    },
    {
      id: 2,
      word: "cost",
      emoji: "💲",
      phonetic: "/kɒst/",
      meaning: "giá / chi phí (động từ)",
      example: "How much does it cost?",
      example2: "This shirt costs twenty dollars.",
      collocation: "how much does it cost / cost a lot / total cost",
      audio: "/audio/unit-a0-2/cost.mp3",
      l1_interference_vn:
        "⚠️ 'Cost' (v) bất quy tắc: cost-cost-cost (không thêm -ed). 'How much does it cost?' KHÔNG 'How much is it costing?'",
    },
    {
      id: 3,
      word: "pay",
      emoji: "💳",
      phonetic: "/peɪ/",
      meaning: "trả (tiền)",
      example: "Can I pay by card?",
      example2: "I want to pay in cash.",
      collocation: "pay by card / pay in cash / pay the bill",
      audio: "/audio/unit-a0-2/pay.mp3",
      l1_interference_vn:
        "⚠️ 'Pay FOR something': 'I paid for the book'. 'Pay' (v) bất quy tắc: pay-paid-paid. KHÔNG 'I payed'.",
    },
    {
      id: 4,
      word: "change",
      emoji: "🪙",
      phonetic: "/tʃeɪndʒ/",
      meaning: "tiền thừa",
      example: "Here is your change.",
      example2: "Keep the change!",
      collocation: "keep the change / here's your change / no change",
      audio: "/audio/unit-a0-2/change.mp3",
      l1_interference_vn:
        "⚠️ 'Change' = tiền thừa (danh từ) HOẶC thay đổi (động từ). 'Keep the change' = giữ tiền thừa lại.",
    },
    {
      id: 5,
      word: "total",
      emoji: "🧾",
      phonetic: "/ˈtoʊtəl/",
      meaning: "tổng (cộng)",
      example: "The total is fifteen dollars.",
      example2: "What's the total?",
      collocation: "the total is / total price / grand total",
      audio: "/audio/unit-a0-2/total.mp3",
    },
    {
      id: 6,
      word: "cheap",
      l1_interference_vn:
        "⚠️ \'Cheap\' /tʃiːp/ — bắt đầu bằng /tʃ/ như \'ch\' miền Nam. Không phát \'chip\' (âm khác!).",
      emoji: "😊",
      phonetic: "/tʃiːp/",
      meaning: "rẻ",
      example: "This is very cheap!",
      example2: "Is there a cheaper option?",
      collocation: "very cheap / cheap price / buy cheap",
      audio: "/audio/unit-a0-2/cheap.mp3",
    },
    {
      id: 7,
      word: "expensive",
      l1_interference_vn:
        "⚠️ \'Expensive\' — 3 âm tiết: ex-PEN-sive. Nhấn âm giữa. Danh từ: \'expense\' (không có \'-ive\').",
      emoji: "😬",
      phonetic: "/ɪkˈspensɪv/",
      meaning: "đắt (tiền)",
      example: "That's too expensive for me.",
      example2: "Is this the most expensive?",
      collocation: "too expensive / very expensive / not that expensive",
      audio: "/audio/unit-a0-2/expensive.mp3",
    },
    {
      id: 8,
      word: "dollar",
      emoji: "💵",
      phonetic: "/ˈdɒlər/",
      meaning: "đô la",
      example: "It's five dollars.",
      example2: "I only have ten dollars.",
      collocation: "five dollars / US dollar / dollar bill",
      audio: "/audio/unit-a0-2/dollar.mp3",
      l1_interference_vn:
        "⚠️ Tiền tệ KHÔNG dùng số nhiều khi sau số: '5 dollar' (SAI) vs '5 dollars' (ĐÚNG). Nhưng '$5' đứng trước số.",
    },
    {
      id: 9,
      word: "receipt",
      emoji: "🧾",
      phonetic: "/rɪˈsiːt/",
      meaning: "biên lai, hóa đơn",
      example: "Can I have a receipt, please?",
      example2: "Keep your receipt for returns.",
      collocation: "a receipt / print the receipt / need a receipt",
      audio: "/audio/unit-a0-2/receipt.mp3",
      l1_interference_vn:
        "⚠️ 'Receipt' /rɪˈsiːt/ — 'p' HOÀN TOÀN CÂM. KHÔNG đọc 're-cept'. Tương tự: 'debt' (/det/, b câm).",
    },
    {
      id: 10,
      word: "how much",
      emoji: "❓",
      phonetic: "/haʊ mʌtʃ/",
      meaning: "bao nhiêu (tiền / khối lượng)",
      example: "How much is it?",
      example2: "How much does this cost?",
      collocation: "how much is / how much does it cost / how much do you have",
      audio: "/audio/unit-a0-2/howmuch.mp3",
      l1_interference_vn:
        "⚠️ 'How much' (không đếm được) vs 'how many' (đếm được). 'How much is it?' — KHÔNG 'How many does it cost?'",
    },
  ],

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: '"How much IS it?" — Câu hỏi giá với Verb BE',
    rule: "How much + IS/ARE + danh từ? → Hỏi giá hoặc số lượng của thứ gì đó.",

    conjugation: [
      { subject: "How much", form: "is", example: "How much is it?" },
      { subject: "How much", form: "is", example: "How much is the coffee?" },
      { subject: "How much", form: "are", example: "How much are the apples?" },
    ],

    examples: [
      { en: "How much is it?", vn: "Cái này giá bao nhiêu?" },
      { en: "It's twelve dollars.", vn: "Giá là mười hai đô la." },
      {
        en: "The total is twenty dollars.",
        vn: "Tổng cộng là hai mươi đô la.",
      },
      { en: "Can I pay by card?", vn: "Tôi có thể trả bằng thẻ không?" },
    ],

    tip: "Mẹo: 'How much IS IT?' — IS và IT đi cùng nhau thành cụm cố định. Học cả câu như một khối, đừng dịch từng từ!",

    vnNote:
      "⚠️ LỖI PHỔ BIẾN: Người Việt hay nói 'How much money is it?' — thừa chữ 'money'!\n\n" +
      "Tiếng Việt: 'Cái này bao nhiêu tiền?' → có 'tiền'\n" +
      "Tiếng Anh:  'How much IS IT?' → KHÔNG cần 'money'\n\n" +
      "❌ SAI:  'How much money is it?'\n" +
      "✅ ĐÚNG: 'How much is it?' — ngắn gọn và tự nhiên hơn\n\n" +
      "⚠️ VN vs EN: 'Bao nhiêu' dùng cho mọi thứ.\n" +
      "   Tiếng Anh: 'HOW MUCH' = đếm không được (tiền, nước, thời gian)\n" +
      "              'HOW MANY' = đếm được (táo, người, chai)",

    dialogueExample: {
      speaker: "Customer",
      text: "Excuse me — how much IS it?",
      translation: "Xin lỗi — cái này giá bao nhiêu?",
      highlight: "is",
    },

    ccq: {
      question: "Câu nào ĐÚNG khi hỏi giá?",
      options: [
        "How much money is it?",
        "How much it is?",
        "How much is it?",
        "How many is it?",
      ],
      answer: "How much is it?",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối số với từ tiếng Anh",
    pairs: [
      { left: "5", right: "five" },
      { left: "10", right: "ten" },
      { left: "12", right: "twelve" },
      { left: "15", right: "fifteen" },
      { left: "20", right: "twenty" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq2-1",
      question: "Câu nào đúng khi hỏi giá?",
      options: [
        "How much money is it?",
        "How much is it?",
        "How many is it?",
        "What is the money?",
      ],
      answer: "How much is it?",
      type: "multiple-choice",
      explanation_vn:
        "'How much' dùng cho thứ KHÔNG đếm được (tiền, giá). 'How many' dùng cho thứ ĐẾM ĐƯỢC (apples, people). Hỏi giá → How much.",
    },
    {
      id: "pq2-2",
      question: "Điền từ còn thiếu: 'The ___ is fifteen dollars.'",
      options: [],
      answer: "total",
      type: "cloze",
    },
    {
      id: "pq2-3",
      question: "'Expensive' có nghĩa là gì?",
      options: ["Rẻ", "Đắt", "Miễn phí", "Giảm giá"],
      answer: "Đắt",
      type: "multiple-choice",
      explanation_vn:
        "Expensive = đắt (giá cao). Cheap/Inexpensive = rẻ. Free = miễn phí. On sale = đang giảm giá. Bốn khái niệm giá cả cần nhớ.",
    },
    {
      id: "pq2-4",
      question: "Điền từ: 'Can I ___ by card?'",
      options: [],
      answer: "pay",
      type: "cloze",
    },
  ],

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt2-1",
      prompt_vn: "Cái này giá bao nhiêu?",
      answer: "How much is it?",
    },
    {
      id: "pt2-2",
      prompt_vn: "Tổng cộng là mười hai đô la.",
      answer: "The total is twelve dollars.",
    },
    {
      id: "pt2-3",
      prompt_vn: "Tôi có thể trả bằng thẻ không?",
      answer: "Can I pay by card?",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A02-1",
      sentence: "How many is this pen?",
      errorWord: "many",
      correction: "much",
      explanation_vn:
        "'How MUCH' hỏi giá tiền (không đếm theo số lượng rời). 'How many' hỏi số lượng: 'How many pens?'",
    },
    {
      id: "sc-A02-2",
      sentence: "It cost five dollar.",
      errorWord: "five dollar",
      correction: "five dollars",
      explanation_vn:
        "Sau số lớn hơn 1, danh từ phải ở dạng số nhiều: 'five DOLLARS'. Không dùng 'dollar' sau số đếm.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA02-1",
      audio_text: "How much is this pen?",
      prompt_vn: "Cái bút này giá bao nhiêu?",
      words: ["How", "much", "is", "this", "pen", "?", "many", "costs"],
      answer: "How much is this pen ?",
    },
    {
      id: "laA02-2",
      audio_text: "It costs twenty thousand dong.",
      prompt_vn: "Nó giá hai mươi nghìn đồng.",
      words: ["It", "costs", "twenty", "thousand", "dong", ".", "cost", "is"],
      answer: "It costs twenty thousand dong .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Cái này giá bao nhiêu?",
      words: ["How", "much", "is", "it", "?", "are"],
      answer: "How much is it ?",
    },
    {
      id: "wb2",
      prompt_vn: "Tổng cộng là hai mươi đô la.",
      words: ["The", "total", "is", "twenty", "dollars", ".", "are"],
      answer: "The total is twenty dollars .",
    },
    {
      id: "wb3",
      prompt_vn: "Tôi có thể giữ tiền thừa không?",
      words: ["Can", "I", "keep", "the", "change", "?", "is", "are"],
      answer: "Can I keep the change ?",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s2-1",
      prompt_vn: "Cái này giá bao nhiêu?",
      words: ["How", "much", "is", "it", "?"],
      answer: "How much is it ?",
    },
    {
      id: "s2-2",
      prompt_vn: "Tổng cộng là hai mươi đô la.",
      words: ["The", "total", "is", "twenty", "dollars", "."],
      answer: "The total is twenty dollars .",
    },
    {
      id: "s2-3",
      prompt_vn: "Tôi có thể giữ tiền thừa không?",
      words: ["Can", "I", "keep", "the", "change", "?"],
      answer: "Can I keep the change ?",
    },
  ],

  // ✅ All 10 vocab words used in natural context

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Mua đồ tại cửa hàng tiện lợi",
      audio: "/audio/unit-a0-2/dialogue_1.mp3",
      desc: "Minh mua nước và bánh — cần hỏi giá và thanh toán bằng tiếng Anh.",
      lines: [
        {
          id: "d2-1-1",
          speaker: "Minh",
          text: "Excuse me. How much is this water?",
          translation: "Xin lỗi. Chai nước này giá bao nhiêu?",
        },
        {
          id: "d2-1-2",
          speaker: "Staff",
          text: "It's two dollars.",
          translation: "Hai đô la.",
        },
        {
          id: "d2-1-3",
          speaker: "Minh",
          text: "And how much does the bread cost?",
          translation: "Còn bánh mì này giá bao nhiêu?",
        },
        {
          id: "d2-1-4",
          speaker: "Staff",
          text: "The bread is three dollars. Not expensive — very cheap today!",
          translation: "Bánh mì là ba đô la. Không đắt — hôm nay rất rẻ!",
        },
        {
          id: "d2-1-5",
          speaker: "Minh",
          text: "Great! What's the total price?",
          translation: "Tuyệt! Tổng giá là bao nhiêu?",
        },
        {
          id: "d2-1-6",
          speaker: "Staff",
          text: "The total is five dollars.",
          translation: "Tổng cộng là năm đô la.",
        },
        {
          id: "d2-1-7",
          speaker: "Minh",
          text: "I want to pay in cash. Here's ten dollars.",
          translation: "Tôi muốn trả bằng tiền mặt. Đây là mười đô la.",
        },
        {
          id: "d2-1-8",
          speaker: "Staff",
          text: "Thank you! Here's your change — five dollars. Do you need a receipt?",
          translation:
            "Cảm ơn! Đây là tiền thừa — năm đô la. Bạn cần biên lai không?",
        },
        {
          id: "d2-1-9",
          speaker: "Minh",
          text: "Yes, please. Can I have a receipt?",
          translation: "Vâng, làm ơn. Tôi có thể có biên lai không?",
        },
      ],
    },
    {
      id: 2,
      title: "Hỏi số điện thoại",
      audio: "/audio/unit-a0-2/dialogue_2.mp3",
      desc: "Trao đổi số điện thoại với đồng nghiệp mới.",
      lines: [
        {
          id: "d2-2-1",
          speaker: "Sara",
          text: "What's your phone number?",
          translation: "Số điện thoại của bạn là gì?",
        },
        {
          id: "d2-2-2",
          speaker: "Minh",
          text: "It's 0-9-1-2-3-4-5-6-7-8.",
          translation: "Là 0-9-1-2-3-4-5-6-7-8.",
        },
        {
          id: "d2-2-3",
          speaker: "Sara",
          text: "Sorry, can you say that again? How many digits?",
          translation: "Xin lỗi, bạn có thể nói lại không? Bao nhiêu chữ số?",
        },
        {
          id: "d2-2-4",
          speaker: "Minh",
          text: "Ten digits total. Zero, nine, one, two, three, four, five, six, seven, eight.",
          translation:
            "Tổng mười chữ số. Không, chín, một, hai, ba, bốn, năm, sáu, bảy, tám.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac2-1",
      audio_text: "How much is it",
      options: [
        "How many is it",
        "How much is it",
        "How much it is",
        "What is it",
      ],
      answer: "How much is it",
    },
    {
      id: "lac2-2",
      audio_text: "The total is fifteen dollars",
      options: [
        "The total is fifty dollars",
        "The total is fifteen dollars",
        "The price is fifteen dollars",
        "The total is sixteen dollars",
      ],
      answer: "The total is fifteen dollars",
    },
    {
      id: "lac2-3",
      audio_text: "Can I pay by card",
      options: [
        "Can I pay by car",
        "Can I play by card",
        "Can I pay by card",
        "Can I pay with card",
      ],
      answer: "Can I pay by card",
    },
    {
      id: "lac2-4",
      audio_text: "This is very cheap",
      options: [
        "Cái này rất rẻ",
        "Cái này rất đắt",
        "Cái này rất đẹp",
        "Cái này rất to",
      ],
      answer: "Cái này rất rẻ",
    },
    {
      id: "lac2-5",
      audio_text: "Here is your change five dollars",
      options: [
        "Đây là tiền thừa năm đô la",
        "Đây là tiền thừa mười đô la",
        "Đây là biên lai năm đô la",
        "Đây là tiền thừa mười lăm đô la",
      ],
      answer: "Đây là tiền thừa năm đô la",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "crA02-1",
      question: "'Xin chào' nghĩa là gì trong tiếng Anh? (unitA01 - Chào hỏi)",
      options: ["Hello", "Goodbye", "Sorry", "Thank you"],
      answer: "Hello",
      type: "multiple-choice",
    },
    {
      id: "crA02-2",
      question: "'Tạm biệt' nghĩa là gì trong tiếng Anh? (unitA01 - Chào hỏi)",
      options: ["Hello", "Goodbye", "Please", "Yes"],
      answer: "Goodbye",
      type: "multiple-choice",
    },
    {
      id: "crA02-3",
      question: "Dịch sang tiếng Anh: 'Rất vui được gặp bạn.' (unitA01)",
      options: [],
      answer: "Nice to meet you.",
      type: "translate",
    },
    {
      id: "crA02-4",
      question: "Dịch sang tiếng Anh: 'Cảm ơn!' (unitA01)",
      options: [],
      answer: "Thank you!",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/s/ & /z/ cuối từ",
    description: "Số nhiều: khi nào thêm /s/ và khi nào /z/",
    examples: [
      {
        word: "books",
        ipa: "/bʊks/",
        tip: "/s/ sau phụ âm vô thanh (k,p,t,f)",
      },
      {
        word: "bags",
        ipa: "/bægz/",
        tip: "/z/ sau phụ âm hữu thanh và nguyên âm",
      },
    ],
    minimalPairs: [["books /s/", "bags /z/"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Số từ 1–20 + Cụm câu mua sắm",
    items: [
      { en: "One, two, three, four, five", vn: "Một, hai, ba, bốn, năm" },
      { en: "Six, seven, eight, nine, ten", vn: "Sáu, bảy, tám, chín, mười" },
      { en: "Eleven, twelve, thirteen", vn: "Mười một, mười hai, mười ba" },
      { en: "Fifteen, twenty", vn: "Mười lăm, hai mươi" },
      { en: "How much is it?", vn: "Giá bao nhiêu?" },
      { en: "The total is ___ dollars.", vn: "Tổng cộng là ___ đô la." },
      { en: "Can I pay by card?", vn: "Tôi có thể trả bằng thẻ không?" },
      { en: "Here's your change.", vn: "Đây là tiền thừa của bạn." },
    ],
  },

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "How much is it? — It's {input} dollars.",
    level1Placeholder: "Nhập số tiền (vd: five, ten, twelve)...",
    level2Situation:
      "Bạn đang mua cà phê ($3) và bánh sandwich ($8) tại một quán. Hỏi giá từng món, hỏi tổng, rồi trả bằng tiền mặt $20.",
    level2Hint:
      "How much is the coffee? / And the sandwich? / What's the total? / Here's twenty dollars. / Keep the change!",
  },

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q2-1",
      question: "Câu nào ĐÚNG khi hỏi giá?",
      options: [
        "How much money is it?",
        "How much is it?",
        "How many is it?",
        "What is the money?",
      ],
      answer: "How much is it?",
      type: "multiple-choice",
    },
    {
      id: "q2-2",
      question: "Điền vào chỗ trống: 'The ___ is twelve dollars.'",
      options: [],
      answer: "total",
      type: "cloze",
    },
    {
      id: "q2-3",
      question: "Số nào là 'fifteen'?",
      options: ["13", "14", "15", "16"],
      answer: "15",
      type: "multiple-choice",
    },
    {
      id: "q2-4",
      question: "Điền vào chỗ trống: 'Can I ___ by card?'",
      options: [],
      answer: "pay",
      type: "cloze",
    },
    {
      id: "q2-5",
      question: '"Expensive" nghĩa là gì?',
      options: ["Rẻ", "Đắt", "Miễn phí", "Có giảm giá"],
      answer: "Đắt",
      type: "multiple-choice",
    },
    {
      id: "q2-6",
      question: "Cái này giá bao nhiêu? (Dịch sang tiếng Anh)",
      options: [],
      answer: "How much is it?",
      type: "translate",
    },
    {
      id: "q2-7",
      question:
        "Tổng cộng là mười lăm đô la. Đây là hai mươi đô la. (Dịch sang tiếng Anh)",
      options: [],
      answer: "The total is fifteen dollars. Here's twenty dollars.",
      type: "translate",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA02-reading-1",
    title: "At the Market",
    title_vn: "Đọc đoạn về mua hàng ở chợ",
    level: "A0" as const,
    text:
      "I am at the market. " +
      "I have 50,000 dong. " +
      "An apple is 5,000 dong. " +
      "I buy ten apples. " +
      "How much is that? " +
      "That is 50,000 dong. " +
      "I have zero dong now!",
    questions: [
      {
        id: "uA02r-q1",
        question_vn: "Người kể chuyện có bao nhiêu tiền?",
        options: ["10,000 dong", "20,000 dong", "50,000 dong", "100,000 dong"],
        answer: "50,000 dong",
        explanation_vn: "'I have 50,000 dong.'",
      },
      {
        id: "uA02r-q2",
        question_vn: "Một quả táo giá bao nhiêu?",
        options: ["1,000 dong", "5,000 dong", "10,000 dong", "20,000 dong"],
        answer: "5,000 dong",
        explanation_vn: "'An apple is 5,000 dong.'",
      },
      {
        id: "uA02r-q3",
        question_vn: "Người kể chuyện mua bao nhiêu quả táo?",
        options: ["Five", "Eight", "Ten", "Twenty"],
        answer: "Ten",
        explanation_vn: "'I buy ten apples.'",
      },
      {
        id: "uA02r-q4",
        question_vn:
          "Sau khi mua hàng, người kể chuyện còn lại bao nhiêu tiền?",
        options: ["10,000 dong", "5,000 dong", "1,000 dong", "Zero dong"],
        answer: "Zero dong",
        explanation_vn: "'I have zero dong now!'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "EDFWbC74Sdc", // BBC Learning English — Numbers 1-100
  jobScenarios: [
    {
      id: 1,
      title: "Hỏi về công việc và nhiệm vụ hàng ngày của đồng nghiệp mới",
      focus: "Ask simple questions about job tasks at entry level",
      context: "Buddy chat trên first week at work",
      l1Note:
        "⚠️ 'What do you do every day?' 'I send emails and answer phones.'",
      example:
        "What time do you start? I answer customer emails in the morning and prepare reports in the afternoon.",
    },
  ],
};
