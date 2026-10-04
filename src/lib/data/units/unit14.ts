import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-14 — Future Plans & Predictions  (A2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit14: UnitData = {
  unitId: "unit-14",
  title: "Unit 14: Future Plans & Predictions",
  level: "A2",
  xp: 90,
  estimatedTime: 45,
  description:
    "Học cách nói về kế hoạch tương lai và dự đoán bằng 'will' và 'going to'.",
  badgeName: "Người Lập Kế Hoạch",
  badgeEmoji: "📋",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Sếp người nước ngoài hỏi về kế hoạch dự án tháng tới và định hướng sự nghiệp của bạn. Bạn cần trình bày kế hoạch bằng tiếng Anh một cách tự tin.",
  learningOutcomes: [
    "Nói về kế hoạch đã lên sẵn bằng 'going to'",
    "Đưa ra dự đoán và quyết định tức thì bằng 'will'",
    "Hỏi về kế hoạch tương lai của người khác",
  ],

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "📋",
      en: "I'm going to attend a meeting tomorrow.",
      vn: "Ngày mai tôi sẽ tham dự một cuộc họp.",
      context: "Kế hoạch đã lên sẵn",
    },
    {
      emoji: "🔮",
      en: "I think it will rain this afternoon.",
      vn: "Tôi nghĩ chiều nay trời sẽ mưa.",
      context: "Dự đoán",
    },
    {
      emoji: "✈️",
      en: "We're going to launch a new product next month.",
      vn: "Tháng tới chúng tôi sẽ ra mắt sản phẩm mới.",
      context: "Kế hoạch công việc",
    },
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    "Trong môi trường làm việc quốc tế, <span class=\"text-primary font-semibold\">'going to'</span> dùng cho kế hoạch đã lên sẵn và chắc chắn, còn <span class=\"text-primary font-semibold\">'will'</span> dùng cho dự đoán hoặc quyết định vừa nghĩ ra. Người bản xứ thường nói <span class=\"text-primary font-semibold\">'I'll'</span> (viết tắt của 'I will') trong văn nói thông thường.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "plan",
      emoji: "📋",
      phonetic: "/plæn/",
      meaning: "kế hoạch / lên kế hoạch",
      example: "What are your plans for next week?",
      example2: "I have a plan to improve my English.",
      collocation: "make a plan / have a plan",
      audio: "/audio/unit-14/plan.mp3",
      l1_interference_vn:
        "⚠️ 'Plan TO do': 'I plan to travel'. 'Plan ON doing' cũng đúng. Không: 'plan doing'.",
    },
    {
      id: 2,
      word: "meeting",
      emoji: "🤝",
      phonetic: "/ˈmiːtɪŋ/",
      meaning: "cuộc họp",
      example: "I have a meeting at 9 AM.",
      example2: "Let's schedule a meeting for Thursday.",
      collocation: "have a meeting / attend a meeting",
      audio: "/audio/unit-14/meeting.mp3",
      l1_interference_vn:
        "⚠️ 'Have/attend a meeting' — collocation chuẩn. 'A meeting' (đếm được). KHÔNG 'do a meeting' hay 'make a meeting'.",
    },
    {
      id: 3,
      word: "deadline",
      emoji: "⏰",
      phonetic: "/ˈdedlaɪn/",
      meaning: "hạn chót",
      example: "The deadline is next Friday.",
      example2: "We need to finish before the deadline.",
      collocation: "meet a deadline / before the deadline",
      audio: "/audio/unit-14/deadline.mp3",
      l1_interference_vn:
        "⚠️ 'Meet/miss a deadline' — collocation quan trọng. 'The deadline is Friday' (không phải 'at Friday' — dùng 'on' hoặc 'is').",
    },
    {
      id: 4,
      word: "project",
      emoji: "💼",
      phonetic: "/ˈprɒdʒekt/",
      meaning: "dự án",
      example: "We are going to start a new project.",
      example2: "The project will take three months.",
      collocation: "work on a project / lead a project",
      audio: "/audio/unit-14/project.mp3",
      l1_interference_vn:
        "⚠️ 'Work on a project'. Stress: PROJ-ect (n, âm 1) vs pro-JECT (v, âm 2). 'Project a presentation' (v) vs 'a project' (n).",
    },
    {
      id: 5,
      word: "launch",
      emoji: "🚀",
      phonetic: "/lɔːntʃ/",
      meaning: "ra mắt / khởi chạy",
      example: "We will launch the new app next month.",
      example2: "The company launched a new product.",
      collocation: "launch a product / launch a campaign",
      audio: "/audio/unit-14/launch.mp3",
      l1_interference_vn:
        "⚠️ 'Launch a product/app/campaign'. KHÔNG 'open a product'. 'Launch' = ra mắt chính thức, có sự kiện cụ thể.",
    },
    {
      id: 6,
      word: "probably",
      emoji: "🤔",
      phonetic: "/ˈprɒbəbli/",
      meaning: "có thể / chắc là",
      example: "I will probably finish by 5 PM.",
      example2: "It will probably be a busy week.",
      collocation: "will probably / probably not",
      audio: "/audio/unit-14/probably.mp3",
      l1_interference_vn:
        "⚠️ 'Probably' đứng TRƯỚC động từ chính: 'I'll probably go'. Sau 'be': 'It's probably fine'. KHÔNG cuối câu.",
    },
    {
      id: 7,
      word: "next",
      emoji: "➡️",
      phonetic: "/nekst/",
      meaning: "tiếp theo / tới",
      example: "I'm going to travel next month.",
      example2: "See you next week!",
      collocation: "next week / next year / next time",
      audio: "/audio/unit-14/next.mp3",
      l1_interference_vn:
        "⚠️ 'Next week/month/year' — không có 'the' trong time expressions tương lai.",
    },
    {
      id: 8,
      word: "soon",
      emoji: "⚡",
      phonetic: "/suːn/",
      meaning: "sớm / chẳng bao lâu nữa",
      example: "I will call you soon.",
      example2: "The report will be ready soon.",
      collocation: "very soon / as soon as possible",
      audio: "/audio/unit-14/soon.mp3",
      l1_interference_vn:
        "⚠️ 'Soon' thường cuối câu: 'See you soon'. Đầu câu: 'Soon I will...' nghe formal.",
    },
    {
      id: 9,
      word: "hope",
      emoji: "🌟",
      phonetic: "/həʊp/",
      meaning: "hy vọng",
      example: "I hope to get promoted this year.",
      example2: "We hope the project will succeed.",
      collocation: "hope to / hope for the best",
      audio: "/audio/unit-14/hope.mp3",
      l1_interference_vn:
        "⚠️ 'Hope TO do' hoặc 'hope that': 'I hope to pass'. Không: 'hope doing' — sai cấu trúc.",
    },
    {
      id: 10,
      word: "prepare",
      emoji: "📝",
      phonetic: "/prɪˈpeər/",
      meaning: "chuẩn bị",
      example: "I'm going to prepare a presentation.",
      example2: "She is preparing for the interview.",
      collocation: "prepare for / prepare a report",
      audio: "/audio/unit-14/prepare.mp3",
      l1_interference_vn:
        "⚠️ 'Prepare FOR something' (chuẩn bị cho): 'prepare for the meeting'. 'Prepare something' (chuẩn bị cái gì): 'prepare a report'.",
    },
    {
      id: 11,
      word: "improve",
      emoji: "📈",
      phonetic: "/ɪmˈpruːv/",
      meaning: "cải thiện / tiến bộ",
      example: "I'm going to improve my English skills.",
      example2: "Sales will improve next quarter.",
      collocation: "improve your skills / improve performance",
      audio: "/audio/unit-14/improve.mp3",
      l1_interference_vn:
        "⚠️ 'Improve your English' (ngoại) hoặc 'Your English is improving' (nội). Không: 'improve up'.",
    },
    {
      id: 12,
      word: "schedule",
      emoji: "🗓️",
      phonetic: "/ˈʃedjuːl/",
      meaning: "lịch trình / lên lịch",
      example: "Let's schedule a call for Monday.",
      example2: "I have a busy schedule this week.",
      collocation: "follow a schedule / on schedule",
      audio: "/audio/unit-14/schedule.mp3",
      l1_interference_vn:
        "⚠️ Anh: /ˈʃɛdjuːl/, Mỹ: /ˈskɛdʒuːl/. Người Việt đọc 'sked-ule' — gần tiếng Mỹ.",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Kế hoạch tháng tới",
      audio: "/audio/unit-14/dialogue_1.mp3",
      desc: "Minh và sếp thảo luận về kế hoạch dự án tháng tới.",
      lines: [
        {
          id: "d1-1",
          speaker: "Manager",
          text: "Minh, what are your plans for next month?",
          translation: "Minh, kế hoạch của bạn tháng tới là gì?",
        },
        {
          id: "d1-2",
          speaker: "Minh",
          text: "I'm going to finish the market research report by next Friday.",
          translation:
            "Tôi sẽ hoàn thành báo cáo nghiên cứu thị trường vào thứ Sáu tới.",
        },
        {
          id: "d1-3",
          speaker: "Manager",
          text: "Good. And what about the new product launch?",
          translation: "Tốt. Còn việc ra mắt sản phẩm mới thì sao?",
        },
        {
          id: "d1-4",
          speaker: "Minh",
          text: "We are going to launch it in the third week of next month. I will prepare the presentation this week.",
          translation:
            "Chúng tôi sẽ ra mắt vào tuần thứ ba của tháng tới. Tôi sẽ chuẩn bị bài thuyết trình trong tuần này.",
        },
        {
          id: "d1-5",
          speaker: "Manager",
          text: "Will you need any help?",
          translation: "Bạn có cần trợ giúp gì không?",
        },
        {
          id: "d1-6",
          speaker: "Minh",
          text: "Probably. I'll let you know soon. I hope everything will go smoothly!",
          translation:
            "Có thể. Tôi sẽ báo bạn sớm. Tôi hy vọng mọi thứ sẽ diễn ra suôn sẻ!",
        },
      ],
    },
    {
      id: 2,
      title: "Dự đoán và quyết định",
      audio: "/audio/unit-14/dialogue_2.mp3",
      desc: "Sarah và Lan nói chuyện về kế hoạch cuối tuần và quyết định bất ngờ.",
      lines: [
        {
          id: "d2-1",
          speaker: "Sarah",
          text: "What are you going to do this weekend, Lan?",
          translation: "Cuối tuần này bạn định làm gì vậy, Lan?",
        },
        {
          id: "d2-2",
          speaker: "Lan",
          text: "I'm going to visit my grandmother in the countryside.",
          translation: "Tôi định đi thăm bà nội ở quê.",
        },
        {
          id: "d2-3",
          speaker: "Sarah",
          text: "Oh nice! I think I will stay home. Maybe I will cook something special.",
          translation:
            "Hay đó! Tôi nghĩ tôi sẽ ở nhà. Có thể tôi sẽ nấu gì đó đặc biệt.",
        },
        {
          id: "d2-4",
          speaker: "Lan",
          text: "It will probably be hot this weekend. Maybe you should go swimming!",
          translation: "Cuối tuần này chắc sẽ nóng. Có lẽ bạn nên đi bơi!",
        },
        {
          id: "d2-5",
          speaker: "Sarah",
          text: "Good idea! I will call my friend now. We can go to the pool together.",
          translation:
            "Ý hay đó! Tôi sẽ gọi bạn tôi ngay bây giờ. Chúng tôi có thể đi hồ bơi cùng nhau.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "I'm going to finish the report by Friday",
      options: [
        "I'm going to finish the report by Friday",
        "I finished the report by Friday",
        "I will finish the report by Friday",
        "She's going to finish the report by Friday",
      ],
      answer: "I'm going to finish the report by Friday",
    },
    {
      id: "lac2",
      audio_text: "We will launch the product next month",
      options: [
        "We launch the product next month",
        "We will launch the product next month",
        "We are launch the product next month",
        "They will launch the product next month",
      ],
      answer: "We will launch the product next month",
    },
    {
      id: "lac3",
      audio_text: "I hope everything will go smoothly",
      options: [
        "I hope everything goes smoothly",
        "I hope everything will go smoothly",
        "I hope everything went smoothly",
        "She hopes everything will go smoothly",
      ],
      answer: "I hope everything will go smoothly",
    },
    {
      id: "lac4",
      audio_text: "It will probably be hot this weekend",
      options: [
        "It is probably hot this weekend",
        "It will probably be hot this weekend",
        "It will probably hot this weekend",
        "It will be probably hot this weekend",
      ],
      answer: "It will probably be hot this weekend",
    },
    {
      id: "lac5",
      audio_text: "I'm going to prepare a presentation this week",
      options: [
        "I prepare a presentation this week",
        "I prepared a presentation this week",
        "I'm going to prepare a presentation this week",
        "I'm preparing a presentation this week",
      ],
      answer: "I'm going to prepare a presentation this week",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "Next month, I'm going to {input}.",
    level1Placeholder:
      "Ví dụ: start a new project, travel to Da Nang, improve my English...",
    level2Situation:
      "Sếp người nước ngoài hỏi về kế hoạch làm việc của bạn trong 3 tháng tới. Hãy mô tả ít nhất 3 kế hoạch cụ thể: dự án sẽ làm, kỹ năng sẽ phát triển, và mục tiêu cá nhân.",
    level2Hint:
      "In the next three months, I'm going to [plan 1]. I will also [plan 2]. I hope to [goal]. Probably, I will [prediction]. My main deadline is [date].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Will vs Going To — Tương lai trong tiếng Anh",
    rule: "'Going to' = kế hoạch đã lên sẵn (planned intention)\n'Will' = dự đoán hoặc quyết định tức thì (prediction/spontaneous decision)",
    examples: [
      {
        en: "I'm going to meet a client tomorrow. (planned)",
        vn: "Ngày mai tôi sẽ gặp khách hàng. (đã lên kế hoạch)",
      },
      {
        en: "I think it will rain. (prediction)",
        vn: "Tôi nghĩ trời sẽ mưa. (dự đoán)",
      },
      {
        en: "The phone is ringing. I'll answer it. (spontaneous)",
        vn: "Điện thoại đang reo. Tôi sẽ bắt máy. (quyết định ngay lúc đó)",
      },
      {
        en: "She will probably finish the project soon.",
        vn: "Cô ấy có thể sẽ hoàn thành dự án sớm.",
      },
    ],
    tip: "Cách nhớ nhanh: <strong>Going to</strong> = bạn đã suy nghĩ về nó từ trước. <strong>Will</strong> = bạn vừa quyết định ngay lúc nói. Trong hội thoại thực tế, người bản xứ hay dùng 'I'll' thay vì 'I will'.",
    vnNote:
      "⚠️ Lưu ý: 'Will' vs 'Going to' - cả hai đều chỉ tương lai. Will = quyết định tại chỗ hoặc dự đoán. Going to = kế hoạch đã có sẵn từ trước. Người Việt hay dùng nhầm hoặc bỏ qua sự khác biệt.",
    dialogueExample: {
      speaker: "Minh",
      text: "I'm going to prepare the presentation. I'll let you know soon.",
      translation: "Tôi sẽ chuẩn bị bài thuyết trình. Tôi sẽ báo bạn sớm.",
      highlight: "going to (planned) / will (spontaneous)",
    },
    ccq: {
      question: "Câu nào dùng ĐÚNG ngữ pháp?",
      options: [
        "I will going to travel next week.",
        "I'm going to travel next week. ✅",
        "I going to travel next week.",
        "I will to travel next week.",
      ],
      answer: "I'm going to travel next week. ✅",
      explanation:
        "'Going to' cần có 'to be' phía trước: am/is/are + going to + base verb.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question:
        "Chọn đúng: 'She ___ (kế hoạch sẵn) attend the conference next week.'",
      options: [
        "will attend",
        "is going to attend",
        "attends",
        "going to attend",
      ],
      answer: "is going to attend",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question: "Điền đúng: 'The deadline ___ next Friday.'",
      options: ["is", "was", "will be", "going to be"],
      answer: "will be",
    },
    {
      id: "pq3",
      type: "cloze",
      question: "Điền: 'I ___ (go) to the gym after work. (đã lên kế hoạch)'",
      answer: "am going to go",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "Câu dự đoán đúng: 'I think the project ___.'",
      options: [
        "is successful",
        "going to be successful",
        "will be successful",
        "is going to successful",
      ],
      answer: "will be successful",
    },
    {
      id: "pq5",
      type: "cloze",
      question: "Điền: 'We ___ (launch) the app in two months.'",
      answer: "are going to launch",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "plan", right: "kế hoạch" },
      { left: "deadline", right: "hạn chót" },
      { left: "launch", right: "ra mắt" },
      { left: "hope", right: "hy vọng" },
      { left: "schedule", right: "lịch trình" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Tháng tới chúng tôi sẽ ra mắt sản phẩm mới.",
      answer: "Next month we are going to launch a new product.",
    },
    {
      id: "pt-2",
      prompt_vn: "Chúng tôi sẽ họp vào thứ Hai tới.",
      answer: "We will have a meeting next Monday.",
    },
    {
      id: "pt-3",
      prompt_vn: "Tôi dự định nộp báo cáo trước hạn chót.",
      answer: "I am going to submit the report before the deadline.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc14-1",
      sentence: "I will going to visit my friend tomorrow.",
      errorWord: "going",
      correction: "go",
      explanation_vn:
        "'Will' + V nguyên mẫu: 'I will GO'. Không dùng 'will going to' — đó là lỗi kết hợp sai hai cấu trúc.",
    },
    {
      id: "sc14-2",
      sentence: "She is going to studies English next month.",
      errorWord: "studies",
      correction: "study",
      explanation_vn:
        "'Going to' + V nguyên mẫu (không chia): 'going to STUDY'. 'Studies' chỉ dùng ở hiện tại đơn ngôi 3 số ít.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la14-1",
      audio_text: "I will visit my friend tomorrow.",
      prompt_vn: "Ngày mai tôi sẽ đến thăm bạn.",
      words: [
        "I",
        "will",
        "visit",
        "my",
        "friend",
        "tomorrow",
        ".",
        "going",
        "visited",
      ],
      answer: "I will visit my friend tomorrow .",
    },
    {
      id: "la14-2",
      audio_text: "She is going to study English.",
      prompt_vn: "Cô ấy sẽ học tiếng Anh.",
      words: [
        "She",
        "is",
        "going",
        "to",
        "study",
        "English",
        ".",
        "will",
        "studies",
      ],
      answer: "She is going to study English .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi sẽ chuẩn bị bài thuyết trình ngày mai.",
      words: [
        "I",
        "am",
        "going",
        "to",
        "prepare",
        "a",
        "presentation",
        "tomorrow",
        ".",
        "have",
        "has",
      ],
      answer: "I am going to prepare a presentation tomorrow .",
    },
    {
      id: "wb2",
      prompt_vn: "Chúng tôi sẽ ra mắt sản phẩm mới tháng tới.",
      words: [
        "We",
        "will",
        "launch",
        "the",
        "new",
        "product",
        "next",
        "month",
        ".",
        "have",
        "has",
      ],
      answer: "We will launch the new product next month .",
    },
    {
      id: "wb3",
      prompt_vn: "Hạn chót là thứ Sáu tới.",
      words: ["The", "deadline", "is", "next", "Friday", ".", "have", "has"],
      answer: "The deadline is next Friday .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s14-1",
      prompt_vn: "Tôi sẽ chuẩn bị bài thuyết trình ngày mai.",
      words: [
        "I",
        "am",
        "going",
        "to",
        "prepare",
        "a",
        "presentation",
        "tomorrow",
        ".",
      ],
      answer: "I am going to prepare a presentation tomorrow .",
    },
    {
      id: "s14-2",
      prompt_vn: "Chúng tôi sẽ ra mắt sản phẩm mới tháng tới.",
      words: [
        "We",
        "will",
        "launch",
        "the",
        "new",
        "product",
        "next",
        "month",
        ".",
      ],
      answer: "We will launch the new product next month .",
    },
    {
      id: "s14-3",
      prompt_vn: "Hạn chót là thứ Sáu tới.",
      words: ["The", "deadline", "is", "next", "Friday", "."],
      answer: "The deadline is next Friday .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question: "Dịch: 'Tháng tới chúng tôi sẽ ra mắt sản phẩm mới.'",
      options: [
        "Next month we launch a new product.",
        "Next month we are going to launch a new product.",
        "Next month we will launching a new product.",
        "Next month we launched a new product.",
      ],
      answer: "Next month we are going to launch a new product.",
      explanation_vn:
        "Kế hoạch đã lên sẵn → 'going to'. 'Will launching' sai vì 'will' + V nguyên mẫu, không dùng -ing.",
    },
    {
      id: "fq2",
      type: "cloze",
      question: "Điền: 'I ___ (probably / rain) this afternoon.'",
      answer: "will probably rain",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question: "Chọn đúng: Bạn vừa quyết định mang ô đi vì thấy mây đen.",
      options: [
        "I'm going to bring an umbrella.",
        "I brought an umbrella.",
        "I will bring an umbrella.",
        "I bring an umbrella.",
      ],
      answer: "I will bring an umbrella.",
      explanation_vn:
        "Quyết định tức thì ngay lúc nói → dùng 'will'. 'Going to' dùng khi đã lên kế hoạch từ trước.",
    },
    {
      id: "fq4",
      type: "translate",
      question:
        "Dịch sang tiếng Anh: 'Tôi hy vọng mọi thứ sẽ diễn ra suôn sẻ.'",
      answer: "I hope everything will go smoothly.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question: "Câu nào ĐÚNG về ngữ pháp?",
      options: [
        "I going to prepare a report.",
        "I'm going to prepare a report. ✅",
        "I will going to prepare a report.",
        "I'm go to prepare a report.",
      ],
      answer: "I'm going to prepare a report. ✅",
      explanation_vn:
        "'Going to' cần có 'to be' phía trước: 'am/is/are + going to + V nguyên mẫu'. 'Will going to' là lỗi không được.",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "Dùng 'going to' khi nào?",
      options: [
        "Quyết định tức thì",
        "Kế hoạch đã có sẵn",
        "Dự đoán không có bằng chứng",
        "Hành động đang xảy ra",
      ],
      answer: "Kế hoạch đã có sẵn",
      explanation_vn:
        "'Going to' dùng cho kế hoạch đã có sẵn (đã quyết định trước). 'Will' cho quyết định tức thời hoặc dự đoán không có bằng chứng.",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "Chọn câu đúng:",
      options: [
        "I will going to study.",
        "I am going to study.",
        "I going to study.",
        "I am go to study.",
      ],
      answer: "I am going to study.",
      explanation_vn:
        "Cấu trúc 'be going to': am/is/are + going to + V nguyên mẫu. 'I am going to study' (đã có kế hoạch). KHÔNG 'I going to study'.",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền: 'It's cloudy. It ___ rain.' (going to)",
      answer: "is going to",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "'Will' dùng để:",
      options: [
        "Nói về quá khứ",
        "Quyết định ngay lúc nói",
        "Hành động đang xảy ra",
        "Kế hoạch định sẵn",
      ],
      answer: "Quyết định ngay lúc nói",
      explanation_vn:
        "'Will' = quyết định ngay lúc nói (spontaneous). 'I'll open the window' — quyết định tại chỗ. 'Going to' = kế hoạch đã có trước.",
    },
    {
      id: "q-ex5",
      type: "multiple-choice",
      question: "Câu hỏi tương lai đúng:",
      options: [
        "What you will do?",
        "What will you do?",
        "What will you doing?",
        "What do you will do?",
      ],
      answer: "What will you do?",
      explanation_vn:
        "Câu hỏi với 'will': Will + S + V nguyên mẫu? 'What will you do?' KHÔNG 'What will you doing?' hay 'What you will do?'.",
    },
    {
      id: "q-ex6",
      type: "multiple-choice",
      question: "Phủ định của 'She is going to travel':",
      options: [
        "She isn't going to travel.",
        "She won't going to travel.",
        "She doesn't going to travel.",
        "She not going to travel.",
      ],
      answer: "She isn't going to travel.",
      explanation_vn:
        "Phủ định 'going to': S + am/is/are + NOT + going to + V. 'She isn't going to travel.' KHÔNG 'She doesn't going to travel'.",
    },
    {
      id: "q-ex7",
      type: "translate",
      question: "Dịch: 'Tôi sẽ giúp bạn!' (quyết định tức thì)",
      answer: "I'll help you!",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr14-1",
      question:
        "Chọn dạng đúng: 'I ___ to the office yesterday.' (Unit 13: Past Simple)",
      options: ["go", "goes", "went", "going"],
      answer: "went",
      type: "multiple-choice",
    },
    {
      id: "cr14-2",
      question:
        "Điền từ: 'He ___ the report last night.' (Unit 13: Past Simple irregular)",
      options: [],
      answer: "wrote",
      type: "cloze",
    },
    {
      id: "cr14-3",
      question: "Chúng tôi đã không tham dự cuộc họp. (Unit 13)",
      options: [],
      answer: "We didn't attend the meeting.",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "going to → gonna",
    description:
      "Phát âm going to nhanh: /ˈɡɒɪŋ tə/ → gonna /ˈɡɒnə/ trong nói nhanh",
    examples: [
      {
        word: "going to",
        ipa: "/ˈɡɒɪŋ tə/",
        tip: "Văn nói chậm/rõ: going to rõ từng âm",
      },
      {
        word: "gonna",
        ipa: "/ˈɡɒnə/",
        tip: "Văn nói nhanh: I am gonna go — KHÔNG viết gonna trong văn viết",
      },
    ],
    minimalPairs: [["going to (chính thức)", "gonna (không chính thức)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I will call you", vn: "Tôi sẽ gọi cho bạn" },
      { en: "She is going to meet the client", vn: "Cô ấy sẽ gặp khách hàng" },
      { en: "It will be fine", vn: "Nó sẽ ổn" },
      { en: "We are going to have a meeting", vn: "Chúng tôi sẽ họp" },
      { en: "Will you help me?", vn: "Bạn có giúp tôi không?" },
      { en: "I am going to resign", vn: "Tôi sẽ từ chức" },
      { en: "It won't take long", vn: "Sẽ không mất lâu" },
      { en: "They are going to launch", vn: "Họ sẽ ra mắt" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit14-reading-1",
    title: "Big Plans for Next Month",
    title_vn: "Kế Hoạch Lớn Cho Tháng Tới",
    level: "A2" as const,
    text: `Minh has many plans for next month. He is going to prepare a presentation for an important meeting on Monday. His team will launch a new product at the end of the month, so the deadline is very tight. He will probably work late this week to improve the project report. Minh hopes everything will go smoothly. He is also going to schedule a call with overseas clients soon. His manager believes the launch will be successful. Next month is going to be very busy, but Minh feels ready. He says, "I will do my best and I hope the team will support me!"`,
    questions: [
      {
        id: "unit14-q1",
        question_vn: "Minh đang chuẩn bị điều gì cho ngày thứ Hai?",
        options: [
          "He is going to prepare a report.",
          "He is going to prepare a presentation.",
          "He will launch a product on Monday.",
          "He plans to attend a training course.",
        ],
        answer: "He is going to prepare a presentation.",
        explanation_vn:
          "'He is going to prepare a presentation for an important meeting on Monday' — chuẩn bị bài thuyết trình cho cuộc họp.",
      },
      {
        id: "unit14-q2",
        question_vn: "Tại sao deadline lại rất gấp?",
        options: [
          "Because the meeting is cancelled.",
          "Because the team will launch a new product at the end of the month.",
          "Because the manager set a new schedule.",
          "Because Minh is going on vacation.",
        ],
        answer:
          "Because the team will launch a new product at the end of the month.",
        explanation_vn:
          "'His team will launch a new product at the end of the month, so the deadline is very tight' — ra mắt sản phẩm mới nên deadline rất gấp.",
      },
      {
        id: "unit14-q3",
        question_vn: "Minh sẽ làm gì với khách hàng nước ngoài?",
        options: [
          "He will visit them in person.",
          "He will send a report by email.",
          "He is going to schedule a call with them soon.",
          "He will probably cancel the meeting.",
        ],
        answer: "He is going to schedule a call with them soon.",
        explanation_vn:
          "'He is also going to schedule a call with overseas clients soon' — lên lịch cuộc gọi với khách hàng nước ngoài.",
      },
      {
        id: "unit14-q4",
        question_vn: "Minh cảm thấy thế nào về tháng tới?",
        options: [
          "He feels nervous and unprepared.",
          "He feels ready despite the busy schedule.",
          "He hopes to take a holiday.",
          "He probably wants to change his job.",
        ],
        answer: "He feels ready despite the busy schedule.",
        explanation_vn:
          "'Next month is going to be very busy, but Minh feels ready' — bận rộn nhưng anh ấy cảm thấy sẵn sàng.",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "zrANkpvxlpo",

  // jobScenarios for world-class VN adult career content (TASK-153)
  jobScenarios: [
    {
      id: 1,
      title: "Busy work month planning",
      focus: "future plans at job",
      context: "team schedule",
    },
  ],
};

export default unit14;
