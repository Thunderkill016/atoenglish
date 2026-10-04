import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-23 — If & When  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit23: UnitData = {
  unitId: "unit-23",
  title: "Unit 23: If & When",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description: "Thành thạo Zero & First Conditionals — nói về điều kiện thực tế trong kinh doanh và cuộc sống hàng ngày.",
  badgeName: "Nhà Đàm Phán",
  badgeEmoji: "🤝",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn đang đàm phán hợp đồng với đối tác. Họ hỏi điều kiện của bạn. Bạn cần dùng conditionals: 'If you increase the order, we will offer a discount.' Hiểu và dùng đúng conditionals = đàm phán hiệu quả.",
  learningOutcomes: [
    "Dùng Zero Conditional cho sự thật và quy luật chung",
    "Dùng First Conditional cho điều kiện có thể xảy ra trong tương lai",
    "Đàm phán điều kiện hợp đồng bằng tiếng Anh tự nhiên",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong đàm phán kinh doanh, <span class="text-emerald-400 font-semibold">First Conditional</span> là công cụ mạnh nhất: <span class="text-emerald-400">"If you sign before Friday, we will give you a 10% discount."</span> Nghe chuyên nghiệp, rõ ràng và tạo động lực hành động. Người Việt hay nói kiểu <span class="text-zinc-400">"If you sign, we will giving..."</span> — sai thì trong vế kết quả.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🔬", en: "If you heat water to 100°C, it boils. (Zero — scientific fact)", vn: "Nếu bạn đun nước đến 100°C, nó sẽ sôi.", context: "Zero Conditional — sự thật" },
    { emoji: "💼", en: "If we increase the order, they will offer a better price.", vn: "Nếu chúng ta tăng đơn hàng, họ sẽ đưa ra giá tốt hơn.", context: "First Conditional — khả năng thực tế" },
    { emoji: "⚠️", en: "Unless we act now, we will miss the opportunity.", vn: "Trừ khi chúng ta hành động ngay, chúng ta sẽ bỏ lỡ cơ hội.", context: "Unless = if...not" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "condition", emoji: "📋", phonetic: "/kənˈdɪʃən/", meaning: "điều kiện", example: "The condition is that you must pay within 30 days.", example2: "We agree to the terms and conditions.", collocation: "on the condition that / terms and conditions", audio: "/audio/unit-23/condition.mp3" },
    { id: 2, word: "unless", emoji: "⚠️", phonetic: "/ənˈles/", meaning: "trừ khi / nếu không", example: "We won't proceed unless you confirm the order.", example2: "Unless you call ahead, there may not be a table.", collocation: "unless otherwise stated / unless you / unless we", audio: "/audio/unit-23/unless.mp3", l1_interference_vn: "⚠️ \'Unless\' = \'if not\' — KHÔNG dùng phủ định: \'Unless you study\' (KHÔNG \'Unless you don\'t study\')." },
    { id: 3, word: "guarantee", emoji: "✅", phonetic: "/ˌɡærənˈtiː/", meaning: "đảm bảo / bảo hành", example: "If you pay in advance, we guarantee delivery within 48 hours.", example2: "The product comes with a two-year guarantee.", collocation: "money-back guarantee / guarantee delivery / no guarantee", audio: "/audio/unit-23/guarantee.mp3" },
    { id: 4, word: "discount", emoji: "🏷️", phonetic: "/ˈdɪskaʊnt/", meaning: "chiết khấu / giảm giá", example: "If you order more than 100 units, we will offer a 15% discount.", example2: "They gave us a discount for paying early.", collocation: "offer a discount / bulk discount / apply a discount", audio: "/audio/unit-23/discount.mp3" , l1_interference_vn: "⚠️ DIS-count (danh từ) vs dis-COUNT (động từ). 'A 10% discount' (n) vs 'discount the price' (v)." },
    { id: 5, word: "deadline", emoji: "⏰", phonetic: "/ˈdedlaɪn/", meaning: "hạn chót", example: "If we miss the deadline, we will face a penalty.", example2: "The project deadline is the end of the month.", collocation: "meet a deadline / miss a deadline / extend a deadline", audio: "/audio/unit-23/deadline.mp3", l1_interference_vn: "⚠️ \'MEET a deadline\' (kịp hạn) hoặc \'MISS a deadline\' (trễ). Không phải \'do/finish the deadline\'." },
    { id: 6, word: "proposal", emoji: "📄", phonetic: "/prəˈpəʊzəl/", meaning: "đề xuất", example: "If you accept our proposal, we can start immediately.", example2: "She submitted a proposal for the new project.", collocation: "submit a proposal / accept a proposal / business proposal", audio: "/audio/unit-23/proposal.mp3", l1_interference_vn: "⚠️ \'Proposal FOR\': \'a proposal for a new project\'. \'Make/submit a proposal\'." },
    { id: 7, word: "consequence", emoji: "⚡", phonetic: "/ˈkɒnsɪkwəns/", meaning: "hậu quả", example: "If you delay payment, the consequence is a 5% late fee.", example2: "Consider the consequences before making a decision.", collocation: "face the consequences / serious consequences", audio: "/audio/unit-23/consequence.mp3", l1_interference_vn: "⚠️ \'Consequence OF\': \'consequences of climate change\'. Giới từ \'of\', không phải \'from\'." },
    { id: 8, word: "negotiate", emoji: "🤝", phonetic: "/nɪˈɡəʊʃieɪt/", meaning: "đàm phán", example: "If both sides negotiate fairly, they will reach an agreement.", example2: "We need to negotiate better terms with the supplier.", collocation: "negotiate a deal / negotiate terms / open to negotiation", audio: "/audio/unit-23/negotiate.mp3", l1_interference_vn: "⚠️ \'Negotiate a deal/contract\' — không dùng \'negotiate to\' hay \'negotiate for sth\' trực tiếp." },
    { id: 9, word: "penalty", emoji: "💸", phonetic: "/ˈpenəlti/", meaning: "phạt / tiền phạt", example: "If you cancel after the deadline, you will pay a penalty.", example2: "The contract includes a penalty clause for late delivery.", collocation: "pay a penalty / impose a penalty / penalty clause", audio: "/audio/unit-23/penalty.mp3", l1_interference_vn: "⚠️ \'Penalty FOR\': \'a penalty for breaking the law\'. Giới từ \'for\', không phải \'of\'." },
    { id: 10, word: "opportunity", emoji: "🌟", phonetic: "/ˌɒpəˈtjuːnɪti/", meaning: "cơ hội", example: "If we invest now, we will not miss this opportunity.", example2: "This is a great opportunity to expand our market share.", collocation: "take an opportunity / miss an opportunity / business opportunity", audio: "/audio/unit-23/opportunity.mp3" , l1_interference_vn: "⚠️ Stress: op-por-TU-ni-ty (âm 3). 5 âm tiết. 'An opportunity TO do something'." },
    { id: 11, word: "proceed", emoji: "▶️", phonetic: "/prəˈsiːd/", meaning: "tiến hành / tiếp tục", example: "If you sign today, we will proceed with the order immediately.", example2: "Please proceed to the next step once confirmed.", collocation: "proceed with / proceed to / proceed as planned", audio: "/audio/unit-23/proceed.mp3", l1_interference_vn: "⚠️ \'Proceed WITH\': \'proceed with the plan\'. Hoặc \'proceed to DO sth\'. Không dùng \'proceed to doing\'." },
    { id: 12, word: "agreement", emoji: "📝", phonetic: "/əˈɡriːmənt/", meaning: "thỏa thuận / hợp đồng", example: "If we reach an agreement today, production starts next week.", example2: "Both parties signed the agreement yesterday.", collocation: "reach an agreement / sign an agreement / in agreement", audio: "/audio/unit-23/agreement.mp3", l1_interference_vn: "⚠️ \'Agreement ON/ABOUT\': \'reach an agreement on the price\'. \'In agreement WITH\' = đồng ý với." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Đàm phán giá",
      audio: "/audio/unit-23/dialogue_1.mp3",
      desc: "Minh đàm phán điều kiện giá với nhà cung cấp.",
      lines: [
        { id: "d1-1", speaker: "Supplier", text: "What are your conditions for signing the contract today?", translation: "Điều kiện của bạn để ký hợp đồng hôm nay là gì?" },
        { id: "d1-2", speaker: "Minh", text: "If you offer a 10% discount, we will place the order immediately.", translation: "Nếu bạn đưa ra chiết khấu 10%, chúng tôi sẽ đặt hàng ngay lập tức." },
        { id: "d1-3", speaker: "Supplier", text: "We can do 7%. If you increase the quantity to 500 units, we will go up to 12%.", translation: "Chúng tôi có thể làm 7%. Nếu bạn tăng số lượng lên 500 đơn vị, chúng tôi sẽ lên đến 12%." },
        { id: "d1-4", speaker: "Minh", text: "That's fair. But unless you guarantee delivery within 30 days, we cannot proceed.", translation: "Điều đó hợp lý. Nhưng trừ khi bạn đảm bảo giao hàng trong vòng 30 ngày, chúng tôi không thể tiến hành." },
        { id: "d1-5", speaker: "Supplier", text: "If you confirm the order by Thursday, we guarantee delivery by the end of the month.", translation: "Nếu bạn xác nhận đơn hàng trước thứ Năm, chúng tôi đảm bảo giao hàng trước cuối tháng." },
        { id: "d1-6", speaker: "Minh", text: "Perfect. If we reach an agreement today, I will send the signed contract tonight.", translation: "Hoàn hảo. Nếu chúng ta đạt được thỏa thuận hôm nay, tôi sẽ gửi hợp đồng đã ký tối nay." },
      ],
    },
    {
      id: 2,
      title: "Giải thích điều kiện hợp đồng",
      audio: "/audio/unit-23/dialogue_2.mp3",
      desc: "Lan giải thích các điều khoản hợp đồng cho khách hàng mới.",
      lines: [
        { id: "d2-1", speaker: "Client", text: "What happens if we need to cancel the order?", translation: "Điều gì xảy ra nếu chúng tôi cần hủy đơn hàng?" },
        { id: "d2-2", speaker: "Lan", text: "If you cancel more than 14 days before delivery, there is no penalty. But if you cancel within 14 days, you pay 20% of the order value.", translation: "Nếu bạn hủy hơn 14 ngày trước khi giao hàng, sẽ không có tiền phạt. Nhưng nếu bạn hủy trong vòng 14 ngày, bạn phải trả 20% giá trị đơn hàng." },
        { id: "d2-3", speaker: "Client", text: "That's clear. And if we pay early?", translation: "Rõ ràng lắm. Còn nếu chúng tôi trả sớm thì sao?" },
        { id: "d2-4", speaker: "Lan", text: "If you pay within 10 days, we will add a 3% early payment discount automatically.", translation: "Nếu bạn thanh toán trong vòng 10 ngày, chúng tôi sẽ tự động cộng thêm chiết khấu thanh toán sớm 3%." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "If you increase the order we will offer a better price", options: ["If you increase the order we will offer a better price", "If you will increase the order we will offer a better price", "If you increase the order we offer a better price", "If you increased the order we will offer a better price"], answer: "If you increase the order we will offer a better price" },
    { id: "lac2", audio_text: "Unless you confirm by Thursday we cannot proceed", options: ["Unless you confirm by Thursday we cannot proceed", "Unless you will confirm by Thursday we cannot proceed", "If you don't confirm by Thursday we can proceed", "Unless you confirmed by Thursday we cannot proceed"], answer: "Unless you confirm by Thursday we cannot proceed" },
    { id: "lac3", audio_text: "If water reaches one hundred degrees it boils", options: ["If water reaches one hundred degrees it will boil", "If water reaches one hundred degrees it boils", "If water will reach one hundred degrees it boils", "If water reached one hundred degrees it boils"], answer: "If water reaches one hundred degrees it boils" },
    { id: "lac4", audio_text: "If you sign today we will proceed immediately", options: ["If you sign today we proceeded immediately", "If you will sign today we will proceed immediately", "If you sign today we will proceed immediately", "If you signed today we will proceed immediately"], answer: "If you sign today we will proceed immediately" },
    { id: "lac5", audio_text: "If you cancel within fourteen days you pay a twenty percent penalty", options: ["If you cancel within fourteen days you will pay a twenty percent penalty", "If you cancel within fourteen days you pay a twenty percent penalty", "If you cancelled within fourteen days you pay a twenty percent penalty", "If you will cancel within fourteen days you pay a twenty percent penalty"], answer: "If you cancel within fourteen days you pay a twenty percent penalty" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "If you {input}, we will {input}. However, unless you {input}, we cannot {input}.",
    level1Placeholder: "Ví dụ: increase the order — offer 10% discount — confirm by Friday — proceed...",
    level2Situation: "Bạn đang đàm phán điều khoản hợp đồng. Trình bày rõ ràng: (1) Điều kiện bạn đưa ra là gì (First Conditional)? (2) Quy luật nào áp dụng tự động (Zero Conditional)? (3) Điều gì xảy ra nếu đối tác không đồng ý (Unless)?",
    level2Hint: "If you [condition], we will [result]. Unless you [condition], we cannot [proceed]. If both parties [action], the agreement will [outcome]. In general, if [rule], [consequence] — this is our standard policy.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Zero & First Conditionals",
    rule: "ZERO CONDITIONAL — Sự thật / Quy luật chung:\nIf + Present Simple → Present Simple\n→ 'If you heat water to 100°C, it boils.'\n→ 'If the market grows, prices rise.'\n\nFIRST CONDITIONAL — Điều kiện có thể xảy ra:\nIf + Present Simple → will + infinitive\n→ 'If you sign today, we will give you a discount.'\n→ 'If they confirm, we will start production.'\n\nUNLESS = If...not:\n→ 'Unless you pay, we won't deliver.' = 'If you don't pay, we won't deliver.'",
    examples: [
      { en: "If customers complain, we always offer a refund. (Zero — company policy)", vn: "Nếu khách hàng phàn nàn, chúng tôi luôn hoàn tiền." },
      { en: "If you place the order today, we will ship within 24 hours. (First — real possibility)", vn: "Nếu bạn đặt hàng hôm nay, chúng tôi sẽ vận chuyển trong vòng 24 tiếng." },
      { en: "Unless you confirm by Friday, we will release the stock. (Unless = if not)", vn: "Trừ khi bạn xác nhận trước thứ Sáu, chúng tôi sẽ giải phóng hàng tồn." },
    ],
    tip: "Bí quyết nhớ First Conditional: Vế IF dùng Present Simple (KHÔNG dùng will). Vế KẾT QUẢ dùng will. 'If you SIGN (NOT will sign), we WILL give a discount.' — Lỗi phổ biến: dùng 'will' cả hai vế.",
    vnNote: "⚠️ Lưu ý người Việt: Trong tiếng Việt 'nếu...thì...' — cả hai vế thường dùng 'sẽ'. Trong tiếng Anh, vế IF (điều kiện) KHÔNG dùng will — chỉ dùng Present Simple. Nhầm → câu sai ngữ pháp.",
    dialogueExample: {
      speaker: "Minh",
      text: "If you offer a 10% discount, we will place the order immediately. Unless you guarantee delivery within 30 days, we cannot proceed.",
      translation: "Nếu bạn đưa ra chiết khấu 10%, chúng tôi sẽ đặt hàng ngay. Trừ khi bạn đảm bảo giao hàng trong 30 ngày, chúng tôi không thể tiến hành.",
      highlight: "If + present simple (offer) → will + infinitive (will place) | Unless = if not",
    },
    ccq: {
      question: "Câu First Conditional nào ĐÚNG ngữ pháp?",
      options: [
        "If you will sign the contract, we will start.",
        "If you sign the contract, we will start.",
        "If you signed the contract, we will start.",
        "If you sign the contract, we start.",
      ],
      answer: "If you sign the contract, we will start.",
      explanation: "First Conditional: If + Present Simple (sign) → will + infinitive (will start). Vế IF không dùng 'will'.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng First Conditional: 'If she ___ the report, the manager ___ pleased.'", options: ["submits / will be", "will submit / will be", "submits / is", "submitted / will be"], answer: "submits / will be" },
    { id: "pq2", type: "multiple-choice", question: "Zero Conditional — quy luật: 'If the temperature ___ below zero, water ___.'", options: ["falls / freezes", "will fall / will freeze", "falls / will freeze", "fell / froze"], answer: "falls / freezes" },
    { id: "pq3", type: "cloze", question: "Điền: 'Unless they ___ (confirm) by Friday, we ___ (cancel) the order.'", answer: "confirm / will cancel" },
    { id: "pq4", type: "multiple-choice", question: "Câu nào ĐÚNG về điều kiện trong hợp đồng?", options: ["If you will pay early, we will give a discount.", "If you pay early, we will give a discount.", "If you paid early, we will give a discount.", "If you pay early, we give a discount."], answer: "If you pay early, we will give a discount." },
    { id: "pq5", type: "cloze", question: "Điền: 'If both sides ___ (negotiate) fairly, they ___ (reach) a good agreement.'", answer: "negotiate / will reach" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "unless", right: "trừ khi" },
      { left: "guarantee", right: "đảm bảo" },
      { left: "negotiate", right: "đàm phán" },
      { left: "proceed", right: "tiến hành" },
      { left: "proposal", right: "đề xuất" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Nếu bạn đặt hàng trước thứ Sáu, chúng tôi sẽ giao hàng miễn phí.",
      answer: "If you order before Friday, we will deliver for free.",
    },
    {
      id: "pt-2",
      prompt_vn: "Trừ khi bạn xác nhận sớm, chúng tôi không thể đảm bảo.",
      answer: "Unless you confirm early, we cannot guarantee it.",
    },
    {
      id: "pt-3",
      prompt_vn: "Nếu giá giảm, doanh số sẽ tăng.",
      answer: "If the price drops, sales will increase.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc23-1",
      sentence: "If it will rain tomorrow, I will stay home.",
      errorWord: "will rain",
      correction: "rains",
      explanation_vn: "First Conditional: mệnh đề 'If' dùng Present Simple (không dùng 'will'). 'If it RAINS, I will stay.'",
    },
    {
      id: "sc23-2",
      sentence: "She will call when she will arrive.",
      errorWord: "will arrive",
      correction: "arrives",
      explanation_vn: "Sau 'when' (time clause) dùng Present Simple: 'when she ARRIVES'. Không dùng 'will' trong time clause.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la23-1",
      audio_text: "If it rains tomorrow I will stay at home.",
      prompt_vn: "Nếu ngày mai trời mưa tôi sẽ ở nhà.",
      words: ["If", "it", "rains", "tomorrow", "I", "will", "stay", "at", "home", ".", "will rain", "staying"],
      answer: "If it rains tomorrow I will stay at home .",
    },
    {
      id: "la23-2",
      audio_text: "I will call you when I arrive at the airport.",
      prompt_vn: "Tôi sẽ gọi cho bạn khi tôi đến sân bay.",
      words: ["I", "will", "call", "you", "when", "I", "arrive", "at", "the", "airport", ".", "arrives", "will arrive"],
      answer: "I will call you when I arrive at the airport .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Nếu bạn tăng đơn hàng, chúng tôi sẽ đưa ra giá tốt hơn.",
      words: ["If", "you", "increase", "the", "order", ",", "we", "will", "offer", "a", "better", "price", ".", "would", "could"],
      answer: "If you increase the order , we will offer a better price .",
    },
    {
      id: "wb2",
      prompt_vn: "Trừ khi bạn xác nhận trước thứ Năm, chúng tôi không thể tiến hành.",
      words: ["Unless", "you", "confirm", "by", "Thursday", ",", "we", "cannot", "proceed", ".", "would", "could"],
      answer: "Unless you confirm by Thursday , we cannot proceed .",
    },
    {
      id: "wb3",
      prompt_vn: "Nếu bạn ký hôm nay, tôi sẽ gửi hợp đồng tối nay.",
      words: ["If", "you", "sign", "today", ",", "I", "will", "send", "the", "contract", "tonight", ".", "would", "could"],
      answer: "If you sign today , I will send the contract tonight .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s23-1", prompt_vn: "Nếu bạn tăng đơn hàng, chúng tôi sẽ đưa ra giá tốt hơn.", words: ["If", "you", "increase", "the", "order", ",", "we", "will", "offer", "a", "better", "price", "."], answer: "If you increase the order , we will offer a better price ." },
    { id: "s23-2", prompt_vn: "Trừ khi bạn xác nhận trước thứ Năm, chúng tôi không thể tiến hành.", words: ["Unless", "you", "confirm", "by", "Thursday", ",", "we", "cannot", "proceed", "."], answer: "Unless you confirm by Thursday , we cannot proceed ." },
    { id: "s23-3", prompt_vn: "Nếu bạn ký hôm nay, tôi sẽ gửi hợp đồng tối nay.", words: ["If", "you", "sign", "today", ",", "I", "will", "send", "the", "contract", "tonight", "."], answer: "If you sign today , I will send the contract tonight ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch: 'Nếu bạn đặt hàng trước thứ Sáu, chúng tôi sẽ giao hàng miễn phí.'", options: ["If you will order before Friday, we will deliver for free.", "If you order before Friday, we will deliver for free.", "If you ordered before Friday, we will deliver for free.", "If you order before Friday, we deliver for free."], answer: "If you order before Friday, we will deliver for free." },
    { id: "fq2", type: "cloze", question: "Điền: '___ you pay within 10 days, you ___ (receive) a 3% discount.'", answer: "If / will receive" },
    { id: "fq3", type: "multiple-choice", question: "Zero Conditional cho quy luật công ty:", options: ["If a client complains, we will offer a refund.", "If a client complains, we offer a refund.", "If a client will complain, we offer a refund.", "If a client complained, we offer a refund."], answer: "If a client complains, we offer a refund." },
    { id: "fq4", type: "translate", question: "Dịch: 'Trừ khi bạn hủy trước 14 ngày, sẽ có tiền phạt.'", answer: "Unless you cancel more than 14 days in advance, there will be a penalty." },
    { id: "fq5", type: "multiple-choice", question: "Câu nào dùng UNLESS đúng?", options: ["Unless you don't confirm, we will wait.", "Unless you confirm, we will proceed anyway.", "Unless you confirm, we will not proceed.", "Unless if you confirm, we will proceed."], answer: "Unless you confirm, we will not proceed." },
    { id: "q-ex1", type: "multiple-choice", question: "Zero conditional dùng cho:", options: ["Điều kiện giả định", "Sự thật chung/quy luật", "Điều kiện không thể xảy ra", "Tiếc nuối quá khứ"], answer: "Sự thật chung/quy luật" },
    { id: "q-ex2", type: "multiple-choice", question: "First conditional đúng:", options: ["If it rains, I will stay home.", "If it rained, I will stay home.", "If it rains, I would stay home.", "If it will rain, I stay home."], answer: "If it rains, I will stay home." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'If you study hard, you ___ pass the exam.'", answer: "will" },
    { id: "q-ex4", type: "multiple-choice", question: "'Unless' nghĩa là:", options: ["Nếu", "Trừ khi không", "Mặc dù", "Kể cả khi"], answer: "Trừ khi không" },
    { id: "q-ex5", type: "multiple-choice", question: "'When' vs 'if': khi nào dùng 'when'?", options: ["Điều không chắc xảy ra", "Điều chắc chắn xảy ra", "Câu hỏi trực tiếp", "Điều giả định"], answer: "Điều chắc chắn xảy ra" },
    { id: "q-ex6", type: "translate", question: "Dịch: 'Nếu bạn cần giúp đỡ, hãy gọi cho tôi.'", answer: "If you need help, call me." },
    { id: "q-ex7", type: "multiple-choice", question: "Zero conditional: 'If you heat water to 100°C, it ___'", options: ["boils", "will boil", "would boil", "boiled"], answer: "boils" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr23-1", question: "Ôn tập Unit 22 — 'You ___ share passwords' (BỊ CẤM).", options: ["should not", "don't have to", "mustn't", "needn't"], answer: "mustn't", type: "multiple-choice" },
    { id: "cr23-2", question: "Ôn tập Unit 21 — Điền: 'By 2030, we ___ (expand) into 10 countries.'", options: [], answer: "will have expanded", type: "cloze" },
    { id: "cr23-3", question: "Ôn tập Unit 20 — Câu Past Perfect đúng:", options: ["When I arrived, the meeting started.", "When I arrived, the meeting has started.", "When I arrived, the meeting had already started.", "When I arrived, the meeting was starting."], answer: "When I arrived, the meeting had already started.", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "if + linking",
    description: "Conditional nối âm — if it → /ɪ fɪt/, if I → /ɪ faɪ/",
    examples: [
        { word: "if it rains", ipa: "/ɪf ɪt reɪnz/", tip: "Nối âm: if it → /ɪ.fɪt/ — âm /f/ nối với it" },
        { word: "if you", ipa: "/ɪf juː/", tip: "Nối âm: if you → /ɪ.fjuː/ — âm /f/ + /j/ tạo /fj/" },
    ],
    minimalPairs: [
        ["if it /ɪf.ɪt/", "if I /ɪ.faɪ/"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "If you sign today, we will start immediately", vn: "Nếu bạn ký hôm nay, chúng tôi sẽ bắt đầu ngay" },
      { en: "Unless you confirm, we cannot proceed", vn: "Trừ khi bạn xác nhận, chúng tôi không thể tiến hành" },
      { en: "If you pay early, you will receive a discount", vn: "Nếu bạn trả sớm, bạn sẽ nhận chiết khấu" },
      { en: "If the market grows, demand increases", vn: "Nếu thị trường tăng trưởng, nhu cầu tăng" },
      { en: "If we miss the deadline, there will be a penalty", vn: "Nếu chúng ta bỏ lỡ hạn chót, sẽ có tiền phạt" },
      { en: "Will you proceed if they accept the proposal?", vn: "Bạn sẽ tiến hành không nếu họ chấp nhận đề xuất?" },
      { en: "If both sides negotiate fairly, they will reach an agreement", vn: "Nếu cả hai bên đàm phán công bằng, họ sẽ đạt thỏa thuận" },
      { en: "Unless we act now, we will miss the opportunity", vn: "Trừ khi chúng ta hành động ngay, chúng ta sẽ bỏ lỡ cơ hội" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit23-reading-1",
    title: "Planning for Success",
    title_vn: "Đọc đoạn về lập kế hoạch thành công",
    level: "B1" as const,
    text:
      "Success doesn't happen by accident. If you set clear goals, you will achieve better results. " +
      "When you plan your week on Sunday evening, you feel more organised on Monday morning. " +
      "If you break a big project into small tasks, it becomes much easier to manage. " +
      "If you don't prioritise your work, you will waste time on unimportant things. " +
      "When I finish a difficult task, I always reward myself with a short break. " +
      "This helps me stay motivated throughout the day. " +
      "If you sleep less than seven hours, your concentration will suffer the next day. " +
      "When you work in a team, communication is essential. " +
      "If everyone understands their role, the project will run smoothly. " +
      "Remember: good habits lead to great outcomes!",
    questions: [
      {
        id: "u23r-q1",
        question_vn: "Điều gì xảy ra nếu bạn đặt mục tiêu rõ ràng?",
        options: [
          "You will feel stressed",
          "You will achieve better results",
          "You will work longer hours",
          "You will need less sleep",
        ],
        answer: "You will achieve better results",
        explanation_vn: "'If you set clear goals, you will achieve better results.'",
      },
      {
        id: "u23r-q2",
        question_vn: "Tại sao người viết lập kế hoạch tuần vào tối Chủ nhật?",
        options: [
          "To impress their manager",
          "To feel more organised on Monday",
          "To avoid working overtime",
          "To finish work earlier",
        ],
        answer: "To feel more organised on Monday",
        explanation_vn: "'When you plan your week on Sunday evening, you feel more organised on Monday morning.'",
      },
      {
        id: "u23r-q3",
        question_vn: "Điều gì xảy ra nếu bạn ngủ ít hơn bảy tiếng?",
        options: [
          "You will be more creative",
          "Your concentration will suffer",
          "You will finish work faster",
          "You will feel more motivated",
        ],
        answer: "Your concentration will suffer",
        explanation_vn: "'If you sleep less than seven hours, your concentration will suffer the next day.'",
      },
      {
        id: "u23r-q4",
        question_vn: "Khi nào dự án nhóm sẽ chạy suôn sẻ?",
        options: [
          "When the manager controls everything",
          "When everyone works extra hours",
          "When everyone understands their role",
          "When the deadline is extended",
        ],
        answer: "When everyone understands their role",
        explanation_vn: "'If everyone understands their role, the project will run smoothly.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Gửi email follow-up sau cuộc họp khách hàng",
      focus: "Email writing: thank, summarize action items, propose next steps",
      context: "Sau meeting với client quốc tế, cần viết email chuyên nghiệp",
      l1Note: "⚠️ 'Thank you for your time.' 'Please find attached the proposal.' 'I look forward to your feedback.'",
      example: "Thank you for the meeting. Attached is the proposal. Let's schedule a call next week to discuss next steps."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "oXlk6H_Jqis",
};

export default unit23;
