import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-21 — Predictions & Trends  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit21: UnitData = {
  unitId: "unit-21",
  title: "Unit 21: Predictions & Trends",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description: "Học Future Continuous và Future Perfect để thảo luận xu hướng và dự báo như chuyên gia — 'By 2030, AI will have transformed most industries.'",
  badgeName: "Nhà Phân Tích",
  badgeEmoji: "📊",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Cuộc họp chiến lược quý 4. Giám đốc hỏi: 'Where do you see our company in 5 years?' Bạn cần dùng Future Continuous (will be doing) và Future Perfect (will have done) để thuyết trình xu hướng một cách chuyên nghiệp.",
  learningOutcomes: [
    "Dùng Future Continuous để mô tả hành động đang diễn ra tại một thời điểm tương lai",
    "Dùng Future Perfect để nói về điều sẽ hoàn thành trước một mốc thời gian tương lai",
    "Thảo luận xu hướng kinh doanh và công nghệ bằng tiếng Anh B1+",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong các cuộc họp quốc tế, <span class="text-emerald-400 font-semibold">Future Continuous</span> và <span class="text-emerald-400 font-semibold">Future Perfect</span> thể hiện bạn đang suy nghĩ có chiều sâu về tương lai. Thay vì nói đơn giản <span class="text-zinc-400">"We will grow"</span>, hãy nói <span class="text-emerald-400">"By next year, we will have expanded to three new markets."</span> — nghe chuyên nghiệp và tự tin hơn nhiều.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🔮", en: "By 2030, renewable energy will have replaced most fossil fuels.", vn: "Đến năm 2030, năng lượng tái tạo sẽ thay thế hầu hết nhiên liệu hóa thạch.", context: "Future Perfect — kết quả trước mốc thời gian" },
    { emoji: "💼", en: "This time next year, we will be operating in 10 countries.", vn: "Vào thời điểm này năm tới, chúng tôi sẽ đang hoạt động tại 10 quốc gia.", context: "Future Continuous — hành động đang diễn ra" },
    { emoji: "📈", en: "The market will continue to grow over the next decade.", vn: "Thị trường sẽ tiếp tục tăng trưởng trong thập kỷ tới.", context: "Future Simple — xu hướng chung" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "forecast", emoji: "🔮", phonetic: "/ˈfɔːkɑːst/", meaning: "dự báo", example: "The forecast shows a 15% growth next year.", example2: "Analysts forecast strong demand for tech products.", collocation: "economic forecast / sales forecast / weather forecast", audio: "/audio/unit-21/forecast.mp3" },
    { id: 2, word: "trend", emoji: "📈", phonetic: "/trend/", meaning: "xu hướng", example: "The trend towards remote work will continue.", example2: "We need to respond to emerging market trends.", collocation: "current trend / emerging trend / follow a trend", audio: "/audio/unit-21/trend.mp3", l1_interference_vn: "⚠️ Danh từ đếm được: \'a trend\', \'trends\'. \'To trend\' (viral) là informal — tránh trong văn viết." },
    { id: 3, word: "sustainable", emoji: "🌱", phonetic: "/səˈsteɪnəbəl/", meaning: "bền vững", example: "By 2030, our operations will be fully sustainable.", example2: "Sustainable energy is no longer optional for businesses.", collocation: "sustainable development / sustainable growth", audio: "/audio/unit-21/sustainable.mp3", l1_interference_vn: "⚠️ Thường trước danh từ: \'sustainable development/energy/growth\'." },
    { id: 4, word: "innovation", emoji: "💡", phonetic: "/ˌɪnəˈveɪʃən/", meaning: "đổi mới sáng tạo", example: "Innovation will be driving our growth for the next decade.", example2: "The company invests heavily in product innovation.", collocation: "drive innovation / technological innovation", audio: "/audio/unit-21/innovation.mp3" },
    { id: 5, word: "transform", emoji: "🔄", phonetic: "/trænsˈfɔːm/", meaning: "chuyển đổi / biến đổi", example: "AI will have transformed the industry by 2030.", example2: "Digital tools are transforming how we work.", collocation: "transform the industry / digital transformation", audio: "/audio/unit-21/transform.mp3", l1_interference_vn: "⚠️ \'Transform A INTO B\': \'transform the company into a leader\'. Giới từ \'into\'." },
    { id: 6, word: "expand", emoji: "🗺️", phonetic: "/ɪkˈspænd/", meaning: "mở rộng", example: "We will be expanding to Southeast Asia next year.", example2: "The company plans to expand its product range.", collocation: "expand into / expand rapidly / global expansion", audio: "/audio/unit-21/expand.mp3" },
    { id: 7, word: "revenue", emoji: "💰", phonetic: "/ˈrevənjuː/", meaning: "doanh thu", example: "By Q3, we will have reached our revenue target.", example2: "Revenue is expected to double within two years.", collocation: "annual revenue / revenue growth / generate revenue", audio: "/audio/unit-21/revenue.mp3", l1_interference_vn: "⚠️ Không đếm được: \'generate revenue\'. Phân biệt với \'profit\' (lợi nhuận sau chi phí)." },
    { id: 8, word: "sector", emoji: "🏭", phonetic: "/ˈsektər/", meaning: "lĩnh vực / ngành", example: "The technology sector will be leading growth in 2025.", example2: "She works in the financial sector.", collocation: "private sector / public sector / tech sector", audio: "/audio/unit-21/sector.mp3", l1_interference_vn: "⚠️ Đếm được: \'public/private sector\', \'the tech sector\'. Phân biệt với \'industry\' (ngành)." },
    { id: 9, word: "estimate", emoji: "📐", phonetic: "/ˈestɪmɪt/", meaning: "ước tính", example: "We estimate that costs will have fallen by 30% by then.", example2: "The estimate for completion is six months.", collocation: "rough estimate / cost estimate / according to estimates", audio: "/audio/unit-21/estimate.mp3" },
    { id: 10, word: "competition", emoji: "⚔️", phonetic: "/ˌkɒmpəˈtɪʃən/", meaning: "cạnh tranh", example: "Competition will be increasing as new players enter.", example2: "The competition in this market is fierce.", collocation: "fierce competition / face competition / competitive market", audio: "/audio/unit-21/competition.mp3", l1_interference_vn: "⚠️ Không đếm được (sự cạnh tranh) vs đếm được (a competition = cuộc thi)." },
    { id: 11, word: "projection", emoji: "📉", phonetic: "/prəˈdʒekʃən/", meaning: "dự đoán / chiếu", example: "Our projections show 20% growth over five years.", example2: "The financial projections are optimistic.", collocation: "sales projections / financial projections / growth projection", audio: "/audio/unit-21/projection.mp3" },
    { id: 12, word: "disrupt", emoji: "💥", phonetic: "/dɪsˈrʌpt/", meaning: "làm gián đoạn / phá vỡ", example: "New technologies will be disrupting traditional industries.", example2: "Startups are disrupting the banking sector.", collocation: "disrupt the market / disruptive technology", audio: "/audio/unit-21/disrupt.mp3", l1_interference_vn: "⚠️ + N trực tiếp: \'disrupt the market/meeting\'. \'Disruption\' (danh từ), \'disruptive\' (tính từ)." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Họp chiến lược 5 năm",
      audio: "/audio/unit-21/dialogue_1.mp3",
      desc: "Minh thuyết trình kế hoạch phát triển dài hạn.",
      lines: [
        { id: "d1-1", speaker: "Director", text: "Minh, what does our five-year roadmap look like?", translation: "Minh, lộ trình 5 năm của chúng ta trông như thế nào?" },
        { id: "d1-2", speaker: "Minh", text: "By the end of next year, we will have expanded into three new markets. This time in two years, we will be operating across Southeast Asia.", translation: "Đến cuối năm tới, chúng ta sẽ mở rộng vào ba thị trường mới. Vào thời điểm này hai năm nữa, chúng ta sẽ đang hoạt động trên toàn Đông Nam Á." },
        { id: "d1-3", speaker: "Director", text: "And what about revenue projections?", translation: "Còn dự báo doanh thu thì sao?" },
        { id: "d1-4", speaker: "Minh", text: "Our estimates show that by 2028, revenue will have doubled. The technology sector will be driving most of that growth.", translation: "Ước tính của chúng ta cho thấy đến năm 2028, doanh thu sẽ tăng gấp đôi. Lĩnh vực công nghệ sẽ là động lực chính của sự tăng trưởng đó." },
        { id: "d1-5", speaker: "Director", text: "How will we deal with increasing competition?", translation: "Chúng ta sẽ xử lý vấn đề cạnh tranh ngày càng tăng như thế nào?" },
        { id: "d1-6", speaker: "Minh", text: "We will be investing heavily in innovation. By 2027, our R&D team will have developed several disruptive products that will set us apart.", translation: "Chúng ta sẽ đầu tư mạnh vào đổi mới sáng tạo. Đến năm 2027, nhóm R&D của chúng ta sẽ phát triển được một số sản phẩm đột phá giúp chúng ta nổi bật." },
      ],
    },
    {
      id: 2,
      title: "Xu hướng công nghệ",
      audio: "/audio/unit-21/dialogue_2.mp3",
      desc: "Lan và Tom thảo luận về tác động của AI đến công việc.",
      lines: [
        { id: "d2-1", speaker: "Tom", text: "Do you think AI will replace our jobs?", translation: "Bạn có nghĩ AI sẽ thay thế công việc của chúng ta không?" },
        { id: "d2-2", speaker: "Lan", text: "Some routine tasks, yes. By 2030, AI will have automated most repetitive work. But creative and strategic roles will still need humans.", translation: "Một số công việc thường ngày thì có. Đến năm 2030, AI sẽ tự động hóa hầu hết công việc lặp lại. Nhưng các vai trò sáng tạo và chiến lược vẫn cần con người." },
        { id: "d2-3", speaker: "Tom", text: "That's reassuring. So what skills will be in demand?", translation: "Điều đó thật yên tâm. Vậy những kỹ năng nào sẽ được cần?" },
        { id: "d2-4", speaker: "Lan", text: "Critical thinking and communication. Ten years from now, people who can work WITH AI will be earning the most.", translation: "Tư duy phản biện và giao tiếp. Mười năm nữa, những người có thể làm việc VỚI AI sẽ kiếm được nhiều nhất." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "By next year we will have expanded into three new markets", options: ["By next year we will expand into three new markets", "By next year we will have expanded into three new markets", "By next year we expanded into three new markets", "By next year we have expanded into three new markets"], answer: "By next year we will have expanded into three new markets" },
    { id: "lac2", audio_text: "This time next year we will be operating across Southeast Asia", options: ["This time next year we will operate across Southeast Asia", "This time next year we will be operating across Southeast Asia", "This time next year we are operating across Southeast Asia", "This time next year we operated across Southeast Asia"], answer: "This time next year we will be operating across Southeast Asia" },
    { id: "lac3", audio_text: "Revenue will have doubled by 2028", options: ["Revenue will double by 2028", "Revenue will be doubling by 2028", "Revenue will have doubled by 2028", "Revenue doubled by 2028"], answer: "Revenue will have doubled by 2028" },
    { id: "lac4", audio_text: "The technology sector will be driving most of the growth", options: ["The technology sector will drive most of the growth", "The technology sector will be driving most of the growth", "The technology sector drives most of the growth", "The technology sector has been driving most of the growth"], answer: "The technology sector will be driving most of the growth" },
    { id: "lac5", audio_text: "By 2030 AI will have automated most repetitive work", options: ["By 2030 AI will automate most repetitive work", "By 2030 AI will have automated most repetitive work", "By 2030 AI automated most repetitive work", "By 2030 AI has automated most repetitive work"], answer: "By 2030 AI will have automated most repetitive work" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "By {input}, our company will have {input}. This time next year, we will be {input}.",
    level1Placeholder: "Ví dụ: 2027 — expanded to 5 markets — growing rapidly...",
    level2Situation: "Thuyết trình chiến lược 5 năm cho ban lãnh đạo. Dùng Future Continuous và Future Perfect để mô tả: (1) Chúng ta sẽ đang làm gì tại các mốc thời gian cụ thể? (2) Chúng ta sẽ đạt được gì trước các mốc đó? (3) Xu hướng nào sẽ tác động đến ngành?",
    level2Hint: "By [year], we will have [achievement]. This time in [period], we will be [ongoing action]. The [sector/trend] will be [driving/transforming/disrupting] [area]. Our projections show that [prediction].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Future Continuous & Future Perfect",
    rule: "Future Continuous: will be + V-ing\n→ Hành động đang diễn ra tại một thời điểm tương lai\n→ 'This time next year, I will be working in Singapore.'\n\nFuture Perfect: will have + past participle\n→ Hành động sẽ hoàn thành TRƯỚC một mốc thời gian tương lai\n→ 'By 2030, we will have reached 1 million users.'\n\nDấu hiệu nhận biết:\n→ 'This time next [week/month/year]...' → Future Continuous\n→ 'By [year/date/time]...' → Future Perfect",
    examples: [
      { en: "This time next year, we will be expanding into Asian markets. (đang diễn ra tại thời điểm đó)", vn: "Vào thời điểm này năm tới, chúng tôi sẽ đang mở rộng vào thị trường châu Á." },
      { en: "By 2028, revenue will have doubled. (hoàn thành trước năm 2028)", vn: "Đến năm 2028, doanh thu sẽ tăng gấp đôi." },
      { en: "We will be investing in innovation throughout the decade. (kéo dài suốt thập kỷ)", vn: "Chúng tôi sẽ đầu tư vào đổi mới sáng tạo suốt thập kỷ." },
    ],
    tip: "Ghi nhớ: 'By' + thời gian → Future Perfect (will have done). 'This time + thời gian' → Future Continuous (will be doing). Đây là hai cấu trúc chuyên nghiệp nhất khi nói về kế hoạch tương lai dài hạn.",
    vnNote: "⚠️ Lưu ý người Việt: Tiếng Việt dùng 'sẽ' cho tất cả thì tương lai. Trong tiếng Anh, cần phân biệt: will do (đơn giản), will be doing (đang diễn ra), will have done (hoàn thành trước). Dùng đúng → nghe B1+, chuyên nghiệp.",
    dialogueExample: {
      speaker: "Minh",
      text: "By the end of next year, we will have expanded into three new markets. This time in two years, we will be operating across Southeast Asia.",
      translation: "Đến cuối năm tới, chúng ta sẽ mở rộng vào ba thị trường mới. Vào thời điểm này hai năm nữa, chúng ta sẽ đang hoạt động trên toàn Đông Nam Á.",
      highlight: "will have expanded (Future Perfect — trước mốc) | will be operating (Future Continuous — đang diễn ra)",
    },
    ccq: {
      question: "Câu nào dùng Future Perfect ĐÚNG?",
      options: [
        "By 2030, we will expand to 20 countries.",
        "By 2030, we will have expanded to 20 countries.",
        "By 2030, we will be expanding to 20 countries.",
        "By 2030, we expanded to 20 countries.",
      ],
      answer: "By 2030, we will have expanded to 20 countries.",
      explanation: "'By 2030' + Future Perfect (will have expanded) = hành động sẽ hoàn thành TRƯỚC năm 2030. Đây là cấu trúc chuẩn B1+ cho dự báo và kế hoạch dài hạn.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng: 'This time next month, I ___ for the new client in Tokyo.'", options: ["work", "will work", "will be working", "will have worked"], answer: "will be working" },
    { id: "pq2", type: "multiple-choice", question: "Chọn đúng: 'By the end of Q3, we ___ our sales target.'", options: ["reach", "will reach", "will be reaching", "will have reached"], answer: "will have reached" },
    { id: "pq3", type: "cloze", question: "Điền: 'This time next year, the team ___ (work) on Phase 2 of the project.'", answer: "will be working" },
    { id: "pq4", type: "cloze", question: "Điền: 'By 2030, renewable energy ___ (replace) most fossil fuels.'", answer: "will have replaced" },
    { id: "pq5", type: "multiple-choice", question: "Câu nào nói về xu hướng đang diễn ra tại một thời điểm tương lai?", options: ["Next year, AI will transform the industry.", "By next year, AI will have transformed the industry.", "This time next year, AI will be transforming the industry.", "Next year, AI transformed the industry."], answer: "This time next year, AI will be transforming the industry." },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "forecast", right: "dự báo" },
      { left: "sustainable", right: "bền vững" },
      { left: "disrupt", right: "phá vỡ" },
      { left: "revenue", right: "doanh thu" },
      { left: "projection", right: "dự đoán" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Đến cuối năm tới, chúng tôi sẽ mở rộng sang 5 thị trường.",
      answer: "By the end of next year, we will have expanded to 5 markets.",
    },
    {
      id: "pt-2",
      prompt_vn: "Vào lúc này tuần sau, đội sẽ trình bày dự báo.",
      answer: "At this time next week, the team will be presenting the forecast.",
    },
    {
      id: "pt-3",
      prompt_vn: "Xu hướng bền vững sẽ thay đổi ngành công nghiệp.",
      answer: "Sustainable trends will be transforming the industry.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc21-1",
      sentence: "By next year, I will finished my degree.",
      errorWord: "will finished",
      correction: "will have finished",
      explanation_vn: "Future Perfect: 'will HAVE + past participle'. Diễn tả việc hoàn thành trước mốc tương lai.",
    },
    {
      id: "sc21-2",
      sentence: "In the future, people will flying cars.",
      errorWord: "will flying",
      correction: "will fly",
      explanation_vn: "'Will + bare infinitive': 'will FLY'. Không dùng V-ing trực tiếp sau 'will'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la21-1",
      audio_text: "By next year I will have finished my degree.",
      prompt_vn: "Đến năm sau tôi sẽ hoàn thành bằng cấp.",
      words: ["By", "next", "year", "I", "will", "have", "finished", "my", "degree", ".", "finish", "had"],
      answer: "By next year I will have finished my degree .",
    },
    {
      id: "la21-2",
      audio_text: "In the future people will use electric cars.",
      prompt_vn: "Trong tương lai mọi người sẽ dùng xe điện.",
      words: ["In", "the", "future", "people", "will", "use", "electric", "cars", ".", "using", "drives"],
      answer: "In the future people will use electric cars .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Đến năm 2028, doanh thu sẽ tăng gấp đôi.",
      words: ["By", "2028", ",", "revenue", "will", "have", "doubled", ".", "would", "could"],
      answer: "By 2028 , revenue will have doubled .",
    },
    {
      id: "wb2",
      prompt_vn: "Vào thời điểm này năm tới, chúng tôi sẽ đang hoạt động ở châu Á.",
      words: ["This", "time", "next", "year", ",", "we", "will", "be", "operating", "in", "Asia", ".", "would", "could"],
      answer: "This time next year , we will be operating in Asia .",
    },
    {
      id: "wb3",
      prompt_vn: "AI sẽ chuyển đổi hầu hết các ngành vào năm 2030.",
      words: ["By", "2030", ",", "AI", "will", "have", "transformed", "most", "industries", ".", "would", "could"],
      answer: "By 2030 , AI will have transformed most industries .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s21-1", prompt_vn: "Đến năm 2028, doanh thu sẽ tăng gấp đôi.", words: ["By", "2028", ",", "revenue", "will", "have", "doubled", "."], answer: "By 2028 , revenue will have doubled ." },
    { id: "s21-2", prompt_vn: "Vào thời điểm này năm tới, chúng tôi sẽ đang hoạt động ở châu Á.", words: ["This", "time", "next", "year", ",", "we", "will", "be", "operating", "in", "Asia", "."], answer: "This time next year , we will be operating in Asia ." },
    { id: "s21-3", prompt_vn: "AI sẽ chuyển đổi hầu hết các ngành vào năm 2030.", words: ["By", "2030", ",", "AI", "will", "have", "transformed", "most", "industries", "."], answer: "By 2030 , AI will have transformed most industries ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch: 'Đến cuối năm tới, chúng tôi sẽ mở rộng sang 5 thị trường.'", options: ["By the end of next year, we will expand to 5 markets.", "By the end of next year, we will have expanded to 5 markets.", "By the end of next year, we will be expanding to 5 markets.", "By the end of next year, we expanded to 5 markets."], answer: "By the end of next year, we will have expanded to 5 markets." },
    { id: "fq2", type: "cloze", question: "Điền: 'This time next decade, most companies ___ (use) AI for daily operations.'", answer: "will be using" },
    { id: "fq3", type: "multiple-choice", question: "Chọn câu phân tích xu hướng chuyên nghiệp nhất:", options: ["Technology will change everything.", "Technology will be disrupting traditional sectors throughout the decade.", "Technology changes everything soon.", "Technology changed the industry."], answer: "Technology will be disrupting traditional sectors throughout the decade." },
    { id: "fq4", type: "translate", question: "Dịch: 'Đến năm 2027, nhóm R&D của chúng tôi sẽ phát triển được các sản phẩm đột phá.'", answer: "By 2027, our R&D team will have developed several disruptive products." },
    { id: "fq5", type: "multiple-choice", question: "Phân biệt: Câu nào nói về hành động hoàn thành TRƯỚC một mốc?", options: ["We will be launching the product next year.", "We will launch the product next year.", "By next year, we will have launched the product.", "Next year, we are launching the product."], answer: "By next year, we will have launched the product." },
    { id: "q-ex1", type: "multiple-choice", question: "'Might' thể hiện mức độ chắc chắn:", options: ["100% chắc chắn", "90% chắc chắn", "50% không chắc", "0% không thể"], answer: "50% không chắc" },
    { id: "q-ex2", type: "multiple-choice", question: "Câu dự đoán đúng:", options: ["It might rains tomorrow.", "It might rain tomorrow.", "It mights rain tomorrow.", "It might to rain tomorrow."], answer: "It might rain tomorrow." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'Technology ___ change our lives.' (chắc chắn)", answer: "will" },
    { id: "q-ex4", type: "multiple-choice", question: "'In the long run' nghĩa là:", options: ["Trong thời gian ngắn", "Về lâu dài", "Ngay bây giờ", "Trong cuộc đua"], answer: "Về lâu dài" },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Tôi có thể sẽ đến trễ.'", answer: "I might be late." },
    { id: "q-ex6", type: "multiple-choice", question: "Câu nào thể hiện dự đoán CÓ BẰNG CHỨNG?", options: ["She might win.", "She will probably win.", "Look — it's going to rain.", "It may rain later."], answer: "Look — it's going to rain." },
    { id: "q-ex7", type: "multiple-choice", question: "'Trend' nghĩa là:", options: ["Tình trạng khẩn cấp", "Xu hướng", "Báo cáo", "Quyết định"], answer: "Xu hướng" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr21-1", question: "Ôn tập Unit 20 — Chọn Past Perfect đúng: 'By the time we arrived, they ___ the deal.'", options: ["signed", "had signed", "have signed", "were signing"], answer: "had signed", type: "multiple-choice" },
    { id: "cr21-2", question: "Ôn tập Unit 19 — Điền: 'She ___ (present) when the projector ___ (stop) working.'", options: [], answer: "was presenting / stopped", type: "cloze" },
    { id: "cr21-3", question: "Ôn tập A2 — Câu nào dùng going to ĐÚNG cho kế hoạch đã lên sẵn?", options: ["I will travel to Paris next month.", "I'm going to travel to Paris next month — I have the tickets.", "I travel to Paris next month.", "I was going to travel to Paris."], answer: "I'm going to travel to Paris next month — I have the tickets.", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "might /maɪt/ tone",
    description: "Modal verbs nhẹ: might, could, would — hay bị đọc quá nặng",
    examples: [
        { word: "might", ipa: "/maɪt/", tip: "Đọc nhẹ trong câu — không nhấn mạnh: It might rain /ɪt maɪt reɪn/" },
        { word: "predict", ipa: "/prɪˈdɪkt/", tip: "Stress âm 2: pre-DICT — âm cuối /t/ đừng bỏ" },
    ],
    minimalPairs: [
        ["might /maɪt/", "must /mʌst/ (chắc hơn)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "By next year, we will have reached our target", vn: "Đến năm tới, chúng tôi sẽ đạt được mục tiêu" },
      { en: "This time next month, I will be working in Tokyo", vn: "Thời điểm này tháng tới, tôi sẽ đang làm việc ở Tokyo" },
      { en: "By 2030, AI will have transformed most industries", vn: "Đến năm 2030, AI sẽ chuyển đổi hầu hết các ngành" },
      { en: "We will be expanding into Asia throughout next year", vn: "Chúng tôi sẽ mở rộng vào châu Á suốt năm tới" },
      { en: "Will you have finished the report by Friday?", vn: "Bạn sẽ hoàn thành báo cáo trước thứ Sáu chưa?" },
      { en: "The market will be growing rapidly in the coming years", vn: "Thị trường sẽ tăng trưởng nhanh trong những năm tới" },
      { en: "By the deadline, we will have tested all features", vn: "Trước hạn chót, chúng tôi sẽ kiểm tra xong tất cả các tính năng" },
      { en: "This time next year, the team will be working on phase two", vn: "Thời điểm này năm tới, nhóm sẽ đang làm giai đoạn hai" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit21-reading-1",
    title: "The Future of Work",
    title_vn: "Đọc đoạn về tương lai của công việc",
    level: "B1" as const,
    text:
      "The workplace is changing rapidly. By 2030, analysts forecast that artificial intelligence " +
      "will have transformed most office jobs. " +
      "Many routine tasks that humans do today will be automated. " +
      "However, experts also predict that new types of jobs will emerge. " +
      "Skills such as creativity, leadership, and emotional intelligence will become more valuable. " +
      "The tech sector will be leading this transformation throughout the decade. " +
      "By 2028, revenue from AI-driven products is estimated to double globally. " +
      "In Vietnam, the trend towards digital transformation is already visible. " +
      "Companies that invest in innovation now will be competing successfully in the future. " +
      "Workers who adapt to new technologies will have the best career prospects.",
    questions: [
      {
        id: "u21r-q1",
        question_vn: "Theo các nhà phân tích, AI sẽ làm gì vào năm 2030?",
        options: [
          "Replace all human workers",
          "Transform most office jobs",
          "Create fewer jobs",
          "Slow down economic growth",
        ],
        answer: "Transform most office jobs",
        explanation_vn: "'analysts forecast that artificial intelligence will have transformed most office jobs.'",
      },
      {
        id: "u21r-q2",
        question_vn: "Những kỹ năng nào sẽ trở nên có giá trị hơn?",
        options: [
          "Data entry and typing",
          "Creativity, leadership, and emotional intelligence",
          "Manual and physical skills",
          "Accounting and bookkeeping",
        ],
        answer: "Creativity, leadership, and emotional intelligence",
        explanation_vn: "'Skills such as creativity, leadership, and emotional intelligence will become more valuable.'",
      },
      {
        id: "u21r-q3",
        question_vn: "Doanh thu từ sản phẩm AI được ước tính sẽ thay đổi như thế nào vào năm 2028?",
        options: [
          "Increase by 50%",
          "Stay the same",
          "Double globally",
          "Decrease significantly",
        ],
        answer: "Double globally",
        explanation_vn: "'revenue from AI-driven products is estimated to double globally.'",
      },
      {
        id: "u21r-q4",
        question_vn: "Theo đoạn văn, ai sẽ có triển vọng nghề nghiệp tốt nhất?",
        options: [
          "Workers who avoid technology",
          "Workers who adapt to new technologies",
          "Workers in traditional industries",
          "Workers who retire early",
        ],
        answer: "Workers who adapt to new technologies",
        explanation_vn: "'Workers who adapt to new technologies will have the best career prospects.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Thuyết trình tầm nhìn 5 năm của công ty trong họp chiến lược",
      focus: "Future Continuous / Future Perfect: will be doing, will have done (predictions & trends)",
      context: "Q4 strategy meeting với giám đốc và team quốc tế",
      l1Note: "⚠️ 'Where do you see our company in 5 years?' → 'By 2030 we will have expanded to 3 new markets. We will be using AI daily.'",
      example: "In five years we will have launched three new products. Customers will be using our app everywhere."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "hfgFm3sSJxM",
};

export default unit21;
