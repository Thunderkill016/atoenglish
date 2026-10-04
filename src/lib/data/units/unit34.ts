import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-34 — Past Regrets & What-ifs  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit34: UnitData = {
  unitId: "unit-34",
  title: "Unit 34: Past Regrets & What-ifs",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Third Conditional — Câu điều kiện loại 3. Diễn đạt sự hối tiếc về quá khứ, phân tích nguyên nhân sai lầm và rút ra bài học kinh nghiệm sau dự án. Cấu trúc ngữ pháp cực kỳ quan trọng cho IELTS Writing Task 2.",
  badgeName: "Nhà Đánh Giá",
  badgeEmoji: "🔍",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Cuộc họp rút kinh nghiệm (Post-mortem Meeting) sau khi dự án ra mắt sản phẩm bị trễ 2 tuần. Cả đội cùng phân tích xem những lỗi nào đã bị bỏ sót (overlooked) và thảo luận: 'Nếu chúng ta làm khác đi trong quá khứ thì kết quả đã thế nào?'.",
  learningOutcomes: [
    "Sử dụng thành thạo câu điều kiện loại 3 (Third Conditional) để nói về quá khứ giả định",
    "Phân tích lỗi sai, sự cố dự án và đề xuất cách khắc phục (rectify) một cách chuyên nghiệp",
    "Thể hiện sự hối tiếc và tự kiểm điểm (reflection) bằng tiếng Anh doanh nghiệp",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong văn hóa làm việc phương Tây, các buổi họp rút kinh nghiệm không nhằm mục đích đổ lỗi (<span class="text-zinc-400">blame</span>) mà tập trung vào phân tích khách quan (<span class="text-emerald-400">analysis</span>). Khi thảo luận về sai lầm của đồng nghiệp, hãy dùng câu điều kiện loại 3 dạng bị động như <span class="text-emerald-400">"If the error had been detected earlier, we would have prevented the delay"</span> để tránh chỉ trích cá nhân.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🤦", en: "If we had double-checked the data, we would have avoided the error.", vn: "Nếu chúng ta kiểm tra kỹ dữ liệu, chúng ta đã tránh được lỗi sai.", context: "If we had + PP, we would have + PP" },
    { emoji: "🔍", en: "If they had investigated the issue, they would have foreseen the risk.", vn: "Nếu họ tìm hiểu kỹ vấn đề, họ đã thấy trước được rủi ro.", context: "had investigated ... would have foreseen" },
    { emoji: "🛠️", en: "We could have rectified the complication if you had informed us.", vn: "Chúng tôi đã có thể khắc phục rắc rối nếu bạn thông báo cho chúng tôi.", context: "could have rectified if you had informed" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "regret", emoji: "😢", phonetic: "/rɪˈɡret/", meaning: "sự hối tiếc / hối tiếc", example: "I deeply regret not attending the training session last month.", example2: "My greatest regret is that we didn't launch the project earlier.", collocation: "express regret / deep regret / feel regret", audio: "/audio/unit-34/regret.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "reflection", emoji: "🧘", phonetic: "/rɪˈflekʃən/", meaning: "sự suy ngẫm / phản chiếu", example: "Upon reflection, I realize we made several wrong decisions.", example2: "The report is a clear reflection of our team's effort.", collocation: "upon reflection / self-reflection / written reflection", audio: "/audio/unit-34/reflection.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'reflection' trong câu trang trọng." },
    { id: 3, word: "evaluation", emoji: "📊", phonetic: "/ɪˌvæljuˈeɪʃən/", meaning: "sự đánh giá / nhận định", example: "The company conducted a thorough evaluation of the campaign.", example2: "Performance evaluation is done at the end of each year.", collocation: "project evaluation / performance evaluation / final evaluation", audio: "/audio/unit-34/evaluation.mp3", l1_interference_vn: "⚠️ 'evaluation' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 4, word: "overlook", emoji: "🙈", phonetic: "/ˌəʊvəˈlʊk/", meaning: "bỏ sót / bỏ qua (lỗi)", example: "We cannot afford to overlook even the smallest error.", example2: "The manager overlooked her lateness because she worked hard.", collocation: "overlook a mistake / overlook an error / completely overlook", audio: "/audio/unit-34/overlook.mp3", l1_interference_vn: "⚠️ Phát âm cuối âm tiết của 'overlook' rõ (/s/, /t/, /d/) — IELTS speaking." },
    { id: 5, word: "foresee", emoji: "🔮", phonetic: "/fɔːˈsiː/", meaning: "nhìn thấy trước / dự đoán trước", example: "No one could foresee the economic crisis at that time.", example2: "If we had foreseen the delay, we would have changed the plan.", collocation: "foresee the future / foresee risks / foresee problems", audio: "/audio/unit-34/foresee.mp3", l1_interference_vn: "⚠️ 'foresee' là danh từ không đếm được hoặc đếm được — không thêm 's' sai ngữ cảnh." },
    { id: 6, word: "investigate", emoji: "🕵️", phonetic: "/ɪnˈvestɪɡeɪt/", meaning: "điều tra / tìm hiểu kỹ", example: "The IT team is investigating the server crash.", example2: "We must investigate the cause of the customer complaints.", collocation: "investigate the cause / thoroughly investigate / investigate the issue", audio: "/audio/unit-34/investigate.mp3", l1_interference_vn: "⚠️ \'Investigate\' + N trực tiếp: \'investigate the case\'. \'Under investigation\' = đang bị điều tra." },
    { id: 7, word: "complication", emoji: "🌀", phonetic: "/ˌkɒmplɪˈkeɪʃən/", meaning: "sự rắc rối / phức tạp / biến chứng", example: "The project faced several complications during the testing phase.", example2: "We resolved the technical complications quickly.", collocation: "unexpected complication / cause complications / face complications", audio: "/audio/unit-34/complication.mp3", l1_interference_vn: "⚠️ Third conditional: 'If we had..., we could have rectified the complication'. VN hay quên 'had' + V3 hoặc dùng present. Lùi 2 thì quá khứ." },
    { id: 8, word: "rectify", emoji: "🔧", phonetic: "/ˈrektɪfaɪ/", meaning: "khắc phục / sửa chữa (sai lầm)", example: "We must take immediate action to rectify this situation.", example2: "The error was rectified before the product launch.", collocation: "rectify a mistake / rectify the situation / rectify an error", audio: "/audio/unit-34/rectify.mp3", l1_interference_vn: "⚠️ 'Rectify' trang trọng hơn 'fix'. VN hay 'correct the complication' . Third cond dùng 'could/would have rectified'." },
    { id: 9, word: "prevent", emoji: "🛑", phonetic: "/prɪˈvent/", meaning: "ngăn chặn / phòng ngừa", example: "Security measures were implemented to prevent data theft.", example2: "Nothing could prevent him from achieving his goals.", collocation: "prevent a problem / prevent damage / prevent from doing", audio: "/audio/unit-34/prevent.mp3", l1_interference_vn: "⚠️ 'Prevent someone from doing' — VN hay quên 'from' hoặc dùng 'to'. 'Prevent + N + from + Ving'." },
    { id: 10, word: "fault", emoji: "⚠️", phonetic: "/fɔːlt/", meaning: "lỗi / trách nhiệm sai sót", example: "It was not my fault that the shipment was delayed.", example2: "The system crash was due to a technical fault.", collocation: "technical fault / find fault / it's my fault", audio: "/audio/unit-34/fault.mp3", l1_interference_vn: "⚠️ 'It was not my fault' (không phải lỗi của tôi). VN hay 'It's not fault me'. Cấu trúc 'It is/was not + possessive + fault'." },
    { id: 11, word: "analysis", emoji: "📈", phonetic: "/əˈnæləsɪs/", meaning: "sự phân tích", example: "A detailed analysis of the market is required.", example2: "The team conducted a risk analysis before investing.", collocation: "data analysis / market analysis / conduct an analysis", audio: "/audio/unit-34/analysis.mp3", l1_interference_vn: "⚠️ 'Analysis' số ít (analyses số nhiều). VN hay 'an analyses' sai. Third cond ví dụ: 'If we had done the analysis, ...' ." },
    { id: 12, word: "error", emoji: "❌", phonetic: "/ˈerər/", meaning: "sai sót / lỗi kỹ thuật", example: "The system displayed a system error code.", example2: "An error occurred during the file transfer.", collocation: "system error / human error / avoid errors", audio: "/audio/unit-34/error.mp3", l1_interference_vn: "⚠️ 'Human error' vs 'technical fault'. VN hay lẫn 'error' với 'mistake' — 'error' dùng cho hệ thống, 'mistake' cá nhân." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Họp rút kinh nghiệm dự án chậm trễ",
      audio: "/audio/unit-34/dialogue_1.mp3",
      desc: "Linh và Huy phân tích nguyên nhân dự án giao hàng trễ hạn chót.",
      lines: [
        { id: "d1-1", speaker: "Linh", text: "The client is unhappy about the delay. We need to conduct a thorough analysis of what went wrong.", translation: "Khách hàng không hài lòng về sự chậm trễ. Chúng ta cần tiến hành một phân tích kỹ lưỡng về những gì đã sai." },
        { id: "d1-2", speaker: "Huy", text: "I agree. If we had investigated the database issue in January, we would have prevented the server crash.", translation: "Tôi đồng ý. Nếu chúng ta tìm hiểu kỹ vấn đề cơ sở dữ liệu vào tháng Một, chúng ta đã ngăn chặn được việc sập máy chủ." },
        { id: "d1-3", speaker: "Linh", text: "Yes, we also overlooked a major security error. If we had hired a tester, that mistake would have been detected.", translation: "Đúng vậy, chúng ta cũng đã bỏ sót một lỗi bảo mật lớn. Nếu chúng ta thuê một kiểm thử viên, sai lầm đó đã được phát hiện." },
        { id: "d1-4", speaker: "Huy", text: "It is my fault for not requesting more resources. I should have foreseen these complications.", translation: "Đó là lỗi của tôi vì đã không yêu cầu thêm nguồn lực. Đáng lẽ tôi phải nhìn thấy trước những rắc rối phức tạp này." },
        { id: "d1-5", speaker: "Linh", text: "Let's not dwell on regrets. We have rectified the situation now, and we've learned a valuable lesson.", translation: "Chúng ta đừng chìm đắm trong hối tiếc. Chúng ta đã khắc phục tình hình bây giờ, và chúng ta đã học được một bài học quý giá." },
      ],
    },
    {
      id: 2,
      title: "Nhìn lại chiến dịch marketing thất bại",
      audio: "/audio/unit-34/dialogue_2.mp3",
      desc: "Trọng và Emma trao đổi về bài học marketing.",
      lines: [
        { id: "d2-1", speaker: "Trong", text: "Upon reflection, if we had spent more budget on social media, the campaign would have been successful.", translation: "Sau khi suy ngẫm, nếu chúng ta chi nhiều ngân sách hơn cho mạng xã hội, chiến dịch đã thành công." },
        { id: "d2-2", speaker: "Emma", text: "Maybe, but our initial evaluation was wrong. We overlooked our competitor's new launch.", translation: "Có thể, nhưng đánh giá ban đầu của chúng ta đã sai. Chúng ta đã bỏ sót lần ra mắt mới của đối thủ cạnh tranh." },
        { id: "d2-3", speaker: "Trong", text: "If we had monitored them closely, we could have changed our strategy in time.", translation: "Nếu chúng ta theo dõi họ chặt chẽ, chúng ta đã có thể thay đổi chiến lược kịp thời." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "If we had double-checked the data, we would have avoided the error.", options: ["If we double-check the data, we avoid the error.", "If we had double-checked the data, we would have avoided the error.", "If we checked the data, we would avoid the error.", "We avoided the error because we checked the data."], answer: "If we had double-checked the data, we would have avoided the error." },
    { id: "lac2", audio_text: "If we had foreseen the delay, we would have changed the plan.", options: ["If we foresee the delay, we will change the plan.", "If we had foreseen the delay, we would have changed the plan.", "If we had foreseen the delay, we would change the plan.", "We changed the plan because we foresaw the delay."], answer: "If we had foreseen the delay, we would have changed the plan." },
    { id: "lac3", audio_text: "It was not my fault that the shipment was delayed.", options: ["It was not my fault that the shipment was delayed.", "It was my fault that the shipment was delayed.", "The shipment was not delayed yesterday.", "I apologized for delaying the shipment."], answer: "It was not my fault that the shipment was delayed." },
    { id: "lac4", audio_text: "The error was rectified before the product launch.", options: ["We made a new error during the product launch.", "The error was overlooked after the product launch.", "The error was rectified before the product launch.", "We did not rectify any errors last week."], answer: "The error was rectified before the product launch." },
    { id: "lac5", audio_text: "Upon reflection, I realize we made several wrong decisions.", options: ["Upon reflection, I realize we made several wrong decisions.", "I think we made all correct decisions.", "We will reflect on our decisions tomorrow.", "Reflecting is not necessary for this project."], answer: "Upon reflection, I realize we made several wrong decisions." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "If we had {input} the issue earlier, we would have {input} the project {input}.",
    level1Placeholder: "Ví dụ: investigated — prevented — delay...",
    level2Situation: "Bạn thuyết trình đánh giá hiệu quả dự án cuối năm. Đóng vai trưởng nhóm thảo luận về sự cố máy chủ: (1) Nói rằng nếu đội ngũ IT phát hiện lỗi sớm hơn, sự cố đã không xảy ra, (2) Nhận lỗi vì đã bỏ sót khâu kiểm tra, (3) Nêu giải pháp đã khắc phục.",
    level2Hint: "If the IT team had detected the system error earlier, the server crash would have been prevented. It was our fault for overlooking the security check. Fortunately, we have rectified the situation now through detailed analysis.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Third Conditional — Câu Điều Kiện Loại 3 (Giả Định Quá Khứ)",
    rule: "Câu điều kiện loại 3 dùng để giả định một tình huống trái ngược với thực tế đã xảy ra trong quá khứ. Thường dùng để thể hiện sự hối tiếc hoặc phân tích bài học kinh nghiệm.\n\nCấu trúc:\nIf + S + had + Past Participle (Quá khứ hoàn thành), S + would / could / might + have + Past Participle\n\nVí dụ:\n- 'If I had studied harder, I would have passed the exam.' (Thực tế trong quá khứ: Tôi không học chăm chỉ và tôi đã trượt)\n- 'If we had launched earlier, we could have captured the market.'",
    examples: [
      { en: "If we had investigated the risk, we would have prevented the delay. (We didn't investigate, so delay happened)", vn: "Nếu chúng ta tìm hiểu rủi ro, chúng ta đã ngăn chặn được sự chậm trễ." },
      { en: "She might have passed the evaluation if she had prepared better. (She didn't prepare well)", vn: "Cô ấy có thể đã vượt qua đánh giá nếu cô ấy chuẩn bị tốt hơn." },
      { en: "If they had not overlooked the error, the system wouldn't have crashed. (They overlooked it)", vn: "Nếu họ không bỏ sót lỗi đó, hệ thống đã không bị sập." },
    ],
    tip: "Trong văn phong nói, cụm 'would have' thường được phát âm lướt nhanh thành 'would've' (/ˈwʊdəv/) hoặc thậm chí nghe giống như 'would of'. Trong bài thi nghe IELTS, hãy chú ý nghe kỹ âm này để xác định đúng thì quá khứ giả định.",
    vnNote: "⚠️ Người Việt cực kỳ hay nhầm lẫn cách viết và đọc của câu điều kiện loại 3. Hãy nhớ động từ ở cả hai vế đều phải ở dạng Phân từ 2 (V3/V-ed), và luôn luôn có 'had' ở vế If và 'have' ở vế sau. Không dùng 'would had' hay 'if we would have'.",
    dialogueExample: {
      speaker: "Huy",
      text: "If we had investigated the database issue in January, we would have prevented the server crash.",
      translation: "Nếu chúng ta tìm hiểu kỹ vấn đề cơ sở dữ liệu vào tháng Một, chúng ta đã ngăn chặn được việc sập máy chủ.",
      highlight: "had investigated (past perfect) | would have prevented (would have + V3) — đúng cấu trúc loại 3",
    },
    ccq: {
      question: "Câu nào thể hiện một sự hối tiếc về điều ĐÃ XẢY RA trong quá khứ?",
      options: [
        "If we hire a tester, we will avoid errors.",
        "If we hired a tester, we would avoid errors.",
        "If we had hired a tester, we would have avoided errors.",
        "If we had hired a tester, we would avoid errors.",
      ],
      answer: "If we had hired a tester, we would have avoided errors.",
      explanation: "Chỉ có câu điều kiện loại 3 ('had hired' và 'would have avoided') mới diễn tả tình huống giả định trái ngược hoàn toàn với quá khứ thực tế (thực tế chúng ta đã không thuê tester và đã gặp lỗi).",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: 'If you ___ me, I would have helped you rectify the mistake.'", options: ["tell", "told", "had told", "would have told"], answer: "had told" },
    { id: "pq2", type: "multiple-choice", question: "Chọn vế sau đúng: 'If the team had worked together, we ___ the deadline.'", options: ["would meet", "will meet", "would have met", "had met"], answer: "would have met" },
    { id: "pq3", type: "cloze", question: "Điền: 'If they ___ (foresee) the complications, they would have postponed the project.'", answer: "had foreseen" },
    { id: "pq4", type: "multiple-choice", question: "Chọn từ điền: 'Upon ___, I realized we made a serious error.'", options: ["evaluation", "reflection", "fault", "analysis"], answer: "reflection" },
    { id: "pq5", type: "cloze", question: "Điền: 'If the software had been tested, the crash ___ (prevent/bị động) .'", answer: "would have been prevented" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng hối tiếc và đánh giá với nghĩa đúng",
    pairs: [
      { left: "overlook", right: "bỏ sót / bỏ qua" },
      { left: "rectify", right: "khắc phục / sửa chữa" },
      { left: "foresee", right: "nhìn thấy trước" },
      { left: "evaluation", right: "sự đánh giá" },
      { left: "complication", right: "sự rắc rối phức tạp" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Nếu bạn hỏi, tôi đã nói cho bạn biết rồi.",
      answer: "If you had asked, I would have told you.",
    },
    {
      id: "pt-2",
      prompt_vn: "Nếu họ nhìn thấy dấu hiệu, họ đã tránh được sai lầm.",
      answer: "If they had foreseen the sign, they would have avoided the mistake.",
    },
    {
      id: "pt-3",
      prompt_vn: "Tôi hối tiếc đã không đầu tư sớm hơn.",
      answer: "I regret that I had not invested earlier.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc34-1",
      sentence: "If she studied harder she would have passed the exam.",
      errorWord: "studied",
      correction: "had studied",
      explanation_vn: "Third Conditional: 'If + Past Perfect (had studied)'. Không dùng Simple Past trong mệnh đề if của 3rd conditional.",
    },
    {
      id: "sc34-2",
      sentence: "I would of gone if I had known about it.",
      errorWord: "would of gone",
      correction: "would have gone",
      explanation_vn: "'Would HAVE gone' — không bao giờ viết 'would OF'. 'Of' là lỗi phát âm của 'have'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la34-1",
      audio_text: "If she had studied harder she would have passed.",
      prompt_vn: "Nếu cô ấy học chăm hơn cô ấy đã đỗ rồi.",
      words: ["If", "she", "had", "studied", "harder", "she", "would", "have", "passed", ".", "studied", "would of"],
      answer: "If she had studied harder she would have passed .",
    },
    {
      id: "la34-2",
      audio_text: "I would have helped you if I had known.",
      prompt_vn: "Tôi đã giúp bạn nếu tôi biết.",
      words: ["I", "would", "have", "helped", "you", "if", "I", "had", "known", ".", "would of", "knew"],
      answer: "I would have helped you if I had known .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Nếu chúng ta phân tích rủi ro, chúng ta đã tránh được sai lầm.",
      words: ["If", "we", "had", "analyzed", "the", "risks", ",", "we", "would", "have", "avoided", "the", "mistake", ".", "might", "should"],
      answer: "If we had analyzed the risks , we would have avoided the mistake .",
    },
    {
      id: "wb2",
      prompt_vn: "Đó không phải lỗi của tôi khi trang web bị sập.",
      words: ["It", "was", "not", "my", "fault", "that", "the", "website", "crashed", ".", "might", "should"],
      answer: "It was not my fault that the website crashed .",
    },
    {
      id: "wb3",
      prompt_vn: "Chúng tôi đã có thể sửa lỗi đó sớm hơn.",
      words: ["We", "could", "have", "rectified", "that", "error", "much", "earlier", ".", "might", "should"],
      answer: "We could have rectified that error much earlier .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s34-1", prompt_vn: "Nếu chúng ta phân tích rủi ro, chúng ta đã tránh được sai lầm.", words: ["If", "we", "had", "analyzed", "the", "risks", ",", "we", "would", "have", "avoided", "the", "mistake", "."], answer: "If we had analyzed the risks , we would have avoided the mistake ." },
    { id: "s34-2", prompt_vn: "Đó không phải lỗi của tôi khi trang web bị sập.", words: ["It", "was", "not", "my", "fault", "that", "the", "website", "crashed", "."], answer: "It was not my fault that the website crashed ." },
    { id: "s34-3", prompt_vn: "Chúng tôi đã có thể sửa lỗi đó sớm hơn.", words: ["We", "could", "have", "rectified", "that", "error", "much", "earlier", "."], answer: "We could have rectified that error much earlier ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Chọn dạng đúng: 'He might have got the job if he ___ his speaking skills.'", options: ["improved", "had improved", "would improve", "has improved"], answer: "had improved" },
    { id: "fq2", type: "cloze", question: "Điền từ: 'We apologize for the human ___ (sai sót) in this report.'", answer: "error" },
    { id: "fq3", type: "multiple-choice", question: "Chọn từ điền: 'The IT department is ___ the cause of the database failure.'", options: ["overlooking", "investigating", "preventing", "rectifying"], answer: "investigating" },
    { id: "fq4", type: "translate", question: "Dịch: 'Nếu bạn hỏi, tôi đã nói cho bạn biết rồi.'", answer: "If you had asked, I would have told you." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào đồng nghĩa với 'regret' hoặc 'deep thought'?", options: ["analysis", "reflection", "evaluation", "complication"], answer: "reflection" },
    { id: "q-ex1", type: "multiple-choice", question: "Third Conditional dùng cho:", options: ["Tình huống hiện tại giả định", "Điều không thật trong quá khứ và kết quả của nó", "Sự thật chung", "Kế hoạch tương lai"], answer: "Điều không thật trong quá khứ và kết quả của nó" },
    { id: "q-ex2", type: "multiple-choice", question: "Third Conditional đúng:", options: ["If I studied, I would pass.", "If I had studied, I would have passed.", "If I studied, I would have passed.", "If I had studied, I would pass."], answer: "If I had studied, I would have passed." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'I wish I ___ harder last year.'", answer: "had worked" },
    { id: "q-ex4", type: "multiple-choice", question: "'Should have + V3' diễn tả:", options: ["Lời khuyên hiện tại", "Tiếc về điều đã không làm trong quá khứ", "Kế hoạch tương lai", "Điều kiện giả định"], answer: "Tiếc về điều đã không làm trong quá khứ" },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Nếu tôi học chăm hơn, tôi đã đỗ kỳ thi.'", answer: "If I had studied harder, I would have passed the exam." },
    { id: "q-ex6", type: "multiple-choice", question: "'I shouldn't have said that.' nghĩa là:", options: ["Tôi không nên nói điều đó (tương lai)", "Tôi hối tiếc đã nói điều đó", "Tôi sẽ không nói điều đó", "Tôi không biết nói gì"], answer: "Tôi hối tiếc đã nói điều đó" },
    { id: "q-ex7", type: "multiple-choice", question: "'If only I hadn't missed the bus!' — cảm xúc chính:", options: ["Vui mừng", "Tiếc nuối về quá khứ", "Hy vọng tương lai", "Lo lắng"], answer: "Tiếc nuối về quá khứ" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr34-1", question: "Ôn tập Unit 33 — Chọn dạng đúng: 'If I were you, I ___ in that business venture.'", options: ["will invest", "would invest", "invested", "would have invested"], answer: "would invest", type: "multiple-choice" },
    { id: "cr34-2", question: "Ôn tập Unit 32 — Điền: 'By 2030, scientists ___ (develop) sustainable energy.'", options: [], answer: "will have developed", type: "cloze" },
    { id: "cr34-3", question: "Ôn tập Unit 31 — Điền động từ: 'I recommend that he ___ (xác nhận) the scheduled meeting.'", options: ["confirms", "confirm", "confirming", "to confirm"], answer: "confirm", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "had've /hæd.əv/",
    description: "Had have (third conditional) — nối âm phức tạp nhất",
    examples: [
        { word: "had have", ipa: "/hæd həv/", tip: "If I had've known /hæd.əv/ — nối âm rất phổ biến trong spoken English" },
        { word: "should've", ipa: "/ˈʃʊdəv/", tip: "I shouldn't have done it → I shouldn't've done it trong văn nói" },
    ],
    minimalPairs: [
        ["had've known (spoken)", "had have known (formal)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "If we had known, we would have helped", vn: "Nếu chúng tôi biết, chúng tôi đã giúp rồi" },
      { en: "It was not my fault", vn: "Đó không phải lỗi của tôi" },
      { en: "We overlooked a major system error", vn: "Chúng tôi đã bỏ sót một lỗi hệ thống lớn" },
      { en: "We have rectified the situation now", vn: "Chúng tôi đã khắc phục tình hình bây giờ" },
      { en: "No one could foresee the complication", vn: "Không ai có thể thấy trước sự phức tạp đó" },
      { en: "Upon reflection, we made a mistake", vn: "Sau khi suy ngẫm, chúng tôi đã mắc sai lầm" },
      { en: "The IT team is investigating the crash", vn: "Đội IT đang điều tra vụ sập hệ thống" },
      { en: "We conducted a thorough project evaluation", vn: "Chúng tôi đã thực hiện đánh giá dự án kỹ lưỡng" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit34-reading-1",
    title: "Lessons Learned",
    title_vn: "Đọc đoạn về câu điều kiện loại 3 và sự hối tiếc",
    level: "B2" as const,
    text:
      "Looking back, there are several decisions I wish I had made differently. " +
      "If I had studied harder in my first year at university, I would have graduated with honours. " +
      "If I hadn't left my previous job so hastily, I would have received a full year-end bonus. " +
      "However, if I hadn't made those mistakes, I wouldn't have learned such valuable lessons. " +
      "My mentor once told me: 'If you had never failed, you would never have grown.' " +
      "She was right. The biggest mistake I made was not investing in my own development earlier. " +
      "If I had attended that leadership training five years ago, I might have been promoted sooner. " +
      "But regret is only useful if it teaches you something. " +
      "Now, I make sure to say yes to every learning opportunity. " +
      "What would you have done differently if you could go back ten years?",
    questions: [
      {
        id: "u34r-q1",
        question_vn: "Nếu người viết học chăm chỉ hơn ở năm nhất đại học, điều gì đã xảy ra?",
        options: [
          "They would have changed careers",
          "They would have graduated with honours",
          "They would have studied abroad",
          "They would have started a business",
        ],
        answer: "They would have graduated with honours",
        explanation_vn: "'If I had studied harder in my first year at university, I would have graduated with honours.'",
      },
      {
        id: "u34r-q2",
        question_vn: "Người cố vấn (mentor) đã nói gì với người viết?",
        options: [
          "'Always be careful with your decisions.'",
          "'If you had never failed, you would never have grown.'",
          "'Success requires sacrifice.'",
          "'Mistakes are unacceptable in business.'",
        ],
        answer: "'If you had never failed, you would never have grown.'",
        explanation_vn: "'If you had never failed, you would never have grown.'",
      },
      {
        id: "u34r-q3",
        question_vn: "Sai lầm lớn nhất của người viết là gì?",
        options: [
          "Leaving their job too early",
          "Not investing in their own development earlier",
          "Not attending university",
          "Not saving money",
        ],
        answer: "Not investing in their own development earlier",
        explanation_vn: "'The biggest mistake I made was not investing in my own development earlier.'",
      },
      {
        id: "u34r-q4",
        question_vn: "Bây giờ người viết đảm bảo làm điều gì?",
        options: [
          "Avoid all risks",
          "Work longer hours",
          "Say yes to every learning opportunity",
          "Change careers regularly",
        ],
        answer: "Say yes to every learning opportunity",
        explanation_vn: "'Now, I make sure to say yes to every learning opportunity.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Xử lý khiếu nại của khách hàng qua email và gọi điện",
      focus: "Customer service: empathize, apologize, offer solution, follow up",
      context: "Support cho khách hàng B2B hoặc e-commerce",
      l1Note: "⚠️ 'I'm sorry for the inconvenience.' 'To make this right, we can offer a full refund or replacement.' 'I'll follow up in 48h.'",
      example: "Thank you for letting us know. I apologize for the delay. We will ship a replacement today and refund the shipping."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "sTpMgHbL6GU",
};

export default unit34;
