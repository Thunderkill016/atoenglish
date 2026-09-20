"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Lock, BookOpen, CheckCircle2, XCircle,
  ArrowRight, RotateCcw, Zap, Star
} from "lucide-react";
import { SecondaryPageShell, MinimalButton } from "@/components/design-system";
import { toast } from "sonner";
import {
  TRIAL_CHECKPOINT_PASS_THRESHOLD,
  TRIAL_CHECKPOINT_QUESTIONS,
} from "@/lib/lessons/trial-checkpoint";
import { claimTrialCheckpoint } from "@/app/actions/learning-attempts";

interface Props {
  phase: string;
  phaseLabel: string;
  description: string;
  levels: string[];
  completedCount: number;
  totalCount: number;
  isUnlocked: boolean;
  nextPhase: string | null;
  unitIds: string[];
}

// Static checkpoint questions per phase — built from key vocabulary/grammar per level
const CHECKPOINT_QUESTIONS: Record<string, Array<{
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}>> = {
  trial: TRIAL_CHECKPOINT_QUESTIONS,
  a0: [
    { id: "a0-1", question: "Chữ cái nào đứng sau chữ 'D' trong bảng chữ cái tiếng Anh?", options: ["E", "F", "C", "G"], answer: "E", explanation: "Thứ tự bảng chữ cái: A B C D E F G H..." },
    { id: "a0-2", question: "Số 15 trong tiếng Anh là gì?", options: ["Fifty", "Fifteen", "Fifty-one", "Five"], answer: "Fifteen", explanation: "'Fifteen' = 15. Cần phân biệt với 'fifty' = 50." },
    { id: "a0-3", question: "Màu nào là 'red'?", options: ["Xanh lá", "Đỏ", "Vàng", "Trắng"], answer: "Đỏ", explanation: "'Red' = đỏ. Ghi nhớ: red = đỏ như máu." },
    { id: "a0-4", question: "'Good morning' có nghĩa là gì?", options: ["Chào buổi tối", "Chào buổi sáng", "Chào buổi trưa", "Xin chào"], answer: "Chào buổi sáng", explanation: "'Good morning' dùng khi chào nhau vào buổi sáng (trước 12h)." },
    { id: "a0-5", question: "Điền vào chỗ trống: 'My name ___ Linh.'", options: ["is", "are", "am", "be"], answer: "is", explanation: "Dùng 'is' với chủ ngữ he/she/it/name. VD: My name IS Linh." },
    { id: "a0-6", question: "'How old are you?' nghĩa là gì?", options: ["Bạn tên gì?", "Bạn bao nhiêu tuổi?", "Bạn ở đâu?", "Bạn làm gì?"], answer: "Bạn bao nhiêu tuổi?", explanation: "'How old' = bao nhiêu tuổi. 'How' = như thế nào/bao nhiêu." },
    { id: "a0-7", question: "Chọn câu trả lời đúng cho câu hỏi 'What color is the sky?'", options: ["It is red.", "It is blue.", "It is green.", "It is yellow."], answer: "It is blue.", explanation: "Bầu trời màu xanh: 'The sky is blue' / 'It is blue.'" },
    { id: "a0-8", question: "'Monday' là thứ mấy?", options: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ sáu"], answer: "Thứ hai", explanation: "Monday = Thứ Hai. Mnemonic: Mon = tuần mới bắt đầu." },
    { id: "a0-9", question: "Chọn cách đếm đúng: 20, 30, ___, 50", options: ["35", "40", "45", "55"], answer: "40", explanation: "Thứ tự chục: twenty (20) → thirty (30) → forty (40) → fifty (50)." },
    { id: "a0-10", question: "'Emergency' có nghĩa là gì?", options: ["Khẩn cấp", "Vui vẻ", "Bình thường", "Chậm"], answer: "Khẩn cấp", explanation: "'Emergency' = tình huống khẩn cấp. VD: 'Call 113 — it's an emergency!'" },
  ],
  a1: [
    { id: "a1-1", question: "Chọn câu đúng ngữ pháp:", options: ["She work every day.", "She works every day.", "She working every day.", "She do work every day."], answer: "She works every day.", explanation: "Thì hiện tại đơn: chủ ngữ he/she/it + động từ + 's'. → She WORKS." },
    { id: "a1-2", question: "'There ___ two cats on the sofa.'", options: ["is", "are", "be", "am"], answer: "are", explanation: "Dùng 'There ARE' với danh từ số nhiều (two cats = số nhiều)." },
    { id: "a1-3", question: "Câu hỏi Yes/No đúng với 'She can swim':", options: ["Does she can swim?", "Can she swim?", "Is she can swim?", "She can swim?"], answer: "Can she swim?", explanation: "Câu hỏi với 'can': Can + chủ ngữ + động từ nguyên mẫu?" },
    { id: "a1-4", question: "'How much is this shirt?' nghĩa là gì?", options: ["Áo này của ai?", "Áo này giá bao nhiêu?", "Áo này ở đâu?", "Áo này màu gì?"], answer: "Áo này giá bao nhiêu?", explanation: "'How much' dùng hỏi giá tiền hoặc lượng của danh từ không đếm được." },
    { id: "a1-5", question: "Điền đúng: 'I ___ from Vietnam. Where ___ you from?'", options: ["am / is", "am / are", "is / am", "are / am"], answer: "am / are", explanation: "To be: I AM, you ARE, he/she/it IS." },
    { id: "a1-6", question: "Chọn câu đúng về sở thích:", options: ["I like to dance.", "I like dancing.", "Both are correct.", "Neither is correct."], answer: "Both are correct.", explanation: "like + V-ing = like + to V. Cả hai đều đúng! VD: I like dancing = I like to dance." },
    { id: "a1-7", question: "'The book is ___ the table.' (cuốn sách ở trên bàn)", options: ["in", "on", "at", "under"], answer: "on", explanation: "'On' = ở trên bề mặt. VD: The book is ON the table." },
    { id: "a1-8", question: "Câu phủ định của 'He plays football.' là:", options: ["He not plays football.", "He doesn't plays football.", "He doesn't play football.", "He don't play football."], answer: "He doesn't play football.", explanation: "Phủ định thì hiện tại đơn he/she/it: doesn't + V nguyên mẫu (bỏ 's')." },
    { id: "a1-9", question: "'I ___ a headache.' (Tôi bị đau đầu)", options: ["am", "have", "feel", "get"], answer: "have", explanation: "Dùng 'have' với triệu chứng: have a headache, have a cold, have a fever." },
    { id: "a1-10", question: "Hỏi về khả năng: 'Bạn có thể nói tiếng Pháp không?'", options: ["Do you can speak French?", "Are you speaking French?", "Can you speak French?", "You can speak French?"], answer: "Can you speak French?", explanation: "Câu hỏi năng lực: Can + you + động từ nguyên mẫu?" },
  ],
  a2: [
    { id: "a2-1", question: "Câu quá khứ đơn của 'go' là:", options: ["goed", "gone", "went", "goes"], answer: "went", explanation: "'Go' là động từ bất quy tắc: go → WENT (quá khứ) → gone (quá khứ phân từ)." },
    { id: "a2-2", question: "Chọn câu so sánh hơn đúng:", options: ["She is more tall than her sister.", "She is taller than her sister.", "She is tallest than her sister.", "She is tall than her sister."], answer: "She is taller than her sister.", explanation: "Tính từ ngắn 1 âm tiết: thêm '-er + than'. tall → taller." },
    { id: "a2-3", question: "'I have lived here ___ 5 years.'", options: ["since", "for", "ago", "before"], answer: "for", explanation: "'For' + khoảng thời gian (for 5 years, for a long time). 'Since' + mốc thời gian (since 2020)." },
    { id: "a2-4", question: "'She ___ already ___ lunch.' (Cô ấy đã ăn trưa rồi)", options: ["has / eaten", "have / eaten", "is / eaten", "was / eaten"], answer: "has / eaten", explanation: "Hiện tại hoàn thành: has + past participle. eat → eaten." },
    { id: "a2-5", question: "Câu điều kiện loại 1: 'If it ___ tomorrow, we ___ stay home.'", options: ["rains / will", "will rain / will", "rained / would", "rain / will"], answer: "rains / will", explanation: "Điều kiện loại 1 (có thể xảy ra): If + V hiện tại, will + V." },
    { id: "a2-6", question: "Chọn câu đúng: 'We ___ to Paris last summer.'", options: ["go", "goes", "went", "have gone"], answer: "went", explanation: "'Last summer' chỉ thời điểm trong quá khứ → dùng quá khứ đơn: WENT." },
    { id: "a2-7", question: "'You should ___ more water every day.'", options: ["drank", "drinks", "drink", "drinking"], answer: "drink", explanation: "Modal verbs (should, can, must, will) + động từ nguyên mẫu (không 'to')." },
    { id: "a2-8", question: "'Neither my brother ___ my sister likes spicy food.'", options: ["or", "nor", "and", "but"], answer: "nor", explanation: "Cặp liên từ: 'neither...NOR' (cả hai đều không). VD: Neither A nor B." },
    { id: "a2-9", question: "Chọn câu bị động đúng: 'The cake ___ by Mary.'", options: ["was made", "made", "is making", "makes"], answer: "was made", explanation: "Câu bị động quá khứ: was/were + past participle. make → made." },
    { id: "a2-10", question: "'What ___ you doing when I called?' (Bạn đang làm gì khi tôi gọi?)", options: ["was", "were", "are", "is"], answer: "were", explanation: "Quá khứ tiếp diễn: was/were + V-ing. With 'you' → WERE doing." },
  ],
  b1: [
    { id: "b1-1", question: "Chọn câu tường thuật (reported speech) đúng: He said, 'I am tired.' → He said that ___", options: ["he is tired.", "he was tired.", "he were tired.", "he has been tired."], answer: "he was tired.", explanation: "Khi tường thuật, thì hiện tại đơn → quá khứ đơn: 'am' → 'was'." },
    { id: "b1-2", question: "'If I ___ rich, I ___ travel the world.' (Nếu tôi giàu, tôi đã đi du lịch)", options: ["am / will", "was / would", "were / would", "be / should"], answer: "were / would", explanation: "Điều kiện loại 2 (không có thật ở hiện tại): If + were/V-ed, would + V." },
    { id: "b1-3", question: "'The project ___ by the team next week.'", options: ["will complete", "will be completed", "is completing", "completes"], answer: "will be completed", explanation: "Bị động tương lai: will be + past participle." },
    { id: "b1-4", question: "Phrasal verb: 'Can you ___ this form, please?' (điền vào mẫu)", options: ["fill up", "fill in", "fill out", "B or C"], answer: "B or C", explanation: "'Fill in' = 'fill out' = điền vào (form/document). Cả hai đều đúng." },
    { id: "b1-5", question: "'Despite ___ hard, she didn't pass the exam.'", options: ["study", "studied", "studying", "to study"], answer: "studying", explanation: "'Despite/In spite of' + V-ing (gerund). Despite STUDYING hard..." },
    { id: "b1-6", question: "Chọn câu có nghĩa 'Tôi thà ở nhà hơn là đi ra ngoài.'", options: ["I prefer staying home than going out.", "I would rather stay home than go out.", "I like to stay home more than going out.", "I better stay home than go out."], answer: "I would rather stay home than go out.", explanation: "'Would rather + V than V' = thà... hơn là... (cấu trúc chuẩn)." },
    { id: "b1-7", question: "'By the time she arrived, we ___ for two hours.'", options: ["waited", "have waited", "had been waiting", "were waiting"], answer: "had been waiting", explanation: "Quá khứ hoàn thành tiếp diễn: had been + V-ing (hành động đang tiếp diễn trước một mốc quá khứ)." },
    { id: "b1-8", question: "Trong email công việc, câu nào phù hợp nhất để xin phép nghỉ?", options: ["I want to take a day off.", "I am requesting approval for a one-day leave on Friday.", "Can I not come Friday?", "I won't be there Friday."], answer: "I am requesting approval for a one-day leave on Friday.", explanation: "Email công việc cần lịch sự và rõ ràng: 'requesting approval' = xin phép chính thức." },
    { id: "b1-9", question: "Idiom: 'Break a leg!' có nghĩa là:", options: ["Cẩn thận!", "Chúc may mắn!", "Dừng lại!", "Hãy cố gắng!"], answer: "Chúc may mắn!", explanation: "'Break a leg' = chúc may mắn (thường dùng trước khi diễn xuất/thuyết trình)." },
    { id: "b1-10", question: "Câu nào diễn đạt đúng 'đề xuất' trong cuộc họp?", options: ["I think we do this.", "I would suggest that we consider a different approach.", "Let's doing this another way.", "Maybe we can tried something else."], answer: "I would suggest that we consider a different approach.", explanation: "'Would suggest' = lịch sự đề xuất trong môi trường chuyên nghiệp." },
  ],
  b2: [
    { id: "b2-1", question: "'Hardly had she arrived ___ the phone rang.'", options: ["than", "when", "after", "until"], answer: "when", explanation: "Cấu trúc đảo ngữ nhấn mạnh: Hardly had + S + V + WHEN... (hầu như vừa... thì...)" },
    { id: "b2-2", question: "Chọn từ có sắc thái ý nghĩa KHÁC với các từ còn lại:", options: ["slim", "slender", "thin", "skinny"], answer: "skinny", explanation: "'Skinny' có hàm ý tiêu cực (quá gầy/xương xẩu). 'Slim/slender/thin' trung tính hoặc tích cực." },
    { id: "b2-3", question: "Câu nào viết đúng theo văn phong học thuật (academic)?", options: ["The results show that the drug is really effective.", "The findings demonstrate a statistically significant efficacy of the treatment.", "We can see from results that the drug works well.", "Obviously, the drug is very effective."], answer: "The findings demonstrate a statistically significant efficacy of the treatment.", explanation: "Văn phong học thuật: tránh 'really/obviously', dùng 'findings/demonstrate/efficacy' thay vì 'results show/very effective'." },
    { id: "b2-4", question: "'It is high time the government ___ action on climate change.'", options: ["take", "takes", "took", "has taken"], answer: "took", explanation: "'It is (high) time + S + V (quá khứ đơn)' — cấu trúc đặc biệt nhấn mạnh sự cấp bách." },
    { id: "b2-5", question: "Chọn câu rút gọn mệnh đề quan hệ đúng:", options: ["The man lived next door was a doctor.", "The man living next door was a doctor.", "The man who lived next door he was a doctor.", "The man, living next door, was a doctor."], answer: "The man living next door was a doctor.", explanation: "Rút gọn mệnh đề quan hệ chủ động: who lived → living (V-ing)." },
    { id: "b2-6", question: "Nghĩa của 'The proposal was met with mixed reactions.'", options: ["Đề xuất được ủng hộ hoàn toàn.", "Đề xuất nhận được phản ứng trái chiều.", "Đề xuất bị phản đối.", "Đề xuất chưa được trả lời."], answer: "Đề xuất nhận được phản ứng trái chiều.", explanation: "'Mixed reactions' = phản ứng hỗn hợp/trái chiều (có người ủng hộ, có người phản đối)." },
    { id: "b2-7", question: "Collocation: 'make' hay 'do' với '___a decision'?", options: ["do a decision", "make a decision", "both are correct", "neither is correct"], answer: "make a decision", explanation: "Collocation chuẩn: MAKE a decision (quyết định), không dùng 'do a decision'." },
    { id: "b2-8", question: "'No sooner ___ I sat down ___ the alarm went off.'", options: ["had / than", "had / when", "did / than", "did / when"], answer: "had / than", explanation: "Cấu trúc đảo ngữ: No sooner + had + S + V3 + THAN... (vừa... thì ngay lập tức...)" },
    { id: "b2-9", question: "Từ nào CÓ THỂ thay thế 'however' trong văn phong trang trọng?", options: ["but", "nevertheless", "yet", "Both B and C"], answer: "Both B and C", explanation: "'Nevertheless' và 'nonetheless' đều dùng thay 'however' trong văn trang trọng." },
    { id: "b2-10", question: "Inferencing: 'The restaurant was packed, and the wait time was over an hour.' → Điều gì có thể suy ra?", options: ["Nhà hàng này đắt tiền.", "Nhà hàng này rất nổi tiếng/được ưa chuộng.", "Nhà hàng này phục vụ chậm.", "Nhà hàng này sắp đóng cửa."], answer: "Nhà hàng này rất nổi tiếng/được ưa chuộng.", explanation: "'Packed' (đông nghịt) + 1 giờ chờ → suy ra nhà hàng rất được ưa chuộng. Không đủ thông tin để kết luận về giá hay chất lượng." },
  ],
};

const PHASE_PASS_THRESHOLD = 7;

export default function CheckpointClient({
  phase,
  phaseLabel,
  description,
  completedCount,
  totalCount,
  isUnlocked,
  nextPhase,
}: Props) {
  const router = useRouter();
  const questions = CHECKPOINT_QUESTIONS[phase] ?? [];
  const passThreshold =
    phase === "trial" ? TRIAL_CHECKPOINT_PASS_THRESHOLD : PHASE_PASS_THRESHOLD;

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerRecord, setAnswerRecord] = useState<Record<string, string>>({});
  const [trialClaimState, setTrialClaimState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const q = questions[current];
  const isCorrect = selected === q?.answer;
  const passed = score >= passThreshold;

  const handleConfirm = useCallback(() => {
    if (!selected || confirmed) return;
    setConfirmed(true);
    setShowExplanation(true);
    setAnswerRecord((previous) => ({ ...previous, [q.id]: selected }));
    if (selected === q.answer) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, q.id]);
    }
  }, [selected, confirmed, q]);

  const submitTrialClaim = useCallback(() => {
    if (phase !== "trial") return;
    if (typeof crypto === "undefined" || !("randomUUID" in crypto)) {
      setTrialClaimState("error");
      return;
    }

    setTrialClaimState("saving");
    void claimTrialCheckpoint({
      sessionId: crypto.randomUUID(),
      answers: answerRecord,
    }).then((result) => {
      if (result.success) {
        setTrialClaimState("saved");
      } else {
        setTrialClaimState("error");
        toast.error(result.error);
      }
    });
  }, [answerRecord, phase]);

  const handleNext = useCallback(() => {
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
      setSelected(null);
      setConfirmed(false);
      setShowExplanation(false);
    } else {
      submitTrialClaim();
      setFinished(true);
    }
  }, [current, questions.length, submitTrialClaim]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started || finished) return;
      if (confirmed) {
        if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); handleNext(); }
        return;
      }
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= q.options.length) {
        setSelected(q.options[numKey - 1]);
      }
      if ((e.code === "Space" || e.code === "Enter") && selected) {
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, finished, confirmed, selected, q, handleNext, handleConfirm]);

  // LOCKED STATE
  if (!isUnlocked) {
    const pct = Math.round((completedCount / totalCount) * 100);
    return (
      <SecondaryPageShell title={`Checkpoint ${phaseLabel}`} subtitle="Chưa mở khoá">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 py-8">
          <div className="inline-flex size-20 items-center justify-center rounded-3xl bg-muted border border-border">
            <Lock className="size-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black">Bài kiểm tra {phaseLabel} chưa mở khoá</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hoàn thành tất cả <span className="font-bold text-foreground">{totalCount} bài học</span> của chặng {phaseLabel} để mở khoá bài kiểm tra tổng hợp.
            </p>
            <p className="text-sm font-bold text-primary">{completedCount}/{totalCount} bài đã hoàn thành ({pct}%)</p>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" />
          </div>
          <MinimalButton fullWidth onClick={() => router.push("/learn")}>
            <BookOpen className="size-4" /> Tiếp tục học
          </MinimalButton>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // START SCREEN
  if (!started) {
    return (
      <SecondaryPageShell title={`Kiểm tra ${phaseLabel}`} subtitle={description}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 py-4">
          <div className="text-center space-y-4">
            <div className="inline-flex size-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20">
              <Trophy className="size-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black">Kiểm tra {phaseLabel}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bài kiểm tra <span className="font-bold text-foreground">{questions.length} câu hỏi</span> xác nhận kiến thức cốt lõi. Cần đúng <span className="font-bold text-emerald-500">{passThreshold}/{questions.length} câu</span> để tiếp tục.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Hướng dẫn</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" /> Nhấn chọn đáp án rồi nhấn <strong>&quot;Xác nhận&quot;</strong></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" /> Phím tắt: <strong>1-4</strong> chọn đáp án · <strong>Space/Enter</strong> xác nhận</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" /> Sau mỗi câu sẽ có giải thích tiếng Việt</li>
              <li className="flex items-start gap-2"><Zap className="size-4 text-amber-500 shrink-0 mt-0.5" /> Đúng {passThreshold}/{questions.length} câu để tiếp tục học.</li>
            </ul>
          </div>

          <MinimalButton data-testid="start-checkpoint" fullWidth onClick={() => setStarted(true)}>
            Bắt đầu kiểm tra <ArrowRight className="size-5" />
          </MinimalButton>
          <MinimalButton variant="ghost" fullWidth onClick={() => router.push("/learn")}>
            Ôn lại bài học trước
          </MinimalButton>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // FINISHED SCREEN
  if (finished) {
    return (
      <SecondaryPageShell title={passed ? "Đã pass!" : "Cần ôn thêm"} subtitle={`${score}/${questions.length} câu đúng`}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
          <div className={`inline-flex size-20 items-center justify-center rounded-3xl ${passed ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
            {passed ? <Trophy className="size-10 text-emerald-500" /> : <XCircle className="size-10 text-red-500" />}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black">{passed ? "🎉 Xuất sắc! Bạn đã pass!" : "Cần ôn thêm một chút!"}</h1>
            <p className="text-muted-foreground text-sm">
              {passed
                ? `Bạn đúng ${score}/${questions.length} câu và đã đủ điều kiện học tiếp.`
                : `Bạn đúng ${score}/${questions.length} câu. Cần ${passThreshold - score} câu nữa để tiếp tục.`}
            </p>
          </div>

          {/* Score display */}
          <div className="flex justify-center gap-2">
            {questions.map((_, i) => (
              <div key={i} className={`size-3 rounded-full ${wrongAnswers.includes(questions[i].id) ? "bg-red-500" : "bg-emerald-500"}`} />
            ))}
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3].map(s => (
              <Star key={s} className={`size-8 ${score >= s * Math.ceil(questions.length / 3) ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"}`} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {phase === "trial" && trialClaimState === "saving" && (
              <p className="text-sm text-muted-foreground">Đang lưu bằng chứng checkpoint...</p>
            )}
            {phase === "trial" && trialClaimState === "error" && (
              <p className="text-sm text-red-400">Chưa thể ghi nhận kết quả. Hãy làm lại checkpoint.</p>
            )}
            {passed && nextPhase && (
              <MinimalButton
                data-testid="continue-to-next-phase"
                fullWidth
                onClick={() => router.push(`/checkpoint/${nextPhase}`)}
              >
                Xem checkpoint {nextPhase.toUpperCase()} <ArrowRight className="size-4" />
              </MinimalButton>
            )}
            {passed && (phase !== "trial" || trialClaimState === "saved") && (
              <MinimalButton fullWidth onClick={() => router.push("/learn")}>
                <BookOpen className="size-4" /> Học tiếp bài mới
              </MinimalButton>
            )}
            <MinimalButton
              data-testid="retry-checkpoint"
              variant="secondary"
              fullWidth
              onClick={() => { setCurrent(0); setSelected(null); setConfirmed(false); setScore(0); setWrongAnswers([]); setAnswerRecord({}); setTrialClaimState("idle"); setFinished(false); setShowExplanation(false); setStarted(true); }}
            >
              <RotateCcw className="size-4" /> Làm lại
            </MinimalButton>
            <MinimalButton variant="ghost" fullWidth onClick={() => router.push("/dashboard")}>
              Về Dashboard
            </MinimalButton>
          </div>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // QUIZ SCREEN
  const progress = ((current + (confirmed ? 1 : 0)) / questions.length) * 100;

  return (
    <SecondaryPageShell title={`${phaseLabel} · Câu ${current + 1}/${questions.length}`} subtitle={`✓ ${score} đúng`}>
      <div className="space-y-5 pb-16">
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
          >
            <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
              {q.question}
            </p>

            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                let style = "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 text-foreground";
                if (confirmed) {
                  if (opt === q.answer) style = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                  else if (opt === selected && !isCorrect) style = "border-red-500 bg-red-500/10 text-red-500";
                  else style = "border-border bg-muted/10 text-muted-foreground opacity-50";
                } else if (selected === opt) {
                  style = "border-primary bg-primary/10 text-primary font-bold";
                }

                return (
                  <button
                    key={opt}
                    disabled={confirmed}
                    onClick={() => !confirmed && setSelected(opt)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150 ${style}`}
                  >
                    <span className="shrink-0 size-6 rounded-lg border border-current/20 bg-current/5 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                    {confirmed && opt === q.answer && <CheckCircle2 className="size-4 ml-auto text-emerald-500 shrink-0" />}
                    {confirmed && opt === selected && !isCorrect && <XCircle className="size-4 ml-auto text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-xl p-4 text-sm leading-relaxed ${isCorrect ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-300"}`}
                >
                  <span className="font-black">💡 Giải thích: </span>{q.explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action button */}
        {!confirmed ? (
          <MinimalButton
            data-testid="confirm-checkpoint-answer"
            fullWidth
            disabled={!selected}
            onClick={handleConfirm}
          >
            Xác nhận
          </MinimalButton>
        ) : (
          <MinimalButton
            data-testid="next-checkpoint-question"
            fullWidth
            onClick={handleNext}
          >
            {current < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"} <ArrowRight className="size-4" />
          </MinimalButton>
        )}
      </div>
    </SecondaryPageShell>
  );
}
