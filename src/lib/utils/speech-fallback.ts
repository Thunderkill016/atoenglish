export interface SpeechRecognitionEventMock {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
  resultIndex?: number;
}

/**
 * Honest unavailable adapter for browsers without the Web Speech API.
 * It never fabricates a transcript or a score.
 */
export class SpeechRecognitionFallback {
  continuous = false;
  interimResults = false;
  lang = "en-US";

  onstart: ((event: Event) => void) | null = null;
  onresult: ((event: SpeechRecognitionEventMock) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private isListening = false;

  start() {
    if (this.isListening) return;
    this.isListening = true;

    setTimeout(() => {
      if (this.isListening && this.onstart) {
        this.onstart(new Event("start"));
      }
    }, 50);
  }

  stop() {
    if (!this.isListening) return;
    this.isListening = false;

    setTimeout(() => {
      if (this.onerror) {
        this.onerror(Object.assign(new Event("error"), { error: "not-supported" }));
      }
      if (this.onend) {
        this.onend(new Event("end"));
      }
    }, 0);
  }

  abort() {
    this.isListening = false;
    if (this.onend) {
      this.onend(new Event("end"));
    }
  }
}
