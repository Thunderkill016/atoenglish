import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-5 — Thông Tin Cá Nhân  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-5 — Thông Tin Cá Nhân (Personal Information)
// Grammar: Verb BE — Full conjugation (I am / You are / He is / She is / We are / They are)
// L1 Alert: VN pronouns don't change with person; English verb changes every time
// CELTA: Dialogue first — customs/immigration context creates real need to know
// Lewis: "I'm from", "I work as", "I live in", "I'm married" as fixed chunks

export const unitA05: UnitData = {
  unitId: "unit-a0-5",
  title: "Unit A0-5: Thông Tin Cá Nhân",
  level: "A0",
  xp: 60,
  estimatedTime: 40,
  description:
    "Học cách giới thiệu bản thân đầy đủ — tuổi, nghề nghiệp, quê quán — trong các tình huống quan trọng như xuất nhập cảnh hoặc phỏng vấn.",
  badgeName: "Người Tự Tin",
  badgeEmoji: "🪪",


  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn đang ở sân bay quốc tế. Nhân viên hải quan hỏi một loạt câu hỏi bằng tiếng Anh: tên, tuổi, nghề nghiệp, quê quán. Bạn cần trả lời nhanh và chính xác.",

  learningOutcomes: [
    "Giới thiệu bản thân đầy đủ: tên, tuổi, nghề, quê quán",
    "Dùng đúng BE cho mọi ngôi: I am / You are / He is / She is",
    "Hỏi và trả lời thông tin cá nhân cơ bản",
  ],


  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Tại các nước Anh-Mỹ, việc hỏi tuổi (<span class="text-emerald-400 font-semibold">"How old are you?"</span>) được coi là hơi bất lịch sự với người lạ — chỉ hỏi khi cần thiết (điền form, v.v.). Tuy nhiên tại hải quan, việc hỏi và trả lời trực tiếp là hoàn toàn bình thường.',


  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "🪪",
      en: "My name is Minh. I'm from Vietnam.",
      vn: "Tên tôi là Minh. Tôi đến từ Việt Nam.",
      context: "Giới thiệu cơ bản",
    },
    {
      emoji: "💼",
      en: "I work as an engineer.",
      vn: "Tôi làm kỹ sư.",
      context: "Giới thiệu nghề nghiệp",
    },
    {
      emoji: "🏠",
      en: "I live in Ho Chi Minh City.",
      vn: "Tôi sống ở thành phố Hồ Chí Minh.",
      context: "Nói về nơi ở",
    },
  ],


  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "age",
      emoji: "🎂",
      phonetic: "/eɪdʒ/",
      meaning: "tuổi",
      example: "My age is twenty-five.",
      example2: "What is your age?",
      collocation: "my age is / what age / same age / age group",
      audio: "/audio/unit-a0-5/age.mp3",
      l1_interference_vn: "⚠️ Hỏi tuổi: 'How old are you?' KHÔNG 'How many years do you have?' (dịch thẳng từ tiếng Việt). Trả lời: 'I'm 25.'",
    },
    {
      id: 2,
      word: "live",
      emoji: "🏠",
      phonetic: "/lɪv/",
      meaning: "sống, ở (nơi nào đó)",
      example: "I live in Hanoi.",
      example2: "Where do you live?",
      collocation: "I live in / live with / live alone / where do you live",
      audio: "/audio/unit-a0-5/live.mp3",
      l1_interference_vn: "⚠️ 'Live' /lɪv/ (động từ, sống/ở) vs 'live' /laɪv/ (tính từ, trực tiếp). 'I live in Hanoi' vs 'a live show'.",
    },
    {
      id: 3,
      word: "work",
      emoji: "💼",
      phonetic: "/wɜːrk/",
      meaning: "làm việc / công việc",
      example: "I work in a hospital.",
      example2: "What do you work as?",
      collocation: "I work as / work in / work for / go to work",
      audio: "/audio/unit-a0-5/work.mp3",
      l1_interference_vn: "⚠️ 'Work' (v, không đếm được) HOẶC 'a job' (n, đếm được). 'I have work to do' vs 'I have a job'. KHÔNG 'I have a work'.",
    },
    {
      id: 4,
      word: "job",
      emoji: "🔧",
      phonetic: "/dʒɒb/",
      meaning: "nghề nghiệp, công việc",
      example: "What is your job?",
      example2: "My job is teacher.",
      collocation: "my job is / what's your job / full-time job",
      audio: "/audio/unit-a0-5/job.mp3",
      l1_interference_vn: "⚠️ 'Job' (đếm được): 'a job', 'two jobs'. 'Work' (không đếm được). 'What's your job?' = 'What do you do (for work)?'",
    },
    {
      id: 5,
      word: "from",
      emoji: "🌍",
      phonetic: "/frɒm/",
      meaning: "từ, đến từ",
      example: "I am from Vietnam.",
      example2: "Where are you from?",
      collocation: "I'm from / where are you from / come from",
      audio: "/audio/unit-a0-5/from.mp3",
      l1_interference_vn: "⚠️ 'I'm from Vietnam' KHÔNG 'I'm from of Vietnam'. 'From' không cần thêm 'of'. 'Where are you from?' = câu hỏi chuẩn.",
    },
    {
      id: 6,
      word: "phone",
      emoji: "📱",
      phonetic: "/foʊn/",
      meaning: "điện thoại",
      example: "My phone number is...",
      example2: "Can I have your phone number?",
      collocation: "phone number / my phone / call my phone / phone call",
      audio: "/audio/unit-a0-5/phone.mp3",
      l1_interference_vn: "⚠️ 'Call/phone someone' — KHÔNG 'phone to someone'. 'My phone number is...' Cả 'call' và 'phone' đều là động từ.",
    },
    {
      id: 7,
      word: "address",
      emoji: "📍",
      phonetic: "/ˈædres/",
      meaning: "địa chỉ",
      example: "My address is 12 Le Loi Street.",
      example2: "What is your home address?",
      collocation: "home address / email address / what's your address",
      audio: "/audio/unit-a0-5/address.mp3",
      l1_interference_vn: "⚠️ 'What's your address?' KHÔNG 'Where is your address?' — địa chỉ là thông tin, không phải vị trí.",
    },
    {
      id: 8,
      word: "single",
      emoji: "👤",
      phonetic: "/ˈsɪŋɡəl/",
      meaning: "độc thân",
      example: "I am single.",
      example2: "Are you single or married?",
      collocation: "I'm single / single person / stay single",
      audio: "/audio/unit-a0-5/single.mp3",
      l1_interference_vn: "⚠️ 'Single' = độc thân / phòng đơn / một chiều. Ngữ cảnh quyết định nghĩa. 'Are you single?' = bạn có người yêu chưa?",
    },
    {
      id: 9,
      word: "married",
      emoji: "💍",
      phonetic: "/ˈmærid/",
      meaning: "đã lập gia đình",
      example: "I am married.",
      example2: "Are you married?",
      collocation: "I'm married / get married / married life",
      audio: "/audio/unit-a0-5/married.mp3",
      l1_interference_vn: "⚠️ 'Married TO someone': 'She's married to a doctor'. KHÔNG 'married with'. 'Get married' = kết hôn (sự kiện).",
    },
    {
      id: 10,
      word: "nationality",
      emoji: "🏳️",
      phonetic: "/ˌnæʃəˈnæləti/",
      meaning: "quốc tịch",
      example: "My nationality is Vietnamese.",
      example2: "What is your nationality?",
      collocation: "what nationality / my nationality is / dual nationality",
      audio: "/audio/unit-a0-5/nationality.mp3",
      l1_interference_vn: "⚠️ Hỏi quốc tịch: 'What nationality are you?' hoặc 'Where are you from?' KHÔNG 'What is your nation?'",
    },
  ],


  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Verb BE — Toàn bộ ngôi (I am / You are / He is…)",
    rule: "BE thay đổi theo CHỦ NGỮ — khác hoàn toàn với tiếng Việt!",

    conjugation: [
      { subject: "I",         form: "AM",  example: "I am 25 years old." },
      { subject: "You",       form: "ARE", example: "You are from Hanoi." },
      { subject: "He / She",  form: "IS",  example: "She is a doctor." },
      { subject: "We / They", form: "ARE", example: "They are married." },
    ],

    examples: [
      { en: "I am from Vietnam.",         vn: "Tôi đến từ Việt Nam." },
      { en: "She is a teacher.",          vn: "Cô ấy là giáo viên." },
      { en: "They are married.",          vn: "Họ đã kết hôn." },
      { en: "What is your nationality?",  vn: "Quốc tịch của bạn là gì?" },
    ],

    tip: "Viết tắt: I AM → I'M / You ARE → You'RE / He IS → He'S / She IS → She'S / We ARE → We'RE / They ARE → They'RE. Dạng viết tắt nghe tự nhiên hơn trong hội thoại!",

    vnNote:
      "⚠️ LỖI KINH ĐIỂN — Dùng sai ngôi của BE:\n\n" +
      "Tiếng Việt: 'Tôi, bạn, anh ấy, họ' → động từ KHÔNG thay đổi\n" +
      "Tiếng Anh: Động từ BE PHẢI thay đổi theo chủ ngữ!\n\n" +
      "❌ SAI: 'She am a teacher.' / 'They is married.'\n" +
      "✅ ĐÚNG: 'She IS a teacher.' / 'They ARE married.'\n\n" +
      "Mẹo nhớ:\n" +
      "  I → AM  (chỉ mình tôi)\n" +
      "  He/She/It → IS  (một người/vật, không phải tôi)\n" +
      "  Tất cả còn lại → ARE",

    dialogueExample: {
      speaker: "Officer",
      text: "What is your nationality?",
      translation: "Quốc tịch của bạn là gì?",
      highlight: "is",
    },

    ccq: {
      question: "Câu nào ĐÚNG ngữ pháp?",
      options: [
        "She am a doctor.",
        "They is from Vietnam.",
        "He is twenty-five years old.",
        "I are married.",
      ],
      answer: "He is twenty-five years old.",
    },
  },


  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối chủ ngữ với động từ BE đúng",
    pairs: [
      { left: "I",        right: "am" },
      { left: "She",      right: "is" },
      { left: "They",     right: "are" },
      { left: "We",       right: "are" },
      { left: "He",       right: "is" },
    ],
  },


  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq5-1",
      question: "Câu nào ĐÚNG?",
      options: [
        "She am a nurse.",
        "She is a nurse.",
        "She are a nurse.",
        "She be a nurse.",
      ],
      answer: "She is a nurse.",
      type: "multiple-choice",
    },
    {
      id: "pq5-2",
      question: "Điền từ: 'They ___ married.'",
      options: [],
      answer: "are",
      type: "cloze",
    },
    {
      id: "pq5-3",
      question: "'Where are you from?' — Câu trả lời đúng là?",
      options: [
        "I am from Vietnam.",
        "I is from Vietnam.",
        "I are from Vietnam.",
        "From Vietnam I.",
      ],
      answer: "I am from Vietnam.",
      type: "multiple-choice",
    },
    {
      id: "pq5-4",
      question: "Điền từ: 'What ___ your nationality?'",
      options: [],
      answer: "is",
      type: "cloze",
    },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt5-1",
      prompt_vn: "Tôi 25 tuổi và tôi đến từ Việt Nam.",
      answer: "I am 25 years old and I am from Vietnam.",
    },
    {
      id: "pt5-2",
      prompt_vn: "Cô ấy là giáo viên. Anh ấy làm kỹ sư.",
      answer: "She is a teacher. He is an engineer.",
    },
    {
      id: "pt5-3",
      prompt_vn: "Quốc tịch của bạn là gì?",
      answer: "What is your nationality?",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A05-1",
      sentence: "What is your name's?",
      errorWord: "name's",
      correction: "name",
      explanation_vn: "'What is your NAME?' — không thêm sở hữu cách 's' vào đây. 'Name's' là lỗi phổ biến.",
    },
    {
      id: "sc-A05-2",
      sentence: "I am come from Vietnam.",
      errorWord: "am come",
      correction: "come",
      explanation_vn: "'I COME from Vietnam' (Simple Present). 'Am come' sai — 'come' không phải present continuous ở đây.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA05-1",
      audio_text: "My name is Linh and I am twenty years old.",
      prompt_vn: "Tên tôi là Linh và tôi hai mươi tuổi.",
      words: ["My", "name", "is", "Linh", "and", "I", "am", "twenty", "years", "old", ".", "are", "have"],
      answer: "My name is Linh and I am twenty years old .",
    },
    {
      id: "laA05-2",
      audio_text: "I come from Vietnam and I live in Hanoi.",
      prompt_vn: "Tôi đến từ Việt Nam và tôi sống ở Hà Nội.",
      words: ["I", "come", "from", "Vietnam", "and", "I", "live", "in", "Hanoi", ".", "am come", "lives"],
      answer: "I come from Vietnam and I live in Hanoi .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi đến từ Việt Nam.",
      words: ["I", "am", "from", "Vietnam", ".", "is", "are"],
      answer: "I am from Vietnam .",
    },
    {
      id: "wb2",
      prompt_vn: "Cô ấy là bác sĩ và cô ấy đã kết hôn.",
      words: ["She", "is", "a", "doctor", "and", "she", "is", "married", ".", "are"],
      answer: "She is a doctor and she is married .",
    },
    {
      id: "wb3",
      prompt_vn: "Quốc tịch của bạn là gì?",
      words: ["What", "is", "your", "nationality", "?", "are"],
      answer: "What is your nationality ?",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s5-1",
      prompt_vn: "Tôi đến từ Việt Nam.",
      words: ["I", "am", "from", "Vietnam", "."],
      answer: "I am from Vietnam .",
    },
    {
      id: "s5-2",
      prompt_vn: "Cô ấy là bác sĩ và cô ấy đã kết hôn.",
      words: ["She", "is", "a", "doctor", "and", "she", "is", "married", "."],
      answer: "She is a doctor and she is married .",
    },
    {
      id: "s5-3",
      prompt_vn: "Quốc tịch của bạn là gì?",
      words: ["What", "is", "your", "nationality", "?"],
      answer: "What is your nationality ?",
    },
  ],


  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Tại sân bay — Kiểm tra hải quan",
      audio: "/audio/unit-a0-5/dialogue_1.mp3",
      desc: "Minh đang qua cửa kiểm tra hải quan ở sân bay nước ngoài.",
      lines: [
        {
          id: "d5-1-1",
          speaker: "Officer",
          text: "Good morning. What is your name?",
          translation: "Chào buổi sáng. Tên bạn là gì?",
        },
        {
          id: "d5-1-2",
          speaker: "Minh",
          text: "My name is Nguyen Van Minh.",
          translation: "Tên tôi là Nguyễn Văn Minh.",
        },
        {
          id: "d5-1-3",
          speaker: "Officer",
          text: "What is your nationality?",
          translation: "Quốc tịch của bạn là gì?",
        },
        {
          id: "d5-1-4",
          speaker: "Minh",
          text: "I am Vietnamese. I am from Vietnam.",
          translation: "Tôi là người Việt Nam. Tôi đến từ Việt Nam.",
        },
        {
          id: "d5-1-5",
          speaker: "Officer",
          text: "How old are you?",
          translation: "Bạn bao nhiêu tuổi?",
        },
        {
          id: "d5-1-6",
          speaker: "Minh",
          text: "My age is twenty-eight. I am twenty-eight years old.",
          translation: "Tuổi tôi là hai mươi tám. Tôi hai mươi tám tuổi.",
        },
        {
          id: "d5-1-7",
          speaker: "Officer",
          text: "What is your job?",
          translation: "Nghề nghiệp của bạn là gì?",
        },
        {
          id: "d5-1-8",
          speaker: "Minh",
          text: "I work as a software engineer. I live in Ho Chi Minh City.",
          translation: "Tôi làm kỹ sư phần mềm. Tôi sống ở thành phố Hồ Chí Minh.",
        },
        {
          id: "d5-1-9",
          speaker: "Officer",
          text: "Are you single or married?",
          translation: "Bạn độc thân hay đã kết hôn?",
        },
        {
          id: "d5-1-10",
          speaker: "Minh",
          text: "I am single. And my phone number is 0912345678. My address is...",
          translation: "Tôi độc thân. Và số điện thoại của tôi là 0912345678. Địa chỉ của tôi là...",
        },
      ],
    },
    {
      id: 2,
      title: "Trên máy bay — Gặp người ngồi cạnh",
      audio: "/audio/unit-a0-5/dialogue_2.mp3",
      desc: "Minh làm quen với hành khách ngồi cạnh trên máy bay.",
      lines: [
        {
          id: "d5-2-1",
          speaker: "Sara",
          text: "Hi! I'm Sara. Where are you from?",
          translation: "Xin chào! Tôi là Sara. Bạn đến từ đâu?",
        },
        {
          id: "d5-2-2",
          speaker: "Minh",
          text: "Hi Sara! I'm Minh. I am from Vietnam. And you?",
          translation: "Xin chào Sara! Tôi là Minh. Tôi đến từ Việt Nam. Còn bạn?",
        },
        {
          id: "d5-2-3",
          speaker: "Sara",
          text: "I'm from the UK! What's your job, Minh?",
          translation: "Tôi đến từ Anh! Nghề nghiệp của bạn là gì, Minh?",
        },
        {
          id: "d5-2-4",
          speaker: "Minh",
          text: "I work as an engineer. I live in Hanoi. Are you married?",
          translation: "Tôi làm kỹ sư. Tôi sống ở Hà Nội. Bạn đã kết hôn chưa?",
        },
        {
          id: "d5-2-5",
          speaker: "Sara",
          text: "No, I'm single! My age is twenty-six. Nice to meet you, Minh!",
          translation: "Không, tôi độc thân! Tuổi tôi là hai mươi sáu. Rất vui được gặp bạn, Minh!",
        },
      ],
    },
  ],


  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac5-1",
      audio_text: "I am from Vietnam",
      options: ["I is from Vietnam", "I am from Vietnam", "I are from Vietnam", "I from Vietnam"],
      answer: "I am from Vietnam",
    },
    {
      id: "lac5-2",
      audio_text: "She is a doctor",
      options: ["She am a doctor", "She are a doctor", "She is a doctor", "She be a doctor"],
      answer: "She is a doctor",
    },
    {
      id: "lac5-3",
      audio_text: "What is your nationality",
      options: [
        "What is your nationality",
        "What are your nationality",
        "What is your nation",
        "What your nationality is",
      ],
      answer: "What is your nationality",
    },
    {
      id: "lac5-4",
      audio_text: "I work as a teacher",
      options: ["Tôi làm giáo viên", "Tôi làm bác sĩ", "Tôi làm kỹ sư", "Tôi làm y tá"],
      answer: "Tôi làm giáo viên",
    },
    {
      id: "lac5-5",
      audio_text: "I am single and I live in Hanoi",
      options: ["Tôi độc thân và tôi sống ở Hà Nội", "Tôi đã kết hôn và tôi sống ở Hà Nội", "Tôi độc thân và tôi sống ở Đà Nẵng", "Tôi độc thân và tôi sống ở Huế"],
      answer: "Tôi độc thân và tôi sống ở Hà Nội",
    },
  ],


  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "crA05-1",
      question: "'Tôi cảm thấy mệt' nghĩa là gì trong tiếng Anh? (unitA04 - Cảm xúc)",
      options: ["I feel tired", "I am happy", "I am fine", "I feel sick"],
      answer: "I feel tired",
      type: "multiple-choice",
    },
    {
      id: "crA05-2",
      question: "'Tốt' nghĩa là gì trong tiếng Anh? (unitA04 - Cảm xúc)",
      options: ["Bad", "Good", "Tired", "Happy"],
      answer: "Good",
      type: "multiple-choice",
    },
    {
      id: "crA05-3",
      question: "Dịch sang tiếng Anh: 'Tôi khỏe' (unitA04)",
      options: [],
      answer: "I am fine",
      type: "translate",
    },
    {
      id: "crA05-4",
      question: "Dịch sang tiếng Anh: 'Bạn có khỏe không?' (unitA04)",
      options: [],
      answer: "How are you?",
      type: "translate",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/ɪ/ vs /iː/",
    description: "Phân biệt SIT /ɪ/ và SEE /iː/",
    examples: [
      { word: "sit", ipa: "/sɪt/", tip: "Ngắn, thư giãn — KHÔNG kéo dài như 'seat'" },
      { word: "seat", ipa: "/siːt/", tip: "Kéo dài, môi mỉm cười rộng hơn /ɪ/" },
    ],
    minimalPairs: [
      ["sit /ɪ/", "seat /iː/"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Luyện nhanh: Verb BE theo ngôi",
    items: [
      { en: "I AM from Vietnam.",         vn: "Tôi đến từ Việt Nam." },
      { en: "You ARE twenty years old.",  vn: "Bạn hai mươi tuổi." },
      { en: "She IS a teacher.",          vn: "Cô ấy là giáo viên." },
      { en: "He IS married.",             vn: "Anh ấy đã kết hôn." },
      { en: "We ARE single.",             vn: "Chúng tôi độc thân." },
      { en: "They ARE from Japan.",       vn: "Họ đến từ Nhật Bản." },
      { en: "What is your job?",          vn: "Nghề nghiệp của bạn là gì?" },
      { en: "Where do you live?",         vn: "Bạn sống ở đâu?" },
    ],
  },


  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I am {input} years old. I am from Vietnam.",
    level1Placeholder: "Nhập tuổi của bạn (vd: twenty-five)...",
    level2Situation:
      "Đóng vai Minh tại cửa hải quan. Trả lời 5 câu hỏi: tên, quốc tịch, tuổi, nghề nghiệp, tình trạng hôn nhân.",
    level2Hint: "My name is... / I am from... / I am ... years old / I work as... / I am single/married.",
  },


  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q5-1",
      question: "Câu nào ĐÚNG ngữ pháp?",
      options: [
        "She am a nurse.",
        "She is a nurse.",
        "She are a nurse.",
        "She be a nurse.",
      ],
      answer: "She is a nurse.",
      type: "multiple-choice",
    },
    {
      id: "q5-2",
      question: "Điền từ: 'They ___ from Japan.'",
      options: [],
      answer: "are",
      type: "cloze",
    },
    {
      id: "q5-3",
      question: "Điền từ: 'He ___ twenty-five years old.'",
      options: [],
      answer: "is",
      type: "cloze",
    },
    {
      id: "q5-4",
      question: "Câu hỏi đúng để hỏi nghề nghiệp?",
      options: [
        "What is your work?",
        "What is your job?",
        "What your job is?",
        "How is your job?",
      ],
      answer: "What is your job?",
      type: "multiple-choice",
    },
    {
      id: "q5-5",
      question: "Tôi 28 tuổi và đến từ Việt Nam. (Dịch)",
      options: [],
      answer: "I am 28 years old and I am from Vietnam.",
      type: "translate",
    },
    {
      id: "q5-6",
      question: "Cô ấy là giáo viên và đã kết hôn. (Dịch)",
      options: [],
      answer: "She is a teacher and she is married.",
      type: "translate",
    },
    {
      id: "q5-7",
      question: "Quốc tịch của bạn là gì? (Dịch)",
      options: [],
      answer: "What is your nationality?",
      type: "translate",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA05-reading-1",
    title: "About Me",
    title_vn: "Đọc đoạn về thông tin cá nhân",
    level: "A0" as const,
    text:
      "My name is Minh. I am 25 years old. " +
      "I am Vietnamese. I am a student. " +
      "I live in Ho Chi Minh City. " +
      "My phone number is 0901 234 567. " +
      "My email is minh@email.com. " +
      "Nice to meet you!",
    questions: [
      {
        id: "uA05r-q1",
        question_vn: "Minh bao nhiêu tuổi?",
        options: ["20", "23", "25", "30"],
        answer: "25",
        explanation_vn: "'I am 25 years old.'",
      },
      {
        id: "uA05r-q2",
        question_vn: "Minh là người nước nào?",
        options: ["Japanese", "Chinese", "Vietnamese", "Korean"],
        answer: "Vietnamese",
        explanation_vn: "'I am Vietnamese.'",
      },
      {
        id: "uA05r-q3",
        question_vn: "Minh sống ở đâu?",
        options: ["Hanoi", "Da Nang", "Hue", "Ho Chi Minh City"],
        answer: "Ho Chi Minh City",
        explanation_vn: "'I live in Ho Chi Minh City.'",
      },
      {
        id: "uA05r-q4",
        question_vn: "Minh làm nghề gì?",
        options: ["Teacher", "Doctor", "Student", "Engineer"],
        answer: "Student",
        explanation_vn: "'I am a student.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "sNvmqN2MBBo", // BBC Learning English — Introducing yourself
  jobScenarios: [
    {
      id: 1,
      title: "Gọi điện đặt lịch hẹn phỏng vấn hoặc meeting",
      focus: "Phone language: introduce, purpose, confirm time/place (entry)",
      context: "Gọi HR hoặc đối tác khi apply việc",
      l1Note: "⚠️ 'Hello, this is Minh calling about the interview.' 'Can I confirm the time on Monday at 10am?'",
      example: "Hi, I'm calling about the sales assistant position. Is 9am on Tuesday okay for the interview?"
    }
  ], 
};


