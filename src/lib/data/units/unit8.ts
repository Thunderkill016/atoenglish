import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-8 — Food & Ordering  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit8: UnitData = {
  unitId: "unit-8",
  title: "Unit 8: Food & Ordering",
  level: "A1",
  xp: 80,
  estimatedTime: 40,
  description:
    "Học từ vựng đồ ăn, cách gọi món và phân biệt Countable/Uncountable nouns trong tiếng Anh.",
  badgeName: "Người Sành Ăn",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn đi ăn tối tại nhà hàng nước ngoài và cần gọi món, hỏi về thành phần và thanh toán bằng tiếng Anh.",
  learningOutcomes: [
    "Gọi món ăn và thức uống tự tin tại nhà hàng",
    "Mô tả khẩu vị và dị ứng thực phẩm của bạn",
    "Hỏi về menu và thanh toán bằng tiếng Anh",
  ],
  badgeEmoji: "🍜",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🍚",
      en: "I'd like some rice, please.",
      vn: "Cho tôi một ít cơm, làm ơn.",
      context: "Gọi món lịch sự",
    },
    {
      emoji: "🥤",
      en: "Can I have a glass of water?",
      vn: "Tôi có thể có một ly nước không?",
      context: "Yêu cầu đồ uống",
    },
    {
      emoji: "🍖",
      en: "Do you have any chicken?",
      vn: "Bạn có thịt gà không?",
      context: "Hỏi về món ăn",
    },
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    "Trong tiếng Anh, <span class=\"text-primary font-semibold\">I'd like...</span> (= I would like...) lịch sự hơn <span class=\"text-primary font-semibold\">I want...</span> rất nhiều khi gọi món. Người Việt khi học tiếng Anh thường quên dùng 'I'd like' và nói thẳng 'I want' — điều này có thể nghe không lịch sự trong văn hóa phương Tây.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "rice",
      emoji: "🍚",
      phonetic: "/raɪs/",
      meaning: "cơm / gạo",
      example: "I eat rice every day.",
      example2: "Can I have some rice, please?",
      collocation: "fried rice / steamed rice",
      audio: "/audio/unit-8/rice.mp3",
      l1_interference_vn:
        "⚠️ 'Rice' không đếm được — KHÔNG 'a rice', 'two rices'. 'A bowl/plate of rice'. Tương tự: 'bread', 'water'.",
    },
    {
      id: 2,
      word: "noodles",
      emoji: "🍜",
      phonetic: "/ˈnuːdəlz/",
      meaning: "mì / bún",
      example: "I love eating noodles for breakfast.",
      example2: "Vietnamese noodles are delicious.",
      collocation: "noodle soup",
      audio: "/audio/unit-8/noodles.mp3",
      l1_interference_vn:
        "⚠️ 'Noodles' — số nhiều. 'A bowl of noodles'. KHÔNG 'a noodle' (trừ khi đếm từng sợi!).",
    },
    {
      id: 3,
      word: "bread",
      emoji: "🍞",
      phonetic: "/brɛd/",
      meaning: "bánh mì",
      example: "I have bread and butter for breakfast.",
      example2: "Would you like some bread?",
      collocation: "slice of bread",
      audio: "/audio/unit-8/bread.mp3",
      l1_interference_vn:
        "⚠️ 'Bread' không đếm được. 'A loaf of bread', 'a slice of bread'. KHÔNG 'a bread' hay 'two breads'.",
    },
    {
      id: 4,
      word: "chicken",
      emoji: "🍗",
      phonetic: "/ˈtʃɪkɪn/",
      meaning: "thịt gà",
      example: "I'd like some chicken, please.",
      example2: "The chicken soup is very good.",
      collocation: "grilled chicken",
      audio: "/audio/unit-8/chicken.mp3",
      l1_interference_vn:
        "⚠️ 'Chicken' (thịt, uncountable) vs 'a chicken' (con gà). 'I eat chicken' (thịt) vs 'I have a chicken' (nuôi).",
    },
    {
      id: 5,
      word: "vegetable",
      emoji: "🥦",
      phonetic: "/ˈvedʒtəbəl/",
      meaning: "rau củ",
      example: "Eat your vegetables!",
      example2: "I like fresh vegetables.",
      collocation: "fresh vegetables",
      audio: "/audio/unit-8/vegetable.mp3",
      l1_interference_vn:
        "⚠️ 'Vegetables' (số nhiều) khi nói chung: 'I eat vegetables'. Một loại cụ thể: 'a carrot', 'some spinach'.",
    },
    {
      id: 6,
      word: "fruit",
      emoji: "🍎",
      phonetic: "/fruːt/",
      meaning: "hoa quả",
      example: "I eat fruit every morning.",
      example2: "There is some fruit on the table.",
      collocation: "fresh fruit / tropical fruit",
      audio: "/audio/unit-8/fruit.mp3",
      l1_interference_vn:
        "⚠️ 'Fruit' (uncountable khi nói chung): 'I eat fruit'. Đếm được khi chỉ loại cụ thể: 'two fruits' = hai loại trái cây.",
    },
    {
      id: 7,
      word: "water",
      emoji: "💧",
      phonetic: "/ˈwɔːtər/",
      meaning: "nước",
      example: "Can I have some water?",
      example2: "Drink eight glasses of water a day.",
      collocation: "a glass of water / mineral water",
      audio: "/audio/unit-8/water.mp3",
      l1_interference_vn:
        "⚠️ 'Water' không đếm được. 'A glass/bottle of water'. 'Some water'. KHÔNG 'a water' hay 'two waters' (trừ khi đặt hàng).",
    },
    {
      id: 8,
      word: "coffee",
      emoji: "☕",
      phonetic: "/ˈkɒfi/",
      meaning: "cà phê",
      example: "I drink coffee in the morning.",
      example2: "Do you want some coffee?",
      collocation: "black coffee / iced coffee",
      audio: "/audio/unit-8/coffee.mp3",
      l1_interference_vn:
        "⚠️ 'Coffee' (uncountable) nhưng khi đặt: 'two coffees' = hai ly cà phê. 'A cup of coffee' là cách nói chuẩn.",
    },
    {
      id: 9,
      word: "soup",
      emoji: "🍲",
      phonetic: "/suːp/",
      meaning: "súp",
      example: "This soup is delicious.",
      example2: "I'd like a bowl of soup.",
      collocation: "bowl of soup / chicken soup",
      audio: "/audio/unit-8/soup.mp3",
      l1_interference_vn:
        "⚠️ 'Soup' (uncountable): 'a bowl of soup'. Trong nhà hàng có thể nói 'two soups'. KHÔNG 'a soup bowl'.",
    },
    {
      id: 10,
      word: "dessert",
      emoji: "🍮",
      phonetic: "/dɪˈzɜːt/",
      meaning: "món tráng miệng",
      example: "What would you like for dessert?",
      example2: "I love chocolate dessert.",
      collocation: "for dessert",
      audio: "/audio/unit-8/dessert.mp3",
      l1_interference_vn:
        "⚠️ 'Dessert' /dɪˈzɜːrt/ (món tráng miệng) ≠ 'desert' /ˈdezərt/ (sa mạc). Một 's' vs hai 's' — lỗi phổ biến!",
    },
    {
      id: 11,
      word: "menu",
      emoji: "📋",
      phonetic: "/ˈmenjuː/",
      meaning: "thực đơn",
      example: "Can I see the menu, please?",
      example2: "The menu has many Vietnamese dishes.",
      collocation: "look at the menu",
      audio: "/audio/unit-8/menu.mp3",
      l1_interference_vn:
        "⚠️ Âm /ˈmenjuː/ — 'u' cuối đọc /juː/. Không đọc 'men-nu' — đúng: 'MEN-yoo'.",
    },
    {
      id: 12,
      word: "bill",
      emoji: "🧾",
      phonetic: "/bɪl/",
      meaning: "hóa đơn tiền ăn",
      example: "Can we have the bill, please?",
      example2: "The bill comes to fifty dollars.",
      collocation: "pay the bill / ask for the bill",
      audio: "/audio/unit-8/bill.mp3",
      l1_interference_vn:
        "⚠️ 'The bill, please' (Anh) hoặc 'Check, please' (Mỹ) khi kêu tính tiền.",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Gọi món tại nhà hàng",
      audio: "/audio/unit-8/dialogue_1.mp3",
      desc: "Minh và bạn gọi món tại một nhà hàng tiếng Anh.",
      lines: [
        {
          id: "d1-1",
          speaker: "Waiter",
          text: "Good evening! Are you ready to order?",
          translation: "Chào buổi tối! Quý khách đã sẵn sàng gọi món chưa?",
        },
        {
          id: "d1-2",
          speaker: "Minh",
          text: "Yes. I'd like some noodle soup, please.",
          translation: "Vâng. Cho tôi một tô phở, làm ơn.",
        },
        {
          id: "d1-3",
          speaker: "Waiter",
          text: "Would you like any vegetables in your soup?",
          translation: "Quý khách có muốn thêm rau vào súp không?",
        },
        {
          id: "d1-4",
          speaker: "Minh",
          text: "Yes, please. And can I have some water?",
          translation: "Vâng, làm ơn. Và cho tôi một ít nước?",
        },
        {
          id: "d1-5",
          speaker: "Waiter",
          text: "Of course. Anything for dessert?",
          translation: "Dĩ nhiên. Quý khách dùng gì tráng miệng không?",
        },
        {
          id: "d1-6",
          speaker: "Minh",
          text: "No, thank you. Can we have the bill, please?",
          translation: "Không, cảm ơn. Cho chúng tôi tính tiền nhé?",
        },
      ],
    },
    {
      id: 2,
      title: "Sở thích ăn uống",
      audio: "/audio/unit-8/dialogue_2.mp3",
      desc: "Lan và Sarah nói chuyện về thức ăn yêu thích.",
      lines: [
        {
          id: "d2-1",
          speaker: "Sarah",
          text: "What's your favourite Vietnamese food?",
          translation: "Món ăn Việt Nam yêu thích của bạn là gì?",
        },
        {
          id: "d2-2",
          speaker: "Lan",
          text: "I love pho! It's a noodle soup with beef or chicken.",
          translation: "Tôi thích phở! Đó là súp mì với thịt bò hoặc gà.",
        },
        {
          id: "d2-3",
          speaker: "Sarah",
          text: "Is it countable or uncountable?",
          translation: "Nó là đếm được hay không đếm được?",
        },
        {
          id: "d2-4",
          speaker: "Lan",
          text: "Ha! Pho is uncountable. We say 'some pho', not 'a pho'.",
          translation:
            "Haha! Phở là không đếm được. Chúng ta nói 'some pho', không nói 'a pho'.",
        },
        {
          id: "d2-5",
          speaker: "Sarah",
          text: "I see! Do you like any other food?",
          translation: "Tôi hiểu rồi! Bạn có thích đồ ăn nào khác không?",
        },
        {
          id: "d2-6",
          speaker: "Lan",
          text: "Yes! I love fresh fruit — mangoes and dragon fruit.",
          translation: "Có! Tôi thích hoa quả tươi — xoài và thanh long.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "I'd like some rice please",
      options: [
        "I want some rice please",
        "I'd like some rice please",
        "I'd like a rice please",
        "I like some rice please",
      ],
      answer: "I'd like some rice please",
    },
    {
      id: "lac2",
      audio_text: "Can I have some water",
      options: [
        "Can I have some water",
        "Can I have a water",
        "Can you give me water",
        "I'd like some water",
      ],
      answer: "Can I have some water",
    },
    {
      id: "lac3",
      audio_text: "Do you have any chicken",
      options: [
        "Do you have some chicken",
        "Do you have any chicken",
        "Is there any chicken",
        "Do you have a chicken",
      ],
      answer: "Do you have any chicken",
    },
    {
      id: "lac4",
      audio_text: "Can we have the bill please",
      options: [
        "Can we pay now please",
        "Can we have the menu please",
        "Can we have the bill please",
        "Can I have the bill please",
      ],
      answer: "Can we have the bill please",
    },
    {
      id: "lac5",
      audio_text: "There is some fruit on the table",
      options: [
        "There are fruits on the table",
        "There is a fruit on the table",
        "There is some fruit on the table",
        "There is some fruits on the table",
      ],
      answer: "There is some fruit on the table",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I'd like some {input}, please.",
    level1Placeholder: "Ví dụ: rice, chicken, noodles, water...",
    level2Situation:
      "Bạn đang gọi món tại một nhà hàng. Hỏi thực đơn, gọi món chính và đồ uống, hỏi về tráng miệng và yêu cầu thanh toán.",
    level2Hint:
      "Excuse me, can I see the menu? I'd like [món ăn]. Can I have [đồ uống]? For dessert, I'd like [tráng miệng]. Can we have the bill, please?",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Countable & Uncountable Nouns — Danh từ đếm được và không đếm được",
    rule: "Countable: a/an + noun, some + noun-s  |  Uncountable: some + noun (no -s)",
    examples: [
      {
        en: "I'd like an egg and some bread.",
        vn: "Cho tôi một quả trứng và một ít bánh mì.",
      },
      { en: "Can I have some water?", vn: "Tôi có thể có một ít nước không?" },
      {
        en: "There are two eggs in the fridge.",
        vn: "Có hai quả trứng trong tủ lạnh.",
      },
      { en: "Do you have any rice?", vn: "Bạn có cơm không?" },
    ],
    tip: "Countable nouns có thể đếm được (one apple, two eggs). Uncountable nouns không đếm được và không dùng 'a/an' (some rice, some water). Dùng 'some' cho khẳng định và 'any' cho câu hỏi/phủ định.",
    vnNote:
      "⚠️ Lưu ý: Can/Can't dễ dùng nhưng người Việt hay thêm 'to' sau can: 'I can to swim' (SAI) → 'I can swim' (ĐÚNG). Sau modal verbs (can/will/should/must) KHÔNG BAO GIỜ dùng 'to'!",
    dialogueExample: {
      speaker: "Lan",
      text: "We say 'some pho', not 'a pho'.",
      translation: "Chúng ta nói 'some pho', không nói 'a pho'.",
      highlight: "some pho",
    },
    ccq: {
      question: "Câu nào đúng với 'water' (uncountable)?",
      options: [
        "I'd like a water.",
        "I'd like two waters.",
        "I'd like some water.",
        "I'd like waters.",
      ],
      answer: "I'd like some water.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Đếm được hay không đếm được?",
    pairs: [
      { left: "egg (có thể đếm)", right: "an egg / two eggs" },
      { left: "water (không đếm được)", right: "some water" },
      { left: "apple (có thể đếm)", right: "an apple / three apples" },
      { left: "rice (không đếm được)", right: "some rice" },
      { left: "bread (không đếm được)", right: "some bread" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      question: "'Water' là loại danh từ gì?",
      options: ["Countable", "Uncountable", "Cả hai", "Không xác định"],
      answer: "Uncountable",
      type: "multiple-choice",
    },
    {
      id: "pq2",
      question: "Chọn câu đúng:",
      options: [
        "I'd like a rice.",
        "I'd like some rice.",
        "I'd like two rices.",
        "I'd like a rices.",
      ],
      answer: "I'd like some rice.",
      type: "multiple-choice",
    },
    {
      id: "pq3",
      question: "Điền từ đúng: 'Do you have ___ chicken?'",
      options: [],
      answer: "any",
      type: "cloze",
    },
  ],

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt8-1",
      prompt_vn: "Tôi muốn gọi một tô phở.",
      answer: "I would like to order a bowl of pho.",
    },
    {
      id: "pt8-2",
      prompt_vn: "Bạn có muốn uống gì không?",
      answer: "Would you like something to drink?",
    },
    {
      id: "pt8-3",
      prompt_vn: "Mang hóa đơn cho tôi với.",
      answer: "Can I have the bill, please?",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q1",
      question: "Câu gọi món lịch sự nhất:",
      options: [
        "I want some soup.",
        "Give me some soup.",
        "I'd like some soup, please.",
        "Some soup for me.",
      ],
      answer: "I'd like some soup, please.",
      type: "multiple-choice",
      explanation_vn:
        "'I'd like' = cấu trúc lịch sự (= I would like). 'I want' đúng ngữ pháp nhưng kém lịch sự hơn khi gọi món.",
    },
    {
      id: "q2",
      question: "'Egg' là countable. Chọn câu đúng:",
      options: ["some egg", "a eggs", "two eggs", "some eggs is"],
      answer: "two eggs",
      type: "multiple-choice",
      explanation_vn:
        "'Egg' là danh từ đếm được → 'two eggs'. Không nói 'a eggs' (số nhiều không dùng 'a/an').",
    },
    {
      id: "q3",
      question: "Muốn tính tiền, bạn nói gì?",
      options: [
        "Can we have the bill, please?",
        "I want to pay now.",
        "Give me the money.",
        "The bill, now.",
      ],
      answer: "Can we have the bill, please?",
      type: "multiple-choice",
      explanation_vn:
        "'Can we have the bill?' = cho chúng tôi tính tiền. Ngày nay có thể nói 'Can I get the check?' (Mỹ).",
    },
    {
      id: "q4",
      question: "Điền từ vào: 'Can I have ___ bread, please?'",
      options: [],
      answer: "some",
      type: "cloze",
    },
    {
      id: "q5",
      question: "Điền từ vào: 'There isn't ___ coffee left.'",
      options: [],
      answer: "any",
      type: "cloze",
    },
    {
      id: "q6",
      question: "Cho tôi một tô phở, làm ơn.",
      options: [],
      answer: "I'd like some noodle soup, please.",
      type: "translate",
    },
    {
      id: "q7",
      question: "Bạn có muốn thêm rau không?",
      options: [],
      answer: "Would you like any vegetables?",
      type: "translate",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc8-1",
      sentence: "Can I have some water, please? No, there isn't some water.",
      errorWord: "some",
      correction: "any",
      explanation_vn:
        "Trong câu phủ định 'there isn't' → dùng 'ANY'. 'Some' dùng trong câu khẳng định.",
    },
    {
      id: "sc8-2",
      sentence: "I want some rice, please — it's more polite this way.",
      errorWord: "want",
      correction: "would like",
      explanation_vn:
        "Khi gọi món dùng 'I would like / I'd like' lịch sự hơn 'I want' trong ngữ cảnh nhà hàng.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la8-1",
      audio_text: "I'd like some noodle soup, please.",
      prompt_vn: "Tôi muốn một tô phở, làm ơn.",
      words: [
        "I'd",
        "like",
        "some",
        "noodle",
        "soup",
        "please",
        ".",
        "want",
        "any",
      ],
      answer: "I'd like some noodle soup please .",
    },
    {
      id: "la8-2",
      audio_text: "Can we have the bill, please?",
      prompt_vn: "Cho chúng tôi tính tiền, làm ơn.",
      words: ["Can", "we", "have", "the", "bill", "please", "?", "I", "check"],
      answer: "Can we have the bill please ?",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Cho tôi một ít cơm, làm ơn.",
      words: ["I'd", "like", "some", "rice", "please", ".", "was", "were"],
      answer: "I'd like some rice please .",
    },
    {
      id: "wb2",
      prompt_vn: "Bạn có thịt gà không?",
      words: ["Do", "you", "have", "any", "chicken", "?", "was", "were"],
      answer: "Do you have any chicken ?",
    },
    {
      id: "wb3",
      prompt_vn: "Cho chúng tôi tính tiền nhé?",
      words: ["Can", "we", "have", "the", "bill", "please", "?", "was", "were"],
      answer: "Can we have the bill please ?",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s8-1",
      prompt_vn: "Cho tôi một ít cơm, làm ơn.",
      words: ["I'd", "like", "some", "rice", "please", "."],
      answer: "I'd like some rice please .",
    },
    {
      id: "s8-2",
      prompt_vn: "Bạn có thịt gà không?",
      words: ["Do", "you", "have", "any", "chicken", "?"],
      answer: "Do you have any chicken ?",
    },
    {
      id: "s8-3",
      prompt_vn: "Cho chúng tôi tính tiền nhé?",
      words: ["Can", "we", "have", "the", "bill", "please", "?"],
      answer: "Can we have the bill please ?",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr8-1",
      question: "Hỏi giá một chiếc áo sơ mi: (Unit 7: Shopping)",
      options: [
        "How much are this shirt?",
        "How much is this shirt?",
        "How many is this shirt?",
        "How much this shirt?",
      ],
      answer: "How much is this shirt?",
      type: "multiple-choice",
    },
    {
      id: "cr8-2",
      question: "Những đôi giày này giá bao nhiêu? (Unit 7)",
      options: [],
      answer: "How much are these shoes?",
      type: "translate",
    },
    {
      id: "cr8-3",
      question: "Có hai chiếc ghế trong phòng. (Unit 6)",
      options: [],
      answer: "There are two chairs in the room.",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/ɔː/",
    description:
      "Nguyên âm /ɔː/ dài tròn — trong fork, order, morning hay bị thu ngắn",
    examples: [
      {
        word: "order",
        ipa: "/ˈɔːrdər/",
        tip: "Môi tròn hết cỡ, âm dài — không phải /o/ ngắn như tiếng Việt",
      },
      {
        word: "fork",
        ipa: "/fɔːrk/",
        tip: "Âm /ɔː/ trước /r/ — giữ độ dài và độ tròn của môi",
      },
    ],
    minimalPairs: [
      ["caught", "cot"],
      ["fork", "flock"],
    ],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I can speak English", vn: "Tôi có thể nói tiếng Anh" },
      { en: "She can't come today", vn: "Cô ấy không thể đến" },
      { en: "Can you help me?", vn: "Bạn có thể giúp tôi không?" },
      { en: "He can drive", vn: "Anh ấy có thể lái xe" },
      { en: "We can't meet tomorrow", vn: "Chúng tôi không thể gặp" },
      { en: "Can I use your phone?", vn: "Tôi có thể dùng điện thoại không?" },
      { en: "She can write reports", vn: "Cô ấy có thể viết báo cáo" },
      { en: "They can't attend", vn: "Họ không thể tham dự" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit8-reading-1",
    title: "A Vietnamese Lunch",
    title_vn: "Đọc đoạn về bữa trưa Việt Nam",
    level: "A1" as const,
    text:
      "Every day at noon, I have lunch with my family. " +
      "I usually eat rice and vegetables. " +
      "My mum cooks grilled chicken and noodle soup for us. " +
      "I love noodles! Vietnamese noodles are my favourite food. " +
      "My dad likes eating bread with butter in the morning, but at lunch he eats rice. " +
      "After lunch, we always eat fruit. Today we have mangoes and bananas. " +
      "We also drink green tea. " +
      "Lunchtime is my favourite time of the day!",
    questions: [
      {
        id: "u8r-q1",
        question_vn: "Người kể chuyện thường ăn gì vào buổi trưa?",
        options: [
          "Bread and butter",
          "Rice and vegetables",
          "Noodles and fruit",
          "Chicken and bread",
        ],
        answer: "Rice and vegetables",
        explanation_vn: "'I usually eat rice and vegetables.'",
      },
      {
        id: "u8r-q2",
        question_vn: "Mẹ của người kể chuyện nấu gì?",
        options: [
          "Rice and mangoes",
          "Bread and butter",
          "Grilled chicken and noodle soup",
          "Fruit and green tea",
        ],
        answer: "Grilled chicken and noodle soup",
        explanation_vn:
          "'My mum cooks grilled chicken and noodle soup for us.'",
      },
      {
        id: "u8r-q3",
        question_vn: "Bố thích ăn gì vào buổi sáng?",
        options: [
          "Rice and noodles",
          "Bread with butter",
          "Fruit and tea",
          "Chicken and vegetables",
        ],
        answer: "Bread with butter",
        explanation_vn:
          "'My dad likes eating bread with butter in the morning.'",
      },
      {
        id: "u8r-q4",
        question_vn: "Họ ăn gì sau bữa trưa?",
        options: [
          "Noodles and rice",
          "Bread and butter",
          "Fruit",
          "More chicken",
        ],
        answer: "Fruit",
        explanation_vn: "'After lunch, we always eat fruit.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Nói về bữa trưa với đồng nghiệp",
      focus:
        "Food at work: rice and vegetables, grilled chicken, fruit, green tea",
      context:
        "Giờ nghỉ trưa văn phòng hoặc kể thói quen ăn trưa khi phỏng vấn",
      l1Note:
        "⚠️ 'I usually eat rice' — 'My mum cooks grilled chicken'. 'We always eat fruit after lunch'.",
      example:
        "I usually eat rice and vegetables for lunch. After that we eat mangoes or bananas.",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "QL-4pUhQy5c",
};
