import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-11 — Health & Feelings  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit11: UnitData = {
  unitId: "unit-11",
  title: "Unit 11: Health & Feelings",
  level: "A1",
  xp: 80,
  estimatedTime: 40,
  description: "Học từ vựng về sức khỏe, cảm xúc và cách diễn đạt tình trạng bản thân bằng tiếng Anh.",
  badgeName: "Người Khỏe Mạnh",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn không khỏe và cần giải thích triệu chứng cho bác sĩ người nước ngoài, đồng thời nói về cảm xúc với bạn bè.",
  learningOutcomes: [
    "Mô tả triệu chứng bệnh và tình trạng sức khỏe bằng tiếng Anh",
    "Nói về cảm xúc và trạng thái tinh thần hiện tại",
    "Hỏi thăm sức khỏe và cảm xúc của người khác"
  ],
  badgeEmoji: "💪",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🤒", en: "I have a headache.", vn: "Tôi bị đau đầu.", context: "Nói về triệu chứng bệnh" },
    { emoji: "😊", en: "I feel happy today.", vn: "Hôm nay tôi cảm thấy vui.", context: "Diễn đạt cảm xúc" },
    { emoji: "😢", en: "She feels tired after work.", vn: "Cô ấy cảm thấy mệt sau khi làm việc.", context: "Mô tả cảm xúc của người khác" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Người Anh thường hỏi <span class=\"text-emerald-400 font-semibold\">How are you feeling?</span> thay vì <span class=\"text-emerald-400 font-semibold\">Are you sick?</span> khi lo lắng về sức khỏe ai đó. Khi nói về bệnh tật, dùng <span class=\"text-emerald-400 font-semibold\">I have a...</span> cho triệu chứng và <span class=\"text-emerald-400 font-semibold\">I feel...</span> cho cảm xúc/trạng thái.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "headache", emoji: "🤕", phonetic: "/ˈhɛdeɪk/", meaning: "đau đầu", example: "I have a headache.", example2: "She gets headaches when she is stressed.", collocation: "have a headache", audio: "/audio/unit-11/headache.mp3" , l1_interference_vn: "⚠️ Đọc: HEAD-ache /ˈhɛdeɪk/ — 'ache' đọc /eɪk/ như 'cake'. Không phải 'head-ah-che'." },
    { id: 2, word: "cold", emoji: "🤧", phonetic: "/kəʊld/", meaning: "cảm lạnh", example: "He has a cold.", example2: "I have a bad cold this week.", collocation: "have a cold / catch a cold", audio: "/audio/unit-11/cold.mp3" , l1_interference_vn: "⚠️ 'Have a cold' (bị cảm) ≠ 'feel cold' (cảm thấy lạnh). 'I have a cold' — cần mạo từ 'a'." },
    { id: 3, word: "fever", emoji: "🌡️", phonetic: "/ˈfiːvər/", meaning: "sốt", example: "She has a fever of 38 degrees.", example2: "Drink water when you have a fever.", collocation: "have a fever / run a fever", audio: "/audio/unit-11/fever.mp3" , l1_interference_vn: "⚠️ 'Have a fever' — cần mạo từ 'a'. Không phải 'have fever' (thiếu mạo từ)." },
    { id: 4, word: "stomachache", emoji: "🤢", phonetic: "/ˈstʌməkeɪk/", meaning: "đau bụng", example: "I have a stomachache.", example2: "He has a stomachache after eating.", collocation: "have a stomachache", audio: "/audio/unit-11/stomachache.mp3" , l1_interference_vn: "⚠️ Đọc: STOM-ach-ache — 'ch' trong 'stomach' đọc /k/ không phải /tʃ/. 3 âm tiết." },
    { id: 5, word: "tired", emoji: "😴", phonetic: "/ˈtaɪərd/", meaning: "mệt mỏi", example: "I feel tired after a long day.", example2: "She looks tired. She should rest.", collocation: "feel tired / look tired", audio: "/audio/unit-11/tired.mp3" , l1_interference_vn: "⚠️ 'I'm tired' (mệt) ≠ 'I'm bored' (chán). Và 'I'm boring' SAI — 'boring' mô tả sự vật nhàm chán." },
    { id: 6, word: "happy", emoji: "😊", phonetic: "/ˈhæpi/", meaning: "vui vẻ / hạnh phúc", example: "I feel happy when I see my family.", example2: "She is happy about her exam results.", collocation: "feel happy / very happy", audio: "/audio/unit-11/happy.mp3", l1_interference_vn: "⚠️ 'Happy about/with something'. 'Happy to do something'. KHÔNG 'happy of'. Ngữ pháp: adj + preposition." },
    { id: 7, word: "sad", emoji: "😢", phonetic: "/sæd/", meaning: "buồn", example: "He feels sad when it rains.", example2: "I feel sad when I miss my friends.", collocation: "feel sad / look sad", audio: "/audio/unit-11/sad.mp3", l1_interference_vn: "⚠️ 'Sad about something'. 'Feel sad'. KHÔNG 'feel sadly' (adj, không phải adv). 'I feel sad' (không phải 'I feel sadly')." },
    { id: 8, word: "stressed", emoji: "😰", phonetic: "/strɛst/", meaning: "căng thẳng", example: "I feel stressed about my exam.", example2: "She looks stressed. Is she OK?", collocation: "feel stressed / be stressed", audio: "/audio/unit-11/stressed.mp3" , l1_interference_vn: "⚠️ Âm cuối /st/ — người Việt hay bỏ /t/ cuối: nói 'stres' thay vì 'strest'. Luyện âm cuối." },
    { id: 9, word: "medicine", emoji: "💊", phonetic: "/ˈmɛdsɪn/", meaning: "thuốc", example: "Take this medicine twice a day.", example2: "She takes medicine for her headache.", collocation: "take medicine", audio: "/audio/unit-11/medicine.mp3" , l1_interference_vn: "⚠️ Đọc: /ˈmɛdsɪn/ — thường chỉ 2 âm tiết trong văn nói nhanh: 'MED-sin'." },
    { id: 10, word: "rest", emoji: "🛏️", phonetic: "/rɛst/", meaning: "nghỉ ngơi", example: "You should rest when you are sick.", example2: "I need to rest. I feel tired.", collocation: "get some rest / need to rest", audio: "/audio/unit-11/rest.mp3", l1_interference_vn: "⚠️ 'Rest' (v/n): 'have a rest' = nghỉ ngơi. 'The rest' = phần còn lại. Hai nghĩa hoàn toàn khác nhau." },
    { id: 11, word: "better", emoji: "✅", phonetic: "/ˈbɛtər/", meaning: "khỏe hơn / tốt hơn", example: "I feel better today, thank you.", example2: "She is getting better after her illness.", collocation: "feel better / get better", audio: "/audio/unit-11/better.mp3" , l1_interference_vn: "⚠️ So sánh bất quy tắc của 'good'. Không phải 'gooder' hay 'more good'." },
    { id: 12, word: "worried", emoji: "😟", phonetic: "/ˈwʌrid/", meaning: "lo lắng", example: "I feel worried about my health.", example2: "She looks worried. What's wrong?", collocation: "feel worried / look worried", audio: "/audio/unit-11/worried.mp3", l1_interference_vn: "⚠️ 'Worried ABOUT something' — giới từ 'about'. 'I'm worried about the exam'. KHÔNG 'worried for' hay 'worried of'." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Không đi học được",
      audio: "/audio/unit-11/dialogue_1.mp3",
      desc: "Minh gọi điện cho giáo viên vì không thể đến trường.",
      lines: [
        { id: "d1-1", speaker: "Teacher", text: "Hello, Minh. Are you OK? You're not in class today.", translation: "Xin chào Minh. Em có ổn không? Em không có mặt ở lớp hôm nay." },
        { id: "d1-2", speaker: "Minh", text: "I'm sorry, teacher. I have a fever and a headache.", translation: "Em xin lỗi thầy. Em bị sốt và đau đầu." },
        { id: "d1-3", speaker: "Teacher", text: "Oh no! How are you feeling now?", translation: "Ôi không! Bây giờ em cảm thấy thế nào?" },
        { id: "d1-4", speaker: "Minh", text: "I feel very tired. I'm taking medicine and resting.", translation: "Em cảm thấy rất mệt. Em đang uống thuốc và nghỉ ngơi." },
        { id: "d1-5", speaker: "Teacher", text: "That's good. I hope you feel better soon!", translation: "Tốt lắm. Thầy mong em sớm khỏe hơn!" },
        { id: "d1-6", speaker: "Minh", text: "Thank you, teacher. I think I'll be better tomorrow.", translation: "Cảm ơn thầy. Em nghĩ ngày mai em sẽ khỏe hơn." },
      ]
    },
    {
      id: 2,
      title: "Cảm xúc trong ngày",
      audio: "/audio/unit-11/dialogue_2.mp3",
      desc: "Lan và Sarah chia sẻ cảm xúc của họ trong ngày.",
      lines: [
        { id: "d2-1", speaker: "Sarah", text: "Hey Lan! How are you feeling today?", translation: "Này Lan! Hôm nay bạn cảm thấy thế nào?" },
        { id: "d2-2", speaker: "Lan", text: "I feel a bit stressed. I have an exam tomorrow.", translation: "Tôi cảm thấy hơi căng thẳng. Ngày mai tôi có thi." },
        { id: "d2-3", speaker: "Sarah", text: "Oh, I understand. I felt worried before my exam too.", translation: "Ôi tôi hiểu. Tôi cũng từng lo lắng trước khi thi." },
        { id: "d2-4", speaker: "Lan", text: "Do you have any tips?", translation: "Bạn có mẹo gì không?" },
        { id: "d2-5", speaker: "Sarah", text: "Study, then rest well. You'll feel happy after the exam!", translation: "Học bài rồi nghỉ ngơi tốt. Sau khi thi bạn sẽ cảm thấy vui!" },
        { id: "d2-6", speaker: "Lan", text: "You're right! I feel better already. Thank you!", translation: "Bạn nói đúng! Tôi đã cảm thấy khá hơn rồi. Cảm ơn bạn!" },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "I have a headache", options: ["I have a stomachache", "I have a fever", "I have a headache", "I have a cold"], answer: "I have a headache" },
    { id: "lac2", audio_text: "She feels tired", options: ["She feels happy", "She feels stressed", "She feels tired", "He feels tired"], answer: "She feels tired" },
    { id: "lac3", audio_text: "I feel better today", options: ["I feel worse today", "I felt better yesterday", "I feel better today", "She feels better today"], answer: "I feel better today" },
    { id: "lac4", audio_text: "He has a cold and a fever", options: ["He has a cold and a headache", "She has a cold and a fever", "He has a cold and a fever", "He has a cough and a fever"], answer: "He has a cold and a fever" },
    { id: "lac5", audio_text: "You should rest", options: ["You should eat", "You should rest", "She should rest", "You should study"], answer: "You should rest" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I feel {input} today.",
    level1Placeholder: "Ví dụ: happy, tired, stressed, better...",
    level2Situation: "Bạn đang gọi điện cho bạn bè để xin vắng mặt buổi học nhóm vì bạn đang bị ốm. Mô tả triệu chứng và cảm xúc của bạn.",
    level2Hint: "Hi [tên]! I'm sorry I can't come today. I have a [triệu chứng]. I feel very [cảm xúc]. I'm [taking medicine/resting]. I hope I'll feel better by [thời gian].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "I have... / I feel... — Sức khỏe và Cảm xúc",
    rule: "I/You/We/They have + a/an + illness  |  He/She/It has + a/an + illness  |  Subject + feel(s) + adjective",
    examples: [
      { en: "I have a headache.", vn: "Tôi bị đau đầu." },
      { en: "She has a cold.", vn: "Cô ấy bị cảm lạnh." },
      { en: "I feel tired today.", vn: "Hôm nay tôi cảm thấy mệt." },
      { en: "He feels happy when he plays football.", vn: "Anh ấy cảm thấy vui khi chơi bóng đá." },
    ],
    tip: "Dùng 'have/has' + triệu chứng bệnh (a headache, a fever). Dùng 'feel/feels' + tính từ cảm xúc (happy, tired, stressed). He/She/It → 'has' và 'feels' (thêm -s).",
    vnNote: "⚠️ Lưu ý: Thì hiện tại tiếp diễn (is/am/are + V-ing) dùng cho hành động ĐANG xảy ra lúc nói. Người Việt hay nhầm với thì hiện tại đơn. 'I work now' (SAI, đang làm) → 'I am working now' (ĐÚNG).",
    dialogueExample: {
      speaker: "Minh",
      text: "I have a fever and a headache.",
      translation: "Em bị sốt và đau đầu.",
      highlight: "I have a fever",
    },
    ccq: {
      question: "Câu nào đúng với 'She'?",
      options: ["She have a cold.", "She feel tired.", "She has a cold and feels tired.", "She have cold and feel tired."],
      answer: "She has a cold and feels tired.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối triệu chứng / cảm xúc với nghĩa",
    pairs: [
      { left: "headache", right: "đau đầu" },
      { left: "fever", right: "sốt" },
      { left: "tired", right: "mệt mỏi" },
      { left: "stressed", right: "căng thẳng" },
      { left: "better", right: "khỏe hơn" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", question: "Chọn câu đúng với 'She':", options: ["She have a headache.", "She has a headache.", "She having a headache.", "She is have a headache."], answer: "She has a headache.", type: "multiple-choice" },
    { id: "pq2", question: "Dùng 'feel' để nói về điều gì?", options: ["Triệu chứng bệnh", "Cảm xúc / trạng thái", "Địa điểm", "Thời gian"], answer: "Cảm xúc / trạng thái", type: "multiple-choice" },
    { id: "pq3", question: "Điền từ còn thiếu: 'I ___ very tired today.'", options: [], answer: "feel", type: "cloze" },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    { id: "pt11-1", prompt_vn: "Tôi bị đau đầu.", answer: "I have a headache." },
    { id: "pt11-2", prompt_vn: "Bạn cảm thấy thế nào hôm nay?", answer: "How do you feel today?" },
    { id: "pt11-3", prompt_vn: "Cô ấy bị cảm lạnh.", answer: "She has a cold." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "q1", question: "Câu nào đúng về bệnh:", options: ["I have headache.", "I have a headache.", "I feel a headache.", "I am a headache."], answer: "I have a headache.", type: "multiple-choice",
      explanation_vn: "Tên bệnh (headache, cold, fever) là danh từ đếm được số ít → bắt buộc có mạo từ 'a': 'I have A headache'." },
    { id: "q2", question: "Dùng từ gì cho cảm xúc?", options: ["have", "has", "feel", "am"], answer: "feel", type: "multiple-choice",
      explanation_vn: "Dùng 'feel' + tính từ cảm xúc (tired, happy, sad). 'Have/has' + danh từ bệnh (a headache)." },
    { id: "q3", question: "'She ___ tired after the long meeting.' — điền đúng:", options: ["have", "has", "feel", "feels"], answer: "feels", type: "multiple-choice",
      explanation_vn: "Chủ ngữ 'She' (ngôi thứ 3 số ít) → 'feel' thêm -s thành 'feels'. 'Have/has' không dùng với tính từ." },
    { id: "q4", question: "Điền vào: 'He ___ a cold and a fever.'", options: [], answer: "has", type: "cloze" },
    { id: "q5", question: "Điền vào: 'I feel ___ when I see my family.'", options: [], answer: "happy", type: "cloze" },
    { id: "q6", question: "Tôi bị đau đầu và cảm thấy mệt.", options: [], answer: "I have a headache and I feel tired.", type: "translate" },
    { id: "q7", question: "Bạn nên nghỉ ngơi khi bạn bị ốm.", options: [], answer: "You should rest when you are sick.", type: "translate" },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc11-1",
      sentence: "I have headache and I feel tired.",
      errorWord: "headache",
      correction: "a headache",
      explanation_vn: "Danh từ bệnh số ít (headache, fever, cold) cần mạo từ 'a' phía trước: 'have A headache'.",
    },
    {
      id: "sc11-2",
      sentence: "She feel sick today and cannot go to work.",
      errorWord: "feel",
      correction: "feels",
      explanation_vn: "Chủ ngữ 'She' → động từ thêm -s: 'feels'. Quy tắc ngôi thứ 3 số ít trong hiện tại đơn.",
    },
  ],


  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la11-1",
      audio_text: "I have a headache today.",
      prompt_vn: "Hôm nay tôi bị đau đầu.",
      words: ["I", "have", "a", "headache", "today", ".", "feel", "fever"],
      answer: "I have a headache today .",
    },
    {
      id: "la11-2",
      audio_text: "She feels tired and sick.",
      prompt_vn: "Cô ấy cảm thấy mệt và ốm.",
      words: ["She", "feels", "tired", "and", "sick", ".", "feel", "happy"],
      answer: "She feels tired and sick .",
    },
  ],


  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi bị sốt và đau đầu.",
      words: ["I", "have", "a", "fever", "and", "a", "headache", ".", "was", "were"],
      answer: "I have a fever and a headache .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy cảm thấy mệt sau khi làm việc.",
      words: ["She", "feels", "tired", "after", "work", ".", "was", "were"],
      answer: "She feels tired after work .",
    },
    {
      id: "wb3",
      prompt_vn: "Bạn nên uống thuốc và nghỉ ngơi.",
      words: ["You", "should", "take", "medicine", "and", "rest", ".", "was", "were"],
      answer: "You should take medicine and rest .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s11-1",
      prompt_vn: "Tôi bị sốt và đau đầu.",
      words: ["I", "have", "a", "fever", "and", "a", "headache", "."],
      answer: "I have a fever and a headache .",
    },
    {
      id: "s11-2",
      prompt_vn: "Cô ấy cảm thấy mệt sau khi làm việc.",
      words: ["She", "feels", "tired", "after", "work", "."],
      answer: "She feels tired after work .",
    },
    {
      id: "s11-3",
      prompt_vn: "Bạn nên uống thuốc và nghỉ ngơi.",
      words: ["You", "should", "take", "medicine", "and", "rest", "."],
      answer: "You should take medicine and rest .",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr11-1",
      question: "Câu nào đúng về khả năng của She? (Unit 10: Can/Can't)",
      options: ["She cans swim.", "She can swims.", "She can swim.", "She is can swim."],
      answer: "She can swim.",
      type: "multiple-choice",
    },
    {
      id: "cr11-2",
      question: "Anh ấy có thể hát và chơi guitar. (Unit 10)",
      options: [],
      answer: "He can sing and play the guitar.",
      type: "translate",
    },
    {
      id: "cr11-3",
      question: "Đi thẳng rồi rẽ trái. (Unit 9)",
      options: [],
      answer: "Go straight and turn left.",
      type: "translate",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/θ/ (health words)",
    description: "Âm /θ/ trong các từ y tế: health, teeth, breath, mouth",
    examples: [
        { word: "health", ipa: "/hɛlθ/", tip: "Âm cuối /lθ/ — /l/ trước rồi lưỡi ra răng /θ/. Đừng bỏ /θ/!" },
        { word: "teeth", ipa: "/tiːθ/", tip: "Âm cuối /θ/ — giữ lưỡi ở răng cho đến cuối" },
    ],
    minimalPairs: [
        ["health", "hell"],
        ["teeth", "tease"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "I am working", vn: "Tôi đang làm việc" },
      { en: "She is talking", vn: "Cô ấy đang nói chuyện" },
      { en: "We are having a meeting", vn: "Chúng tôi đang họp" },
      { en: "He is sending an email", vn: "Anh ấy đang gửi email" },
      { en: "Are you listening?", vn: "Bạn có đang nghe không?" },
      { en: "They are not coming", vn: "Họ không đến" },
      { en: "What are you doing?", vn: "Bạn đang làm gì?" },
      { en: "I am not free now", vn: "Tôi không rảnh lúc này" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit11-reading-1",
    title: "How Are You Feeling?",
    title_vn: "Đọc đoạn về cảm xúc và sức khỏe",
    level: "A1" as const,
    text:
      "My friend Lan is not well today. She has a headache and a cold. " +
      "She also has a fever — her temperature is 38 degrees! " +
      "Her mum says she needs to drink water and rest. " +
      "Lan feels very tired. She cannot go to work today. " +
      "Her boss is not happy about this, but he says, 'Don't worry — get better soon!' " +
      "Lan takes some medicine and sleeps. " +
      "In the afternoon, she feels a little better. " +
      "She is happy because the headache is gone. " +
      "Tomorrow she hopes to feel well again.",
    questions: [
      {
        id: "u11r-q1",
        question_vn: "Lan đang bị bệnh gì?",
        options: [
          "Stomachache and fever",
          "Headache and cold",
          "Tired and unhappy",
          "Cold and stomachache",
        ],
        answer: "Headache and cold",
        explanation_vn: "'She has a headache and a cold.'",
      },
      {
        id: "u11r-q2",
        question_vn: "Mẹ của Lan nói cô ấy cần làm gì?",
        options: [
          "Go to work",
          "Take medicine and exercise",
          "Drink water and rest",
          "Eat food and study",
        ],
        answer: "Drink water and rest",
        explanation_vn: "'Her mum says she needs to drink water and rest.'",
      },
      {
        id: "u11r-q3",
        question_vn: "Sếp của Lan nói gì?",
        options: [
          "'You must come to work!'",
          "'I am very angry.'",
          "'Don't worry — get better soon!'",
          "'Take a week off!'",
        ],
        answer: "'Don't worry — get better soon!'",
        explanation_vn: "Her boss says 'Don't worry — get better soon!'",
      },
      {
        id: "u11r-q4",
        question_vn: "Lan cảm thấy thế nào vào buổi chiều?",
        options: [
          "Still very sick",
          "A little better",
          "Completely well",
          "Very happy",
        ],
        answer: "A little better",
        explanation_vn: "'In the afternoon, she feels a little better.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "nkJJh0KJiB0",

  // jobScenarios for world-class VN adult career content (TASK-153)
  jobScenarios: [
    { id: 1, title: "Office health chat", focus: "feelings at work", context: "colleague check-in" },
  ],
};

export default unit11;