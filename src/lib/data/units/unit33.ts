import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-33 — Imagining & Hypothesizing  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit33: UnitData = {
  unitId: "unit-33",
  title: "Unit 33: Imagining & Hypothesizing",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Second Conditional — Giả định các tình huống không có thật ở hiện tại hoặc tương lai. Thường xuyên được hỏi trong phỏng vấn tuyển dụng và đàm phán thương lượng.",
  badgeName: "Nhà Hoạch Định",
  badgeEmoji: "🔮",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Phỏng vấn xin việc vị trí Quản lý Dự án. Người phỏng vấn đặt câu hỏi giả định: 'What would you do if a key team member resigned in the middle of a project?' Bạn cần dùng câu điều kiện loại 2 (Second Conditional) để trả lời một cách tự tin và chuyên nghiệp.",
  learningOutcomes: [
    "Sử dụng câu điều kiện loại 2 (Second Conditional) để giả định tình huống",
    "Thảo luận về các rủi ro, kết quả giả định và đưa ra giải pháp trong công việc",
    "Sử dụng từ vựng về quản lý rủi ro và đánh giá dự án ở cấp độ B2",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong phỏng vấn hành vi (Behavioral Interview) của các tập đoàn đa quốc gia, câu hỏi giả định bắt đầu bằng <span class="text-emerald-400">"What would you do if..."</span> rất phổ biến. Bạn nên trả lời bằng <span class="text-emerald-400">"If that happened, I would..."</span> thay vì dùng <span class="text-zinc-400">"will"</span> để thể hiện tư duy phân tích sắc bén và khả năng xử lý tình huống giả định chuyên nghiệp.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "💼", en: "If I were you, I would invest in that new venture.", vn: "Nếu tôi là bạn, tôi sẽ đầu tư vào dự án mạo hiểm mới đó.", context: "If I were you, I would — lời khuyên giả định" },
    { emoji: "🔮", en: "Imagine what the outcome would be if we failed.", vn: "Hãy tưởng tượng kết quả sẽ thế nào nếu chúng ta thất bại.", context: "imagine ... if we failed — giả định tương lai" },
    { emoji: "📈", en: "We would expand our business if we had more resources.", vn: "Chúng tôi sẽ mở rộng kinh doanh nếu có nhiều tài nguyên hơn.", context: "would expand if we had — giả định hiện tại" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "hypothetical", emoji: "💭", phonetic: "/ˌhaɪpəˈθetɪkəl/", meaning: "mang tính giả định / giả thuyết", example: "Let's look at a hypothetical situation to understand this rule.", example2: "This is a purely hypothetical question.", collocation: "hypothetical situation / hypothetical question / purely hypothetical", audio: "/audio/unit-33/hypothetical.mp3", l1_interference_vn: "⚠️ VN hay nhầm 'hypothetical' với thì hiện tại. Trong second conditional: 'If + past simple (were), ... would'. KHÔNG dùng will." },
    { id: 2, word: "scenario", emoji: "🎬", phonetic: "/sɪˈnɑːriəʊ/", meaning: "kịch bản / tình huống có thể xảy ra", example: "We must prepare for the worst-case scenario.", example2: "In this scenario, we would lose half of our users.", collocation: "worst-case scenario / likely scenario / best-case scenario", audio: "/audio/unit-33/scenario.mp3", l1_interference_vn: "⚠️ 'In this scenario, we would...' (giả định). VN hay dùng 'will' vì nghĩ 'có thể xảy ra'. Second cond luôn lùi thì + would." },
    { id: 3, word: "assume", emoji: "🤔", phonetic: "/əˈsjuːm/", meaning: "giả định / tự cho là", example: "If we assume that the market is stable, this plan will work.", example2: "Do not assume that everyone agrees with you.", collocation: "assume responsibility / assume that / let's assume", audio: "/audio/unit-33/assume.mp3", l1_interference_vn: "⚠️ 'Assume' + that clause trong giả định hay bị VN thêm 'will': đúng là 'If we assume..., we would...'. Lùi thì sau If." },
    { id: 4, word: "imagine", emoji: "🎨", phonetic: "/ɪˈmædʒɪn/", meaning: "tưởng tượng", example: "Imagine what you would do if you won the lottery.", example2: "I can't imagine living in a cold country.", collocation: "imagine that / hard to imagine / imagine doing", audio: "/audio/unit-33/imagine.mp3", l1_interference_vn: "⚠️ 'Imagine if...' dùng để dẫn second conditional. VN hay 'Imagine you win' (sai thì). Phải: 'if you won' (past)." },
    { id: 5, word: "venture", emoji: "🚀", phonetic: "/ˈventʃər/", meaning: "dự án kinh doanh mạo hiểm / đầu tư mạo hiểm", example: "Their new business venture proved to be highly profitable.", example2: "They are seeking funding for a joint venture.", collocation: "business venture / joint venture / venture capital", audio: "/audio/unit-33/venture.mp3", l1_interference_vn: "⚠️ 'Venture' (dự án mạo hiểm) hay nhầm với 'adventure'. Collocation đúng: 'business venture', không 'business adventure'." },
    { id: 6, word: "invest", emoji: "💰", phonetic: "/ɪnˈvest/", meaning: "đầu tư", example: "If we had capital, we would invest in artificial intelligence.", example2: "The company invested heavily in research.", collocation: "invest in / invest money / invest time", audio: "/audio/unit-33/invest.mp3", l1_interference_vn: "⚠️ Đừng dịch 'invest' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 7, word: "expansion", emoji: "📈", phonetic: "/ɪkˈspænʃən/", meaning: "sự mở rộng / phát triển", example: "The corporate expansion created hundreds of new jobs.", example2: "We are planning our international expansion next year.", collocation: "business expansion / rapid expansion / global expansion", audio: "/audio/unit-33/expansion.mp3", l1_interference_vn: "⚠️ 'Expansion' (sự mở rộng) — VN hay bỏ mạo từ 'the' trước danh từ trừu tượng: 'the expansion' khi nói cụ thể. 'Corporate expansion' cần article khi chỉ cái đã biết." },
    { id: 8, word: "outcome", emoji: "🎯", phonetic: "/ˈaʊtkʌm/", meaning: "kết quả / đầu ra", example: "What is the expected outcome of the negotiation?", example2: "We are very pleased with the final outcome.", collocation: "expected outcome / final outcome / positive outcome", audio: "/audio/unit-33/outcome.mp3", l1_interference_vn: "⚠️ 'Outcome of' đúng collocation. VN hay 'result from' hoặc 'consequence from' — dùng 'of' cho outcome/result trong ngữ cảnh dự án." },
    { id: 9, word: "risk", emoji: "⚡", phonetic: "/rɪsk/", meaning: "rủi ro", example: "Starting a new venture always involves a high level of risk.", example2: "If we took that risk, we might lose our investment.", collocation: "take a risk / reduce risk / risk assessment", audio: "/audio/unit-33/risk.mp3", l1_interference_vn: "⚠️ 'Take a risk' (nhận rủi ro). VN hay 'do risk' hoặc 'risky something'. Collocation chuẩn: take/run a risk; assess risk." },
    { id: 10, word: "criteria", emoji: "📋", phonetic: "/kraɪˈtɪəriə/", meaning: "tiêu chí (số nhiều của criterion)", example: "What are the criteria for selecting the candidate?", example2: "The project met all the evaluation criteria.", collocation: "selection criteria / evaluation criteria / meet the criteria", audio: "/audio/unit-33/criteria.mp3", l1_interference_vn: "⚠️ 'Criteria' là số nhiều (criterion số ít). VN hay dùng 'criteria' như số ít hoặc quên 'the' : 'meet the criteria' (cần 'the' khi chỉ định)." },
    { id: 11, word: "assess", emoji: "🔍", phonetic: "/əˈses/", meaning: "đánh giá / định giá", example: "We need to assess the risks before making a decision.", example2: "The teacher will assess the students' speaking skills.", collocation: "assess risks / assess performance / assess the situation", audio: "/audio/unit-33/assess.mp3", l1_interference_vn: "⚠️ 'Assess the risks' — VN hay 'evaluate risk' đơn. Formal B2: 'assess' + plural cho nhiều rủi ro; dùng 'the' khi đã đề cập." },
    { id: 12, word: "resources", emoji: "💎", phonetic: "/rɪˈzɔːsɪz/", meaning: "tài nguyên / nguồn lực", example: "Human resources are the most valuable asset of a company.", example2: "We don't have enough resources to start the expansion.", collocation: "natural resources / human resources / lack of resources", audio: "/audio/unit-33/resources.mp3" },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Câu hỏi giả định trong phỏng vấn tuyển dụng",
      audio: "/audio/unit-33/dialogue_1.mp3",
      desc: "Lâm trả lời câu hỏi xử lý tình huống giả định của người phỏng vấn.",
      lines: [
        { id: "d1-1", speaker: "Interviewer", text: "Lâm, what would you do if a key team member resigned in the middle of a project?", translation: "Lâm, bạn sẽ làm gì nếu một thành viên chủ chốt trong nhóm nghỉ việc giữa chừng dự án?" },
        { id: "d1-2", speaker: "Lam", text: "If that hypothetical scenario happened, I would first assess the impact on the timeline. Then, I would distribute the tasks to other members.", translation: "Nếu tình huống giả định đó xảy ra, trước tiên tôi sẽ đánh giá tác động lên tiến độ. Sau đó, tôi sẽ phân bổ nhiệm vụ cho các thành viên khác." },
        { id: "d1-3", speaker: "Interviewer", text: "What if the remaining members were already overloaded with work?", translation: "Nếu các thành viên còn lại đã bị quá tải công việc thì sao?" },
        { id: "d1-4", speaker: "Lam", text: "If we had no choice, I would request temporary resources from other teams, or hire a freelancer. I assume we would have some emergency budget.", translation: "Nếu không có lựa chọn nào khác, tôi sẽ yêu cầu nguồn lực tạm thời từ các nhóm khác, hoặc thuê freelancer. Tôi giả định chúng ta sẽ có một số ngân sách khẩn cấp." },
        { id: "d1-5", speaker: "Interviewer", text: "Excellent answer. It shows you know how to manage risks.", translation: "Câu trả lời xuất sắc. Nó cho thấy bạn biết cách quản trị rủi ro." },
      ],
    },
    {
      id: 2,
      title: "Thảo luận về dự án mạo hiểm mới",
      audio: "/audio/unit-33/dialogue_2.mp3",
      desc: "Huy và Sarah thảo luận về kế hoạch đầu tư và mở rộng kinh doanh.",
      lines: [
        { id: "d2-1", speaker: "Huy", text: "If we invested all our capital in this new venture, the potential outcome would be huge.", translation: "Nếu chúng ta đầu tư toàn bộ vốn vào dự án mạo hiểm mới này, kết quả tiềm năng sẽ rất lớn." },
        { id: "d2-2", speaker: "Sarah", text: "True, but the risk is also very high. Imagine if the product failed to meet the selection criteria of corporate clients.", translation: "Đúng thế, nhưng rủi ro cũng rất cao. Hãy tưởng tượng nếu sản phẩm không đáp ứng được tiêu chí lựa chọn của khách hàng doanh nghiệp." },
        { id: "d2-3", speaker: "Huy", text: "If that occurred, we would need to redesign our expansion strategy completely. But I think it's a risk worth taking.", translation: "Nếu điều đó xảy ra, chúng ta sẽ cần thiết kế lại hoàn toàn chiến lược mở rộng của mình. Nhưng tôi nghĩ đó là rủi ro đáng chấp nhận." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "If I were you, I would invest in that new venture.", options: ["If I am you, I will invest in that new venture.", "If I were you, I would invest in that new venture.", "If I were you, I will invest in that new venture.", "If I was you, I invest in that new venture."], answer: "If I were you, I would invest in that new venture." },
    { id: "lac2", audio_text: "We would expand our business if we had more resources.", options: ["We will expand our business if we have more resources.", "We would expand our business if we had more resources.", "We would expand our business if we have more resources.", "We expanded our business because we had more resources."], answer: "We would expand our business if we had more resources." },
    { id: "lac3", audio_text: "Starting a new venture always involves a high level of risk.", options: ["Starting a new venture always involves a high level of risk.", "Starting a new venture never has any risks.", "The expected outcome of the venture is very small.", "We must assess the criteria before starting the venture."], answer: "Starting a new venture always involves a high level of risk." },
    { id: "lac4", audio_text: "What would you do if a key member resigned?", options: ["What will you do if a key member resigns?", "What did you do when a key member resigned?", "What would you do if a key member resigned?", "What would you do if a key member resigns?"], answer: "What would you do if a key member resigned?" },
    { id: "lac5", audio_text: "We need to assess the risks before making a decision.", options: ["We should ignore the risks before making a decision.", "We need to assess the risks before making a decision.", "We assessed the risks after the decision was made.", "It is easy to predict the outcome of the risk."], answer: "We need to assess the risks before making a decision." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "If we had more {input}, we would {input} in this new {input}.",
    level1Placeholder: "Ví dụ: resources — invest — venture...",
    level2Situation: "Bạn đang tham gia buổi phỏng vấn xin việc và được hỏi câu hỏi tình huống: 'Bạn sẽ làm gì nếu ngân sách dự án bị cắt giảm 30%?'. Hãy: (1) Nói rằng đó là một tình huống giả định khó khăn, (2) Đưa ra phương án cắt giảm chi phí không thiết yếu, (3) Nhấn mạnh tầm quan trọng của nguồn nhân lực.",
    level2Hint: "If that hypothetical scenario happened, I would first assess the project budget to reduce non-essential costs. If we cut down on advertising, we would save some budget. However, I would protect our human resources because they are our most valuable asset.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Second Conditional — Câu Điều Kiện Loại 2 (Giả Định Hiện Tại)",
    rule: "Câu điều kiện loại 2 dùng để diễn tả các tình huống giả định, không có thật, hoặc trái với thực tế ở hiện tại hoặc tương lai.\n\nCấu trúc:\nIf + S + Past Simple (động từ chia ở quá khứ đơn), S + would / could / might + Verb-infinitive (động từ nguyên thể)\n\nLưu ý: Với động từ 'To be', ta dùng 'WERE' cho tất cả các ngôi (I/he/she/it/we/they) trong văn phong trang trọng.\n   → 'If I were the manager, I would change the policy.'",
    examples: [
      { en: "If we had more resources, we would start the expansion. (In reality, we don't have enough resources)", vn: "Nếu chúng tôi có nhiều nguồn lực hơn, chúng tôi đã bắt đầu mở rộng." },
      { en: "What would you do if you lost your job? (Hypothetical question)", vn: "Bạn sẽ làm gì nếu bạn bị mất việc?" },
      { en: "If she were here, she could help us assess the risks. (She is not here now)", vn: "Nếu cô ấy ở đây, cô ấy đã có thể giúp chúng ta đánh giá các rủi ro." },
    ],
    tip: "Trong giao tiếp trang trọng hoặc các bài luận B2, hãy dùng 'were' thay vì 'was' cho các chủ ngữ ngôi thứ ba số ít (he/she/it) và ngôi thứ nhất (I) sau từ 'If'. Ví dụ: 'If it were possible' thay vì 'If it was possible'.",
    vnNote: "⚠️ Người Việt rất hay nhầm lẫn giữa câu điều kiện loại 1 (có thể xảy ra) và loại 2 (giả định không có thật). Hãy nhớ: nếu bạn coi đó là một tình huống hoàn toàn giả định hoặc rất khó xảy ra, hãy lùi thì sang quá khứ đơn ở vế If và dùng would/could ở vế sau.",
    dialogueExample: {
      speaker: "Lâm",
      text: "If that hypothetical scenario happened, I would first assess the impact on the timeline.",
      translation: "Nếu tình huống giả định đó xảy ra, trước tiên tôi sẽ đánh giá tác động lên tiến độ.",
      highlight: "If ... happened (quá khứ đơn), I would assess (would + nguyên thể) — đúng cấu trúc loại 2",
    },
    ccq: {
      question: "Câu nào diễn tả một tình huống KHÔNG CÓ THẬT ở hiện tại?",
      options: [
        "If I have time, I will help you.",
        "If I had time, I would help you.",
        "If I had had time, I would have helped you.",
        "If I have time, I would help you.",
      ],
      answer: "If I had time, I would help you.",
      explanation: "'If I had time, I would help you' dùng quá khứ đơn ở vế If và would ở vế sau, thể hiện hiện tại tôi không có thời gian và tôi không thể giúp bạn.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: 'If the company ___ more capital, it would invest in AI.'", options: ["has", "have", "had", "will have"], answer: "had" },
    { id: "pq2", type: "multiple-choice", question: "Chọn động từ đúng: 'If he ___ the CEO, he would change the corporate structure.'", options: ["is", "was", "were", "be"], answer: "were" },
    { id: "pq3", type: "cloze", question: "Điền: 'What would you do if a competitor ___ (launch) a similar product?'", answer: "launched" },
    { id: "pq4", type: "multiple-choice", question: "Chọn từ điền: 'Starting a joint venture involves a high level of ___.'", options: ["outcome", "criteria", "risk", "expansion"], answer: "risk" },
    { id: "pq5", type: "cloze", question: "Điền: 'If they took that risk, they ___ (might/will) lose their investment.'", answer: "might" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng giả định với nghĩa đúng",
    pairs: [
      { left: "hypothetical", right: "mang tính giả định" },
      { left: "scenario", right: "kịch bản / tình huống" },
      { left: "assess", right: "đánh giá" },
      { left: "venture", right: "dự án mạo hiểm" },
      { left: "expansion", right: "sự mở rộng" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Nếu chúng tôi có nhiều nguồn lực hơn, chúng tôi sẽ mở rộng.",
      answer: "If we had more resources, we would expand.",
    },
    {
      id: "pt-2",
      prompt_vn: "Nếu tôi là bạn, tôi sẽ đầu tư vào công nghệ mới.",
      answer: "If I were you, I would invest in new technology.",
    },
    {
      id: "pt-3",
      prompt_vn: "Họ sẽ mạo hiểm nếu thị trường ổn định.",
      answer: "They would venture if the market were stable.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc33-1",
      sentence: "If I have more time, I would travel the world.",
      errorWord: "have",
      correction: "had",
      explanation_vn: "Second Conditional: 'If I HAD more time' (Past Simple trong mệnh đề if). Không dùng hiện tại.",
    },
    {
      id: "sc33-2",
      sentence: "She would went abroad if she had more money.",
      errorWord: "would went",
      correction: "would go",
      explanation_vn: "'Would + bare infinitive': 'would GO'. 'Went' là quá khứ đơn, không đi với 'would'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la33-1",
      audio_text: "If I had more money I would travel the world.",
      prompt_vn: "Nếu tôi có nhiều tiền hơn tôi sẽ đi du lịch khắp nơi.",
      words: ["If", "I", "had", "more", "money", "I", "would", "travel", "the", "world", ".", "have", "travelled"],
      answer: "If I had more money I would travel the world .",
    },
    {
      id: "la33-2",
      audio_text: "She would move to the city if she could find a job.",
      prompt_vn: "Cô ấy sẽ chuyển lên thành phố nếu tìm được việc.",
      words: ["She", "would", "move", "to", "the", "city", "if", "she", "could", "find", "a", "job", ".", "moved", "can"],
      answer: "She would move to the city if she could find a job .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Nếu tôi là bạn, tôi sẽ không chấp nhận rủi ro đó.",
      words: ["If", "I", "were", "you", ",", "I", "would", "not", "take", "that", "risk", ".", "might", "should"],
      answer: "If I were you , I would not take that risk .",
    },
    {
      id: "wb2",
      prompt_vn: "Chúng tôi sẽ đầu tư nhiều hơn nếu chúng tôi có vốn.",
      words: ["We", "would", "invest", "more", "if", "we", "had", "capital", ".", "might", "should"],
      answer: "We would invest more if we had capital .",
    },
    {
      id: "wb3",
      prompt_vn: "Hãy tưởng tượng kịch bản tệ nhất có thể xảy ra.",
      words: ["Imagine", "the", "worst-case", "scenario", "that", "could", "occur", ".", "might", "should"],
      answer: "Imagine the worst-case scenario that could occur .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s33-1", prompt_vn: "Nếu tôi là bạn, tôi sẽ không chấp nhận rủi ro đó.", words: ["If", "I", "were", "you", ",", "I", "would", "not", "take", "that", "risk", "."], answer: "If I were you , I would not take that risk ." },
    { id: "s33-2", prompt_vn: "Chúng tôi sẽ đầu tư nhiều hơn nếu chúng tôi có vốn.", words: ["We", "would", "invest", "more", "if", "we", "had", "capital", "."], answer: "We would invest more if we had capital ." },
    { id: "s33-3", prompt_vn: "Hãy tưởng tượng kịch bản tệ nhất có thể xảy ra.", words: ["Imagine", "the", "worst-case", "scenario", "that", "could", "occur", "."], answer: "Imagine the worst-case scenario that could occur ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Điền từ: 'If they ___ harder, they would meet the criteria.'", options: ["work", "worked", "working", "had worked"], answer: "worked" },
    { id: "fq2", type: "cloze", question: "Điền từ: 'We need to ___ (đánh giá) the expected outcome of the project.'", answer: "assess" },
    { id: "fq3", type: "multiple-choice", question: "Chọn dạng đúng của To Be: 'If she ___ here, she would clarify the problem.'", options: ["is", "was", "were", "been"], answer: "were" },
    { id: "fq4", type: "translate", question: "Dịch: 'Nếu chúng tôi có nhiều nguồn lực hơn, chúng tôi sẽ mở rộng.'", answer: "If we had more resources, we would expand." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào mô tả kết quả cuối cùng?", options: ["criteria", "outcome", "venture", "scenario"], answer: "outcome" },
    { id: "q-ex1", type: "multiple-choice", question: "Second Conditional dùng cho:", options: ["Điều kiện thật ở hiện tại/tương lai", "Điều kiện giả định không thật ở hiện tại", "Điều kiện không thật trong quá khứ", "Sự thật chung"], answer: "Điều kiện giả định không thật ở hiện tại" },
    { id: "q-ex2", type: "multiple-choice", question: "'If I were you, I would...' — 'were' ở đây là:", options: ["Lỗi ngữ pháp", "Subjunctive mood (giả định)", "Past simple của 'be'", "Past continuous"], answer: "Subjunctive mood (giả định)" },
    { id: "q-ex3", type: "cloze", question: "Điền: 'I'd go abroad if I ___ more money.'", answer: "had" },
    { id: "q-ex4", type: "multiple-choice", question: "'Imagine if...' dùng để:", options: ["Mô tả thực tế", "Đặt ra tình huống giả định", "Hỏi thông tin", "Đưa ra lời khuyên"], answer: "Đặt ra tình huống giả định" },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Nếu tôi là tổng thống, tôi sẽ giảm thuế.'", answer: "If I were president, I would lower taxes." },
    { id: "q-ex6", type: "multiple-choice", question: "'What would you do if you won the lottery?' — câu hỏi về điều gì?", options: ["Kế hoạch thực tế", "Tình huống giả định", "Lời khuyên", "Hành động đã xảy ra"], answer: "Tình huống giả định" },
    { id: "q-ex7", type: "multiple-choice", question: "'Supposing you could fly...' = 'Giả sử bạn có thể bay...' — cấu trúc tương đương:", options: ["Even if you could fly", "If you could fly", "When you can fly", "Unless you can fly"], answer: "If you could fly" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr33-1", question: "Ôn tập Unit 32 — Điền: 'By next month, I ___ (complete) the B1 level.'", options: ["will have completed", "completed", "have completed", "will complete"], answer: "will have completed", type: "multiple-choice" },
    { id: "cr33-2", question: "Ôn tập Unit 31 — Điền: 'The corporate manager recommended that she ___ (inform) the client.'", options: [], answer: "inform", type: "cloze" },
    { id: "cr33-3", question: "Ôn tập Unit 30 — Điền: 'Deforestation is damaging the local ___.'", options: ["prevention", "pollution", "ecosystem", "sustainable"], answer: "ecosystem", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "subjunctive were /wɜːr/",
    description: "Subjunctive were — If I were you — âm /ɜː/ khó nhất",
    examples: [
        { word: "were (subjunctive)", ipa: "/wɜːr/", tip: "If I WERE rich — âm /ɜː/ dài, tròn, giữa — giống her, bird, word" },
        { word: "suppose", ipa: "/səˈpəʊz/", tip: "Stress âm 2: su-POSE — âm /z/ cuối, không phải /s/" },
    ],
    minimalPairs: [
        ["were /wɜːr/", "was /wɒz/ (không dùng trong subjunctive)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "If I were you, I would invest", vn: "Nếu tôi là bạn, tôi sẽ đầu tư" },
      { en: "What would you do if you failed?", vn: "Bạn sẽ làm gì nếu bạn thất bại?" },
      { en: "That is a hypothetical scenario", vn: "Đó là một kịch bản giả định" },
      { en: "We need to assess all risks", vn: "Chúng ta cần đánh giá mọi rủi ro" },
      { en: "We would expand our business globally", vn: "Chúng tôi sẽ mở rộng kinh doanh toàn cầu" },
      { en: "Imagine the worst-case scenario", vn: "Hãy tưởng tượng kịch bản tồi tệ nhất" },
      { en: "What are the selection criteria?", vn: "Các tiêu chí tuyển chọn là gì?" },
      { en: "If we had capital, we would start", vn: "Nếu có vốn, chúng tôi đã bắt đầu" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit33-reading-1",
    title: "If I Could Change One Thing",
    title_vn: "Đọc đoạn về câu điều kiện loại 2 (Second Conditional)",
    level: "B2" as const,
    text:
      "If I could change one thing about modern life, I would reduce our dependence on smartphones. " +
      "If people spent less time on social media, they would have more meaningful conversations. " +
      "If I were the CEO of a tech company, I would introduce mandatory phone-free hours at work. " +
      "Research suggests that if employees took regular digital breaks, their productivity would increase by 20%. " +
      "Of course, technology also brings enormous benefits. " +
      "If we didn't have the internet, remote work wouldn't be possible, " +
      "and millions of people would have lost their jobs during the pandemic. " +
      "If I had unlimited funding, I would invest in digital literacy programmes for older generations " +
      "who struggle to adapt to rapid technological change. " +
      "The key is balance. If we used technology more mindfully, " +
      "it would enrich our lives without controlling them.",
    questions: [
      {
        id: "u33r-q1",
        question_vn: "Nếu người viết có thể thay đổi một điều về cuộc sống hiện đại, họ sẽ thay đổi điều gì?",
        options: [
          "Reduce pollution",
          "Reduce dependence on smartphones",
          "Improve public transport",
          "Reform the education system",
        ],
        answer: "Reduce dependence on smartphones",
        explanation_vn: "'If I could change one thing about modern life, I would reduce our dependence on smartphones.'",
      },
      {
        id: "u33r-q2",
        question_vn: "Nghiên cứu cho thấy điều gì sẽ xảy ra nếu nhân viên nghỉ ngơi kỹ thuật số thường xuyên hơn?",
        options: [
          "Their salaries would increase",
          "Their productivity would increase by 20%",
          "They would work fewer hours",
          "They would use more technology",
        ],
        answer: "Their productivity would increase by 20%",
        explanation_vn: "'if employees took regular digital breaks, their productivity would increase by 20%.'",
      },
      {
        id: "u33r-q3",
        question_vn: "Điều gì sẽ không thể xảy ra nếu không có internet?",
        options: [
          "Social media",
          "Remote work",
          "Online shopping",
          "Video calls",
        ],
        answer: "Remote work",
        explanation_vn: "'If we didn't have the internet, remote work wouldn't be possible.'",
      },
      {
        id: "u33r-q4",
        question_vn: "Điều gì người viết muốn đầu tư nếu có nguồn tài trợ vô hạn?",
        options: [
          "New smartphone apps",
          "Better internet infrastructure",
          "Digital literacy programmes for older generations",
          "More powerful computers",
        ],
        answer: "Digital literacy programmes for older generations",
        explanation_vn: "'I would invest in digital literacy programmes for older generations.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Tham gia họp dự án và cập nhật status với stakeholder",
      focus: "Project update: blockers, timeline, ask for support",
      context: "Cross-team sync với PM và client",
      l1Note: "⚠️ 'We are on track for delivery next Friday.' 'We are blocked on the design assets.' 'Can we get your input by EOD?'",
      example: "Backend is 90% done. The main blocker is API spec. I will send the updated timeline after this call."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "PqHzCRO0-tY",
};

export default unit33;
