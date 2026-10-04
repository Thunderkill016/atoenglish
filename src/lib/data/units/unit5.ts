import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-5 — Free Time & Hobbies  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit5: UnitData = {
  unitId: "unit-5",
  title: "Unit 5: Free Time & Hobbies",
  level: "A1",
  xp: 80,
  estimatedTime: 40,
  description: "Học cách nói về sở thích và hoạt động giải trí bằng cấu trúc 'like + V-ing'.",
  badgeName: "Người Năng Động",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn tham gia networking event và cần bắt chuyện với người nước ngoài bằng cách nói về sở thích và thời gian rảnh.",
  learningOutcomes: [
    "Nói về sở thích và hoạt động yêu thích bằng tiếng Anh",
    "Hỏi người khác họ thích làm gì khi rảnh",
    "Đề xuất cùng nhau làm một hoạt động"
  ],
  badgeEmoji: "🎮",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "📚", en: "I like reading books.", vn: "Tôi thích đọc sách.", context: "Nói về sở thích cá nhân" },
    { emoji: "⚽", en: "He likes playing football.", vn: "Anh ấy thích chơi bóng đá.", context: "Dùng 'likes' với He/She/It" },
    { emoji: "🎵", en: "What do you like doing?", vn: "Bạn thích làm gì?", context: "Câu hỏi về sở thích" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Người Việt thường hỏi <span class=\"text-emerald-400 font-semibold\">What do you like doing in your free time?</span> hoặc ngắn hơn <span class=\"text-emerald-400 font-semibold\">What are your hobbies?</span>. Cả hai cách đều tự nhiên và lịch sự.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "reading", emoji: "📚", phonetic: "/ˈriːdɪŋ/", meaning: "đọc sách", example: "I like reading every night.", example2: "Reading is my favourite hobby.", collocation: "like reading books", audio: "/audio/unit-5/reading.mp3" , l1_interference_vn: "⚠️ 'I like reading' (V-ing sau like) — không phải 'I like read'. Lỗi cực phổ biến." },
    { id: 2, word: "listening to music", emoji: "🎵", phonetic: "/ˈlɪsənɪŋ tə ˈmjuːzɪk/", meaning: "nghe nhạc", example: "She likes listening to music.", example2: "I enjoy listening to music while studying.", collocation: "listen to music / pop music", audio: "/audio/unit-5/listening_to_music.mp3" , l1_interference_vn: "⚠️ 'Listen TO music' — không quên giới từ 'to'. Hay bỏ: 'listen music' — sai." },
    { id: 3, word: "playing football", emoji: "⚽", phonetic: "/ˈpleɪɪŋ ˈfʊtbɔːl/", meaning: "chơi bóng đá", example: "He likes playing football on weekends.", example2: "Playing football keeps me fit.", collocation: "play football with friends", audio: "/audio/unit-5/playing_football.mp3", l1_interference_vn: "⚠️ 'Play football/soccer' — KHÔNG 'play the football'. Môn thể thao KHÔNG có 'the' sau 'play'." },
    { id: 4, word: "swimming", emoji: "🏊", phonetic: "/ˈswɪmɪŋ/", meaning: "bơi lội", example: "I like swimming in the summer.", example2: "Swimming is good for your health.", collocation: "go swimming", audio: "/audio/unit-5/swimming.mp3" , l1_interference_vn: "⚠️ 'Go swimming' — outdoor sports dùng 'go + V-ing'. 'Play swimming' — sai." },
    { id: 5, word: "cooking", emoji: "🍳", phonetic: "/ˈkʊkɪŋ/", meaning: "nấu ăn", example: "My mum likes cooking Vietnamese food.", example2: "I enjoy cooking for my family.", collocation: "love cooking", audio: "/audio/unit-5/cooking.mp3" , l1_interference_vn: "⚠️ 'I enjoy cooking' — sau enjoy/like/love/hate dùng V-ing, không dùng to-infinitive." },
    { id: 6, word: "drawing", emoji: "✏️", phonetic: "/ˈdrɔːɪŋ/", meaning: "vẽ", example: "She likes drawing portraits.", example2: "I like drawing in my free time.", collocation: "like drawing / enjoy drawing", audio: "/audio/unit-5/drawing.mp3", l1_interference_vn: "⚠️ 'Drawing' (hobby) = vẽ tranh. 'Drawing' sau 'like/enjoy/love' — V-ing. 'I like drawing' (không phải 'I like draw')." },
    { id: 7, word: "traveling", emoji: "✈️", phonetic: "/ˈtrævəlɪŋ/", meaning: "du lịch", example: "They like traveling to new places.", example2: "Traveling helps me learn about new cultures.", collocation: "enjoy traveling", audio: "/audio/unit-5/traveling.mp3" , l1_interference_vn: "⚠️ British: 'travelling' (2 l), American: 'traveling' (1 l). Cả hai đều đúng." },
    { id: 8, word: "gaming", emoji: "🎮", phonetic: "/ˈɡeɪmɪŋ/", meaning: "chơi game", example: "He likes gaming in the evening.", example2: "Gaming is a popular hobby for young people.", collocation: "enjoy gaming online", audio: "/audio/unit-5/gaming.mp3" , l1_interference_vn: "⚠️ 'Play video games' hay 'go gaming'. 'Do gaming' không chuẩn trong văn nói." },
    { id: 9, word: "dancing", emoji: "💃", phonetic: "/ˈdɑːnsɪŋ/", meaning: "nhảy múa", example: "She likes dancing in her free time.", example2: "We enjoy dancing together.", collocation: "love dancing", audio: "/audio/unit-5/dancing.mp3" , l1_interference_vn: "⚠️ 'Go dancing' hoặc 'I love dancing'. 'Do dancing' — sai trong văn nói thông thường." },
    { id: 10, word: "cycling", emoji: "🚲", phonetic: "/ˈsaɪklɪŋ/", meaning: "đạp xe", example: "I like cycling to work.", example2: "Cycling is a great way to exercise.", collocation: "go cycling / enjoy cycling", audio: "/audio/unit-5/cycling.mp3", l1_interference_vn: "⚠️ 'Go cycling' hoặc 'cycle'. 'Cycling' sau preposition: 'I'm good at cycling'. KHÔNG 'go to cycling'." },
    { id: 11, word: "photography", emoji: "📷", phonetic: "/fəˈtɒɡrəfi/", meaning: "chụp ảnh", example: "He likes photography on weekends.", example2: "Photography is her main hobby.", collocation: "enjoy photography", audio: "/audio/unit-5/photography.mp3" , l1_interference_vn: "⚠️ Stress: pho-TOG-ra-phy (âm 2). 4 âm tiết. Người Việt hay stress âm 1." },
    { id: 12, word: "watching movies", emoji: "🎬", phonetic: "/ˈwɒtʃɪŋ ˈmuːviz/", meaning: "xem phim", example: "I like watching movies on Friday nights.", example2: "We enjoy watching movies together at home.", collocation: "love watching movies", audio: "/audio/unit-5/watching_movies.mp3", l1_interference_vn: "⚠️ 'Watch movies' (tại nhà) vs 'see a movie' (ở rạp). 'Watching' sau like/love/enjoy trong câu thói quen." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Sở thích cuối tuần",
      audio: "/audio/unit-5/dialogue_1.mp3",
      desc: "Mai và Tom nói chuyện về sở thích và hoạt động cuối tuần.",
      lines: [
        { id: "d1-1", speaker: "Tom", text: "What do you like doing in your free time?", translation: "Bạn thích làm gì trong thời gian rảnh?" },
        { id: "d1-2", speaker: "Mai", text: "I like reading and listening to music. And you?", translation: "Tôi thích đọc sách và nghe nhạc. Còn bạn?" },
        { id: "d1-3", speaker: "Tom", text: "I like playing football with my friends.", translation: "Tôi thích chơi bóng đá với bạn bè." },
        { id: "d1-4", speaker: "Mai", text: "Do you like swimming too?", translation: "Bạn có thích bơi lội không?" },
        { id: "d1-5", speaker: "Tom", text: "Yes! I go swimming every Saturday morning.", translation: "Có! Tôi đi bơi mỗi sáng thứ Bảy." },
      ]
    },
    {
      id: 2,
      title: "Câu lạc bộ sở thích",
      audio: "/audio/unit-5/dialogue_2.mp3",
      desc: "Lan đang tìm câu lạc bộ sở thích tại trường và hỏi bạn cùng lớp.",
      lines: [
        { id: "d2-1", speaker: "Lan", text: "Hi! Do you have any hobbies?", translation: "Chào! Bạn có sở thích gì không?" },
        { id: "d2-2", speaker: "Nam", text: "Yes! I really like drawing and photography.", translation: "Có! Tôi rất thích vẽ và chụp ảnh." },
        { id: "d2-3", speaker: "Lan", text: "That's great! I like cooking and dancing.", translation: "Tuyệt vời! Tôi thích nấu ăn và nhảy múa." },
        { id: "d2-4", speaker: "Nam", text: "We should join the art club together!", translation: "Chúng mình nên tham gia câu lạc bộ nghệ thuật cùng nhau!" },
        { id: "d2-5", speaker: "Lan", text: "Great idea! I also like watching movies.", translation: "Ý tưởng hay đấy! Tôi cũng thích xem phim." },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "I like reading books", options: ["I like cooking food", "I like reading books", "I like playing games", "I like swimming"], answer: "I like reading books" },
    { id: "lac2", audio_text: "She likes dancing", options: ["She likes singing", "He likes dancing", "She likes dancing", "She likes drawing"], answer: "She likes dancing" },
    { id: "lac3", audio_text: "We like traveling to new places", options: ["We like traveling to new places", "We like staying at home", "They like traveling", "We like playing football"], answer: "We like traveling to new places" },
    { id: "lac4", audio_text: "Do you like swimming", options: ["Do you like cooking", "Do you like swimming", "Does she like swimming", "Do you like running"], answer: "Do you like swimming" },
    { id: "lac5", audio_text: "He likes playing football on weekends", options: ["He likes playing football every day", "She likes playing football on weekends", "He likes playing football on weekends", "He likes watching football on weekends"], answer: "He likes playing football on weekends" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I like {input} in my free time.",
    level1Placeholder: "Ví dụ: reading, swimming, cooking...",
    level2Situation: "Bạn đang trò chuyện với một người bạn ngoại quốc về sở thích. Kể cho họ nghe bạn thích làm gì, khi nào và tại sao.",
    level2Hint: "I like [sở thích] in my free time. I also enjoy [sở thích khác]. My favourite hobby is [sở thích yêu thích nhất] because [lý do].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "like + V-ing — Diễn đạt sở thích",
    rule: "I/You/We/They like + V-ing  |  He/She/It likes + V-ing",
    conjugation: [
      { subject: "I / You / We / They", form: "like + V-ing", example: "I like reading books." },
      { subject: "He / She / It", form: "likes + V-ing", example: "She likes swimming every day." },
    ],
    examples: [
      { en: "I like listening to music.", vn: "Tôi thích nghe nhạc." },
      { en: "He likes playing football.", vn: "Anh ấy thích chơi bóng đá." },
      { en: "Do you like cooking?", vn: "Bạn có thích nấu ăn không?" },
      { en: "She doesn't like watching TV.", vn: "Cô ấy không thích xem TV." },
    ],
    tip: "Sau 'like/likes' luôn dùng V-ing (không dùng động từ nguyên thể). Sai: 'I like swim'. Đúng: 'I like swimming'. Cũng có thể dùng 'enjoy + V-ing' với nghĩa tương tự.",
    vnNote: "⚠️ Lưu ý: Sau 'like/enjoy/love', tiếng Anh dùng V-ing, KHÔNG dùng động từ nguyên thể. 'I like swim' (SAI) → 'I like swimming' (ĐÚNG). Tiếng Việt không có quy tắc này nên người Việt thường mắc lỗi.",
    dialogueExample: {
      speaker: "Mai",
      text: "I like reading and listening to music. And you?",
      translation: "Tôi thích đọc sách và nghe nhạc. Còn bạn?",
      highlight: "I like reading",
    },
    ccq: {
      question: "Câu nào đúng cấu trúc?",
      options: ["She like swim.", "She likes to swimming.", "She likes swimming.", "She like swimming."],
      answer: "She likes swimming.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối sở thích với nghĩa tiếng Việt",
    pairs: [
      { left: "reading", right: "đọc sách" },
      { left: "swimming", right: "bơi lội" },
      { left: "cooking", right: "nấu ăn" },
      { left: "drawing", right: "vẽ" },
      { left: "traveling", right: "du lịch" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", question: "Chọn dạng đúng: 'He ___ football every day.'", options: ["like playing", "likes playing", "likes play", "like play"], answer: "likes playing", type: "multiple-choice" },
    { id: "pq2", question: "'I like cooking.' — Từ 'cooking' là gì?", options: ["Tính từ", "Danh từ", "Động từ dạng -ing", "Trạng từ"], answer: "Động từ dạng -ing", type: "multiple-choice" },
    { id: "pq3", question: "Điền từ còn thiếu: 'She ___ dancing very much.'", options: [], answer: "likes", type: "cloze" },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    { id: "pt5-1", prompt_vn: "Tôi thích đọc sách vào cuối tuần.", answer: "I like reading books at the weekend." },
    { id: "pt5-2", prompt_vn: "Anh ấy không thích xem phim.", answer: "He doesn't like watching movies." },
    { id: "pt5-3", prompt_vn: "Bạn thích làm gì vào thời gian rảnh?", answer: "What do you like doing in your free time?" },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "q1", question: "Câu nào đúng với chủ ngữ 'He'?", options: ["He like reading.", "He likes reading.", "He liking reading.", "He liked reading."], answer: "He likes reading.", type: "multiple-choice",
      explanation_vn: "'He' → thêm '-s': 'likes'. Sau 'like/likes' dùng V-ing: 'likes reading'. 'He liking' thiếu động từ 'to be'." },
    { id: "q2", question: "'Do you like swimming?' — Trả lời phủ định:", options: ["No, I don't like swim.", "No, I don't like swimming.", "No, I doesn't like swimming.", "No, I not like swimming."], answer: "No, I don't like swimming.", type: "multiple-choice",
      explanation_vn: "'I' dùng 'don't' (không dùng 'doesn't'). Sau 'like' vẫn giữ V-ing: 'don't like swimming'." },
    { id: "q3", question: "Sở thích nào KHÔNG phải là thể thao?", options: ["swimming", "cycling", "playing football", "reading"], answer: "reading", type: "multiple-choice",
      explanation_vn: "'Reading' (đọc sách) không phải thể thao. Swimming/cycling/football là hoạt động thể chất." },
    { id: "q4", question: "Điền vào chỗ trống: 'They like ___ to music every evening.'", options: [], answer: "listening", type: "cloze" },
    { id: "q5", question: "Điền vào chỗ trống: 'She ___ playing chess.'", options: [], answer: "likes", type: "cloze" },
    { id: "q6", question: "Tôi thích chụp ảnh vào cuối tuần.", options: [], answer: "I like taking photos on weekends.", type: "translate" },
    { id: "q7", question: "Bạn có thích du lịch không?", options: [], answer: "Do you like traveling?", type: "translate" },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la5-1",
      audio_text: "I love listening to music in my free time.",
      prompt_vn: "Tôi thích nghe nhạc vào thời gian rảnh.",
      words: ["I", "love", "listening", "to", "music", "in", "my", "free", "time", ".", "hear", "liked"],
      answer: "I love listening to music in my free time .",
    },
    {
      id: "la5-2",
      audio_text: "She enjoys cooking and reading books.",
      prompt_vn: "Cô ấy thích nấu ăn và đọc sách.",
      words: ["She", "enjoys", "cooking", "and", "reading", "books", ".", "enjoy", "cooks"],
      answer: "She enjoys cooking and reading books .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi thích chơi bóng đá.",
      words: ["I", "like", "playing", "football", ".", "was", "were"],
      answer: "I like playing football .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy thích đọc sách mỗi tối.",
      words: ["She", "likes", "reading", "books", "every", "evening", ".", "was", "were"],
      answer: "She likes reading books every evening .",
    },
    {
      id: "wb3",
      prompt_vn: "Chúng tôi thích nghe nhạc.",
      words: ["We", "like", "listening", "to", "music", ".", "was", "were"],
      answer: "We like listening to music .",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc5-1",
      sentence: "I like swim every morning.",
      errorWord: "swim",
      correction: "swimming",
      explanation_vn: "Sau 'like' luôn dùng V-ing: 'like swimming'. Không dùng động từ nguyên mẫu trực tiếp sau 'like'.",
    },
    {
      id: "sc5-2",
      sentence: "She don't like cooking.",
      errorWord: "don't",
      correction: "doesn't",
      explanation_vn: "'She' (ngôi 3 số ít) → dùng 'doesn't'. 'Don't' dùng cho I/you/we/they.",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s5-1",
      prompt_vn: "Tôi thích chơi bóng đá.",
      words: ["I", "like", "playing", "football", "."],
      answer: "I like playing football .",
    },
    {
      id: "s5-2",
      prompt_vn: "Cô ấy thích đọc sách mỗi tối.",
      words: ["She", "likes", "reading", "books", "every", "evening", "."],
      answer: "She likes reading books every evening .",
    },
    {
      id: "s5-3",
      prompt_vn: "Chúng tôi thích nghe nhạc.",
      words: ["We", "like", "listening", "to", "music", "."],
      answer: "We like listening to music .",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr5-1",
      question: "Chọn dạng đúng: 'He ___ to work by bus every day.' (Unit 4: Present Simple)",
      options: ["go", "goes", "going", "gone"],
      answer: "goes",
      type: "multiple-choice",
    },
    {
      id: "cr5-2",
      question: "Cô ấy đánh răng mỗi buổi sáng. (Unit 4)",
      options: [],
      answer: "She brushes her teeth every morning.",
      type: "translate",
    },
    {
      id: "cr5-3",
      question: "Cô ấy đi làm bằng xe buýt mỗi ngày. (Unit 3)",
      options: [],
      answer: "She goes to work by bus every day.",
      type: "translate",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/r/",
    description: "Âm /r/ tiếng Anh — không cuộn lưỡi, phát âm từ cuống họng",
    examples: [
        { word: "reading", ipa: "/ˈriːdɪŋ/", tip: "Lưỡi không chạm đâu cả, hơi cong nhẹ về sau — không như /r/ cuộn tiếng Việt" },
        { word: "right", ipa: "/raɪt/", tip: "Bắt đầu từ cuống họng, không có âm r cuộn" },
    ],
    minimalPairs: [
        ["rock", "lock"],
        ["red", "led"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I like reading", vn: "Tôi thích đọc sách" },
      { en: "She enjoys cooking", vn: "Cô ấy thích nấu ăn" },
      { en: "He loves playing football", vn: "Anh ấy yêu bóng đá" },
      { en: "We prefer working from home", vn: "Chúng tôi thích làm ở nhà" },
      { en: "I hate being late", vn: "Tôi ghét đi trễ" },
      { en: "She avoids eating sugar", vn: "Cô ấy tránh ăn đường" },
      { en: "He enjoys listening to music", vn: "Anh ấy thích nghe nhạc" },
      { en: "I don't mind overtime", vn: "Tôi không ngại làm thêm giờ" },
    ],
  },


  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit5-reading-1",
    title: "My Hobbies",
    title_vn: "Đọc đoạn về sở thích",
    level: "A1" as const,
    text:
      "Hi! My name is Lan. I have many hobbies. " +
      "I like reading books and listening to music. " +
      "My friend Nam likes playing football and swimming. " +
      "On weekends, we like cycling together in the park. " +
      "My sister likes cooking Vietnamese food. " +
      "She also enjoys watching movies at home. " +
      "We all have different hobbies, but we love spending time together!",
    questions: [
      {
        id: "u5r-q1",
        question_vn: "Lan thích làm gì?",
        options: [
          "Playing football and swimming",
          "Reading books and listening to music",
          "Cooking and dancing",
          "Drawing and photography",
        ],
        answer: "Reading books and listening to music",
        explanation_vn: "Đoạn văn nói 'I like reading books and listening to music.'",
      },
      {
        id: "u5r-q2",
        question_vn: "Nam thích làm gì vào cuối tuần?",
        options: [
          "Cooking and watching movies",
          "Reading and cycling",
          "Playing football and swimming",
          "Drawing and gaming",
        ],
        answer: "Playing football and swimming",
        explanation_vn: "Đoạn văn nói 'Nam likes playing football and swimming.'",
      },
      {
        id: "u5r-q3",
        question_vn: "Lan và Nam thích làm gì cùng nhau vào cuối tuần?",
        options: ["Swimming", "Cycling in the park", "Watching movies", "Cooking"],
        answer: "Cycling in the park",
        explanation_vn: "Đoạn văn nói 'we like cycling together in the park.'",
      },
      {
        id: "u5r-q4",
        question_vn: "Em gái của Lan thích làm gì?",
        options: [
          "Playing football",
          "Reading books",
          "Cooking Vietnamese food and watching movies",
          "Listening to music",
        ],
        answer: "Cooking Vietnamese food and watching movies",
        explanation_vn: "Đoạn văn nói 'My sister likes cooking Vietnamese food. She also enjoys watching movies.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Nói về sở thích với đồng nghiệp lúc nghỉ trưa",
      focus: "I like / She likes + hobbies (cycling, cooking, watching movies)",
      context: "Icebreaker team lunch hoặc sau giờ làm tại văn phòng",
      l1Note: "⚠️ 'I like cycling' không 'I like to cycling'. 'She likes cooking Vietnamese food'.",
      example: "I like reading books after work. My colleague likes playing football on weekends."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "EDFWbC74Sdc", // BBC Learning English — Numbers 1-100
};


