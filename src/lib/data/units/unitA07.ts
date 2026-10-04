import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-7 — Thời Gian, Ngày & Tháng  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-7 — Thời Gian, Ngày & Tháng (Time, Days & Months)
// Grammar: Prepositions of time — AT / ON / IN
// L1 Alert: Vietnamese uses same word "vào" for all; English splits into 3!
// CELTA: Dialogue first — scheduling a meeting forces real use of time prepositions
// Lewis: "at 9 o'clock", "on Monday", "in the morning" as fixed chunks

export const unitA07: UnitData = {
  unitId: "unit-a0-7",
  title: "Unit A0-7: Thời Gian, Ngày & Tháng",
  level: "A0",
  xp: 60,
  estimatedTime: 40,
  description:
    "Học cách nói về thời gian, ngày trong tuần và đặt lịch — kỹ năng thiết yếu trong môi trường làm việc quốc tế.",
  badgeName: "Người Đúng Giờ",
  badgeEmoji: "⏰",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn cần đặt lịch họp với đối tác nước ngoài qua email hoặc điện thoại. Họ hỏi: 'When are you free?' Bạn cần trả lời bằng tiếng Anh!",

  learningOutcomes: [
    "Nói được 7 ngày trong tuần và thời điểm trong ngày",
    "Dùng đúng AT/ON/IN trước thời gian",
    "Đặt và xác nhận lịch hẹn đơn giản",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Người Anh-Mỹ rất coi trọng đúng giờ. <span class="text-primary font-semibold">"Let\'s meet at 9 sharp"</span> có nghĩa là 9 giờ đúng, không được đến trễ! Khi muốn thay đổi lịch, luôn báo trước và xin lỗi: <span class="text-primary font-semibold">"I\'m sorry, can we reschedule?"</span>',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "📅",
      en: "Let's meet on Monday at 9 o'clock.",
      vn: "Hãy gặp nhau vào thứ Hai lúc 9 giờ.",
      context: "Đặt lịch họp",
    },
    {
      emoji: "❓",
      en: "When are you free this week?",
      vn: "Tuần này bạn rảnh khi nào?",
      context: "Hỏi lịch trống",
    },
    {
      emoji: "✅",
      en: "I'm free in the morning on Tuesday.",
      vn: "Tôi rảnh buổi sáng thứ Ba.",
      context: "Trả lời lịch rảnh",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "Monday",
      emoji: "📅",
      phonetic: "/ˈmʌndeɪ/",
      meaning: "thứ Hai",
      example: "Let's meet on Monday.",
      example2: "The meeting is on Monday morning.",
      collocation: "on Monday / Monday morning / every Monday / next Monday",
      audio: "/audio/unit-a0-7/monday.mp3",
      l1_interference_vn:
        "⚠️ Thứ trong tiếng Anh LUÔN viết hoa: Monday, Tuesday... KHÔNG 'monday'. 'On Monday' (dùng 'on' với thứ).",
    },
    {
      id: 2,
      word: "week",
      emoji: "📆",
      phonetic: "/wiːk/",
      meaning: "tuần",
      example: "I am busy this week.",
      example2: "Next week is better for me.",
      collocation: "this week / next week / last week / every week",
      audio: "/audio/unit-a0-7/week.mp3",
    },
    {
      id: 3,
      word: "today",
      l1_interference_vn:
        "⚠️ \'Today\' /təˈdeɪ/ — nhấn âm cuối: \'to-DAY\'. Âm đầu /tə/ là schwa nhẹ, không nhấn.",
      emoji: "🔴",
      phonetic: "/təˈdeɪ/",
      meaning: "hôm nay",
      example: "Are you free today?",
      example2: "Today is Monday.",
      collocation: "later today / today is / not today / today or tomorrow",
      audio: "/audio/unit-a0-7/today.mp3",
    },
    {
      id: 4,
      word: "tomorrow",
      l1_interference_vn:
        "⚠️ \'Tomorrow\' /təˈmɒrəʊ/ — nhấn âm giữa: \'to-MOR-row\'. 3 âm tiết. Không phát đủ \'t-o-m-o-r-r-o-w\'.",
      emoji: "🟡",
      phonetic: "/təˈmɒroʊ/",
      meaning: "ngày mai",
      example: "Can we meet tomorrow?",
      example2: "Tomorrow is Tuesday.",
      collocation: "tomorrow morning / see you tomorrow / tomorrow afternoon",
      audio: "/audio/unit-a0-7/tomorrow.mp3",
    },
    {
      id: 5,
      word: "morning",
      l1_interference_vn:
        "⚠️ \'Morning\' /ˈmɔːnɪŋ/ — \'-ing\' kết thúc bằng /ŋ/, KHÔNG phải /ŋg/. Nhấn MOR-ning.",
      emoji: "🌅",
      phonetic: "/ˈmɔːrnɪŋ/",
      meaning: "buổi sáng",
      example: "I'm free in the morning.",
      example2: "Let's meet tomorrow morning.",
      collocation:
        "in the morning / tomorrow morning / Monday morning / good morning",
      audio: "/audio/unit-a0-7/morning.mp3",
    },
    {
      id: 6,
      word: "o'clock",
      emoji: "🕙",
      phonetic: "/əˈklɒk/",
      meaning: "giờ đúng",
      example: "The meeting is at ten o'clock.",
      example2: "Can you come at nine o'clock?",
      collocation: "at nine o'clock / at ten o'clock / sharp at eight o'clock",
      audio: "/audio/unit-a0-7/oclock.mp3",
      l1_interference_vn:
        "⚠️ 'O'clock' chỉ dùng cho giờ đúng: '3 o'clock'. KHÔNG '3:30 o'clock'. 'Half past three' hoặc '3:30' cho giờ rưỡi.",
    },
    {
      id: 7,
      word: "busy",
      emoji: "📋",
      phonetic: "/ˈbɪzi/",
      meaning: "bận",
      example: "I'm busy on Monday.",
      example2: "Are you busy this week?",
      collocation: "too busy / very busy / busy day / busy schedule",
      audio: "/audio/unit-a0-7/busy.mp3",
      l1_interference_vn:
        "⚠️ 'Too busy TO do something': 'I'm too busy to meet'. KHÔNG 'too busy for do'. Sau 'too busy' dùng 'to + infinitive'.",
    },
    {
      id: 8,
      word: "free",
      emoji: "😌",
      phonetic: "/friː/",
      meaning: "rảnh (thời gian)",
      example: "Are you free on Tuesday?",
      example2: "I'm free in the afternoon.",
      collocation: "are you free / feel free / free time / free afternoon",
      audio: "/audio/unit-a0-7/free.mp3",
      l1_interference_vn:
        "⚠️ 'Free' = rảnh (thời gian) HOẶC miễn phí (tiền). 'Are you free tomorrow?' vs 'It's free of charge'. Ngữ cảnh quyết định.",
    },
    {
      id: 9,
      word: "schedule",
      emoji: "🗓️",
      phonetic: "/ˈskedʒuːl/",
      meaning: "lịch trình",
      example: "Let me check my schedule.",
      example2: "What's on your schedule today?",
      collocation:
        "my schedule / check the schedule / busy schedule / schedule a meeting",
      audio: "/audio/unit-a0-7/schedule.mp3",
      l1_interference_vn:
        "⚠️ Phát âm: /ˈskedʒuːl/ (Anh-Mỹ) vs /ˈʃedjuːl/ (Anh-Anh). 'Check your schedule' = xem lịch. 'Schedule a meeting' = sắp xếp.",
    },
    {
      id: 10,
      word: "meeting",
      emoji: "🤝",
      phonetic: "/ˈmiːtɪŋ/",
      meaning: "cuộc họp",
      example: "The meeting is on Monday at nine.",
      example2: "Can we schedule a meeting?",
      collocation:
        "have a meeting / schedule a meeting / team meeting / meeting room",
      audio: "/audio/unit-a0-7/meeting.mp3",
      l1_interference_vn:
        "⚠️ 'Have/attend a meeting'. KHÔNG 'do' hay 'make a meeting'. 'The meeting is at 2PM' — giới từ 'at' với giờ.",
    },
  ],

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Giới từ thời gian: AT / ON / IN",
    rule: "AT = giờ cụ thể | ON = ngày cụ thể | IN = thời đoạn dài hơn (tháng, năm, buổi)",

    conjugation: [
      {
        subject: "AT",
        form: "giờ đồng hồ",
        example: "at 9 o'clock / at noon / at midnight",
      },
      {
        subject: "ON",
        form: "ngày trong tuần",
        example: "on Monday / on Tuesday / on my birthday",
      },
      {
        subject: "IN",
        form: "buổi / tháng / năm",
        example: "in the morning / in January / in 2025",
      },
    ],

    examples: [
      { en: "The meeting is AT 9 o'clock.", vn: "Cuộc họp lúc 9 giờ." },
      { en: "Let's meet ON Monday.", vn: "Hãy gặp nhau vào thứ Hai." },
      { en: "I'm free IN the morning.", vn: "Tôi rảnh vào buổi sáng." },
      { en: "She was born IN January.", vn: "Cô ấy sinh vào tháng Giêng." },
    ],

    tip: "Mẹo nhớ: AT (điểm nhỏ như mũi kim) → giờ cụ thể. ON (mặt phẳng) → ngày. IN (bên trong hộp lớn) → tháng/năm/buổi.",

    vnNote:
      "⚠️ LỖI SỐ 1 của người Việt — Dùng 'in' cho tất cả:\n\n" +
      "Tiếng Việt: 'vào' dùng cho MỌI thứ!\n" +
      "  → 'vào 9 giờ' / 'vào thứ Hai' / 'vào buổi sáng'\n\n" +
      "Tiếng Anh: Phải chọn đúng:\n" +
      "❌ SAI: 'in 9 o'clock' / 'in Monday'\n" +
      "✅ ĐÚNG:\n" +
      "  AT 9 o'clock (giờ)\n" +
      "  ON Monday (ngày)\n" +
      "  IN the morning (buổi)\n" +
      "  IN January (tháng)\n\n" +
      "Ngoại lệ: 'at night' (không phải 'in the night')",

    dialogueExample: {
      speaker: "Minh",
      text: "I'm free ON Monday IN the morning — AT 9 o'clock works for me.",
      translation: "Tôi rảnh vào thứ Hai buổi sáng — lúc 9 giờ được với tôi.",
      highlight: "ON, IN, AT",
    },

    ccq: {
      question: "Điền giới từ đúng: 'The meeting is ___ Monday ___ 9 o'clock.'",
      options: [
        "in Monday at 9 o'clock",
        "on Monday in 9 o'clock",
        "on Monday at 9 o'clock",
        "at Monday on 9 o'clock",
      ],
      answer: "on Monday at 9 o'clock",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối thời gian với giới từ đúng",
    pairs: [
      { left: "9 o'clock", right: "at" },
      { left: "Monday", right: "on" },
      { left: "the morning", right: "in" },
      { left: "January", right: "in" },
      { left: "my birthday", right: "on" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq7-1",
      question: "Điền giới từ đúng: 'The meeting is ___ 9 o'clock.'",
      options: ["in", "on", "at", "for"],
      answer: "at",
      type: "multiple-choice",
    },
    {
      id: "pq7-2",
      question: "Điền từ: 'Let's meet ___ Monday.' (thứ Hai)",
      options: [],
      answer: "on",
      type: "cloze",
    },
    {
      id: "pq7-3",
      question: "Câu nào ĐÚNG?",
      options: [
        "I'm free in Monday.",
        "I'm free on Monday.",
        "I'm free at Monday.",
        "I'm free for Monday.",
      ],
      answer: "I'm free on Monday.",
      type: "multiple-choice",
    },
    {
      id: "pq7-4",
      question: "Điền từ: 'I'm free ___ the morning.' (buổi sáng)",
      options: [],
      answer: "in",
      type: "cloze",
    },
  ],

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt7-1",
      prompt_vn: "Cuộc họp là vào thứ Hai lúc 9 giờ.",
      answer: "The meeting is on Monday at 9 o'clock.",
    },
    {
      id: "pt7-2",
      prompt_vn: "Tuần này tôi bận. Tuần tới tốt hơn.",
      answer: "I'm busy this week. Next week is better.",
    },
    {
      id: "pt7-3",
      prompt_vn: "Bạn rảnh vào buổi sáng thứ Ba không?",
      answer: "Are you free on Tuesday morning?",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A07-1",
      sentence: "The meeting is in Monday in nine o'clock.",
      errorWord: "in Monday in nine",
      correction: "on Monday at nine",
      explanation_vn:
        "Giới từ thời gian: ON + ngày, AT + giờ. 'IN' dùng cho tháng/năm/mùa. 'ON Monday AT nine'.",
    },
    {
      id: "sc-A07-2",
      sentence: "Today is Monday, march five.",
      errorWord: "march five",
      correction: "March fifth",
      explanation_vn:
        "Tên tháng viết hoa: 'MARCH'. Ngày dùng ordinal number: 'fifth' (không phải 'five').",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA07-1",
      audio_text: "The meeting is on Monday at nine o clock.",
      prompt_vn: "Cuộc họp vào thứ Hai lúc chín giờ.",
      words: [
        "The",
        "meeting",
        "is",
        "on",
        "Monday",
        "at",
        "nine",
        "o",
        "clock",
        ".",
        "in",
        "at Monday",
      ],
      answer: "The meeting is on Monday at nine o clock .",
    },
    {
      id: "laA07-2",
      audio_text: "Today is Tuesday the third of June.",
      prompt_vn: "Hôm nay là thứ Ba ngày ba tháng Sáu.",
      words: [
        "Today",
        "is",
        "Tuesday",
        "the",
        "third",
        "of",
        "June",
        ".",
        "third June",
        "on Tuesday",
      ],
      answer: "Today is Tuesday the third of June .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Cuộc họp là vào thứ Hai lúc chín giờ.",
      words: [
        "The",
        "meeting",
        "is",
        "on",
        "Monday",
        "at",
        "nine",
        "o'clock",
        ".",
        "are",
      ],
      answer: "The meeting is on Monday at nine o'clock .",
    },
    {
      id: "wb2",
      prompt_vn: "Tôi rảnh buổi sáng. Bạn rảnh khi nào?",
      words: [
        "I'm",
        "free",
        "in",
        "the",
        "morning.",
        "When",
        "are",
        "you",
        "free",
        "?",
        "is",
      ],
      answer: "I'm free in the morning. When are you free ?",
    },
    {
      id: "wb3",
      prompt_vn: "Hãy để tôi kiểm tra lịch trình của tôi.",
      words: ["Let", "me", "check", "my", "schedule", ".", "is", "are"],
      answer: "Let me check my schedule .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s7-1",
      prompt_vn: "Cuộc họp là vào thứ Hai lúc chín giờ.",
      words: [
        "The",
        "meeting",
        "is",
        "on",
        "Monday",
        "at",
        "nine",
        "o'clock",
        ".",
      ],
      answer: "The meeting is on Monday at nine o'clock .",
    },
    {
      id: "s7-2",
      prompt_vn: "Tôi rảnh buổi sáng. Bạn rảnh khi nào?",
      words: [
        "I'm",
        "free",
        "in",
        "the",
        "morning.",
        "When",
        "are",
        "you",
        "free",
        "?",
      ],
      answer: "I'm free in the morning. When are you free ?",
    },
    {
      id: "s7-3",
      prompt_vn: "Hãy để tôi kiểm tra lịch trình của tôi.",
      words: ["Let", "me", "check", "my", "schedule", "."],
      answer: "Let me check my schedule .",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Đặt lịch họp qua điện thoại",
      audio: "/audio/unit-a0-7/dialogue_1.mp3",
      desc: "Minh cần đặt lịch họp với đối tác Sara.",
      lines: [
        {
          id: "d7-1-1",
          speaker: "Sara",
          text: "Hi Minh! Can we schedule a meeting this week?",
          translation:
            "Chào Minh! Chúng ta có thể đặt lịch họp tuần này không?",
        },
        {
          id: "d7-1-2",
          speaker: "Minh",
          text: "Of course! Let me check my schedule. I'm busy on Monday and today.",
          translation:
            "Được! Để tôi kiểm tra lịch. Tôi bận vào thứ Hai và hôm nay.",
        },
        {
          id: "d7-1-3",
          speaker: "Sara",
          text: "How about tomorrow — on Tuesday?",
          translation: "Thế ngày mai — vào thứ Ba thì sao?",
        },
        {
          id: "d7-1-4",
          speaker: "Minh",
          text: "Tuesday is good! I'm free in the morning on Tuesday. What time?",
          translation: "Thứ Ba tốt! Tôi rảnh buổi sáng thứ Ba. Mấy giờ?",
        },
        {
          id: "d7-1-5",
          speaker: "Sara",
          text: "Can we meet at ten o'clock?",
          translation: "Chúng ta có thể gặp lúc mười giờ không?",
        },
        {
          id: "d7-1-6",
          speaker: "Minh",
          text: "At ten o'clock on Tuesday morning — that's perfect! I'll add it to my schedule.",
          translation:
            "Lúc mười giờ sáng thứ Ba — hoàn hảo! Tôi sẽ thêm vào lịch của tôi.",
        },
        {
          id: "d7-1-7",
          speaker: "Sara",
          text: "Great! See you at the meeting tomorrow. Have a good week!",
          translation:
            "Tuyệt! Hẹn gặp tại cuộc họp ngày mai. Chúc tuần tốt lành!",
        },
      ],
    },
    {
      id: 2,
      title: "Hỏi lịch trình hàng tuần",
      audio: "/audio/unit-a0-7/dialogue_2.mp3",
      desc: "Minh và Linh nói chuyện về lịch làm việc trong tuần.",
      lines: [
        {
          id: "d7-2-1",
          speaker: "Linh",
          text: "What's on your schedule this week?",
          translation: "Tuần này lịch của bạn thế nào?",
        },
        {
          id: "d7-2-2",
          speaker: "Minh",
          text: "Very busy! I have meetings every morning this week. On Monday at 9, on Wednesday at 10.",
          translation:
            "Bận lắm! Tôi có họp mỗi sáng tuần này. Thứ Hai lúc 9, thứ Tư lúc 10.",
        },
        {
          id: "d7-2-3",
          speaker: "Linh",
          text: "Wow! Are you free in the afternoon?",
          translation: "Ôi! Bạn có rảnh buổi chiều không?",
        },
        {
          id: "d7-2-4",
          speaker: "Minh",
          text: "I'm free tomorrow afternoon. Not today — today I'm very busy!",
          translation:
            "Tôi rảnh chiều mai. Không phải hôm nay — hôm nay tôi rất bận!",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac7-1",
      audio_text: "The meeting is on Monday at nine o clock",
      options: [
        "The meeting is on Monday at nine o'clock",
        "The meeting is in Monday at nine o'clock",
        "The meeting is on Monday in nine o'clock",
        "The meeting is at Monday on nine o'clock",
      ],
      answer: "The meeting is on Monday at nine o'clock",
    },
    {
      id: "lac7-2",
      audio_text: "I'm free in the morning on Tuesday",
      options: [
        "I'm free in the morning on Tuesday",
        "I'm free at the morning on Tuesday",
        "I'm free in the morning in Tuesday",
        "I'm free on the morning on Tuesday",
      ],
      answer: "I'm free in the morning on Tuesday",
    },
    {
      id: "lac7-3",
      audio_text: "Let me check my schedule",
      options: [
        "Let me check my schedule",
        "Let me check my scedule",
        "Let me check your schedule",
        "Let me check a schedule",
      ],
      answer: "Let me check my schedule",
    },
    {
      id: "lac7-4",
      audio_text: "I am busy on Monday",
      options: [
        "Tôi bận vào thứ Hai",
        "Tôi bận vào thứ Ba",
        "Tôi rảnh vào thứ Hai",
        "Tôi bận vào thứ Tư",
      ],
      answer: "Tôi bận vào thứ Hai",
    },
    {
      id: "lac7-5",
      audio_text: "Are you free in the afternoon on Friday",
      options: [
        "Bạn rảnh chiều thứ Sáu không?",
        "Bạn rảnh sáng thứ Sáu không?",
        "Bạn rảnh chiều thứ Năm không?",
        "Bạn bận chiều thứ Sáu không?",
      ],
      answer: "Bạn rảnh chiều thứ Sáu không?",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "crA07-1",
      question: "'Mẹ' trong tiếng Anh là gì? (unitA06 - Gia đình)",
      options: ["Father", "Mother", "Sister", "Brother"],
      answer: "Mother",
      type: "multiple-choice",
    },
    {
      id: "crA07-2",
      question: "'Bố' trong tiếng Anh là gì? (unitA06 - Gia đình)",
      options: ["Mother", "Father", "Daughter", "Son"],
      answer: "Father",
      type: "multiple-choice",
    },
    {
      id: "crA07-3",
      question: "Dịch sang tiếng Anh: 'Anh trai tôi' (unitA06)",
      options: [],
      answer: "My brother",
      type: "translate",
    },
    {
      id: "crA07-4",
      question: "Dịch sang tiếng Anh: 'Chị gái tôi' (unitA06)",
      options: [],
      answer: "My sister",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/p/ /t/ /k/ cuối từ",
    description: "Ba phụ âm nổ cuối từ — không bật hơi",
    examples: [
      {
        word: "stop",
        ipa: "/stɒp/",
        tip: "Khép môi, KHÔNG bật hơi — 'stop-uh' là sai",
      },
      { word: "what", ipa: "/wɒt/", tip: "Lưỡi chạm nướu, KHÔNG bật hơi" },
    ],
    minimalPairs: [["stop (đúng)", "stop-uh (sai)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Luyện nhanh: Thời gian & Lịch hẹn",
    items: [
      { en: "Monday, Tuesday, Wednesday", vn: "Thứ Hai, Thứ Ba, Thứ Tư" },
      {
        en: "Thursday, Friday, Saturday, Sunday",
        vn: "Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ Nhật",
      },
      { en: "at 9 o'clock", vn: "lúc 9 giờ" },
      { en: "on Monday", vn: "vào thứ Hai" },
      { en: "in the morning", vn: "vào buổi sáng" },
      { en: "Are you free on Tuesday?", vn: "Bạn rảnh vào thứ Ba không?" },
      { en: "Let me check my schedule.", vn: "Để tôi kiểm tra lịch." },
      { en: "The meeting is at ten o'clock.", vn: "Cuộc họp lúc mười giờ." },
    ],
  },

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I'm free on {input} at ___ o'clock.",
    level1Placeholder: "Nhập ngày (Monday, Tuesday, Wednesday...)...",
    level2Situation:
      "Đối tác hỏi 'When are you free this week?' Hãy trả lời và đề xuất lịch họp cụ thể: ngày + buổi + giờ.",
    level2Hint:
      "I'm busy on... / I'm free on [day] in the [morning/afternoon] at [time] o'clock.",
  },

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q7-1",
      question: "Điền giới từ đúng: 'The meeting is ___ 9 o'clock.'",
      options: ["in", "on", "at", "for"],
      answer: "at",
      type: "multiple-choice",
    },
    {
      id: "q7-2",
      question: "Điền từ: 'Let's meet ___ Monday.' (thứ Hai)",
      options: [],
      answer: "on",
      type: "cloze",
    },
    {
      id: "q7-3",
      question: "Điền từ: 'I'm free ___ the morning.' (buổi sáng)",
      options: [],
      answer: "in",
      type: "cloze",
    },
    {
      id: "q7-4",
      question: "Câu nào ĐÚNG?",
      options: [
        "The meeting is in Monday.",
        "The meeting is at Monday.",
        "The meeting is on Monday.",
        "The meeting is for Monday.",
      ],
      answer: "The meeting is on Monday.",
      type: "multiple-choice",
    },
    {
      id: "q7-5",
      question: "Cuộc họp vào thứ Ba lúc 10 giờ. (Dịch)",
      options: [],
      answer: "The meeting is on Tuesday at 10 o'clock.",
      type: "translate",
    },
    {
      id: "q7-6",
      question: "Tôi rảnh buổi sáng thứ Tư. Bạn rảnh khi nào? (Dịch)",
      options: [],
      answer: "I'm free on Wednesday morning. When are you free?",
      type: "translate",
    },
    {
      id: "q7-7",
      question: "Để tôi kiểm tra lịch. Tuần tới tốt hơn. (Dịch)",
      options: [],
      answer: "Let me check my schedule. Next week is better.",
      type: "translate",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA07-reading-1",
    title: "My Day",
    title_vn: "Đọc đoạn về thời gian trong ngày",
    level: "A0" as const,
    text:
      "I wake up at 6 o'clock in the morning. " +
      "I go to work at 8 AM. " +
      "I have lunch at 12 o'clock. " +
      "I finish work at 5 PM. " +
      "I watch TV at 7 o'clock in the evening. " +
      "I go to bed at 10 PM. " +
      "Goodnight!",
    questions: [
      {
        id: "uA07r-q1",
        question_vn: "Người kể chuyện thức dậy lúc mấy giờ?",
        options: ["5 AM", "6 AM", "7 AM", "8 AM"],
        answer: "6 AM",
        explanation_vn: "'I wake up at 6 o'clock in the morning.'",
      },
      {
        id: "uA07r-q2",
        question_vn: "Người kể chuyện ăn trưa lúc mấy giờ?",
        options: ["11 AM", "12 o'clock", "1 PM", "2 PM"],
        answer: "12 o'clock",
        explanation_vn: "'I have lunch at 12 o'clock.'",
      },
      {
        id: "uA07r-q3",
        question_vn: "Người kể chuyện tan làm lúc mấy giờ?",
        options: ["4 PM", "5 PM", "6 PM", "7 PM"],
        answer: "5 PM",
        explanation_vn: "'I finish work at 5 PM.'",
      },
      {
        id: "uA07r-q4",
        question_vn: "Người kể chuyện đi ngủ lúc mấy giờ?",
        options: ["9 PM", "10 PM", "11 PM", "12 AM"],
        answer: "10 PM",
        explanation_vn: "'I go to bed at 10 PM.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "8U40yQ7IVqY", // BBC Learning English — Daily Routines & time
  jobScenarios: [
    {
      id: 1,
      title: "Hỏi xin chữ ký hoặc approval từ sếp entry level",
      focus:
        "Polite request at work: 'Could you sign this?' 'When do you need it by?'",
      context: "Văn phòng nhỏ, cần chữ ký cho đơn hoặc báo cáo",
      l1Note:
        "⚠️ 'Excuse me, could you please sign this form?' 'I need it before 3pm today.'",
      example:
        "Excuse me Mr. Tuan, could you sign this expense report? I need to submit it before the end of the day.",
    },
  ],
};
