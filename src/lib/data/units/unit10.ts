import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-10 — Abilities & Daily Skills  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit10: UnitData = {
  unitId: "unit-10",
  title: "Unit 10: Abilities & Daily Skills",
  level: "A1",
  xp: 80,
  estimatedTime: 40,
  description: "Học cách nói về khả năng bản thân bằng 'can/can't' và hỏi về kỹ năng của người khác.",
  badgeName: "Người Đa Tài",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Trong buổi phỏng vấn xin việc, nhà tuyển dụng hỏi bạn có thể làm gì và kỹ năng nào bạn giỏi nhất.",
  learningOutcomes: [
    "Nói về khả năng và kỹ năng của bản thân bằng can/can't",
    "Hỏi người khác họ có thể làm gì",
    "Mô tả điểm mạnh và điểm yếu trong tiếng Anh"
  ],
  badgeEmoji: "⭐",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🏊", en: "I can swim very well.", vn: "Tôi có thể bơi rất giỏi.", context: "Nói về khả năng bản thân" },
    { emoji: "🎸", en: "Can you play the guitar?", vn: "Bạn có thể chơi guitar không?", context: "Hỏi về khả năng người khác" },
    { emoji: "❌", en: "I can't speak Japanese.", vn: "Tôi không thể nói tiếng Nhật.", context: "Phủ định khả năng" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "<span class=\"text-emerald-400 font-semibold\">Can</span> là modal verb — không thêm -s dù chủ ngữ là He/She/It. Sai: 'She cans swim'. Đúng: 'She can swim'. Người Việt hay mắc lỗi này vì quen với quy tắc thêm -s của Present Simple.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "swim", emoji: "🏊", phonetic: "/swɪm/", meaning: "bơi lội", example: "I can swim across the river.", example2: "Can you swim in the sea?", collocation: "swim well / swim fast", audio: "/audio/unit-10/swim.mp3" , l1_interference_vn: "⚠️ 'Can swim' — KHÔNG thêm 'to': 'can TO swim' SAI. Sau modal dùng V nguyên thể." },
    { id: 2, word: "drive", emoji: "🚗", phonetic: "/draɪv/", meaning: "lái xe", example: "She can drive a car.", example2: "Can you drive a motorbike?", collocation: "drive a car / drive safely", audio: "/audio/unit-10/drive.mp3" , l1_interference_vn: "⚠️ 'Drive a car' — cần mạo từ 'a' (lần đầu đề cập) hoặc 'the car' (cái xe cụ thể)." },
    { id: 3, word: "cook", emoji: "🍳", phonetic: "/kʊk/", meaning: "nấu ăn", example: "I can cook Vietnamese food.", example2: "My dad can cook very well.", collocation: "cook well / cook for someone", audio: "/audio/unit-10/cook.mp3" , l1_interference_vn: "⚠️ 'Cook' vừa là động từ vừa danh từ (đầu bếp). 'She's a great cook' ≠ 'she cooks well'." },
    { id: 4, word: "sing", emoji: "🎤", phonetic: "/sɪŋ/", meaning: "hát", example: "He can sing beautifully.", example2: "Can you sing any English songs?", collocation: "sing a song / sing in tune", audio: "/audio/unit-10/sing.mp3" , l1_interference_vn: "⚠️ Âm cuối /ŋ/ giống âm 'ng' trong 'không' tiếng Việt — người Việt thường phát âm đúng!" },
    { id: 5, word: "play the guitar", emoji: "🎸", phonetic: "/pleɪ ðə ɡɪˈtɑːr/", meaning: "chơi guitar", example: "I can play the guitar.", example2: "She can play the guitar and the piano.", collocation: "play the guitar / play guitar well", audio: "/audio/unit-10/play_guitar.mp3", l1_interference_vn: "⚠️ Nhạc cụ LUÔN có 'the': 'play the guitar/piano/violin'. Môn thể thao KHÔNG có 'the': 'play football'." },
    { id: 6, word: "speak", emoji: "🗣️", phonetic: "/spiːk/", meaning: "nói (ngôn ngữ)", example: "I can speak English and Vietnamese.", example2: "Can you speak slowly, please?", collocation: "speak English / speak fluently", audio: "/audio/unit-10/speak.mp3" , l1_interference_vn: "⚠️ 'Speak English' — không có mạo từ. 'Speak THE English' SAI. 'Speak the language' — cần 'the'." },
    { id: 7, word: "read", emoji: "📖", phonetic: "/riːd/", meaning: "đọc", example: "She can read English books.", example2: "I can read and write in French.", collocation: "read well / read fast", audio: "/audio/unit-10/read.mp3" , l1_interference_vn: "⚠️ Hiện tại /riːd/, quá khứ /rɛd/ (đồng âm 'red'). Người Việt hay đọc quá khứ như hiện tại." },
    { id: 8, word: "dance", emoji: "💃", phonetic: "/dɑːns/", meaning: "nhảy múa", example: "Can you dance?", example2: "I can't dance very well.", collocation: "dance well / dance to music", audio: "/audio/unit-10/dance.mp3" , l1_interference_vn: "⚠️ Âm /dɑːns/ (Anh) vs /dæns/ (Mỹ). Âm 'a' khác nhau — cả hai được chấp nhận." },
    { id: 9, word: "fix", emoji: "🔧", phonetic: "/fɪks/", meaning: "sửa chữa", example: "My dad can fix a motorbike.", example2: "Can you fix my phone?", collocation: "fix a car / fix a problem", audio: "/audio/unit-10/fix.mp3", l1_interference_vn: "⚠️ 'Fix' = sửa chữa (Anh-Mỹ). 'Repair' = sửa chữa (formal hơn). 'Fix' còn = chuẩn bị: 'fix dinner'." },
    { id: 10, word: "use a computer", emoji: "💻", phonetic: "/juːz ə kəmˈpjuːtər/", meaning: "dùng máy tính", example: "I can use a computer well.", example2: "She can use a computer for her work.", collocation: "use a computer / use software", audio: "/audio/unit-10/use_computer.mp3", l1_interference_vn: "⚠️ 'Use a computer' (máy tính cụ thể) vs 'use computers' (nói chung). KHÔNG 'use the computer' trừ khi đã đề cập." },
    { id: 11, word: "draw", emoji: "✏️", phonetic: "/drɔː/", meaning: "vẽ", example: "He can draw portraits very well.", example2: "I can't draw at all!", collocation: "draw well / draw a picture", audio: "/audio/unit-10/draw.mp3" , l1_interference_vn: "⚠️ Âm /drɔː/ — 'aw' đọc như trong 'saw'. Người Việt hay đọc thành 'dro' (âm ngắn)." },
    { id: 12, word: "take photos", emoji: "📷", phonetic: "/teɪk ˈfəʊtəʊz/", meaning: "chụp ảnh", example: "She can take beautiful photos.", example2: "Can you take a photo of us?", collocation: "take photos / take a photo of", audio: "/audio/unit-10/take_photos.mp3", l1_interference_vn: "⚠️ 'Take photos/pictures' — KHÔNG 'make photos'. 'Take a selfie'. 'Take' là collocation cố định với photos." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Buổi phỏng vấn tình nguyện",
      audio: "/audio/unit-10/dialogue_1.mp3",
      desc: "Minh đang phỏng vấn để tham gia một câu lạc bộ tình nguyện.",
      lines: [
        { id: "d1-1", speaker: "Interviewer", text: "Hello! What can you do for our club?", translation: "Xin chào! Bạn có thể làm gì cho câu lạc bộ chúng tôi?" },
        { id: "d1-2", speaker: "Minh", text: "I can speak English and I can use a computer.", translation: "Tôi có thể nói tiếng Anh và dùng máy tính." },
        { id: "d1-3", speaker: "Interviewer", text: "Can you drive a car or a motorbike?", translation: "Bạn có thể lái xe ô tô hay xe máy không?" },
        { id: "d1-4", speaker: "Minh", text: "I can drive a motorbike but I can't drive a car yet.", translation: "Tôi có thể lái xe máy nhưng chưa thể lái xe ô tô." },
        { id: "d1-5", speaker: "Interviewer", text: "Can you cook?", translation: "Bạn có thể nấu ăn không?" },
        { id: "d1-6", speaker: "Minh", text: "Yes! I can cook Vietnamese food very well.", translation: "Có! Tôi có thể nấu đồ ăn Việt Nam rất ngon." },
      ]
    },
    {
      id: 2,
      title: "Tìm người bạn học",
      audio: "/audio/unit-10/dialogue_2.mp3",
      desc: "Lan tìm bạn học nhóm và hỏi về kỹ năng của nhau.",
      lines: [
        { id: "d2-1", speaker: "Lan", text: "Can you help me with my English homework?", translation: "Bạn có thể giúp tôi làm bài tập tiếng Anh không?" },
        { id: "d2-2", speaker: "Nam", text: "Sure! I can speak and read English well.", translation: "Được chứ! Tôi có thể nói và đọc tiếng Anh tốt." },
        { id: "d2-3", speaker: "Lan", text: "Great! Can you sing English songs too?", translation: "Tuyệt! Bạn có thể hát nhạc tiếng Anh không?" },
        { id: "d2-4", speaker: "Nam", text: "Ha! No, I can't sing at all. I'm terrible!", translation: "Haha! Không, tôi không thể hát chút nào. Tôi hát rất tệ!" },
        { id: "d2-5", speaker: "Lan", text: "That's OK! I can sing but I can't play guitar.", translation: "Không sao! Tôi có thể hát nhưng không biết chơi guitar." },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "I can swim very well", options: ["I can run very well", "She can swim very well", "I can swim very well", "I can't swim very well"], answer: "I can swim very well" },
    { id: "lac2", audio_text: "She can drive a car", options: ["She can drive a bus", "She can't drive a car", "He can drive a car", "She can drive a car"], answer: "She can drive a car" },
    { id: "lac3", audio_text: "I can't speak Japanese", options: ["I can speak Japanese", "I can't speak Chinese", "I can't speak Japanese", "She can't speak Japanese"], answer: "I can't speak Japanese" },
    { id: "lac4", audio_text: "Can you cook Vietnamese food", options: ["Can you eat Vietnamese food", "Can you cook Vietnamese food", "Can she cook Vietnamese food", "Can you cook Chinese food"], answer: "Can you cook Vietnamese food" },
    { id: "lac5", audio_text: "He can play the guitar", options: ["She can play the guitar", "He can play the piano", "He can't play the guitar", "He can play the guitar"], answer: "He can play the guitar" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I can {input} very well.",
    level1Placeholder: "Ví dụ: swim, cook, sing, speak English...",
    level2Situation: "Bạn đang tham gia một buổi giới thiệu bản thân tại lớp học mới. Nói về 3 thứ bạn có thể làm tốt và 2 thứ bạn chưa thể làm.",
    level2Hint: "My name is [tên]. I can [kỹ năng 1] and [kỹ năng 2]. I can also [kỹ năng 3]. But I can't [chưa làm được 1] or [chưa làm được 2] yet.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Can / Can't — Diễn đạt khả năng",
    rule: "Subject + can + verb (không thêm -s) | Subject + can't + verb | Can + subject + verb?",
    conjugation: [
      { subject: "I / You / He / She / It / We / They", form: "can + verb", example: "She can swim." },
      { subject: "I / You / He / She / It / We / They", form: "can't + verb", example: "He can't drive." },
    ],
    examples: [
      { en: "I can speak English.", vn: "Tôi có thể nói tiếng Anh." },
      { en: "She can't drive a car.", vn: "Cô ấy không thể lái xe ô tô." },
      { en: "Can you cook?", vn: "Bạn có thể nấu ăn không?" },
      { en: "He can play the guitar and sing.", vn: "Anh ấy có thể chơi guitar và hát." },
    ],
    tip: "Can là modal verb — KHÔNG thêm -s dù chủ ngữ là He/She/It. Sai: 'She cans swim'. Đúng: 'She can swim'. Phủ định: can't (= cannot). Câu hỏi: đảo 'Can' lên đầu câu.",
    vnNote: "⚠️ Lưu ý: Prepositions (at/on/in) không có tương đương 1-1 với tiếng Việt. Người Việt thường dùng sai: 'at Monday' (SAI) → 'on Monday' (ĐÚNG). Quy tắc: at + giờ cụ thể, on + ngày/thứ, in + tháng/năm/buổi.",
    dialogueExample: {
      speaker: "Minh",
      text: "I can drive a motorbike but I can't drive a car yet.",
      translation: "Tôi có thể lái xe máy nhưng chưa thể lái xe ô tô.",
      highlight: "can / can't",
    },
    ccq: {
      question: "Câu nào đúng với chủ ngữ 'She'?",
      options: ["She cans swim.", "She can swims.", "She can swim.", "She is can swim."],
      answer: "She can swim.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối kỹ năng với nghĩa tiếng Việt",
    pairs: [
      { left: "swim", right: "bơi lội" },
      { left: "drive", right: "lái xe" },
      { left: "sing", right: "hát" },
      { left: "fix", right: "sửa chữa" },
      { left: "draw", right: "vẽ" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", question: "Câu nào đúng với 'She'?", options: ["She cans swim.", "She can swims.", "She can swim.", "She is can swim."], answer: "She can swim.", type: "multiple-choice" },
    { id: "pq2", question: "Phủ định của 'I can sing' là gì?", options: ["I don't can sing.", "I can't sing.", "I cannot to sing.", "I not can sing."], answer: "I can't sing.", type: "multiple-choice" },
    { id: "pq3", question: "Điền từ còn thiếu: 'He ___ play the guitar.'", options: [], answer: "can", type: "cloze" },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    { id: "pt10-1", prompt_vn: "Tôi có thể nói tiếng Anh một chút.", answer: "I can speak a little English." },
    { id: "pt10-2", prompt_vn: "Anh ấy không thể lái xe.", answer: "He can't drive a car." },
    { id: "pt10-3", prompt_vn: "Bạn có thể giúp tôi không?", answer: "Can you help me?" },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "q1", question: "Câu hỏi đúng về khả năng:", options: ["Do you can cook?", "Are you can cook?", "Can you cook?", "You can cook?"], answer: "Can you cook?", type: "multiple-choice",
      explanation_vn: "'Can' là động từ khiếm khuyết, câu hỏi đảo 'Can' lên đầu. Không dùng 'Do/Does/Are' với 'can'." },
    { id: "q2", question: "Lỗi nào SAI?", options: ["I can swim.", "She can't drive.", "He cans sing.", "Can you speak English?"], answer: "He cans sing.", type: "multiple-choice",
      explanation_vn: "'Can' không bao giờ thêm '-s/-es' dù chủ ngữ là 'He/She/It'. Đúng: 'He CAN sing'." },
    { id: "q3", question: "Câu nào ĐÚNG?", options: ["She can speaks French.", "She can speak French.", "She cans speak French.", "She is can speak French."], answer: "She can speak French.", type: "multiple-choice",
      explanation_vn: "Sau 'can/can't' dùng động từ nguyên mẫu (bare infinitive): 'can speak', không phải 'can speaks'." },
    { id: "q4", question: "Điền từ: 'I ___ drive a car but I can ride a bike.'", options: [], answer: "can't", type: "cloze" },
    { id: "q5", question: "Điền từ: '___ you speak any other languages?'", options: [], answer: "Can", type: "cloze" },
    { id: "q6", question: "Anh ấy có thể hát và chơi guitar.", options: [], answer: "He can sing and play the guitar.", type: "translate" },
    { id: "q7", question: "Bạn có thể nói tiếng Anh không?", options: [], answer: "Can you speak English?", type: "translate" },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc10-1",
      sentence: "She cans play the piano very well.",
      errorWord: "cans",
      correction: "can",
      explanation_vn: "'Can' không đổi dạng: I/you/he/she/it/we/they đều dùng 'can'. Không có 'cans'.",
    },
    {
      id: "sc10-2",
      sentence: "He can swims very fast.",
      errorWord: "swims",
      correction: "swim",
      explanation_vn: "Sau 'can' dùng bare infinitive (không '-s'): 'can swim'. 'Swims' chỉ dùng trong Present Simple.",
    },
  ],


  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la10-1",
      audio_text: "Can you speak English?",
      prompt_vn: "Bạn có thể nói tiếng Anh không?",
      words: ["Can", "you", "speak", "English", "?", "Do", "speaks"],
      answer: "Can you speak English ?",
    },
    {
      id: "la10-2",
      audio_text: "I can swim but I can't drive.",
      prompt_vn: "Tôi biết bơi nhưng không biết lái xe.",
      words: ["I", "can", "swim", "but", "I", "can't", "drive", ".", "cannot", "ride"],
      answer: "I can swim but I can't drive .",
    },
  ],


  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi có thể nói tiếng Anh rất tốt.",
      words: ["I", "can", "speak", "English", "very", "well", ".", "was", "were"],
      answer: "I can speak English very well .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy không thể lái xe ô tô.",
      words: ["She", "can't", "drive", "a", "car", ".", "was", "were"],
      answer: "She can't drive a car .",
    },
    {
      id: "wb3",
      prompt_vn: "Bạn có thể nấu ăn Việt Nam không?",
      words: ["Can", "you", "cook", "Vietnamese", "food", "?", "was", "were"],
      answer: "Can you cook Vietnamese food ?",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s10-1",
      prompt_vn: "Tôi có thể nói tiếng Anh rất tốt.",
      words: ["I", "can", "speak", "English", "very", "well", "."],
      answer: "I can speak English very well .",
    },
    {
      id: "s10-2",
      prompt_vn: "Cô ấy không thể lái xe ô tô.",
      words: ["She", "can't", "drive", "a", "car", "."],
      answer: "She can't drive a car .",
    },
    {
      id: "s10-3",
      prompt_vn: "Bạn có thể nấu ăn Việt Nam không?",
      words: ["Can", "you", "cook", "Vietnamese", "food", "?"],
      answer: "Can you cook Vietnamese food ?",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr10-1",
      question: "Điền giới từ đúng: 'The bank is ___ the post office.' (ở cạnh) — Unit 9",
      options: ["opposite", "next to", "between", "near"],
      answer: "next to",
      type: "multiple-choice",
    },
    {
      id: "cr10-2",
      question: "Đi thẳng và rẽ trái tại đèn giao thông. (Unit 9)",
      options: [],
      answer: "Go straight and turn left at the traffic light.",
      type: "translate",
    },
    {
      id: "cr10-3",
      question: "Siêu thị nằm giữa ngân hàng và trường. (Unit 9)",
      options: [],
      answer: "The supermarket is between the bank and the school.",
      type: "translate",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "can /kæn/ vs /kən/",
    description: "Modal \"can\" — dạng mạnh /kæn/ (nhấn mạnh) và dạng yếu /kən/ (thông thường)",
    examples: [
        { word: "can (mạnh)", ipa: "/kæn/", tip: "Khi nhấn mạnh: Yes, I CAN! — âm /æ/ rõ ràng, dài" },
        { word: "can (yếu)", ipa: "/kən/", tip: "Trong câu bình thường: I can swim → /aɪ kən swɪm/ — schwa, rất ngắn" },
    ],
    minimalPairs: [
        ["I CAN (nhấn)", "I can (thường /kən/)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "at 9 o'clock", vn: "lúc 9 giờ" },
      { en: "on Monday", vn: "vào thứ Hai" },
      { en: "in January", vn: "vào tháng Giêng" },
      { en: "in the morning", vn: "vào buổi sáng" },
      { en: "at the office", vn: "tại văn phòng" },
      { en: "on time", vn: "đúng giờ" },
      { en: "in 2024", vn: "vào năm 2024" },
      { en: "at the meeting", vn: "tại cuộc họp" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit10-reading-1",
    title: "My New Colleague",
    title_vn: "Đọc đoạn về đồng nghiệp mới",
    level: "A1" as const,
    text:
      "My new colleague is named Minh. He is very talented! " +
      "He can speak three languages: Vietnamese, English, and Japanese. " +
      "He can also use computers very well and he can cook amazing Vietnamese food. " +
      "At the weekend, Minh likes to swim in the river near his house. " +
      "He can drive a car, but he usually rides his motorbike to work. " +
      "He can sing and play the guitar too! " +
      "He cannot draw very well, but he is learning. " +
      "I want to learn many things from Minh!",
    questions: [
      {
        id: "u10r-q1",
        question_vn: "Minh có thể nói bao nhiêu ngôn ngữ?",
        options: ["One", "Two", "Three", "Four"],
        answer: "Three",
        explanation_vn: "'He can speak three languages: Vietnamese, English, and Japanese.'",
      },
      {
        id: "u10r-q2",
        question_vn: "Minh thích làm gì vào cuối tuần?",
        options: ["Cook", "Drive a car", "Swim", "Play the guitar"],
        answer: "Swim",
        explanation_vn: "'At the weekend, Minh likes to swim in the river near his house.'",
      },
      {
        id: "u10r-q3",
        question_vn: "Minh thường đi làm bằng gì?",
        options: ["A car", "A bus", "A motorbike", "On foot"],
        answer: "A motorbike",
        explanation_vn: "'He usually rides his motorbike to work.'",
      },
      {
        id: "u10r-q4",
        question_vn: "Minh không thể làm tốt điều gì?",
        options: ["Sing", "Cook", "Draw", "Speak English"],
        answer: "Draw",
        explanation_vn: "'He cannot draw very well, but he is learning.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "BRK15SNOIJQ",

  // jobScenarios for world-class VN adult career content (TASK-153)
  jobScenarios: [
    { id: 1, title: "Daily office commute and small talk", focus: "transport + work greeting", context: "commute to office" },
  ],
};

export default unit10;