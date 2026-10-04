/**
 * Voicing for English model lines. Prefers pre-generated Aura-2 audio served
 * from /api/audio (consistent voice on every device); falls back to browser
 * speechSynthesis when the string has no pre-generated asset, the request
 * fails, or playback is blocked. No-op under SSR.
 */
export function speakEnglish(text: string, rate = 0.92) {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();

  const fallback = () => speakBrowser(text, rate);
  const audio = new Audio(`/api/audio?text=${encodeURIComponent(text)}`);
  let fellBack = false;
  const useFallback = () => {
    if (fellBack) return;
    fellBack = true;
    fallback();
  };
  audio.onerror = useFallback;
  void audio.play().catch(useFallback);
}

function speakBrowser(text: string, rate: number) {
  if (!("speechSynthesis" in window)) return;
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
