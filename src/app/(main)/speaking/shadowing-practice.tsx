"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Play,
  Eye,
  EyeOff,
  Mic,
  RefreshCw,
  Info,
  Square,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveSpeakingSession } from "@/app/actions/speaking";
import { SpeechRecognitionFallback } from "@/lib/utils/speech-fallback";
import { analyzeSpeaking, type SpeechAnalysisResult } from "@/lib/utils/speech-analysis";

interface SpeechRecognitionMock {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart?: () => void;
  onresult?: (event: SpeechRecognitionEventMock) => void;
  onend?: () => void;
  onerror?: (event: SpeechRecognitionErrorEventMock) => void;
  activeTranscript?: string;
}

interface SpeechRecognitionEventMock {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventMock {
  error: string;
}

interface SpeechWindowMock extends Window {
  SpeechRecognition?: new () => SpeechRecognitionMock;
  webkitSpeechRecognition?: new () => SpeechRecognitionMock;
}

export interface ShadowingItem {
  id: string;
  title: string;
  topic: string;
  level: "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
  transcript: string;
  translation: string;
  difficultWords: string[];
  tips: string;
}

export const SHADOWING_ITEMS: ShadowingItem[] = [
  // ── A0 — Absolute Beginner ───────────────────────────────────────────────
  {
    id: "basic-greeting",
    title: "Basic Greeting & Introduction",
    topic: "Greetings",
    level: "A0",
    transcript: "Hello! My name is Lan. Nice to meet you. I am from Vietnam.",
    translation: "Xin chào! Tên tôi là Lan. Rất vui được gặp bạn. Tôi đến từ Việt Nam.",
    difficultWords: ["Hello", "Nice to meet you", "from"],
    tips: "Nói chậm và rõ ràng. Chú ý: 'Nice to meet you' nối âm như 'nice-tuh-meet-you'. Ngữ điệu lên ở 'hello', xuống ở câu cuối."
  },
  {
    id: "numbers-shopping",
    title: "Shopping — Asking the Price",
    topic: "Shopping",
    level: "A0",
    transcript: "Excuse me. How much is this? It is twenty dollars. Thank you very much!",
    translation: "Xin lỗi. Cái này giá bao nhiêu? Nó là hai mươi đô la. Cảm ơn rất nhiều!",
    difficultWords: ["Excuse me", "How much", "twenty"],
    tips: "'Excuse me' phát âm /ɪkˈskjuːz miː/ — chữ 's' ở giữa phát /z/ (hữu thanh). 'Twenty' nhấn âm đầu: TW-en-ty."
  },
  // ── A1 — Elementary ───────────────────────────────────────────────────────
  {
    id: "daily-routine",
    title: "Describing a Daily Routine",
    topic: "Daily Life",
    level: "A1",
    transcript: "I wake up at seven every morning. I have breakfast and then go to work by bus.",
    translation: "Tôi thức dậy lúc bảy giờ mỗi sáng. Tôi ăn sáng rồi đi làm bằng xe buýt.",
    difficultWords: ["wake up", "breakfast", "by bus"],
    tips: "'Wake up' nối âm: /weɪk ʌp/. 'Breakfast' phát âm /ˈbrekfəst/ — chữ 'a' câm. Nhấn trọng âm: 'BREAKfast'."
  },
  {
    id: "family-description",
    title: "Talking About Your Family",
    topic: "Family",
    level: "A1",
    transcript: "I have a small family. There are four people: my parents, my sister, and me.",
    translation: "Tôi có một gia đình nhỏ. Có bốn người: bố mẹ tôi, chị gái tôi và tôi.",
    difficultWords: ["small", "parents", "sister"],
    tips: "'There are' nối âm tự nhiên: /ðer ər/. 'Parents' phát âm /ˈpeər.ənts/ — nhấn âm đầu. Đọc cả câu liền mạch, không ngắt."
  },
  {
    id: "likes-dislikes",
    title: "Talking About Likes & Dislikes",
    topic: "Personal Preferences",
    level: "A1",
    transcript: "I really love learning English. It is challenging but very rewarding.",
    translation: "Tôi thực sự yêu thích học tiếng Anh. Nó thách thức nhưng rất bổ ích.",
    difficultWords: ["really", "challenging", "rewarding"],
    tips: "'Really' nhấn âm ở: REAl-ly. 'Challenging' có 3 âm tiết: CHAL-len-ging. 'Rewarding' nhấn âm giữa: re-WARD-ing."
  },
  {
    id: "tech-society",
    title: "Technology & Society (Unit 4 Focus)",
    topic: "Technology",
    level: "B1",
    transcript: "Artificial intelligence has become omnipresent. It is beginning to revolutionize how society operates.",
    translation: "Trí tuệ nhân tạo đã có mặt ở khắp mọi nơi. Nó đang bắt đầu cách mạng hóa cách xã hội vận hành.",
    difficultWords: ["artificial intelligence", "omnipresent", "revolutionize"],
    tips: "Hãy chú ý nối âm giữa 'become' và 'omnipresent' (/bɪˈkʌm_ˌɒm.nɪˈprez.ənt/) và nhấn âm chính ở âm thứ 3 của 'revolutionize'."
  },
  {
    id: "introduce-opinion",
    title: "Expressing Personal Opinion",
    topic: "Communication",
    level: "B1",
    transcript: "To be honest, I prefer cooking at home rather than eating out at expensive restaurants.",
    translation: "Thành thật mà nói, tôi thích nấu ăn ở nhà hơn là đi ăn ngoài ở những nhà hàng đắt đỏ.",
    difficultWords: ["To be honest", "prefer", "eating out"],
    tips: "Phát âm từ 'honest' câm âm 'h' (/ˈɒn.ɪst/), hạ giọng ở cuối câu để thể hiện sự tự nhiên."
  },
  {
    id: "business-meeting",
    title: "Asking for Project Status",
    topic: "Business English",
    level: "B2",
    transcript: "Could you please give me a brief update on the project status and the next milestones?",
    translation: "Bạn có thể vui lòng cập nhật ngắn gọn về tình hình dự án và các mốc quan trọng tiếp theo được không?",
    difficultWords: ["brief update", "project status", "milestones"],
    tips: "Nhấn mạnh từ 'brief' và 'status' (/ˈsteɪ.təs/). Chú ý phát âm gió âm cuối của 'milestones'."
  },
  {
    id: "asking-way",
    title: "Asking for Directions",
    topic: "Travel",
    level: "A2",
    transcript: "Excuse me, could you tell me the way to the nearest subway station, please?",
    translation: "Xin lỗi, bạn có thể chỉ cho tôi đường đến ga tàu điện ngầm gần nhất được không?",
    difficultWords: ["Excuse me", "nearest", "subway station"],
    tips: "Hãy lên giọng nhẹ ở đoạn 'Excuse me' và hạ giọng ở từ 'please' ở cuối câu để giữ thái độ lịch sự."
  },
  {
    id: "health-lifestyle",
    title: "Healthy Lifestyle Advice",
    topic: "Health",
    level: "B1",
    transcript: "Staying hydrated and getting sufficient sleep are critical factors for maintaining energy levels throughout the day.",
    translation: "Cung cấp đủ nước và ngủ đủ giấc là những yếu tố quyết định để duy trì năng lượng suốt cả ngày.",
    difficultWords: ["hydrated", "sufficient", "critical factors"],
    tips: "Chữ 'sufficient' phát âm âm /ʃ/ ở giữa (/səˈfɪʃ.ənt/). Đọc liền mạch cụm 'throughout the day'."
  },
  {
    id: "self-introduction",
    title: "Simple Self Introduction",
    topic: "Daily Life",
    level: "A1",
    transcript: "Hi, my name is Minh. I am twenty-five years old. I live in Ho Chi Minh City and I work as an engineer.",
    translation: "Xin chào, tên tôi là Minh. Tôi 25 tuổi. Tôi sống ở Thành phố Hồ Chí Minh và làm việc như một kỹ sư.",
    difficultWords: ["twenty-five", "engineer", "Ho Chi Minh City"],
    tips: "Nhấn giọng vào danh từ riêng 'Ho Chi Minh City'. Phát âm 'engineer' với trọng âm ở âm tiết cuối: /ˌen.dʒɪˈnɪər/."
  },
  {
    id: "describe-city",
    title: "Describing Your City",
    topic: "Travel",
    level: "A2",
    transcript: "My city is very busy and crowded. There are many restaurants, parks, and shopping centres. The public transport is cheap and convenient.",
    translation: "Thành phố của tôi rất bận rộn và đông đúc. Có nhiều nhà hàng, công viên và trung tâm mua sắm. Phương tiện giao thông công cộng thì rẻ và tiện lợi.",
    difficultWords: ["crowded", "shopping centres", "convenient"],
    tips: "Nối âm 'very busy' thành /ˈver.i.ˈbɪz.i/. Chú ý 'convenient' phát âm /kənˈviː.ni.ənt/ — không được bỏ âm tiết giữa."
  },
  {
    id: "climate-change",
    title: "Climate Change Opinion",
    topic: "Environment",
    level: "B2",
    transcript: "Climate change is one of the most pressing challenges of our generation. Governments and individuals must collaborate urgently to reduce carbon emissions and protect biodiversity.",
    translation: "Biến đổi khí hậu là một trong những thách thức cấp bách nhất của thế hệ chúng ta. Các chính phủ và cá nhân phải hợp tác khẩn cấp để giảm lượng phát thải carbon và bảo vệ đa dạng sinh học.",
    difficultWords: ["pressing challenges", "collaborate", "carbon emissions", "biodiversity"],
    tips: "Nhấn âm 'most PRESS-ing'. Phát âm 'biodiversity' rõ 5 âm tiết: /ˌbaɪ.oʊ.daɪˈvɜː.sɪ.ti/. Đọc cả câu như một luồng liền mạch, không nghỉ sau mỗi từ."
  },
  {
    id: "saas-intro",
    title: "Introducing Your SaaS Product",
    topic: "Business English",
    level: "B1",
    transcript: "We built a software platform that helps Vietnamese learners reach English fluency faster using AI and spaced repetition.",
    translation: "Chúng tôi đã xây dựng một nền tảng phần mềm giúp người học Việt Nam đạt được sự thành thạo tiếng Anh nhanh hơn bằng AI và lặp lại cách quãng.",
    difficultWords: ["software platform", "fluency", "spaced repetition"],
    tips: "Nhấn vào 'AI' và 'spaced repetition' vì đây là điểm bán hàng chính. Phát âm 'fluency' 3 âm tiết: /ˈfluː.ən.si/."
  },
  {
    id: "email-opening",
    title: "Professional Email Opening",
    topic: "Business English",
    level: "A2",
    transcript: "I hope this email finds you well. I am writing to follow up on our previous conversation about the partnership proposal.",
    translation: "Tôi hy vọng email này đến tay bạn trong tình trạng tốt. Tôi viết thư để theo dõi cuộc trò chuyện trước của chúng ta về đề xuất hợp tác.",
    difficultWords: ["follow up", "previous conversation", "partnership proposal"],
    tips: "Cụm 'finds you well' là thành ngữ xã giao — đọc liền /faɪndz.jʊ.wɛl/. Nhấn vào 'partnership' và 'proposal' cuối câu."
  },
  {
    id: "startup-pitch",
    title: "30-Second Startup Pitch",
    topic: "Business English",
    level: "B2",
    transcript: "Our product solves a real pain point: Vietnamese professionals spend years learning English but never reach conversational fluency because existing tools are not designed for their specific needs.",
    translation: "Sản phẩm của chúng tôi giải quyết một vấn đề thực sự: các chuyên gia Việt Nam dành nhiều năm học tiếng Anh nhưng không bao giờ đạt được sự thành thạo trong hội thoại vì các công cụ hiện có không được thiết kế cho nhu cầu cụ thể của họ.",
    difficultWords: ["pain point", "conversational fluency", "specific needs"],
    tips: "Đây là câu pitch — đọc chắc chắn, tự tin. Nhấn 'real pain point' và 'never reach'. Không được bỏ âm /t/ cuối 'point' và 'fluent'."
  },
  {
    id: "meeting-facilitation",
    title: "Facilitating a Team Meeting",
    topic: "Business English",
    level: "B1",
    transcript: "Let us quickly go through today's agenda. First, I would like to get an update from each team on their current progress and blockers.",
    translation: "Hãy nhanh chóng xem qua chương trình hôm nay. Đầu tiên, tôi muốn nhận thông tin cập nhật từ mỗi nhóm về tiến độ hiện tại và những trở ngại của họ.",
    difficultWords: ["agenda", "update", "blockers"],
    tips: "Phát âm 'agenda' /əˈdʒen.də/ — không nói 'a-gen-da'. Cụm 'let us' thường co lại thành 'let's' /lɛts/ trong văn nói tự nhiên."
  },
  {
    id: "negotiation",
    title: "Price Negotiation",
    topic: "Business English",
    level: "B2",
    transcript: "I understand your budget constraints. However, given the value we deliver, I believe our pricing is competitive. Would you be open to a three-month trial at a discounted rate?",
    translation: "Tôi hiểu những ràng buộc ngân sách của bạn. Tuy nhiên, với giá trị chúng tôi mang lại, tôi tin rằng giá của chúng tôi rất cạnh tranh. Bạn có sẵn sàng dùng thử ba tháng với mức giá ưu đãi không?",
    difficultWords: ["budget constraints", "competitive", "discounted rate"],
    tips: "Đọc 'However' với ngữ điệu lên nhẹ rồi hạ xuống. Nhấn 'value' và 'competitive'. Câu hỏi cuối phải lên giọng ở cuối."
  },
  {
    id: "user-feedback",
    title: "Responding to User Feedback",
    topic: "Business English",
    level: "B1",
    transcript: "Thank you so much for taking the time to share your feedback. We really appreciate your insight and we will prioritize this feature in our next sprint.",
    translation: "Cảm ơn bạn rất nhiều vì đã dành thời gian chia sẻ phản hồi. Chúng tôi thực sự đánh giá cao nhận xét của bạn và sẽ ưu tiên tính năng này trong sprint tiếp theo.",
    difficultWords: ["taking the time", "insight", "prioritize", "sprint"],
    tips: "Cụm 'taking the time' đọc liền nhau. 'Prioritize' phát âm 4 âm tiết: /praɪˈɒr.ɪ.taɪz/. 'Sprint' là từ kỹ thuật Agile — phát âm rõ âm /t/ cuối."
  }
];


export function ShadowingPractice() {
  const [selectedId, setSelectedId] = useState<string>(SHADOWING_ITEMS[0].id);
  const [isPlayingNative, setIsPlayingNative] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  // Auto-select bài nói khi chuyển hướng từ bài học (query param ?id=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");
      if (idParam && SHADOWING_ITEMS.some((item) => item.id === idParam)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedId(idParam);
      }
    }
  }, []);

  
  // States cho Ghi âm
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // States cho Speech Recognition & Chấm điểm
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [missingCodas, setMissingCodas] = useState<string[]>([]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognitionMock | null>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  const activeItem = SHADOWING_ITEMS.find((item) => item.id === selectedId) || SHADOWING_ITEMS[0];

  // Khởi động SpeechRecognition
  const SpeechRecognition = typeof window !== "undefined"
    ? ((window as unknown as SpeechWindowMock).SpeechRecognition ||
       (window as unknown as SpeechWindowMock).webkitSpeechRecognition ||
       (SpeechRecognitionFallback as unknown as new () => SpeechRecognitionMock))
    : null;

  // Vòng đời chung của component (mount / unmount)
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      if (recordedAudioRef.current) {
        recordedAudioRef.current.pause();
        recordedAudioRef.current = null;
      }
    };
  }, []);

  // Cleanup khi chuyển bài
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      if (recordedAudioRef.current) {
        recordedAudioRef.current.pause();
        recordedAudioRef.current = null;
      }
    };
  }, [selectedId]);

  // Cleanup audio url khi unmount hoặc đổi bài
  useEffect(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasRecorded(false);
     
    setRecordedUrl(null);
     
    setRecognizedText("");
     
    setAccuracyScore(null);
    setMissingCodas([]);
    setIsPlayingRecorded(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Hàm phát audio gốc bằng Web Speech Synthesis
  const handlePlayNative = () => {
    if (typeof window === "undefined") return;

    if (isPlayingNative) {
      window.speechSynthesis.cancel();
      setIsPlayingNative(false);
      return;
    }

    setIsPlayingNative(true);
    const utterance = new SpeechSynthesisUtterance(activeItem.transcript);
    utterance.lang = "en-US";
    utterance.rate = playbackSpeed;

    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(voice => voice.lang === "en-US" && voice.name.includes("Google")) 
                   || voices.find(voice => voice.lang.startsWith("en-"));
    if (usVoice) {
      utterance.voice = usVoice;
    }

    utterance.onend = () => {
      if (isMountedRef.current) {
        setIsPlayingNative(false);
      }
    };

    utterance.onerror = () => {
      if (isMountedRef.current) {
        setIsPlayingNative(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Hàm bắt đầu ghi âm
  const startRecording = async () => {
    if (typeof window === "undefined") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      // eslint-disable-next-line react-hooks/purity
      startTimeRef.current = Date.now();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (isMountedRef.current) {
          setRecordedUrl(audioUrl);
          setHasRecorded(true);
        } else {
          URL.revokeObjectURL(audioUrl);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      // Tải và chuẩn bị SpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        if (SpeechRecognition === (SpeechRecognitionFallback as unknown as new () => SpeechRecognitionMock)) {
          recognition.activeTranscript = activeItem.transcript;
        }
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        let fullTranscript = "";
        recognition.onresult = (event: SpeechRecognitionEventMock) => {
          if (!isMountedRef.current) return;
          let currentText = "";
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + " ";
          }
          fullTranscript = currentText.trim();
        };

        recognition.onend = async () => {
          if (!isMountedRef.current) return;
          setRecognizedText(fullTranscript);
          // Chấm điểm sau khi thu âm xong
          if (fullTranscript.trim()) {
            const score = calculateAccuracy(activeItem.transcript, fullTranscript);
            setAccuracyScore(score);
            const omissions = detectMissingCodas(activeItem.transcript, fullTranscript);
            setMissingCodas(omissions);
            
            if (score >= 80) {
              if (omissions.length > 0) {
                toast.warning(`Tuyệt vời! ${score}%. Lưu ý: ${omissions[0]}`);
              } else {
                toast.success(`Xuất sắc! Độ chính xác đạt ${score}%`);
              }
            } else if (score >= 50) {
              if (omissions.length > 0) {
                toast.warning(`Khá tốt! ${score}%. Cảnh báo: ${omissions[0]}`);
              } else {
                toast.info(`Khá tốt! Độ chính xác đạt ${score}%`);
              }
            } else {
              if (omissions.length > 0) {
                toast.error(`Chưa đạt (${score}%). Lỗi: ${omissions.join(", ")}`);
              } else {
                toast.warning(`Hãy cố gắng nói to, rõ ràng hơn. Độ chính xác: ${score}%`);
              }
            }

            // Ghi nhận lịch sử luyện tập vào database
            const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
            const saveRes = await saveSpeakingSession({
              practiceType: "shadowing",
              duration,
              transcript: fullTranscript,
              accuracyScore: score,
              scenarioId: activeItem.id
            });
            if (!isMountedRef.current) return;
            if (saveRes.success && saveRes.xpEarned) {
              toast.success("Buổi luyện nói đã được lưu.");
            } else if (saveRes.success) {
              // Guest: persist local history for viz (TASK-152)
              try {
                const key = "guest_speaking_sessions";
                const prev = JSON.parse(localStorage.getItem(key) || "[]");
                const entry = { id: `guest-${Date.now()}`, practice_type: "shadowing" as const, duration, accuracy_score: score ?? null, scenario_id: activeItem.id, created_at: new Date().toISOString() };
                localStorage.setItem(key, JSON.stringify([entry, ...prev].slice(0, 20)));
              } catch {}
            }
          } else {
            setAccuracyScore(0);
            setMissingCodas([]);
            toast.error("Không nhận diện được giọng nói của bạn. Hãy nói to và rõ hơn.");
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setAccuracyScore(null);
      setRecognizedText("");

      timerRef.current = setInterval(() => {
        if (!isMountedRef.current) {
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }
        setRecordingDuration((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      toast.info("Đang ghi âm... Hãy nói đuổi theo transcript!");
    } catch (err) {
      if (isMountedRef.current) {
        toast.error("Không thể kết nối Microphone. Vui lòng kiểm tra quyền thiết bị.");
      }
    }
  };

  // Hàm dừng ghi âm
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  // Hàm nghe lại giọng nói của người học
  const handlePlayRecorded = () => {
    if (!recordedUrl) return;

    if (isPlayingRecorded) {
      if (recordedAudioRef.current) {
        recordedAudioRef.current.pause();
      }
      setIsPlayingRecorded(false);
      return;
    }

    setIsPlayingRecorded(true);
    const audio = new Audio(recordedUrl);
    recordedAudioRef.current = audio;

    audio.onended = () => {
      if (isMountedRef.current) {
        setIsPlayingRecorded(false);
      }
    };

    audio.onerror = () => {
      if (isMountedRef.current) {
        setIsPlayingRecorded(false);
        toast.error("Không thể phát lại bản ghi.");
      }
    };

    audio.play();
  };

  // Advanced free analysis (research-backed): Levenshtein + VN L1 interference tips for best shadowing feedback
  const calculateAccuracy = (original: string, recognized: string) => {
    const analysis = analyzeSpeaking(original, recognized, "shadowing");
    lastAnalysisRef.current = analysis;
    setAnalysisTips(analysis.specificTips || []);
    return analysis.similarity;
  };

  // Ref + state for latest analysis tips (avoids direct ref read in render body per hooks rules)
  const lastAnalysisRef = useRef<SpeechAnalysisResult | null>(null);
  const [analysisTips, setAnalysisTips] = useState<string[]>([]);

  const getAnalysisTips = (): string[] => {
    const a = lastAnalysisRef.current;
    return (a && a.specificTips) || [];
  };

  // Helper: detect specific missing English final consonants (codas) commonly deleted by Vietnamese learners
  const detectMissingCodas = (expected: string, actual: string): string[] => {
    const missingWarnings: string[] = [];
    const cleanExpected = expected.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const cleanActual = actual.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

    const expectedWords = cleanExpected.split(/\s+/);
    const actualWords = cleanActual.split(/\s+/);

    expectedWords.forEach((word) => {
      // Check if the expected word ends in a target coda sound
      if (word.endsWith("k") || word.endsWith("t") || word.endsWith("s") || word.endsWith("d") || word.endsWith("ce") || word.endsWith("se")) {
        // Find matching word base in actual spoken phrase
        const baseWordWithoutCoda = word.replace(/(k|t|s|d|ce|se)$/, "");
        
        // If user pronounced the base but omitted the ending
        const foundOmission = actualWords.some(
          (aWord) => aWord === baseWordWithoutCoda && aWord !== word
        );

        if (foundOmission) {
          let soundExplanation = "";
          if (word.endsWith("k")) soundExplanation = "âm /k/ (ví dụ: 'like' -> 'lai-kờ')";
          else if (word.endsWith("t")) soundExplanation = "âm /t/ (ví dụ: 'cat' -> 'ca-tờ')";
          else if (word.endsWith("s") || word.endsWith("ce") || word.endsWith("se")) soundExplanation = "âm /s/ (ví dụ: 'face' -> 'fây-sờ')";
          else if (word.endsWith("d")) soundExplanation = "âm /d/ (ví dụ: 'red' -> 're-dờ')";

          missingWarnings.push(`Từ "${word}" phát âm thiếu ${soundExplanation}`);
        }
      }
    });

    return missingWarnings;
  };

  // Helper render transcript highlight chi tiết từ đúng/sai sau khi chấm điểm
  const renderHighlightedTranscript = () => {
    const text = activeItem.transcript;
    const words = activeItem.difficultWords;

    if (accuracyScore === null) {
      // Khi chưa chấm điểm, highlight từ khó như bình thường
      const regex = new RegExp(`(${words.join("|")})`, "gi");
      const parts = text.split(regex);

      return (
        <p className="text-sm sm:text-lg font-medium leading-relaxed text-foreground tracking-wide font-sans break-words overflow-wrap-anywhere">
          {parts.map((part, index) => {
            const isDifficult = words.some(w => w.toLowerCase() === part.toLowerCase());
            if (isDifficult) {
              return (
                <span
                  key={index}
                  className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 underline decoration-amber-500/30 cursor-help relative group"
                >
                  {part}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-xs text-white bg-foreground/95 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-normal shadow-md">
                    Từ vựng quan trọng
                  </span>
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </p>
      );
    }

    // Khi đã có điểm, so sánh từng từ của transcript gốc với từ được nhận diện
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const recWordsClean = recognizedText.split(/\s+/).map(cleanWord).filter(Boolean);
    
    // Split bằng khoảng trắng để giữ nguyên các từ kèm dấu câu gốc
    const origWordsRaw = text.split(/(\s+)/);

    return (
      <p className="text-sm sm:text-lg font-medium leading-relaxed text-foreground tracking-wide font-sans break-words overflow-wrap-anywhere">
        {origWordsRaw.map((part, index) => {
          // Nếu chỉ là khoảng trắng, render thẳng
          if (part.trim() === "") return <span key={index}>{part}</span>;

          const cleaned = cleanWord(part);
          const isCorrect = recWordsClean.includes(cleaned);

          return (
            <span
              key={index}
              className={`inline-block px-1 py-0.5 rounded transition-all duration-300 font-bold ${
                isCorrect
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : "text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20"
              }`}
            >
              {part}
            </span>
          );
        })}
      </p>
    );
  };

  // Định dạng giây thành mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* List selection - scrollable chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SHADOWING_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedId(item.id);
              setIsPlayingNative(false);
            }}
            className={`shrink-0 snap-start px-4 h-10 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center max-w-[140px] sm:max-w-none truncate ${
              selectedId === item.id
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
            }`}
          >
            <span className="truncate">{item.title}</span>
          </button>
        ))}
      </div>

      {/* Main Workspace Card */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 sm:p-8 space-y-5 shadow-sm relative overflow-hidden">
        {/* Topic & Level Badges */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider bg-foreground/[0.03] px-3 py-1 rounded-lg">
            Chủ đề: {activeItem.topic}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg font-bold border border-primary/20">
            CEFR {activeItem.level}
          </span>
        </div>

        {/* Transcript Box */}
        <div className="p-3 sm:p-6 rounded-2xl bg-foreground/[0.01] border border-foreground/[0.03] space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-foreground/[0.04] pb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 min-w-0 flex-1">
              <Volume2 className="size-4 text-primary shrink-0" />
              <span className="truncate">Audio &amp; Transcript gốc</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-xs font-bold text-primary hover:bg-primary/5 rounded-lg h-8 px-2.5"
            >
              {showTranslation ? (
                <span className="flex items-center gap-1"><EyeOff className="size-3.5" /> Ẩn dịch nghĩa</span>
              ) : (
                <span className="flex items-center gap-1"><Eye className="size-3.5" /> Xem dịch nghĩa</span>
              )}
            </Button>
          </div>

          {/* Transcript Render */}
          {renderHighlightedTranscript()}

          {/* Translation */}
          <AnimatePresence>
            {showTranslation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-dashed border-foreground/10 pt-3"
              >
                <p className="text-sm text-muted-foreground font-normal italic leading-relaxed">
                  Dịch nghĩa: {activeItem.translation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playback Settings & Controller */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-3 pt-2">
          {/* Speed settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider shrink-0">Tốc độ:</span>
            <div className="bg-foreground/[0.03] border border-foreground/[0.05] p-1 rounded-xl flex gap-1">
              {[0.8, 1.0, 1.2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (isPlayingNative) {
                      window.speechSynthesis.cancel();
                      setIsPlayingNative(false);
                      setTimeout(() => handlePlayNative(), 50);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    playbackSpeed === speed
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Native Audio Button */}
          <Button
            onClick={handlePlayNative}
            variant={isPlayingNative ? "secondary" : "outline"}
            className={`w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 rounded-2xl sm:rounded-xl font-bold text-xs uppercase tracking-wider gap-2 border-border/60 active:scale-[0.98] transition-all flex items-center justify-center ${
              isPlayingNative
                ? "bg-violet-600 text-white hover:bg-violet-700 hover:text-white"
                : "bg-card hover:bg-muted/50 text-foreground"
            }`}
          >
            {isPlayingNative ? (
              <>
                <Square className="size-4 fill-white text-white" />
                <span>Dừng Audio gốc</span>
              </>
            ) : (
              <>
                <Play className="size-4 fill-primary text-primary" />
                <span>Nghe Audio gốc</span>
              </>
            )}
          </Button>
        </div>

        {/* Tips Box */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-primary flex items-start gap-2.5 leading-relaxed">
          <Info className="size-4.5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider">Mẹo luyện phát âm:</span>
            <p className="text-xs text-primary/80 font-normal">{activeItem.tips}</p>
          </div>
        </div>

        {/* Record & Feedback Section */}
        <div className="pt-6 border-t border-foreground/[0.04] space-y-4">
          <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
            Thu âm của bạn (Shadowing)
          </h4>

          {/* AI Accuracy Result Box */}
          <AnimatePresence>
            {accuracyScore !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center sm:justify-between gap-4 shadow-sm ${
                  accuracyScore >= 80
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : accuracyScore >= 50
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    {accuracyScore >= 80 ? (
                      <CheckCircle className="size-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="size-5 text-amber-500" />
                    )}
                    <span className="text-sm font-bold text-foreground">Kết quả Shadowing AI</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">
                    {accuracyScore >= 80
                      ? "Phát âm tuyệt vời! Bạn đã bắt được ngữ điệu chuẩn xác."
                      : accuracyScore >= 50
                      ? "Tương đối tốt! Hãy chú ý các từ màu đỏ để cải thiện thêm."
                      : "Bạn nói còn thiếu hoặc nhận diện không rõ. Hãy thử lại."}
                  </p>
                  {recognizedText && (
                    <div className="text-[11px] text-muted-foreground/80 mt-1 font-mono break-all max-w-lg leading-relaxed">
                      AI nhận diện: &quot;{recognizedText}&quot;
                    </div>
                  )}
                  {missingCodas.length > 0 && (
                    <div className="mt-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <AlertTriangle className="size-4 animate-bounce text-amber-500" />
                        Cảnh báo phát âm (Nhỡ âm đuôi)
                      </div>
                      <ul className="list-disc list-inside space-y-1 font-semibold pl-1">
                        {missingCodas.map((warning, i) => (
                          <li key={i} className="text-foreground/90 dark:text-zinc-200">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Best-practice L1 feedback from advanced analyzer (autopilot applied) */}
                  {analysisTips.length > 0 && (
                    <div className="mt-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-xs space-y-1.5 shadow-sm">
                      <div className="font-bold uppercase tracking-wider">Mẹo dành riêng cho người Việt (phân tích cục bộ)</div>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {analysisTips.map((tip: string, i: number) => (
                          <li key={i} className="text-foreground/90 dark:text-zinc-200">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className={`text-2xl sm:text-3xl font-black ${
                    accuracyScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : accuracyScore >= 50
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}>
                    {accuracyScore}%
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold font-mono">Độ chính xác</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Record Trigger Button */}
            {!hasRecorded ? (
              <Button
                disabled={isPlayingNative}
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full sm:w-auto h-12 px-8 rounded-2xl font-bold transition-all duration-300 gap-2 flex items-center justify-center ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/20"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="size-5 fill-white" />
                    <span>Dừng Ghi âm ({formatTime(recordingDuration)})</span>
                  </>
                ) : (
                  <>
                    <Mic className="size-5" />
                    <span>Ghi âm Shadowing</span>
                  </>
                )}
              </Button>
            ) : (
              // So sánh & Thu âm lại
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handlePlayRecorded}
                  variant={isPlayingRecorded ? "secondary" : "outline"}
                  className={`w-full sm:w-auto h-12 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider gap-2 border-border/60 active:scale-[0.98] transition-all flex items-center justify-center ${
                    isPlayingRecorded
                      ? "bg-violet-600 text-white hover:bg-violet-700 hover:text-white"
                      : "bg-card hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {isPlayingRecorded ? (
                    <>
                      <Square className="size-4 fill-white text-white" />
                      <span>Dừng phát</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-foreground" />
                      <span>Nghe giọng của bạn</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setHasRecorded(false);
                    setRecordedUrl(null);
                    setAccuracyScore(null);
                    setRecognizedText("");
                    setMissingCodas([]);
                  }}
                  variant="ghost"
                  className="w-full sm:w-auto h-12 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider gap-2 hover:bg-foreground/[0.03] hover:text-foreground active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  <RefreshCw className="size-4" />
                  <span>Thu âm lại</span>
                </Button>
              </div>
            )}

            {/* Waveform Animation for Recording */}
            {isRecording && (
              <div className="flex items-center gap-1.5 h-6 px-3 bg-red-500/5 rounded-full border border-red-500/10">
                {([18, 10, 24, 8, 20, 14, 26, 12, 22, 16] as const).map((maxH, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-red-500 rounded-full"
                    animate={{ height: [6, maxH, 6] }}
                    transition={{
                      duration: 0.4 + (i % 5) * 0.06,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.04,
                    }}
                  />
                ))}
              </div>
            )}
            
            {!isRecording && !hasRecorded && (
              <p className="text-xs text-muted-foreground text-center sm:text-left font-normal max-w-sm">
                Nhấn nút và nói đồng thời cùng với audio gốc. Hệ thống sẽ ghi âm và so sánh giọng của bạn.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
