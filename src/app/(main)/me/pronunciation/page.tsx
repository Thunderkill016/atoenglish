import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phát Âm IPA | AtoEnglish",
  description:
    "Học 44 âm IPA tiếng Anh với hướng dẫn tiếng Việt, audio và luyện shadowing. Dành riêng cho người Việt.",
  robots: { index: false },
};

import PronunciationClient from "./PronunciationClient";

export default function PronunciationPage() {
  return (
    <>
      <PronunciationClient />
    </>
  );
}
