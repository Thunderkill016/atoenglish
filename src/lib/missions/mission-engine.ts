import type { MissionEvaluationResult } from "@/lib/missions/mission-evaluator";
import type {
  MissionLearnerSpecV1,
  MissionStage,
} from "@/lib/missions/mission-spec";

export interface MissionSessionState {
  missionId: string;
  stage: MissionStage;
  currentTurnIndex: number;
  transcripts: string[];
  attempts: number;
  evaluation: MissionEvaluationResult | null;
  completed: boolean;
}

export type MissionSessionEvent =
  | { type: "START" }
  | { type: "MODEL_COMPLETE" }
  | { type: "GUIDED_COMPLETE" }
  | { type: "SUBMIT_TURN"; transcript: string }
  | { type: "EVALUATE"; result: MissionEvaluationResult }
  | { type: "SHOW_FEEDBACK" }
  | { type: "SUBMIT_RETRY"; transcript: string }
  | { type: "RETRY_EVALUATED"; result: MissionEvaluationResult }
  | { type: "OPEN_TRANSFER" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

export function createMissionSession(
  mission: MissionLearnerSpecV1,
): MissionSessionState {
  return {
    missionId: mission.id,
    stage: "scenario",
    currentTurnIndex: 0,
    transcripts: [],
    attempts: 0,
    evaluation: null,
    completed: false,
  };
}

export function transitionMissionSession(
  mission: MissionLearnerSpecV1,
  state: MissionSessionState,
  event: MissionSessionEvent,
): MissionSessionState {
  if (event.type === "RESET") return createMissionSession(mission);
  if (state.missionId !== mission.id || state.completed) return state;

  switch (state.stage) {
    case "scenario":
      return event.type === "START" ? { ...state, stage: "model" } : state;

    case "model":
      return event.type === "MODEL_COMPLETE"
        ? { ...state, stage: "guided_roleplay" }
        : state;

    case "guided_roleplay":
      return event.type === "GUIDED_COMPLETE"
        ? { ...state, stage: "independent_roleplay", currentTurnIndex: 0 }
        : state;

    case "independent_roleplay": {
      if (event.type === "SUBMIT_TURN") {
        return {
          ...state,
          transcripts: [...state.transcripts, event.transcript.trim()],
          currentTurnIndex: state.currentTurnIndex + 1,
        };
      }
      if (
        event.type === "EVALUATE" &&
        state.currentTurnIndex >= mission.roleplayTurns.length
      ) {
        return {
          ...state,
          stage: "feedback",
          attempts: state.attempts + 1,
          evaluation: event.result,
        };
      }
      return state;
    }

    case "feedback":
      if (event.type !== "SHOW_FEEDBACK" || !state.evaluation) return state;
      return state.evaluation.retryRequired
        ? { ...state, stage: "retry" }
        : { ...state, stage: "transfer" };

    case "retry":
      if (event.type === "SUBMIT_RETRY") {
        if (state.attempts >= mission.retry.maxAttemptsPerSession) return state;
        return {
          ...state,
          transcripts: [...state.transcripts, event.transcript.trim()],
        };
      }
      if (event.type === "RETRY_EVALUATED") {
        return {
          ...state,
          stage: "transfer",
          attempts: state.attempts + 1,
          evaluation: event.result,
        };
      }
      return state;

    case "transfer":
      if (event.type === "OPEN_TRANSFER") return state;
      return event.type === "COMPLETE"
        ? { ...state, stage: "completed", completed: true }
        : state;

    case "completed":
      return state;
  }
}
