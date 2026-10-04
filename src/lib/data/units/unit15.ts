import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-15 — Shopping & Comparing  (A2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit15: UnitData = {
  unitId: "unit-15",
  title: "Unit 15: Shopping & Comparing",
  level: "A2",
  xp: 90,
  estimatedTime: 45,
  description: "Học từ vựng mua sắm và cách so sánh bằng comparative & superlative adjectives.",
  badgeName: "Người Mua Sắm Thông Minh",
  badgeEmoji: "🛍️",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn đang giúp đồng nghiệp người nước ngoài mua đồ điện tử ở Hà Nội. Bạn cần so sánh các sản phẩm và thuyết phục họ chọn loại phù hợp với ngân sách.",
  learningOutcomes: [
    "So sánh hai đối tượng bằng comparative (-er/more)",
    "Chỉ ra đối tượng tốt nhất bằng superlative (-est/most)",
    "Dùng từ vựng mua sắm trong ngữ cảnh thực tế"
  ],

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🛍️", en: "This laptop is cheaper than that one.", vn: "Chiếc laptop này rẻ hơn chiếc kia.", context: "So sánh giá cả" },
    { emoji: "🏆", en: "This is the best deal in the store.", vn: "Đây là ưu đãi tốt nhất trong cửa hàng.", context: "Superlative - tốt nhất" },
    { emoji: "💰", en: "Do you have anything cheaper?", vn: "Bạn có gì rẻ hơn không?", context: "Hỏi về giá" }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Khi mua sắm ở Việt Nam, bạn có thể <span class=\"text-emerald-400 font-semibold\">mặc cả (bargain)</span> ở chợ hoặc cửa hàng nhỏ, nhưng không mặc cả ở siêu thị lớn hay trung tâm thương mại. Với đồng nghiệp nước ngoài, hãy giải thích sự khác biệt này để họ không ngại thương lượng giá khi mua sắm ở chợ.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "cheap", emoji: "💰", phonetic: "/tʃiːp/", meaning: "rẻ", example: "This phone is very cheap.", example2: "I'm looking for something cheap but good.", collocation: "cheap price / dirt cheap", audio: "/audio/unit-15/cheap.mp3" , l1_interference_vn: "⚠️ 'Cheap' mô tả giá thấp (trung tính). Khi mô tả người = keo kiệt — chú ý ngữ cảnh." },
    { id: 2, word: "expensive", emoji: "💎", phonetic: "/ɪkˈspensɪv/", meaning: "đắt tiền", example: "That watch is too expensive for me.", example2: "Luxury brands are always expensive.", collocation: "very expensive / too expensive", audio: "/audio/unit-15/expensive.mp3" , l1_interference_vn: "⚠️ Stress: ex-PEN-sive (âm 2). Người Việt hay đọc 'EX-pen-sive' — stress âm 1." },
    { id: 3, word: "quality", emoji: "⭐", phonetic: "/ˈkwɒlɪti/", meaning: "chất lượng", example: "The quality of this product is excellent.", example2: "Don't sacrifice quality for price.", collocation: "high quality / good quality / quality product", audio: "/audio/unit-15/quality.mp3" , l1_interference_vn: "⚠️ Stress: QUAL-i-ty (âm 1). 'High quality products' — 'quality' là tính từ, không có 'a'." },
    { id: 4, word: "discount", emoji: "🏷️", phonetic: "/ˈdɪskaʊnt/", meaning: "giảm giá", example: "Is there a discount for students?", example2: "We offer a 20% discount on all items.", collocation: "get a discount / offer a discount", audio: "/audio/unit-15/discount.mp3" , l1_interference_vn: "⚠️ DIS-count (danh từ) vs dis-COUNT (động từ). 'A 10% discount' (n) vs 'discount the price' (v)." },
    { id: 5, word: "receipt", emoji: "🧾", phonetic: "/rɪˈsiːt/", meaning: "hóa đơn", example: "Can I have a receipt, please?", example2: "Keep your receipt in case you need to return it.", collocation: "get a receipt / keep the receipt", audio: "/audio/unit-15/receipt.mp3" , l1_interference_vn: "⚠️ 'p' hoàn toàn CÂM — đọc /rɪˈsiːt/. Không đọc 'rê-cept' hay 're-seipt'." },
    { id: 6, word: "refund", emoji: "💸", phonetic: "/ˈriːfʌnd/", meaning: "hoàn tiền", example: "Can I get a refund for this item?", example2: "The store gives refunds within 30 days.", collocation: "ask for a refund / full refund", audio: "/audio/unit-15/refund.mp3" , l1_interference_vn: "⚠️ RE-fund (danh từ, âm 1) vs re-FUND (động từ, âm 2). 'Get a refund' vs 'refund the money'." },
    { id: 7, word: "compare", emoji: "⚖️", phonetic: "/kəmˈpeər/", meaning: "so sánh", example: "Let me compare these two phones.", example2: "It's smart to compare prices before buying.", collocation: "compare prices / compare products", audio: "/audio/unit-15/compare.mp3" , l1_interference_vn: "⚠️ 'Compare A with/to B' — cả 'with' và 'to' đúng. 'Compare A and B' cũng thông dụng." },
    { id: 8, word: "better", emoji: "⬆️", phonetic: "/ˈbetər/", meaning: "tốt hơn (comparative của good)", example: "This laptop is better than that one.", example2: "Exercise makes you feel better.", collocation: "much better / a lot better", audio: "/audio/unit-15/better.mp3" , l1_interference_vn: "⚠️ So sánh bất quy tắc của 'good'. Không phải 'gooder' hay 'more good'." },
    { id: 9, word: "best", emoji: "🏆", phonetic: "/best/", meaning: "tốt nhất (superlative của good)", example: "This is the best deal in the shop.", example2: "She always does her best.", collocation: "the best option / best value", audio: "/audio/unit-15/best.mp3", l1_interference_vn: "⚠️ 'Best' là superlative của 'good' — bất quy tắc. 'The best' — LUÔN có 'the'. KHÔNG 'most good' hay 'goodest'." },
    { id: 10, word: "warranty", emoji: "📜", phonetic: "/ˈwɒrənti/", meaning: "bảo hành", example: "This product has a one-year warranty.", example2: "Is the warranty included in the price?", collocation: "under warranty / warranty period", audio: "/audio/unit-15/warranty.mp3", l1_interference_vn: "⚠️ 'Under warranty' = còn bảo hành. 'The warranty period'. 'Warranty' (Anh-Mỹ) = 'guarantee' (Anh-Anh)." },
    { id: 11, word: "brand", emoji: "™️", phonetic: "/brænd/", meaning: "thương hiệu", example: "What brand do you prefer?", example2: "I usually buy Korean brands.", collocation: "popular brand / brand name", audio: "/audio/unit-15/brand.mp3" , l1_interference_vn: "⚠️ Âm /brænd/ — 'a' ngắn. 'Brand new' = hoàn toàn mới. 'Brand' ≠ 'label' (nhãn dán)." },
    { id: 12, word: "afford", emoji: "💳", phonetic: "/əˈfɔːrd/", meaning: "có khả năng chi trả", example: "I can't afford this laptop. It's too expensive.", example2: "Can you afford to travel this year?", collocation: "can afford / can't afford", audio: "/audio/unit-15/afford.mp3" , l1_interference_vn: "⚠️ 'Can't afford TO buy' — không phải 'can't afford buying'. Sau 'afford' dùng to-infinitive." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Mua điện thoại",
      audio: "/audio/unit-15/dialogue_1.mp3",
      desc: "Minh giúp đồng nghiệp Tom mua điện thoại ở cửa hàng.",
      lines: [
        { id: "d1-1", speaker: "Tom", text: "Minh, I need a new phone. Can you help me choose?", translation: "Minh, tôi cần điện thoại mới. Bạn có thể giúp tôi chọn không?" },
        { id: "d1-2", speaker: "Minh", text: "Sure! What's your budget?", translation: "Được chứ! Ngân sách của bạn là bao nhiêu?" },
        { id: "d1-3", speaker: "Tom", text: "Around 5 million VND. I want good quality but not too expensive.", translation: "Khoảng 5 triệu đồng. Tôi muốn chất lượng tốt nhưng không quá đắt." },
        { id: "d1-4", speaker: "Minh", text: "This Samsung is cheaper than the iPhone. It's only 4.5 million.", translation: "Chiếc Samsung này rẻ hơn iPhone. Chỉ 4.5 triệu thôi." },
        { id: "d1-5", speaker: "Tom", text: "Is the quality good? I need something durable.", translation: "Chất lượng có tốt không? Tôi cần cái gì đó bền." },
        { id: "d1-6", speaker: "Minh", text: "Yes! The camera is better than last year's model. And it has a two-year warranty. I think it's the best option for your budget!", translation: "Có! Camera tốt hơn model năm ngoái. Và có bảo hành hai năm. Tôi nghĩ đây là lựa chọn tốt nhất cho ngân sách của bạn!" },
      ]
    },
    {
      id: 2,
      title: "Hỏi giảm giá",
      audio: "/audio/unit-15/dialogue_2.mp3",
      desc: "Lan thương lượng giá ở chợ điện tử.",
      lines: [
        { id: "d2-1", speaker: "Lan", text: "Excuse me, how much is this headphone?", translation: "Xin lỗi, chiếc tai nghe này giá bao nhiêu?" },
        { id: "d2-2", speaker: "Seller", text: "It's 800,000 VND, madam.", translation: "800,000 đồng, cô ơi." },
        { id: "d2-3", speaker: "Lan", text: "That's a bit expensive. The shop next door has a cheaper price.", translation: "Hơi đắt đó. Cửa hàng bên cạnh có giá rẻ hơn." },
        { id: "d2-4", speaker: "Seller", text: "OK, I can offer you a 10% discount. So it's 720,000 VND.", translation: "Vậy thì, tôi có thể giảm 10% cho cô. Tức là 720,000 đồng." },
        { id: "d2-5", speaker: "Lan", text: "Can I have a receipt? And what about the warranty?", translation: "Tôi có thể xin hóa đơn không? Còn bảo hành thì sao?" },
        { id: "d2-6", speaker: "Seller", text: "Of course! You get a one-year warranty and a receipt. This is the best quality in the market!", translation: "Tất nhiên! Cô được bảo hành một năm và có hóa đơn. Đây là chất lượng tốt nhất trên thị trường!" },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "This laptop is cheaper than that one", options: ["This laptop is cheap than that one", "This laptop is cheaper than that one", "This laptop is the cheapest one", "This laptop is more cheap than that one"], answer: "This laptop is cheaper than that one" },
    { id: "lac2", audio_text: "I think it's the best option for your budget", options: ["I think it's the better option for your budget", "I think it's the best option for your budget", "I think it's the most best option", "I think it's best option for your budget"], answer: "I think it's the best option for your budget" },
    { id: "lac3", audio_text: "Can I get a discount on this item", options: ["Can I get a discount on this item", "Can I got a discount on this item", "Can I have discount on this item", "Can I get discount on this item"], answer: "Can I get a discount on this item" },
    { id: "lac4", audio_text: "The camera is better than last year's model", options: ["The camera is more better than last year's model", "The camera is better than last year's model", "The camera is best than last year's model", "The camera is better than last years model"], answer: "The camera is better than last year's model" },
    { id: "lac5", audio_text: "I can't afford this. It's too expensive.", options: ["I can't afford this. It's too expensive.", "I couldn't afford this. It's too expensive.", "I can't afford this. It's very expensive.", "I can't afford this. It's the most expensive."], answer: "I can't afford this. It's too expensive." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "I think {input} is better than {input} because it's more affordable.",
    level1Placeholder: "Ví dụ: Samsung, iPhone — Korean food, Japanese food...",
    level2Situation: "Bạn đang tư vấn cho sếp người nước ngoài về việc mua thiết bị cho văn phòng. So sánh ít nhất 2 lựa chọn về giá, chất lượng và bảo hành. Đề xuất lựa chọn tốt nhất.",
    level2Hint: "I recommend [product A] because it's [comparative] than [product B]. The quality is [adjective] and the price is [adjective]. It also has [feature]. I think it's the best option because [reason].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Comparative & Superlative — So sánh trong tiếng Anh",
    rule: "Comparative: adj + -er + than (short adj) / more + adj + than (long adj)\nSuperlative: the + adj + -est (short) / the most + adj (long)",
    examples: [
      { en: "cheap → cheaper → the cheapest", vn: "rẻ → rẻ hơn → rẻ nhất" },
      { en: "expensive → more expensive → the most expensive", vn: "đắt → đắt hơn → đắt nhất" },
      { en: "good → better → the best (irregular)", vn: "tốt → tốt hơn → tốt nhất (bất quy tắc)" },
      { en: "This phone is more durable than that one.", vn: "Chiếc điện thoại này bền hơn chiếc kia." },
    ],
    tip: "Quy tắc nhanh: Tính từ 1-2 âm tiết → thêm -er/-est. Tính từ ≥3 âm tiết → dùng more/most. Lưu ý đặc biệt: good/better/best, bad/worse/worst, far/further/furthest.",
    vnNote: "⚠️ Lưu ý: Comparatives có quy tắc phức tạp: tính từ ngắn thêm -er/est (fast→faster), tính từ dài dùng more/most (expensive→more expensive). Không thể nói 'more fast' hoặc 'expensiver'!",
    dialogueExample: {
      speaker: "Minh",
      text: "The camera is better than last year's model. It's the best option for your budget!",
      translation: "Camera tốt hơn model năm ngoái. Đây là lựa chọn tốt nhất cho ngân sách của bạn!",
      highlight: "better (comparative) / the best (superlative)",
    },
    ccq: {
      question: "Câu nào SO SÁNH đúng?",
      options: [
        "This laptop is more cheap than that one.",
        "This laptop is cheaper than that one. ✅",
        "This laptop is the cheapest than that one.",
        "This laptop is cheap more than that one.",
      ],
      answer: "This laptop is cheaper than that one. ✅",
      explanation: "'Cheap' là tính từ ngắn (1 âm tiết) → dùng 'cheaper + than', không dùng 'more cheap'.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng: 'This phone is ___ than that one.' (expensive)", options: ["more expensive", "expensiver", "the most expensive", "expensiveer"], answer: "more expensive" },
    { id: "pq2", type: "multiple-choice", question: "Điền đúng: 'She is the ___ student in the class.' (smart)", options: ["smarter", "more smart", "smartest", "most smart"], answer: "smartest" },
    { id: "pq3", type: "cloze", question: "Điền: 'This is the ___ (good) deal I've ever seen!'", answer: "best" },
    { id: "pq4", type: "multiple-choice", question: "Câu so sánh đúng: 'Toyota is ___ than BMW.'", options: ["more cheap", "cheapest", "cheaper", "cheap"], answer: "cheaper" },
    { id: "pq5", type: "cloze", question: "Điền: 'Samsung is ___ (affordable) than Apple.'", answer: "more affordable" },
  ],


  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "cheap", right: "rẻ" },
      { left: "discount", right: "giảm giá" },
      { left: "refund", right: "hoàn tiền" },
      { left: "warranty", right: "bảo hành" },
      { left: "afford", right: "có khả năng chi trả" },
    ],
  },


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Chiếc laptop này đắt hơn chiếc kia nhưng chất lượng tốt hơn.",
      answer: "This laptop is more expensive than that but the quality is better.",
    },
    {
      id: "pt-2",
      prompt_vn: "Cửa hàng này rẻ hơn nhưng không có giảm giá.",
      answer: "This shop is cheaper but there is no discount.",
    },
    {
      id: "pt-3",
      prompt_vn: "Chiếc điện thoại đắt nhất có bảo hành hai năm.",
      answer: "The most expensive phone has a two-year warranty.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc15-1",
      sentence: "This hotel is more cheaper than that one.",
      errorWord: "more cheaper",
      correction: "cheaper",
      explanation_vn: "'Cheap' ngắn → chỉ thêm '-er': 'cheaper'. 'More cheaper' là lỗi double comparative.",
    },
    {
      id: "sc15-2",
      sentence: "She is more taller than her sister.",
      errorWord: "more taller",
      correction: "taller",
      explanation_vn: "'Tall' ngắn (1 âm tiết) → 'taller'. Không dùng 'more' với tính từ ngắn.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la15-1",
      audio_text: "This phone is cheaper than that one.",
      prompt_vn: "Chiếc điện thoại này rẻ hơn chiếc kia.",
      words: ["This", "phone", "is", "cheaper", "than", "that", "one", ".", "more", "cheap"],
      answer: "This phone is cheaper than that one .",
    },
    {
      id: "la15-2",
      audio_text: "She is the smartest student in the class.",
      prompt_vn: "Cô ấy là học sinh giỏi nhất trong lớp.",
      words: ["She", "is", "the", "smartest", "student", "in", "the", "class", ".", "most", "smart"],
      answer: "She is the smartest student in the class .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi không đủ tiền mua laptop này.",
      words: ["I", "can't", "afford", "this", "laptop", ".", "have", "has"],
      answer: "I can't afford this laptop .",
    },
    {
      id: "wb2",
      prompt_vn: "Cho tôi xin hóa đơn được không?",
      words: ["Can", "I", "have", "a", "receipt", "please", "?", "has"],
      answer: "Can I have a receipt please ?",
    },
    {
      id: "wb3",
      prompt_vn: "Sản phẩm này tốt hơn sản phẩm kia.",
      words: ["This", "product", "is", "better", "than", "that", "one", ".", "have", "has"],
      answer: "This product is better than that one .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s15-1",
      prompt_vn: "Tôi không đủ tiền mua laptop này.",
      words: ["I", "can't", "afford", "this", "laptop", "."],
      answer: "I can't afford this laptop .",
    },
    {
      id: "s15-2",
      prompt_vn: "Cho tôi xin hóa đơn được không?",
      words: ["Can", "I", "have", "a", "receipt", "please", "?"],
      answer: "Can I have a receipt please ?",
    },
    {
      id: "s15-3",
      prompt_vn: "Sản phẩm này tốt hơn sản phẩm kia.",
      words: ["This", "product", "is", "better", "than", "that", "one", "."],
      answer: "This product is better than that one .",
    },
  ],


  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch: 'Chiếc laptop này đắt hơn chiếc kia nhưng chất lượng tốt hơn.'", options: ["This laptop is expensive than that but quality good.", "This laptop is more expensive than that but the quality is better.", "This laptop is expensiver than that but the quality is more good.", "This laptop more expensive than that one."], answer: "This laptop is more expensive than that but the quality is better.", explanation_vn: "Tính từ dài (expensive) → 'more expensive'. 'good' bất quy tắc → 'better'. Không dùng 'expensiver' hay 'more good'." },
    { id: "fq2", type: "cloze", question: "Điền: 'This is the ___ (cheap) option in the store.'", answer: "cheapest" },
    { id: "fq3", type: "multiple-choice", question: "Câu nào ĐÚNG ngữ pháp?", options: ["Is there a discount for students?", "Is there discounts for students?", "There is discount for students?", "Do there a discount for students?"], answer: "Is there a discount for students?", explanation_vn: "'Is there + danh từ số ít?' hoặc 'Are there + danh từ số nhiều?'. 'A discount' (số ít) → 'Is there a discount?'." },
    { id: "fq4", type: "translate", question: "Dịch sang tiếng Anh: 'Tôi không đủ tiền mua cái này. Nó quá đắt.'", answer: "I can't afford this. It's too expensive." },
    { id: "fq5", type: "multiple-choice", question: "So sánh bất quy tắc: 'bad' → ___ → ___", options: ["badder / baddest", "more bad / most bad", "worse / worst", "badly / worst"], answer: "worse / worst", explanation_vn: "So sánh bất quy tắc: bad → worse → worst. KHÔNG dùng 'more bad', 'most bad', hay 'badder'." },
    { id: "q-ex1", type: "multiple-choice", question: "So sánh hơn của 'expensive':", options: ["expensiver", "more expensive", "most expensive", "expensiveer"], answer: "more expensive", explanation_vn: "Tính từ dài (≥3 âm tiết) → 'more + adj'. 'Expensive' → 'more expensive'. KHÔNG thêm '-er' vào tính từ dài." },
    { id: "q-ex2", type: "multiple-choice", question: "Câu so sánh hơn đúng:", options: ["This is gooder.", "This is more good.", "This is better.", "This is more better."], answer: "This is better.", explanation_vn: "'good' bất quy tắc → 'better' (KHÔNG 'more good', 'gooder', 'more better'). Tương tự: bad→worse, far→farther." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'This shop is ___ than that one.' (cheap)", answer: "cheaper" },
    { id: "q-ex4", type: "multiple-choice", question: "'Prefer A to B' nghĩa là:", options: ["A bằng B", "Thích A hơn B", "Thích B hơn A", "Vừa thích A vừa B"], answer: "Thích A hơn B", explanation_vn: "'Prefer A to B' = thích A hơn B. Cấu trúc cố định: dùng 'to', KHÔNG dùng 'than' hay 'more than'." },
    { id: "q-ex5", type: "multiple-choice", question: "Câu so sánh đúng nhất:", options: ["I prefer coffee than tea.", "I prefer coffee to tea.", "I prefer coffee more than tea.", "I prefer coffee instead tea."], answer: "I prefer coffee to tea.", explanation_vn: "Cấu trúc chuẩn: 'I prefer A to B'. KHÔNG dùng 'prefer ... than' hay 'prefer ... more than'." },
    { id: "q-ex6", type: "multiple-choice", question: "'Can I exchange this for a larger size?' — giới từ:", options: ["for", "with", "to", "by"], answer: "for", explanation_vn: "'Exchange A for B' = đổi A lấy B. Luôn dùng giới từ 'for'. Ví dụ: 'exchange this shirt for a larger size'." },
    { id: "q-ex7", type: "translate", question: "Dịch: 'Chất lượng của cái này tốt hơn.'", answer: "The quality of this one is better." },
  ],


  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr15-1",
      question: "Chọn câu đúng về kế hoạch đã có sẵn: (Unit 14: Going to)",
      options: [
        "I will meet the client tomorrow (spontaneous)",
        "I am going to meet the client tomorrow (planned)",
        "Both are identical in meaning",
        "Neither is correct",
      ],
      answer: "I am going to meet the client tomorrow (planned)",
      type: "multiple-choice",
    },
    {
      id: "cr15-2",
      question: "Điền từ: 'She ___ present the results next Monday.' (Unit 14: Will)",
      options: [],
      answer: "will",
      type: "cloze",
    },
    {
      id: "cr15-3",
      question: "Anh ấy đã gặp khách hàng hôm qua. (Unit 13)",
      options: [],
      answer: "He met the client yesterday.",
      type: "translate",
    },
  ],



  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "comparative stress",
    description: "So sánh hơn: stress thay đổi trong more + adj vs tính từ + -er",
    examples: [
        { word: "cheaper", ipa: "/ˈtʃiːpər/", tip: "Stress âm 1: CHEAP-er — âm /-ər/ schwa, không nhấn" },
        { word: "more expensive", ipa: "/mɔːr ɪkˈspɛnsɪv/", tip: "Stress ở adjective: more EX-PEN-sive — more không nhấn mạnh" },
    ],
    minimalPairs: [
        ["cheap", "cheaper"],
        ["good", "better"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "cheaper", vn: "rẻ hơn" },
      { en: "more reliable", vn: "đáng tin hơn" },
      { en: "the best quality", vn: "chất lượng tốt nhất" },
      { en: "more convenient", vn: "tiện lợi hơn" },
      { en: "the cheapest option", vn: "lựa chọn rẻ nhất" },
      { en: "better value", vn: "giá trị tốt hơn" },
      { en: "the most popular", vn: "phổ biến nhất" },
      { en: "worse than expected", vn: "tệ hơn dự kiến" },
    ],
  },


  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit15-reading-1",
    title: "Choosing the Best Laptop",
    title_vn: "Chọn Chiếc Laptop Tốt Nhất",
    level: "A2" as const,
    text: `Lan wants to buy a new laptop. She visits an electronics shop and compares three different models. The first laptop is cheap but the quality is not very good. The second one is more expensive, but it has the best battery life in the shop. The third brand is the most popular and comes with a two-year warranty. Lan cannot afford the most expensive model, so she asks for a discount. The seller offers her 15% off the third laptop. Lan checks the receipt and sees the final price is very reasonable. In the end, she chooses the third laptop because it is better value and the quality is excellent.`,
    questions: [
      {
        id: "unit15-q1",
        question_vn: "Tại sao Lan không mua laptop đầu tiên?",
        options: [
          "It is too expensive for her.",
          "The quality is not very good.",
          "It does not have a warranty.",
          "The brand is not popular.",
        ],
        answer: "The quality is not very good.",
        explanation_vn: "'The first laptop is cheap but the quality is not very good' — chất lượng không tốt.",
      },
      {
        id: "unit15-q2",
        question_vn: "Laptop thứ ba có đặc điểm gì nổi bật?",
        options: [
          "It is the cheapest model in the shop.",
          "It has the longest warranty and is the most popular brand.",
          "It is the most expensive model.",
          "It has the best battery life.",
        ],
        answer: "It has the longest warranty and is the most popular brand.",
        explanation_vn: "'The third brand is the most popular and comes with a two-year warranty' — phổ biến nhất và có bảo hành hai năm.",
      },
      {
        id: "unit15-q3",
        question_vn: "Lan đã nhận được ưu đãi gì từ người bán?",
        options: [
          "She got a free receipt.",
          "She received a 15% discount.",
          "She got a full refund.",
          "She was offered a cheaper brand.",
        ],
        answer: "She received a 15% discount.",
        explanation_vn: "'The seller offers her 15% off the third laptop' — giảm 15% cho laptop thứ ba.",
      },
      {
        id: "unit15-q4",
        question_vn: "Tại sao Lan cuối cùng chọn laptop thứ ba?",
        options: [
          "Because it is the cheapest option.",
          "Because it is better value and the quality is excellent.",
          "Because she could not afford the others.",
          "Because it is the most expensive one.",
        ],
        answer: "Because it is better value and the quality is excellent.",
        explanation_vn: "'she chooses the third laptop because it is better value and the quality is excellent' — giá trị tốt hơn và chất lượng xuất sắc.",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "tXFhNibIBf4",

  // jobScenarios for world-class VN adult career content (TASK-153)
  jobScenarios: [
    { id: 1, title: "Choosing office equipment", focus: "comparisons at work", context: "procurement decision" },
  ],
};

export default unit15;
