import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-27 — Get Things Done  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit27: UnitData = {
  unitId: "unit-27",
  title: "Unit 27: Get Things Done",
  level: "B1",
  xp: 100,
  estimatedTime: 55,
  description:
    "Nắm 20 phrasal verbs thiết yếu nhất trong tiếng Anh công sở — look up, give up, carry out, deal with. Không có phrasal verbs → tiếng Anh nghe như robot.",
  badgeName: "Chuyên Gia Hành Động",
  badgeEmoji: "⚡",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Sếp nhắn: 'Can you look into the issue, sort it out, and follow up with the client?' Bạn hiểu không? Nếu không biết phrasal verbs, bạn bỏ lỡ 40% nội dung giao tiếp hàng ngày trong môi trường quốc tế.",
  learningOutcomes: [
    "Nhận biết và hiểu 20 phrasal verbs thiết yếu nhất trong công việc",
    "Dùng phrasal verbs tự nhiên trong email, cuộc họp và giao tiếp hàng ngày",
    "Phân biệt separable vs inseparable phrasal verbs",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Người bản ngữ dùng phrasal verbs <span class="text-primary font-semibold">liên tục</span> — thay vì nói <span class="text-muted-foreground">"investigate"</span>, họ nói <span class="text-primary">"look into"</span>. Thay vì <span class="text-muted-foreground">"continue"</span>, họ nói <span class="text-primary">"carry on"</span>. Không học phrasal verbs → tiếng Anh của bạn nghe formal quá mức, cứng nhắc, không tự nhiên.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🔍",
      en: "Can you look into this issue and get back to me by Friday?",
      vn: "Bạn có thể điều tra vấn đề này và phản hồi lại tôi trước thứ Sáu không?",
      context: "look into = investigate | get back to = respond",
    },
    {
      emoji: "✅",
      en: "I'll carry out the tests and sort out any problems.",
      vn: "Tôi sẽ thực hiện các bài kiểm tra và giải quyết mọi vấn đề.",
      context: "carry out = perform | sort out = resolve",
    },
    {
      emoji: "📞",
      en: "Please follow up with the client and find out their timeline.",
      vn: "Vui lòng theo dõi với khách hàng và tìm hiểu tiến độ của họ.",
      context: "follow up = check progress | find out = discover",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "look into",
      emoji: "🔍",
      phonetic: "/lʊk ˈɪntə/",
      meaning: "điều tra / xem xét",
      example: "Can you look into why the sales dropped this month?",
      example2: "I'll look into the technical issue and report back.",
      collocation: "look into a problem / look into the matter",
      audio: "/audio/unit-27/look_into.mp3",
    },
    {
      id: 2,
      word: "carry out",
      emoji: "✅",
      phonetic: "/ˈkæri aʊt/",
      meaning: "thực hiện / tiến hành",
      example: "We need to carry out a full audit of the system.",
      example2: "The tests were carried out successfully.",
      collocation:
        "carry out research / carry out a task / carry out an investigation",
      audio: "/audio/unit-27/carry_out.mp3",
      l1_interference_vn:
        "⚠️ = thực hiện. \'Carry out a plan\' / \'carry the plan out\'. Không tách được với pronoun.",
    },
    {
      id: 3,
      word: "sort out",
      emoji: "🔧",
      phonetic: "/sɔːt aʊt/",
      meaning: "giải quyết / sắp xếp",
      example: "I'll sort out the scheduling conflict before the meeting.",
      example2: "Can you sort out the billing issue with the client?",
      collocation: "sort out a problem / sort things out",
      audio: "/audio/unit-27/sort_out.mp3",
      l1_interference_vn:
        "⚠️ = giải quyết (informal). \'Sort it out\' (không phải \'sort out it\').",
    },
    {
      id: 4,
      word: "follow up",
      emoji: "📞",
      phonetic: "/ˈfɒləʊ ʌp/",
      meaning: "theo dõi / tiếp nối",
      example: "Please follow up with the client to confirm the meeting.",
      example2: "I'll follow up on the proposal by email.",
      collocation: "follow up on / send a follow-up / follow-up meeting",
      audio: "/audio/unit-27/follow_up.mp3",
    },
    {
      id: 5,
      word: "find out",
      emoji: "💡",
      phonetic: "/faɪnd aʊt/",
      meaning: "tìm hiểu / phát hiện",
      example: "Can you find out when the report will be ready?",
      example2: "I found out that the deadline has been moved.",
      collocation: "find out the truth / find out more / find out if",
      audio: "/audio/unit-27/find_out.mp3",
    },
    {
      id: 6,
      word: "set up",
      emoji: "🛠️",
      phonetic: "/set ʌp/",
      meaning: "thiết lập / thành lập",
      example: "Can you set up a meeting for Thursday afternoon?",
      example2: "We set up a new project management system.",
      collocation: "set up a meeting / set up a system / set up a business",
      audio: "/audio/unit-27/set_up.mp3",
      l1_interference_vn:
        "⚠️ Phrasal verb: object pronoun đứng giữa: \'set it up\' (không phải \'set up it\').",
    },
    {
      id: 7,
      word: "deal with",
      emoji: "🤝",
      phonetic: "/diːl wɪð/",
      meaning: "xử lý / giải quyết",
      example: "How do you usually deal with difficult clients?",
      example2: "She dealt with the complaint professionally.",
      collocation:
        "deal with a problem / deal with pressure / hard to deal with",
      audio: "/audio/unit-27/deal_with.mp3",
      l1_interference_vn:
        "⚠️ Không tách được: \'deal with the problem\' (không phải \'deal the problem with\').",
    },
    {
      id: 8,
      word: "give up",
      emoji: "🏳️",
      phonetic: "/ɡɪv ʌp/",
      meaning: "từ bỏ",
      example: "Don't give up on the project — we're almost there.",
      example2: "She gave up trying to fix the old system.",
      collocation: "give up on / never give up / give up a habit",
      audio: "/audio/unit-27/give_up.mp3",
    },
    {
      id: 9,
      word: "put off",
      emoji: "⏰",
      phonetic: "/pʊt ɒf/",
      meaning: "hoãn lại",
      example: "Let's not put off the decision any longer.",
      example2: "The meeting was put off until next week.",
      collocation: "put off a meeting / put things off / stop putting off",
      audio: "/audio/unit-27/put_off.mp3",
      l1_interference_vn:
        "⚠️ \'Put off + V-ING\': \'keep putting off studying\'. Không phải \'put off to study\'.",
    },
    {
      id: 10,
      word: "bring up",
      emoji: "🗣️",
      phonetic: "/brɪŋ ʌp/",
      meaning: "đề cập / nêu lên",
      example: "I need to bring up the budget issue in tomorrow's meeting.",
      example2: "She brought up some concerns about the timeline.",
      collocation: "bring up a topic / bring up a concern / bring it up",
      audio: "/audio/unit-27/bring_up.mp3",
      l1_interference_vn:
        "⚠️ = đề cập (họp) hoặc nuôi dạy con cái. Object pronoun đứng giữa: \'bring it up\'.",
    },
    {
      id: 11,
      word: "take on",
      emoji: "💪",
      phonetic: "/teɪk ɒn/",
      meaning: "đảm nhận / tiếp nhận",
      example: "Are you willing to take on the project manager role?",
      example2: "We took on three new clients this quarter.",
      collocation: "take on responsibility / take on a project / take on staff",
      audio: "/audio/unit-27/take_on.mp3",
      l1_interference_vn:
        "⚠️ Hai nghĩa: (1) đảm nhận trách nhiệm, (2) tuyển dụng \'take on new staff\'. Phân biệt ngữ cảnh.",
    },
    {
      id: 12,
      word: "hand in",
      emoji: "📤",
      phonetic: "/hænd ɪn/",
      meaning: "nộp / giao nộp",
      example: "Please hand in your report by 5pm today.",
      example2: "She handed in her resignation yesterday.",
      collocation: "hand in a report / hand in your notice / hand in work",
      audio: "/audio/unit-27/hand_in.mp3",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Cuộc họp giao việc",
      audio: "/audio/unit-27/dialogue_1.mp3",
      desc: "Sếp giao việc và nhân viên dùng phrasal verbs để phản hồi.",
      lines: [
        {
          id: "d1-1",
          speaker: "Manager",
          text: "Minh, can you look into the client complaint we received? Find out what went wrong.",
          translation:
            "Minh, bạn có thể điều tra khiếu nại của khách hàng chúng tôi nhận được không? Tìm hiểu điều gì đã xảy ra.",
        },
        {
          id: "d1-2",
          speaker: "Minh",
          text: "Of course. I'll sort it out right away. Should I follow up with the client directly?",
          translation:
            "Được chứ. Tôi sẽ giải quyết ngay lập tức. Tôi có nên theo dõi trực tiếp với khách hàng không?",
        },
        {
          id: "d1-3",
          speaker: "Manager",
          text: "Yes, please. And set up a call for this Friday. Don't put it off — they're expecting a response.",
          translation:
            "Vâng. Và thiết lập một cuộc gọi vào thứ Sáu này. Đừng hoãn lại — họ đang chờ phản hồi.",
        },
        {
          id: "d1-4",
          speaker: "Minh",
          text: "Understood. I'll also bring up the issue in our team meeting so everyone knows.",
          translation:
            "Hiểu rồi. Tôi cũng sẽ đề cập vấn đề trong cuộc họp nhóm để mọi người đều biết.",
        },
        {
          id: "d1-5",
          speaker: "Manager",
          text: "Good thinking. Can you take on the lead for this?",
          translation:
            "Suy nghĩ hay đấy. Bạn có thể đảm nhận vị trí phụ trách cho việc này không?",
        },
        {
          id: "d1-6",
          speaker: "Minh",
          text: "Absolutely. I'll carry out a full review and hand in a report by Thursday.",
          translation:
            "Chắc chắn. Tôi sẽ thực hiện đánh giá toàn diện và nộp báo cáo trước thứ Năm.",
        },
      ],
    },
    {
      id: 2,
      title: "Email theo dõi dự án",
      audio: "/audio/unit-27/dialogue_2.mp3",
      desc: "Lan viết email theo dõi tiến độ dự án.",
      lines: [
        {
          id: "d2-1",
          speaker: "Lan",
          text: "Hi Tom, I'm following up on the project status. Have you found out the new delivery date?",
          translation:
            "Chào Tom, tôi đang theo dõi tình trạng dự án. Bạn đã tìm hiểu ngày giao hàng mới chưa?",
        },
        {
          id: "d2-2",
          speaker: "Tom",
          text: "Hi Lan, I've looked into it. The team is carrying out the final tests now. We should be done by Wednesday.",
          translation:
            "Chào Lan, tôi đã điều tra rồi. Nhóm đang thực hiện các bài kiểm tra cuối cùng bây giờ. Chúng tôi sẽ xong trước thứ Tư.",
        },
        {
          id: "d2-3",
          speaker: "Lan",
          text: "Great. I'll set up a call with the client for Thursday then.",
          translation:
            "Tuyệt. Tôi sẽ thiết lập cuộc gọi với khách hàng vào thứ Năm thì.",
        },
        {
          id: "d2-4",
          speaker: "Tom",
          text: "Perfect. Don't forget to bring up the delivery timeline. They've been asking about it.",
          translation:
            "Hoàn hảo. Đừng quên đề cập tiến độ giao hàng. Họ đã hỏi về nó rồi.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "Can you look into the client complaint we received",
      options: [
        "Can you look at the client complaint we received",
        "Can you look into the client complaint we received",
        "Can you look for the client complaint we received",
        "Can you look up the client complaint we received",
      ],
      answer: "Can you look into the client complaint we received",
    },
    {
      id: "lac2",
      audio_text: "I'll sort it out right away",
      options: [
        "I'll sort out it right away",
        "I'll sort it out right away",
        "I'll sort out right away",
        "I'll sorting it out right away",
      ],
      answer: "I'll sort it out right away",
    },
    {
      id: "lac3",
      audio_text: "Please set up a call for Friday and don't put it off",
      options: [
        "Please set a call for Friday and don't put it off",
        "Please set up a call for Friday and don't put it off",
        "Please setup a call for Friday and don't put it off",
        "Please set up a call for Friday and don't putting it off",
      ],
      answer: "Please set up a call for Friday and don't put it off",
    },
    {
      id: "lac4",
      audio_text: "I'll hand in the report by Thursday",
      options: [
        "I'll hand the report in by Thursday",
        "I'll hand in the report by Thursday",
        "I'll handing in the report by Thursday",
        "Both A and B are correct",
      ],
      answer: "Both A and B are correct",
    },
    {
      id: "lac5",
      audio_text: "She brought up the budget issue in the meeting",
      options: [
        "She brought the budget issue up in the meeting",
        "She brought up the budget issue in the meeting",
        "She bring up the budget issue in the meeting",
        "Both A and B are correct",
      ],
      answer: "Both A and B are correct",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt:
      "At work, I often need to {input} and {input}. When problems arise, I always try to {input}.",
    level1Placeholder:
      "Ví dụ: follow up with clients — set up meetings — sort things out quickly...",
    level2Situation:
      "Mô tả một ngày làm việc điển hình bằng phrasal verbs. Bao gồm ít nhất 8 phrasal verbs từ bài học. Kể về: buổi sáng (set up, carry out), vấn đề xảy ra (sort out, deal with), và cuối ngày (hand in, follow up).",
    level2Hint:
      "In the morning, I [set up / carry out]. I had to [deal with / sort out] [issue]. Then I [followed up / found out]. By the end of the day, I [handed in / brought up]. I never [give up / put off] important tasks.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Phrasal Verbs — Tách Được & Không Tách Được",
    rule: "SEPARABLE (có thể tách): Object có thể đứng giữa hoặc sau\n→ 'Sort OUT the problem' = 'Sort the problem OUT'\n→ Nếu object là đại từ (it/them) → PHẢI đứng giữa:\n  ✅ 'Sort IT out' ❌ 'Sort out IT'\n\nINSEPARABLE (không thể tách): Object LUÔN đứng sau\n→ 'Look INTO the issue' (✅)\n→ 'Look the issue into' (❌)\n\nINSEPARABLE: look into, deal with, get back to, carry out, find out, go through",
    examples: [
      {
        en: "Can you sort out the problem? / Can you sort it out? (separable)",
        vn: "Bạn có thể giải quyết vấn đề không? / Bạn có thể giải quyết nó không?",
      },
      {
        en: "Please look into the complaint. (inseparable — cannot say 'look the complaint into')",
        vn: "Vui lòng điều tra khiếu nại.",
      },
      {
        en: "I need to hand in the report. / I need to hand it in. (separable)",
        vn: "Tôi cần nộp báo cáo. / Tôi cần nộp nó.",
      },
    ],
    tip: "Khi dùng pronoun (it/them): 'Sort it out' ✅ 'Sort out it' ❌. Với danh từ đầy đủ: cả hai thường OK. Với inseparable: không tách được dù là pronoun hay danh từ.",
    vnNote:
      "⚠️ Lưu ý người Việt: Tiếng Việt không có phrasal verbs. Với người học Việt, cách tốt nhất là học từng phrasal verb như một từ vựng riêng biệt — ghi nhớ nghĩa và cách dùng của nó như một khối.",
    dialogueExample: {
      speaker: "Minh",
      text: "I'll look into it, sort it out, follow up with the client, and hand in the report by Thursday.",
      translation:
        "Tôi sẽ điều tra, giải quyết, theo dõi với khách hàng, và nộp báo cáo trước thứ Năm.",
      highlight:
        "look into (inseparable) | sort it out (separable — pronoun must go between) | follow up | hand in",
    },
    ccq: {
      question: "Câu nào dùng phrasal verb ĐÚNG với đại từ?",
      options: [
        "Please sort out it.",
        "Please sort it out.",
        "Please look it into.",
        "Please find it out immediately.",
      ],
      answer: "Please sort it out.",
      explanation:
        "Với separable phrasal verb + pronoun → pronoun PHẢI đứng giữa: 'sort IT out' ✅. 'look into' là inseparable → không thể tách: 'look it into' ❌.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question: "Chọn phrasal verb đúng: 'Can you ___ why the system crashed?'",
      options: ["look into", "look up", "look at", "look for"],
      answer: "look into",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question: "Đúng với pronoun: 'The problem is urgent. Please sort ___.'",
      options: ["out it", "it out", "it up", "out them"],
      answer: "it out",
    },
    {
      id: "pq3",
      type: "cloze",
      question: "Điền: 'I'll ___ a meeting for next Monday.' (thiết lập)",
      answer: "set up",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "'Please ___ your assignment by 5pm.' (nộp bài)",
      options: ["hand in", "hand out", "hand over", "hand up"],
      answer: "hand in",
    },
    {
      id: "pq5",
      type: "multiple-choice",
      question:
        "Nghĩa của 'bring up': 'She brought up a concern in the meeting.'",
      options: ["mang đến", "đề cập / nêu lên", "tăng lên", "giới thiệu"],
      answer: "đề cập / nêu lên",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối phrasal verb với nghĩa đúng",
    pairs: [
      { left: "deal with", right: "xử lý / giải quyết" },
      { left: "put off", right: "hoãn lại" },
      { left: "take on", right: "đảm nhận" },
      { left: "give up", right: "từ bỏ" },
      { left: "find out", right: "tìm hiểu / phát hiện" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Tôi sẽ theo dõi với khách hàng và tìm hiểu tiến độ của họ.",
      answer: "I'll follow up with the client and find out their timeline.",
    },
    {
      id: "pt-2",
      prompt_vn: "Chúng tôi sẽ điều tra vấn đề và sắp xếp giải pháp.",
      answer: "We will look into the issue and sort out a solution.",
    },
    {
      id: "pt-3",
      prompt_vn: "Họ đã thiết lập một quy trình mới để thực hiện dự án.",
      answer: "They set up a new process to carry out the project.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc27-1",
      sentence: "I have my hair cut yesterday.",
      errorWord: "have",
      correction: "had",
      explanation_vn:
        "Causative với thời gian quá khứ phải dùng 'had': 'I had my hair cut yesterday'.",
    },
    {
      id: "sc27-2",
      sentence: "She get her car repaired every month.",
      errorWord: "get",
      correction: "gets",
      explanation_vn:
        "Chủ ngữ 'She' (ngôi 3 số ít) cần thêm '-s': 'gets her car repaired'.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la27-1",
      audio_text: "I had my hair cut at the salon.",
      prompt_vn: "Tôi đã cắt tóc tại tiệm.",
      words: [
        "I",
        "had",
        "my",
        "hair",
        "cut",
        "at",
        "the",
        "salon",
        ".",
        "get",
        "done",
      ],
      answer: "I had my hair cut at the salon .",
    },
    {
      id: "la27-2",
      audio_text: "She got her car repaired last week.",
      prompt_vn: "Cô ấy đã sửa xe tuần trước.",
      words: [
        "She",
        "got",
        "her",
        "car",
        "repaired",
        "last",
        "week",
        ".",
        "had",
        "fixed",
      ],
      answer: "She got her car repaired last week .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Bạn có thể điều tra vấn đề này không?",
      words: [
        "Can",
        "you",
        "look",
        "into",
        "this",
        "issue",
        "?",
        "would",
        "could",
      ],
      answer: "Can you look into this issue ?",
    },
    {
      id: "wb2",
      prompt_vn: "Tôi sẽ thiết lập cuộc họp và không hoãn nó lại.",
      words: [
        "I",
        "will",
        "set",
        "up",
        "the",
        "meeting",
        "and",
        "not",
        "put",
        "it",
        "off",
        ".",
        "would",
        "could",
      ],
      answer: "I will set up the meeting and not put it off .",
    },
    {
      id: "wb3",
      prompt_vn: "Cô ấy đảm nhận dự án và nộp báo cáo trước thứ Năm.",
      words: [
        "She",
        "took",
        "on",
        "the",
        "project",
        "and",
        "handed",
        "in",
        "the",
        "report",
        "by",
        "Thursday",
        ".",
        "would",
        "could",
      ],
      answer: "She took on the project and handed in the report by Thursday .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s27-1",
      prompt_vn: "Bạn có thể điều tra vấn đề này không?",
      words: ["Can", "you", "look", "into", "this", "issue", "?"],
      answer: "Can you look into this issue ?",
    },
    {
      id: "s27-2",
      prompt_vn: "Tôi sẽ thiết lập cuộc họp và không hoãn nó lại.",
      words: [
        "I",
        "will",
        "set",
        "up",
        "the",
        "meeting",
        "and",
        "not",
        "put",
        "it",
        "off",
        ".",
      ],
      answer: "I will set up the meeting and not put it off .",
    },
    {
      id: "s27-3",
      prompt_vn: "Cô ấy đảm nhận dự án và nộp báo cáo trước thứ Năm.",
      words: [
        "She",
        "took",
        "on",
        "the",
        "project",
        "and",
        "handed",
        "in",
        "the",
        "report",
        "by",
        "Thursday",
        ".",
      ],
      answer: "She took on the project and handed in the report by Thursday .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question:
        "Dịch: 'Tôi sẽ theo dõi với khách hàng và tìm hiểu tiến độ của họ.'",
      options: [
        "I'll follow with the client and find their timeline.",
        "I'll follow up with the client and find out their timeline.",
        "I'll follow up with the client and find their timeline out.",
        "I'll follow the client and find out their timeline.",
      ],
      answer: "I'll follow up with the client and find out their timeline.",
      explanation_vn:
        "'follow up with' = theo dõi; 'find out' = tìm hiểu — cả hai là phrasal verb inseparable đúng chuẩn.",
    },
    {
      id: "fq2",
      type: "cloze",
      question:
        "Điền: 'Don't ___ the decision. We need to ___ it ___ today.' (đừng hoãn / giải quyết)",
      answer: "put off / sort / out",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question:
        "Câu nào dùng phrasal verb tự nhiên nhất trong email công việc?",
      options: [
        "Please investigate the matter and contact me.",
        "Please look into the matter and get back to me.",
        "Please check the matter and reply to me.",
        "Please see the matter and answer me.",
      ],
      answer: "Please look into the matter and get back to me.",
      explanation_vn:
        "'look into' (điều tra) và 'get back to' (phản hồi) là phrasal verb chuẩn trong email; 'investigate/contact/check/reply' quá formal hoặc ít tự nhiên hơn.",
    },
    {
      id: "fq4",
      type: "translate",
      question: "Dịch: 'Cô ấy đề cập vấn đề ngân sách và đề xuất hoãn dự án.'",
      answer:
        "She brought up the budget issue and suggested putting off the project.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question: "Separable phrasal verb với pronoun ĐÚNG:",
      options: [
        "Please sort out it.",
        "Please sort it out.",
        "Please look the issue into.",
        "Please find out it.",
      ],
      answer: "Please sort it out.",
      explanation_vn:
        "Với separable phrasal verb + pronoun, pronoun PHẢI đứng giữa: 'sort IT out'. 'Sort out it' và 'find out it' sai; 'look into' inseparable.",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "Causative 'have + object + V3' nghĩa là:",
      options: ["Tự làm", "Nhờ/thuê người khác làm", "Sắp làm", "Vừa làm xong"],
      answer: "Nhờ/thuê người khác làm",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "Câu causative đúng:",
      options: [
        "I had cut my hair.",
        "I had my hair cut.",
        "I had my hair cutting.",
        "I had my hair to cut.",
      ],
      answer: "I had my hair cut.",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền: 'She got her car ___.'",
      answer: "repaired",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "'Have' vs 'get' trong causative:",
      options: [
        "'Have' trang trọng hơn 'get'",
        "'Get' trang trọng hơn 'have'",
        "Giống nhau hoàn toàn",
        "'Get' chỉ dùng với người",
      ],
      answer: "'Have' trang trọng hơn 'get'",
    },
    {
      id: "q-ex5",
      type: "translate",
      question: "Dịch: 'Tôi sẽ nhờ thợ sửa máy lạnh.'",
      answer: "I'll have the technician fix the air conditioner.",
    },
    {
      id: "q-ex6",
      type: "multiple-choice",
      question: "'Make someone do': cấu trúc đúng:",
      options: [
        "make + obj + to-inf",
        "make + obj + V-ing",
        "make + obj + bare inf",
        "make + obj + V3",
      ],
      answer: "make + obj + bare inf",
    },
    {
      id: "q-ex7",
      type: "multiple-choice",
      question: "'I got my phone stolen.' nghĩa là:",
      options: [
        "Tôi đã lấy cắp điện thoại",
        "Điện thoại của tôi bị lấy cắp",
        "Tôi đã mua điện thoại",
        "Tôi tìm được điện thoại",
      ],
      answer: "Điện thoại của tôi bị lấy cắp",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr27-1",
      question: "Ôn tập Unit 26 — Đúng: 'I suggest ___ a new approach.'",
      options: ["to try", "trying", "try", "to trying"],
      answer: "trying",
      type: "multiple-choice",
    },
    {
      id: "cr27-2",
      question:
        "Ôn tập Unit 25 — Điền: 'She is the specialist ___ designed our system.'",
      options: [],
      answer: "who",
      type: "cloze",
    },
    {
      id: "cr27-3",
      question:
        "Ôn tập Unit 24 — Passive đúng: 'The report ___ (submit) before 5pm.'",
      options: ["was submitted", "submitted", "is submitting", "submits"],
      answer: "was submitted",
      type: "multiple-choice",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "causative tone",
    description:
      "Causative have — stress pattern khi là causative khác với have thông thường",
    examples: [
      {
        word: "have (causative)",
        ipa: "/hæv/",
        tip: "I'll HAVE it fixed — have nhấn mạnh hơn khi là causative",
      },
      {
        word: "get",
        ipa: "/ɡɛt/",
        tip: "Get it done — get thường nhẹ hơn have trong causative",
      },
    ],
    minimalPairs: [["have it fixed (nhờ)", "fix it yourself (tự làm)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      {
        en: "Can you look into this and get back to me?",
        vn: "Bạn có thể điều tra cái này và phản hồi lại tôi không?",
      },
      {
        en: "I'll sort it out before the end of the day",
        vn: "Tôi sẽ giải quyết nó trước cuối ngày",
      },
      {
        en: "Please follow up with the client on Friday",
        vn: "Vui lòng theo dõi với khách hàng vào thứ Sáu",
      },
      {
        en: "Let's not put off the decision any longer",
        vn: "Hãy đừng hoãn quyết định này thêm nữa",
      },
      {
        en: "She took on three new projects this quarter",
        vn: "Cô ấy đảm nhận ba dự án mới trong quý này",
      },
      {
        en: "I need to hand in the report by Thursday",
        vn: "Tôi cần nộp báo cáo trước thứ Năm",
      },
      {
        en: "Can you deal with the complaint professionally?",
        vn: "Bạn có thể xử lý khiếu nại một cách chuyên nghiệp không?",
      },
      {
        en: "I'll bring up the budget issue in tomorrow's meeting",
        vn: "Tôi sẽ đề cập vấn đề ngân sách trong cuộc họp ngày mai",
      },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit27-reading-1",
    title: "Getting Things Done at Work",
    title_vn: "Đọc đoạn về phrasal verbs nơi làm việc",
    level: "B1" as const,
    text:
      "Managing a busy workload requires strong organisational skills. " +
      "Every Monday, I set up my priorities for the week and write them in my planner. " +
      "I always try to carry out the most important tasks first thing in the morning. " +
      "When I come across a problem I can't solve alone, I ask a colleague for support. " +
      "Last week, I had to deal with a difficult client complaint. " +
      "I called the client and sorted it out within two hours. " +
      "Sometimes, projects don't go according to plan. " +
      "When that happens, you need to figure out what went wrong and come up with a solution quickly. " +
      "I also make sure to follow up on any emails I send so nothing gets forgotten. " +
      "At the end of each day, I write down what I have achieved. " +
      "This helps me feel accomplished and ready to take on the next day.",
    questions: [
      {
        id: "u27r-q1",
        question_vn: "Người kể chuyện làm gì đầu tiên vào mỗi sáng thứ Hai?",
        options: [
          "Check emails",
          "Set up priorities for the week",
          "Have a team meeting",
          "Call clients",
        ],
        answer: "Set up priorities for the week",
        explanation_vn: "'Every Monday, I set up my priorities for the week.'",
      },
      {
        id: "u27r-q2",
        question_vn: "Tuần trước, người kể chuyện phải giải quyết vấn đề gì?",
        options: [
          "A technical computer issue",
          "A difficult client complaint",
          "A budget problem",
          "A project deadline",
        ],
        answer: "A difficult client complaint",
        explanation_vn:
          "'Last week, I had to deal with a difficult client complaint.'",
      },
      {
        id: "u27r-q3",
        question_vn:
          "Người kể chuyện giải quyết khiếu nại của khách hàng trong bao lâu?",
        options: ["30 minutes", "One hour", "Two hours", "One day"],
        answer: "Two hours",
        explanation_vn:
          "'I called the client and sorted it out within two hours.'",
      },
      {
        id: "u27r-q4",
        question_vn:
          "Tại sao người kể chuyện viết ra những gì họ đã hoàn thành cuối ngày?",
        options: [
          "To send to their manager",
          "To feel accomplished and ready for the next day",
          "To update the company database",
          "To calculate overtime hours",
        ],
        answer: "To feel accomplished and ready for the next day",
        explanation_vn:
          "'This helps me feel accomplished and ready to take on the next day.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Delegating tasks in team meeting",
      focus: "causative/get things done at work",
      context: "manager assigns to staff",
      l1Note:
        "⚠️ 'Have/get something done' – causative. Người VN hay dùng active 'I do it' thay vì 'I have it done'.",
      example:
        "I had the report prepared by the team. We got the project finished on time.",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "ZiQpOt7R3r8",
};

export default unit27;
