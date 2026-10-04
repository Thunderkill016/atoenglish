/**
 * Shared derivation for pre-generated lesson audio keys.
 * Same function runs in the /api/audio route (Workers) and in
 * scripts/tts/generate-audio.ts (Node) so both compute identical keys.
 * Key prefix encodes the voice/model so a model swap invalidates cleanly.
 */
export const AUDIO_KEY_PREFIX = "aura2";

// Longest curriculum English string is a reading passage (~400 chars);
// the cap also prevents arbitrary-text KV lookups from being seeded.
export const MAX_TTS_TEXT_CHARS = 500;

export async function audioKeyForText(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text.trim()),
  );
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${AUDIO_KEY_PREFIX}/${hex}`;
}
