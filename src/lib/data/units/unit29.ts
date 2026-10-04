import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-29 — Problems & Solutions  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit29: UnitData = {
  unitId: "unit-29",
  title: "Unit 29: Problems & Solutions",
  level: "B1",
  xp: 100,
  estimatedTime: 55,
  description:
    "Discussion Skills — Phát triển kỹ năng thảo luận vấn đề và đề xuất giải pháp. Nền tảng quan trọng cho IELTS Speaking Part 3 và TOEIC Part 3.",
  badgeName: "Nhà Giải Quyết",
  badgeEmoji: "🧩",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Họp nhóm tìm giải pháp cho website bán hàng đang bị chậm. Trưởng nhóm yêu cầu mọi người đóng góp ý kiến. Sử dụng các cấu trúc thảo luận và đề xuất (should, could, we might want to, how about + V-ing) giúp trao đổi ý kiến một cách lịch sự, chuyên nghiệp.",
  learningOutcomes: [
    "Trình bày các vấn đề nơi công sở bằng tiếng Anh chuyên nghiệp",
    "Đưa ra các giải pháp và đề xuất lịch sự sử dụng should/could/how about...",
    "Phát biểu ý kiến và thể hiện sự đồng ý/không đồng ý trong các buổi thảo luận",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Trong thảo luận bằng tiếng Anh, người bản xứ thường tránh nói trực diện kiểu <span class="text-muted-foreground">"This is wrong"</span> vì dễ gây cảm giác thô lỗ. Thay vào đó, họ dùng các từ giảm nhẹ như <span class="text-primary">"We have a slight issue"</span> (vấn đề nhỏ) và đề xuất gián tiếp <span class="text-primary">"We might want to consider..."</span> để giữ không khí thảo luận cởi mở.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🤝",
      en: "Let's brainstorm some ideas to solve this problem.",
      vn: "Chúng ta hãy cùng động não tìm vài ý tưởng để giải quyết vấn đề này.",
      context: "brainstorm ideas — cụm từ thảo luận thông dụng",
    },
    {
      emoji: "💡",
      en: "What if we try to reduce the loading time first?",
      vn: "Nếu chúng ta thử giảm thời gian tải trang trước thì sao?",
      context: "What if + clause — đưa ra giả thuyết/gợi ý",
    },
    {
      emoji: "💬",
      en: "I propose we schedule a follow-up meeting.",
      vn: "Tôi đề xuất chúng ta lên lịch một cuộc họp tiếp theo.",
      context: "propose + clause — đề xuất chính thức",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "issue",
      emoji: "⚠️",
      phonetic: "/ˈɪʃuː/",
      meaning: "vấn đề / trở ngại",
      example: "We need to address the main issue as soon as possible.",
      example2: "There is an issue with the database connection.",
      collocation: "address an issue / solve an issue / minor issue",
      audio: "/audio/unit-29/issue.mp3",
    },
    {
      id: 2,
      word: "solution",
      emoji: "🔑",
      phonetic: "/səˈluːʃən/",
      meaning: "giải pháp",
      example: "Finding a permanent solution is our top priority.",
      example2: "They proposed a creative solution to the budget cut.",
      collocation: "propose a solution / find a solution / temporary solution",
      audio: "/audio/unit-29/solution.mp3",
      l1_interference_vn:
        "⚠️ \'Solution TO\': \'the solution to the problem\'. Giới từ \'to\', không phải \'of\' hay \'for\'.",
    },
    {
      id: 3,
      word: "propose",
      emoji: "🙋",
      phonetic: "/prəˈpəʊz/",
      meaning: "đề xuất / đề nghị",
      example: "I propose we hire a consultant to help us.",
      example2: "She proposed changing the workflow to save time.",
      collocation: "propose an idea / propose a change / propose a plan",
      audio: "/audio/unit-29/propose.mp3",
      l1_interference_vn:
        "⚠️ + V-ing hoặc that-clause: \'propose doing sth\'. KHÔNG dùng \'propose to do\' theo nghĩa gợi ý.",
    },
    {
      id: 4,
      word: "resolve",
      emoji: "✅",
      phonetic: "/rɪˈzɒlv/",
      meaning: "giải quyết triệt để",
      example: "We hope to resolve this conflict before the weekend.",
      example2: "The customer service team quickly resolved the complaint.",
      collocation: "resolve a problem / resolve an issue / resolve a dispute",
      audio: "/audio/unit-29/resolve.mp3",
      l1_interference_vn:
        "⚠️ Formal hơn \'solve\'. \'Resolve a conflict/dispute/problem\' — dùng văn trang trọng.",
    },
    {
      id: 5,
      word: "brainstorm",
      emoji: "🧠",
      phonetic: "/ˈbreɪnstɔːm/",
      meaning: "động não / thảo luận tìm ý tưởng",
      example: "Our team will brainstorm today to find new features.",
      example2: "Let's brainstorm some marketing strategies.",
      collocation:
        "brainstorm ideas / brainstorm session / brainstorm together",
      audio: "/audio/unit-29/brainstorm.mp3",
      l1_interference_vn:
        "⚠️ Vừa là động từ vừa danh từ: \'brainstorm ideas\', \'have a brainstorm session\'.",
    },
    {
      id: 6,
      word: "alternative",
      emoji: "🔄",
      phonetic: "/ɒlˈtɜːnətɪv/",
      meaning: "lựa chọn thay thế",
      example: "We have to consider an alternative plan if this fails.",
      example2: "Is there an alternative route to the office?",
      collocation:
        "alternative solution / alternative choice / find an alternative",
      audio: "/audio/unit-29/alternative.mp3",
      l1_interference_vn:
        "⚠️ \'Alternative TO\': \'an alternative to driving\'. Giới từ \'to\', không phải \'of\' hay \'for\'.",
    },
    {
      id: 7,
      word: "implementation",
      emoji: "⚙️",
      phonetic: "/ˌɪmplɪmenˈteɪʃən/",
      meaning: "sự triển khai / thực hiện",
      example: "The implementation of the new software took three weeks.",
      example2: "We need a clear plan for the project implementation.",
      collocation:
        "project implementation / successful implementation / carry out implementation",
      audio: "/audio/unit-29/implementation.mp3",
    },
    {
      id: 8,
      word: "feedback",
      emoji: "💬",
      phonetic: "/ˈfiːdbæk/",
      meaning: "phản hồi / ý kiến nhận xét",
      example: "We received positive feedback from our beta users.",
      example2: "I'd love to hear your feedback on the presentation.",
      collocation: "positive feedback / request feedback / customer feedback",
      audio: "/audio/unit-29/feedback.mp3",
    },
    {
      id: 9,
      word: "consensus",
      emoji: "🤝",
      phonetic: "/kənˈsensəs/",
      meaning: "sự đồng thuận / nhất trí",
      example: "The board reached a consensus on the new budget.",
      example2: "It's difficult to reach a consensus in a large team.",
      collocation: "reach a consensus / general consensus / consensus building",
      audio: "/audio/unit-29/consensus.mp3",
      l1_interference_vn:
        "⚠️ Không đếm được: \'reach a consensus\', \'by consensus\'. Không có \'consensuses\'.",
    },
    {
      id: 10,
      word: "address",
      emoji: "🎯",
      phonetic: "/əˈdres/",
      meaning: "giải quyết / xử lý",
      example: "The government must address the environmental problems.",
      example2: "Let's address the elephant in the room.",
      collocation: "address a concern / address a problem / address a question",
      audio: "/audio/unit-29/address.mp3",
      l1_interference_vn:
        "⚠️ Stress âm đầu: AD-dress (danh từ). Người Việt hay đọc 'a-DRESS' — sai stress.",
    },
    {
      id: 11,
      word: "obstacle",
      emoji: "🚧",
      phonetic: "/ˈɒbstəkəl/",
      meaning: "trở ngại / chướng ngại vật",
      example:
        "Language barrier is a major obstacle for international students.",
      example2: "We overcame all obstacles to complete the project on time.",
      collocation:
        "overcome an obstacle / major obstacle / unexpected obstacle",
      audio: "/audio/unit-29/obstacle.mp3",
      l1_interference_vn:
        "⚠️ \'Obstacle TO\': \'an obstacle to progress\'. Giới từ \'to\', không phải \'for\' hay \'of\'.",
    },
    {
      id: 12,
      word: "feasible",
      emoji: "👌",
      phonetic: "/ˈfiːzəbəl/",
      meaning: "khả thi",
      example: "It is not feasible to finish this in one day.",
      example2: "We are looking for a feasible business model.",
      collocation: "financially feasible / highly feasible / feasible plan",
      audio: "/audio/unit-29/feasible.mp3",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Cuộc họp giải quyết vấn đề website chậm",
      audio: "/audio/unit-29/dialogue_1.mp3",
      desc: "Huy và Sarah thảo luận về vấn đề kỹ thuật của website công ty.",
      lines: [
        {
          id: "d1-1",
          speaker: "Huy",
          text: "We have a serious issue. The website is loading too slowly.",
          translation:
            "Chúng ta đang gặp một vấn đề nghiêm trọng. Trang web tải quá chậm.",
        },
        {
          id: "d1-2",
          speaker: "Sarah",
          text: "I agree. We should address this before we lose more customers. What do you propose?",
          translation:
            "Tôi đồng ý. Chúng ta nên xử lý việc này trước khi mất thêm khách hàng. Anh đề xuất gì?",
        },
        {
          id: "d1-3",
          speaker: "Huy",
          text: "I propose that we optimize all the images on the homepage first.",
          translation:
            "Tôi đề xuất chúng ta tối ưu hóa toàn bộ hình ảnh trên trang chủ trước.",
        },
        {
          id: "d1-4",
          speaker: "Sarah",
          text: "That's a feasible solution. But we could also look into upgrading our hosting server.",
          translation:
            "Đó là một giải pháp khả thi. Nhưng chúng ta cũng có thể cân nhắc việc nâng cấp máy chủ lưu trữ.",
        },
        {
          id: "d1-5",
          speaker: "Huy",
          text: "Good point. Let's brainstorm with the IT team to see which alternative is faster to implement.",
          translation:
            "Ý kiến hay. Hãy động não với đội IT để xem phương án thay thế nào triển khai nhanh hơn.",
        },
        {
          id: "d1-6",
          speaker: "Sarah",
          text: "Great. I hope we can reach a consensus by the end of today's session.",
          translation:
            "Tuyệt vời. Tôi hy vọng chúng ta có thể đạt được sự đồng thuận vào cuối buổi thảo luận hôm nay.",
        },
      ],
    },
    {
      id: 2,
      title: "Giải quyết khiếu nại khách hàng",
      audio: "/audio/unit-29/dialogue_2.mp3",
      desc: "Trang đề xuất giải pháp xử lý đơn hàng bị giao trễ cho khách hàng.",
      lines: [
        {
          id: "d2-1",
          speaker: "Manager",
          text: "The customer is very angry about the delayed shipment. How can we resolve this?",
          translation:
            "Khách hàng rất giận dữ về việc giao hàng trễ. Chúng ta giải quyết việc này thế nào?",
        },
        {
          id: "d2-2",
          speaker: "Trang",
          text: "We could offer them a twenty percent discount on their next order, or refund the shipping fee.",
          translation:
            "Chúng ta có thể đề xuất tặng họ mã giảm giá hai mươi phần trăm cho đơn sau, hoặc hoàn phí vận chuyển.",
        },
        {
          id: "d2-3",
          speaker: "Manager",
          text: "Which option do they prefer? Have you requested their feedback?",
          translation:
            "Họ thích phương án nào hơn? Cô đã lấy phản hồi của họ chưa?",
        },
        {
          id: "d2-4",
          speaker: "Trang",
          text: "I asked, and they prefer the shipping refund. It seems more feasible to resolve it this way immediately.",
          translation:
            "Tôi đã hỏi, và họ thích hoàn phí vận chuyển hơn. Có vẻ khả thi hơn để giải quyết việc này theo cách này ngay lập tức.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "We need to address the main issue as soon as possible.",
      options: [
        "We need to ignore the main issue.",
        "We need to solve the minor issue.",
        "We need to address the main issue as soon as possible.",
        "We need to find the main database issue.",
      ],
      answer: "We need to address the main issue as soon as possible.",
    },
    {
      id: "lac2",
      audio_text: "I propose that we optimize all the images first.",
      options: [
        "I propose that we optimize all the images first.",
        "I agree we should upgrade the hosting server.",
        "I propose that we change the website theme.",
        "I suggest we write a report about images.",
      ],
      answer: "I propose that we optimize all the images first.",
    },
    {
      id: "lac3",
      audio_text: "That is a feasible solution to the problem.",
      options: [
        "That is an expensive solution to the problem.",
        "That is a feasible solution to the problem.",
        "That is an alternative solution for you.",
        "That is not a possible solution for us.",
      ],
      answer: "That is a feasible solution to the problem.",
    },
    {
      id: "lac4",
      audio_text: "The team reached a consensus after the meeting.",
      options: [
        "The team reached a consensus after the meeting.",
        "The team had an argument during the meeting.",
        "The team ignored the feedback after the meeting.",
        "The team found a major obstacle yesterday.",
      ],
      answer: "The team reached a consensus after the meeting.",
    },
    {
      id: "lac5",
      audio_text: "How can we resolve this shipping delay?",
      options: [
        "How can we buy this shipping service?",
        "How can we resolve this shipping delay?",
        "How should we ship this order today?",
        "When did we resolve the shipping issue?",
      ],
      answer: "How can we resolve this shipping delay?",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt:
      "To address this {input}, I propose we {input}. Another feasible solution is to {input}.",
    level1Placeholder:
      "Ví dụ: issue — optimize the homepage — upgrade the hosting server...",
    level2Situation:
      "Họp công ty thảo luận về việc văn phòng dùng quá nhiều giấy in. Đóng vai nhân viên đề xuất giải pháp: (1) Nêu vấn đề lãng phí giấy, (2) Đề xuất giải pháp số hóa tài liệu, (3) Nêu giải pháp thay thế là tái sử dụng giấy nháp.",
    level2Hint:
      "We have an issue with paper waste. I propose we address this by digitizing all documents. Alternatively, we could encourage everyone to reuse scrap paper. This is a feasible way to start saving costs immediately.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Language for Making Suggestions — Cách Đưa Ra Đề Xuất",
    rule: "Các cấu trúc đưa ra đề xuất lịch sự và chuyên nghiệp trong thảo luận:\n\n1. S + should + V-infinitive (Nên làm gì)\n   → 'We should address the issue now.'\n2. S + could + V-infinitive (Có thể làm gì - nhẹ nhàng hơn should)\n   → 'We could upgrade the server.'\n3. I propose (that) + S + V-infinitive/should V (Đề xuất chính thức)\n   → 'I propose we optimize the database.'\n4. How about / What about + V-ing? (Còn việc... thì sao?)\n   → 'How about hiring a consultant?'\n5. What if we + V-past/present? (Nếu chúng ta... thì sao?)\n   → 'What if we offered a discount?'",
    examples: [
      {
        en: "We should ask the customers for feedback first. (straightforward recommendation)",
        vn: "Chúng ta nên hỏi phản hồi từ khách hàng trước.",
      },
      {
        en: "We could try an alternative approach. (gentle suggestion, offering options)",
        vn: "Chúng ta có thể thử một cách tiếp cận thay thế.",
      },
      {
        en: "How about brainstorming with the design team tomorrow? (informal but constructive)",
        vn: "Còn việc cùng động não với đội thiết kế vào ngày mai thì sao?",
      },
    ],
    tip: "Trong các cuộc họp chuyên nghiệp quốc tế, sử dụng 'could' hoặc 'we might want to' sẽ giúp ý kiến của bạn nghe lịch thiệp, dễ tiếp thu và mang tính đóng góp hơn là dùng 'must' hay 'should' quá nhiều.",
    vnNote:
      "⚠️ Người Việt thường có thói quen ra lệnh trực tiếp kiểu 'Do this' hoặc 'You have to...'. Hãy thay bằng 'We could...' hoặc 'How about...' để tạo phong thái giao tiếp tinh tế kiểu B1+.",
    dialogueExample: {
      speaker: "Sarah",
      text: "That's a feasible solution. But we could also look into upgrading our hosting server.",
      translation:
        "Đó là một giải pháp khả thi. Nhưng chúng ta cũng có thể cân nhắc việc nâng cấp máy chủ lưu trữ.",
      highlight:
        "could also look into (đưa ra giải pháp nhẹ nhàng, mang tính gợi mở)",
    },
    ccq: {
      question:
        "Câu nào là cách đề xuất lịch sự, mang tính đóng góp ý kiến nhiều lựa chọn?",
      options: [
        "You must upgrade the server immediately.",
        "We could look into upgrading the server.",
        "Upgrade the server now.",
        "We will upgrade the server today.",
      ],
      answer: "We could look into upgrading the server.",
      explanation:
        "'We could' mang tính chất đề nghị nhẹ nhàng và lịch sự hơn, giúp tạo không khí thảo luận cởi mở.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question:
        "Chọn cấu trúc đề xuất đúng: 'How about ___ our hosting server?'",
      options: ["upgrade", "to upgrade", "upgrading", "upgraded"],
      answer: "upgrading",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question:
        "Điền từ thích hợp: 'We must ___ this technical issue immediately.'",
      options: ["propose", "address", "feedback", "feasible"],
      answer: "address",
    },
    {
      id: "pq3",
      type: "cloze",
      question: "Điền: 'I propose that we ___ (brainstorm) together.'",
      answer: "brainstorm",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "Tìm từ đồng nghĩa với 'practicable/possible':",
      options: ["obstacle", "issue", "feasible", "alternative"],
      answer: "feasible",
    },
    {
      id: "pq5",
      type: "cloze",
      question:
        "Điền từ thích hợp: 'What ___ we upgraded the server next week?'",
      answer: "if",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng thảo luận với nghĩa tiếng Việt",
    pairs: [
      { left: "propose", right: "đề xuất / đề nghị" },
      { left: "consensus", right: "sự đồng thuận" },
      { left: "obstacle", right: "trở ngại" },
      { left: "resolve", right: "giải quyết triệt để" },
      { left: "alternative", right: "lựa chọn thay thế" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Chúng ta có thể cân nhắc việc hoàn tiền phí vận chuyển.",
      answer: "We could consider refunding the shipping fee.",
    },
    {
      id: "pt-2",
      prompt_vn: "Họ đề xuất một giải pháp thay thế khả thi.",
      answer: "They proposed a feasible alternative solution.",
    },
    {
      id: "pt-3",
      prompt_vn: "Chúng tôi sẽ giải quyết vấn đề bằng cách động não.",
      answer: "We will resolve the issue by brainstorming.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc29-1",
      sentence: "I suggest to go to the doctor right away.",
      errorWord: "to go",
      correction: "going",
      explanation_vn:
        "Sau 'suggest' dùng V-ing, không dùng 'to + V': 'I suggest going to the doctor'.",
    },
    {
      id: "sc29-2",
      sentence: "He recommend that we leaving early.",
      errorWord: "leaving",
      correction: "leave",
      explanation_vn:
        "Sau 'recommend that S + ...' dùng động từ nguyên mẫu (subjunctive): 'we leave', không phải 'we leaving'.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la29-1",
      audio_text: "I suggest going to the doctor right away.",
      prompt_vn: "Tôi đề nghị đi khám bác sĩ ngay bây giở.",
      words: [
        "I",
        "suggest",
        "going",
        "to",
        "the",
        "doctor",
        "right",
        "away",
        ".",
        "propose",
        "visit",
      ],
      answer: "I suggest going to the doctor right away .",
    },
    {
      id: "la29-2",
      audio_text: "He recommends eating more vegetables.",
      prompt_vn: "Anh ấy khưyến nghị ăn nhiều rau hơn.",
      words: [
        "He",
        "recommends",
        "eating",
        "more",
        "vegetables",
        ".",
        "suggest",
        "to eat",
      ],
      answer: "He recommends eating more vegetables .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi đề xuất chúng ta tối ưu hóa các hình ảnh trước.",
      words: [
        "I",
        "propose",
        "we",
        "optimize",
        "the",
        "images",
        "first",
        ".",
        "would",
        "could",
      ],
      answer: "I propose we optimize the images first .",
    },
    {
      id: "wb2",
      prompt_vn: "Chúng ta nên giải quyết vấn đề này càng sớm càng tốt.",
      words: [
        "We",
        "should",
        "address",
        "this",
        "issue",
        "as",
        "soon",
        "as",
        "possible",
        ".",
        "would",
        "could",
      ],
      answer: "We should address this issue as soon as possible .",
    },
    {
      id: "wb3",
      prompt_vn: "Đó là một giải pháp khả thi cho vấn đề kỹ thuật.",
      words: [
        "That",
        "is",
        "a",
        "feasible",
        "solution",
        "to",
        "the",
        "technical",
        "problem",
        ".",
        "would",
        "could",
      ],
      answer: "That is a feasible solution to the technical problem .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s29-1",
      prompt_vn: "Tôi đề xuất chúng ta tối ưu hóa các hình ảnh trước.",
      words: ["I", "propose", "we", "optimize", "the", "images", "first", "."],
      answer: "I propose we optimize the images first .",
    },
    {
      id: "s29-2",
      prompt_vn: "Chúng ta nên giải quyết vấn đề này càng sớm càng tốt.",
      words: [
        "We",
        "should",
        "address",
        "this",
        "issue",
        "as",
        "soon",
        "as",
        "possible",
        ".",
      ],
      answer: "We should address this issue as soon as possible .",
    },
    {
      id: "s29-3",
      prompt_vn: "Đó là một giải pháp khả thi cho vấn đề kỹ thuật.",
      words: [
        "That",
        "is",
        "a",
        "feasible",
        "solution",
        "to",
        "the",
        "technical",
        "problem",
        ".",
      ],
      answer: "That is a feasible solution to the technical problem .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question:
        "Dịch đề xuất lịch sự: 'Chúng ta có thể cân nhắc việc hoàn tiền phí vận chuyển.'",
      options: [
        "We must refund the shipping fee.",
        "We could consider refunding the shipping fee.",
        "Refund the shipping fee now.",
        "We did refund the shipping fee.",
      ],
      answer: "We could consider refunding the shipping fee.",
      explanation_vn:
        "'could consider + V-ing' — đề xuất nhẹ nhàng, lịch sự. 'must refund' quá trực tiếp; 'could' phù hợp gữa các bên.",
    },
    {
      id: "fq2",
      type: "cloze",
      question:
        "Điền từ: 'The team reached a ___ (sự đồng thuận) after three hours.'",
      answer: "consensus",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question: "Chọn câu hỏi phản hồi phù hợp nhất:",
      options: [
        "What do you propose?",
        "Have you requested their feedback?",
        "Is it feasible?",
        "Can we overcome this obstacle?",
      ],
      answer: "Have you requested their feedback?",
      explanation_vn:
        "'Đã hỏi phản hồi chưa?' — đây là bước quan trọ ng bảy trước khi ra quyết định giải quyết khiếu nại. Các đáp án khác đặt vấn đề không đúng ngữ cảnh.",
    },
    {
      id: "fq4",
      type: "translate",
      question: "Dịch: 'Chúng ta cần tìm một giải pháp thay thế.'",
      answer: "We need to find an alternative solution.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question:
        "Điền giới từ: 'We need to reach a consensus ___ the new budget.'",
      options: ["on", "with", "at", "for"],
      answer: "on",
      explanation_vn:
        "'reach a consensus ON sth' là collocation đúng. 'agree on', 'decide on' cũng theo quy tắc này.",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "'I wish I had more time.' — diễn tả điều gì?",
      options: [
        "Điều kiện thật sẽ xảy ra",
        "Tiếc về hiện tại (điều không thật)",
        "Kế hoạch tương lai",
        "Yêu cầu lịch sự",
      ],
      answer: "Tiếc về hiện tại (điều không thật)",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "Câu 'wish' hiện tại đúng:",
      options: [
        "I wish I have a car.",
        "I wish I had a car.",
        "I wish I will have a car.",
        "I wish I have had a car.",
      ],
      answer: "I wish I had a car.",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền: 'If only I ___ harder at school.'",
      answer: "had studied",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "'The problem is that...' dùng để:",
      options: [
        "Đưa ra giải pháp",
        "Nêu vấn đề",
        "Đồng ý với ai",
        "Hỏi thông tin",
      ],
      answer: "Nêu vấn đề",
    },
    {
      id: "q-ex5",
      type: "translate",
      question: "Dịch: 'Tôi ước gì mình biết câu trả lời.'",
      answer: "I wish I knew the answer.",
    },
    {
      id: "q-ex6",
      type: "multiple-choice",
      question: "'Have you considered...?' + dạng nào?",
      options: ["to-infinitive", "V-ing", "bare infinitive", "V3"],
      answer: "V-ing",
    },
    {
      id: "q-ex7",
      type: "multiple-choice",
      question: "Giải pháp lịch sự nhất khi đề xuất:",
      options: [
        "You must do this.",
        "Why don't you try...?",
        "Do this now.",
        "I want you to do this.",
      ],
      answer: "Why don't you try...?",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr29-1",
      question:
        "Ôn tập Unit 28 — Điền: 'I ___ (study) English for six months now.'",
      options: ["have studied", "have been studying", "am studying", "studied"],
      answer: "have been studying",
      type: "multiple-choice",
    },
    {
      id: "cr29-2",
      question:
        "Ôn tập Unit 27 — Điền phrasal verb: 'We need to ___ (giải quyết/xử lý) this problem immediately.'",
      options: [],
      answer: "deal with",
      type: "cloze",
    },
    {
      id: "cr29-3",
      question: "Ôn tập Unit 26 — Dịch: 'Tôi thích đọc sách hơn chơi game.'",
      options: [
        "I prefer reading books to playing games.",
        "I like read books than play games.",
        "I enjoy to read books than gaming.",
        "I prefer to read books rather play games.",
      ],
      answer: "I prefer reading books to playing games.",
      type: "multiple-choice",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "wish /wɪʃ/",
    description: "Wish và subjunctive mood — âm /ʃ/ cuối và stress",
    examples: [
      {
        word: "wish",
        ipa: "/wɪʃ/",
        tip: "Âm /ʃ/ cuối rõ — không phải /s/ hay bỏ hẳn. I wish I... không phải I wis I",
      },
      {
        word: "if only",
        ipa: "/ɪf ˈəʊnli/",
        tip: "Stress vào only: if ONLY I had... — nhấn sự tiếc nuối",
      },
    ],
    minimalPairs: [["wish /wɪʃ/", "wis (bỏ /ʃ/ — sai)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      {
        en: "We have a serious issue",
        vn: "Chúng ta đang gặp vấn đề nghiêm trọng",
      },
      { en: "What do you propose?", vn: "Bạn đề xuất phương án gì?" },
      { en: "That is a feasible solution", vn: "Đó là một giải pháp khả thi" },
      {
        en: "Let's brainstorm some ideas",
        vn: "Hãy cùng động não vài ý tưởng",
      },
      {
        en: "We must resolve this immediately",
        vn: "Chúng ta phải giải quyết việc này ngay",
      },
      { en: "We reached a consensus", vn: "Chúng tôi đã đạt được đồng thuận" },
      {
        en: "Have you requested their feedback?",
        vn: "Bạn đã hỏi ý kiến phản hồi của họ chưa?",
      },
      {
        en: "We need an alternative plan",
        vn: "Chúng ta cần một kế hoạch thay thế",
      },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit29-reading-1",
    title: "Solving a Supply Chain Problem",
    title_vn: "Đọc đoạn về giải quyết vấn đề kinh doanh",
    level: "B1" as const,
    text:
      "Last quarter, our company faced a major supply chain problem. " +
      "Our main supplier in Thailand could not deliver materials on time due to flooding. " +
      "This caused significant delays in our production schedule. " +
      "First, we identified the root cause: the supplier's factory was flooded. " +
      "Then, we brainstormed possible solutions with our operations team. " +
      "We proposed using an alternative supplier in Malaysia as a temporary measure. " +
      "We also negotiated with our key clients to extend their deadlines by two weeks. " +
      "Fortunately, most clients were understanding and agreed. " +
      "As a result, we minimised losses and maintained most of our contracts. " +
      "We have since developed a contingency plan with two backup suppliers " +
      "to prevent similar problems in the future. " +
      "This experience taught us the importance of supply chain resilience.",
    questions: [
      {
        id: "u29r-q1",
        question_vn: "Vấn đề chính của công ty là gì?",
        options: [
          "A client cancelled their contract",
          "A supplier could not deliver materials on time",
          "The factory equipment broke down",
          "Staff went on strike",
        ],
        answer: "A supplier could not deliver materials on time",
        explanation_vn:
          "'Our main supplier in Thailand could not deliver materials on time due to flooding.'",
      },
      {
        id: "u29r-q2",
        question_vn: "Giải pháp ngắn hạn của họ là gì?",
        options: [
          "Stop production temporarily",
          "Cancel all client contracts",
          "Use an alternative supplier in Malaysia",
          "Hire more employees",
        ],
        answer: "Use an alternative supplier in Malaysia",
        explanation_vn:
          "'We proposed using an alternative supplier in Malaysia as a temporary measure.'",
      },
      {
        id: "u29r-q3",
        question_vn: "Họ đã đàm phán gì với khách hàng?",
        options: [
          "A price reduction",
          "A deadline extension of two weeks",
          "A full refund",
          "A new contract",
        ],
        answer: "A deadline extension of two weeks",
        explanation_vn:
          "'We also negotiated with our key clients to extend their deadlines by two weeks.'",
      },
      {
        id: "u29r-q4",
        question_vn:
          "Họ đã làm gì để ngăn chặn vấn đề tương tự trong tương lai?",
        options: [
          "Changed their main product",
          "Stopped working with foreign suppliers",
          "Developed a contingency plan with two backup suppliers",
          "Reduced the size of the company",
        ],
        answer: "Developed a contingency plan with two backup suppliers",
        explanation_vn:
          "'We have since developed a contingency plan with two backup suppliers to prevent similar problems in the future.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Giới thiệu bản thân và công ty trong networking event",
      focus: "Elevator pitch + small talk at professional event",
      context: "Industry meetup hoặc hội chợ việc làm cho người VN",
      l1Note:
        "⚠️ 'Hi, I'm Linh from ABC Corp. We help SMEs automate reporting.' 'What brings you here today?'",
      example:
        "I'm a product manager at a fintech startup. We make accounting software for Vietnamese SMEs. How about you?",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "8pVq8WElnOo",
};

export default unit29;
