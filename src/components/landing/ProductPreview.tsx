"use client";

import { useState, useEffect } from "react";
import { Mic, Volume2, Eye, Flame, CheckCircle, Sparkles, RefreshCw, Star, AlertCircle } from "lucide-react";

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState<"speaking" | "srs" | "dashboard">("speaking");

  // Speaking states
  const [speakingStatus, setSpeakingStatus] = useState<"idle" | "listening" | "analyzing" | "done">("idle");
  const [waveform, setWaveform] = useState<number[]>([10, 15, 20, 15, 10]);
  const [recognizedText, setRecognizedText] = useState("");
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const targetSentence = "Nice to meet you. My name is Nam.";

  // Flashcard states
  const [isFlipped, setIsFlipped] = useState(false);

  // Simulate speaking waveform animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (speakingStatus === "listening") {
      interval = setInterval(() => {
        setWaveform(Array.from({ length: 8 }, () => Math.floor(Math.random() * 30) + 5));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [speakingStatus]);

  // Speech Recognition config
   
  const SpeechRecognition = typeof window !== "undefined"
     
    ? ((window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition)
    : null;

  const calculateAccuracy = (original: string, recognized: string) => {
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const origWords = original.split(/\s+/).map(cleanWord).filter(Boolean);
    const recWords = recognized.split(/\s+/).map(cleanWord).filter(Boolean);

    if (origWords.length === 0) return 0;
    
    let matches = 0;
    const recSet = new Set(recWords);
    origWords.forEach(word => {
      if (recSet.has(word)) {
        matches++;
      }
    });

    return Math.round((matches / origWords.length) * 100);
  };

  const startSpeaking = async () => {
    if (typeof window === "undefined") return;
    setMicError(null);

    if (!SpeechRecognition) {
      // Fallback simulation if Speech Recognition is not supported
      setSpeakingStatus("listening");
      setTimeout(() => {
        setSpeakingStatus("analyzing");
        setTimeout(() => {
          setRecognizedText("nice to meet you my name is nam");
          setAccuracyScore(100);
          setSpeakingStatus("done");
        }, 1200);
      }, 2500);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      let fullTranscript = "";
       
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results && event.results[0]) {
          fullTranscript = event.results[0][0].transcript;
        }
      };

      recognition.onstart = () => {
        setSpeakingStatus("listening");
        setRecognizedText("");
        setAccuracyScore(null);
      };

      recognition.onend = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (fullTranscript.trim()) {
          setSpeakingStatus("analyzing");
          setTimeout(() => {
            const score = calculateAccuracy(targetSentence, fullTranscript);
            setRecognizedText(fullTranscript);
            setAccuracyScore(score);
            setSpeakingStatus("done");
          }, 1000);
        } else {
          setSpeakingStatus("idle");
          setMicError("Không nhận diện được giọng nói. Hãy nói to và rõ hơn rồi thử lại nhé!");
        }
      };

       
      recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        stream.getTracks().forEach((track) => track.stop());
        setSpeakingStatus("idle");
        if (e.error === "not-allowed") {
          setMicError("Trình duyệt chưa được cấp quyền mic. Vui lòng cho phép trong cài đặt trình duyệt.");
        } else {
          setMicError("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      };

      recognition.start();
    } catch {
      // Fallback simulation if mic is blocked
      setMicError("Không truy cập được mic. Đang chạy chế độ demo.");
      setSpeakingStatus("listening");
      setTimeout(() => {
        setSpeakingStatus("analyzing");
        setTimeout(() => {
          setRecognizedText("nice to meet you my name is nam");
          setAccuracyScore(100);
          setSpeakingStatus("done");
        }, 1200);
      }, 2500);
    }
  };

  const handlePlayNative = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetSentence);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const resetSpeaking = () => {
    setSpeakingStatus("idle");
    setRecognizedText("");
    setAccuracyScore(null);
    setMicError(null);
  };

  const renderHighlightedSentence = () => {
    if (accuracyScore === null || !recognizedText) {
      return targetSentence;
    }

    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const recognizedWords = recognizedText.split(/\s+/).map(cleanWord).filter(Boolean);
    const recognizedSet = new Set(recognizedWords);

    const words = targetSentence.split(" ");
    return (
      <>
        {words.map((word, idx) => {
          const cleaned = cleanWord(word);
          const isCorrect = recognizedSet.has(cleaned);
          return (
            <span
              key={idx}
              className={
                isCorrect
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-red-500 dark:text-red-400 font-medium"
              }
            >
              {word}{idx < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </>
    );
  };

  const getFeedbackMessage = () => {
    if (accuracyScore === null) return null;

    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const origWords = targetSentence.split(/\s+/).map(cleanWord).filter(Boolean);
    const recWords = recognizedText.split(/\s+/).map(cleanWord).filter(Boolean);
    const recSet = new Set(recWords);

    const missed = origWords.filter(w => !recSet.has(w));

    if (accuracyScore === 100) {
      return (
        <span>
          Tuyệt vời! Bạn đã phát âm chính xác hoàn toàn câu này.
        </span>
      );
    }

    if (missed.length > 0) {
      return (
        <span>
          Bạn phát âm đúng hầu hết các từ. Nhớ phát âm rõ hơn các từ:{" "}
          <strong className="text-red-500 dark:text-red-400">
            {missed.join(", ")}
          </strong>.
        </span>
      );
    }

    return (
      <span>
        Phát âm khá ổn, hãy nói to rõ hơn để nâng cao độ chính xác nhé!
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 sm:mt-16 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-md overflow-hidden shadow-2xl shadow-zinc-900/[0.05] dark:shadow-black/30">
      {/* Window Title Bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="size-3 rounded-full bg-red-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono truncate">app.atoenglish.com/preview</span>
      </div>

      {/* Tab Navigation — separate row, scrollable on mobile */}
      <div className="flex items-center gap-1 px-2 sm:px-4 py-2 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-900/20">
        <button
          onClick={() => setActiveTab("speaking")}
          className={`flex-1 text-center text-xs sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
            activeTab === "speaking"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
          }`}
        >
          <span className="hidden sm:inline">Luyện nói phản xạ</span>
          <span className="sm:hidden">Luyện Nói</span>
        </button>
        <button
          onClick={() => { setActiveTab("srs"); setIsFlipped(false); }}
          className={`flex-1 text-center text-xs sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
            activeTab === "srs"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
          }`}
        >
          <span className="hidden sm:inline">Thẻ Từ Vựng (SRS)</span>
          <span className="sm:hidden">Thẻ SRS</span>
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 text-center text-xs sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
            activeTab === "dashboard"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
          }`}
        >
          Dashboard
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="p-3 sm:p-10 min-h-[320px] sm:min-h-[360px] flex items-center justify-center bg-grid-pattern bg-white dark:bg-zinc-950 transition-colors duration-300">
        
        {/* TAB 1: AI SPEAKING SHADOWING */}
        {activeTab === "speaking" && (
          <div className="w-full max-w-md space-y-6 text-left animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 px-3 py-1 rounded-full w-fit">
              <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>Shadowing & Nhận diện giọng</span>
            </div>
            
            <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/15 backdrop-blur-sm space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Mẫu phát âm chuẩn:</span>
                <button 
                  onClick={handlePlayNative}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  <Volume2 className="size-4" />
                  <span>Nghe mẫu</span>
                </button>
              </div>
              
              <h3 className="text-base sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                {renderHighlightedSentence()}
              </h3>
              
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                /naɪs tu mit ju. maɪ neɪm ɪz nɑm./
              </p>
            </div>

            {/* Speaking actions and feedback */}
            <div className="flex flex-col items-center gap-4 justify-center py-2">
              {/* Inline mic error message */}
              {micError && (
                <div className="w-full flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30 text-red-600 dark:text-red-400">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{micError}</p>
                </div>
              )}

              {speakingStatus === "idle" && (
                <button
                  onClick={startSpeaking}
                  className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-emerald-600/15 active:scale-95 transition-all duration-200 group"
                >
                  <Mic className="size-5 animate-pulse text-emerald-100 group-hover:scale-110 transition-transform" />
                  <span>Nhấn để bắt đầu nói</span>
                </button>
              )}

              {speakingStatus === "listening" && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="flex items-end justify-center gap-1.5 h-12">
                    {waveform.map((height, i) => (
                      <div
                        key={i}
                        style={{ height: `${height}px` }}
                        className="w-1.5 bg-red-500 rounded-full transition-all duration-100"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-wider">
                    Hệ thống đang ghi âm... Hãy nói mẫu trên
                  </span>
                </div>
              )}

              {speakingStatus === "analyzing" && (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="size-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Hệ thống đang phân tích giọng nói của bạn...
                  </span>
                </div>
              )}

              {speakingStatus === "done" && (
                <div className="w-full p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 animate-scale-up">
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-sm">
                      {accuracyScore !== null && accuracyScore >= 90 ? "A" : accuracyScore !== null && accuracyScore >= 75 ? "B" : "C"}
                    </div>
                    <span className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {accuracyScore}% · {accuracyScore !== null && (accuracyScore >= 90 ? "Xuất sắc" : accuracyScore >= 75 ? "Khá tốt" : accuracyScore >= 50 ? "Tạm được" : "Cần cố gắng")}
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-350">
                    {getFeedbackMessage()}
                  </p>

                  <p className="text-xs text-zinc-400 dark:text-zinc-500 italic mt-1">
                    Bạn đã nói: &quot;{recognizedText}&quot;
                  </p>

                  <button
                    onClick={resetSpeaking}
                    className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
                  >
                    Thử nói lại
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SRS FLASHCARDS */}
        {activeTab === "srs" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-500 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 px-3 py-1 rounded-full w-fit">
              <Star className="size-3 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Hộp thẻ lặp lại ngắt quãng</span>
            </div>

            {/* Flashcard container with flip simulation */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full h-56 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 bg-gradient-to-br from-zinc-50/50 to-white dark:from-zinc-900/10 dark:to-zinc-950/20 shadow-lg cursor-pointer flex flex-col justify-between p-6 overflow-hidden group hover:border-amber-500/35 dark:hover:border-amber-500/25 transition-all duration-300 select-none"
            >
              {!isFlipped ? (
                // Front of the card
                <>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest font-mono">
                      Từ cần nhớ (Front)
                    </span>
                    <span className="text-xs font-bold text-zinc-400">Chạm để lật nghĩa</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                      Persistent
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                      /pəˈsɪs.tənt/
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                    <Eye className="size-4" />
                    <span>Xem giải nghĩa từ</span>
                  </div>
                </>
              ) : (
                // Back of the card
                <div className="flex flex-col justify-between h-full animate-flip">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-mono">
                      Ý nghĩa (Back)
                    </span>
                    <span className="text-xs font-bold text-zinc-400">Chạm để quay lại</span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                      Kiên trì, bền bỉ, không bỏ cuộc
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-450 italic leading-relaxed">
                      &quot;She is persistent in practicing English speaking every day.&quot;
                    </p>
                  </div>

                  <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                    Ví dụ thực tế giúp hình dung ngữ cảnh
                  </div>
                </div>
              )}
            </div>

            {/* SRS ratings */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button className="flex-1 py-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold transition-colors">
                Chưa nhớ
              </button>
              <button className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-350 text-xs font-bold transition-colors">
                Khó
              </button>
              <button className="flex-1 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors">
                Nhớ tốt
              </button>
              <button className="flex-1 py-2 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors">
                Dễ
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: INNER DASHBOARD PREVIEW */}
        {activeTab === "dashboard" && (
          <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in text-left">
            {/* Circle Tracker */}
            <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/15 backdrop-blur-sm p-5 flex flex-col items-center justify-between text-center min-h-[190px]">
              <div className="w-full flex items-center justify-between">
                <span className="font-extrabold text-xs text-zinc-400 uppercase tracking-wider">XP Ngày</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Hàng ngày</span>
              </div>
              
              <div className="relative size-20 flex items-center justify-center my-1">
                <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-zinc-100 dark:stroke-zinc-800 fill-none" strokeWidth="6" />
                  <circle cx="50" cy="50" r="40" className="stroke-emerald-600 fill-none" strokeWidth="7" strokeDasharray="251" strokeDashoffset="75" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">70%</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-sm font-bold text-zinc-800 dark:text-zinc-250">
                  50 / 80 XP
                </div>
                <div className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">
                  Luyện thêm 30 XP để hoàn thành!
                </div>
              </div>
            </div>

            {/* Streak Tracker & Quests preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 shadow-sm shadow-orange-500/5">
                <Flame className="size-5 text-orange-500 fill-orange-500 animate-pulse" />
                <div className="text-left leading-tight">
                  <div className="text-xs text-orange-800 dark:text-orange-400 font-extrabold uppercase">Thói quen</div>
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                    5 ngày liên tục
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/15 backdrop-blur-sm space-y-2">
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Nhiệm vụ hôm nay</span>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="size-4 text-emerald-500 fill-emerald-500/10" />
                    <span className="text-zinc-500 dark:text-zinc-400 line-through">Học 1 bài mới</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <div className="size-4 rounded-full border border-zinc-300 dark:border-zinc-700" />
                    <span>Luyện nói 10 từ SRS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
