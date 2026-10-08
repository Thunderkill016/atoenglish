import { fsrs, Card as FSRSCard, Rating, State } from "ts-fsrs";
import { Card as DbCard } from "@/types/database";

// Khởi tạo FSRS instance với các tham số mặc định tối ưu (retention 90%)
export const fsrsInstance = fsrs({
  request_retention: 0.9,
  enable_fuzz: false, // tắt fuzz để có kết quả thống nhất khi test
});

/**
 * Ánh xạ DbCard sang FSRSCard bằng state đã persist đầy đủ.
 * Không suy ngược lapse/learning-step từ due dates hoặc review logs rời rạc.
 */
export function mapDbCardToFSRSCard(dbCard: DbCard): FSRSCard {
  return {
    due: dbCard.next_review
      ? new Date(dbCard.next_review)
      : new Date(dbCard.due_date),
    stability: dbCard.stability || 0,
    difficulty: dbCard.difficulty || 0,
    elapsed_days: Math.max(0, dbCard.elapsed_days || 0),
    scheduled_days: Math.max(0, dbCard.scheduled_days || 0),
    reps: dbCard.repetitions || 0,
    state: (dbCard.state as State) ?? State.New,
    last_review: dbCard.last_review ? new Date(dbCard.last_review) : undefined,
    lapses: Math.max(0, dbCard.lapses || 0),
    learning_steps: Math.max(0, dbCard.learning_steps || 0),
  };
}

/** Đánh giá thẻ từ vựng và trả về state + native ReviewLog của ts-fsrs. */
export function reviewCardFSRS(
  dbCard: DbCard,
  rating: "Again" | "Hard" | "Good" | "Easy",
  retentionRate?: number,
) {
  const fsrsCard = mapDbCardToFSRSCard(dbCard);
  const now = new Date();

  let fsrsRating: Rating;
  switch (rating) {
    case "Again":
      fsrsRating = Rating.Again;
      break;
    case "Hard":
      fsrsRating = Rating.Hard;
      break;
    case "Good":
      fsrsRating = Rating.Good;
      break;
    case "Easy":
      fsrsRating = Rating.Easy;
      break;
    default:
      fsrsRating = Rating.Good;
  }

  const customFsrs = retentionRate
    ? fsrs({ request_retention: retentionRate, enable_fuzz: false })
    : fsrsInstance;
  const schedulingCards = customFsrs.repeat(fsrsCard, now);
  const scheduled = schedulingCards[fsrsRating];
  const updatedCard = scheduled.card;
  const nativeLog = scheduled.log;
  const nextInterval = updatedCard.scheduled_days;

  const reviewLog: ReviewLogEntry = {
    rating: nativeLog.rating,
    state: nativeLog.state,
    due: nativeLog.due.toISOString(),
    stability: nativeLog.stability,
    difficulty: nativeLog.difficulty,
    elapsed_days: nativeLog.elapsed_days,
    last_elapsed_days: nativeLog.last_elapsed_days,
    scheduled_days: nativeLog.scheduled_days,
    learning_steps: nativeLog.learning_steps,
    review: nativeLog.review.toISOString(),
  };

  return {
    state: updatedCard.state,
    difficulty: updatedCard.difficulty,
    stability: updatedCard.stability,
    elapsed_days: updatedCard.elapsed_days,
    scheduled_days: updatedCard.scheduled_days,
    lapses: updatedCard.lapses,
    learning_steps: updatedCard.learning_steps,
    last_review: updatedCard.last_review?.toISOString() ?? now.toISOString(),
    next_review: updatedCard.due.toISOString(),

    // Legacy compatibility fields. These remain synchronized until a later migration removes them.
    interval: nextInterval,
    repetitions: updatedCard.reps,
    due_date: updatedCard.due.toISOString(),

    reviewLog,

    debug: {
      rating,
      stateName: State[updatedCard.state],
      stability: Math.round(updatedCard.stability * 100) / 100,
      difficulty: Math.round(updatedCard.difficulty * 100) / 100,
      interval: nextInterval,
      lapses: updatedCard.lapses,
      learningSteps: updatedCard.learning_steps,
    },
  };
}

/** Native review event fields needed for rollback/rescheduling/optimization. */
export interface ReviewLogEntry {
  rating: Rating;
  state: State;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  last_elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  review: string;
}
