import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-12 — Review & Real-life Application  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit12: UnitData = {
  unitId: "unit-12",
  title: "Unit 12: Review & Real-life Application",
  level: "A1",
  xp: 120,
  estimatedTime: 60,
  description: "Ôn tập toàn bộ ngữ pháp và từ vựng A1, áp dụng vào các tình huống giao tiếp thực tế.",
  badgeName: "Chinh Phục A1",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn gặp người nước ngoài tại sân bay và họ muốn tìm hiểu về cuộc sống, con người và văn hóa Việt Nam từ chính bạn.",
  learningOutcomes: [
    "Kết hợp tất cả kỹ năng A1 trong hội thoại thực",
    "Giới thiệu bản thân và cuộc sống hàng ngày tự tin",
    "Sẵn sàng bước sang cấp độ A2 với nền tảng vững chắc"
  ],
  badgeEmoji: "🏆",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🎉", en: "Congratulations! You've reached Unit 12.", vn: "Chúc mừng! Bạn đã đến Unit 12.", context: "Tổng kết hành trình học" },
    { emoji: "🔁", en: "Let's review everything you've learned.", vn: "Hãy ôn lại tất cả những gì bạn đã học.", context: "Mục tiêu ôn tập" },
    { emoji: "💬", en: "Now you can have real conversations!", vn: "Bây giờ bạn có thể có những cuộc trò chuyện thực sự!", context: "Kết quả sau A1" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Sau khi hoàn thành A1, bạn có thể: <span class=\"text-emerald-400 font-semibold\">tự giới thiệu</span>, <span class=\"text-emerald-400 font-semibold\">mua sắm</span>, <span class=\"text-emerald-400 font-semibold\">hỏi đường</span>, <span class=\"text-emerald-400 font-semibold\">nói về sức khỏe</span> và <span class=\"text-emerald-400 font-semibold\">chia sẻ sở thích</span>. Đây là nền tảng vững chắc để tiến lên A2!",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "introduce", emoji: "🤝", phonetic: "/ˌɪntrəˈdjuːs/", meaning: "giới thiệu", example: "Let me introduce myself.", example2: "I'd like to introduce my friend Tom.", collocation: "introduce yourself / introduce someone", audio: "/audio/unit-12/introduce.mp3", l1_interference_vn: "⚠️ 'Introduce yourself' = tự giới thiệu. 'Let me introduce you TO John' — giới từ 'to'. KHÔNG 'introduce you WITH'." },
    { id: 2, word: "conversation", emoji: "💬", phonetic: "/ˌkɒnvəˈseɪʃən/", meaning: "cuộc trò chuyện", example: "I can have a conversation in English.", example2: "Let's have a conversation about hobbies.", collocation: "have a conversation", audio: "/audio/unit-12/conversation.mp3" , l1_interference_vn: "⚠️ Stress: con-ver-SA-tion (âm 3). 4 âm tiết. 'Have a conversation' — động từ 'have'." },
    { id: 3, word: "describe", emoji: "📝", phonetic: "/dɪˈskraɪb/", meaning: "mô tả", example: "Can you describe your home?", example2: "She describes her daily routine.", collocation: "describe yourself", audio: "/audio/unit-12/describe.mp3", l1_interference_vn: "⚠️ 'Describe something TO someone'. 'Can you describe it to me?' — KHÔNG 'describe me it'. Thứ tự tân ngữ." },
    { id: 4, word: "ask for help", emoji: "🙋", phonetic: "/ɑːsk fɔː hɛlp/", meaning: "nhờ giúp đỡ", example: "Don't be afraid to ask for help.", example2: "You can ask for help in English now.", collocation: "ask for help / ask for directions", audio: "/audio/unit-12/ask_for_help.mp3", l1_interference_vn: "⚠️ 'Ask FOR help' (nhờ giúp đỡ) vs 'ask someone FOR help' (nhờ ai đó). KHÔNG 'ask help' (thiếu 'for')." },
    { id: 5, word: "understand", emoji: "💡", phonetic: "/ˌʌndəˈstænd/", meaning: "hiểu", example: "I can understand simple English.", example2: "Do you understand the question?", collocation: "understand English", audio: "/audio/unit-12/understand.mp3" , l1_interference_vn: "⚠️ Stress: un-der-STAND (âm 3). Đừng bỏ âm tiết '-der-' ở giữa. 3 âm tiết đầy đủ." },
    { id: 6, word: "practice", emoji: "🔄", phonetic: "/ˈpræktɪs/", meaning: "luyện tập", example: "Practice makes perfect!", example2: "I practice English every day.", collocation: "practice speaking / practice daily", audio: "/audio/unit-12/practice.mp3" , l1_interference_vn: "⚠️ American: 'practice' (n+v). British: 'practice' (n), 'practise' (v). Cả hai đều đúng." },
    { id: 7, word: "improve", emoji: "📈", phonetic: "/ɪmˈpruːv/", meaning: "cải thiện", example: "My English is improving every day.", example2: "You can improve your speaking skills.", collocation: "improve your English", audio: "/audio/unit-12/improve.mp3" , l1_interference_vn: "⚠️ 'Improve your English' (ngoại) hoặc 'Your English is improving' (nội). Không: 'improve up'." },
    { id: 8, word: "confident", emoji: "💪", phonetic: "/ˈkɒnfɪdənt/", meaning: "tự tin", example: "I feel confident speaking English now.", example2: "She is confident in her abilities.", collocation: "feel confident", audio: "/audio/unit-12/confident.mp3" , l1_interference_vn: "⚠️ Stress: CON-fi-dent (âm 1). 'Confident ABOUT/IN something'. Không: 'confident of'." },
    { id: 9, word: "goal", emoji: "🎯", phonetic: "/ɡəʊl/", meaning: "mục tiêu", example: "My goal is to speak English fluently.", example2: "What is your learning goal?", collocation: "set a goal / reach a goal", audio: "/audio/unit-12/goal.mp3" , l1_interference_vn: "⚠️ 'Goal' (mục tiêu) đồng âm với 'goal' (bàn thắng bóng đá). Phân biệt qua ngữ cảnh." },
    { id: 10, word: "fluent", emoji: "🗣️", phonetic: "/ˈfluːənt/", meaning: "trôi chảy / thành thạo", example: "I want to be fluent in English.", example2: "She speaks French fluently.", collocation: "speak fluently / become fluent", audio: "/audio/unit-12/fluent.mp3" , l1_interference_vn: "⚠️ Stress: FLU-ent (âm 1). 'Fluent IN English' — giới từ 'in'. 'Speak fluently' (trạng từ)." },
    { id: 11, word: "review", emoji: "🔁", phonetic: "/rɪˈvjuː/", meaning: "ôn tập", example: "Let's review what we learned.", example2: "It's important to review old lessons.", collocation: "review your notes", audio: "/audio/unit-12/review.mp3" , l1_interference_vn: "⚠️ Stress: re-VIEW (động từ, âm 2). RE-view (danh từ, âm 1). Người Việt hay stress sai." },
    { id: 12, word: "achieve", emoji: "🏆", phonetic: "/əˈtʃiːv/", meaning: "đạt được", example: "You achieved your A1 goal!", example2: "She achieved great results.", collocation: "achieve a goal / achieve success", audio: "/audio/unit-12/achieve.mp3" , l1_interference_vn: "⚠️ Stress: a-CHIEVE (âm 2). Âm /tʃ/ trong '-chieve'. 'Achieve a goal' — không 'reach a goal'." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Tổng hợp: Gặp người mới",
      audio: "/audio/unit-12/dialogue_1.mp3",
      desc: "Bài hội thoại tổng hợp tất cả các chủ đề A1: giới thiệu, nghề nghiệp, sở thích, sức khỏe và hỏi đường.",
      lines: [
        { id: "d1-1", speaker: "Tom", text: "Excuse me, where is the nearest café?", translation: "Xin lỗi, quán cà phê gần nhất ở đâu?" },
        { id: "d1-2", speaker: "Lan", text: "It's next to the bank. Go straight and turn left!", translation: "Nó ở cạnh ngân hàng. Đi thẳng và rẽ trái!" },
        { id: "d1-3", speaker: "Tom", text: "Thank you! By the way, I'm Tom. Nice to meet you.", translation: "Cảm ơn bạn! Nhân tiện, tôi là Tom. Rất vui được gặp bạn." },
        { id: "d1-4", speaker: "Lan", text: "I'm Lan. What do you do, Tom?", translation: "Tôi là Lan. Tom làm nghề gì vậy?" },
        { id: "d1-5", speaker: "Tom", text: "I'm an English teacher. I like traveling and cooking.", translation: "Tôi là giáo viên tiếng Anh. Tôi thích du lịch và nấu ăn." },
        { id: "d1-6", speaker: "Lan", text: "That's great! I can cook Vietnamese food too. Are you feeling OK? You look tired.", translation: "Tuyệt vời! Tôi cũng có thể nấu ăn Việt Nam. Bạn có ổn không? Trông bạn có vẻ mệt." },
        { id: "d1-7", speaker: "Tom", text: "I feel a bit tired. I have a cold. But I feel better now, thank you!", translation: "Tôi cảm thấy hơi mệt. Tôi bị cảm lạnh. Nhưng bây giờ tôi cảm thấy khỏe hơn rồi, cảm ơn bạn!" },
      ]
    },
    {
      id: 2,
      title: "Mô tả cuộc sống hàng ngày",
      audio: "/audio/unit-12/dialogue_2.mp3",
      desc: "Minh mô tả một ngày bình thường của mình — ôn lại tất cả ngữ pháp A1.",
      lines: [
        { id: "d2-1", speaker: "Sarah", text: "Tell me about your typical day, Minh.", translation: "Kể cho tôi nghe về một ngày bình thường của bạn, Minh." },
        { id: "d2-2", speaker: "Minh", text: "OK! I wake up at six. I have breakfast and go to work at eight.", translation: "OK! Tôi thức dậy lúc sáu giờ. Tôi ăn sáng và đi làm lúc tám giờ." },
        { id: "d2-3", speaker: "Sarah", text: "What do you do in the evening?", translation: "Buổi tối bạn làm gì?" },
        { id: "d2-4", speaker: "Minh", text: "I come home at six. I like cooking dinner and reading.", translation: "Tôi về nhà lúc sáu giờ. Tôi thích nấu bữa tối và đọc sách." },
        { id: "d2-5", speaker: "Sarah", text: "Is there a park near your home?", translation: "Có công viên nào gần nhà bạn không?" },
        { id: "d2-6", speaker: "Minh", text: "Yes! There is a park next to my house. I can walk there every morning.", translation: "Có! Có một công viên cạnh nhà tôi. Tôi có thể đi bộ đến đó mỗi buổi sáng." },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "I can have a conversation in English", options: ["I can speak English well", "I can have a conversation in English", "She can have a conversation in English", "I can have a talk in English"], answer: "I can have a conversation in English" },
    { id: "lac2", audio_text: "My goal is to speak English fluently", options: ["My goal is to speak English slowly", "My aim is to speak English fluently", "My goal is to speak English fluently", "Her goal is to speak English fluently"], answer: "My goal is to speak English fluently" },
    { id: "lac3", audio_text: "Practice makes perfect", options: ["Practice makes better", "Practice is perfect", "Practice makes perfect", "Practicing makes perfect"], answer: "Practice makes perfect" },
    { id: "lac4", audio_text: "I feel confident speaking English now", options: ["I feel confident speaking Vietnamese now", "She feels confident speaking English now", "I feel confident speaking English now", "I felt confident speaking English"], answer: "I feel confident speaking English now" },
    { id: "lac5", audio_text: "You achieved your A1 goal", options: ["You achieved your A2 goal", "She achieved your A1 goal", "You achieved your A1 goal", "You can achieve your A1 goal"], answer: "You achieved your A1 goal" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I can {input} now. I am proud of myself!",
    level1Placeholder: "Ví dụ: speak English, introduce myself, order food...",
    level2Situation: "Tổng hợp A1: Bạn gặp một người bạn quốc tế lần đầu tiên. Tự giới thiệu, hỏi về nghề nghiệp, sở thích, mô tả nhà bạn, và chia sẻ cảm xúc của bạn hôm nay.",
    level2Hint: "Hi! My name is [tên]. I am [tuổi] years old. I am a [nghề nghiệp]. I like [sở thích]. In my home, there is/are [mô tả nhà]. Today I feel [cảm xúc] because [lý do]. I can [kỹ năng]!",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Ôn tập Ngữ pháp A1 — 11 Cấu trúc quan trọng",
    rule: "To be | Wh- questions | Possessives | Present Simple | like+V-ing | There is/are | How much | some/any | Prepositions | Can/Can't | have/feel",
    examples: [
      { en: "I am a student. She is a teacher.", vn: "Unit 1-2: To be + nghề nghiệp" },
      { en: "He goes to work. She brushes her teeth.", vn: "Unit 4: Present Simple + He/She/It" },
      { en: "I like reading. She likes cooking.", vn: "Unit 5: like + V-ing" },
      { en: "There are two chairs. Can I have some water?", vn: "Unit 6-8: There is/are + some/any" },
    ],
    tip: "Ôn lại 11 điểm ngữ pháp quan trọng nhất của A1. Mỗi cấu trúc đều được học trong context thực tế — đây là điểm mạnh của cách học của bạn!",
    vnNote: "⚠️ Lưu ý: Comparatives trong tiếng Anh thay đổi dạng từ: good→better→best, bad→worse→worst. Không thể nói 'more good' (SAI) → 'better' (ĐÚNG). Người Việt hay thêm 'more' sai chỗ.",
    dialogueExample: {
      speaker: "Minh",
      text: "There is a park next to my house. I can walk there every morning.",
      translation: "Có một công viên cạnh nhà tôi. Tôi có thể đi bộ đến đó mỗi buổi sáng.",
      highlight: "There is / I can",
    },
    ccq: {
      question: "Câu nào dùng đúng NHIỀU cấu trúc A1 nhất?",
      options: [
        "I am student and like swim.",
        "She have a headache and can't goes to work.",
        "I'm a teacher. I like cooking and I can speak English well.",
        "There is chairs in kitchen and she feels happy.",
      ],
      answer: "I'm a teacher. I like cooking and I can speak English well.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối ngữ pháp với ví dụ đúng",
    pairs: [
      { left: "To be (Unit 1)", right: "I am a student." },
      { left: "Present Simple (Unit 4)", right: "She goes to work at 8." },
      { left: "like + V-ing (Unit 5)", right: "I like swimming." },
      { left: "There is/are (Unit 6)", right: "There are two chairs." },
      { left: "Can/Can't (Unit 10)", right: "He can play guitar." },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", question: "Câu nào ÔN lại ngữ pháp Unit 4 đúng?", options: ["She go to work.", "She goes to work.", "She going to work.", "She is go to work."], answer: "She goes to work.", type: "multiple-choice" },
    { id: "pq2", question: "Câu nào dùng đúng 'like + V-ing' (Unit 5)?", options: ["I like swim.", "I like to swimming.", "I like swimming.", "I like swims."], answer: "I like swimming.", type: "multiple-choice" },
    { id: "pq3", question: "Điền vào: 'I ___ speak English now. I'm proud!' (Unit 10)", options: [], answer: "can", type: "cloze" },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    { id: "pt12-1", prompt_vn: "Tôi đã học tiếng Anh được ba tháng.", answer: "I have been learning English for three months." },
    { id: "pt12-2", prompt_vn: "Bạn có thể giới thiệu bản thân bằng tiếng Anh không?", answer: "Can you introduce yourself in English?" },
    { id: "pt12-3", prompt_vn: "Tôi muốn cải thiện kỹ năng nói của mình.", answer: "I want to improve my speaking skills." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "q1", question: "Câu nào ÔN đúng ngữ pháp 'There is/are' (Unit 6)?", options: ["There is two windows.", "There are two window.", "There are two windows.", "There have two windows."], answer: "There are two windows.", type: "multiple-choice",
      explanation_vn: "'Two windows' là số nhiều → 'There ARE'. Danh từ cũng phải số nhiều: 'windows', không phải 'window'." },
    { id: "q2", question: "Câu nào ÔN đúng 'How much' (Unit 7)?", options: ["How much is these shoes?", "How much are this shoe?", "How much are these shoes?", "How many are these shoes?"], answer: "How much are these shoes?", type: "multiple-choice",
      explanation_vn: "'These shoes' là số nhiều → trợ động từ 'ARE'. 'This shoe' số ít mới dùng 'is'. 'How much' hỏi giá." },
    { id: "q3", question: "Câu nào ÔN đúng 'have/feel' (Unit 11)?", options: ["I have tired.", "I feel a headache.", "I have a headache and feel tired.", "I am a headache."], answer: "I have a headache and feel tired.", type: "multiple-choice",
      explanation_vn: "'Have' + danh từ bệnh (a headache), 'feel' + tính từ (tired). Không thể nói 'have tired' hay 'feel a headache'." },
    { id: "q4", question: "Điền vào (Unit 5): 'She ___ cooking Vietnamese food.'", options: [], answer: "likes", type: "cloze" },
    { id: "q5", question: "Điền vào (Unit 10): 'She ___ drive but she ___ ride a bike.'", options: [], answer: "can't / can", type: "cloze" },
    { id: "q6", question: "Tôi thức dậy lúc 6 giờ và đi làm lúc 8 giờ. (Unit 4)", options: [], answer: "I wake up at six and go to work at eight.", type: "translate" },
    { id: "q7", question: "Tôi cảm thấy tự tin khi nói tiếng Anh bây giờ. (Unit 11)", options: [], answer: "I feel confident speaking English now.", type: "translate" },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc12-1",
      sentence: "There is three people in the meeting room.",
      errorWord: "is",
      correction: "are",
      explanation_vn: "'Three people' là số nhiều → 'There ARE three people'. 'There IS' chỉ dùng với danh từ số ít.",
    },
    {
      id: "sc12-2",
      sentence: "How much is these shoes?",
      errorWord: "is",
      correction: "are",
      explanation_vn: "'These shoes' là số nhiều → trợ động từ phải là 'are': 'How much ARE these shoes?'",
    },
  ],


  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la12-1",
      audio_text: "There are two chairs in the room.",
      prompt_vn: "Có hai chiếc ghế trong phòng.",
      words: ["There", "are", "two", "chairs", "in", "the", "room", ".", "is", "three"],
      answer: "There are two chairs in the room .",
    },
    {
      id: "la12-2",
      audio_text: "How much are these shoes?",
      prompt_vn: "Những đôi giày này giá bao nhiêu?",
      words: ["How", "much", "are", "these", "shoes", "?", "is", "many"],
      answer: "How much are these shoes ?",
    },
  ],


  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi có thể tự giới thiệu bằng tiếng Anh.",
      words: ["I", "can", "introduce", "myself", "in", "English", ".", "was", "were"],
      answer: "I can introduce myself in English .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy thích nấu ăn và tôi có thể nói tiếng Anh.",
      words: ["She", "likes", "cooking", "and", "I", "can", "speak", "English", ".", "was", "were"],
      answer: "She likes cooking and I can speak English .",
    },
    {
      id: "wb3",
      prompt_vn: "Có một công viên cạnh nhà tôi.",
      words: ["There", "is", "a", "park", "next", "to", "my", "house", ".", "was", "were"],
      answer: "There is a park next to my house .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s12-1",
      prompt_vn: "Tôi có thể tự giới thiệu bằng tiếng Anh.",
      words: ["I", "can", "introduce", "myself", "in", "English", "."],
      answer: "I can introduce myself in English .",
    },
    {
      id: "s12-2",
      prompt_vn: "Cô ấy thích nấu ăn và tôi có thể nói tiếng Anh.",
      words: ["She", "likes", "cooking", "and", "I", "can", "speak", "English", "."],
      answer: "She likes cooking and I can speak English .",
    },
    {
      id: "s12-3",
      prompt_vn: "Có một công viên cạnh nhà tôi.",
      words: ["There", "is", "a", "park", "next", "to", "my", "house", "."],
      answer: "There is a park next to my house .",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr12-1",
      question: "Câu nào đúng về cảm xúc? (Unit 11: Health & Feelings)",
      options: ["She have tired.", "She feel tired.", "She feels tired.", "She is feel tired."],
      answer: "She feels tired.",
      type: "multiple-choice",
    },
    {
      id: "cr12-2",
      question: "Tôi bị đau đầu và cảm thấy mệt. (Unit 11)",
      options: [],
      answer: "I have a headache and I feel tired.",
      type: "translate",
    },
    {
      id: "cr12-3",
      question: "Anh ấy có thể nói tiếng Anh. (Unit 10)",
      options: [],
      answer: "He can speak English.",
      type: "translate",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "word stress",
    description: "Stress từ — sai stress khiến người bản ngữ không hiểu dù phát âm từng âm đúng",
    examples: [
        { word: "vocabulary", ipa: "/vəˈkæbjʊleri/", tip: "Stress âm 2: vo-CAB-u-la-ry — không phải VO-ca-bu-la-ry" },
        { word: "pronunciation", ipa: "/prəˌnʌnsiˈeɪʃən/", tip: "Stress âm 4: pro-nun-ci-A-tion" },
    ],
    minimalPairs: [
        ["REcord (n)", "reCORD (v)"],
        ["PREsent (n)", "preSENT (v)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "bigger", vn: "lớn hơn" },
      { en: "the biggest", vn: "lớn nhất" },
      { en: "better", vn: "tốt hơn" },
      { en: "the best", vn: "tốt nhất" },
      { en: "more expensive", vn: "đắt hơn" },
      { en: "the most expensive", vn: "đắt nhất" },
      { en: "faster", vn: "nhanh hơn" },
      { en: "the fastest", vn: "nhanh nhất" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit12-reading-1",
    title: "My English Journey",
    title_vn: "Đọc đoạn về hành trình học tiếng Anh",
    level: "A1" as const,
    text:
      "My name is Hoa. Six months ago, I could not speak English at all. " +
      "I was too shy to have a conversation with foreign colleagues. " +
      "But I decided to practice every day. " +
      "I watch English videos, read short texts, and practice speaking. " +
      "Now I can introduce myself and describe my daily routine. " +
      "I can ask for help and I can understand simple sentences. " +
      "My colleagues are very kind. They help me when I make mistakes. " +
      "Learning English is not easy, but I am happy with my progress. " +
      "My goal is to have a confident conversation in English by next year!",
    questions: [
      {
        id: "u12r-q1",
        question_vn: "Hoa bắt đầu học tiếng Anh bao lâu trước?",
        options: ["One month ago", "Three months ago", "Six months ago", "One year ago"],
        answer: "Six months ago",
        explanation_vn: "'Six months ago, I could not speak English at all.'",
      },
      {
        id: "u12r-q2",
        question_vn: "Hoa làm gì để luyện tập tiếng Anh?",
        options: [
          "Only watches videos",
          "Only reads books",
          "Watches videos, reads texts, and practices speaking",
          "Goes to English classes",
        ],
        answer: "Watches videos, reads texts, and practices speaking",
        explanation_vn: "'I watch English videos, read short texts, and practice speaking.'",
      },
      {
        id: "u12r-q3",
        question_vn: "Bây giờ Hoa có thể làm gì?",
        options: [
          "Speak very fluently",
          "Introduce herself and describe her daily routine",
          "Write long essays in English",
          "Teach English to others",
        ],
        answer: "Introduce herself and describe her daily routine",
        explanation_vn: "'Now I can introduce myself and describe my daily routine.'",
      },
      {
        id: "u12r-q4",
        question_vn: "Mục tiêu của Hoa là gì?",
        options: [
          "Move to an English-speaking country",
          "Have a confident conversation in English by next year",
          "Become an English teacher",
          "Stop learning English",
        ],
        answer: "Have a confident conversation in English by next year",
        explanation_vn: "'My goal is to have a confident conversation in English by next year!'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Báo cáo tiến bộ tiếng Anh với sếp trong review",
      focus: "From 'could not' to 'can': introduce myself, describe routine, ask for help",
      context: "Cuộc họp đánh giá 6 tháng hoặc xin thăng tiến cần giao tiếp tiếng Anh",
      l1Note: "⚠️ 'Six months ago, I could not...' → 'Now I can introduce myself'. Dùng 'I decided to practice every day'.",
      example: "Six months ago I was too shy. Now I can describe my daily routine and ask colleagues for help."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "QVg9aSlLdJg",
};


