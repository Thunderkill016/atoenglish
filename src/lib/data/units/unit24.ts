import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 24 — How Things Are Made (B1) — Passive Voice for processes
// Pilot redesign per TASK-062: lesson-center-reference.ts (BC ESA / CELTA / Nation / CLT VN) + lesson-blueprint.ts + unit1.ts gold
// ESA: Engage (hook+warmup) → Study (vocab+grammar+ex+dialogue) → Activate (fluency+output) → Review
// CELTA: Lead-in → Clarification (lexis/MF(P) inductive) → Controlled → Freer → Feedback
// Nation: pre-teach vocab 98% coverage before dialogue; fluency = strand 4 automaticity
// VN CLT: tình huống công sở + L1 contrast (ILA/Apollo style) + TOEIC-like distractors
// Blueprint: field order + 10 blocks IPOR; authorGuide: L1 for B1 >=50% (pilot 100%), practiceTranslate>=3, cum>=3, short rule
// Gold: unit1.ts — header block + ── comments + l1_interference_vn ⚠️ + inductive grammar + can-do outcomes
// ─────────────────────────────────────────────────────────────────────────────

export const unit24: UnitData = {
  unitId: "unit-24",
  title: "Unit 24: How Things Are Made",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description:
    "Học Passive Voice để mô tả quy trình và sự kiện mà không cần nhấn mạnh chủ thể — kỹ năng thiết yếu cho báo cáo và thuyết trình kỹ thuật.",
  badgeName: "Kỹ Sư Quy Trình",
  badgeEmoji: "⚙️",

  // ── HOOK (Engage/Lead-in per center-ref): situation cụ thể (công sở) + learningOutcomes can-do CEFR B1 + culturalNote pragmatic VN↔EN
  // Blueprint: situation ≥30c, outcomes 2-5 measurable, culturalNote ≥40c
  situation:
    "Đoàn khách quốc tế đến thăm nhà máy. Giám đốc nhờ bạn giải thích quy trình sản xuất bằng tiếng Anh. Trong kỹ thuật và báo cáo, Passive Voice là chuẩn: 'The components are assembled here. The product is tested before shipping.'",
  learningOutcomes: [
    "Dùng Passive Voice Present Simple (is/are + done) để mô tả quy trình hiện tại",
    "Dùng Passive Past Simple (was/were + done) và Present Perfect Passive (has been + done)",
    "Thuyết trình quy trình sản xuất và kỹ thuật bằng tiếng Anh chuyên nghiệp",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Trong báo cáo kỹ thuật và khoa học bằng tiếng Anh, <span class="text-primary font-semibold">Passive Voice</span> được dùng rất phổ biến vì nó tập trung vào <span class="text-primary font-semibold">QUY TRÌNH</span>, không phải người thực hiện. <span class="text-muted-foreground">"Workers assemble the parts"</span> → <span class="text-primary">"The parts are assembled"</span>. Đây là phong cách viết chuyên nghiệp trong môi trường quốc tế.',

  // ── WARMUP (Engage / activate schemata): ≥3 mẫu câu ngắn — nghe nhắc lại, kích hoạt prior (SRS ôn unit trước)
  // Apollo/CLT style warm-up oral
  warmupGreetings: [
    {
      emoji: "🏭",
      en: "The components are manufactured in our Ho Chi Minh City facility.",
      vn: "Các linh kiện được sản xuất tại cơ sở Thành phố Hồ Chí Minh của chúng tôi.",
      context: "Passive Present — quy trình hiện tại",
    },
    {
      emoji: "🔍",
      en: "Each product is tested three times before it is shipped.",
      vn: "Mỗi sản phẩm được kiểm tra ba lần trước khi vận chuyển.",
      context: "Passive Present — quy trình kiểm soát chất lượng",
    },
    {
      emoji: "✅",
      en: "The new factory was built in 2023 and has been certified by ISO.",
      vn: "Nhà máy mới được xây dựng vào năm 2023 và đã được chứng nhận bởi ISO.",
      context: "Past Passive + Present Perfect Passive",
    },
  ],

  // ── VOCABULARY (Study/Clarification — lexis): pre-teach BEFORE dialogues (Nation 98% coverage)
  // BẮT BUỘC l1_interference_vn (lỗi VN) như ILA correction; pilot 100% for B1 redesign
  // IPA + collocation + example + example2 (A2+); ESA Study / CELTA lexis
  vocab: [
    {
      id: 1,
      word: "manufacture",
      emoji: "🏭",
      phonetic: "/ˌmænjuˈfæktʃər/",
      meaning: "sản xuất",
      example: "The parts are manufactured using automated machinery.",
      example2: "This company manufactures electronic components.",
      collocation:
        "manufacture goods / manufacturing process / mass manufacture",
      audio: "/audio/unit-24/manufacture.mp3",
      l1_interference_vn:
        "⚠️ Passive: 'are manufactured' (be + V3). VN hay quên 'be': 'parts manufacture' ❌ — phải 'The parts ARE manufactured'.",
    },
    {
      id: 2,
      word: "assemble",
      emoji: "🔧",
      phonetic: "/əˈsembəl/",
      meaning: "lắp ráp",
      example: "The devices are assembled by hand in our factory.",
      example2: "All components must be assembled in the correct order.",
      collocation: "assemble a product / assembly line / fully assembled",
      audio: "/audio/unit-24/assemble.mp3",
      l1_interference_vn:
        "⚠️ 'are assembled' (KHÔNG 'assemble themselves' hoặc bỏ be). 'By hand' = thủ công, không 'with hand'.",
    },
    {
      id: 3,
      word: "inspect",
      emoji: "🔍",
      phonetic: "/ɪnˈspekt/",
      meaning: "kiểm tra / thanh tra",
      example: "Every unit is inspected for defects before packaging.",
      example2: "The factory is inspected annually by regulators.",
      collocation:
        "inspect a product / quality inspection / inspect for defects",
      audio: "/audio/unit-24/inspect.mp3",
      l1_interference_vn:
        "⚠️ Passive luôn: 'is inspected' (be+V3). Dùng 'for defects' (không 'about').",
    },
    {
      id: 4,
      word: "distribute",
      emoji: "🚚",
      phonetic: "/dɪˈstrɪbjuːt/",
      meaning: "phân phối",
      example: "The finished goods are distributed to retailers nationwide.",
      example2: "Products are distributed through our partner network.",
      collocation:
        "distribute products / distribution channel / distribute globally",
      audio: "/audio/unit-24/distribute.mp3",
      l1_interference_vn:
        "⚠️ 'are distributed' (be + V3). VN hay quên 'be': 'goods distribute' ❌ — đúng: 'are distributed to retailers'.",
    },
    {
      id: 5,
      word: "approve",
      emoji: "✅",
      phonetic: "/əˈpruːv/",
      meaning: "phê duyệt / chấp thuận",
      example: "The design must be approved by the engineering team.",
      example2: "All changes are approved before implementation.",
      collocation: "approve a design / get approved / officially approved",
      audio: "/audio/unit-24/approve.mp3",
      l1_interference_vn:
        "⚠️ 'be approved by' — 'by' chỉ tác nhân. VN hay dùng active: 'team approve' ❌.",
    },
    {
      id: 6,
      word: "certify",
      emoji: "🏅",
      phonetic: "/ˈsɜːtɪfaɪ/",
      meaning: "chứng nhận",
      example: "Our products are certified to international safety standards.",
      example2: "The factory has been certified by ISO 9001.",
      collocation: "certified product / ISO certified / certification process",
      audio: "/audio/unit-24/certify.mp3",
      l1_interference_vn:
        "⚠️ Present Perfect Passive hay dùng: 'has been certified'. 'by ISO' (không 'with').",
    },
    {
      id: 7,
      word: "automate",
      emoji: "🤖",
      phonetic: "/ˈɔːtəmeɪt/",
      meaning: "tự động hóa",
      example:
        "Many steps in the process have been automated to improve efficiency.",
      example2: "The warehouse is now fully automated.",
      collocation: "automate a process / fully automated / automation system",
      audio: "/audio/unit-24/automate.mp3",
      l1_interference_vn:
        "⚠️ 'have been automated' (Present Perfect Passive). VN hay nhầm thì: 'is automated' khi nói kết quả đến nay.",
    },
    {
      id: 8,
      word: "install",
      emoji: "🔌",
      phonetic: "/ɪnˈstɔːl/",
      meaning: "lắp đặt",
      example: "The new equipment was installed last month.",
      example2: "Software updates are installed automatically overnight.",
      collocation: "install equipment / install software / newly installed",
      audio: "/audio/unit-24/install.mp3",
      l1_interference_vn:
        "⚠️ Past Passive: 'was installed'. Không 'install by' — đúng 'installed by team'.",
    },
    {
      id: 9,
      word: "maintain",
      emoji: "🛠️",
      phonetic: "/meɪnˈteɪn/",
      meaning: "bảo trì / duy trì",
      example: "All machinery is maintained on a quarterly schedule.",
      example2: "High standards must be maintained throughout production.",
      collocation:
        "maintain equipment / maintain standards / routine maintenance",
      audio: "/audio/unit-24/maintain.mp3",
      l1_interference_vn:
        "⚠️ 'is maintained' (be+V3). Passive cho quy trình bảo trì. VN hay bỏ 'be' hoặc nhầm prep: đúng 'maintained on a schedule'.",
    },
    {
      id: 10,
      word: "recycle",
      emoji: "♻️",
      phonetic: "/ˌriːˈsaɪkəl/",
      meaning: "tái chế",
      example: "All packaging materials are recycled in our facility.",
      example2: "Waste water is treated and recycled back into the process.",
      collocation: "recycle materials / recycled content / recycling process",
      audio: "/audio/unit-24/recycle.mp3",
      l1_interference_vn:
        "⚠️ + N trực tiếp: \'recycle plastic\'. Gerund: \'recycling facilities\', \'recycling centre\'.",
    },
    {
      id: 11,
      word: "defect",
      emoji: "⚠️",
      phonetic: "/ˈdiːfekt/",
      meaning: "lỗi / khuyết tật",
      example:
        "Any product with a defect is rejected and removed from the line.",
      example2: "Our defect rate is less than 0.1%.",
      collocation: "manufacturing defect / defect rate / free from defects",
      audio: "/audio/unit-24/defect.mp3",
      l1_interference_vn:
        "⚠️ 'with a defect' (adj). Passive: 'is rejected'. Không 'defect products' — 'defective'.",
    },
    {
      id: 12,
      word: "package",
      emoji: "📦",
      phonetic: "/ˈpækɪdʒ/",
      meaning: "đóng gói",
      example: "After inspection, the products are packaged and labeled.",
      example2: "Each item is carefully packaged to prevent damage.",
      collocation: "package a product / packaging material / packaged goods",
      audio: "/audio/unit-24/package.mp3",
      l1_interference_vn:
        "⚠️ 'are packaged' (be + V3). Khi mô tả quy trình: dùng passive, không active 'we package'. 'Packaged goods' = collocation.",
    },
  ],

  // ── DIALOGUES (Study/Meaningful input CLT): hội thoại tự nhiên, translation VN; chỉ từ đã dạy + grammar unit
  // BC Skills style; pre-teach done above
  dialogues: [
    {
      id: 1,
      title: "Tham quan nhà máy",
      audio: "/audio/unit-24/dialogue_1.mp3",
      desc: "Minh thuyết trình quy trình sản xuất cho đoàn khách quốc tế.",
      lines: [
        {
          id: "d1-1",
          speaker: "Guest",
          text: "Can you explain how your products are made?",
          translation:
            "Bạn có thể giải thích sản phẩm của bạn được làm như thế nào không?",
        },
        {
          id: "d1-2",
          speaker: "Minh",
          text: "Of course. First, raw materials are sourced from certified suppliers. Then the components are manufactured here in our main facility.",
          translation:
            "Được chứ. Đầu tiên, nguyên liệu thô được cung cấp từ các nhà cung cấp được chứng nhận. Sau đó các linh kiện được sản xuất tại cơ sở chính của chúng tôi ở đây.",
        },
        {
          id: "d1-3",
          speaker: "Guest",
          text: "How is quality controlled?",
          translation: "Chất lượng được kiểm soát như thế nào?",
        },
        {
          id: "d1-4",
          speaker: "Minh",
          text: "Each unit is inspected at three stages. Any defective parts are immediately removed. Our facility has been certified by ISO 9001 since 2020.",
          translation:
            "Mỗi đơn vị được kiểm tra ở ba giai đoạn. Bất kỳ phần nào bị lỗi đều bị loại bỏ ngay lập tức. Cơ sở của chúng tôi đã được chứng nhận ISO 9001 từ năm 2020.",
        },
        {
          id: "d1-5",
          speaker: "Guest",
          text: "And what about sustainability?",
          translation: "Còn về tính bền vững thì sao?",
        },
        {
          id: "d1-6",
          speaker: "Minh",
          text: "All packaging materials are recycled. Waste water is treated and reused. By next year, solar panels will be installed to power 40% of our operations.",
          translation:
            "Tất cả vật liệu đóng gói đều được tái chế. Nước thải được xử lý và tái sử dụng. Đến năm tới, tấm pin mặt trời sẽ được lắp đặt để cung cấp năng lượng 40% hoạt động của chúng tôi.",
        },
      ],
    },
    {
      id: 2,
      title: "Báo cáo sự cố sản xuất",
      audio: "/audio/unit-24/dialogue_2.mp3",
      desc: "Lan báo cáo sự cố và giải pháp trong quy trình sản xuất.",
      lines: [
        {
          id: "d2-1",
          speaker: "Manager",
          text: "A defect was reported in yesterday's batch. What happened?",
          translation:
            "Một lỗi đã được báo cáo trong lô hàng hôm qua. Chuyện gì đã xảy ra?",
        },
        {
          id: "d2-2",
          speaker: "Lan",
          text: "The issue was identified at the inspection stage. It was caused by a calibration error in machine 3.",
          translation:
            "Vấn đề được xác định ở giai đoạn kiểm tra. Nó được gây ra bởi lỗi hiệu chuẩn trong máy 3.",
        },
        {
          id: "d2-3",
          speaker: "Manager",
          text: "Has the machine been fixed?",
          translation: "Máy đã được sửa chưa?",
        },
        {
          id: "d2-4",
          speaker: "Lan",
          text: "Yes, it was repaired this morning and has been tested successfully. All affected units have been removed from stock.",
          translation:
            "Rồi, nó đã được sửa sáng nay và đã được kiểm tra thành công. Tất cả các đơn vị bị ảnh hưởng đã được loại bỏ khỏi kho.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT (Study/Controlled practice): gap-fill/matching/listen-choose/arrange ~80% đúng; TOEIC-like distractors
  // practiceQuiz + listenAndChoose >=5
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "The components are manufactured here in our main facility",
      options: [
        "The components manufacture here in our main facility",
        "The components are manufactured here in our main facility",
        "The components are manufacturing here in our main facility",
        "The components were manufactured here in our main facility",
      ],
      answer: "The components are manufactured here in our main facility",
    },
    {
      id: "lac2",
      audio_text: "Each unit is inspected three times before it is shipped",
      options: [
        "Each unit is inspected three times before it ships",
        "Each unit inspects three times before it is shipped",
        "Each unit is inspected three times before it is shipped",
        "Each unit is inspecting three times before it is shipped",
      ],
      answer: "Each unit is inspected three times before it is shipped",
    },
    {
      id: "lac3",
      audio_text: "The factory has been certified by ISO nine thousand and one",
      options: [
        "The factory is certified by ISO nine thousand and one",
        "The factory was certified by ISO nine thousand and one",
        "The factory has been certified by ISO nine thousand and one",
        "The factory had been certified by ISO nine thousand and one",
      ],
      answer: "The factory has been certified by ISO nine thousand and one",
    },
    {
      id: "lac4",
      audio_text: "All defective parts are immediately removed from the line",
      options: [
        "All defective parts immediately remove from the line",
        "All defective parts are immediate removed from the line",
        "All defective parts are immediately removing from the line",
        "All defective parts are immediately removed from the line",
      ],
      answer: "All defective parts are immediately removed from the line",
    },
    {
      id: "lac5",
      audio_text:
        "The machine was repaired this morning and has been tested successfully",
      options: [
        "The machine repaired this morning and has been tested successfully",
        "The machine was repaired this morning and has been tested successfully",
        "The machine was repaired this morning and was tested successfully",
        "The machine was repairing this morning and has been tested successfully",
      ],
      answer:
        "The machine was repaired this morning and has been tested successfully",
    },
  ],

  // ── OUTPUT (Activate/Freer practice + task): practiceTranslate >=3 (VN→EN controlled prod) + shadowing + speaking level2 (situational role)
  // Bắt buộc SẢN XUẤT per center-ref CLT
  speaking: {
    level1Prompt:
      "First, {input} is/are {input}. Then it is {input}. Finally, each unit is {input} before shipping.",
    level1Placeholder:
      "Ví dụ: raw material — sourced from suppliers — processed — inspected...",
    level2Situation:
      "Thuyết trình quy trình sản xuất hoặc dịch vụ của công ty bạn (hoặc tưởng tượng) cho đoàn khách. Mô tả ít nhất 5 bước quy trình bằng Passive Voice. Bao gồm: quy trình kiểm soát chất lượng và tính bền vững.",
    level2Hint:
      "First, [materials] are sourced/received. Then [components] are manufactured/assembled. Each [unit/product] is inspected/tested at [stage]. Any defects are removed. Finally, [products] are packaged and distributed. Our facility has been certified by [standard].",
  },

  // ── GRAMMAR (Study / CELTA MF(P) inductive): Meaning (dialogue) → Form (rule ngắn) → CCQ
  grammar: {
    title: "Passive Voice — Tập Trung Vào Quy Trình",
    rule: "BE + V3 (past participle). is/are (present) | was/were (past) | has/have been (perfect) | will be (future). Dùng BY cho tác nhân nếu cần.",
    // Inductive: Meaning from dialogue examples first → Form rule short <30w per blueprint; CCQ 4 opts ~80% success
    // VN L1: no clear passive form in VN → explicit be+V3 needed in EN for process focus (CLT VN pattern)
    examples: [
      {
        en: "Components are manufactured in our facility. (Present Passive — ongoing process)",
        vn: "Các linh kiện được sản xuất tại cơ sở của chúng tôi.",
      },
      {
        en: "The defect was identified during inspection. (Past Passive — specific event)",
        vn: "Lỗi được xác định trong quá trình kiểm tra.",
      },
      {
        en: "The factory has been certified by ISO since 2020. (Present Perfect Passive — result up to now)",
        vn: "Nhà máy đã được chứng nhận ISO từ năm 2020.",
      },
    ],
    tip: "Khi nào dùng Passive? Khi KHÔNG biết ai làm, KHÔNG quan trọng ai làm, hoặc muốn nhấn mạnh KẾT QUẢ hơn người thực hiện. Trong kỹ thuật và báo cáo → luôn dùng Passive.",
    vnNote:
      "⚠️ Lưu ý người Việt: Tiếng Việt không có passive rõ ràng — dùng 'được/bị' hoặc không dùng gì cả. Trong tiếng Anh, khi kết quả quan trọng hơn người làm → Passive là lựa chọn tốt nhất và chuyên nghiệp nhất.",
    dialogueExample: {
      speaker: "Minh",
      text: "Raw materials are sourced from certified suppliers. Each unit is inspected at three stages. Any defective parts are removed. Our facility has been certified by ISO 9001.",
      translation:
        "Nguyên liệu thô được cung cấp từ nhà cung cấp được chứng nhận. Mỗi đơn vị được kiểm tra ở ba giai đoạn. Bất kỳ phần nào lỗi đều bị loại. Cơ sở đã được ISO 9001 chứng nhận.",
      highlight:
        "are sourced | is inspected | are removed (Present Passive) | has been certified (Present Perfect Passive)",
    },
    ccq: {
      question: "Câu Passive ĐÚNG để mô tả quy trình hiện tại?",
      options: [
        "Workers assemble the products every day.",
        "The products are assembled every day.",
        "The products assembled every day.",
        "The products are assembling every day.",
      ],
      answer: "The products are assembled every day.",
      explanation:
        "Present Simple Passive: is/are + past participle (assembled). Dùng để mô tả quy trình diễn ra đều đặn — chuẩn ngôn ngữ kỹ thuật/báo cáo.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question: "Đổi sang Passive: 'Workers inspect each unit carefully.'",
      options: [
        "Each unit inspects carefully.",
        "Each unit is carefully inspected.",
        "Each unit was carefully inspected.",
        "Each unit has carefully inspected.",
      ],
      answer: "Each unit is carefully inspected.",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question: "Chọn đúng Past Passive: 'The factory ___ in 2021.'",
      options: ["is built", "was built", "has been built", "builds"],
      answer: "was built",
    },
    {
      id: "pq3",
      type: "cloze",
      question:
        "Điền: 'The software ___ (update) every three months.' (Present Passive)",
      answer: "is updated",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "Present Perfect Passive: 'The equipment ___.'",
      options: ["is serviced", "was serviced", "has been serviced", "serviced"],
      answer: "has been serviced",
    },
    {
      id: "pq5",
      type: "cloze",
      question:
        "Điền: 'All defective items ___ (remove) before packaging.' (Present Passive)",
      answer: "are removed",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ với nghĩa đúng",
    pairs: [
      { left: "manufacture", right: "sản xuất" },
      { left: "inspect", right: "kiểm tra" },
      { left: "certify", right: "chứng nhận" },
      { left: "defect", right: "lỗi / khuyết tật" },
      { left: "distribute", right: "phân phối" },
    ],
  },

  // ── OUTPUT / practiceTranslate (VN→EN controlled): ≥3 câu trong phạm vi unit (blueprint)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Mỗi sản phẩm được kiểm tra ba lần trước khi vận chuyển.",
      answer: "Each product is inspected three times before shipping.",
    },
    {
      id: "pt-2",
      prompt_vn: "Sản phẩm được sản xuất tại nhà máy ở Hà Nội.",
      answer: "The product is manufactured at the factory in Hanoi.",
    },
    {
      id: "pt-3",
      prompt_vn: "Hàng hóa được phân phối đến các cửa hàng mỗi tuần.",
      answer: "Goods are distributed to stores every week.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc24-1",
      sentence: "Coffee is grew in Vietnam and Brazil.",
      errorWord: "grew",
      correction: "grown",
      explanation_vn:
        "Passive dùng past participle: 'grow → GROWN'. 'Grew' là Simple Past, không dùng trong passive.",
    },
    {
      id: "sc24-2",
      sentence: "The book was writed by a famous author.",
      errorWord: "writed",
      correction: "written",
      explanation_vn:
        "'Write → written' (bất quy tắc). Không có 'writed'. Passive: was/were + PAST PARTICIPLE.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la24-1",
      audio_text: "Coffee is grown in Vietnam and Brazil.",
      prompt_vn: "Cà phê được trồng ở Việt Nam và Brazil.",
      words: [
        "Coffee",
        "is",
        "grown",
        "in",
        "Vietnam",
        "and",
        "Brazil",
        ".",
        "grew",
        "grows",
      ],
      answer: "Coffee is grown in Vietnam and Brazil .",
    },
    {
      id: "la24-2",
      audio_text: "This bridge was built in two thousand and ten.",
      prompt_vn: "Cây cầu này được xây dựng năm 2010.",
      words: [
        "This",
        "bridge",
        "was",
        "built",
        "in",
        "two",
        "thousand",
        "and",
        "ten",
        ".",
        "build",
        "builded",
      ],
      answer: "This bridge was built in two thousand and ten .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Các linh kiện được sản xuất tại cơ sở chính của chúng tôi.",
      words: [
        "The",
        "components",
        "are",
        "manufactured",
        "at",
        "our",
        "main",
        "facility",
        ".",
        "would",
        "could",
      ],
      answer: "The components are manufactured at our main facility .",
    },
    {
      id: "wb2",
      prompt_vn: "Nhà máy đã được chứng nhận ISO 9001 từ năm 2020.",
      words: [
        "The",
        "factory",
        "has",
        "been",
        "certified",
        "by",
        "ISO",
        "9001",
        "since",
        "2020",
        ".",
        "would",
        "could",
      ],
      answer: "The factory has been certified by ISO 9001 since 2020 .",
    },
    {
      id: "wb3",
      prompt_vn: "Tất cả vật liệu đóng gói được tái chế.",
      words: [
        "All",
        "packaging",
        "materials",
        "are",
        "recycled",
        ".",
        "would",
        "could",
      ],
      answer: "All packaging materials are recycled .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s24-1",
      prompt_vn: "Các linh kiện được sản xuất tại cơ sở chính của chúng tôi.",
      words: [
        "The",
        "components",
        "are",
        "manufactured",
        "at",
        "our",
        "main",
        "facility",
        ".",
      ],
      answer: "The components are manufactured at our main facility .",
    },
    {
      id: "s24-2",
      prompt_vn: "Nhà máy đã được chứng nhận ISO 9001 từ năm 2020.",
      words: [
        "The",
        "factory",
        "has",
        "been",
        "certified",
        "by",
        "ISO",
        "9001",
        "since",
        "2020",
        ".",
      ],
      answer: "The factory has been certified by ISO 9001 since 2020 .",
    },
    {
      id: "s24-3",
      prompt_vn: "Tất cả vật liệu đóng gói được tái chế.",
      words: ["All", "packaging", "materials", "are", "recycled", "."],
      answer: "All packaging materials are recycled .",
    },
  ],

  // ── REVIEW (Review/Feedback + consolidation): quiz >=5 + cumulativeReview >=3 (spiral Nation/center) + reading B1+
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question:
        "Dịch: 'Mỗi sản phẩm được kiểm tra ba lần trước khi vận chuyển.'",
      options: [
        "Each product inspects three times before shipping.",
        "Each product is inspected three times before shipping.",
        "Each product was inspected three times before shipping.",
        "Each product has inspected three times before shipping.",
      ],
      answer: "Each product is inspected three times before shipping.",
    },
    {
      id: "fq2",
      type: "cloze",
      question:
        "Điền: 'The system ___ (install) last week and ___ (test) successfully.'",
      answer: "was installed / was tested",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question: "Câu Passive chuyên nghiệp nhất để mô tả quy trình:",
      options: [
        "Our team makes the products by hand.",
        "The products are handmade in our facility.",
        "We are making the products.",
        "Products made here.",
      ],
      answer: "The products are handmade in our facility.",
    },
    {
      id: "fq4",
      type: "translate",
      question:
        "Dịch: 'Các đơn vị bị lỗi đã được loại bỏ và đang được kiểm tra.'",
      answer: "The defective units have been removed and are being inspected.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question:
        "Future Passive: 'Solar panels ___ next year to power our facility.'",
      options: [
        "install",
        "are installed",
        "will be installed",
        "were installed",
      ],
      answer: "will be installed",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "Bị động hiện tại đơn: cấu trúc:",
      options: [
        "am/is/are + V3",
        "am/is/are + Ving",
        "was/were + V3",
        "will + be + V3",
      ],
      answer: "am/is/are + V3",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "Câu bị động đúng:",
      options: [
        "The cake is baking by Mary.",
        "The cake baked by Mary.",
        "The cake is baked by Mary.",
        "The cake are baked by Mary.",
      ],
      answer: "The cake is baked by Mary.",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền: 'English ___ spoken in many countries.'",
      answer: "is",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "Khi nào nên dùng bị động?",
      options: [
        "Khi tác nhân quan trọng và đã biết",
        "Khi tác nhân không quan trọng hoặc không biết",
        "Khi muốn viết ngắn hơn",
        "Chỉ trong văn viết trang trọng",
      ],
      answer: "Khi tác nhân không quan trọng hoặc không biết",
    },
    {
      id: "q-ex5",
      type: "multiple-choice",
      question: "'They built this bridge in 1990.' → bị động:",
      options: [
        "This bridge was built in 1990.",
        "This bridge is built in 1990.",
        "This bridge built in 1990.",
        "This bridge were built in 1990.",
      ],
      answer: "This bridge was built in 1990.",
    },
    {
      id: "q-ex6",
      type: "translate",
      question: "Dịch: 'Xe máy của tôi đã được sửa.'",
      answer: "My motorbike has been repaired.",
    },
    {
      id: "q-ex7",
      type: "multiple-choice",
      question: "'By' trong câu bị động dùng để:",
      options: [
        "Chỉ thời gian",
        "Chỉ tác nhân thực hiện hành động",
        "Chỉ địa điểm",
        "Chỉ cách thức",
      ],
      answer: "Chỉ tác nhân thực hiện hành động",
    },
  ],

  // ── CUMULATIVE REVIEW (spiral curriculum): >=3 câu ôn unit prior (per blueprint authorGuide + center Review)
  cumulativeReviewQuestions: [
    {
      id: "cr24-1",
      question: "Ôn tập Unit 23 — First Conditional đúng:",
      options: [
        "If you will confirm, we will proceed.",
        "If you confirm, we will proceed.",
        "If you confirmed, we will proceed.",
        "If you confirm, we proceed.",
      ],
      answer: "If you confirm, we will proceed.",
      type: "multiple-choice",
    },
    {
      id: "cr24-2",
      question:
        "Ôn tập Unit 22 — Điền modal: 'You ___ share passwords — it's prohibited.'",
      options: [],
      answer: "mustn't",
      type: "cloze",
    },
    {
      id: "cr24-3",
      question: "Ôn tập Unit 21 — Câu Future Perfect đúng:",
      options: [
        "By 2030, we will expand globally.",
        "By 2030, we will be expanding globally.",
        "By 2030, we will have expanded globally.",
        "By 2030, we expand globally.",
      ],
      answer: "By 2030, we will have expanded globally.",
      type: "multiple-choice",
    },
  ],

  // ── FLUENCY (Activate/Fluency drill): >=5 items, Nation strand 4 automaticity; short repeat drill
  // pronunciationFocus for be + been
  pronunciationFocus: {
    phoneme: "been /biːn/",
    description: "Passive been — âm /iː/ dài, không phải /ɪ/ ngắn",
    examples: [
      {
        word: "been",
        ipa: "/biːn/",
        tip: "Âm /iː/ dài: has BEEN done — không phải /bɪn/ ngắn",
      },
      {
        word: "passive be-forms",
        ipa: "/ɪz, ɑːr, wɒz, wɜːr/",
        tip: "is/are/was/were + V3 — các be-forms hay bị bỏ qua trong nói nhanh",
      },
    ],
    minimalPairs: [["been /biːn/", "bin /bɪn/ (sai)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      {
        en: "The product is tested before shipping",
        vn: "Sản phẩm được kiểm tra trước khi vận chuyển",
      },
      {
        en: "The factory was built in 2020",
        vn: "Nhà máy được xây dựng năm 2020",
      },
      { en: "The software has been updated", vn: "Phần mềm đã được cập nhật" },
      {
        en: "New equipment will be installed next month",
        vn: "Thiết bị mới sẽ được lắp đặt tháng tới",
      },
      {
        en: "All packaging materials are recycled",
        vn: "Tất cả vật liệu đóng gói được tái chế",
      },
      {
        en: "The defect was identified during inspection",
        vn: "Lỗi được xác định trong quá trình kiểm tra",
      },
      { en: "Has the machine been repaired yet?", vn: "Máy đã được sửa chưa?" },
      {
        en: "The report must be approved before submission",
        vn: "Báo cáo phải được duyệt trước khi nộp",
      },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit24-reading-1",
    title: "How Bánh Mì Is Made",
    title_vn: "Đọc đoạn về quy trình thụ động (Passive Voice)",
    level: "B1" as const,
    text:
      "Bánh mì is one of Vietnam's most famous foods. It is eaten by millions of people every day. " +
      "The bread is baked fresh every morning in small bakeries across the country. " +
      "First, flour, water, yeast, and salt are mixed together to form a dough. " +
      "Then, the dough is shaped into long baguettes and placed in a hot oven. " +
      "After baking, the bread is cooled and sliced open. " +
      "Fresh ingredients such as pâté, Vietnamese cold cuts, cucumber, and coriander are added. " +
      "Finally, a special chilli sauce is spread inside the bread. " +
      "The sandwich is then wrapped in paper and sold for just a few thousand dong. " +
      "Today, bánh mì is also sold in food trucks and restaurants around the world. " +
      "It has been recognised by Merriam-Webster as an official English word.",
    questions: [
      {
        id: "u24r-q1",
        question_vn: "Bánh mì được nướng vào lúc nào?",
        options: [
          "Every afternoon",
          "Every morning",
          "Every evening",
          "Only on weekends",
        ],
        answer: "Every morning",
        explanation_vn:
          "'The bread is baked fresh every morning in small bakeries.'",
      },
      {
        id: "u24r-q2",
        question_vn: "Bước đầu tiên trong quy trình làm bánh mì là gì?",
        options: [
          "The bread is shaped into baguettes",
          "Flour, water, yeast, and salt are mixed together",
          "The bread is placed in the oven",
          "Fresh ingredients are added",
        ],
        answer: "Flour, water, yeast, and salt are mixed together",
        explanation_vn:
          "'flour, water, yeast, and salt are mixed together to form a dough.'",
      },
      {
        id: "u24r-q3",
        question_vn:
          "Từ điển nào đã công nhận 'bánh mì' là từ tiếng Anh chính thức?",
        options: [
          "Oxford Dictionary",
          "Cambridge Dictionary",
          "Merriam-Webster",
          "Collins Dictionary",
        ],
        answer: "Merriam-Webster",
        explanation_vn:
          "'It has been recognised by Merriam-Webster as an official English word.'",
      },
      {
        id: "u24r-q4",
        question_vn: "Bánh mì được bán với giá bao nhiêu?",
        options: [
          "Tens of thousands of dong",
          "Hundreds of thousands of dong",
          "Just a few thousand dong",
          "Free at local bakeries",
        ],
        answer: "Just a few thousand dong",
        explanation_vn:
          "'The sandwich is then wrapped in paper and sold for just a few thousand dong.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Tham gia cuộc họp khách hàng và trình bày giải pháp",
      focus:
        "Meeting language: present solution, handle questions, agree next actions",
      context: "Sales / account meeting với khách hàng tiềm năng",
      l1Note:
        "⚠️ 'This solution will reduce your costs by 20%.' 'Could you clarify...?' 'Let's move forward with phase one.'",
      example:
        "Our platform can integrate in two weeks. What are your main concerns? Shall we start with a pilot?",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "3nKL_QL8fdA",
};

export default unit24;
