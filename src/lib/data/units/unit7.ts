import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-7 — Shopping & Prices  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit7: UnitData = {
  unitId: "unit-7",
  title: "Unit 7: Shopping & Prices",
  level: "A1",
  xp: 85,
  estimatedTime: 45,
  description: "Học từ vựng mua sắm, cách hỏi giá và mặc cả bằng tiếng Anh tự nhiên.",
  badgeName: "Người Mua Sắm Thông Minh",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn đang mua sắm tại cửa hàng ở nước ngoài — cần hỏi giá, so sánh sản phẩm và thanh toán bằng tiếng Anh.",
  learningOutcomes: [
    "Hỏi giá và mặc cả sản phẩm tự tin",
    "So sánh và mô tả hàng hóa bạn muốn mua",
    "Hoàn tất giao dịch mua bán bằng tiếng Anh"
  ],
  badgeEmoji: "🛍️",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "💰", en: "How much is this shirt?", vn: "Chiếc áo này giá bao nhiêu?", context: "Hỏi giá đồ đơn lẻ" },
    { emoji: "👟", en: "How much are these shoes?", vn: "Đôi giày này giá bao nhiêu?", context: "Hỏi giá đồ số nhiều" },
    { emoji: "🏷️", en: "Can I have a discount?", vn: "Bạn có thể giảm giá cho tôi không?", context: "Mặc cả lịch sự" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Ở chợ Việt Nam, mặc cả là bình thường. Nhưng ở siêu thị hoặc cửa hàng lớn, giá thường cố định. Khi nói tiếng Anh, <span class=\"text-emerald-400 font-semibold\">How much is/are...?</span> là cách hỏi giá tự nhiên nhất — không nói 'What is the price of...?' trong giao tiếp thường ngày.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "price", emoji: "💰", phonetic: "/praɪs/", meaning: "giá cả", example: "What is the price of this bag?", example2: "The price is very reasonable.", collocation: "price tag / half price", audio: "/audio/unit-7/price.mp3" , l1_interference_vn: "⚠️ Âm /pr/ người Việt hay tách: 'puh-rice'. Luyện nối: 'price' không phải 'p-rice'." },
    { id: 2, word: "cheap", emoji: "✅", phonetic: "/tʃiːp/", meaning: "rẻ", example: "This shirt is very cheap.", example2: "I found a cheap flight to London.", collocation: "cheap price / dirt cheap", audio: "/audio/unit-7/cheap.mp3" , l1_interference_vn: "⚠️ 'Cheap' mô tả giá thấp (trung tính). Khi mô tả người = keo kiệt — chú ý ngữ cảnh." },
    { id: 3, word: "expensive", emoji: "💎", phonetic: "/ɪkˈspensɪv/", meaning: "đắt tiền", example: "These shoes are too expensive.", example2: "Eating out every day is expensive.", collocation: "too expensive / very expensive", audio: "/audio/unit-7/expensive.mp3" , l1_interference_vn: "⚠️ Stress: ex-PEN-sive (âm 2). Người Việt hay đọc 'EX-pen-sive' — stress âm 1." },
    { id: 4, word: "discount", emoji: "🏷️", phonetic: "/ˈdɪskaʊnt/", meaning: "giảm giá", example: "Can I have a discount?", example2: "There is a 20% discount today.", collocation: "student discount / get a discount", audio: "/audio/unit-7/discount.mp3" , l1_interference_vn: "⚠️ DIS-count (danh từ) vs dis-COUNT (động từ). 'A 10% discount' (n) vs 'discount the price' (v)." },
    { id: 5, word: "receipt", emoji: "🧾", phonetic: "/rɪˈsiːt/", meaning: "hóa đơn", example: "Can I have a receipt, please?", example2: "Keep your receipt for returns.", collocation: "sales receipt", audio: "/audio/unit-7/receipt.mp3" , l1_interference_vn: "⚠️ 'p' hoàn toàn CÂM — đọc /rɪˈsiːt/. Không đọc 'rê-cept' hay 're-seipt'." },
    { id: 6, word: "size", emoji: "📏", phonetic: "/saɪz/", meaning: "kích cỡ", example: "What size do you need?", example2: "I wear a medium size.", collocation: "what size / size medium/large", audio: "/audio/unit-7/size.mp3" , l1_interference_vn: "⚠️ Âm cuối /z/ (có rung), không phải /s/. 'What size are you?' không phải 'What is your size?'" },
    { id: 7, word: "try on", emoji: "👗", phonetic: "/traɪ ɒn/", meaning: "thử đồ", example: "Can I try this on?", example2: "I want to try on the blue dress.", collocation: "try on clothes", audio: "/audio/unit-7/try_on.mp3" , l1_interference_vn: "⚠️ Phrasal verb tách được: 'try it on' hoặc 'try on the shirt'. Không chỉ nói 'try'." },
    { id: 8, word: "pay", emoji: "💳", phonetic: "/peɪ/", meaning: "trả tiền", example: "How would you like to pay?", example2: "I usually pay by card.", collocation: "pay by cash / pay by card", audio: "/audio/unit-7/pay.mp3" , l1_interference_vn: "⚠️ 'Pay FOR something': 'I paid FOR the shirt'. Không phải 'I paid the shirt' (thiếu 'for')." },
    { id: 9, word: "change", emoji: "🪙", phonetic: "/tʃeɪndʒ/", meaning: "tiền thối", example: "Here is your change.", example2: "I don't have any change.", collocation: "give change / keep the change", audio: "/audio/unit-7/change.mp3" , l1_interference_vn: "⚠️ 'Change' (tiền thối) vs 'change' (thay đổi) — phân biệt qua ngữ cảnh. 'Keep the change'." },
    { id: 10, word: "shopping cart", emoji: "🛒", phonetic: "/ˈʃɒpɪŋ kɑːt/", meaning: "xe đẩy hàng", example: "Put it in the shopping cart.", example2: "The shopping cart is full.", collocation: "fill the shopping cart", audio: "/audio/unit-7/shopping_cart.mp3", l1_interference_vn: "⚠️ Anh-Mỹ: 'shopping cart'. Anh-Anh: 'shopping trolley'. Cả hai đều đúng — tùy region." },
    { id: 11, word: "cash", emoji: "💵", phonetic: "/kæʃ/", meaning: "tiền mặt", example: "Do you accept cash?", example2: "I only have cash today.", collocation: "pay in cash", audio: "/audio/unit-7/cash.mp3" , l1_interference_vn: "⚠️ 'Pay in cash' hoặc 'pay cash' — không phải 'pay by cash'. 'By' dùng với 'card'." },
    { id: 12, word: "sale", emoji: "📢", phonetic: "/seɪl/", meaning: "giảm giá / đợt sale", example: "The shop has a sale today.", example2: "I bought this on sale.", collocation: "on sale / end-of-season sale", audio: "/audio/unit-7/sale.mp3", l1_interference_vn: "⚠️ 'On sale' = đang giảm giá. 'For sale' = đang bán (chưa mua). Hai cụm hoàn toàn khác nhau!" },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Tại cửa hàng quần áo",
      audio: "/audio/unit-7/dialogue_1.mp3",
      desc: "Linh đang mua sắm tại một cửa hàng quần áo.",
      lines: [
        { id: "d1-1", speaker: "Staff", text: "Hello! Can I help you?", translation: "Xin chào! Tôi có thể giúp gì cho bạn?" },
        { id: "d1-2", speaker: "Linh", text: "Yes, please. How much is this dress?", translation: "Vâng ạ. Chiếc váy này giá bao nhiêu?" },
        { id: "d1-3", speaker: "Staff", text: "It's three hundred thousand dong.", translation: "Là 300.000 đồng." },
        { id: "d1-4", speaker: "Linh", text: "Can I try it on?", translation: "Tôi có thể thử không?" },
        { id: "d1-5", speaker: "Staff", text: "Of course! The changing room is over there.", translation: "Dĩ nhiên! Phòng thử đồ ở đằng kia." },
        { id: "d1-6", speaker: "Linh", text: "It fits well. Can I have a discount?", translation: "Vừa lắm. Tôi có được giảm giá không?" },
        { id: "d1-7", speaker: "Staff", text: "We have a 10% discount today. You pay two hundred and seventy thousand dong.", translation: "Hôm nay có giảm 10%. Bạn trả 270.000 đồng." },
      ]
    },
    {
      id: 2,
      title: "Tại chợ",
      audio: "/audio/unit-7/dialogue_2.mp3",
      desc: "Tom đang mua hoa quả tại chợ địa phương.",
      lines: [
        { id: "d2-1", speaker: "Tom", text: "How much are these mangoes?", translation: "Những quả xoài này giá bao nhiêu?" },
        { id: "d2-2", speaker: "Seller", text: "They are fifty thousand dong per kilogram.", translation: "Chúng giá 50.000 đồng một ký." },
        { id: "d2-3", speaker: "Tom", text: "That's a bit expensive. Can you give me a discount?", translation: "Hơi đắt. Bạn có thể giảm giá không?" },
        { id: "d2-4", speaker: "Seller", text: "OK, forty thousand. That's the best price.", translation: "Được, 40.000. Đó là giá tốt nhất rồi." },
        { id: "d2-5", speaker: "Tom", text: "OK, I'll take two kilograms. Here is one hundred thousand.", translation: "OK, tôi lấy hai ký. Đây là 100.000." },
        { id: "d2-6", speaker: "Seller", text: "And here is your change — twenty thousand dong.", translation: "Và đây là tiền thối — 20.000 đồng." },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "How much is this shirt", options: ["How much are these shirts", "How much is this shirt", "How much is that dress", "How much does this cost"], answer: "How much is this shirt" },
    { id: "lac2", audio_text: "It costs fifty thousand dong", options: ["It costs fifteen thousand dong", "It costs fifty thousand dong", "They cost fifty thousand dong", "It costs five thousand dong"], answer: "It costs fifty thousand dong" },
    { id: "lac3", audio_text: "Can I try this on", options: ["Can I buy this", "Can I have this", "Can I try this on", "Can I pay for this"], answer: "Can I try this on" },
    { id: "lac4", audio_text: "How much are these shoes", options: ["How much is this shoe", "How much are these shoes", "How much are those bags", "How much is a shoe"], answer: "How much are these shoes" },
    { id: "lac5", audio_text: "I pay by card", options: ["I pay by cash", "I pay online", "I pay by card", "She pays by card"], answer: "I pay by card" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "How much is this {input}?",
    level1Placeholder: "Ví dụ: shirt, bag, dress, book...",
    level2Situation: "Bạn đang mua sắm tại một cửa hàng quần áo ở Hà Nội. Hỏi giá, thử đồ và xem có được giảm giá không.",
    level2Hint: "Excuse me, how much is this [đồ vật]? Can I try it on? That's [expensive/cheap]. Can I have a discount? I'll pay by [cash/card].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "How much is/are...? — Hỏi giá",
    rule: "How much is + singular noun? / How much are + plural nouns? / It costs / They cost...",
    examples: [
      { en: "How much is this bag?", vn: "Chiếc túi này giá bao nhiêu?" },
      { en: "How much are these shoes?", vn: "Đôi giày này giá bao nhiêu?" },
      { en: "It costs fifty thousand dong.", vn: "Nó giá 50.000 đồng." },
      { en: "They cost one hundred thousand dong.", vn: "Chúng giá 100.000 đồng." },
    ],
    tip: "Dùng 'How much IS' với danh từ số ít (this shirt, this bag). Dùng 'How much ARE' với danh từ số nhiều (these shoes, those bags). Trả lời bằng 'It costs...' hoặc 'They cost...'",
    vnNote: "⚠️ Lưu ý: Tiếng Việt không dùng mạo từ 'a/an/the'. Tiếng Anh BẮT BUỘC phải dùng. 'I want coffee' (sai khi chỉ định) → 'I want a coffee'. 'Give me report' (SAI) → 'Give me the report' (ĐÚNG). Đây là lỗi số 1 của người Việt học tiếng Anh!",
    dialogueExample: {
      speaker: "Linh",
      text: "How much is this dress?",
      translation: "Chiếc váy này giá bao nhiêu?",
      highlight: "How much is",
    },
    ccq: {
      question: "Hỏi giá nhiều quyển sách: chọn câu đúng:",
      options: ["How much is these books?", "How much are these books?", "How many are these books?", "How much these books are?"],
      answer: "How much are these books?",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng mua sắm với nghĩa",
    pairs: [
      { left: "cheap", right: "rẻ" },
      { left: "discount", right: "giảm giá" },
      { left: "receipt", right: "hóa đơn" },
      { left: "try on", right: "thử đồ" },
      { left: "change", right: "tiền thối" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", question: "Hỏi giá một chiếc áo:", options: ["How much are this shirt?", "How much is this shirt?", "How many is this shirt?", "How much this shirt is?"], answer: "How much is this shirt?", type: "multiple-choice" },
    { id: "pq2", question: "'Can I try this on?' — nghĩa là gì?", options: ["Có thể mua không?", "Có thể giảm giá không?", "Có thể thử đồ không?", "Có thể trả tiền không?"], answer: "Có thể thử đồ không?", type: "multiple-choice" },
    { id: "pq3", question: "Điền từ còn thiếu: 'It ___ fifty thousand dong.'", options: [], answer: "costs", type: "cloze" },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    { id: "pt7-1", prompt_vn: "Cái áo này giá bao nhiêu?", answer: "How much is this shirt?" },
    { id: "pt7-2", prompt_vn: "Tôi muốn mua một đôi giày.", answer: "I want to buy a pair of shoes." },
    { id: "pt7-3", prompt_vn: "Cái này quá đắt.", answer: "This is too expensive." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "q1", question: "Câu hỏi giá đúng với 'these jeans':", options: ["How much is these jeans?", "How much are these jeans?", "How many are these jeans?", "How much these jeans?"], answer: "How much are these jeans?", type: "multiple-choice",
      explanation_vn: "'These jeans' là số nhiều → 'How much ARE'. Không dùng 'How many' cho hàng không đếm được theo cái." },
    { id: "q2", question: "Muốn trả bằng thẻ, bạn nói:", options: ["I pay by cash.", "I pay by card.", "I pay by check.", "I pay online."], answer: "I pay by card.", type: "multiple-choice",
      explanation_vn: "'Pay by card' = trả bằng thẻ. 'Pay by cash' = trả tiền mặt. Cầu trúc: 'pay by + phương tiện thanh toán'." },
    { id: "q3", question: "Từ nào có nghĩa là 'đắt tiền'?", options: ["cheap", "sale", "expensive", "discount"], answer: "expensive", type: "multiple-choice",
      explanation_vn: "'Expensive' = đắt. 'Cheap' = rẻ. 'Discount' = giảm giá. 'Sale' = đợt bán hàng giảm giá." },
    { id: "q4", question: "Điền vào: 'How much ___ these shoes?'", options: [], answer: "are", type: "cloze" },
    { id: "q5", question: "Điền vào: 'They ___ two hundred thousand dong.'", options: [], answer: "cost", type: "cloze" },
    { id: "q6", question: "Tôi có thể thử chiếc váy này không?", options: [], answer: "Can I try this dress on?", type: "translate" },
    { id: "q7", question: "Hôm nay có đợt giảm giá 20%.", options: [], answer: "There is a 20% discount today.", type: "translate" },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc7-1",
      sentence: "How much is these jeans?",
      errorWord: "is",
      correction: "are",
      explanation_vn: "'These jeans' (số nhiều) → 'How much ARE'. Tương tự: 'How much are these shoes/trousers?'",
    },
    {
      id: "sc7-2",
      sentence: "This shirt costed fifty dollars.",
      errorWord: "costed",
      correction: "cost",
      explanation_vn: "'Cost' không đổi ở quá khứ: cost → cost (không có '-ed'). Lỗi rất phổ biến!",
    },
  ],


  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la7-1",
      audio_text: "How much is this shirt?",
      prompt_vn: "Chiếc áo này giá bao nhiêu?",
      words: ["How", "much", "is", "this", "shirt", "?", "many", "cost"],
      answer: "How much is this shirt ?",
    },
    {
      id: "la7-2",
      audio_text: "I pay by card.",
      prompt_vn: "Tôi trả bằng thẻ.",
      words: ["I", "pay", "by", "card", ".", "cash", "with"],
      answer: "I pay by card .",
    },
  ],


  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Chiếc áo này giá bao nhiêu?",
      words: ["How", "much", "is", "this", "shirt", "?", "was", "were"],
      answer: "How much is this shirt ?",
    },
    {
      id: "wb2",
      prompt_vn: "Tôi có thể giảm giá không?",
      words: ["Can", "I", "have", "a", "discount", "?", "was", "were"],
      answer: "Can I have a discount ?",
    },
    {
      id: "wb3",
      prompt_vn: "Những đôi giày này giá bao nhiêu?",
      words: ["How", "much", "are", "these", "shoes", "?", "was", "were"],
      answer: "How much are these shoes ?",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s7-1",
      prompt_vn: "Chiếc áo này giá bao nhiêu?",
      words: ["How", "much", "is", "this", "shirt", "?"],
      answer: "How much is this shirt ?",
    },
    {
      id: "s7-2",
      prompt_vn: "Tôi có thể giảm giá không?",
      words: ["Can", "I", "have", "a", "discount", "?"],
      answer: "Can I have a discount ?",
    },
    {
      id: "s7-3",
      prompt_vn: "Những đôi giày này giá bao nhiêu?",
      words: ["How", "much", "are", "these", "shoes", "?"],
      answer: "How much are these shoes ?",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr7-1",
      question: "Chọn câu đúng về đồ đạc trong phòng: (Unit 6: There is/are)",
      options: ["There is two chairs.", "There are two chairs.", "There be two chairs.", "Two chairs there are."],
      answer: "There are two chairs.",
      type: "multiple-choice",
    },
    {
      id: "cr7-2",
      question: "Có phòng tắm nào ở tầng trên không? (Unit 6)",
      options: [],
      answer: "Is there a bathroom upstairs?",
      type: "translate",
    },
    {
      id: "cr7-3",
      question: "Chọn: 'I like ___ photos.' (Unit 5 hobbies)",
      options: ["take", "taking", "to taking", "takes"],
      answer: "taking",
      type: "multiple-choice",
      explanation_vn: "Like + V-ing.",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/æ/",
    description: "Nguyên âm /æ/ (cat, can, map) — miệng mở rộng, lưỡi thấp và ra trước",
    examples: [
        { word: "can", ipa: "/kæn/", tip: "Miệng mở rộng theo chiều ngang như cười gượng, lưỡi thấp nhất" },
        { word: "cash", ipa: "/kæʃ/", tip: "So sánh: cash /æ/ vs fresh /ɛ/ — cash mở hơn nhiều" },
    ],
    minimalPairs: [
        ["can", "ken"],
        ["bad", "bed"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "a coffee", vn: "một ly cà phê" },
      { en: "the manager", vn: "người quản lý" },
      { en: "an email", vn: "một cái email" },
      { en: "the meeting", vn: "cuộc họp cụ thể" },
      { en: "a report", vn: "một bản báo cáo" },
      { en: "the office", vn: "văn phòng cụ thể" },
      { en: "an idea", vn: "một ý tưởng" },
      { en: "the deadline", vn: "hạn chót" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit7-reading-1",
    title: "My Favourite Clothes",
    title_vn: "Đọc đoạn về trang phục yêu thích",
    level: "A1" as const,
    text:
      "My name is Nam. I love clothes! For work, I usually wear a white shirt and black trousers. " +
      "My favourite colour is blue, so I have many blue shirts. " +
      "In the summer, I like to wear a T-shirt and jeans. " +
      "My sister loves wearing dresses and skirts. " +
      "She always looks very stylish! " +
      "On cold days, I wear a jacket and boots. " +
      "I always check the size before I buy clothes. " +
      "Shopping for clothes is my favourite weekend activity!",
    questions: [
      {
        id: "u7r-q1",
        question_vn: "Nam thường mặc gì khi đi làm?",
        options: [
          "A T-shirt and jeans",
          "A dress and boots",
          "A white shirt and black trousers",
          "A jacket and skirt",
        ],
        answer: "A white shirt and black trousers",
        explanation_vn: "'For work, I usually wear a white shirt and black trousers.'",
      },
      {
        id: "u7r-q2",
        question_vn: "Màu sắc yêu thích của Nam là gì?",
        options: ["Red", "Black", "White", "Blue"],
        answer: "Blue",
        explanation_vn: "'My favourite colour is blue, so I have many blue shirts.'",
      },
      {
        id: "u7r-q3",
        question_vn: "Nam mặc gì vào ngày lạnh?",
        options: [
          "A T-shirt and jeans",
          "A jacket and boots",
          "A dress and skirt",
          "A shirt and trousers",
        ],
        answer: "A jacket and boots",
        explanation_vn: "'On cold days, I wear a jacket and boots.'",
      },
      {
        id: "u7r-q4",
        question_vn: "Em gái của Nam thích mặc gì?",
        options: [
          "Jeans and T-shirts",
          "Shirts and trousers",
          "Dresses and skirts",
          "Jackets and boots",
        ],
        answer: "Dresses and skirts",
        explanation_vn: "'My sister loves wearing dresses and skirts.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Hỏi trang phục đi làm / phỏng vấn",
      focus: "wear + clothes for office (shirt, trousers, jacket, dress code)",
      context: "Hỏi đồng nghiệp hoặc chuẩn bị phỏng vấn: mặc gì phù hợp tại công ty VN",
      l1Note: "⚠️ 'I usually wear a white shirt' — không 'I wearing'. 'For work' + 'on cold days'.",
      example: "For work, I usually wear a white shirt and black trousers. On cold days, I wear a jacket."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "kJfmNekLLEI",
};


