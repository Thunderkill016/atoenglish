import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-32 — B1 Review & Mock Test  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit32: UnitData = {
  unitId: "unit-32",
  title: "Unit 32: B1 Review & Mock Test",
  level: "B1",
  xp: 150,
  estimatedTime: 70,
  description:
    "B1 Complete — Ôn tập toàn diện ngữ pháp, từ vựng B1 và thực hành bài thi thử IELTS/TOEIC cấp độ B1. Đánh giá năng lực trước khi tiến lên cấp độ B2.",
  badgeName: "Tốt Nghiệp B1",
  badgeEmoji: "🎓",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn tham gia buổi đánh giá năng lực cuối cấp độ B1 với giáo viên bản ngữ. Bạn cần kết hợp tất cả các thì và cấu trúc đã học ở B1 (quá khứ tiếp diễn, quá khứ hoàn thành, tương lai hoàn thành, thể bị động, mệnh đề quan hệ, danh động từ, hiện tại hoàn thành tiếp diễn) để thảo luận về học tập và công việc.",
  learningOutcomes: [
    "Tổng hợp và vận dụng thành thạo toàn bộ ngữ pháp B1 trong giao tiếp",
    "Làm quen với cấu trúc bài thi IELTS Speaking Part 3 và TOEIC Reading Part 5/6",
    "Đánh giá và xác nhận trình độ tương đương B1 (IELTS ~5.0 / TOEIC ~500)",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Ở cấp độ B1+, người học cần chú ý đến <span class="text-primary font-semibold">"Coherence and Cohesion"</span> (sự mạch lạc và liên kết). Hãy sử dụng các từ nối như <span class="text-primary">"However"</span>, <span class="text-primary">"Therefore"</span>, <span class="text-primary">"Consequently"</span> để liên kết các ý của bạn khi trả lời các câu hỏi mở, giúp bài nói trôi chảy và chuyên nghiệp hơn.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "📊",
      en: "I've been preparing for this B1 assessment all week.",
      vn: "Tôi đã chuẩn bị cho buổi đánh giá B1 này suốt cả tuần.",
      context: "have been preparing — Present Perfect Continuous",
    },
    {
      emoji: "🚀",
      en: "By next month, I will have started my B2 curriculum.",
      vn: "Trước tháng tới, tôi sẽ đã bắt đầu chương trình học B2.",
      context: "will have started — Future Perfect",
    },
    {
      emoji: "💡",
      en: "It is essential to review all B1 lessons systematically.",
      vn: "Việc ôn tập tất cả các bài học B1 một cách hệ thống là rất thiết yếu.",
      context: "It is essential to + V — cấu trúc giả định",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "accumulate",
      review: true,
      emoji: "📦",
      phonetic: "/əˈkjuːmjuleɪt/",
      meaning: "tích lũy",
      example: "I have accumulated a lot of vocabulary during B1.",
      example2: "The company has accumulated wealth over the years.",
      collocation: "accumulate knowledge / accumulate experience",
      audio: "/audio/unit-32/accumulate.mp3",
      l1_interference_vn:
        "⚠️ \'Accumulate\' + N: \'accumulate experience/debt\'. Cũng nội động từ: \'Debts accumulate over time.\'",
    },
    {
      id: 2,
      word: "sustainable",
      review: true,
      emoji: "♻️",
      phonetic: "/səˈsteɪnəbəl/",
      meaning: "bền vững",
      example: "We are aiming for a sustainable growth model.",
      example2: "Electric cars are a sustainable option.",
      collocation: "sustainable energy / sustainable development",
      audio: "/audio/unit-32/sustainable.mp3",
      l1_interference_vn:
        "⚠️ Thường trước danh từ: \'sustainable development/energy/growth\'.",
    },
    {
      id: 3,
      word: "recommend",
      review: true,
      emoji: "👍",
      phonetic: "/ˌrekəˈmend/",
      meaning: "khuyến nghị / khuyên",
      example: "I recommend that you review your notes daily.",
      example2: "The doctor recommended taking a rest.",
      collocation: "recommend doing / highly recommend",
      audio: "/audio/unit-32/recommend.mp3",
      l1_interference_vn:
        "⚠️ Sau 'recommend': Ving hoặc that-clause. 'I recommend trying' hoặc 'recommend that you try'.",
    },
    {
      id: 4,
      word: "collaborate",
      review: true,
      emoji: "🤝",
      phonetic: "/kəˈlæbəreɪt/",
      meaning: "cộng tác",
      example: "We need to collaborate to solve this problem.",
      example2: "Two teams collaborated on the research project.",
      collocation: "collaborate with / collaborate on",
      audio: "/audio/unit-32/collaborate.mp3",
    },
    {
      id: 5,
      word: "alternative",
      review: true,
      emoji: "🔄",
      phonetic: "/ɒlˈtɜːnətɪv/",
      meaning: "lựa chọn thay thế",
      example: "We must find an alternative solution immediately.",
      example2: "Solar power is a clean alternative source.",
      collocation: "alternative energy / alternative route",
      audio: "/audio/unit-32/alternative.mp3",
      l1_interference_vn:
        "⚠️ \'Alternative TO\': \'an alternative to driving\'. Giới từ \'to\', không phải \'of\' hay \'for\'.",
    },
    {
      id: 6,
      word: "resolution",
      emoji: "✅",
      phonetic: "/ˌrezəˈluːʃən/",
      meaning: "sự giải quyết / quyết định",
      example: "We are working towards a quick resolution of the conflict.",
      example2: "My New Year's resolution is to master English.",
      collocation: "conflict resolution / make a resolution",
      audio: "/audio/unit-32/resolution.mp3",
    },
    {
      id: 7,
      word: "predict",
      emoji: "🔮",
      phonetic: "/prɪˈdɪkt/",
      meaning: "dự đoán",
      example: "It is difficult to predict the future of the market.",
      example2: "Experts predict that temperatures will rise.",
      collocation: "predict the future / predict results",
      audio: "/audio/unit-32/predict.mp3",
      l1_interference_vn:
        "⚠️ \'Predict THAT...\': \'predict that prices will rise\'. Không dùng \'predict to do\'.",
    },
    {
      id: 8,
      word: "policy",
      review: true,
      emoji: "📜",
      phonetic: "/ˈpɒlɪsi/",
      meaning: "chính sách / quy định",
      example: "Please read the company privacy policy carefully.",
      example2: "The school has a strict mobile phone policy.",
      collocation: "company policy / government policy",
      audio: "/audio/unit-32/policy.mp3",
      l1_interference_vn:
        "⚠️ Đếm được: \'a policy\', \'policies\'. Không nhầm với \'politics\' (chính trị — ngành học).",
    },
    {
      id: 9,
      word: "consensus",
      review: true,
      emoji: "🤝",
      phonetic: "/kənˈsensəs/",
      meaning: "sự đồng thuận / nhất trí",
      example: "The committee reached a consensus on the proposal.",
      example2: "It took hours to build a consensus.",
      collocation: "reach a consensus / lack of consensus",
      audio: "/audio/unit-32/consensus.mp3",
      l1_interference_vn:
        "⚠️ Không đếm được: \'reach a consensus\', \'by consensus\'. Không có \'consensuses\'.",
    },
    {
      id: 10,
      word: "initiative",
      review: true,
      emoji: "🚀",
      phonetic: "/ɪnˈɪʃətɪv/",
      meaning: "sáng kiến / sự chủ động",
      example: "The new digital initiative has been very successful.",
      example2: "You should take the initiative in meetings.",
      collocation: "take the initiative / launch an initiative",
      audio: "/audio/unit-32/initiative.mp3",
    },
    {
      id: 11,
      word: "consequence",
      review: true,
      emoji: "💥",
      phonetic: "/ˈkɒnsɪkwəns/",
      meaning: "hậu quả / hệ quả",
      example: "Global warming has severe environmental consequences.",
      example2: "Every decision has a consequence.",
      collocation: "severe consequences / logical consequence",
      audio: "/audio/unit-32/consequence.mp3",
      l1_interference_vn:
        "⚠️ \'Consequence OF\': \'consequences of climate change\'. Giới từ \'of\', không phải \'from\'.",
    },
    {
      id: 12,
      word: "deal with",
      review: true,
      emoji: "🛠️",
      phonetic: "/diːl wɪð/",
      meaning: "giải quyết / đối phó với",
      example: "She is very good at dealing with difficult clients.",
      example2: "How did you deal with the project delay?",
      collocation: "deal with a problem / deal with pressure",
      audio: "/audio/unit-32/deal_with.mp3",
      l1_interference_vn:
        "⚠️ Không tách được: \'deal with the problem\' (không phải \'deal the problem with\').",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Đánh giá năng lực cuối cấp độ B1",
      audio: "/audio/unit-32/dialogue_1.mp3",
      desc: "Trang tham gia bài phỏng vấn đánh giá năng lực B1 với thầy giáo bản ngữ.",
      lines: [
        {
          id: "d1-1",
          speaker: "Examiner",
          text: "Welcome, Trang. Let's talk about your English learning. How long have you been studying?",
          translation:
            "Chào mừng Trang. Hãy nói về việc học tiếng Anh của bạn. Bạn đã học bao lâu rồi?",
        },
        {
          id: "d1-2",
          speaker: "Trang",
          text: "I've been studying intensively for six months. Before I started, I had never spoken English with a foreigner.",
          translation:
            "Tôi đã học chuyên sâu được sáu tháng. Trước khi tôi bắt đầu, tôi chưa bao giờ nói tiếng Anh với người nước ngoài.",
        },
        {
          id: "d1-3",
          speaker: "Examiner",
          text: "Excellent. What B1 skills have you developed?",
          translation: "Tuyệt vời. Những kỹ năng B1 nào bạn đã phát triển?",
        },
        {
          id: "d1-4",
          speaker: "Trang",
          text: "I've learned to deal with work issues and collaborate with international colleagues. I also recommend sustainable solutions in meetings.",
          translation:
            "Tôi đã học cách giải quyết các vấn đề công việc và cộng tác với đồng nghiệp quốc tế. Tôi cũng đề xuất các giải pháp bền vững trong các cuộc họp.",
        },
        {
          id: "d1-5",
          speaker: "Examiner",
          text: "Very good. What will you have achieved by the end of this year?",
          translation:
            "Rất tốt. Bạn sẽ đã đạt được điều gì trước cuối năm nay?",
        },
        {
          id: "d1-6",
          speaker: "Trang",
          text: "By the end of the year, I will have completed the B2 level and I hope to be completely fluent.",
          translation:
            "Trước cuối năm nay, tôi sẽ đã hoàn thành cấp độ B2 và tôi hy vọng sẽ hoàn toàn thành thạo.",
        },
      ],
    },
    {
      id: 2,
      title: "Đánh giá tiến độ và lập kế hoạch B2",
      audio: "/audio/unit-32/dialogue_2.mp3",
      desc: "Nam và Linh chia sẻ về mục tiêu TOEIC và IELTS sau khi hoàn thành B1.",
      lines: [
        {
          id: "d2-1",
          speaker: "Nam",
          text: "Linh, congratulations on completing B1! What are your target scores now?",
          translation:
            "Linh, chúc mừng bạn đã hoàn thành B1! Điểm số mục tiêu của bạn bây giờ là gì?",
        },
        {
          id: "d2-2",
          speaker: "Linh",
          text: "Thank you! I predict I can achieve IELTS 5.0 now, but my ultimate goal is IELTS 6.5. What about you?",
          translation:
            "Cảm ơn bạn! Tôi dự đoán tôi có thể đạt IELTS 5.0 bây giờ, nhưng mục tiêu cuối cùng của tôi là IELTS 6.5. Còn bạn thì sao?",
        },
        {
          id: "d2-3",
          speaker: "Nam",
          text: "I'm focusing on TOEIC. I need 785 plus for my corporate job. B1 helped me learn how to write formal emails.",
          translation:
            "Tôi đang tập trung vào TOEIC. Tôi cần 785 điểm trở lên cho công việc ở tập đoàn. B1 đã giúp tôi biết cách viết email trang trọng.",
        },
        {
          id: "d2-4",
          speaker: "Linh",
          text: "That's great! Let's continue to collaborate and practice together. B2 grammar will be more challenging.",
          translation:
            "Tuyệt quá! Hãy tiếp tục cộng tác và luyện tập cùng nhau. Ngữ pháp B2 sẽ nhiều thử thách hơn đấy.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "I've been studying intensively for six months.",
      options: [
        "I studied English for six months.",
        "I've been studying intensively for six months.",
        "I am studying English for six months.",
        "I've never studied English for six months.",
      ],
      answer: "I've been studying intensively for six months.",
    },
    {
      id: "lac2",
      audio_text:
        "Before I started, I had never spoken English with a foreigner.",
      options: [
        "Before I started, I had never spoken English with a foreigner.",
        "I spoke to a foreigner before starting English class.",
        "I will speak to a foreigner when I start.",
        "I had spoken English before starting six months ago.",
      ],
      answer: "Before I started, I had never spoken English with a foreigner.",
    },
    {
      id: "lac3",
      audio_text: "By the end of the year, I will have completed the B2 level.",
      options: [
        "By the end of the year, I will complete the B2 level.",
        "By the end of the year, I will have completed the B2 level.",
        "By the end of the year, I am completing the B2 level.",
        "I completed the B2 level at the end of the year.",
      ],
      answer: "By the end of the year, I will have completed the B2 level.",
    },
    {
      id: "lac4",
      audio_text: "I recommend that you review your notes daily.",
      options: [
        "I recommend that you review your notes daily.",
        "I recommended reviewing your notes yesterday.",
        "You should not review your notes daily.",
        "I advise you to write notes weekly.",
      ],
      answer: "I recommend that you review your notes daily.",
    },
    {
      id: "lac5",
      audio_text: "We need to collaborate to solve this problem.",
      options: [
        "We need to fight each other to win.",
        "We should avoid collaborating with others.",
        "We need to collaborate to solve this problem.",
        "We solved the problem without collaboration.",
      ],
      answer: "We need to collaborate to solve this problem.",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt:
      "I've been {input} for {input}. Before that, I had {input}. By next year, I will have {input}.",
    level1Placeholder:
      "Ví dụ: studying English — six months — never spoken with a foreigner — achieved IELTS 6.5...",
    level2Situation:
      "Bạn tham gia buổi thi nói cuối kỳ B1. Trình bày: (1) Bạn đã tích lũy được những kinh nghiệm học tập gì gần đây, (2) Nhắc lại một khó khăn trong quá khứ bạn đã giải quyết, (3) Đưa ra dự đoán về kết quả học tập trong tương lai của bạn.",
    level2Hint:
      "I have been studying English intensively at AtoEnglish. Before starting this course, I had struggled with listening. I managed to deal with this problem by practicing daily. I predict that I will have achieved my target score by next year.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "B1 Grammar Synthesis — Tổng Hợp Ngữ Pháp B1",
    rule: "Tóm tắt các cấu trúc ngữ pháp trọng tâm B1:\n\n1. Past Continuous (was/were + V-ing) vs Past Simple:\n   → Hành động đang diễn ra thì hành động khác xen vào.\n2. Past Perfect (had + PP):\n   → Hành động xảy ra và hoàn thành trước một thời điểm/hành động khác trong quá khứ.\n3. Future Perfect (will have + PP):\n   → Hành động sẽ hoàn thành trước một thời điểm trong tương lai.\n4. Present Perfect Continuous (have/has been + V-ing):\n   → Nhấn mạnh tính liên tục và thời gian của hành động kéo dài từ quá khứ đến nay.\n5. Subjunctive with suggest/recommend/It is crucial:\n   → 'I recommend that S + V-inf'.",
    examples: [
      {
        en: "I was studying when he called. (Past Continuous + Past Simple)",
        vn: "Tôi đang học bài thì anh ấy gọi.",
      },
      {
        en: "By the time we arrived, the meeting had already started. (Past Perfect)",
        vn: "Trước khi chúng tôi đến, cuộc họp đã bắt đầu rồi.",
      },
      {
        en: "By 2030, we will have built a sustainable business. (Future Perfect)",
        vn: "Trước năm 2030, chúng tôi sẽ đã xây dựng doanh nghiệp bền vững.",
      },
    ],
    tip: "Để đạt điểm cao trong bài thi viết và nói B1+, hãy cố gắng kết hợp các thì hoàn thành (Perfect tenses) để thể hiện tư duy ngữ pháp nâng cao, thay vì chỉ dùng các thì đơn giản.",
    vnNote:
      "⚠️ Người Việt rất hay bỏ quên đuôi '-ed' và động từ cột 3 trong thì quá khứ hoàn thành và tương lai hoàn thành. Hãy chú ý phát âm rõ âm đuôi /t/, /d/, /ɪd/ khi làm bài nói.",
    dialogueExample: {
      speaker: "Trang",
      text: "I've been studying intensively for six months. Before I started, I had never spoken English with a foreigner.",
      translation:
        "Tôi đã học chuyên sâu được sáu tháng. Trước khi tôi bắt đầu, tôi chưa bao giờ nói tiếng Anh với người nước ngoài.",
      highlight:
        "have been studying (duration) | had never spoken (action before past starting point)",
    },
    ccq: {
      question:
        "Câu nào diễn tả một hành động SẼ HOÀN THÀNH trước một thời điểm trong tương lai?",
      options: [
        "By next year, I will study B2.",
        "By next year, I am studying B2.",
        "By next year, I will have completed B1.",
        "By next year, I have completed B1.",
      ],
      answer: "By next year, I will have completed B1.",
      explanation:
        "Future Perfect (will have + PP) dùng để diễn tả một hành động sẽ được hoàn thành trước một thời điểm xác định trong tương lai ('By next year').",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question:
        "Chọn thì đúng: 'When I arrived at the office, the meeting ___ already.'",
      options: ["started", "has started", "had started", "will have started"],
      answer: "had started",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question:
        "Chọn dạng đúng: 'I recommend that she ___ for the exam today.'",
      options: ["prepares", "prepare", "preparing", "to prepare"],
      answer: "prepare",
    },
    {
      id: "pq3",
      type: "cloze",
      question:
        "Điền: 'By next Friday, they ___ (finish) the corporate report.'",
      answer: "will have finished",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question:
        "Điền: 'He ___ (learn) English for three hours and his head hurts.'",
      options: ["has learned", "is learning", "has been learning", "learned"],
      answer: "has been learning",
    },
    {
      id: "pq5",
      type: "cloze",
      question:
        "Điền: 'It is crucial ___ (giới từ) the company to protect resources.'",
      answer: "for",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng ôn tập B1 với nghĩa tiếng Việt",
    pairs: [
      { left: "sustainable", right: "bền vững" },
      { left: "consequence", right: "hậu quả" },
      { left: "consensus", right: "sự đồng thuận" },
      { left: "accumulate", right: "tích lũy" },
      { left: "resolution", right: "sự giải quyết" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Chúng tôi đã hợp tác để tìm giải pháp thay thế.",
      answer: "We collaborated to find an alternative solution.",
    },
    {
      id: "pt-2",
      prompt_vn: "Họ đề xuất giải pháp bền vững cho vấn đề.",
      answer: "They recommended a sustainable solution to the problem.",
    },
    {
      id: "pt-3",
      prompt_vn: "Chúng ta cần tích lũy dữ liệu trước khi quyết định.",
      answer: "We need to accumulate data before making a decision.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc32-1",
      sentence: "If I would be you, I would study harder.",
      errorWord: "would be",
      correction: "were",
      explanation_vn:
        "Second Conditional: 'If I WERE you' (subjunctive). Không dùng 'would' trong mệnh đề 'if'.",
    },
    {
      id: "sc32-2",
      sentence: "She has went to Paris many times.",
      errorWord: "went",
      correction: "gone",
      explanation_vn:
        "Present Perfect: 'has GONE' (past participle của 'go'). 'Went' là Simple Past, không dùng với 'has'.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la32-1",
      audio_text: "If I were you I would study harder every day.",
      prompt_vn: "Nếu tôi là bạn tôi sẽ học chăm hơn mỗi ngày.",
      words: [
        "If",
        "I",
        "were",
        "you",
        "I",
        "would",
        "study",
        "harder",
        "every",
        "day",
        ".",
        "would be",
        "am",
      ],
      answer: "If I were you I would study harder every day .",
    },
    {
      id: "la32-2",
      audio_text: "She has gone to Paris three times already.",
      prompt_vn: "Cô ấy đã đến Paris ba lần rồi.",
      words: [
        "She",
        "has",
        "gone",
        "to",
        "Paris",
        "three",
        "times",
        "already",
        ".",
        "went",
        "been",
      ],
      answer: "She has gone to Paris three times already .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Trước khi tôi bắt đầu, tôi chưa bao giờ nói tiếng Anh.",
      words: [
        "Before",
        "I",
        "started",
        ",",
        "I",
        "had",
        "never",
        "spoken",
        "English",
        ".",
        "would",
        "could",
      ],
      answer: "Before I started , I had never spoken English .",
    },
    {
      id: "wb2",
      prompt_vn: "Đến cuối năm, tôi sẽ hoàn thành cấp độ B2.",
      words: [
        "By",
        "the",
        "end",
        "of",
        "the",
        "year",
        ",",
        "I",
        "will",
        "have",
        "completed",
        "B2",
        ".",
        "would",
        "could",
      ],
      answer: "By the end of the year , I will have completed B2 .",
    },
    {
      id: "wb3",
      prompt_vn: "Tôi đã và đang học tiếng Anh chuyên sâu trong sáu tháng.",
      words: [
        "I",
        "have",
        "been",
        "studying",
        "English",
        "intensively",
        "for",
        "six",
        "months",
        ".",
        "would",
        "could",
      ],
      answer: "I have been studying English intensively for six months .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s32-1",
      prompt_vn: "Trước khi tôi bắt đầu, tôi chưa bao giờ nói tiếng Anh.",
      words: [
        "Before",
        "I",
        "started",
        ",",
        "I",
        "had",
        "never",
        "spoken",
        "English",
        ".",
      ],
      answer: "Before I started , I had never spoken English .",
    },
    {
      id: "s32-2",
      prompt_vn: "Đến cuối năm, tôi sẽ hoàn thành cấp độ B2.",
      words: [
        "By",
        "the",
        "end",
        "of",
        "the",
        "year",
        ",",
        "I",
        "will",
        "have",
        "completed",
        "B2",
        ".",
      ],
      answer: "By the end of the year , I will have completed B2 .",
    },
    {
      id: "s32-3",
      prompt_vn: "Tôi đã và đang học tiếng Anh chuyên sâu trong sáu tháng.",
      words: [
        "I",
        "have",
        "been",
        "studying",
        "English",
        "intensively",
        "for",
        "six",
        "months",
        ".",
      ],
      answer: "I have been studying English intensively for six months .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question: "Chọn câu đúng: 'By the time she called, I ___ the email.'",
      options: ["sent", "had sent", "will have sent", "am sending"],
      answer: "had sent",
    },
    {
      id: "fq2",
      type: "cloze",
      question:
        "Điền từ: 'The team reached a ___ (sự đồng thuận) about the agenda.'",
      answer: "consensus",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question:
        "Chọn dạng đúng: 'It is recommended that everyone ___ the policy.'",
      options: ["read", "reads", "reading", "to read"],
      answer: "read",
    },
    {
      id: "fq4",
      type: "translate",
      question: "Dịch: 'Chúng tôi đã hợp tác để tìm giải pháp thay thế.'",
      answer: "We collaborated to find an alternative solution.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question: "Chọn từ điền: 'We need to ___ the corporate deadline.'",
      options: ["meet", "miss", "propose", "delay"],
      answer: "meet",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "Second Conditional: cấu trúc đúng:",
      options: [
        "If + present, will + inf",
        "If + past simple, would + inf",
        "If + past perfect, would have + V3",
        "If + present, would + inf",
      ],
      answer: "If + past simple, would + inf",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "Câu Second Conditional đúng:",
      options: [
        "If I am rich, I will travel.",
        "If I were rich, I would travel.",
        "If I was rich, I would traveled.",
        "If I were rich, I will travel.",
      ],
      answer: "If I were rich, I would travel.",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền: 'If she ___ harder, she would pass.'",
      answer: "worked",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "'Passive voice' bị động hiện tại hoàn thành:",
      options: [
        "has/have + been + V3",
        "was/were + V3",
        "is/are + V3",
        "had + been + V3",
      ],
      answer: "has/have + been + V3",
    },
    {
      id: "q-ex5",
      type: "translate",
      question: "Dịch: 'Nếu tôi biết câu trả lời, tôi sẽ nói cho bạn biết.'",
      answer: "If I knew the answer, I would tell you.",
    },
    {
      id: "q-ex6",
      type: "multiple-choice",
      question: "'Wish + past simple' diễn tả:",
      options: [
        "Điều kiện thật",
        "Mong ước về hiện tại không thật",
        "Tiếc về quá khứ",
        "Kế hoạch tương lai",
      ],
      answer: "Mong ước về hiện tại không thật",
    },
    {
      id: "q-ex7",
      type: "multiple-choice",
      question: "'It's time you went to bed.' — cấu trúc này dùng:",
      options: [
        "Thì hiện tại đơn",
        "Thì quá khứ đơn (subjunctive)",
        "Thì hiện tại hoàn thành",
        "Modal verb",
      ],
      answer: "Thì quá khứ đơn (subjunctive)",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr32-1",
      question:
        "Ôn tập Unit 31 — Điền: 'The corporate client requested the ___ (tệp đính kèm).'",
      options: ["attachment", "agenda", "proposal", "delay"],
      answer: "attachment",
      type: "multiple-choice",
    },
    {
      id: "cr32-2",
      question:
        "Ôn tập Unit 30 — Điền: 'Deforestation causes severe loss of ___ (đa dạng sinh học).'",
      options: [],
      answer: "biodiversity",
      type: "cloze",
    },
    {
      id: "cr32-3",
      question:
        "Ôn tập Unit 29 — Chọn dạng: 'What if we ___ (offer) them a refund yesterday?'",
      options: ["offered", "offer", "offering", "to offer"],
      answer: "offered",
      type: "multiple-choice",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "would've /ˈwʊdəv/",
    description: "Would have — second/third conditional giảm âm",
    examples: [
      {
        word: "would have",
        ipa: "/wʊd həv/",
        tip: "Nói nhanh: would've /ˈwʊdəv/ — rất phổ biến trong văn nói",
      },
      {
        word: "could have",
        ipa: "/kʊd həv/",
        tip: "could've /ˈkʊdəv/ — âm /d/ cuối thường rất yếu hoặc bị bỏ",
      },
    ],
    minimalPairs: [["would've /ˈwʊdəv/", "would have (đầy đủ)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      {
        en: "I've been preparing for this assessment",
        vn: "Tôi đã chuẩn bị cho buổi đánh giá này",
      },
      {
        en: "I will have completed the level by December",
        vn: "Tôi sẽ hoàn thành cấp độ này trước tháng 12",
      },
      {
        en: "I had never spoken English before",
        vn: "Trước đây tôi chưa từng nói tiếng Anh",
      },
      {
        en: "We need a sustainable growth model",
        vn: "Chúng ta cần mô hình tăng trưởng bền vững",
      },
      {
        en: "I recommend that you practice daily",
        vn: "Tôi khuyên bạn nên thực hành hàng ngày",
      },
      {
        en: "The company has accumulated experience",
        vn: "Công ty đã tích lũy được nhiều kinh nghiệm",
      },
      {
        en: "How did you deal with the delay?",
        vn: "Bạn đã giải quyết sự chậm trễ đó thế nào?",
      },
      {
        en: "Let's work towards a quick resolution",
        vn: "Hãy cùng hướng tới sự giải quyết nhanh chóng",
      },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit32-reading-1",
    title: "B1 Achievement Review",
    title_vn: "Đọc đoạn ôn tập tổng hợp B1",
    level: "B1" as const,
    text:
      "Congratulations on reaching B1 level! This is a significant milestone in your English journey. " +
      "At B1, you can understand the main points of clear standard speech on familiar matters. " +
      "You are able to deal with most situations likely to arise whilst travelling in an English-speaking area. " +
      "You can produce simple connected text on topics that are familiar or of personal interest. " +
      "You can describe experiences, events, dreams, hopes and ambitions " +
      "and briefly give reasons and explanations for opinions and plans. " +
      "In a professional context, you can participate in meetings, write emails, and give short presentations. " +
      "You have mastered key grammar: past tenses, conditionals, passives, modal verbs, and relative clauses. " +
      "The next step is B2, where language becomes more fluent and precise. " +
      "Keep reviewing what you have learned and practise speaking every day. " +
      "Your consistency is what will take you to the next level!",
    questions: [
      {
        id: "u32r-q1",
        question_vn: "Ở trình độ B1, bạn có thể hiểu được loại lời nói nào?",
        options: [
          "Only simple, very slow speech",
          "The main points of clear standard speech on familiar matters",
          "All native speaker speech perfectly",
          "Only written English",
        ],
        answer: "The main points of clear standard speech on familiar matters",
        explanation_vn:
          "'you can understand the main points of clear standard speech on familiar matters.'",
      },
      {
        id: "u32r-q2",
        question_vn:
          "Bạn có thể làm gì trong bối cảnh chuyên nghiệp ở trình độ B1?",
        options: [
          "Only read documents",
          "Participate in meetings, write emails, and give short presentations",
          "Write academic research papers",
          "Translate complex legal documents",
        ],
        answer:
          "Participate in meetings, write emails, and give short presentations",
        explanation_vn:
          "'you can participate in meetings, write emails, and give short presentations.'",
      },
      {
        id: "u32r-q3",
        question_vn: "Bước tiếp theo sau B1 là gì?",
        options: ["A1", "A2", "B2", "C1"],
        answer: "B2",
        explanation_vn:
          "'The next step is B2, where language becomes more fluent and precise.'",
      },
      {
        id: "u32r-q4",
        question_vn: "Điều gì sẽ đưa bạn lên trình độ tiếp theo?",
        options: [
          "Studying only grammar",
          "Taking many tests",
          "Your consistency and daily practice",
          "Moving to an English-speaking country",
        ],
        answer: "Your consistency and daily practice",
        explanation_vn:
          "'Your consistency is what will take you to the next level!'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Reviewing performance in annual meeting",
      focus: "B1 review language",
      context: "performance review",
      l1Note: "⚠️ 'Accumulate' formal. 'Build up' casual.",
      example: "We have accumulated enough data. I recommend we proceed.",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "8S0FDjFBj8o",
};

export default unit32;
