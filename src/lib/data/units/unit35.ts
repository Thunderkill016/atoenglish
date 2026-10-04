import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-35 — Advanced Conditions  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit35: UnitData = {
  unitId: "unit-35",
  title: "Unit 35: Advanced Conditions",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Mixed Conditionals & Alternatives to IF — Câu điều kiện hỗn hợp và các liên từ thay thế IF (unless, provided that, as long as, even if). Kỹ năng cốt lõi cho đàm phán hợp đồng thương mại và bài thi TOEIC Part 5 & 6.",
  badgeName: "Nhà Đàm Phán",
  badgeEmoji: "🤝",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Thảo luận và đàm phán hợp đồng với đối tác quốc tế. Hai bên đang tranh luận về các điều khoản thanh toán, bảo hành và khoản phạt khi giao hàng chậm trễ. Sử dụng câu điều kiện hỗn hợp và các liên từ điều kiện để đưa ra thỏa hiệp một cách chặt chẽ.",
  learningOutcomes: [
    "Sử dụng câu điều kiện hỗn hợp (Mixed Conditionals) để liên kết quá khứ với hiện tại",
    "Áp dụng các liên từ điều kiện unless, provided that, as long as trong đàm phán",
    "Đọc hiểu và sử dụng từ vựng về điều khoản hợp đồng ở cấp độ B2 chuyên nghiệp",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong đàm phán thương mại quốc tế, các từ thay thế cho "if" như <span class="text-emerald-400">"provided that"</span> hoặc <span class="text-emerald-400">"as long as"</span> được ưa chuộng hơn vì chúng nhấn mạnh <span class="text-emerald-400 font-semibold">điều kiện tiên quyết bắt buộc</span>. Ngược lại, <span class="text-emerald-400">"unless"</span> (trừ khi) được dùng để đưa ra cảnh báo mạnh mẽ về hệ quả xấu nếu điều kiện không được đáp ứng.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "📄", en: "Provided that you deliver on time, we will sign the agreement.", vn: "Với điều kiện là bạn giao hàng đúng hạn, chúng tôi sẽ ký thỏa thuận.", context: "provided that = miễn là / với điều kiện là" },
    { emoji: "🤝", en: "We will not sign the contract unless you clarify this clause.", vn: "Chúng tôi sẽ không ký hợp đồng trừ khi bạn làm rõ điều khoản này.", context: "unless = trừ khi (if not)" },
    { emoji: "⏳", en: "If we had signed yesterday, we would be in compliance today.", vn: "Nếu hôm qua chúng ta ký kết, hôm nay chúng ta đã tuân thủ đúng luật rồi.", context: "Mixed Conditional: Past action -> Present result" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "agreement", emoji: "🤝", phonetic: "/əˈɡriːmənt/", meaning: "sự thỏa thuận / hợp đồng", example: "Both parties finally signed the trade agreement.", example2: "We reached an agreement after a long negotiation.", collocation: "sign an agreement / reach an agreement / verbal agreement", audio: "/audio/unit-35/agreement.mp3", l1_interference_vn: "⚠️ \'Agreement ON/ABOUT\': \'reach an agreement on the price\'. \'In agreement WITH\' = đồng ý với." },
    { id: 2, word: "negotiate", emoji: "🗣️", phonetic: "/nɪˈɡəʊʃɪeɪt/", meaning: "đàm phán / thương lượng", example: "We need to negotiate the price before making a order.", example2: "She is skilled at negotiating contracts.", collocation: "negotiate a contract / negotiate with / negotiate terms", audio: "/audio/unit-35/negotiate.mp3", l1_interference_vn: "⚠️ \'Negotiate a deal/contract\' — không dùng \'negotiate to\' hay \'negotiate for sth\' trực tiếp." },
    { id: 3, word: "terms", emoji: "📋", phonetic: "/tɜːmz/", meaning: "các điều khoản (trong hợp đồng)", example: "The terms of the contract are very strict.", example2: "We are discussing the payment terms now.", collocation: "payment terms / terms of service / agree to terms", audio: "/audio/unit-35/terms.mp3", l1_interference_vn: "⚠️ Đừng dịch 'terms' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 4, word: "clause", emoji: "📌", phonetic: "/klɔːz/", meaning: "điều khoản nhỏ (trong văn bản pháp lý)", example: "There is a penalty clause for late delivery.", example2: "Please read the confidentiality clause carefully.", collocation: "penalty clause / confidentiality clause / add a clause", audio: "/audio/unit-35/clause.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'clause' trong câu trang trọng." },
    { id: 5, word: "condition", emoji: "⚙️", phonetic: "/kənˈdɪʃən/", meaning: "điều kiện", example: "We agreed to the contract under one main condition.", example2: "The working conditions in the factory are excellent.", collocation: "working condition / under the condition that / set conditions", audio: "/audio/unit-35/condition.mp3", l1_interference_vn: "⚠️ 'condition' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 6, word: "compliance", emoji: "🛡️", phonetic: "/kənˈplaɪəns/", meaning: "sự tuân thủ quy định/pháp luật", example: "The company is in compliance with safety standards.", example2: "We must ensure compliance with all environmental laws.", collocation: "in compliance with / ensure compliance / compliance officer", audio: "/audio/unit-35/compliance.mp3", l1_interference_vn: "⚠️ 'In compliance WITH', không 'to' hay 'of'. Người VN hay dịch sai giới từ." },
    { id: 7, word: "contract", emoji: "📄", phonetic: "/ˈkɒntrækt/", meaning: "hợp đồng / giao kèo", example: "The contract will terminate at the end of the year.", example2: "She signed a two-year employment contract.", collocation: "sign a contract / terminate a contract / contract extension", audio: "/audio/unit-35/contract.mp3", l1_interference_vn: "⚠️ 'Contract' có thể là danh từ hoặc động từ. 'Sign/terminate a contract' – collocation chuẩn." },
    { id: 8, word: "guarantee", emoji: "🛡️", phonetic: "/ˌɡærənˈtiː/", meaning: "sự bảo đảm / cam kết", example: "There is no guarantee that the investment will be successful.", example2: "The product comes with a three-year guarantee.", collocation: "offer a guarantee / money-back guarantee / guarantee that", audio: "/audio/unit-35/guarantee.mp3", l1_interference_vn: "⚠️ 'Guarantee' + that clause. 'Money-back guarantee' phổ biến." },
    { id: 9, word: "terminate", emoji: "🛑", phonetic: "/ˈtɜːmɪneɪt/", meaning: "chấm dứt / hủy bỏ (hợp đồng)", example: "Either party can terminate the agreement with a one-month notice.", example2: "They decided to terminate his contract due to poor performance.", collocation: "terminate an agreement / terminate a contract / terminate employment", audio: "/audio/unit-35/terminate.mp3", l1_interference_vn: "⚠️ 'Terminate' formal. 'End' casual hơn. 'Terminate with notice'." },
    { id: 10, word: "provision", emoji: "📦", phonetic: "/prəˈvɪʒən/", meaning: "điều khoản cung cấp / điều khoản quy định", example: "Under the provisions of the contract, we must pay by Friday.", example2: "The company made provisions for future expansion.", collocation: "contract provision / make provision for / legal provision", audio: "/audio/unit-35/provision.mp3" },
    { id: 11, word: "dispute", phonetic: "/dɪˈspjuːt/", emoji: "⚖️", meaning: "tranh chấp / bất đồng", example: "The court resolved the trade dispute between the two companies.", example2: "There is a dispute over the ownership of the land.", collocation: "resolve a dispute / trade dispute / legal dispute", audio: "/audio/unit-35/dispute.mp3" },
    { id: 12, word: "penalty", emoji: "💸", phonetic: "/ˈpenəlti/", meaning: "khoản phạt / hình phạt", example: "There will be a heavy penalty if we terminate the contract early.", example2: "The penalty for late submission is a lower grade.", collocation: "pay a penalty / penalty clause / death penalty", audio: "/audio/unit-35/penalty.mp3", l1_interference_vn: "⚠️ \'Penalty FOR\': \'a penalty for breaking the law\'. Giới từ \'for\', không phải \'of\'." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Đàm phán điều khoản hợp đồng",
      audio: "/audio/unit-35/dialogue_1.mp3",
      desc: "Trang và đối tác quốc tế thảo luận về điều khoản thanh toán.",
      lines: [
        { id: "d1-1", speaker: "Partner", text: "We are happy with the project proposal. However, we need to negotiate the payment terms.", translation: "Chúng tôi hài lòng với bản đề xuất dự án. Tuy nhiên, chúng tôi cần đàm phán các điều khoản thanh toán." },
        { id: "d1-2", speaker: "Trang", text: "As long as you agree to sign a two-year contract, we can offer a ten percent discount.", translation: "Miễn là ông đồng ý ký hợp đồng hai năm, chúng tôi có thể đề xuất mức giảm giá mười phần trăm." },
        { id: "d1-3", speaker: "Partner", text: "That sounds reasonable, provided that the discount clause is clearly written in the agreement.", translation: "Nghe có vẻ hợp lý, với điều kiện là điều khoản giảm giá đó được viết rõ ràng trong thỏa thuận." },
        { id: "d1-4", speaker: "Trang", text: "Certainly. We will also include a provision for conflict resolution. We want to avoid any legal disputes.", translation: "Chắc chắn rồi. Chúng tôi cũng sẽ đưa vào một điều khoản quy định về giải quyết xung đột. Chúng tôi muốn tránh bất kỳ tranh chấp pháp lý nào." },
        { id: "d1-5", speaker: "Partner", text: "Excellent. Unless there is a penalty for early termination, I think we are ready to sign.", translation: "Xuất sắc. Trừ khi có khoản phạt cho việc chấm dứt hợp đồng sớm, tôi nghĩ chúng ta đã sẵn sàng ký kết." },
        { id: "d1-6", speaker: "Trang", text: "There is a standard penalty, but it is minor. If we had not agreed on this, we would not be in compliance with corporate policy.", translation: "Có một khoản phạt tiêu chuẩn, nhưng nó rất nhỏ. Nếu chúng ta không đồng ý về điểm này, chúng ta đã không tuân thủ đúng chính sách của tập đoàn." },
      ],
    },
    {
      id: 2,
      title: "Rắc rối sau khi chấm dứt hợp đồng",
      audio: "/audio/unit-35/dialogue_2.mp3",
      desc: "Huy giải thích cho sếp về tranh chấp pháp lý hiện tại.",
      lines: [
        { id: "d2-1", speaker: "Manager", text: "Why is the partner threatening a legal dispute? Did we terminate the contract early?", translation: "Tại sao đối tác lại đe dọa tranh chấp pháp lý? Có phải chúng ta đã chấm dứt hợp đồng sớm không?" },
        { id: "d2-2", speaker: "Huy", text: "Yes. If we had not terminated it last month, we would not face this lawsuit now. But they failed to ensure compliance with our environmental standards.", translation: "Vâng. Nếu chúng ta không chấm dứt nó tháng trước, chúng ta đã không đối mặt với vụ kiện này bây giờ. Nhưng họ đã không đảm bảo sự tuân thủ các tiêu chuẩn môi trường của chúng ta." },
        { id: "d2-3", speaker: "Manager", text: "We will win, provided that we have documented all their violations.", translation: "Chúng ta sẽ thắng, miễn là chúng ta đã ghi lại toàn bộ vi phạm của họ." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "As long as you agree to sign, we can offer a discount.", options: ["We will offer a discount even if you don't sign.", "As long as you agree to sign, we can offer a discount.", "Unless you agree to sign, we will offer a discount.", "We offered a discount after you signed."], answer: "As long as you agree to sign, we can offer a discount." },
    { id: "lac2", audio_text: "We will not sign the contract unless you clarify this clause.", options: ["We will sign the contract and clarify this clause.", "We will not sign the contract unless you clarify this clause.", "We signed the contract before you clarified the clause.", "Unless we sign, you cannot clarify the contract."], answer: "We will not sign the contract unless you clarify this clause." },
    { id: "lac3", audio_text: "If we had signed yesterday, we would be in compliance today.", options: ["We signed yesterday and we are in compliance today.", "If we had signed yesterday, we would be in compliance today.", "We will sign yesterday to be in compliance tomorrow.", "If we signed yesterday, we would have been in compliance today."], answer: "If we had signed yesterday, we would be in compliance today." },
    { id: "lac4", audio_text: "There is a penalty clause for late delivery.", options: ["There is a penalty clause for late delivery.", "There is no penalty for late delivery.", "We received a bonus because of late delivery.", "They will terminate the contract if we deliver early."], answer: "There is a penalty clause for late delivery." },
    { id: "lac5", audio_text: "We will win, provided that we have documented all violations.", options: ["We will win even if we don't have documents.", "We lost because we didn't have documents.", "We will win, provided that we have documented all violations.", "Providing documents will help us terminate the lawsuit."], answer: "We will win, provided that we have documented all violations." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "We will not sign the {input} unless you clarify the {input} regarding the {input}.",
    level1Placeholder: "Ví dụ: contract — clause — penalty...",
    level2Situation: "Bạn là một chuyên viên pháp lý đang đàm phán hợp đồng. Hãy: (1) Nói rằng bạn sẵn sàng tiếp tục hợp tác miễn là đối tác đảm bảo sự tuân thủ các tiêu chuẩn, (2) Giải thích rằng nếu họ không vi phạm điều khoản trong quá khứ thì bây giờ hai bên không có tranh chấp, (3) Nhấn mạnh điều khoản chấm dứt hợp đồng.",
    level2Hint: "We will continue our agreement as long as you ensure compliance with our terms. If you had not violated the quality clause last year, we would not face a dispute now. Otherwise, we will be forced to terminate the contract and apply the penalty provision.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Mixed Conditionals & Alternatives to IF — Câu Điều Kiện Hỗn Hợp",
    rule: "1. Mixed Conditionals (Câu điều kiện hỗn hợp):\nKết hợp quá khứ và hiện tại để nói về giả định quá khứ ảnh hưởng đến hiện tại.\n- Loại hỗn hợp phổ biến nhất: Giả định quá khứ dẫn đến kết quả hiện tại.\n  Cấu trúc: If + S + had + Past Participle (loại 3), S + would + Verb-infinitive (loại 2)\n  → 'If we had signed the contract yesterday, we would be happy today.' (Thực tế: hôm qua không ký, hôm nay không vui).\n\n2. Alternatives to IF (Liên từ điều kiện thay thế If):\n- unless = if... not (trừ khi): 'We won't pay unless they deliver.'\n- provided that / providing that / as long as = only if (miễn là / với điều kiện là): 'We will sign as long as the price is fixed.'\n- even if (ngay cả khi - kết quả không đổi): 'Even if it rains, the event will continue.'",
    examples: [
      { en: "If she had accepted the job last month, she would be living in London now. (Past action -> Present result)", vn: "Nếu cô ấy nhận công việc tháng trước, giờ cô ấy đang sống ở London rồi." },
      { en: "Provided that we reach an agreement, we will start next week. (Condition for starting)", vn: "Miễn là chúng ta đạt được thỏa thuận, chúng ta sẽ bắt đầu vào tuần tới." },
      { en: "Unless they pay the penalty, we will terminate the contract. (If they don't pay, we will terminate)", vn: "Trừ khi họ trả tiền phạt, chúng tôi sẽ chấm dứt hợp đồng." },
    ],
    tip: "Trong bài thi TOEIC Part 5, sau các liên từ như 'provided that', 'as long as', 'unless', mệnh đề điều kiện luôn chia ở thì hiện tại đơn để diễn tả tương lai. Ví dụ: 'unless he agrees' chứ không dùng 'unless he will agree'.",
    vnNote: "⚠️ Người Việt hay dịch 'unless' là 'nếu không' nên đôi khi nhầm lẫn cách đặt thể phủ định. Ghi nhớ: Bản thân 'unless' đã mang ý phủ định, nên vế sau 'unless' luôn chia ở thể khẳng định. Ví dụ: 'unless you agree' = 'if you don't agree'.",
    dialogueExample: {
      speaker: "Huy",
      text: "If we had not terminated it last month, we would not face this lawsuit now.",
      translation: "Nếu chúng ta không chấm dứt nó tháng trước, chúng ta đã không đối mặt với vụ kiện này bây giờ.",
      highlight: "If we had not terminated (Past Perfect) | we would not face (would + nguyên thể) — điều kiện hỗn hợp điển hình",
    },
    ccq: {
      question: "Câu nào đồng nghĩa với: 'We will sign the agreement if they reduce the price.'?",
      options: [
        "We will sign the agreement unless they reduce the price.",
        "We will sign the agreement as long as they reduce the price.",
        "We will sign the agreement even if they reduce the price.",
        "We will sign the agreement unless they don't reduce the price.",
      ],
      answer: "We will sign the agreement as long as they reduce the price.",
      explanation: "'As long as' = 'miễn là / chỉ khi', diễn đạt điều kiện tương đương với từ 'if'. 'Unless' mang nghĩa ngược lại ('trừ khi').",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn liên từ thích hợp: 'We will not sign the contract ___ they agree to our terms.'", options: ["provided that", "as long as", "unless", "even if"], answer: "unless" },
    { id: "pq2", type: "multiple-choice", question: "Chọn dạng đúng của điều kiện hỗn hợp: 'If we ___ the contract last year, we would be in a better position now.'", options: ["signed", "had signed", "would have signed", "have signed"], answer: "had signed" },
    { id: "pq3", type: "cloze", question: "Điền liên từ (2 từ): 'You can use the car ___ (miễn là) you pay for the gas.'", answer: "as long as" },
    { id: "pq4", type: "multiple-choice", question: "Điền từ: 'The legal team is working to resolve the contract ___.'", options: ["compliance", "dispute", "guarantee", "provision"], answer: "dispute" },
    { id: "pq5", type: "cloze", question: "Điền dạng đúng của động từ: 'If he had not taken that risk, he ___ (be) rich today.'", answer: "would be" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng đàm phán hợp đồng với nghĩa đúng",
    pairs: [
      { left: "terminate", right: "chấm dứt hợp đồng" },
      { left: "compliance", right: "sự tuân thủ quy định" },
      { left: "dispute", right: "tranh chấp / bất đồng" },
      { left: "clause", right: "điều khoản" },
      { left: "negotiate", right: "đàm phán" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Chúng tôi sẽ chấm dứt thỏa thuận trừ khi họ sửa lỗi.",
      answer: "We will terminate the agreement unless they rectify the error.",
    },
    {
      id: "pt-2",
      prompt_vn: "Nếu không có điều khoản đó, chúng tôi sẽ không đồng ý.",
      answer: "Without that clause, we would not have agreed.",
    },
    {
      id: "pt-3",
      prompt_vn: "Họ đàm phán điều khoản mới sau khi ký.",
      answer: "They negotiated new terms after signing.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc35-1",
      sentence: "Unless you won't study, you will fail the test.",
      errorWord: "won't study",
      correction: "study",
      explanation_vn: "'Unless = if...not' — không thêm 'not/won't' sau 'unless'. 'Unless you STUDY' = 'if you don't study'.",
    },
    {
      id: "sc35-2",
      sentence: "As long as you will try, you can succeed.",
      errorWord: "will try",
      correction: "try",
      explanation_vn: "Trong mệnh đề điều kiện (as long as/unless/if), dùng Present Simple: 'as long as you TRY'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la35-1",
      audio_text: "Unless you study you will fail the exam.",
      prompt_vn: "Trừ khi bạn học bạn sẽ trượt kỳ thi.",
      words: ["Unless", "you", "study", "you", "will", "fail", "the", "exam", ".", "won't study", "don't"],
      answer: "Unless you study you will fail the exam .",
    },
    {
      id: "la35-2",
      audio_text: "As long as you keep trying you can improve.",
      prompt_vn: "Miễn là bạn tiếp tục cố gắng bạn sẽ tiến bộ.",
      words: ["As", "long", "as", "you", "keep", "trying", "you", "can", "improve", ".", "will", "tries"],
      answer: "As long as you keep trying you can improve .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Chúng tôi sẽ không ký hợp đồng trừ khi họ giảm phạt.",
      words: ["We", "will", "not", "sign", "the", "contract", "unless", "they", "reduce", "the", "penalty", ".", "might", "should"],
      answer: "We will not sign the contract unless they reduce the penalty .",
    },
    {
      id: "wb2",
      prompt_vn: "Miễn là bạn tuân thủ luật pháp, bạn sẽ an toàn.",
      words: ["As", "long", "as", "you", "are", "in", "compliance", "with", "the", "law", ",", "you", "will", "be", "safe", ".", "might", "should"],
      answer: "As long as you are in compliance with the law , you will be safe .",
    },
    {
      id: "wb3",
      prompt_vn: "Nếu tôi đã nhận công việc đó, giờ tôi đang ở Luân Đôn.",
      words: ["If", "I", "had", "taken", "that", "job", ",", "I", "would", "be", "in", "London", "now", ".", "might", "should"],
      answer: "If I had taken that job , I would be in London now .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s35-1", prompt_vn: "Chúng tôi sẽ không ký hợp đồng trừ khi họ giảm phạt.", words: ["We", "will", "not", "sign", "the", "contract", "unless", "they", "reduce", "the", "penalty", "."], answer: "We will not sign the contract unless they reduce the penalty ." },
    { id: "s35-2", prompt_vn: "Miễn là bạn tuân thủ luật pháp, bạn sẽ an toàn.", words: ["As", "long", "as", "you", "are", "in", "compliance", "with", "the", "law", ",", "you", "will", "be", "safe", "."], answer: "As long as you are in compliance with the law , you will be safe ." },
    { id: "s35-3", prompt_vn: "Nếu tôi đã nhận công việc đó, giờ tôi đang ở Luân Đôn.", words: ["If", "I", "had", "taken", "that", "job", ",", "I", "would", "be", "in", "London", "now", "."], answer: "If I had taken that job , I would be in London now ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Điền từ: '___ you deliver the product on time, we will make the payment.'", options: ["Unless", "Provided that", "Even if", "Although"], answer: "Provided that" },
    { id: "fq2", type: "cloze", question: "Điền từ: 'The company faced a heavy ___ (khoản phạt) for environmental violations.'", answer: "penalty" },
    { id: "fq3", type: "multiple-choice", question: "Chọn dạng đúng của điều kiện hỗn hợp: 'If she had studied law, she ___ a corporate lawyer now.'", options: ["is", "would be", "would have been", "will be"], answer: "would be" },
    { id: "fq4", type: "translate", question: "Dịch: 'Chúng tôi sẽ chấm dứt thỏa thuận trừ khi họ sửa lỗi.'", answer: "We will terminate the agreement unless they rectify the error." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào đồng nghĩa với 'written requirement/section'?", options: ["dispute", "clause", "penalty", "negotiation"], answer: "clause" },
    { id: "q-ex1", type: "multiple-choice", question: "Mixed conditional kết hợp điều kiện QK với kết quả:", options: ["QK + HT", "HT + QK", "QK + TL", "HT + TL"], answer: "QK + HT" },
    { id: "q-ex2", type: "multiple-choice", question: "Mixed conditional đúng:", options: ["If I had saved money, I would be rich now.", "If I saved money, I would have been rich.", "If I had saved money, I was rich now.", "If I save money, I would be rich now."], answer: "If I had saved money, I would be rich now." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'If I were taller, I ___ become a basketball player.' (QK+HT)", answer: "could have" },
    { id: "q-ex4", type: "multiple-choice", question: "'Unless' trong advanced conditional = 'if not': câu đúng:", options: ["Unless you study, you will fail.", "Unless you study, you would fail.", "Unless you don't study, you will fail.", "Unless you studied, you will fail."], answer: "Unless you study, you will fail." },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Nếu tôi không lười hồi nhỏ, tôi sẽ giỏi tiếng Anh rồi.'", answer: "If I hadn't been lazy as a child, I would be fluent in English now." },
    { id: "q-ex6", type: "multiple-choice", question: "Đảo ngữ điều kiện (inversion): 'Had I known...' = :", options: ["If I know...", "If I had known...", "If I knew...", "If I would know..."], answer: "If I had known..." },
    { id: "q-ex7", type: "multiple-choice", question: "'Were it not for your help...' là dạng:", options: ["First conditional", "Second conditional đảo ngữ", "Third conditional", "Zero conditional"], answer: "Second conditional đảo ngữ" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr35-1", question: "Ôn tập Unit 34 — Điền: 'If we had investigated the risk, we ___ (prevent) the delay.'", options: ["would prevent", "would have prevented", "had prevented", "prevented"], answer: "would have prevented", type: "multiple-choice" },
    { id: "cr35-2", question: "Ôn tập Unit 33 — Điền: 'If I ___ (be) you, I would invest in this venture.'", options: [], answer: "were", type: "cloze" },
    { id: "cr35-3", question: "Ôn tập Unit 32 — Điền: 'By next December, she ___ (graduate) from university.'", options: ["will have graduated", "graduated", "has graduated", "will graduate"], answer: "will have graduated", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "inversion stress",
    description: "Đảo ngữ nhấn mạnh — Had I known... — stress thay đổi hoàn toàn",
    examples: [
        { word: "Had I known", ipa: "/hæd aɪ nəʊn/", tip: "Đảo ngữ: HAD I known... — had đứng đầu được nhấn hơn" },
        { word: "Never have I", ipa: "/ˈnɛvər hæv aɪ/", tip: "NEVER have I seen... — never nhấn rất mạnh" },
    ],
    minimalPairs: [
        ["Had I known (đảo ngữ)", "If I had known (thường)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "Provided that you deliver on time", vn: "Với điều kiện là bạn giao đúng hạn" },
      { en: "We will not sign unless they agree", vn: "Chúng tôi sẽ không ký trừ khi họ đồng ý" },
      { en: "We reached a verbal agreement", vn: "Chúng tôi đã đạt được thỏa thuận miệng" },
      { en: "We must ensure compliance with laws", vn: "Chúng ta phải đảm bảo tuân thủ pháp luật" },
      { en: "They want to negotiate the terms", vn: "Họ muốn đàm phán các điều khoản" },
      { en: "There is an early termination penalty", vn: "Có hình phạt chấm dứt hợp đồng sớm" },
      { en: "How did they resolve the dispute?", vn: "Họ đã giải quyết tranh chấp thế nào?" },
      { en: "If we had signed, we would be safe", vn: "Nếu chúng ta đã ký, giờ ta đã an toàn" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit35-reading-1",
    title: "Real and Unreal: Conditionals in Context",
    title_vn: "Đọc đoạn về mixed conditionals trong ngữ cảnh thực",
    level: "B2" as const,
    text:
      "Advanced conditional structures allow us to express nuanced ideas about cause and effect. " +
      "A mixed conditional combines different time frames to link past actions with present consequences. " +
      "For example: 'If I had taken the marketing job last year, I would be managing a team now.' " +
      "This suggests a past decision is affecting the current situation. " +
      "Another common pattern links present states to past consequences: " +
      "'If she weren't so ambitious, she wouldn't have applied for the director position.' " +
      "In business writing, conditional structures add sophistication and precision. " +
      "Compare these two sentences: 'We should expand.' " +
      "Versus: 'If we were to expand into new markets, provided that demand remains strong, " +
      "we would potentially see a 30% increase in revenue within two years.' " +
      "The second sentence is far more professional and analytical. " +
      "Mastering conditionals elevates your English to a truly advanced level.",
    questions: [
      {
        id: "u35r-q1",
        question_vn: "Mixed conditional kết hợp điều gì?",
        options: [
          "Two present tenses",
          "Two past tenses",
          "Different time frames",
          "Two future possibilities",
        ],
        answer: "Different time frames",
        explanation_vn: "'A mixed conditional combines different time frames to link past actions with present consequences.'",
      },
      {
        id: "u35r-q2",
        question_vn: "Câu ví dụ trong đoạn văn nói về điều gì?",
        options: [
          "A past decision affecting the current situation",
          "A future plan for a new job",
          "A current job that was always planned",
          "A regret about not taking a job",
        ],
        answer: "A past decision affecting the current situation",
        explanation_vn: "'This suggests a past decision is affecting the current situation.'",
      },
      {
        id: "u35r-q3",
        question_vn: "Theo đoạn văn, câu điều kiện mang lại điều gì cho văn phong kinh doanh?",
        options: [
          "Shorter sentences",
          "Simpler grammar",
          "Sophistication and precision",
          "More informal tone",
        ],
        answer: "Sophistication and precision",
        explanation_vn: "'In business writing, conditional structures add sophistication and precision.'",
      },
      {
        id: "u35r-q4",
        question_vn: "Điều kiện gì được đề cập để đạt mức tăng doanh thu 30%?",
        options: [
          "Hiring more staff",
          "Reducing costs",
          "Provided that demand remains strong",
          "Opening new offices",
        ],
        answer: "Provided that demand remains strong",
        explanation_vn: "'provided that demand remains strong, we would potentially see a 30% increase in revenue.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "BJ8ROBuL4LM",

  // jobScenarios for world-class VN adult career content (TASK-153)
  jobScenarios: [
    { id: 1, title: "Professional presentation", focus: "B2 work skills", context: "office report", l1Note: "⚠️ 'In compliance with' chuẩn, không 'in compliance to'. Người VN hay nhầm giới từ.", example: "We are in full compliance with the new regulations." },
    { id: 2, title: "Contract negotiation", focus: "conditionals in business", context: "deal with foreign partner", l1Note: "⚠️ Mixed conditionals: past perfect in if-clause for unreal past affecting present.", example: "If we had included the penalty clause, we would be protected now." },
  ],
};

export default unit35;
