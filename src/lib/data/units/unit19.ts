import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-19 — Stories & Narratives  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// UNIT 19 — Stories & Narratives  (B1)
// First B1 unit. Grammar: Past Continuous + Past Simple (interrupted action).
//
// ✅ Pedagogy: Situation-first → vocab → dialogue → inductive grammar
// ✅ L1 Alert: Vietnamese has no continuous aspect → learners flatten narrative
// ✅ Target: IELTS Speaking Part 2 (describe a past event), TOEIC Part 3
// ✅ Vocabulary: 12 business/narrative words from GSL + AWL frequency lists
// ─────────────────────────────────────────────────────────────────────────────

export const unit19: UnitData = {
  unitId: "unit-19",
  title: "Unit 19: Stories & Narratives",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description:
    "Học Past Continuous để kể chuyện có diễn tiến — tạo bức tranh sống động về sự kiện trong quá khứ, không chỉ liệt kê sự kiện.",
  badgeName: "Người Kể Chuyện",
  badgeEmoji: "📖",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Trong buổi phỏng vấn xin việc, nhà tuyển dụng hỏi: 'Tell me about a challenging situation at work.' Bạn muốn kể lại câu chuyện sinh động — không chỉ 'Something happened and I fixed it', mà là khung cảnh, diễn biến, hành động đan xen nhau. Đây là cách người B1+ kể chuyện.",

  learningOutcomes: [
    "Dùng Past Continuous để mô tả bối cảnh/diễn tiến trong câu chuyện",
    "Kết hợp Past Continuous + Past Simple để diễn đạt hành động bị gián đoạn",
    "Kể lại sự kiện trong quá khứ một cách sinh động và chuyên nghiệp",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Trong tiếng Anh, <span class="text-primary font-semibold">storytelling</span> tốt không chỉ nói "what happened" mà còn vẽ ra <span class="text-primary font-semibold">bối cảnh</span> (what was happening). Người Việt thường kể: <span class="text-muted-foreground">"I worked late. The power went out. I lost the file."</span> — đúng nhưng khô. Người bản ngữ kể: <span class="text-primary">"I <strong>was working</strong> late when suddenly the power went out and I lost everything."</span> — cùng sự kiện, nhưng hình ảnh hơn, engaging hơn, và tự nhiên hơn.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "💼",
      en: "I was preparing the presentation when my laptop crashed.",
      vn: "Tôi đang chuẩn bị bài thuyết trình thì máy tính xách tay bị sập.",
      context: "Hành động bị gián đoạn",
    },
    {
      emoji: "📞",
      en: "While she was talking to the client, her phone died.",
      vn: "Trong khi cô ấy đang nói chuyện với khách hàng, điện thoại hết pin.",
      context: "Hai hành động song song",
    },
    {
      emoji: "🏃",
      en: "They were running to catch the train when it started raining.",
      vn: "Họ đang chạy để bắt tàu thì trời bắt đầu mưa.",
      context: "Bối cảnh + sự kiện bất ngờ",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "incident",
      l1_interference_vn:
        "⚠️ \'Incident\' (sự cố/vụ việc) đếm được: \'an incident\', \'incidents\'. Phân biệt \'accident\' (tai nạn ngoài ý muốn) và \'incident\' (sự kiện đáng chú ý).",
      emoji: "⚠️",
      phonetic: "/ˈɪnsɪdənt/",
      meaning: "sự cố / vụ việc",
      example: "A major incident occurred during the system upgrade.",
      example2: "She reported the incident to her manager immediately.",
      collocation: "critical incident / report an incident",
      audio: "/audio/unit-19/incident.mp3",
    },
    {
      id: 2,
      word: "meanwhile",
      l1_interference_vn:
        "⚠️ \'Meanwhile\' đứng đầu câu + dấu phẩy: \'Meanwhile, the team kept working.\' Hoặc giữa câu: \'I was cooking; meanwhile, she set the table.\'",
      emoji: "⏱️",
      phonetic: "/ˈmiːnwaɪl/",
      meaning: "trong lúc đó / đồng thời",
      example: "I was fixing the bug. Meanwhile, the team was waiting.",
      example2: "She prepared the slides; meanwhile, he arranged the room.",
      collocation: "meanwhile, back at / in the meanwhile",
      audio: "/audio/unit-19/meanwhile.mp3",
    },
    {
      id: 3,
      word: "suddenly",
      l1_interference_vn:
        "⚠️ \'Suddenly\' đứng đầu câu hoặc trước động từ — KHÔNG đặt cuối câu như tiếng Việt: \'Suddenly, it rained.\' / \'It suddenly rained.\'",
      emoji: "⚡",
      phonetic: "/ˈsʌdənli/",
      meaning: "đột ngột / bỗng nhiên",
      example:
        "We were in the middle of the meeting when suddenly the fire alarm went off.",
      example2: "Suddenly, the client changed all the requirements.",
      collocation: "quite suddenly / happen suddenly",
      audio: "/audio/unit-19/suddenly.mp3",
    },
    {
      id: 4,
      word: "interrupt",
      l1_interference_vn:
        "⚠️ \'Interrupt\' + N trực tiếp: \'interrupt the meeting/someone\'. Không dùng \'interrupt to someone\'. Danh từ: \'interruption\'.",
      emoji: "✋",
      phonetic: "/ˌɪntəˈrʌpt/",
      meaning: "làm gián đoạn / ngắt lời",
      example: "He interrupted my presentation with an urgent question.",
      example2: "Sorry to interrupt, but there's an important call for you.",
      collocation: "interrupt a meeting / interrupt someone",
      audio: "/audio/unit-19/interrupt.mp3",
    },
    {
      id: 5,
      word: "colleague",
      l1_interference_vn:
        "⚠️ \'Colleague\' = đồng nghiệp cùng tổ chức. Phân biệt \'coworker\' (informal) và \'partner\' (đối tác bên ngoài).",
      emoji: "🤝",
      phonetic: "/ˈkɒliːɡ/",
      meaning: "đồng nghiệp",
      example: "My colleague was handling the client when I arrived.",
      example2: "A colleague suggested a better approach to the problem.",
      collocation: "senior colleague / work with colleagues",
      audio: "/audio/unit-19/colleague.mp3",
    },
    {
      id: 6,
      word: "deadline",
      review: true,
      l1_interference_vn:
        "⚠️ \'Meet a deadline\' (kịp hạn) hoặc \'miss a deadline\' (trễ hạn). KHÔNG dùng \'do/finish the deadline\'.",
      emoji: "⏰",
      phonetic: "/ˈdedlaɪn/",
      meaning: "hạn chót",
      example: "We were rushing to meet the deadline when the system crashed.",
      example2: "Missing a deadline can damage your professional reputation.",
      collocation: "meet a deadline / miss a deadline / tight deadline",
      audio: "/audio/unit-19/deadline.mp3",
    },
    {
      id: 7,
      word: "resolve",
      l1_interference_vn:
        "⚠️ \'Resolve\' formal hơn \'solve\'. \'Resolve a conflict/dispute/issue\' — thường dùng trong email kinh doanh.",
      emoji: "✅",
      phonetic: "/rɪˈzɒlv/",
      meaning: "giải quyết",
      example: "We managed to resolve the issue before the client noticed.",
      example2: "The team worked together to resolve the conflict quickly.",
      collocation: "resolve a problem / resolve a conflict",
      audio: "/audio/unit-19/resolve.mp3",
    },
    {
      id: 8,
      word: "urgent",
      l1_interference_vn:
        "⚠️ Tính từ: \'urgent matter\'. Trạng từ: \'urgently\'. Danh từ: \'urgency\' — \'a matter of urgency\'. Không nhầm với \'emergency\'.",
      emoji: "🚨",
      phonetic: "/ˈɜːdʒənt/",
      meaning: "khẩn cấp",
      example: "I was in a meeting when an urgent email arrived.",
      example2: "The manager sent an urgent message to the entire team.",
      collocation: "urgent matter / urgent meeting / treat as urgent",
      audio: "/audio/unit-19/urgent.mp3",
    },
    {
      id: 9,
      word: "fortunately",
      l1_interference_vn:
        "⚠️ \'Fortunately\' đứng đầu câu + dấu phẩy: \'Fortunately, no one was hurt.\' Ngược nghĩa: \'Unfortunately\'. Không nhầm với \'luckily\' (informal hơn).",
      emoji: "🍀",
      phonetic: "/ˈfɔːtʃənətli/",
      meaning: "may mắn thay / rất may",
      example: "Fortunately, I had saved a backup of all the files.",
      example2: "We were worried, but fortunately everything worked out.",
      collocation: "fortunately for us / fortunately enough",
      audio: "/audio/unit-19/fortunately.mp3",
    },
    {
      id: 10,
      word: "handle",
      l1_interference_vn:
        "⚠️ \'Handle\' = xử lý/đối phó: \'handle the situation/problem\'. Informal: \'Can you handle this?\' = \'Can you deal with this?\'",
      emoji: "🛠️",
      phonetic: "/ˈhændəl/",
      meaning: "xử lý / đảm nhiệm",
      example: "She was handling three projects at the same time.",
      example2: "Can you handle this client while I'm in the meeting?",
      collocation: "handle a situation / handle pressure / handle complaints",
      audio: "/audio/unit-19/handle.mp3",
    },
    {
      id: 11,
      word: "chaos",
      l1_interference_vn:
        "⚠️ \'Chaos\' không đếm được: \'cause chaos\', \'in chaos\'. Không có \'a chaos\' hay \'chaoses\'. Tính từ: \'chaotic\'.",
      emoji: "🌀",
      phonetic: "/ˈkeɪɒs/",
      meaning: "sự hỗn loạn",
      example: "Everything was in chaos when the server went down.",
      example2: "The office was in complete chaos after the power cut.",
      collocation: "complete chaos / cause chaos / in chaos",
      audio: "/audio/unit-19/chaos.mp3",
    },
    {
      id: 12,
      word: "recover",
      l1_interference_vn:
        "⚠️ \'Recover FROM\': \'recover from an illness/setback\' — bắt buộc giới từ \'from\'. \'Recovery\' là danh từ tương ứng.",
      emoji: "🔄",
      phonetic: "/rɪˈkʌvər/",
      meaning: "khôi phục / hồi phục",
      example: "It took two hours to recover all the lost data.",
      example2: "The company quickly recovered from the IT incident.",
      collocation: "recover data / recover from a setback / full recovery",
      audio: "/audio/unit-19/recover.mp3",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Sự cố hệ thống",
      audio: "/audio/unit-19/dialogue_1.mp3",
      desc: "Minh kể lại sự cố IT nghiêm trọng trong buổi phỏng vấn.",
      lines: [
        {
          id: "d1-1",
          speaker: "Interviewer",
          text: "Can you tell me about a challenging situation you've handled at work?",
          translation:
            "Bạn có thể kể về một tình huống thử thách mà bạn đã xử lý ở công việc không?",
        },
        {
          id: "d1-2",
          speaker: "Minh",
          text: "Of course. Last year, I was preparing a major client presentation when our entire system suddenly crashed.",
          translation:
            "Được chứ. Năm ngoái, tôi đang chuẩn bị bài thuyết trình lớn cho khách hàng thì toàn bộ hệ thống của chúng tôi bỗng nhiên bị sập.",
        },
        {
          id: "d1-3",
          speaker: "Interviewer",
          text: "That sounds stressful. What was happening at the time?",
          translation:
            "Nghe có vẻ căng thẳng thật. Tình hình lúc đó như thế nào?",
        },
        {
          id: "d1-4",
          speaker: "Minh",
          text: "The whole office was in chaos. While the IT team was trying to fix the server, I was calling our backup provider and recovering the files manually.",
          translation:
            "Cả văn phòng trong tình trạng hỗn loạn. Trong khi nhóm IT đang cố sửa server, tôi vừa gọi cho nhà cung cấp dự phòng vừa khôi phục file thủ công.",
        },
        {
          id: "d1-5",
          speaker: "Interviewer",
          text: "How did you resolve it in the end?",
          translation: "Cuối cùng bạn đã giải quyết như thế nào?",
        },
        {
          id: "d1-6",
          speaker: "Minh",
          text: "Fortunately, I had saved backups the night before. We recovered everything within two hours and delivered the presentation on time. The client never knew anything went wrong.",
          translation:
            "May mắn thay, tôi đã lưu bản sao lưu vào tối hôm trước. Chúng tôi khôi phục mọi thứ trong vòng hai tiếng và thuyết trình đúng giờ. Khách hàng không biết có sự cố gì xảy ra.",
        },
      ],
    },
    {
      id: 2,
      title: "Trễ chuyến bay",
      audio: "/audio/unit-19/dialogue_2.mp3",
      desc: "Lan kể cho Tom nghe về chuyến công tác bị sự cố.",
      lines: [
        {
          id: "d2-1",
          speaker: "Tom",
          text: "You look exhausted! What happened on your business trip?",
          translation:
            "Bạn trông kiệt sức vậy! Chuyến công tác có chuyện gì vậy?",
        },
        {
          id: "d2-2",
          speaker: "Lan",
          text: "It was a disaster. I was waiting at the gate when they announced a 4-hour delay.",
          translation:
            "Thật là thảm họa. Tôi đang đợi ở cổng lên máy bay thì họ thông báo trễ 4 tiếng.",
        },
        {
          id: "d2-3",
          speaker: "Tom",
          text: "Oh no! What did you do while you were waiting?",
          translation: "Ôi không! Bạn đã làm gì trong khi chờ đợi?",
        },
        {
          id: "d2-4",
          speaker: "Lan",
          text: "While I was waiting, I prepared for my presentation. Meanwhile, my colleague was handling the client at the hotel. Fortunately, we managed to reschedule the first meeting.",
          translation:
            "Trong khi chờ, tôi đã chuẩn bị cho bài thuyết trình. Trong lúc đó, đồng nghiệp tôi đang tiếp khách ở khách sạn. May mắn thay, chúng tôi sắp xếp lại được cuộc họp đầu tiên.",
        },
        {
          id: "d2-5",
          speaker: "Tom",
          text: "Did everything work out in the end?",
          translation: "Cuối cùng mọi thứ có ổn không?",
        },
        {
          id: "d2-6",
          speaker: "Lan",
          text: "Yes! When I finally arrived, the client was still there. We had a great meeting and signed the contract. It was stressful but totally worth it!",
          translation:
            "Có! Khi tôi cuối cùng đến nơi, khách hàng vẫn ở đó. Chúng tôi có một cuộc họp tuyệt vời và ký hợp đồng. Căng thẳng nhưng hoàn toàn xứng đáng!",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "I was preparing the report when my computer crashed",
      options: [
        "I was preparing the report when my computer crashed",
        "I prepared the report when my computer crashed",
        "I was prepare the report when my computer crashed",
        "I was preparing the report while my computer crashed",
      ],
      answer: "I was preparing the report when my computer crashed",
    },
    {
      id: "lac2",
      audio_text: "While she was talking to the client her phone died",
      options: [
        "While she talked to the client her phone died",
        "While she was talking to the client her phone died",
        "While she was talking to the client her phone was dying",
        "While she was talked to the client her phone died",
      ],
      answer: "While she was talking to the client her phone died",
    },
    {
      id: "lac3",
      audio_text: "The whole office was in chaos when the server went down",
      options: [
        "The whole office was in chaos when the server went down",
        "The whole office is in chaos when the server went down",
        "The whole office was in chaos when the server goes down",
        "The whole office were in chaos when the server went down",
      ],
      answer: "The whole office was in chaos when the server went down",
    },
    {
      id: "lac4",
      audio_text: "Fortunately we recovered all the data within two hours",
      options: [
        "Fortunately we recovered all the data within two hours",
        "Fortunate we recovered all the data within two hours",
        "Fortunately we was recovering all the data within two hours",
        "Fortunately we recover all the data within two hours",
      ],
      answer: "Fortunately we recovered all the data within two hours",
    },
    {
      id: "lac5",
      audio_text:
        "While the IT team was fixing the server I was calling the backup provider",
      options: [
        "While the IT team fixed the server I called the backup provider",
        "While the IT team was fixing the server I was calling the backup provider",
        "While the IT team was fixing the server I called the backup provider",
        "While the IT team was fix the server I was calling the backup provider",
      ],
      answer:
        "While the IT team was fixing the server I was calling the backup provider",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt:
      "I was {input} when suddenly {input}. Fortunately, I managed to {input}.",
    level1Placeholder:
      "Ví dụ: preparing a report — the power went out — recover the file...",
    level2Situation:
      "Kể lại một tình huống thử thách trong công việc hoặc học tập. Dùng Past Continuous để mô tả bối cảnh, Past Simple cho các sự kiện xảy ra. Trả lời: (1) Bạn đang làm gì? (2) Điều gì xảy ra đột ngột? (3) Bạn đã xử lý thế nào? (4) Kết quả ra sao?",
    level2Hint:
      "I was [doing something] when [event happened]. While I was [action], my colleague/team was [parallel action]. Fortunately/Unfortunately, [result]. In the end, we managed to [resolution].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Past Continuous — Kể Chuyện Có Diễn Tiến",
    rule: "Past Continuous: was/were + V-ing\n→ Mô tả hành động đang diễn ra tại một thời điểm quá khứ\n\nKết hợp cổ điển:\n→ Past Continuous (bối cảnh) + WHEN + Past Simple (sự kiện đột ngột)\n→ WHILE + Past Continuous + Past Simple (hai hành động song song)\n\nCông thức:\n(+) I/He/She was working | We/They were waiting\n(-) I wasn't sleeping | They weren't listening\n(?) Was he working? | Were they waiting?",
    examples: [
      {
        en: "I was writing the email when my boss called. (Past Cont. + when + Past Simple)",
        vn: "Tôi đang viết email thì sếp gọi điện.",
      },
      {
        en: "While she was presenting, the projector stopped working. (While + Past Cont. + Past Simple)",
        vn: "Trong khi cô ấy đang thuyết trình, máy chiếu ngừng hoạt động.",
      },
      {
        en: "We were both working on the same file at the same time. (Hai hành động song song)",
        vn: "Chúng tôi đều đang làm việc trên cùng một file cùng lúc.",
      },
    ],
    tip: "Ghi nhớ: Past Continuous = bức tranh nền (background), Past Simple = sự kiện đột ngột xảy ra. 'While I was cooking, the phone rang.' — cooking là bức tranh nền, the phone rang là sự kiện.",
    vnNote:
      "⚠️ Lưu ý cho người Việt: Tiếng Việt không có dạng 'đang làm' riêng trong ngữ pháp — ta dùng 'đang' nhưng không bắt buộc. Trong tiếng Anh, was/were + V-ing là BẮT BUỘC khi muốn thể hiện tính diễn tiến của hành động quá khứ. Không dùng → câu nghe cứng và thiếu tự nhiên.",
    dialogueExample: {
      speaker: "Minh",
      text: "I was preparing the presentation when the system crashed. While the IT team was fixing it, I was calling our backup provider.",
      translation:
        "Tôi đang chuẩn bị bài thuyết trình thì hệ thống bị sập. Trong khi nhóm IT đang sửa, tôi đang gọi cho nhà cung cấp dự phòng.",
      highlight:
        "was preparing (background) + crashed (sudden event) | was fixing + was calling (simultaneous)",
    },
    ccq: {
      question: "Câu nào dùng Past Continuous ĐÚNG để kể chuyện?",
      options: [
        "I prepared a report when my laptop crashed.",
        "I was preparing a report when my laptop suddenly crashed.",
        "I was prepare a report when my laptop crashed.",
        "I was prepared a report when my laptop was crashing.",
      ],
      answer: "I was preparing a report when my laptop suddenly crashed.",
      explanation:
        "'was preparing' (Past Continuous) = bối cảnh đang diễn ra + 'crashed' (Past Simple) = sự kiện đột ngột. Đây là cấu trúc storytelling chuẩn của B1+.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question:
        "Chọn đúng: 'She ___ the client report when the power went out.'",
      options: ["wrote", "was writing", "is writing", "had written"],
      answer: "was writing",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question: "Chọn đúng: '___ you ___ to the meeting when I called?'",
      options: ["Did / go", "Were / going", "Are / going", "Was / going"],
      answer: "Were / going",
    },
    {
      id: "pq3",
      type: "cloze",
      question:
        "Điền: 'While he ___ (handle) the complaint, I ___ (prepare) the refund.'",
      answer: "was handling / was preparing",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "Câu nào đúng ngữ pháp và tự nhiên nhất?",
      options: [
        "I worked when he called me.",
        "I was working when he called me.",
        "I was working when he was calling me.",
        "I worked when he was calling me.",
      ],
      answer: "I was working when he called me.",
    },
    {
      id: "pq5",
      type: "cloze",
      question:
        "Điền: 'The whole team ___ (wait) for the results when the manager suddenly ___ (announce) the news.'",
      answer: "was waiting / announced",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "incident", right: "sự cố" },
      { left: "resolve", right: "giải quyết" },
      { left: "deadline", right: "hạn chót" },
      { left: "chaos", right: "sự hỗn loạn" },
      { left: "fortunately", right: "may mắn thay" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Trong khi tôi đang thuyết trình, sếp bước vào phòng.",
      answer: "While I was presenting, the boss walked into the room.",
    },
    {
      id: "pt-2",
      prompt_vn: "Đồng nghiệp đang gọi khi điện thoại đổ chuông.",
      answer: "My colleague was calling when the phone rang.",
    },
    {
      id: "pt-3",
      prompt_vn: "Họ đang chạy đến hạn chót khi hệ thống sập.",
      answer: "They were rushing to meet the deadline when the system crashed.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc19-1",
      sentence: "First, she go to the market and buy some vegetables.",
      errorWord: "go",
      correction: "went",
      explanation_vn:
        "Kể chuyện quá khứ dùng Simple Past: 'go → went', 'buy → bought'. Thì phải nhất quán.",
    },
    {
      id: "sc19-2",
      sentence: "While I was cook dinner, the phone rang.",
      errorWord: "cook",
      correction: "cooking",
      explanation_vn:
        "Past Continuous: 'was/were + V-ing'. 'Was COOKING' mô tả hành động đang diễn ra khi có sự kiện khác.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la19-1",
      audio_text: "She went to the market and bought some fruit.",
      prompt_vn: "Cô ấy đi chợ và mua một ít trái cây.",
      words: [
        "She",
        "went",
        "to",
        "the",
        "market",
        "and",
        "bought",
        "some",
        "fruit",
        ".",
        "go",
        "buyed",
      ],
      answer: "She went to the market and bought some fruit .",
    },
    {
      id: "la19-2",
      audio_text: "While I was reading the phone rang.",
      prompt_vn: "Trong khi tôi đang đọc thì điện thoại reo.",
      words: [
        "While",
        "I",
        "was",
        "reading",
        "the",
        "phone",
        "rang",
        ".",
        "read",
        "ringing",
      ],
      answer: "While I was reading the phone rang .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi đang viết báo cáo thì máy tính bị sập.",
      words: [
        "I",
        "was",
        "writing",
        "the",
        "report",
        "when",
        "my",
        "computer",
        "crashed",
        ".",
        "would",
        "could",
      ],
      answer: "I was writing the report when my computer crashed .",
    },
    {
      id: "wb2",
      prompt_vn: "Trong khi nhóm IT đang sửa server, tôi đang gọi điện.",
      words: [
        "While",
        "the",
        "IT",
        "team",
        "was",
        "fixing",
        "the",
        "server",
        ",",
        "I",
        "was",
        "calling",
        "the",
        "client",
        ".",
        "would",
        "could",
      ],
      answer:
        "While the IT team was fixing the server , I was calling the client .",
    },
    {
      id: "wb3",
      prompt_vn: "May mắn thay, chúng tôi khôi phục được mọi dữ liệu.",
      words: [
        "Fortunately",
        ",",
        "we",
        "managed",
        "to",
        "recover",
        "all",
        "the",
        "data",
        ".",
        "would",
        "could",
      ],
      answer: "Fortunately , we managed to recover all the data .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s19-1",
      prompt_vn: "Tôi đang viết báo cáo thì máy tính bị sập.",
      words: [
        "I",
        "was",
        "writing",
        "the",
        "report",
        "when",
        "my",
        "computer",
        "crashed",
        ".",
      ],
      answer: "I was writing the report when my computer crashed .",
    },
    {
      id: "s19-2",
      prompt_vn: "Trong khi nhóm IT đang sửa server, tôi đang gọi điện.",
      words: [
        "While",
        "the",
        "IT",
        "team",
        "was",
        "fixing",
        "the",
        "server",
        ",",
        "I",
        "was",
        "calling",
        "the",
        "client",
        ".",
      ],
      answer:
        "While the IT team was fixing the server , I was calling the client .",
    },
    {
      id: "s19-3",
      prompt_vn: "May mắn thay, chúng tôi khôi phục được mọi dữ liệu.",
      words: [
        "Fortunately",
        ",",
        "we",
        "managed",
        "to",
        "recover",
        "all",
        "the",
        "data",
        ".",
      ],
      answer: "Fortunately , we managed to recover all the data .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question: "Dịch: 'Trong khi tôi đang thuyết trình, sếp bước vào phòng.'",
      options: [
        "While I presented, the boss walked into the room.",
        "While I was presenting, the boss walked into the room.",
        "While I was presenting, the boss was walking into the room.",
        "While I presenting, the boss walked into the room.",
      ],
      answer: "While I was presenting, the boss walked into the room.",
    },
    {
      id: "fq2",
      type: "cloze",
      question:
        "Điền: 'They ___ (discuss) the budget when an urgent message ___ (arrive).'",
      answer: "were discussing / arrived",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question: "Câu nào kể chuyện tự nhiên nhất theo phong cách B1+?",
      options: [
        "The system crashed. I fixed it. The client was happy.",
        "I was handling the client when suddenly the system crashed. Fortunately, I managed to resolve it quickly.",
        "System crashed. I resolve. Client happy.",
        "The system was crashed when I handled the client.",
      ],
      answer:
        "I was handling the client when suddenly the system crashed. Fortunately, I managed to resolve it quickly.",
    },
    {
      id: "fq4",
      type: "translate",
      question:
        "Dịch sang tiếng Anh: 'Cô ấy đang xử lý khiếu nại thì điện thoại hết pin và mọi thứ trở nên hỗn loạn.'",
      answer:
        "She was handling the complaint when her phone died and everything became chaos.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question:
        "Chọn đúng: 'He ___ the deadline when his colleague ___ to help.'",
      options: [
        "missed / was offered",
        "was missing / offered",
        "missed / offered",
        "was missing / was offered",
      ],
      answer: "was missing / offered",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "Past Continuous dùng khi nào?",
      options: [
        "Hành động hoàn thành trong QK",
        "Hành động đang diễn ra ở một thời điểm QK",
        "Thói quen trong QK",
        "Kết quả còn đến hiện tại",
      ],
      answer: "Hành động đang diễn ra ở một thời điểm QK",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "Câu Past Continuous đúng:",
      options: [
        "She was reading when I called.",
        "She reading when I called.",
        "She were reading when I called.",
        "She was read when I called.",
      ],
      answer: "She was reading when I called.",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền: 'It ___ raining when we left.'",
      answer: "was",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "'While' + Past Continuous + 'when' + Past Simple — đúng:",
      options: [
        "While I was cooking, the phone rang.",
        "While I cooked, the phone was ringing.",
        "While I was cook, the phone rang.",
        "While I cooked, the phone ring.",
      ],
      answer: "While I was cooking, the phone rang.",
    },
    {
      id: "q-ex5",
      type: "multiple-choice",
      question: "Từ nối để bắt đầu câu chuyện:",
      options: ["Therefore", "First of all", "In addition", "However"],
      answer: "First of all",
    },
    {
      id: "q-ex6",
      type: "translate",
      question: "Dịch: 'Tôi đang ngủ thì điện thoại reo.'",
      answer: "I was sleeping when the phone rang.",
    },
    {
      id: "q-ex7",
      type: "multiple-choice",
      question: "Từ nối nào thể hiện tương phản?",
      options: ["and", "because", "however", "therefore"],
      answer: "however",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr19-1",
      question:
        "Ôn tập A2 — Chọn Present Perfect đúng: 'I ___ this city three times.'",
      options: ["visited", "have visited", "was visiting", "am visiting"],
      answer: "have visited",
      type: "multiple-choice",
    },
    {
      id: "cr19-2",
      question: "Ôn tập A2 — Điền: 'She ___ (work) here since 2021.'",
      options: [],
      answer: "has worked",
      type: "cloze",
    },
    {
      id: "cr19-3",
      question:
        "Ôn tập A2 — Câu nào dùng 'going to' đúng cho kế hoạch đã lên sẵn?",
      options: [
        "I will probably visit Paris next year.",
        "I'm going to visit Paris next year — I already have the tickets.",
        "I visit Paris next year.",
        "I was going to visit Paris next year.",
      ],
      answer:
        "I'm going to visit Paris next year — I already have the tickets.",
      type: "multiple-choice",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "was /wɒz/ vs were /wɜːr/",
    description: "Was/were — âm /ɜː/ trong were rất khó với người Việt",
    examples: [
      {
        word: "was",
        ipa: "/wɒz/",
        tip: "Âm /ɒ/ ngắn, tròn — giống hot. Dạng yếu trong câu: /wəz/",
      },
      {
        word: "were",
        ipa: "/wɜːr/",
        tip: "Âm /ɜː/ dài — giống her, bird — miệng tròn, lưỡi giữa",
      },
    ],
    minimalPairs: [
      ["was /wɒz/", "were /wɜːr/"],
      ["hot /ɒ/", "heard /ɜː/"],
    ],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      {
        en: "I was working when he called",
        vn: "Tôi đang làm việc thì anh ấy gọi",
      },
      {
        en: "She was presenting when the power went out",
        vn: "Cô ấy đang thuyết trình thì mất điện",
      },
      {
        en: "While we were waiting, it started raining",
        vn: "Trong khi chúng tôi đang chờ thì trời mưa",
      },
      {
        en: "They were discussing the budget when the manager arrived",
        vn: "Họ đang thảo luận ngân sách thì giám đốc đến",
      },
      {
        en: "I was handling the complaint when my colleague interrupted",
        vn: "Tôi đang xử lý khiếu nại thì đồng nghiệp ngắt lời",
      },
      { en: "Was she working late?", vn: "Cô ấy có đang làm thêm giờ không?" },
      {
        en: "What were you doing when it happened?",
        vn: "Bạn đang làm gì khi điều đó xảy ra?",
      },
      {
        en: "Fortunately, we managed to resolve the issue",
        vn: "May mắn thay, chúng tôi đã giải quyết được vấn đề",
      },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit19-reading-1",
    title: "The Day Everything Went Wrong",
    title_vn: "Đọc đoạn kể chuyện quá khứ",
    level: "B1" as const,
    text:
      "It was a Monday morning. I was running late for an important presentation. " +
      "While I was driving to work, it started raining heavily. " +
      "Suddenly, a motorbike cut in front of me and I had to brake hard. " +
      "My coffee spilled all over my shirt! I was still wearing my stained shirt when I arrived. " +
      "When I entered the meeting room, the projector wasn't working. " +
      "While my colleague was trying to fix it, I quickly changed into a spare shirt from my drawer. " +
      "Eventually, the presentation went well. " +
      "Afterwards, my boss said it was the best presentation of the year. " +
      "Sometimes the most stressful days have the best endings!",
    questions: [
      {
        id: "u19r-q1",
        question_vn: "Tại sao người kể chuyện bị trễ giờ?",
        options: [
          "The train was late",
          "He was running late that morning",
          "His car broke down",
          "He forgot his presentation",
        ],
        answer: "He was running late that morning",
        explanation_vn:
          "'It was a Monday morning. I was running late for an important presentation.'",
      },
      {
        id: "u19r-q2",
        question_vn: "Điều gì xảy ra với cà phê của anh ấy?",
        options: [
          "He dropped it on the floor",
          "He forgot it at home",
          "It spilled all over his shirt",
          "It broke the projector",
        ],
        answer: "It spilled all over his shirt",
        explanation_vn: "'My coffee spilled all over my shirt!'",
      },
      {
        id: "u19r-q3",
        question_vn: "Vấn đề gì xảy ra trong phòng họp?",
        options: [
          "The air conditioning broke",
          "The projector wasn't working",
          "The presentation files were missing",
          "The manager was absent",
        ],
        answer: "The projector wasn't working",
        explanation_vn:
          "'When I entered the meeting room, the projector wasn't working.'",
      },
      {
        id: "u19r-q4",
        question_vn: "Sếp của anh ấy nói gì sau bài thuyết trình?",
        options: [
          "He was disappointed",
          "It was the best presentation of the year",
          "They needed to redo the presentation",
          "He should be more prepared next time",
        ],
        answer: "It was the best presentation of the year",
        explanation_vn:
          "'My boss said it was the best presentation of the year.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Thảo luận kế hoạch team và phân công nhiệm vụ",
      focus: "Team planning language, responsibilities, deadlines in workplace",
      context: "Weekly team sync hoặc kickoff meeting với manager",
      l1Note:
        "⚠️ Dùng thì tương lai gần và present continuous cho kế hoạch: 'We are launching', 'I will handle X'.",
      example:
        "I will prepare the report by Friday. We are launching the new feature next month.",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "Mc0CXKDjFnw",
};

export default unit19;
