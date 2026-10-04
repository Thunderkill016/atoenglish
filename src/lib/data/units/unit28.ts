import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-28 — How Long Have You Been...?  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit28: UnitData = {
  unitId: "unit-28",
  title: "Unit 28: How Long Have You Been...?",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description:
    "Present Perfect Continuous — 'I've been studying English for 6 months.' Diễn tả hành động đang tiếp diễn từ quá khứ đến hiện tại với trọng tâm vào THỜI GIAN và TIẾN TRÌNH.",
  badgeName: "Người Kiên Trì",
  badgeEmoji: "⏳",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Phỏng vấn xin học bổng. Interviewer hỏi: 'How long have you been working on this project?' Dùng Present Perfect Continuous: 'I've been working on it for eight months.' — thể hiện rõ sự liên tục và nỗ lực hơn Present Perfect đơn giản.",
  learningOutcomes: [
    "Dùng Present Perfect Continuous (have/has been + V-ing) cho hành động đang tiếp diễn",
    "Phân biệt Present Perfect Simple vs Continuous (result vs duration/process)",
    "Mô tả kinh nghiệm đang diễn ra trong phỏng vấn và hội thoại chuyên nghiệp",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'So sánh: <span class="text-muted-foreground">"I have read the report"</span> (xong rồi, kết quả) vs <span class="text-primary">"I have been reading the report"</span> (vẫn đang đọc, hoặc vừa đọc xong — nhấn mạnh quá trình). Người B1+ dùng Continuous khi muốn nhấn mạnh <span class="text-primary font-semibold">nỗ lực liên tục</span> và <span class="text-primary font-semibold">thời gian đã bỏ ra</span>.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "📚",
      en: "I've been studying English for six months now.",
      vn: "Tôi đã học tiếng Anh được sáu tháng rồi.",
      context: "for + thời gian — hành động đang tiếp diễn",
    },
    {
      emoji: "💼",
      en: "She's been working on the project since January.",
      vn: "Cô ấy đã làm dự án từ tháng Một.",
      context: "since + thời điểm bắt đầu",
    },
    {
      emoji: "🏃",
      en: "How long have you been learning to code?",
      vn: "Bạn đã học lập trình được bao lâu rồi?",
      context: "how long + present perfect continuous",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "progress",
      emoji: "📈",
      phonetic: "/ˈprəʊɡres/",
      meaning: "tiến triển / tiến bộ",
      example: "I've been making steady progress with my English.",
      example2: "The project has been progressing well.",
      collocation: "make progress / track progress / steady progress",
      audio: "/audio/unit-28/progress.mp3",
      l1_interference_vn:
        "⚠️ PRO-gress (danh từ) vs pro-GRESS (động từ). 'Make progress' — không có 'a'.",
    },
    {
      id: 2,
      word: "consistently",
      emoji: "🔁",
      phonetic: "/kənˈsɪstəntli/",
      meaning: "một cách nhất quán / đều đặn",
      example: "She has been consistently achieving high scores.",
      example2: "Our team has been consistently meeting targets.",
      collocation:
        "consistently good / consistently perform / maintain consistently",
      audio: "/audio/unit-28/consistently.mp3",
    },
    {
      id: 3,
      word: "dedicate",
      emoji: "💪",
      phonetic: "/ˈdedɪkeɪt/",
      meaning: "cống hiến / dành cho",
      example: "I've been dedicating two hours a day to IELTS preparation.",
      example2: "She has dedicated her career to education.",
      collocation: "dedicate time to / dedicated worker / highly dedicated",
      audio: "/audio/unit-28/dedicate.mp3",
      l1_interference_vn:
        "⚠️ \'Dedicate TO + V-ING\': \'dedicate time to learning\'. Không phải \'dedicate to learn\'.",
    },
    {
      id: 4,
      word: "expertise",
      emoji: "🎓",
      phonetic: "/ˌekspɜːˈtiːz/",
      meaning: "chuyên môn / kinh nghiệm chuyên sâu",
      example: "I've been developing my expertise in data analysis.",
      example2: "Her expertise in marketing is widely recognized.",
      collocation:
        "develop expertise / technical expertise / area of expertise",
      audio: "/audio/unit-28/expertise.mp3",
    },
    {
      id: 5,
      word: "duration",
      emoji: "⏱️",
      phonetic: "/djʊˈreɪʃən/",
      meaning: "thời gian / khoảng thời gian",
      example: "For the duration of the project, I've been leading the team.",
      example2: "The meeting was two hours in duration.",
      collocation: "for the duration / project duration / length and duration",
      audio: "/audio/unit-28/duration.mp3",
      l1_interference_vn:
        "⚠️ \'The duration OF\': \'the duration of the project\'. Không dùng \'long duration\' — dùng \'length\' thay.",
    },
    {
      id: 6,
      word: "persistent",
      emoji: "🦁",
      phonetic: "/pəˈsɪstənt/",
      meaning: "kiên trì / bền bỉ",
      example: "She has been persistent in improving her communication skills.",
      example2: "His persistent efforts have led to great results.",
      collocation: "persistent effort / remain persistent / persistent problem",
      audio: "/audio/unit-28/persistent.mp3",
      l1_interference_vn:
        "⚠️ = kiên trì (không bỏ cuộc). Phân biệt với \'consistent\' (nhất quán, đều đặn).",
    },
    {
      id: 7,
      word: "accumulate",
      emoji: "📦",
      phonetic: "/əˈkjuːmjuleɪt/",
      meaning: "tích lũy",
      example: "I've been accumulating experience in project management.",
      example2: "Over the years, she has accumulated valuable skills.",
      collocation:
        "accumulate experience / accumulate knowledge / gradually accumulate",
      audio: "/audio/unit-28/accumulate.mp3",
      l1_interference_vn:
        "⚠️ \'Accumulate\' + N: \'accumulate experience/debt\'. Cũng nội động từ: \'Debts accumulate over time.\'",
    },
    {
      id: 8,
      word: "mentor",
      emoji: "👨‍🏫",
      phonetic: "/ˈmentɔːr/",
      meaning: "người hướng dẫn / cố vấn",
      example: "She has been mentoring junior staff for three years.",
      example2: "I've been working under an experienced mentor.",
      collocation: "mentor someone / act as a mentor / mentoring program",
      audio: "/audio/unit-28/mentor.mp3",
    },
    {
      id: 9,
      word: "refine",
      emoji: "✨",
      phonetic: "/rɪˈfaɪn/",
      meaning: "hoàn thiện / tinh chỉnh",
      example: "I've been refining my presentation skills every week.",
      example2: "The team has been refining the product based on feedback.",
      collocation: "refine skills / refine a process / continually refine",
      audio: "/audio/unit-28/refine.mp3",
      l1_interference_vn:
        "⚠️ = tinh chỉnh từng bước — formal: \'refine the strategy\'. Phân biệt với \'improve\' (cải thiện chung).",
    },
    {
      id: 10,
      word: "collaborate",
      emoji: "🤝",
      phonetic: "/kəˈlæbəreɪt/",
      meaning: "cộng tác",
      example:
        "Our team has been collaborating with partners in five countries.",
      example2:
        "I've been collaborating with the design team on the new interface.",
      collocation: "collaborate on / collaborate with / collaborative effort",
      audio: "/audio/unit-28/collaborate.mp3",
    },
    {
      id: 11,
      word: "initiative",
      emoji: "🚀",
      phonetic: "/ɪˈnɪʃətɪv/",
      meaning: "sáng kiến / chủ động",
      example: "She has been leading the digital transformation initiative.",
      example2: "I take the initiative to improve processes wherever I can.",
      collocation:
        "take the initiative / strategic initiative / lead an initiative",
      audio: "/audio/unit-28/initiative.mp3",
    },
    {
      id: 12,
      word: "achievement",
      emoji: "🏆",
      phonetic: "/əˈtʃiːvmənt/",
      meaning: "thành tích / thành tựu",
      example: "I've been tracking my achievements to prepare for the review.",
      example2: "Her greatest achievement was leading the team to success.",
      collocation:
        "academic achievement / remarkable achievement / sense of achievement",
      audio: "/audio/unit-28/achievement.mp3",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Phỏng vấn học bổng",
      audio: "/audio/unit-28/dialogue_1.mp3",
      desc: "Minh phỏng vấn học bổng — dùng Present Perfect Continuous để nêu bật kinh nghiệm.",
      lines: [
        {
          id: "d1-1",
          speaker: "Interviewer",
          text: "How long have you been preparing for this scholarship?",
          translation: "Bạn đã chuẩn bị cho học bổng này bao lâu rồi?",
        },
        {
          id: "d1-2",
          speaker: "Minh",
          text: "I've been preparing for about a year. I've been studying English intensively, and I've been working on a research project since January.",
          translation:
            "Tôi đã chuẩn bị khoảng một năm. Tôi đã học tiếng Anh chuyên sâu, và tôi đã làm dự án nghiên cứu từ tháng Một.",
        },
        {
          id: "d1-3",
          speaker: "Interviewer",
          text: "What have you been learning recently?",
          translation: "Gần đây bạn đã học được gì?",
        },
        {
          id: "d1-4",
          speaker: "Minh",
          text: "I've been developing my data analysis expertise. I've also been mentoring two junior colleagues, which has been a rewarding experience.",
          translation:
            "Tôi đã phát triển chuyên môn phân tích dữ liệu. Tôi cũng đã hướng dẫn hai đồng nghiệp trẻ, điều đó là một trải nghiệm đáng giá.",
        },
        {
          id: "d1-5",
          speaker: "Interviewer",
          text: "Have you been making progress with your IELTS?",
          translation: "Bạn có tiến triển với IELTS không?",
        },
        {
          id: "d1-6",
          speaker: "Minh",
          text: "Yes, consistently. I've been practicing every day for three months and my score has improved from 5.5 to 6.5.",
          translation:
            "Vâng, một cách nhất quán. Tôi đã luyện tập mỗi ngày trong ba tháng và điểm của tôi đã cải thiện từ 5.5 lên 6.5.",
        },
      ],
    },
    {
      id: 2,
      title: "Cập nhật tiến độ dự án",
      audio: "/audio/unit-28/dialogue_2.mp3",
      desc: "Lan cập nhật tiến độ cho sếp.",
      lines: [
        {
          id: "d2-1",
          speaker: "Manager",
          text: "How long have you been working on the new system?",
          translation: "Bạn đã làm việc trên hệ thống mới bao lâu rồi?",
        },
        {
          id: "d2-2",
          speaker: "Lan",
          text: "We've been developing it since March — about four months. We've been testing it intensively this week.",
          translation:
            "Chúng tôi đã phát triển nó từ tháng Ba — khoảng bốn tháng. Chúng tôi đã kiểm tra nó chuyên sâu tuần này.",
        },
        {
          id: "d2-3",
          speaker: "Manager",
          text: "Has the team been facing any challenges?",
          translation: "Nhóm có gặp phải thách thức nào không?",
        },
        {
          id: "d2-4",
          speaker: "Lan",
          text: "We've been dealing with some integration issues, but we've been refining the process consistently. We're almost ready to launch.",
          translation:
            "Chúng tôi đã xử lý một số vấn đề tích hợp, nhưng chúng tôi đã tinh chỉnh quy trình một cách nhất quán. Chúng tôi gần như sẵn sàng để ra mắt.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "I've been studying English for six months",
      options: [
        "I've studied English for six months",
        "I've been studying English for six months",
        "I've been studying English since six months",
        "I'm studying English for six months",
      ],
      answer: "I've been studying English for six months",
    },
    {
      id: "lac2",
      audio_text: "She has been working on the project since January",
      options: [
        "She has worked on the project since January",
        "She has been working on the project since January",
        "She is working on the project since January",
        "She has been worked on the project since January",
      ],
      answer: "She has been working on the project since January",
    },
    {
      id: "lac3",
      audio_text: "How long have you been preparing for the scholarship",
      options: [
        "How long have you prepared for the scholarship",
        "How long are you preparing for the scholarship",
        "How long have you been preparing for the scholarship",
        "How long were you preparing for the scholarship",
      ],
      answer: "How long have you been preparing for the scholarship",
    },
    {
      id: "lac4",
      audio_text: "We've been developing the system since March",
      options: [
        "We've developed the system since March",
        "We've been developing the system since March",
        "We're developing the system since March",
        "We've been developing the system for March",
      ],
      answer: "We've been developing the system since March",
    },
    {
      id: "lac5",
      audio_text: "I've been practicing every day for three months",
      options: [
        "I've practiced every day for three months",
        "I've been practiced every day for three months",
        "I've been practicing every day for three months",
        "I've been practicing every day since three months",
      ],
      answer: "I've been practicing every day for three months",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt:
      "I've been {input} for {input}. Since {input}, I've also been {input}.",
    level1Placeholder:
      "Ví dụ: studying IELTS — 6 months — January — working on a research project...",
    level2Situation:
      "Phỏng vấn học bổng hoặc xin việc. Dùng Present Perfect Continuous để mô tả: (1) Bạn đã chuẩn bị cho vị trí này bao lâu và như thế nào? (2) Bạn đang phát triển kỹ năng gì? (3) Bạn đã đạt được tiến triển gì?",
    level2Hint:
      "I've been preparing for [period]. I've been [developing/studying/working on] [skill/project] since [date]. For the past [period], I've been consistently [action]. I've been making significant progress with [area].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Present Perfect Continuous — Nhấn Mạnh Quá Trình",
    rule: "Công thức: have/has + been + V-ing\n\nDùng khi:\n1. Hành động bắt đầu trong quá khứ và ĐANG TIẾP DIỄN đến hiện tại\n   → 'I've been studying for 3 hours.' (vẫn đang học)\n2. Nhấn mạnh THỜI GIAN hoặc QUÁ TRÌNH, không phải kết quả\n   → 'She's been working hard.' (quá trình liên tục)\n\nDấu hiệu: for, since, how long, all day/week\n\nSo sánh:\nPresent Perfect Simple: 'I've written the report.' → kết quả, xong rồi\nPresent Perfect Continuous: 'I've been writing the report.' → đang làm / vừa làm xong, nhấn mạnh quá trình",
    examples: [
      {
        en: "I've been studying English for 6 months. (still ongoing, emphasis on duration)",
        vn: "Tôi đã học tiếng Anh được 6 tháng (vẫn đang học).",
      },
      {
        en: "She's been working on the project since January. (started then, still now)",
        vn: "Cô ấy đã làm dự án từ tháng Một (đến giờ vẫn làm).",
      },
      {
        en: "How long have you been learning programming? (asking about ongoing action)",
        vn: "Bạn đã học lập trình được bao lâu rồi?",
      },
    ],
    tip: "Ghi nhớ: Khi muốn nhấn mạnh ĐÃ BAO LÂU rồi và ĐANG TIẾP TỤC → Present Perfect Continuous. Khi muốn nói về KẾT QUẢ → Present Perfect Simple. 'I've been reading' (quá trình) vs 'I've read' (xong, kết quả).",
    vnNote:
      "⚠️ Lưu ý người Việt: 'I've been working' không dịch là 'Tôi đã đang làm việc' — câu đó không tự nhiên trong tiếng Việt. Dịch thoát nghĩa: 'Tôi đã làm việc được...' (nhấn mạnh khoảng thời gian) hoặc 'Tôi vẫn đang làm...'",
    dialogueExample: {
      speaker: "Minh",
      text: "I've been preparing for about a year. I've been studying English intensively, and I've been working on a research project since January.",
      translation:
        "Tôi đã chuẩn bị khoảng một năm. Tôi đã học tiếng Anh chuyên sâu, và tôi đã làm dự án nghiên cứu từ tháng Một.",
      highlight:
        "have been preparing (duration) | have been studying (ongoing) | have been working since (start point)",
    },
    ccq: {
      question: "Câu nào nhấn mạnh QUÁ TRÌNH đang diễn ra?",
      options: [
        "I've written three reports this week.",
        "I've been writing reports all week.",
        "I wrote reports this week.",
        "I write reports every week.",
      ],
      answer: "I've been writing reports all week.",
      explanation:
        "'Have been writing' = Present Perfect Continuous — nhấn mạnh quá trình liên tục suốt tuần. 'Have written' = nhấn mạnh số lượng kết quả (3 báo cáo).",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question:
        "Chọn đúng — nhấn mạnh quá trình: 'She ___ English for two years.'",
      options: ["studied", "has studied", "has been studying", "is studying"],
      answer: "has been studying",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question: "'How long ___ you ___ on this project?'",
      options: [
        "have / worked",
        "have / been working",
        "did / work",
        "are / working",
      ],
      answer: "have / been working",
    },
    {
      id: "pq3",
      type: "cloze",
      question: "Điền: 'They ___ (develop) the app since March.'",
      answer: "have been developing",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "Phân biệt: Câu nào nhấn mạnh KẾT QUẢ?",
      options: [
        "I've been reading the report.",
        "I've read the report.",
        "I was reading the report.",
        "I've been reading the report all morning.",
      ],
      answer: "I've read the report.",
    },
    {
      id: "pq5",
      type: "cloze",
      question: "Điền: '___ (how long) she ___ (work) as a mentor?'",
      answer: "How long / has she been working",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "dedicate", right: "cống hiến / dành cho" },
      { left: "expertise", right: "chuyên môn" },
      { left: "refine", right: "hoàn thiện" },
      { left: "accumulate", right: "tích lũy" },
      { left: "achievement", right: "thành tích" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Bạn đã làm dự án này bao lâu rồi?",
      answer: "How long have you been working on this project?",
    },
    {
      id: "pt-2",
      prompt_vn: "Cô ấy đã cống hiến cho công ty suốt năm năm.",
      answer: "She has been dedicating herself to the company for five years.",
    },
    {
      id: "pt-3",
      prompt_vn: "Chúng tôi đã làm việc nhất quán trên chiến lược này.",
      answer: "We have been working consistently on this strategy.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc28-1",
      sentence: "I have been study for three hours.",
      errorWord: "study",
      correction: "studying",
      explanation_vn:
        "Present Perfect Continuous: 'have been + V-ing'. Phải dùng 'have been studying', không phải 'have been study'.",
    },
    {
      id: "sc28-2",
      sentence: "She has lived here since five years.",
      errorWord: "since",
      correction: "for",
      explanation_vn:
        "Dùng 'for' trước khoảng thời gian ('five years'); 'since' chỉ dùng trước thời điểm cụ thể ('2020').",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la28-1",
      audio_text: "I have been studying English for three years.",
      prompt_vn: "Tôi đã học tiếng Anh được ba năm.",
      words: [
        "I",
        "have",
        "been",
        "studying",
        "English",
        "for",
        "three",
        "years",
        ".",
        "since",
        "learned",
      ],
      answer: "I have been studying English for three years .",
    },
    {
      id: "la28-2",
      audio_text: "She has lived here since two thousand and twenty.",
      prompt_vn: "Cô ấy đã sống ở đây từ năm 2020.",
      words: [
        "She",
        "has",
        "lived",
        "here",
        "since",
        "two",
        "thousand",
        "and",
        "twenty",
        ".",
        "for",
        "been",
      ],
      answer: "She has lived here since two thousand and twenty .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi đã học tiếng Anh được sáu tháng.",
      words: [
        "I've",
        "been",
        "studying",
        "English",
        "for",
        "six",
        "months",
        ".",
        "would",
        "could",
      ],
      answer: "I've been studying English for six months .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy đã hướng dẫn nhân viên trẻ được ba năm.",
      words: [
        "She",
        "has",
        "been",
        "mentoring",
        "junior",
        "staff",
        "for",
        "three",
        "years",
        ".",
        "would",
        "could",
      ],
      answer: "She has been mentoring junior staff for three years .",
    },
    {
      id: "wb3",
      prompt_vn: "Nhóm đã phát triển hệ thống mới từ tháng Ba.",
      words: [
        "The",
        "team",
        "has",
        "been",
        "developing",
        "the",
        "new",
        "system",
        "since",
        "March",
        ".",
        "would",
        "could",
      ],
      answer: "The team has been developing the new system since March .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s28-1",
      prompt_vn: "Tôi đã học tiếng Anh được sáu tháng.",
      words: [
        "I've",
        "been",
        "studying",
        "English",
        "for",
        "six",
        "months",
        ".",
      ],
      answer: "I've been studying English for six months .",
    },
    {
      id: "s28-2",
      prompt_vn: "Cô ấy đã hướng dẫn nhân viên trẻ được ba năm.",
      words: [
        "She",
        "has",
        "been",
        "mentoring",
        "junior",
        "staff",
        "for",
        "three",
        "years",
        ".",
      ],
      answer: "She has been mentoring junior staff for three years .",
    },
    {
      id: "s28-3",
      prompt_vn: "Nhóm đã phát triển hệ thống mới từ tháng Ba.",
      words: [
        "The",
        "team",
        "has",
        "been",
        "developing",
        "the",
        "new",
        "system",
        "since",
        "March",
        ".",
      ],
      answer: "The team has been developing the new system since March .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question: "Dịch: 'Bạn đã làm dự án này bao lâu rồi?'",
      options: [
        "How long did you work on this project?",
        "How long have you been working on this project?",
        "How long are you working on this project?",
        "How long were you working on this project?",
      ],
      answer: "How long have you been working on this project?",
      explanation_vn:
        "Present Perfect Continuous: 'have been working' nhấn mạnh tiến trình đang tiếp diễn, không phải 'did work' hay 'are working'.",
    },
    {
      id: "fq2",
      type: "cloze",
      question:
        "Điền: 'I ___ (practice) every day for three months and my score has improved.'",
      answer: "have been practicing",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question: "Câu nào chuyên nghiệp nhất trong phỏng vấn?",
      options: [
        "I study English for one year.",
        "I've been studying English for one year.",
        "I was studying English for one year.",
        "I studied English for one year.",
      ],
      answer: "I've been studying English for one year.",
      explanation_vn:
        "'I've been studying' (PPC) cho thấy quá trình liên tục đến hiện tại — lựa chọn tốt nhất cho phỏng vấn. 'I study/studied' chỉ đơn giản thực tế.",
    },
    {
      id: "fq4",
      type: "translate",
      question: "Dịch: 'Chúng tôi đã hợp tác với đối tác quốc tế từ năm 2022.'",
      answer:
        "We have been collaborating with international partners since 2022.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question:
        "Phân biệt: 'I've finished the report' vs 'I've been finishing the report' — câu nào đúng hơn khi báo cáo đã hoàn thành?",
      options: [
        "I've been finishing the report",
        "I've finished the report",
        "Both are equal",
        "Neither is correct",
      ],
      answer: "I've finished the report",
      explanation_vn:
        "'I've finished' (PPS) nhấn mạnh KẾT QUẢ (xong rồi). 'I've been finishing' nhấn mạnh quá trình — không phù hợp khi đã hoàn thành.",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "'How long have you lived here?' dùng thì gì?",
      options: [
        "Simple Present",
        "Simple Past",
        "Present Perfect",
        "Past Continuous",
      ],
      answer: "Present Perfect",
    },
    {
      id: "q-ex2",
      type: "cloze",
      question: "Điền: 'I've worked here ___ 3 years.'",
      answer: "for",
    },
    {
      id: "q-ex3",
      type: "multiple-choice",
      question: "'Since' dùng với:",
      options: [
        "Khoảng thời gian",
        "Mốc thời gian cụ thể",
        "Thì quá khứ đơn",
        "Thì hiện tại đơn",
      ],
      answer: "Mốc thời gian cụ thể",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "Câu đúng:",
      options: [
        "I've known her since 5 years.",
        "I've known her for 5 years.",
        "I've known her for 2019.",
        "I've known her since 5 years ago.",
      ],
      answer: "I've known her for 5 years.",
    },
    {
      id: "q-ex5",
      type: "translate",
      question: "Dịch: 'Tôi đã học tiếng Anh được 2 năm.'",
      answer: "I have been learning English for 2 years.",
    },
    {
      id: "q-ex6",
      type: "multiple-choice",
      question: "'It's been ages since I saw him.' nghĩa là:",
      options: [
        "Tôi vừa gặp anh ấy",
        "Đã rất lâu tôi không gặp anh ấy",
        "Tôi thường xuyên gặp anh ấy",
        "Tôi chưa bao giờ gặp anh ấy",
      ],
      answer: "Đã rất lâu tôi không gặp anh ấy",
    },
    {
      id: "q-ex7",
      type: "multiple-choice",
      question: "'For a long time' đi với thì nào nhất?",
      options: [
        "Simple Past chỉ",
        "Present Perfect",
        "Simple Present chỉ",
        "Future Simple chỉ",
      ],
      answer: "Present Perfect",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr28-1",
      question:
        "Ôn tập Unit 27 — 'She ___ the problem in the meeting.' (đề cập)",
      options: ["brought up", "brought on", "set up", "looked into"],
      answer: "brought up",
      type: "multiple-choice",
    },
    {
      id: "cr28-2",
      question:
        "Ôn tập Unit 26 — Điền: 'I ___ (consider) changing my approach.'",
      options: [],
      answer: "am considering",
      type: "cloze",
    },
    {
      id: "cr28-3",
      question:
        "Ôn tập Unit 25 — Relative pronoun đúng: 'Tom, ___ portfolio includes Fortune 500 clients, works remotely.'",
      options: ["who", "which", "whose", "where"],
      answer: "whose",
      type: "multiple-choice",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "for /fɔːr/ vs /fər/",
    description: "For trong present perfect — dạng mạnh /fɔːr/ và yếu /fər/",
    examples: [
      {
        word: "for (mạnh)",
        ipa: "/fɔːr/",
        tip: "Khi nhấn: FOR three years! — âm /ɔː/ dài, rõ",
      },
      {
        word: "for (yếu)",
        ipa: "/fər/",
        tip: "Trong câu: I've lived here for 5 years — /fər/ schwa, rất nhẹ",
      },
    ],
    minimalPairs: [["for /fɔːr/ (mạnh)", "for /fər/ (yếu trong câu)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      {
        en: "I've been studying English for six months",
        vn: "Tôi đã học tiếng Anh được sáu tháng",
      },
      {
        en: "She's been working on the project since January",
        vn: "Cô ấy đã làm dự án từ tháng Một",
      },
      {
        en: "How long have you been learning to code?",
        vn: "Bạn đã học lập trình được bao lâu rồi?",
      },
      {
        en: "We've been collaborating with partners globally",
        vn: "Chúng tôi đã hợp tác với các đối tác toàn cầu",
      },
      {
        en: "I've been making steady progress every week",
        vn: "Tôi đã tiến triển đều đặn mỗi tuần",
      },
      {
        en: "Has the team been facing any challenges?",
        vn: "Nhóm có gặp phải thách thức nào không?",
      },
      {
        en: "I've been dedicating two hours a day to preparation",
        vn: "Tôi đã dành hai tiếng mỗi ngày để chuẩn bị",
      },
      {
        en: "She's been consistently achieving high scores",
        vn: "Cô ấy đã đạt điểm cao một cách nhất quán",
      },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit28-reading-1",
    title: "A Passion for Teaching",
    title_vn: "Đọc đoạn về Present Perfect Continuous",
    level: "B1" as const,
    text:
      "My name is Mai and I have been teaching English for twelve years. " +
      "I started at a small language centre in Da Nang, and I have been working there ever since. " +
      "Over the years, my teaching style has changed a lot. " +
      "For the past three years, I have been using more technology in my lessons. " +
      "My students have been making excellent progress since we switched to online platforms. " +
      "I have been developing new materials for Vietnamese adult learners recently. " +
      "It has taken a lot of time and research, but the results are very rewarding. " +
      "How long have you been learning English? " +
      "Whether you have been studying for six months or six years, " +
      "the important thing is to keep practising consistently. " +
      "I have been dreaming of writing a teaching book for years — and I am finally starting this month!",
    questions: [
      {
        id: "u28r-q1",
        question_vn: "Mai đã dạy tiếng Anh được bao lâu?",
        options: ["Five years", "Eight years", "Twelve years", "Fifteen years"],
        answer: "Twelve years",
        explanation_vn: "'I have been teaching English for twelve years.'",
      },
      {
        id: "u28r-q2",
        question_vn:
          "Mai đã sử dụng công nghệ nhiều hơn trong giảng dạy từ khi nào?",
        options: [
          "For the past one year",
          "For the past three years",
          "For the past five years",
          "Since she started teaching",
        ],
        answer: "For the past three years",
        explanation_vn:
          "'For the past three years, I have been using more technology in my lessons.'",
      },
      {
        id: "u28r-q3",
        question_vn: "Theo Mai, điều quan trọng nhất khi học tiếng Anh là gì?",
        options: [
          "Studying with a native teacher",
          "Using only online platforms",
          "Keeping practising consistently",
          "Learning grammar rules first",
        ],
        answer: "Keeping practising consistently",
        explanation_vn:
          "'the important thing is to keep practising consistently.'",
      },
      {
        id: "u28r-q4",
        question_vn: "Mai có kế hoạch làm gì trong tháng này?",
        options: [
          "Start a new language centre",
          "Travel abroad",
          "Finally start writing a teaching book",
          "Retire from teaching",
        ],
        answer: "Finally start writing a teaching book",
        explanation_vn:
          "'I have been dreaming of writing a teaching book for years — and I am finally starting this month!'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Đàm phán điều khoản hợp đồng với đối tác",
      focus: "Negotiation: propose, counter, compromise, close deal",
      context: "Meeting với vendor hoặc client về giá và timeline",
      l1Note:
        "⚠️ 'We can offer 5% discount if you commit to 12 months.' 'Can we meet in the middle at 8%?'",
      example:
        "If you sign for two years we can reduce the fee by 10%. Shall we finalize today?",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "kSU0P7bRHPo",
};

export default unit28;
