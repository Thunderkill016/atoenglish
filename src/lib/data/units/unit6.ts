import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-6 — Home & Daily Life  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit6: UnitData = {
  unitId: "unit-6",
  title: "Unit 6: Home & Daily Life",
  level: "A1",
  xp: 80,
  estimatedTime: 40,
  description:
    "Học từ vựng về nhà ở, đồ đạc và cách dùng 'There is/are' để mô tả không gian.",
  badgeName: "Người Giữ Nhà",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn bè quốc tế đến thăm nhà lần đầu — bạn cần dẫn họ tham quan và mô tả các phòng, đồ vật trong nhà.",
  learningOutcomes: [
    "Mô tả các phòng và đồ dùng trong nhà bằng tiếng Anh",
    "Dùng there is / there are để nói về không gian",
    "Hỏi về nhà và chỗ ở của người khác",
  ],
  badgeEmoji: "🏠",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🛋️",
      en: "There is a sofa in the living room.",
      vn: "Có một chiếc ghế sofa trong phòng khách.",
      context: "Mô tả đồ đạc trong nhà",
    },
    {
      emoji: "🛏️",
      en: "There are two beds in the bedroom.",
      vn: "Có hai chiếc giường trong phòng ngủ.",
      context: "Dùng 'are' với số nhiều",
    },
    {
      emoji: "❓",
      en: "Is there a bathroom upstairs?",
      vn: "Có phòng tắm ở tầng trên không?",
      context: "Câu hỏi với There is/are",
    },
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Người Việt thường nói <span class="text-primary font-semibold">living room</span> (phòng khách) hoặc <span class="text-primary font-semibold">sitting room</span> (British English). <span class="text-primary font-semibold">There is/are</span> được dùng rất nhiều khi mô tả địa điểm và không gian — rất thực tế cho giao tiếp hàng ngày.',

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "bedroom",
      emoji: "🛏️",
      phonetic: "/ˈbɛdruːm/",
      meaning: "phòng ngủ",
      example: "There are two bedrooms in my house.",
      example2: "My bedroom is on the second floor.",
      collocation: "master bedroom",
      audio: "/audio/unit-6/bedroom.mp3",
      l1_interference_vn:
        "⚠️ Stress: BED-room. 'There IS a bedroom' (số ít) — không phải 'There ARE a bedroom'.",
    },
    {
      id: 2,
      word: "kitchen",
      emoji: "🍳",
      phonetic: "/ˈkɪtʃɪn/",
      meaning: "nhà bếp",
      example: "The kitchen is next to the dining room.",
      example2: "She cooks in the kitchen every morning.",
      collocation: "kitchen table",
      audio: "/audio/unit-6/kitchen.mp3",
      l1_interference_vn:
        "⚠️ Âm /tʃ/ trong 'kitchen'. Người Việt hay đọc 'ki-chen' thay vì 'KITCH-in'.",
    },
    {
      id: 3,
      word: "living room",
      emoji: "🛋️",
      phonetic: "/ˈlɪvɪŋ ruːm/",
      meaning: "phòng khách",
      example: "We watch TV in the living room.",
      example2: "The living room has a big sofa.",
      collocation: "living room sofa",
      audio: "/audio/unit-6/living_room.mp3",
      l1_interference_vn:
        "⚠️ 2 từ riêng — không viết liền 'livingroom'. Stress: LIV-ing room.",
    },
    {
      id: 4,
      word: "bathroom",
      emoji: "🚿",
      phonetic: "/ˈbɑːθruːm/",
      meaning: "phòng tắm",
      example: "There is one bathroom on each floor.",
      example2: "He takes a shower in the bathroom.",
      collocation: "bathroom mirror",
      audio: "/audio/unit-6/bathroom.mp3",
      l1_interference_vn:
        "⚠️ Ở Mỹ 'bathroom' bao gồm cả toilet. 'Restroom/lavatory' dùng nơi công cộng.",
    },
    {
      id: 5,
      word: "table",
      emoji: "🪑",
      phonetic: "/ˈteɪbəl/",
      meaning: "cái bàn",
      example: "There is a table in the kitchen.",
      example2: "We eat dinner at the table.",
      collocation: "dining table",
      audio: "/audio/unit-6/table.mp3",
      l1_interference_vn:
        "⚠️ 'Table' (bàn ăn) ≠ 'desk' (bàn làm việc). 'Dining table' = bàn ăn cụ thể hơn.",
    },
    {
      id: 6,
      word: "chair",
      emoji: "🪑",
      phonetic: "/tʃɛər/",
      meaning: "cái ghế",
      example: "There are four chairs around the table.",
      example2: "Please sit on the chair.",
      collocation: "wooden chair",
      audio: "/audio/unit-6/chair.mp3",
      l1_interference_vn:
        "⚠️ Âm /tʃeər/ — 'ch' = /tʃ/. Âm /r/ cuối thường yếu nhưng không bỏ hẳn.",
    },
    {
      id: 7,
      word: "sofa",
      emoji: "🛋️",
      phonetic: "/ˈsəʊfə/",
      meaning: "ghế sofa",
      example: "I like sitting on the sofa to relax.",
      example2: "The sofa is very comfortable.",
      collocation: "comfortable sofa",
      audio: "/audio/unit-6/sofa.mp3",
      l1_interference_vn:
        "⚠️ 'Sofa' = 'couch' (Mỹ phổ biến hơn). Cả hai đều được chấp nhận trong giao tiếp.",
    },
    {
      id: 8,
      word: "window",
      emoji: "🪟",
      phonetic: "/ˈwɪndəʊ/",
      meaning: "cửa sổ",
      example: "There is a big window in my bedroom.",
      example2: "Please open the window for fresh air.",
      collocation: "open the window",
      audio: "/audio/unit-6/window.mp3",
      l1_interference_vn:
        "⚠️ 'Open the window' — cần mạo từ 'the' vì cái cửa sổ cụ thể đã được biết.",
    },
    {
      id: 9,
      word: "door",
      emoji: "🚪",
      phonetic: "/dɔːr/",
      meaning: "cánh cửa",
      example: "Please close the door.",
      example2: "There is a door between the rooms.",
      collocation: "front door / back door",
      audio: "/audio/unit-6/door.mp3",
      l1_interference_vn:
        "⚠️ Âm /r/ cuối — rõ hơn trong American, yếu hơn trong British. Không bỏ hoàn toàn.",
    },
    {
      id: 10,
      word: "lamp",
      emoji: "💡",
      phonetic: "/læmp/",
      meaning: "đèn",
      example: "There is a lamp on the desk.",
      example2: "The lamp gives warm light.",
      collocation: "bedside lamp",
      audio: "/audio/unit-6/lamp.mp3",
      l1_interference_vn:
        "⚠️ 'Lamp' (đèn bàn/đứng) ≠ 'light' (đèn nói chung). 'Turn on the lamp' vs 'turn on the light'.",
    },
    {
      id: 11,
      word: "wardrobe",
      emoji: "🪞",
      phonetic: "/ˈwɔːdrəʊb/",
      meaning: "tủ quần áo",
      example: "There is a wardrobe in the corner.",
      example2: "My clothes are in the wardrobe.",
      collocation: "built-in wardrobe",
      audio: "/audio/unit-6/wardrobe.mp3",
      l1_interference_vn:
        "⚠️ 'Wardrobe' (Anh) = 'closet' (Mỹ). Phân biệt với 'cabinet' (tủ nhỏ trong bếp/nhà bếp).",
    },
    {
      id: 12,
      word: "garden",
      emoji: "🌿",
      phonetic: "/ˈɡɑːdən/",
      meaning: "khu vườn",
      example: "There is a small garden behind the house.",
      example2: "I love sitting in the garden.",
      collocation: "flower garden / back garden",
      audio: "/audio/unit-6/garden.mp3",
      l1_interference_vn:
        "⚠️ 'In the garden' — dùng 'in', không phải 'at'. 'Garden' (Anh) = 'yard' (Mỹ).",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Mô tả căn hộ mới",
      audio: "/audio/unit-6/dialogue_1.mp3",
      desc: "Hoa cho bạn xem căn hộ mới của cô ấy qua video call.",
      lines: [
        {
          id: "d1-1",
          speaker: "Hoa",
          text: "Welcome to my new apartment! This is the living room.",
          translation:
            "Chào mừng đến với căn hộ mới của mình! Đây là phòng khách.",
        },
        {
          id: "d1-2",
          speaker: "Tom",
          text: "Wow! It's nice. Is there a sofa?",
          translation: "Ồ! Đẹp quá. Có ghế sofa không?",
        },
        {
          id: "d1-3",
          speaker: "Hoa",
          text: "Yes, there is a big blue sofa and two chairs.",
          translation: "Có, có một chiếc sofa xanh lớn và hai chiếc ghế.",
        },
        {
          id: "d1-4",
          speaker: "Tom",
          text: "How many bedrooms are there?",
          translation: "Có bao nhiêu phòng ngủ?",
        },
        {
          id: "d1-5",
          speaker: "Hoa",
          text: "There are two bedrooms and one bathroom.",
          translation: "Có hai phòng ngủ và một phòng tắm.",
        },
        {
          id: "d1-6",
          speaker: "Tom",
          text: "Is there a garden?",
          translation: "Có khu vườn không?",
        },
        {
          id: "d1-7",
          speaker: "Hoa",
          text: "No, there isn't. But there is a big balcony!",
          translation: "Không. Nhưng có một ban công rộng!",
        },
      ],
    },
    {
      id: 2,
      title: "Tìm đồ trong nhà",
      audio: "/audio/unit-6/dialogue_2.mp3",
      desc: "Minh đang hỏi mẹ về vị trí đồ vật trong nhà.",
      lines: [
        {
          id: "d2-1",
          speaker: "Minh",
          text: "Mum, where is my bag?",
          translation: "Mẹ ơi, túi của con ở đâu vậy?",
        },
        {
          id: "d2-2",
          speaker: "Mum",
          text: "There is a bag on the chair in the kitchen.",
          translation: "Có một chiếc túi trên chiếc ghế trong bếp.",
        },
        {
          id: "d2-3",
          speaker: "Minh",
          text: "Is there a book on the table?",
          translation: "Có quyển sách nào trên bàn không?",
        },
        {
          id: "d2-4",
          speaker: "Mum",
          text: "Yes, there are three books on the table.",
          translation: "Có, có ba quyển sách trên bàn.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "There is a sofa in the living room",
      options: [
        "There is a bed in the living room",
        "There is a sofa in the living room",
        "There are sofas in the living room",
        "There is a sofa in the bedroom",
      ],
      answer: "There is a sofa in the living room",
    },
    {
      id: "lac2",
      audio_text: "There are two chairs in the kitchen",
      options: [
        "There is one chair in the kitchen",
        "There are two chairs in the kitchen",
        "There are two tables in the kitchen",
        "There are three chairs in the kitchen",
      ],
      answer: "There are two chairs in the kitchen",
    },
    {
      id: "lac3",
      audio_text: "Is there a bathroom",
      options: [
        "Is there a bedroom",
        "Are there bathrooms",
        "Is there a bathroom",
        "Is there a balcony",
      ],
      answer: "Is there a bathroom",
    },
    {
      id: "lac4",
      audio_text: "There isn't a garden",
      options: [
        "There is a garden",
        "There are gardens",
        "There isn't a garden",
        "There aren't gardens",
      ],
      answer: "There isn't a garden",
    },
    {
      id: "lac5",
      audio_text: "There are three bedrooms in my house",
      options: [
        "There is one bedroom in my house",
        "There are three bedrooms in my house",
        "There are three bathrooms in my house",
        "There are three bedrooms in the hotel",
      ],
      answer: "There are three bedrooms in my house",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "In my house, there is a {input}.",
    level1Placeholder: "Ví dụ: kitchen, living room, garden...",
    level2Situation:
      "Mô tả nhà của bạn cho một người bạn. Nói về các phòng, đồ đạc và những gì bạn thích nhất trong ngôi nhà.",
    level2Hint:
      "In my house, there are [số] rooms. There is a [phòng] and a [phòng]. In the [phòng], there is/are [đồ đạc]. My favourite room is the [phòng] because [lý do].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "There is / There are — Mô tả không gian",
    rule: "There is + singular  |  There are + plural  |  There isn't / There aren't",
    examples: [
      {
        en: "There is a table in the kitchen.",
        vn: "Có một chiếc bàn trong bếp.",
      },
      {
        en: "There are two chairs in the room.",
        vn: "Có hai chiếc ghế trong phòng.",
      },
      {
        en: "Is there a bathroom upstairs?",
        vn: "Có phòng tắm ở tầng trên không?",
      },
      {
        en: "There aren't any windows in this room.",
        vn: "Phòng này không có cửa sổ nào.",
      },
    ],
    tip: "Dùng 'There IS' với danh từ số ít và 'There ARE' với danh từ số nhiều. Phủ định: 'There ISN'T' và 'There AREN'T'. Câu hỏi: đảo 'Is/Are there...?'",
    vnNote:
      "⚠️ Lưu ý: 'There is/There are' không có tương đương trực tiếp trong tiếng Việt. Lỗi phổ biến: dùng 'There is' với số nhiều — 'There is chairs' (SAI) → 'There are chairs' (ĐÚNG).",
    dialogueExample: {
      speaker: "Hoa",
      text: "There are two bedrooms and one bathroom.",
      translation: "Có hai phòng ngủ và một phòng tắm.",
      highlight: "There are",
    },
    ccq: {
      question: "Câu nào đúng khi mô tả nhiều đồ đạc?",
      options: [
        "There is two chairs.",
        "There are two chair.",
        "There are two chairs.",
        "There is a two chairs.",
      ],
      answer: "There are two chairs.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối phòng với đồ đạc phù hợp",
    pairs: [
      { left: "bedroom", right: "bed" },
      { left: "kitchen", right: "table" },
      { left: "living room", right: "sofa" },
      { left: "bathroom", right: "mirror" },
      { left: "garden", right: "flowers" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      question: "Chọn câu đúng mô tả nhiều ghế:",
      options: [
        "There is two chairs.",
        "There are two chairs.",
        "There be two chairs.",
        "Is there two chairs.",
      ],
      answer: "There are two chairs.",
      type: "multiple-choice",
    },
    {
      id: "pq2",
      question: "Câu hỏi đúng về phòng ngủ:",
      options: [
        "Is there a bedroom?",
        "There is a bedroom?",
        "Are there a bedroom?",
        "Is a bedroom there?",
      ],
      answer: "Is there a bedroom?",
      type: "multiple-choice",
    },
    {
      id: "pq3",
      question: "Điền vào chỗ trống: 'There ___ a lamp on the table.'",
      options: [],
      answer: "is",
      type: "cloze",
    },
  ],

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt6-1",
      prompt_vn: "Có một cái bàn trong phòng bếp.",
      answer: "There is a table in the kitchen.",
    },
    {
      id: "pt6-2",
      prompt_vn: "Không có ghế sofa trong phòng ngủ.",
      answer: "There isn't a sofa in the bedroom.",
    },
    {
      id: "pt6-3",
      prompt_vn: "Có hai phòng ngủ trong căn hộ của tôi.",
      answer: "There are two bedrooms in my apartment.",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q1",
      question: "Chọn câu đúng với 'two windows':",
      options: [
        "There is two windows.",
        "There are two windows.",
        "There have two windows.",
        "There be two windows.",
      ],
      answer: "There are two windows.",
      type: "multiple-choice",
      explanation_vn:
        "'Two windows' là số nhiều → dùng 'There ARE'. 'There IS' chỉ dùng cho số ít.",
    },
    {
      id: "q2",
      question: "Cách nói phủ định của 'There is a garden':",
      options: [
        "There isn't a garden.",
        "There aren't a garden.",
        "There isn't any gardens.",
        "There are no garden.",
      ],
      answer: "There isn't a garden.",
      type: "multiple-choice",
      explanation_vn:
        "'There is' → phủ định là 'There isn't' (viết tắt của 'is not'). 'Aren't' dùng cho số nhiều.",
    },
    {
      id: "q3",
      question: "Phòng nào thường có sofa?",
      options: ["bedroom", "kitchen", "living room", "bathroom"],
      answer: "living room",
      type: "multiple-choice",
      explanation_vn:
        "'Living room' = phòng khách, nơi đặt sofa và tự TV. Bedroom = phòng ngủ, kitchen = bếp.",
    },
    {
      id: "q4",
      question: "Điền từ còn thiếu: 'There ___ a wardrobe in the corner.'",
      options: [],
      answer: "is",
      type: "cloze",
    },
    {
      id: "q5",
      question: "Điền từ còn thiếu: 'Are there ___ chairs in the room?'",
      options: [],
      answer: "any",
      type: "cloze",
    },
    {
      id: "q6",
      question: "Có hai phòng ngủ trong ngôi nhà của tôi.",
      options: [],
      answer: "There are two bedrooms in my house.",
      type: "translate",
    },
    {
      id: "q7",
      question: "Có phòng tắm nào ở tầng dưới không?",
      options: [],
      answer: "Is there a bathroom downstairs?",
      type: "translate",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc6-1",
      sentence: "There is three windows in this room.",
      errorWord: "is",
      correction: "are",
      explanation_vn:
        "'Three windows' là số nhiều → 'There ARE three windows'. 'Is' chỉ dùng cho số ít.",
    },
    {
      id: "sc6-2",
      sentence: "There isn't some milk in the fridge.",
      errorWord: "some",
      correction: "any",
      explanation_vn:
        "Trong câu phủ định/nghi vấn dùng 'ANY': 'There isn't any milk.' 'Some' dùng trong câu khẳng định.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la6-1",
      audio_text: "There is a table in the kitchen.",
      prompt_vn: "Có một chiếc bàn trong bếp.",
      words: [
        "There",
        "is",
        "a",
        "table",
        "in",
        "the",
        "kitchen",
        ".",
        "are",
        "on",
      ],
      answer: "There is a table in the kitchen .",
    },
    {
      id: "la6-2",
      audio_text: "There are two bedrooms in my house.",
      prompt_vn: "Có hai phòng ngủ trong nhà tôi.",
      words: [
        "There",
        "are",
        "two",
        "bedrooms",
        "in",
        "my",
        "house",
        ".",
        "is",
        "three",
      ],
      answer: "There are two bedrooms in my house .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Có một chiếc bàn trong bếp.",
      words: [
        "There",
        "is",
        "a",
        "table",
        "in",
        "the",
        "kitchen",
        ".",
        "was",
        "were",
      ],
      answer: "There is a table in the kitchen .",
    },
    {
      id: "wb2",
      prompt_vn: "Có hai chiếc ghế trong phòng.",
      words: [
        "There",
        "are",
        "two",
        "chairs",
        "in",
        "the",
        "room",
        ".",
        "was",
        "were",
      ],
      answer: "There are two chairs in the room .",
    },
    {
      id: "wb3",
      prompt_vn: "Có phòng tắm ở tầng trên không?",
      words: ["Is", "there", "a", "bathroom", "upstairs", "?", "was", "were"],
      answer: "Is there a bathroom upstairs ?",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s6-1",
      prompt_vn: "Có một chiếc bàn trong bếp.",
      words: ["There", "is", "a", "table", "in", "the", "kitchen", "."],
      answer: "There is a table in the kitchen .",
    },
    {
      id: "s6-2",
      prompt_vn: "Có hai chiếc ghế trong phòng.",
      words: ["There", "are", "two", "chairs", "in", "the", "room", "."],
      answer: "There are two chairs in the room .",
    },
    {
      id: "s6-3",
      prompt_vn: "Có phòng tắm ở tầng trên không?",
      words: ["Is", "there", "a", "bathroom", "upstairs", "?"],
      answer: "Is there a bathroom upstairs ?",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr6-1",
      question:
        "Chọn câu đúng: 'I like ___ in my free time.' (Unit 5: Hobbies)",
      options: ["swim", "to swimming", "swimming", "swims"],
      answer: "swimming",
      type: "multiple-choice",
    },
    {
      id: "cr6-2",
      question: "Cô ấy thích chụp ảnh vào cuối tuần. (Unit 5)",
      options: [],
      answer: "She likes taking photos on weekends.",
      type: "translate",
    },
    {
      id: "cr6-3",
      question: "Chọn đúng: 'She ___ to school.' (Unit 2/3 Present Simple)",
      options: ["go", "goes", "going", "to go"],
      answer: "goes",
      type: "multiple-choice",
      explanation_vn: "She goes. 3rd person +s/es.",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/ɪ/ vs /iː/",
    description:
      "Nguyên âm ngắn /ɪ/ (bit) vs dài /iː/ (beat) — người Việt thường đọc cả hai thành /i/ dài",
    examples: [
      {
        word: "living",
        ipa: "/ˈlɪvɪŋ/",
        tip: "/ɪ/ ngắn — miệng hơi mở, môi không căng, lưỡi thấp hơn /iː/",
      },
      {
        word: "kitchen",
        ipa: "/ˈkɪtʃɪn/",
        tip: "/tʃ/ trong kitchen — không phải /ch/ như tiếng Việt",
      },
    ],
    minimalPairs: [
      ["bit", "beat"],
      ["fill", "feel"],
    ],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "There is a meeting room", vn: "Có một phòng họp" },
      { en: "There are 10 employees", vn: "Có 10 nhân viên" },
      { en: "There isn't a printer", vn: "Không có máy in" },
      { en: "There aren't any desks", vn: "Không có bàn làm việc" },
      { en: "Is there a bathroom?", vn: "Có nhà vệ sinh không?" },
      { en: "Are there any chairs?", vn: "Có ghế không?" },
      { en: "There is a problem", vn: "Có một vấn đề" },
      { en: "There are many options", vn: "Có nhiều lựa chọn" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit6-reading-1",
    title: "My New Apartment",
    title_vn: "Đọc đoạn về căn hộ mới",
    level: "A1" as const,
    text:
      "My name is Linh. I have a new apartment in Ho Chi Minh City. " +
      "There are three rooms: a bedroom, a kitchen, and a living room. " +
      "In the living room, there is a big sofa and two chairs. " +
      "There is also a lamp on the table near the window. " +
      "My bedroom has a wardrobe and a door to the balcony. " +
      "There is no garden, but I put flowers on the balcony. " +
      "I love my new home!",
    questions: [
      {
        id: "u6r-q1",
        question_vn: "Linh có bao nhiêu phòng trong căn hộ?",
        options: ["Two rooms", "Three rooms", "Four rooms", "Five rooms"],
        answer: "Three rooms",
        explanation_vn:
          "Đoạn văn nói 'There are three rooms: a bedroom, a kitchen, and a living room.'",
      },
      {
        id: "u6r-q2",
        question_vn: "Trong phòng khách có gì?",
        options: [
          "A wardrobe and a lamp",
          "A big sofa and two chairs",
          "A table and four chairs",
          "A garden and a balcony",
        ],
        answer: "A big sofa and two chairs",
        explanation_vn:
          "'In the living room, there is a big sofa and two chairs.'",
      },
      {
        id: "u6r-q3",
        question_vn: "Căn hộ của Linh có vườn không?",
        options: [
          "Yes, there is a big garden",
          "Yes, there is a small garden",
          "No, but there is a balcony",
          "No, and there is no balcony either",
        ],
        answer: "No, but there is a balcony",
        explanation_vn:
          "'There is no garden, but I put flowers on the balcony.'",
      },
      {
        id: "u6r-q4",
        question_vn: "Đèn (lamp) ở đâu?",
        options: [
          "On the sofa",
          "In the bedroom",
          "On the table near the window",
          "On the balcony",
        ],
        answer: "On the table near the window",
        explanation_vn: "'There is also a lamp on the table near the window.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Kể về nhà mới khi chuyển công tác",
      focus:
        "There is / There are + rooms, sofa, balcony (mô tả chỗ ở gần văn phòng)",
      context:
        "Chia sẻ với đồng nghiệp mới hoặc HR về nhà ở khi nhận việc ở thành phố khác",
      l1Note:
        "⚠️ 'There is a big sofa' không 'There are a big sofa'. 'There are three rooms'.",
      example: "There are three rooms. There is a balcony where I put flowers.",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "nVl6E0NRSA0",
};
