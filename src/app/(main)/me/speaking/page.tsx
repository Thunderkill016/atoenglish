import type { Metadata } from "next";
import SpeakingClient from "./SpeakingClient";

export const metadata: Metadata = {
  title: "Luyện Nói Phản Xạ | AtoEnglish",
  description:
    "Luyện phát âm và phản xạ giao tiếp tiếng Anh với AI. Shadowing bản ngữ, hội thoại nhập vai AI và nhật ký nói hàng ngày — dành riêng cho người Việt.",
  robots: { index: false },
};

export default function SpeakingPage() {
  return <SpeakingClient />;
}
