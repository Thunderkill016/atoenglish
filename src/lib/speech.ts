/** Browser TTS for English model lines. No-op when unsupported (SSR/old browsers). */
export function speakEnglish(text: string, rate = 0.92) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

/**
 * Vietnamese has diacritics absent from English; if a string has none and at
 * least one Latin letter, it is safe to voice with an en-US utterance.
 */
export function looksEnglish(text: string): boolean {
  return (
    /[a-zA-Z]/.test(text) &&
    !/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(
      text,
    )
  );
}
