import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-4 — Daily Routines  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit4: UnitData = {
  unitId: "unit-4",
  title: "Unit 4: Daily Routines",
  level: "A1",
  xp: 80,
  estimatedTime: 45,
  description: "Học từ vựng về hoạt động thường ngày và cách dùng thì Hiện Tại Đơn (Present Simple) để mô tả thói quen.",
  badgeName: "Người Có Nề Nếp",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn kể cho người bạn nước ngoài mới quen nghe về một ngày bình thường của mình — từ sáng thức dậy đến tối đi ngủ.",
  learningOutcomes: [
    "Mô tả thói quen và lịch trình hàng ngày bằng tiếng Anh",
    "Dùng thì Hiện Tại Đơn để nói về sự thật và thói quen",
    "Hỏi về lịch trình ngày thường của người khác"
  ],
  badgeEmoji: "⏰",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🌅",
      en: "I wake up at six every morning.",
      vn: "Tôi thức dậy lúc sáu giờ mỗi buổi sáng.",
      context: "Mô tả thói quen buổi sáng"
    },
    {
      emoji: "🍳",
      en: "She eats breakfast before work.",
      vn: "Cô ấy ăn sáng trước khi đi làm.",
      context: "Dùng Present Simple với She"
    },
    {
      emoji: "🌙",
      en: "He goes to bed at ten o'clock.",
      vn: "Anh ấy đi ngủ lúc mười giờ.",
      context: "Present Simple với He"
    }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Người Việt thường nói giờ bằng cách thêm <span class=\"text-emerald-400 font-semibold\">o'clock</span> sau số (seven o'clock). Người bản xứ hay nói ngắn hơn: <span class=\"text-emerald-400 font-semibold\">at seven</span> thay vì 'at seven o'clock' trong hội thoại thường ngày.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "wake up", emoji: "🌅", phonetic: "/weɪk ʌp/", meaning: "thức dậy", example: "I wake up at 6 am.", example2: "She wakes up early every day.", collocation: "wake up early", audio: "/audio/unit-4/wake_up.mp3" , l1_interference_vn: "⚠️ Phrasal verb: 'wake up' — không nói chỉ 'wake'. 'I wake up at 6' không phải 'I up wake'." },
    { id: 2, word: "brush teeth", emoji: "🪥", phonetic: "/brʌʃ tiːθ/", meaning: "đánh răng", example: "I brush my teeth twice a day.", example2: "He brushes his teeth before bed.", collocation: "brush your teeth", audio: "/audio/unit-4/brush_teeth.mp3" , l1_interference_vn: "⚠️ Luôn dùng số nhiều 'teeth'. 'Brush my tooth' (số ít) — sai ngữ pháp." },
    { id: 3, word: "have breakfast", emoji: "🍳", phonetic: "/hæv ˈbrekfəst/", meaning: "ăn sáng", example: "We have breakfast at 7.", example2: "She has breakfast with her family.", collocation: "have breakfast / skip breakfast", audio: "/audio/unit-4/have_breakfast.mp3" , l1_interference_vn: "⚠️ 'Have breakfast' không có mạo từ. 'Have A breakfast' sai (trừ khi mô tả: 'a big breakfast')." },
    { id: 4, word: "go to work", emoji: "💼", phonetic: "/ɡəʊ tə wɜːk/", meaning: "đi làm", example: "He goes to work by bus.", example2: "I go to work at 8 o'clock.", collocation: "go to work by bus/car", audio: "/audio/unit-4/go_to_work.mp3" , l1_interference_vn: "⚠️ 'Go to work' — không có 'the'. 'Go to THE work' sai. Tương tự: go to school/bed." },
    { id: 5, word: "have lunch", emoji: "🥗", phonetic: "/hæv lʌntʃ/", meaning: "ăn trưa", example: "We have lunch at noon.", example2: "She usually has lunch at the office.", collocation: "have lunch with", audio: "/audio/unit-4/have_lunch.mp3" , l1_interference_vn: "⚠️ 'Have lunch' không có mạo từ. 'I have A lunch' sai trừ phi mô tả: 'a nice lunch'." },
    { id: 6, word: "come home", emoji: "🏠", phonetic: "/kʌm həʊm/", meaning: "về nhà", example: "I come home at 6 pm.", example2: "She comes home tired after work.", collocation: "come home from work", audio: "/audio/unit-4/come_home.mp3", l1_interference_vn: "⚠️ 'Come home' KHÔNG có 'to': 'come home', không phải 'come to home'. Tương tự: 'go home', 'arrive home'." },
    { id: 7, word: "cook dinner", emoji: "🍳", phonetic: "/kʊk ˈdɪnər/", meaning: "nấu bữa tối", example: "My mother cooks dinner every day.", example2: "I cook dinner for my family.", collocation: "cook dinner at home", audio: "/audio/unit-4/cook_dinner.mp3", l1_interference_vn: "⚠️ 'Cook dinner' — KHÔNG 'cook the dinner' (không có 'the'). 'Make dinner' cũng đúng — hai collocation cùng nghĩa." },
    { id: 8, word: "watch TV", emoji: "📺", phonetic: "/wɒtʃ ˌtiːˈviː/", meaning: "xem tivi", example: "We watch TV in the evening.", example2: "He watches TV before going to bed.", collocation: "watch TV at night", audio: "/audio/unit-4/watch_tv.mp3", l1_interference_vn: "⚠️ 'Watch TV' — KHÔNG 'see TV' hay 'look TV'. 'Watch' dùng cho chương trình/màn hình. 'See a movie' (ở rạp)." },
    { id: 9, word: "go to bed", emoji: "🛌", phonetic: "/ɡəʊ tə bɛd/", meaning: "đi ngủ", example: "I go to bed at 10 pm.", example2: "She goes to bed early on weekdays.", collocation: "go to bed early/late", audio: "/audio/unit-4/go_to_bed.mp3" , l1_interference_vn: "⚠️ 'Go to bed' (đi ngủ) ≠ 'go to sleep' (ngủ thiếp đi). Hai giai đoạn khác nhau." },
    { id: 10, word: "exercise", emoji: "🏃", phonetic: "/ˈeksəsaɪz/", meaning: "tập thể dục", example: "She exercises in the morning.", example2: "I exercise three times a week.", collocation: "exercise regularly", audio: "/audio/unit-4/exercise.mp3", l1_interference_vn: "⚠️ 'Exercise' (n/v) không đếm được khi nói chung: 'I do exercise' hay 'I exercise'. KHÔNG 'I do an exercise' (cho gym)." },
    { id: 11, word: "take a shower", emoji: "🚿", phonetic: "/teɪk ə ˈʃaʊər/", meaning: "tắm", example: "I take a shower every morning.", example2: "He takes a shower after exercise.", collocation: "take a hot/cold shower", audio: "/audio/unit-4/take_a_shower.mp3" , l1_interference_vn: "⚠️ 'Take a shower' (Mỹ) hoặc 'have a shower' (Anh). Không phải 'do/make shower'." },
    { id: 12, word: "study", emoji: "📚", phonetic: "/ˈstʌdi/", meaning: "học bài", example: "She studies English every evening.", example2: "I study for two hours before dinner.", collocation: "study hard / study English", audio: "/audio/unit-4/study.mp3", l1_interference_vn: "⚠️ 'Study' (v) = học bài cụ thể. 'Learn' = học cái gì đó mới. 'Study English' (không phải 'learn English lesson')." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Hội thoại: A Day in My Life",
      audio: "/audio/unit-4/dialogue_1.mp3",
      desc: "Sarah mô tả thói quen hàng ngày của cô ấy cho người bạn mới.",
      lines: [
        { id: "d1-1", speaker: "David", text: "What time do you wake up?", translation: "Bạn thức dậy lúc mấy giờ?" },
        { id: "d1-2", speaker: "Sarah", text: "I wake up at six thirty every morning.", translation: "Tôi thức dậy lúc 6 giờ 30 mỗi buổi sáng." },
        { id: "d1-3", speaker: "David", text: "Do you eat breakfast at home?", translation: "Bạn có ăn sáng ở nhà không?" },
        { id: "d1-4", speaker: "Sarah", text: "Yes! I have breakfast with my family. She brushes her teeth and washes her face.", translation: "Có! Tôi ăn sáng cùng gia đình. Cô ấy đánh răng và rửa mặt." },
        { id: "d1-5", speaker: "David", text: "When do you go to work?", translation: "Bạn đi làm lúc mấy giờ?" },
        { id: "d1-6", speaker: "Sarah", text: "I go to work at eight o'clock by bus.", translation: "Tôi đi làm lúc 8 giờ bằng xe buýt." },
      ]
    },
    {
      id: 2,
      title: "Buổi tối của Minh",
      audio: "/audio/unit-4/dialogue_2.mp3",
      desc: "Minh kể về thói quen buổi tối của mình.",
      lines: [
        { id: "d2-1", speaker: "Lan", text: "What do you do in the evening?", translation: "Bạn thường làm gì vào buổi tối?" },
        { id: "d2-2", speaker: "Minh", text: "I come home at six. Then I cook dinner.", translation: "Tôi về nhà lúc 6 giờ. Sau đó tôi nấu bữa tối." },
        { id: "d2-3", speaker: "Lan", text: "Do you watch TV after dinner?", translation: "Bạn có xem tivi sau bữa tối không?" },
        { id: "d2-4", speaker: "Minh", text: "Yes, sometimes. I also study English for an hour.", translation: "Có, đôi khi. Tôi cũng học tiếng Anh một tiếng." },
        { id: "d2-5", speaker: "Lan", text: "When do you go to bed?", translation: "Bạn đi ngủ lúc mấy giờ?" },
        { id: "d2-6", speaker: "Minh", text: "I go to bed at ten thirty.", translation: "Tôi đi ngủ lúc 10 giờ 30." },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "I wake up at six", options: ["I wake up at six", "I wake up at seven", "I wake up at eight", "I wake up at nine"], answer: "I wake up at six" },
    { id: "lac2", audio_text: "She brushes her teeth", options: ["She brushes her teeth", "He brushes his teeth", "They brush their teeth", "I brush my teeth"], answer: "She brushes her teeth" },
    { id: "lac3", audio_text: "He goes to work by bus", options: ["He goes to work by car", "He goes to work by bus", "She goes to work by bike", "He goes home by bus"], answer: "He goes to work by bus" },
    { id: "lac4", audio_text: "I study English every evening", options: ["I study every morning", "I study English every evening", "She studies English every day", "I study at school"], answer: "I study English every evening" },
    { id: "lac5", audio_text: "We have lunch at noon", options: ["We have dinner at noon", "We have breakfast at noon", "We have lunch at noon", "We have lunch at night"], answer: "We have lunch at noon" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I wake up at {input} every morning.",
    level1Placeholder: "Ví dụ: six, seven thirty, eight o'clock...",
    level2Situation: "Mô tả thói quen hàng ngày của bạn từ sáng đến tối cho một người bạn ngoại quốc. Dùng ít nhất 5 câu.",
    level2Hint: "I wake up at [giờ]. I have breakfast at [giờ]. I go to [work/school] at [giờ]. In the evening, I [hoạt động]. I go to bed at [giờ].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Present Simple — Thì Hiện Tại Đơn",
    rule: "I/You/We/They + verb  |  He/She/It + verb + -s/-es",
    conjugation: [
      { subject: "I / You / We / They", form: "verb", example: "I wake up at 6." },
      { subject: "He / She / It", form: "verb + s/es", example: "She brushes her teeth." },
    ],
    examples: [
      { en: "I study English every day.", vn: "Tôi học tiếng Anh mỗi ngày." },
      { en: "He goes to work at eight.", vn: "Anh ấy đi làm lúc tám giờ." },
      { en: "She watches TV in the evening.", vn: "Cô ấy xem TV vào buổi tối." },
      { en: "They have breakfast at seven.", vn: "Họ ăn sáng lúc bảy giờ." },
    ],
    tip: "Khi chủ ngữ là He/She/It, thêm -s vào cuối động từ (go → goes, watch → watches, brush → brushes). Với I/You/We/They: giữ nguyên động từ gốc.",
    vnNote: "⚠️ Lưu ý: Tiếng Việt không chia động từ ('tôi đi / anh ấy đi'). Tiếng Anh BUỘC thêm -s/-es khi chủ ngữ là He/She/It: 'He go' (SAI) → 'He goes' (ĐÚNG). Đây là lỗi cực kỳ phổ biến!",
    dialogueExample: {
      speaker: "Sarah",
      text: "She brushes her teeth and washes her face.",
      translation: "Cô ấy đánh răng và rửa mặt.",
      highlight: "brushes",
    },
    ccq: {
      question: "Chọn dạng đúng: 'She ___ to work every day.'",
      options: ["go", "goes", "going", "gone"],
      answer: "goes",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối hoạt động với thời gian",
    pairs: [
      { left: "wake up", right: "buổi sáng sớm" },
      { left: "have lunch", right: "buổi trưa" },
      { left: "go to work", right: "sáng sớm" },
      { left: "cook dinner", right: "buổi tối" },
      { left: "go to bed", right: "đêm" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", question: "Chọn dạng đúng: 'He ___ at seven o'clock.'", options: ["wake up", "wakes up", "waking up", "waked up"], answer: "wakes up", type: "multiple-choice" },
    { id: "pq2", question: "'She has breakfast at 7.' — Đây là thì gì?", options: ["Hiện tại tiếp diễn", "Quá khứ đơn", "Hiện tại đơn", "Tương lai"], answer: "Hiện tại đơn", type: "multiple-choice" },
    { id: "pq3", question: "Điền từ còn thiếu: 'I ___ to bed at ten.'", options: [], answer: "go", type: "cloze" },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    { id: "pt4-1", prompt_vn: "Tôi thường thức dậy lúc 6 giờ 30.", answer: "I usually wake up at 6:30." },
    { id: "pt4-2", prompt_vn: "Cô ấy không đi làm sớm.", answer: "She doesn't go to work early." },
    { id: "pt4-3", prompt_vn: "Chúng tôi xem TV vào buổi tối.", answer: "We watch TV in the evening." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "q1", question: "Chọn câu Present Simple đúng với 'He':", options: ["He go to school.", "He goes to school.", "He going to school.", "He goed to school."], answer: "He goes to school.", type: "multiple-choice",
      explanation_vn: "Với 'He/She/It' → thêm '-s/-es'. 'Go' → 'goes'. 'He going' sai vì thiếu động từ 'to be'." },
    { id: "q2", question: "Hoạt động nào xảy ra vào buổi sáng?", options: ["go to bed", "cook dinner", "watch TV", "wake up"], answer: "wake up", type: "multiple-choice",
      explanation_vn: "'Wake up' = thức dậy (buổi sáng). 'Go to bed' = đi ngủ (tối), 'cook dinner' = nấu tối." },
    { id: "q3", question: "'She ___ English every day.' — Điền đúng:", options: ["study", "studies", "studying", "studied"], answer: "studies", type: "multiple-choice",
      explanation_vn: "'She' → thêm '-es' cho động từ tận '-y': study → studies. 'Studying' cần 'is' đứng trước." },
    { id: "q4", question: "Điền từ còn thiếu: 'I ___ breakfast at seven.'", options: [], answer: "have", type: "cloze" },
    { id: "q5", question: "Điền từ còn thiếu: 'He ___ home at six pm.'", options: [], answer: "comes", type: "cloze" },
    { id: "q6", question: "Tôi thức dậy lúc 7 giờ sáng mỗi ngày.", options: [], answer: "I wake up at seven every morning.", type: "translate" },
    { id: "q7", question: "Cô ấy đi làm bằng xe buýt.", options: [], answer: "She goes to work by bus.", type: "translate" },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la4-1",
      audio_text: "She plays tennis every weekend with her friends.",
      prompt_vn: "Cô ấy chơi tennis mỗi cuối tuần với bạn bè.",
      words: ["She", "plays", "tennis", "every", "weekend", "with", "her", "friends", ".", "play", "he"],
      answer: "She plays tennis every weekend with her friends .",
    },
    {
      id: "la4-2",
      audio_text: "He does not drink coffee in the morning.",
      prompt_vn: "Anh ấy không uống cà phê vào buổi sáng.",
      words: ["He", "does", "not", "drink", "coffee", "in", "the", "morning", ".", "do not", "drinks"],
      answer: "He does not drink coffee in the morning .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi thức dậy lúc 7 giờ.",
      words: ["I", "wake", "up", "at", "seven", ".", "was", "were"],
      answer: "I wake up at seven .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy đánh răng mỗi buổi sáng.",
      words: ["She", "brushes", "her", "teeth", "every", "morning", ".", "was", "were"],
      answer: "She brushes her teeth every morning .",
    },
    {
      id: "wb3",
      prompt_vn: "Anh ấy ăn sáng trước khi đi làm.",
      words: ["He", "eats", "breakfast", "before", "work", ".", "was", "were"],
      answer: "He eats breakfast before work .",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc4-1",
      sentence: "He go to school every day.",
      errorWord: "go",
      correction: "goes",
      explanation_vn: "Với chủ ngữ 'He/She/It' → động từ thêm '-s'. 'go' → 'goes'. Lỗi phổ biến nhất của người Việt.",
    },
    {
      id: "sc4-2",
      sentence: "She studys English every morning.",
      errorWord: "studys",
      correction: "studies",
      explanation_vn: "'Study' tận '-y' → bỏ 'y', thêm '-ies': 'studies'. Không viết 'studys'.",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s4-1",
      prompt_vn: "Tôi thức dậy lúc 7 giờ.",
      words: ["I", "wake", "up", "at", "seven", "."],
      answer: "I wake up at seven .",
    },
    {
      id: "s4-2",
      prompt_vn: "Cô ấy đánh răng mỗi buổi sáng.",
      words: ["She", "brushes", "her", "teeth", "every", "morning", "."],
      answer: "She brushes her teeth every morning .",
    },
    {
      id: "s4-3",
      prompt_vn: "Anh ấy ăn sáng trước khi đi làm.",
      words: ["He", "eats", "breakfast", "before", "work", "."],
      answer: "He eats breakfast before work .",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr4-1",
      question: "Điền đại từ sở hữu đúng: '___ name is Lucy.' (của cô ấy) — Unit 3",
      options: ["My", "His", "Her", "Their"],
      answer: "Her",
      type: "multiple-choice",
    },
    {
      id: "cr4-2",
      question: "Mẹ tôi là một giáo viên. (Unit 3)",
      options: [],
      answer: "My mother is a teacher.",
      type: "translate",
    },
    {
      id: "cr4-3",
      question: "Chọn câu chào đúng buổi sáng. (Unit 1)",
      options: ["Good morning", "Good afternoon", "Good evening", "Good night"],
      answer: "Good morning",
      type: "multiple-choice",
      explanation_vn: "Good morning: sáng. Từ unit1.",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "-s cuối /s/ /z/ /ɪz/",
    description: "Quy tắc đọc -s cuối: sau vô thanh → /s/, sau hữu thanh → /z/, sau /s,z,ʃ/ → /ɪz/",
    examples: [
        { word: "works", ipa: "/wɜːrks/", tip: "Sau /k/ vô thanh → -s đọc /s/" },
        { word: "lives", ipa: "/lɪvz/", tip: "Sau /v/ hữu thanh → -s đọc /z/" },
    ],
    minimalPairs: [
        ["cats /s/", "dogs /z/"],
        ["bus /s/", "lives /z/"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I work", vn: "Tôi làm việc" },
      { en: "She works", vn: "Cô ấy làm việc" },
      { en: "He starts at 8", vn: "Anh ấy bắt đầu lúc 8h" },
      { en: "We have a meeting", vn: "Chúng tôi có cuộc họp" },
      { en: "She sends emails", vn: "Cô ấy gửi email" },
      { en: "He manages the team", vn: "Anh ấy quản lý đội" },
      { en: "I finish at 5pm", vn: "Tôi kết thúc lúc 5 chiều" },
      { en: "She doesn't work on Sunday", vn: "Cô ấy không làm việc ngày Chủ nhật" },
    ],
  },


  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit4-reading-1",
    title: "A Day in My Life",
    title_vn: "Đọc về lịch trình hàng ngày",
    level: "A1" as const,
    text:
      "My name is Minh. I wake up at six o'clock every morning. " +
      "I have breakfast at seven. I eat rice and drink tea. " +
      "I go to work by motorbike. I start work at eight o'clock. " +
      "I have lunch at twelve. I finish work at five o'clock. " +
      "In the evening, I watch TV and read books. " +
      "I go to bed at ten o'clock. I sleep eight hours every night.",
    questions: [
      {
        id: "u4r-q1",
        question_vn: "Minh thức dậy lúc mấy giờ?",
        options: ["Five o'clock", "Six o'clock", "Seven o'clock", "Eight o'clock"],
        answer: "Six o'clock",
        explanation_vn: "Đoạn văn nói 'I wake up at six o'clock every morning.'",
      },
      {
        id: "u4r-q2",
        question_vn: "Minh ăn gì vào buổi sáng?",
        options: ["Bread and coffee", "Noodles and milk", "Rice and tea", "Eggs and juice"],
        answer: "Rice and tea",
        explanation_vn: "Đoạn văn nói 'I eat rice and drink tea.'",
      },
      {
        id: "u4r-q3",
        question_vn: "Minh đi làm bằng phương tiện gì?",
        options: ["By bus", "By car", "By bicycle", "By motorbike"],
        answer: "By motorbike",
        explanation_vn: "Đoạn văn nói 'I go to work by motorbike.'",
      },
      {
        id: "u4r-q4",
        question_vn: "Buổi tối Minh làm gì?",
        options: ["Goes to the gym", "Cooks dinner", "Watches TV and reads books", "Plays football"],
        answer: "Watches TV and reads books",
        explanation_vn: "Đoạn văn nói 'I watch TV and read books.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Mô tả lịch trình làm việc hàng ngày khi phỏng vấn",
      focus: "Present Simple: start/finish work, meetings, send emails",
      context: "Phỏng vấn xin việc hoặc kể với đồng nghiệp mới về ngày làm việc",
      l1Note: "⚠️ 'I start work at eight' — không 'I starting'. -s cho he/she: 'She finishes at 5'.",
      example: "I wake up at six, start at eight, finish at five. I don't work on Sunday."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "2FHMKlW-OIE", // BBC Learning English — Food vocabulary
};


