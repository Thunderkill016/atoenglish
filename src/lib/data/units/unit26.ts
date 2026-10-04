import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-26 — Likes, Dislikes & Preferences  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit26: UnitData = {
  unitId: "unit-26",
  title: "Unit 26: Likes, Dislikes & Preferences",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description: "Phân biệt Gerund vs Infinitive — enjoy doing vs want to do. Lỗi người Việt cực hay mắc khi nói về sở thích và đề xuất.",
  badgeName: "Người Biết Chọn",
  badgeEmoji: "🎯",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Trong cuộc họp dự án, bạn cần đề xuất phương án làm việc: 'I suggest trying a new approach' (NOT suggest to try). 'I would like to present the results' (NOT would like presenting). Sai Gerund/Infinitive → câu sai hoàn toàn.",
  learningOutcomes: [
    "Nắm các động từ luôn đi với Gerund: enjoy, avoid, suggest, consider, mind, finish",
    "Nắm các động từ luôn đi với Infinitive: want, decide, hope, plan, agree, refuse, offer",
    "Phân biệt forget/remember/stop + Gerund vs Infinitive (nghĩa khác nhau hoàn toàn)",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong tiếng Anh, <span class="text-emerald-400 font-semibold">Gerund (V-ing)</span> vs <span class="text-emerald-400 font-semibold">Infinitive (to V)</span> là một trong những điểm khó nhất với người Việt — vì tiếng Việt không phân biệt. Mẹo: Động từ liên quan đến <span class="text-emerald-400">quá khứ/thực tế</span> → Gerund. Động từ liên quan đến <span class="text-emerald-400">tương lai/mục tiêu</span> → Infinitive.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "😊", en: "I enjoy working with international teams.", vn: "Tôi thích làm việc với các nhóm quốc tế.", context: "enjoy + V-ing (KHÔNG enjoy to work)" },
    { emoji: "🎯", en: "I want to improve my English before the IELTS exam.", vn: "Tôi muốn cải thiện tiếng Anh trước kỳ thi IELTS.", context: "want + to V (KHÔNG want improving)" },
    { emoji: "💡", en: "I suggest using a new project management tool.", vn: "Tôi đề xuất sử dụng công cụ quản lý dự án mới.", context: "suggest + V-ing (KHÔNG suggest to use)" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "suggest", emoji: "💡", phonetic: "/səˈdʒest/", meaning: "đề xuất / gợi ý", example: "I suggest dividing the team into smaller groups.", example2: "She suggested starting the meeting earlier.", collocation: "suggest a solution / suggest doing / open to suggestions", audio: "/audio/unit-26/suggest.mp3", l1_interference_vn: "⚠️ KHÔNG dùng to-inf: \'suggest doing\' / \'suggest that...(should)\'. SAI: \'suggest to do\'." },
    { id: 2, word: "consider", emoji: "🤔", phonetic: "/kənˈsɪdər/", meaning: "xem xét / cân nhắc", example: "Have you considered applying for the senior role?", example2: "We are considering outsourcing the design work.", collocation: "consider options / worth considering / carefully consider", audio: "/audio/unit-26/consider.mp3", l1_interference_vn: "⚠️ \'Consider + V-ING\': \'consider doing sth\'. KHÔNG dùng \'consider to do\'." },
    { id: 3, word: "avoid", emoji: "🚫", phonetic: "/əˈvɔɪd/", meaning: "tránh", example: "Try to avoid making the same mistake twice.", example2: "She avoids attending unnecessary meetings.", collocation: "avoid conflict / avoid mistakes / avoid doing", audio: "/audio/unit-26/avoid.mp3", l1_interference_vn: "⚠️ \'Avoid + V-ING\': \'avoid making mistakes\'. SAI: \'avoid to make mistakes\'." },
    { id: 4, word: "appreciate", emoji: "🙏", phonetic: "/əˈpriːʃieɪt/", meaning: "đánh giá cao / biết ơn", example: "I really appreciate you taking the time to help.", example2: "The team appreciates working in a flexible environment.", collocation: "appreciate your help / greatly appreciate / appreciate the effort", audio: "/audio/unit-26/appreciate.mp3" },
    { id: 5, word: "hesitate", emoji: "😟", phonetic: "/ˈhezɪteɪt/", meaning: "do dự / ngần ngại", example: "Don't hesitate to contact me if you need help.", example2: "She hesitated to share her opinion in the meeting.", collocation: "hesitate to do / without hesitation / don't hesitate", audio: "/audio/unit-26/hesitate.mp3" },
    { id: 6, word: "recommend", emoji: "👍", phonetic: "/ˌrekəˈmend/", meaning: "khuyến nghị / giới thiệu", example: "I recommend reading this book on negotiation.", example2: "The consultant recommended changing the strategy.", collocation: "highly recommend / recommend doing / recommend a product", audio: "/audio/unit-26/recommend.mp3" , l1_interference_vn: "⚠️ Sau 'recommend': Ving hoặc that-clause. 'I recommend trying' hoặc 'recommend that you try'." },
    { id: 7, word: "intend", emoji: "🎯", phonetic: "/ɪnˈtend/", meaning: "có ý định / định", example: "I intend to finish this project before the deadline.", example2: "We intend to launch the new product in Q2.", collocation: "intend to do / original intention / well-intended", audio: "/audio/unit-26/intend.mp3" },
    { id: 8, word: "propose", emoji: "📋", phonetic: "/prəˈpəʊz/", meaning: "đề nghị / đề xuất", example: "She proposed restructuring the entire team.", example2: "I'd like to propose a different approach.", collocation: "propose a solution / formally propose / proposal", audio: "/audio/unit-26/propose.mp3", l1_interference_vn: "⚠️ + V-ing hoặc that-clause: \'propose doing sth\'. KHÔNG dùng \'propose to do\' theo nghĩa gợi ý." },
    { id: 9, word: "commit", emoji: "✊", phonetic: "/kəˈmɪt/", meaning: "cam kết", example: "We are committed to delivering quality results.", example2: "I commit to finishing this by the end of the week.", collocation: "commit to / fully committed / commitment to excellence", audio: "/audio/unit-26/commit.mp3", l1_interference_vn: "⚠️ \'Commit TO + V-ING\': \'commit to improving quality\'. Không phải \'commit to improve\'." },
    { id: 10, word: "implement", emoji: "⚙️", phonetic: "/ˈɪmplɪment/", meaning: "thực hiện / triển khai", example: "We plan to implement the new system next month.", example2: "Consider implementing a feedback process.", collocation: "implement a solution / fully implement / implementation plan", audio: "/audio/unit-26/implement.mp3" },
    { id: 11, word: "prefer", emoji: "💜", phonetic: "/prɪˈfɜːr/", meaning: "thích hơn / ưa thích", example: "I prefer working in the morning when it's quiet.", example2: "She prefers to attend meetings in person.", collocation: "prefer doing / prefer to do / much prefer", audio: "/audio/unit-26/prefer.mp3" , l1_interference_vn: "⚠️ 'Prefer A TO B' — không phải 'prefer A than B'. 'I prefer tea to coffee' — đúng." },
    { id: 12, word: "negotiate", emoji: "🤝", phonetic: "/nɪˈɡəʊʃieɪt/", meaning: "đàm phán", example: "We need to avoid rushing when negotiating contracts.", example2: "She agreed to negotiate the terms directly.", collocation: "negotiate a deal / open to negotiation / skilled negotiator", audio: "/audio/unit-26/negotiate.mp3", l1_interference_vn: "⚠️ \'Negotiate a deal/contract\' — không dùng \'negotiate to\' hay \'negotiate for sth\' trực tiếp." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Cuộc họp đề xuất phương án",
      audio: "/audio/unit-26/dialogue_1.mp3",
      desc: "Nhóm thảo luận về cách tiếp cận dự án mới.",
      lines: [
        { id: "d1-1", speaker: "Manager", text: "We need a new approach. Does anyone have suggestions?", translation: "Chúng ta cần một cách tiếp cận mới. Ai có đề xuất không?" },
        { id: "d1-2", speaker: "Minh", text: "I suggest dividing the project into three phases. I recommend starting with user research.", translation: "Tôi đề xuất chia dự án thành ba giai đoạn. Tôi khuyến nghị bắt đầu bằng nghiên cứu người dùng." },
        { id: "d1-3", speaker: "Lan", text: "I agree. I'd also like to propose implementing weekly check-ins so we avoid falling behind.", translation: "Tôi đồng ý. Tôi cũng muốn đề xuất triển khai các buổi check-in hàng tuần để tránh tụt hậu." },
        { id: "d1-4", speaker: "Tom", text: "Good ideas. I prefer to work in smaller teams. I tend to avoid attending too many large meetings.", translation: "Ý kiến hay. Tôi thích làm việc theo nhóm nhỏ hơn. Tôi có xu hướng tránh tham dự quá nhiều cuộc họp lớn." },
        { id: "d1-5", speaker: "Manager", text: "Noted. Do you all agree to commit to the new timeline?", translation: "Ghi nhận. Các bạn có đồng ý cam kết với tiến độ mới không?" },
        { id: "d1-6", speaker: "Minh", text: "Yes. I intend to finish my part two days early. I enjoy having buffer time before deadlines.", translation: "Vâng. Tôi có ý định hoàn thành phần của mình sớm hai ngày. Tôi thích có thời gian đệm trước hạn chót." },
      ],
    },
    {
      id: 2,
      title: "Phỏng vấn về sở thích làm việc",
      audio: "/audio/unit-26/dialogue_2.mp3",
      desc: "Nhà tuyển dụng hỏi về phong cách làm việc.",
      lines: [
        { id: "d2-1", speaker: "HR", text: "How would you describe your working style?", translation: "Bạn mô tả phong cách làm việc của mình như thế nào?" },
        { id: "d2-2", speaker: "Lan", text: "I enjoy collaborating with others, but I also appreciate having time to work independently. I try to avoid leaving things to the last minute.", translation: "Tôi thích cộng tác với người khác, nhưng tôi cũng đánh giá cao thời gian làm việc độc lập. Tôi cố gắng tránh để mọi thứ đến phút chót." },
        { id: "d2-3", speaker: "HR", text: "What would you like to improve about yourself?", translation: "Bạn muốn cải thiện điều gì về bản thân?" },
        { id: "d2-4", speaker: "Lan", text: "I sometimes hesitate to share my ideas in large groups. I've decided to work on this — I plan to speak up more in our team meetings going forward.", translation: "Đôi khi tôi do dự khi chia sẻ ý kiến trong nhóm lớn. Tôi đã quyết định cải thiện điều này — tôi có kế hoạch nói lên nhiều hơn trong các cuộc họp nhóm sắp tới." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "I suggest dividing the project into three phases", options: ["I suggest to divide the project into three phases", "I suggest dividing the project into three phases", "I suggest divided the project into three phases", "I suggest divide the project into three phases"], answer: "I suggest dividing the project into three phases" },
    { id: "lac2", audio_text: "I intend to finish this project before the deadline", options: ["I intend finishing this project before the deadline", "I intend to finishing this project before the deadline", "I intend to finish this project before the deadline", "I intend finish this project before the deadline"], answer: "I intend to finish this project before the deadline" },
    { id: "lac3", audio_text: "I enjoy collaborating with international teams", options: ["I enjoy to collaborate with international teams", "I enjoy collaborating with international teams", "I enjoy collaborate with international teams", "I enjoy collaborated with international teams"], answer: "I enjoy collaborating with international teams" },
    { id: "lac4", audio_text: "She hesitated to share her opinion in the meeting", options: ["She hesitated sharing her opinion in the meeting", "She hesitated to sharing her opinion in the meeting", "She hesitated to share her opinion in the meeting", "She hesitated share her opinion in the meeting"], answer: "She hesitated to share her opinion in the meeting" },
    { id: "lac5", audio_text: "I recommend starting with user research", options: ["I recommend to start with user research", "I recommend starting with user research", "I recommend start with user research", "I recommend started with user research"], answer: "I recommend starting with user research" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "In my work, I enjoy {input}. I always try to avoid {input}. I plan to {input} this year.",
    level1Placeholder: "Ví dụ: collaborating with others — missing deadlines — improve my presentation skills...",
    level2Situation: "Phỏng vấn IELTS Speaking Part 1 & 2: Mô tả phong cách làm việc và sở thích cá nhân. Dùng ít nhất 5 cấu trúc Gerund/Infinitive khác nhau. Trả lời: Bạn thích làm gì? Tránh điều gì? Kế hoạch tương lai là gì?",
    level2Hint: "I enjoy [V-ing]. I avoid [V-ing]. I suggest [V-ing]. I plan to [V]. I decided to [V]. I recommend [V-ing] because [reason]. I consider [V-ing] to be important for [reason].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Gerund vs Infinitive — Quy Tắc Nhớ Mãi",
    rule: "VERB + GERUND (V-ing):\nenjoy / avoid / consider / suggest / recommend / mind / finish / keep / practice\n→ 'I enjoy working.' 'She suggests trying.'\n\nVERB + INFINITIVE (to V):\nwant / decide / hope / plan / agree / refuse / offer / intend / hesitate / promise\n→ 'I want to improve.' 'She decided to quit.'\n\nMẸO NHỚ:\n→ Gerund = hành động thực tế, hiện tại/quá khứ\n→ Infinitive = mục tiêu, tương lai, ý định\n\nĐẶC BIỆT (nghĩa KHÁC NHAU):\nstop + -ing = dừng việc đang làm: 'He stopped smoking.'\nstop + to = dừng lại để làm: 'He stopped to smoke.'",
    examples: [
      { en: "I suggest splitting the team. (suggest + -ing)", vn: "Tôi đề xuất chia nhóm." },
      { en: "She decided to take the IELTS exam. (decide + to)", vn: "Cô ấy quyết định thi IELTS." },
      { en: "I remember sending the email. (remember + -ing = nhớ lại đã làm)", vn: "Tôi nhớ là đã gửi email rồi." },
    ],
    tip: "Học thuộc nhóm: FRIES = Finish, Recommend, Imagine, Enjoy, Suggest → đều + Gerund. WDHARPO = Want, Decide, Hope, Agree, Refuse, Plan, Offer → đều + Infinitive.",
    vnNote: "⚠️ Lưu ý người Việt: Tiếng Việt không phân biệt V-ing vs to-V — cả hai đều là động từ thông thường. Trong tiếng Anh, dùng sai → câu nghe hoàn toàn bất tự nhiên. 'I suggest to go' (WRONG) vs 'I suggest going' (CORRECT).",
    dialogueExample: {
      speaker: "Minh",
      text: "I suggest dividing the project into phases. I enjoy having buffer time. I intend to finish two days early.",
      translation: "Tôi đề xuất chia dự án thành giai đoạn. Tôi thích có thời gian đệm. Tôi có ý định hoàn thành sớm hai ngày.",
      highlight: "suggest + -ing | enjoy + -ing | intend + to",
    },
    ccq: {
      question: "Câu nào ĐÚNG?",
      options: [
        "I suggest to use a new system.",
        "I suggest using a new system.",
        "I want using a new system.",
        "I enjoy to use a new system.",
      ],
      answer: "I suggest using a new system.",
      explanation: "'Suggest' luôn đi với Gerund (-ing). 'Want' luôn đi với Infinitive (to). 'Enjoy' luôn đi với Gerund.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng: 'She recommended ___ the contract before signing.'", options: ["to read", "reading", "read", "to reading"], answer: "reading" },
    { id: "pq2", type: "multiple-choice", question: "Chọn đúng: 'I plan ___ the TOEIC exam next month.'", options: ["taking", "take", "to take", "to taking"], answer: "to take" },
    { id: "pq3", type: "cloze", question: "Điền đúng dạng: 'Avoid ___ (make) the same mistakes.'", answer: "making" },
    { id: "pq4", type: "multiple-choice", question: "Phân biệt: 'I stopped ___ (quit the habit) vs 'I stopped ___ (paused to do)'.", options: ["to smoke / smoking", "smoking / to smoke", "smoking / smoking", "to smoke / to smoke"], answer: "smoking / to smoke" },
    { id: "pq5", type: "multiple-choice", question: "Câu ĐÚNG: Đề xuất phương án mới.", options: ["I suggest to try a different approach.", "I suggest trying a different approach.", "I suggest try a different approach.", "I suggesting a different approach."], answer: "I suggest trying a different approach." },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối động từ với cấu trúc đúng",
    pairs: [
      { left: "enjoy", right: "+ V-ing" },
      { left: "want", right: "+ to V" },
      { left: "suggest", right: "+ V-ing" },
      { left: "decide", right: "+ to V" },
      { left: "avoid", right: "+ V-ing" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Tôi khuyến nghị thử phương pháp học mới.",
      answer: "I recommend trying a new learning method.",
    },
    {
      id: "pt-2",
      prompt_vn: "Bạn nên cân nhắc tránh ăn quá nhiều đồ ngọt.",
      answer: "You should consider avoiding eating too much sweet food.",
    },
    {
      id: "pt-3",
      prompt_vn: "Chúng tôi đánh giá cao sự hỗ trợ của bạn.",
      answer: "We appreciate your support very much.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc26-1",
      sentence: "I prefer tea than coffee in the morning.",
      errorWord: "than",
      correction: "to",
      explanation_vn: "Cấu trúc: 'prefer A TO B'. Không dùng 'than' sau 'prefer'. Ví dụ: 'prefer tea TO coffee'.",
    },
    {
      id: "sc26-2",
      sentence: "She would rather to stay home than go out.",
      errorWord: "to stay",
      correction: "stay",
      explanation_vn: "'Would rather + bare infinitive' (không có 'to'). Đúng: 'would rather STAY home'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la26-1",
      audio_text: "I prefer tea to coffee in the morning.",
      prompt_vn: "Tôi thích trà hơn cà phê vào buổi sáng.",
      words: ["I", "prefer", "tea", "to", "coffee", "in", "the", "morning", ".", "than", "over"],
      answer: "I prefer tea to coffee in the morning .",
    },
    {
      id: "la26-2",
      audio_text: "She would rather stay home than go out tonight.",
      prompt_vn: "Cô ấy thích ở nhà hơn là ra ngoài tối nay.",
      words: ["She", "would", "rather", "stay", "home", "than", "go", "out", "tonight", ".", "to stay", "going"],
      answer: "She would rather stay home than go out tonight .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi đề xuất chia dự án thành ba giai đoạn.",
      words: ["I", "suggest", "dividing", "the", "project", "into", "three", "phases", ".", "would", "could"],
      answer: "I suggest dividing the project into three phases .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy tránh đến muộn các cuộc họp.",
      words: ["She", "avoids", "arriving", "late", "to", "meetings", ".", "would", "could"],
      answer: "She avoids arriving late to meetings .",
    },
    {
      id: "wb3",
      prompt_vn: "Tôi có kế hoạch thi IELTS vào năm tới.",
      words: ["I", "plan", "to", "take", "the", "IELTS", "exam", "next", "year", ".", "would", "could"],
      answer: "I plan to take the IELTS exam next year .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s26-1", prompt_vn: "Tôi đề xuất chia dự án thành ba giai đoạn.", words: ["I", "suggest", "dividing", "the", "project", "into", "three", "phases", "."], answer: "I suggest dividing the project into three phases ." },
    { id: "s26-2", prompt_vn: "Cô ấy tránh đến muộn các cuộc họp.", words: ["She", "avoids", "arriving", "late", "to", "meetings", "."], answer: "She avoids arriving late to meetings ." },
    { id: "s26-3", prompt_vn: "Tôi có kế hoạch thi IELTS vào năm tới.", words: ["I", "plan", "to", "take", "the", "IELTS", "exam", "next", "year", "."], answer: "I plan to take the IELTS exam next year ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch: 'Tôi khuyến nghị thử phương pháp học mới.'", options: ["I recommend to try a new learning method.", "I recommend trying a new learning method.", "I recommend try a new learning method.", "I recommend tried a new learning method."], answer: "I recommend trying a new learning method." },
    { id: "fq2", type: "cloze", question: "Điền: 'She decided ___ (apply) for the position after considering ___ (stay) in her current role.'", answer: "to apply / staying" },
    { id: "fq3", type: "multiple-choice", question: "Câu nào diễn đạt đề xuất B1+ tự nhiên nhất?", options: ["I suggest that we try the new approach.", "I suggest trying the new approach.", "I suggest to try the new approach.", "Both A and B are correct."], answer: "Both A and B are correct." },
    { id: "fq4", type: "translate", question: "Dịch: 'Anh ấy do dự khi chia sẻ ý kiến nhưng quyết định nói lên.'", answer: "He hesitated to share his opinion but decided to speak up." },
    { id: "fq5", type: "multiple-choice", question: "Nghĩa khác nhau — chọn đúng: 'I stopped ___ (đã dừng hẳn thói quen)'", options: ["to smoke", "smoking", "smoke", "to smoking"], answer: "smoking" },
    { id: "q-ex1", type: "multiple-choice", question: "'Would rather' + dạng động từ nào?", options: ["to-infinitive", "bare infinitive", "V-ing", "past participle"], answer: "bare infinitive" },
    { id: "q-ex2", type: "multiple-choice", question: "Câu đúng với 'would rather':", options: ["I'd rather to stay home.", "I'd rather staying home.", "I'd rather stay home.", "I'd rather stayed home."], answer: "I'd rather stay home." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'I'd rather ___ tea than coffee.'", answer: "have" },
    { id: "q-ex4", type: "multiple-choice", question: "'Prefer + V-ing to V-ing': câu đúng:", options: ["I prefer swim to run.", "I prefer swimming to running.", "I prefer swimming than running.", "I prefer to swim than to run."], answer: "I prefer swimming to running." },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Tôi thích ở nhà hơn là đi ra ngoài.'", answer: "I'd rather stay home than go out." },
    { id: "q-ex6", type: "multiple-choice", question: "'It's up to you' nghĩa là:", options: ["Đó là lỗi của bạn", "Tùy bạn quyết định", "Trên bạn", "Bạn không thể làm"], answer: "Tùy bạn quyết định" },
    { id: "q-ex7", type: "multiple-choice", question: "'I'd rather you didn't smoke here.' — cấu trúc này dùng khi:", options: ["Nói về bản thân", "Bày tỏ sở thích về hành động của người khác", "Ra lệnh", "Xin phép"], answer: "Bày tỏ sở thích về hành động của người khác" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr26-1", question: "Ôn tập Unit 25 — Relative pronoun đúng: 'This is the room ___ we hold meetings.'", options: ["who", "which", "that", "where"], answer: "where", type: "multiple-choice" },
    { id: "cr26-2", question: "Ôn tập Unit 24 — Điền Passive: 'The report ___ (submit) yesterday.'", options: [], answer: "was submitted", type: "cloze" },
    { id: "cr26-3", question: "Ôn tập Unit 23 — First Conditional đúng:", options: ["If you will sign, we will start.", "If you sign, we will start.", "If you signed, we will start.", "If you sign, we start."], answer: "If you sign, we will start.", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "rather /ˈrɑːðər/",
    description: "Would rather — âm /ð/ trong rather và stress",
    examples: [
        { word: "rather", ipa: "/ˈrɑːðər/", tip: "Âm /ð/ giữa — có rung, không phải /d/ hay /z/. Stress âm 1: RA-ther" },
        { word: "prefer", ipa: "/prɪˈfɜːr/", tip: "Stress âm 2: pre-FER — âm /ɜː/ dài trong fer" },
    ],
    minimalPairs: [
        ["rather /ˈrɑːðər/", "razor /ˈreɪzər/ (âm /z/ khác /ð/)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I enjoy working with international teams", vn: "Tôi thích làm việc với các nhóm quốc tế" },
      { en: "I suggest trying a completely different approach", vn: "Tôi đề xuất thử một cách tiếp cận hoàn toàn khác" },
      { en: "She decided to apply for the senior position", vn: "Cô ấy quyết định nộp đơn cho vị trí cao cấp" },
      { en: "I avoid leaving important tasks to the last minute", vn: "Tôi tránh để công việc quan trọng đến phút chót" },
      { en: "Do you consider working remotely full time?", vn: "Bạn có xem xét làm việc từ xa toàn thời gian không?" },
      { en: "I plan to improve my English this year", vn: "Tôi có kế hoạch cải thiện tiếng Anh năm nay" },
      { en: "I recommend reading the full brief before the meeting", vn: "Tôi khuyến nghị đọc toàn bộ tóm tắt trước cuộc họp" },
      { en: "She refused to sign the contract without legal advice", vn: "Cô ấy từ chối ký hợp đồng khi chưa có tư vấn pháp lý" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit26-reading-1",
    title: "Coffee Culture in Vietnam",
    title_vn: "Đọc đoạn về văn hoá cà phê Việt Nam",
    level: "B1" as const,
    text:
      "Vietnam is one of the world's largest coffee producers, and Vietnamese people are passionate about their coffee. " +
      "Unlike many Western countries, where people prefer drinking coffee quickly on the go, " +
      "Vietnamese people tend to enjoy coffee slowly, sitting in a café with friends. " +
      "Cà phê trứng — egg coffee — is a Hanoi speciality that tourists love trying. " +
      "Many locals would rather have cà phê sữa đá (iced milk coffee) than any other drink. " +
      "Coffee shops in Vietnam range from small pavement stalls, which serve simple black coffee, " +
      "to trendy multi-storey cafés with stunning city views. " +
      "Young Vietnamese people prefer socialising in cafés over going to bars. " +
      "Whether you like strong espresso or sweet iced coffee, Vietnam has something for every taste.",
    questions: [
      {
        id: "u26r-q1",
        question_vn: "Người Việt Nam thường thưởng thức cà phê như thế nào?",
        options: [
          "Quickly, on the way to work",
          "Slowly, sitting in a café with friends",
          "Only in the morning",
          "While working at their desk",
        ],
        answer: "Slowly, sitting in a café with friends",
        explanation_vn: "'Vietnamese people tend to enjoy coffee slowly, sitting in a café with friends.'",
      },
      {
        id: "u26r-q2",
        question_vn: "Cà phê trứng là đặc sản của thành phố nào?",
        options: ["Ho Chi Minh City", "Da Nang", "Hue", "Hanoi"],
        answer: "Hanoi",
        explanation_vn: "'Cà phê trứng — egg coffee — is a Hanoi speciality.'",
      },
      {
        id: "u26r-q3",
        question_vn: "Nhiều người địa phương thích uống gì nhất?",
        options: [
          "Cà phê đen (black coffee)",
          "Cà phê sữa đá (iced milk coffee)",
          "Cà phê trứng (egg coffee)",
          "Espresso",
        ],
        answer: "Cà phê sữa đá (iced milk coffee)",
        explanation_vn: "'Many locals would rather have cà phê sữa đá (iced milk coffee) than any other drink.'",
      },
      {
        id: "u26r-q4",
        question_vn: "Người trẻ Việt Nam thích làm gì hơn là đi quán bar?",
        options: [
          "Staying at home",
          "Going to restaurants",
          "Socialising in cafés",
          "Watching movies",
        ],
        answer: "Socialising in cafés",
        explanation_vn: "'Young Vietnamese people prefer socialising in cafés over going to bars.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Thảo luận KPI và đề xuất cải tiến trong họp team",
      focus: "Performance discussion: metrics, suggestions, action plan",
      context: "Monthly team review với manager",
      l1Note: "⚠️ 'Our conversion rate increased 12%.' 'I suggest we test X.' 'Action: I will own the follow-up.'",
      example: "The target was missed by 8%. I suggest focusing on email campaigns. I will prepare the test plan by Monday."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "2bLhULqFkKI",
};

export default unit26;
