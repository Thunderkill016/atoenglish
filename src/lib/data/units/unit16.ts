import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-16 — Travel & Directions  (A2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit16: UnitData = {
  unitId: "unit-16",
  title: "Unit 16: Travel & Directions",
  level: "A2",
  xp: 90,
  estimatedTime: 45,
  description:
    "Học cách hỏi và chỉ đường, mô tả địa điểm và đặt phòng khách sạn bằng tiếng Anh.",
  badgeName: "Người Dẫn Đường",
  badgeEmoji: "🗺️",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Đối tác người nước ngoài đến Hà Nội lần đầu tiên. Họ nhờ bạn chỉ đường đến văn phòng từ khách sạn và tư vấn phương tiện di chuyển.",
  learningOutcomes: [
    "Hỏi và chỉ đường bằng tiếng Anh rõ ràng",
    "Mô tả vị trí địa điểm bằng prepositions of place",
    "Đặt phòng và hỏi thông tin khách sạn",
  ],

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🗺️",
      en: "Excuse me, how do I get to the city center?",
      vn: "Xin lỗi, làm sao để đến trung tâm thành phố?",
      context: "Hỏi đường",
    },
    {
      emoji: "↗️",
      en: "Go straight and turn right at the traffic lights.",
      vn: "Đi thẳng và rẽ phải ở đèn giao thông.",
      context: "Chỉ đường",
    },
    {
      emoji: "🏨",
      en: "I'd like to book a room for two nights.",
      vn: "Tôi muốn đặt phòng hai đêm.",
      context: "Đặt phòng khách sạn",
    },
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Ở Việt Nam, grab và taxi là phương tiện di chuyển phổ biến nhất cho người nước ngoài. Khi chỉ đường, người Việt thường dùng <span class="text-primary font-semibold">landmark</span> (mốc nhà quen thuộc như cột điện, ngân hàng) thay vì tên đường. Hãy học cách kết hợp: tên đường + mốc nhà quen để chỉ đường hiệu quả.',

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "straight",
      emoji: "⬆️",
      phonetic: "/streɪt/",
      meaning: "thẳng",
      example: "Go straight for two blocks.",
      example2: "The road goes straight ahead.",
      collocation: "go straight / straight ahead",
      audio: "/audio/unit-16/straight.mp3",
      l1_interference_vn:
        "⚠️ 'Straight' = thẳng (hướng đi). 'Go straight' KHÔNG phải 'go straightly'. Đây là trạng từ, không thêm -ly.",
    },
    {
      id: 2,
      word: "turn",
      emoji: "↪️",
      phonetic: "/tɜːrn/",
      meaning: "rẽ / quay",
      example: "Turn left at the traffic lights.",
      example2: "Turn right at the corner.",
      collocation: "turn left / turn right / turn around",
      audio: "/audio/unit-16/turn.mp3",
      l1_interference_vn:
        "⚠️ 'Turn left/right' — KHÔNG 'turn to left'. Cụm cố định: turn left, turn right, không dùng 'to'.",
    },
    {
      id: 3,
      word: "corner",
      emoji: "🔄",
      phonetic: "/ˈkɔːrnər/",
      meaning: "góc đường",
      example: "The café is on the corner.",
      example2: "Turn left at the corner.",
      collocation: "on the corner / around the corner",
      audio: "/audio/unit-16/corner.mp3",
      l1_interference_vn:
        "⚠️ 'On the corner' (ở góc đường) — giới từ 'on'. Không phải 'at corner' hay 'in corner'.",
    },
    {
      id: 4,
      word: "block",
      emoji: "🏙️",
      phonetic: "/blɒk/",
      meaning: "dãy nhà / block",
      example: "Walk three blocks north.",
      example2: "The station is two blocks away.",
      collocation: "a few blocks / blocks away",
      audio: "/audio/unit-16/block.mp3",
      l1_interference_vn:
        "⚠️ 'Two blocks' = đi qua 2 ô đường (Mỹ). Khái niệm này không phổ biến ở Việt Nam.",
    },
    {
      id: 5,
      word: "traffic lights",
      emoji: "🚦",
      phonetic: "/ˈtræfɪk laɪts/",
      meaning: "đèn giao thông",
      example: "Turn left at the traffic lights.",
      example2: "Wait for the traffic lights to change.",
      collocation: "at the traffic lights / red/green light",
      audio: "/audio/unit-16/traffic_lights.mp3",
      l1_interference_vn:
        "⚠️ Luôn dùng số nhiều: 'the traffic lights' (đèn giao thông). 'At the traffic lights' — giới từ 'at'.",
    },
    {
      id: 6,
      word: "opposite",
      emoji: "⇔",
      phonetic: "/ˈɒpəzɪt/",
      meaning: "đối diện",
      example: "The bank is opposite the post office.",
      example2: "I sit opposite my manager.",
      collocation: "opposite to / directly opposite",
      audio: "/audio/unit-16/opposite.mp3",
      l1_interference_vn:
        "⚠️ 'Opposite the bank' (đối diện) — KHÔNG 'opposite to the bank' hay 'opposite of the bank'.",
    },
    {
      id: 7,
      word: "nearby",
      emoji: "📍",
      phonetic: "/ˌnɪərˈbaɪ/",
      meaning: "gần đây",
      example: "Is there a pharmacy nearby?",
      example2: "We found a nearby restaurant.",
      collocation: "nearby shops / close by",
      audio: "/audio/unit-16/nearby.mp3",
      l1_interference_vn:
        "⚠️ Viết liền 'nearby' (1 từ) — không phải 'near by'. 'Is there a café nearby?'",
    },
    {
      id: 8,
      word: "book",
      emoji: "📅",
      phonetic: "/bʊk/",
      meaning: "đặt trước",
      example: "I'd like to book a room.",
      example2: "Can I book a table for dinner?",
      collocation: "book a room / book in advance",
      audio: "/audio/unit-16/book.mp3",
      l1_interference_vn:
        "⚠️ 'Book' (v) = đặt trước. 'Book a room/table/flight'. Không nhầm với 'book' (n) = cuốn sách.",
    },
    {
      id: 9,
      word: "available",
      emoji: "✅",
      phonetic: "/əˈveɪləbəl/",
      meaning: "còn trống / có sẵn",
      example: "Is a double room available?",
      example2: "Are you available on Monday?",
      collocation: "available now / still available",
      audio: "/audio/unit-16/available.mp3",
      l1_interference_vn:
        "⚠️ 'Available' = còn trống/sẵn sàng. 'Is the room available?' KHÔNG 'Is the room free?' trong ngữ cảnh khách sạn.",
    },
    {
      id: 10,
      word: "check in",
      emoji: "🏨",
      phonetic: "/tʃek ɪn/",
      meaning: "làm thủ tục nhận phòng",
      example: "Check-in is at 2 PM.",
      example2: "We checked in at the hotel.",
      collocation: "check in / check out",
      audio: "/audio/unit-16/check_in.mp3",
      l1_interference_vn:
        "⚠️ 'Check in' (v, 2 từ riêng) vs 'check-in' (n/adj, có gạch). 'Check in at 2PM' vs 'check-in time is 2PM'.",
    },
    {
      id: 11,
      word: "distance",
      emoji: "📏",
      phonetic: "/ˈdɪstəns/",
      meaning: "khoảng cách",
      example: "It's a 10-minute walk from here.",
      example2: "What's the distance to the airport?",
      collocation: "walking distance / within distance",
      audio: "/audio/unit-16/distance.mp3",
      l1_interference_vn:
        "⚠️ Hỏi khoảng cách: 'How far is it?' không phải 'How distance is it?'",
    },
    {
      id: 12,
      word: "landmark",
      emoji: "🗼",
      phonetic: "/ˈlændmɑːrk/",
      meaning: "địa danh / mốc nhà",
      example: "Use Hoan Kiem Lake as a landmark.",
      example2: "The clock tower is a famous landmark.",
      collocation: "well-known landmark / use as a landmark",
      audio: "/audio/unit-16/landmark.mp3",
      l1_interference_vn:
        "⚠️ Stress: LAND-mark. Dùng chỉ đường: 'Turn left at the landmark'.",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Chỉ đường đến văn phòng",
      audio: "/audio/unit-16/dialogue_1.mp3",
      desc: "Tom hỏi Minh cách đến văn phòng từ khách sạn.",
      lines: [
        {
          id: "d1-1",
          speaker: "Tom",
          text: "Minh, how do I get from my hotel to the office?",
          translation: "Minh, làm sao để từ khách sạn tôi đến văn phòng?",
        },
        {
          id: "d1-2",
          speaker: "Minh",
          text: "It's easy! Go straight along Ly Thuong Kiet Street for two blocks.",
          translation:
            "Dễ lắm! Đi thẳng dọc theo phố Lý Thường Kiệt khoảng hai dãy nhà.",
        },
        {
          id: "d1-3",
          speaker: "Tom",
          text: "And then?",
          translation: "Và rồi?",
        },
        {
          id: "d1-4",
          speaker: "Minh",
          text: "Turn right at the traffic lights. Our office is on the corner, opposite the Vietcombank.",
          translation:
            "Rẽ phải ở đèn giao thông. Văn phòng của chúng ta ở góc đường, đối diện với Vietcombank.",
        },
        {
          id: "d1-5",
          speaker: "Tom",
          text: "How far is it? Can I walk?",
          translation: "Xa không? Tôi có thể đi bộ không?",
        },
        {
          id: "d1-6",
          speaker: "Minh",
          text: "Yes! It's only about 10 minutes on foot. Use the bank as a landmark — you can't miss it!",
          translation:
            "Được chứ! Chỉ khoảng 10 phút đi bộ thôi. Dùng ngân hàng làm mốc — bạn không thể lạc đường đâu!",
        },
      ],
    },
    {
      id: 2,
      title: "Đặt phòng khách sạn",
      audio: "/audio/unit-16/dialogue_2.mp3",
      desc: "Sarah gọi điện đặt phòng cho đối tác.",
      lines: [
        {
          id: "d2-1",
          speaker: "Receptionist",
          text: "Good morning! Lake View Hotel, how can I help you?",
          translation:
            "Chào buổi sáng! Khách sạn Lake View, tôi có thể giúp gì cho bạn?",
        },
        {
          id: "d2-2",
          speaker: "Sarah",
          text: "Hi, I'd like to book a room for two nights — the 25th and 26th of this month.",
          translation:
            "Xin chào, tôi muốn đặt phòng hai đêm — ngày 25 và 26 tháng này.",
        },
        {
          id: "d2-3",
          speaker: "Receptionist",
          text: "Of course! Do you prefer a single or double room?",
          translation: "Được chứ! Bạn muốn phòng đơn hay phòng đôi?",
        },
        {
          id: "d2-4",
          speaker: "Sarah",
          text: "A double room, please. Is breakfast available?",
          translation: "Phòng đôi ạ. Có bao gồm bữa sáng không?",
        },
        {
          id: "d2-5",
          speaker: "Receptionist",
          text: "Yes, breakfast is included. Check-in is at 2 PM. Is there anything nearby you need — a pharmacy or ATM?",
          translation:
            "Có, bao gồm bữa sáng. Nhận phòng lúc 2 giờ chiều. Gần đây có cần gì không — nhà thuốc hay máy ATM?",
        },
        {
          id: "d2-6",
          speaker: "Sarah",
          text: "Great, thank you! We'll take it. Can you confirm the booking by email?",
          translation:
            "Tuyệt, cảm ơn! Chúng tôi nhận phòng đó. Bạn có thể xác nhận đặt phòng qua email không?",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "Turn right at the traffic lights",
      options: [
        "Turn right at the traffic lights",
        "Turn left at the traffic lights",
        "Go right at the traffic lights",
        "Turn right in the traffic lights",
      ],
      answer: "Turn right at the traffic lights",
    },
    {
      id: "lac2",
      audio_text: "The office is opposite the bank",
      options: [
        "The office is opposite the bank",
        "The office is opposite to bank",
        "The office is in front of the bank",
        "The office is near the bank",
      ],
      answer: "The office is opposite the bank",
    },
    {
      id: "lac3",
      audio_text: "I'd like to book a double room for two nights",
      options: [
        "I like to book a double room for two nights",
        "I'd like to book a double room for two nights",
        "I'd like to book double room for two nights",
        "I like book a double room for two nights",
      ],
      answer: "I'd like to book a double room for two nights",
    },
    {
      id: "lac4",
      audio_text: "It's only ten minutes on foot",
      options: [
        "It's only ten minutes on foot",
        "It's only ten minutes by foot",
        "It's only ten minute on foot",
        "It's ten minutes only on foot",
      ],
      answer: "It's only ten minutes on foot",
    },
    {
      id: "lac5",
      audio_text: "Go straight for two blocks",
      options: [
        "Go straight for two blocks",
        "Go straight two blocks",
        "Goes straight for two blocks",
        "Go straight along two blocks",
      ],
      answer: "Go straight for two blocks",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "To get to {input}, go straight and turn {input}.",
    level1Placeholder: "Ví dụ: the office, the café — right/left...",
    level2Situation:
      "Đối tác nước ngoài nhờ bạn chỉ đường từ khách sạn Hilton Hanoi đến văn phòng của bạn. Mô tả đường đi rõ ràng bằng tiếng Anh, bao gồm: phương tiện di chuyển, số phút đi bộ, các mốc nhà quan trọng.",
    level2Hint:
      "From the Hilton Hotel, [go straight / take a taxi / walk] along [street name]. At [landmark], turn [left/right]. Our office is [opposite/next to/near] [landmark]. It takes about [time] by [transport].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Ôn lại giới từ chỉ nơi chốn & Chỉ đường",
    rule: "Ôn (đã học Unit 9): opposite, next to, near, in front of, behind, between\nMới: go straight / turn left|right / take the first/second left",
    examples: [
      {
        en: "The café is next to the bank.",
        vn: "Quán cà phê ở cạnh ngân hàng.",
      },
      {
        en: "Turn right at the traffic lights.",
        vn: "Rẽ phải ở đèn giao thông.",
      },
      { en: "It's opposite the post office.", vn: "Nó đối diện với bưu điện." },
      {
        en: "Go straight for two blocks, then turn left.",
        vn: "Đi thẳng khoảng hai dãy nhà, sau đó rẽ trái.",
      },
    ],
    tip: "Khi chỉ đường, hãy chia thành các bước nhỏ rõ ràng. Luôn dùng mốc nhà (landmark) để người nghe dễ xác định. Ví dụ: 'Turn left at the red building' thay vì chỉ nói 'Turn left'.",
    vnNote:
      "⚠️ Lưu ý: Prepositions chỉ hướng và vị trí (to/from/at/in/on/by) thường không tương đương 1-1 với tiếng Việt. 'Đi đến' → 'go to' (không phải 'go at'). 'Ở ngã tư' → 'at the intersection' (dùng 'at' cho điểm cụ thể).",
    dialogueExample: {
      speaker: "Minh",
      text: "Turn right at the traffic lights. Our office is on the corner, opposite the Vietcombank.",
      translation:
        "Rẽ phải ở đèn giao thông. Văn phòng chúng ta ở góc đường, đối diện với Vietcombank.",
      highlight: "turn right / on the corner / opposite",
    },
    ccq: {
      question:
        "Giới từ nào ĐÚNG trong câu: 'The bank is ___ the post office.'?",
      options: ["in front to", "opposite ✅", "in facing of", "across to"],
      answer: "opposite ✅",
      explanation:
        "'Opposite' = ở phía đối diện. 'In front of' = ở trước mặt (không nhất thiết phải đối mặt nhau). Khi hai địa điểm đối mặt nhau qua đường, dùng 'opposite'.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question: "Chọn đúng: 'The pharmacy is ___ the coffee shop.'",
      options: ["opposite to", "opposite", "in front to", "facing to"],
      answer: "opposite",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question: "Điền đúng: 'Go ___ for three blocks, then turn left.'",
      options: ["straight", "forward", "ahead on", "direct"],
      answer: "straight",
    },
    {
      id: "pq3",
      type: "cloze",
      question: "Điền: 'I'd like to ___ a room for tonight.'",
      answer: "book",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "Câu hỏi đặt phòng đúng nhất:",
      options: [
        "Is a room available?",
        "Have room available?",
        "Room available is?",
        "Do you available room?",
      ],
      answer: "Is a room available?",
    },
    {
      id: "pq5",
      type: "cloze",
      question: "Điền: 'Turn ___ at the traffic lights, then go straight.'",
      answer: "right",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "straight", right: "thẳng" },
      { left: "corner", right: "góc đường" },
      { left: "opposite", right: "đối diện" },
      { left: "available", right: "còn trống" },
      { left: "landmark", right: "địa danh" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Văn phòng chúng tôi ở góc đường, đối diện với ngân hàng.",
      answer: "Our office is on the corner, opposite the bank.",
    },
    {
      id: "pt-2",
      prompt_vn: "Đi thẳng hai khối rồi rẽ trái ở đèn giao thông.",
      answer:
        "Go straight for two blocks then turn left at the traffic lights.",
    },
    {
      id: "pt-3",
      prompt_vn: "Nhà ga nằm đối diện với công viên.",
      answer: "The station is opposite the park.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc16-1",
      sentence: "I travel to work by the bus every day.",
      errorWord: "by the bus",
      correction: "by bus",
      explanation_vn:
        "Phương tiện giao thông: 'by bus/car/train/taxi' — không dùng 'the' sau 'by'.",
    },
    {
      id: "sc16-2",
      sentence: "The plane arrives to the airport at noon.",
      errorWord: "arrives to",
      correction: "arrives at",
      explanation_vn:
        "'Arrive AT' một địa điểm cụ thể. 'Arrive IN' thành phố/quốc gia. Không dùng 'arrive to'.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la16-1",
      audio_text: "I travel to work by bus every morning.",
      prompt_vn: "Tôi đi làm bằng xe buýt mỗi sáng.",
      words: [
        "I",
        "travel",
        "to",
        "work",
        "by",
        "bus",
        "every",
        "morning",
        ".",
        "the",
        "car",
      ],
      answer: "I travel to work by bus every morning .",
    },
    {
      id: "la16-2",
      audio_text: "The hotel is next to the train station.",
      prompt_vn: "Khách sạn kế bên ga tàu.",
      words: [
        "The",
        "hotel",
        "is",
        "next",
        "to",
        "the",
        "train",
        "station",
        ".",
        "near",
        "opposite",
      ],
      answer: "The hotel is next to the train station .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Đi thẳng hai dãy nhà rồi rẽ trái.",
      words: [
        "Go",
        "straight",
        "for",
        "two",
        "blocks",
        "then",
        "turn",
        "left",
        ".",
        "have",
        "has",
      ],
      answer: "Go straight for two blocks then turn left .",
    },
    {
      id: "wb2",
      prompt_vn: "Ngân hàng ở đối diện bưu điện.",
      words: [
        "The",
        "bank",
        "is",
        "opposite",
        "the",
        "post",
        "office",
        ".",
        "have",
        "has",
      ],
      answer: "The bank is opposite the post office .",
    },
    {
      id: "wb3",
      prompt_vn: "Tôi muốn đặt một phòng đơn.",
      words: [
        "I",
        "would",
        "like",
        "to",
        "book",
        "a",
        "single",
        "room",
        ".",
        "have",
        "has",
      ],
      answer: "I would like to book a single room .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s16-1",
      prompt_vn: "Đi thẳng hai dãy nhà rồi rẽ trái.",
      words: [
        "Go",
        "straight",
        "for",
        "two",
        "blocks",
        "then",
        "turn",
        "left",
        ".",
      ],
      answer: "Go straight for two blocks then turn left .",
    },
    {
      id: "s16-2",
      prompt_vn: "Ngân hàng ở đối diện bưu điện.",
      words: ["The", "bank", "is", "opposite", "the", "post", "office", "."],
      answer: "The bank is opposite the post office .",
    },
    {
      id: "s16-3",
      prompt_vn: "Tôi muốn đặt một phòng đơn.",
      words: ["I", "would", "like", "to", "book", "a", "single", "room", "."],
      answer: "I would like to book a single room .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question:
        "Dịch: 'Văn phòng chúng tôi ở góc đường, đối diện với ngân hàng.'",
      options: [
        "Our office is at the corner, opposite bank.",
        "Our office is on the corner, opposite the bank.",
        "Our office is in the corner, opposite a bank.",
        "Our office at corner opposite the bank.",
      ],
      answer: "Our office is on the corner, opposite the bank.",
      explanation_vn:
        "'On the corner' (góc đường, ngoài trời). 'In the corner' = trong góc phòng. 'Opposite the bank' = đối diện ngân hàng (cần 'the').",
    },
    {
      id: "fq2",
      type: "cloze",
      question:
        "Điền: 'The hotel is ___ the train station — just across the road.'",
      answer: "opposite",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question: "Câu đặt phòng lịch sự nhất:",
      options: [
        "Give me a room for two nights.",
        "I want room two nights.",
        "I'd like to book a room for two nights, please.",
        "Can booking room for two nights?",
      ],
      answer: "I'd like to book a room for two nights, please.",
      explanation_vn:
        "'I'd like to + infinitive' = muốn làm gì (lịch sự). 'Give me' nghe thô. 'Can booking' không đúng ngữ pháp — phải 'Can I book'.",
    },
    {
      id: "fq4",
      type: "translate",
      question:
        "Dịch sang tiếng Anh: 'Rẽ trái ở đèn giao thông, rồi đi thẳng hai dãy nhà.'",
      answer:
        "Turn left at the traffic lights, then go straight for two blocks.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question: "Thời gian nhận phòng tiêu chuẩn bằng tiếng Anh là gì?",
      options: [
        "Check-in time is 2 PM.",
        "Checking-in time is 2 PM.",
        "Check time is 2 PM.",
        "In-check time is 2 PM.",
      ],
      answer: "Check-in time is 2 PM.",
      explanation_vn:
        "'Check-in' (gạch ngang) là danh từ ghép cố định trong khách sạn. KHÔNG dùng 'checking-in time' hay 'check time'.",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "'Luggage' là loại danh từ gì?",
      options: ["Countable", "Uncountable", "Cả hai", "Proper noun"],
      answer: "Uncountable",
      explanation_vn:
        "'Luggage' là danh từ không đếm được — KHÔNG nói 'a luggage' hay 'luggages'. Tương tự: 'information', 'furniture', 'advice'.",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "Cách nói đúng khi đặt phòng:",
      options: [
        "I want make a reservation.",
        "I'd like to make a reservation.",
        "I like to reserve.",
        "Can I doing a reservation?",
      ],
      answer: "I'd like to make a reservation.",
      explanation_vn:
        "'Make a reservation' là collocation đúng. 'I'd like to' lịch sự hơn 'I want to'. KHÔNG 'do a reservation'.",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền: 'The flight is ___ by 2 hours.' (hoãn)",
      answer: "delayed",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "'Go through customs' nghĩa là:",
      options: [
        "Mua đồ lưu niệm",
        "Qua cửa hải quan",
        "Lên máy bay",
        "Nhận hành lý",
      ],
      answer: "Qua cửa hải quan",
      explanation_vn:
        "'Go through customs' = qua cửa hải quan kiểm tra hành lý/giấy tờ. 'Go through security' = qua cổng an ninh. Cụm từ cố định.",
    },
    {
      id: "q-ex5",
      type: "multiple-choice",
      question: "'On arrival' nghĩa là:",
      options: [
        "Khi khởi hành",
        "Khi đến nơi",
        "Trong chuyến đi",
        "Trước khi đặt vé",
      ],
      answer: "Khi đến nơi",
      explanation_vn:
        "'On + noun' = ngay khi. 'On arrival' = khi đến nơi. 'On departure' = khi khởi hành. Dùng trong ngữ cảnh sân bay/khách sạn.",
    },
    {
      id: "q-ex6",
      type: "multiple-choice",
      question: "'Stay ___ a hotel' — giới từ đúng:",
      options: ["in", "at", "on", "with"],
      answer: "at",
      explanation_vn:
        "'Stay at + nơi lưu trú' (hotel, hostel, Airbnb). 'Stay in + thành phố/quốc gia' (stay in London). Đây là giới từ cố định.",
    },
    {
      id: "q-ex7",
      type: "translate",
      question: "Dịch: 'Cho tôi xem hộ chiếu của bạn.'",
      answer: "May I see your passport, please?",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr16-1",
      question: "Câu nào đúng? (Unit 15: Comparatives)",
      options: [
        "This route is more shorter.",
        "This route is shorter.",
        "This route is most short.",
        "This route is more short.",
      ],
      answer: "This route is shorter.",
      type: "multiple-choice",
    },
    {
      id: "cr16-2",
      question:
        "Điền từ: 'She ___ going to take the subway tomorrow.' (Unit 14: Going to)",
      options: [],
      answer: "is",
      type: "cloze",
    },
    {
      id: "cr16-3",
      question: "Khách sạn đó đắt hơn cái này. (Unit 15)",
      options: [],
      answer: "That hotel is more expensive than this one.",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "travel word stress",
    description: "Stress và âm trong từ du lịch: passport, departure, arrival",
    examples: [
      {
        word: "passport",
        ipa: "/ˈpɑːspɔːrt/",
        tip: "Stress âm 1: PASS-port. Âm /pɑː/ dài — không phải /pæs/ ngắn",
      },
      {
        word: "departure",
        ipa: "/dɪˈpɑːrtʃər/",
        tip: "Stress âm 2: de-PAR-ture. -ture đọc /tʃər/ không phải /ture/",
      },
    ],
    minimalPairs: [
      ["PASS-port", "pass-PORT (sai)"],
      ["de-PAR-ture", "DE-par-ture (sai)"],
    ],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "Turn left", vn: "Rẽ trái" },
      { en: "Turn right", vn: "Rẽ phải" },
      { en: "Go straight", vn: "Đi thẳng" },
      { en: "At the corner", vn: "Ở góc đường" },
      { en: "Next to the hotel", vn: "Cạnh khách sạn" },
      { en: "Across from the bank", vn: "Đối diện ngân hàng" },
      { en: "Take the first exit", vn: "Ra lối thoát đầu tiên" },
      { en: "It's on the second floor", vn: "Nó ở tầng hai" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit16-reading-1",
    title: "Finding the Hotel",
    title_vn: "Tìm Đường Đến Khách Sạn",
    level: "A2" as const,
    text: `Tom arrives in Hanoi for the first time. He needs to find his hotel from the airport. A friendly local helps him. She says, "Go straight along this road for three blocks. At the traffic lights, turn left. You will see a large landmark — the central post office. The hotel is on the corner, opposite the post office. It is only about fifteen minutes on foot." Tom books a double room and checks in at 2 PM. The receptionist tells him there is a pharmacy nearby and an ATM available at the corner. The hotel is in a great location, close to many restaurants and shopping streets. Tom is very happy with the distance from all the main attractions.`,
    questions: [
      {
        id: "unit16-q1",
        question_vn: "Tom phải rẽ đâu khi đến đèn giao thông?",
        options: [
          "He should turn right.",
          "He should go straight.",
          "He should turn left.",
          "He should turn around.",
        ],
        answer: "He should turn left.",
        explanation_vn:
          "'At the traffic lights, turn left' — rẽ trái tại đèn giao thông.",
      },
      {
        id: "unit16-q2",
        question_vn: "Khách sạn ở đâu so với bưu điện?",
        options: [
          "It is behind the post office.",
          "It is opposite the post office.",
          "It is next to the post office.",
          "It is nearby the traffic lights.",
        ],
        answer: "It is opposite the post office.",
        explanation_vn:
          "'The hotel is on the corner, opposite the post office' — đối diện với bưu điện.",
      },
      {
        id: "unit16-q3",
        question_vn: "Tom đặt loại phòng gì và nhận phòng lúc mấy giờ?",
        options: [
          "A single room at 12 PM.",
          "A double room at 2 PM.",
          "A double room at 3 PM.",
          "A single room at 2 PM.",
        ],
        answer: "A double room at 2 PM.",
        explanation_vn:
          "'Tom books a double room and checks in at 2 PM' — phòng đôi, nhận phòng lúc 2 giờ chiều.",
      },
      {
        id: "unit16-q4",
        question_vn: "Tiện ích gì có sẵn gần khách sạn?",
        options: [
          "A supermarket and a gym.",
          "A pharmacy and an ATM.",
          "A swimming pool and a restaurant.",
          "A cinema and a park.",
        ],
        answer: "A pharmacy and an ATM.",
        explanation_vn:
          "'there is a pharmacy nearby and an ATM available at the corner' — nhà thuốc gần đó và máy ATM ở góc đường.",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Đặt phòng khách sạn cho chuyến công tác",
      focus:
        "Directions + booking: opposite, check in, double room, nearby facilities",
      context:
        "Gọi điện hoặc chat với khách sạn khi sắp đi công tác cùng khách hàng",
      l1Note:
        "⚠️ 'The hotel is opposite the post office'. 'I book a double room and check in at 2 PM'.",
      example:
        "The hotel is on the corner, opposite the post office. I need a double room at 2 PM.",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "mA-MK2bJA4I",
};

export default unit16;
