"use server";

import { headers } from "next/headers";

import {
  materializeEvidence,
  type EvidenceEvent,
  type EvidenceType,
} from "@/lib/learning/evidence";
import type { RecordLearningAttemptInput } from "@/lib/learning/validation";
import type { NếpEvaluationResult } from "@/lib/nep/evaluator";
import {
  compileCanonicalNếpPracticeAttempt,
  NếpPracticeSubmissionSchema,
  type NếpPracticeSubmission,
} from "@/lib/nep/practice-execution.v1";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { rpcService } from "@/lib/supabase/service";

const learningAttemptLimiter = createRateLimiter(
  180,
  60 * 1000,
  "learning-attempt",
);

type RpcError = { message: string } | null;
type RpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: RpcError }>;
};

export type RecordNếpPracticeAttemptResult =
  | {
      success: false;
      error: string;
      evaluation?: NếpEvaluationResult;
      feedback?: string;
    }
  | {
      success: true;
      persisted: false;
      persistence: "local-only";
      attemptId: null;
      evaluation: NếpEvaluationResult;
      feedback: string;
      evidenceRecorded: false;
      evidenceType: null;
      evidenceRejection: null;
    }
  | {
      success: true;
      persisted: false;
      /** Unassessed self-report channel — recorded nowhere, mints nothing. */
      persistence: "self-report";
      attemptId: null;
      evaluation: null;
      feedback: string;
      evidenceRecorded: false;
      evidenceType: null;
      evidenceRejection: null;
    }
  | {
      success: true;
      persisted: true;
      persistence: "database";
      attemptId: string | null;
      evaluation: NếpEvaluationResult;
      feedback: string;
      evidenceRecorded: boolean;
      evidenceType: EvidenceType | null;
      evidenceRejection: string | null;
    };

function rpcArgs(
  attempt: RecordLearningAttemptInput["attempt"],
  evidence: EvidenceEvent | null,
): Record<string, unknown> {
  return {
    p_knowledge_item_id: attempt.knowledgeItemId ?? null,
    p_capability_id: attempt.capabilityId ?? null,
    p_session_id: attempt.sessionId ?? null,
    p_exercise_type: attempt.exerciseType,
    p_response_modality: attempt.responseModality,
    p_prompt_id: attempt.promptId ?? null,
    p_context_id: attempt.contextId ?? null,
    p_response_text: attempt.responseText ?? null,
    p_correct: attempt.correct ?? null,
    p_latency_ms: attempt.latencyMs ?? null,
    p_hint_count: attempt.hintCount ?? 0,
    p_reveal_used: attempt.revealUsed ?? false,
    p_support_level: attempt.supportLevel ?? 0,
    p_metadata: attempt.metadata ?? {},
    p_evidence_type: evidence?.type ?? null,
    p_evidence_target_id: evidence?.targetId ?? null,
    p_evidence_success: evidence?.success ?? null,
    p_evidence_confidence: evidence?.confidence ?? null,
    p_evidence_context_id: evidence?.contextId ?? null,
    p_evaluator: evidence?.evaluator ?? null,
    p_evidence_metadata: evidence?.metadata ?? {},
  };
}

function isTransferPolicyRejection(message: string): boolean {
  return (
    message.includes("Transfer requires") ||
    message.includes("Evidence context must match attempted context")
  );
}

function isClientEvidenceRejection(message: string): boolean {
  return message.includes("Client-supplied mastery evidence is not accepted");
}

/**
 * Evidence may be dropped while the attempt itself remains valid:
 * - transfer lost the changed-context race, or
 * - the hardened RPC wrapper refused caller-supplied evidence args from a
 *   Data API boundary (evidence writes need a trusted DB context — the
 *   attempt record itself is still legitimate append-only history).
 */
function isEvidenceWriteRejection(
  message: string,
  evidenceType: EvidenceType,
): boolean {
  if (isClientEvidenceRejection(message)) return true;
  return evidenceType === "transfer" && isTransferPolicyRejection(message);
}

/**
 * Trusted Nếp execution boundary.
 *
 * The browser sends only observed interaction data plus canonical action identity. The server
 * resolves the versioned lesson/action and recomputes correctness, target, evidence type,
 * evaluator, reveal semantics and remediation metadata. Raw learner response is used transiently
 * for deterministic evaluation and is never passed to the persistence RPC.
 */
export async function recordNếpPracticeAttempt(
  input: NếpPracticeSubmission,
): Promise<RecordNếpPracticeAttemptResult> {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await learningAttemptLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    const parsed = NếpPracticeSubmissionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: `Dữ liệu practice không hợp lệ: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`,
      };
    }

    const compiled = compileCanonicalNếpPracticeAttempt(parsed.data);
    if (!compiled) {
      return {
        success: false,
        error: "Lesson/action không tồn tại trong canonical Nếp contract.",
      };
    }

    const { record, evaluation, feedback } = compiled;
    if (!record || !evaluation) {
      return {
        success: true,
        persisted: false,
        persistence: "self-report",
        attemptId: null,
        evaluation: null,
        feedback,
        evidenceRecorded: false,
        evidenceType: null,
        evidenceRejection: null,
      };
    }
    const { attempt, candidate } = record;
    const evidence = candidate
      ? materializeEvidence({
          attempt,
          candidate,
          // Transfer depends on persisted history, not caller-provided previous context.
          deferTransferContextCheck: candidate.type === "transfer",
        })
      : null;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: true,
        persisted: false,
        persistence: "local-only",
        attemptId: null,
        evaluation,
        feedback,
        evidenceRecorded: false,
        evidenceType: null,
        evidenceRejection: null,
      };
    }

    const rpcClient = supabase as unknown as RpcClient;
    // Evidence-bearing writes go through the trusted direct-DB path: the
    // server has already verified the caller above and recomputed every
    // evidence field deterministically, so nothing caller-controlled reaches
    // mastery state. Attempt-only writes stay on the Data API boundary.
    let data: unknown;
    let error: RpcError;
    if (evidence) {
      const trusted = await rpcService<string>(
        "record_learning_attempt_trusted",
        {
          p_user_id: user.id,
          ...rpcArgs(attempt, evidence),
        },
      );
      data = trusted.data;
      error = trusted.error;
    } else {
      const attemptOnly = await rpcClient.rpc(
        "record_learning_attempt",
        rpcArgs(attempt, null),
      );
      data = attemptOnly.data;
      error = attemptOnly.error;
    }
    let evidenceRecorded = evidence !== null && !error;
    let evidenceRejection: string | null = null;

    // A changed-context decision depends on persisted history and can lose a race between
    // concurrent requests. Preserve the immutable attempt when only the evidence write is
    // rejected. Infrastructure/permission errors are never downgraded.
    if (
      error &&
      evidence &&
      isEvidenceWriteRejection(error.message, evidence.type)
    ) {
      evidenceRejection = error.message;
      const retry = await rpcClient.rpc(
        "record_learning_attempt",
        rpcArgs(attempt, null),
      );
      data = retry.data;
      error = retry.error;
      evidenceRecorded = false;
    }

    if (error) {
      return {
        success: false,
        error: `Không thể lưu learning event: ${error.message}`,
        evaluation,
        feedback,
      };
    }

    return {
      success: true,
      persisted: true,
      persistence: "database",
      attemptId: typeof data === "string" ? data : null,
      evaluation,
      feedback,
      evidenceRecorded,
      evidenceType: evidenceRecorded ? (evidence?.type ?? null) : null,
      evidenceRejection,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống khi ghi learning event: ${message}`,
    };
  }
}
