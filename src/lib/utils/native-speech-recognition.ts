export type NativeSpeechRecognitionConstructor<T = unknown> = new () => T;

/**
 * Returns only a browser-provided Web Speech recognition constructor.
 *
 * Compatibility adapters must not be reported as native support because that
 * would hide the unavailable state from the learner.
 */
export function getNativeSpeechRecognitionConstructor<T = unknown>(
  windowLike: Record<string, unknown> | null | undefined
): NativeSpeechRecognitionConstructor<T> | null {
  if (!windowLike) return null;

  const candidate = windowLike.SpeechRecognition ?? windowLike.webkitSpeechRecognition;
  return typeof candidate === "function"
    ? (candidate as NativeSpeechRecognitionConstructor<T>)
    : null;
}
