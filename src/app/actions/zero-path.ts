"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { ReferenceCoreEvidence } from "@/lib/core/certified-evidence";
import {
  toLearnerStateEvidence,
  type ZeroPathClaimId,
  type ZeroPathEvidenceInput,
} from "@/lib/nep/core-evidence-wiring.v1";
import type { NếpEvaluationResult } from "@/lib/nep/evaluator";
import {
  compileCanonicalNếpPracticeAttempt,
  NếpPracticeSubmissionSchema,
} from "@/lib/nep/practice-execution.v1";
import { createRateLimiter } from "@/lib/security/rate-limit";

/**
 * Zero-path pilot boundary: the browser submits only observed interaction data.
 * The server resolves the canonical lesson/action, recomputes evaluation, and
 * returns the certified evidence record (or an auditable rejection). Nothing is
 * persisted — session accumulation happens host-side, per #211/#212 decisions.
 */

const zeroPathLimiter = createRateLimiter(180, 60 * 1000, "zero-path-submission");

const ZeroPathSubmissionSchema = NếpPracticeSubmissionSchema.extend({
  /** Per-session disambiguator for event identity (idempotency, not authority). */
  sequence: z.number().int().min(0).max(10000),
});

export type ZeroPathSubmission = z.infer<typeof ZeroPathSubmissionSchema>;

export type ZeroPathSubmissionResult =
  | { readonly kind: "rate-limited" }
  | { readonly kind: "invalid-input"; readonly error: string }
  | { readonly kind: "unresolvable" }
  | {
      readonly kind: "attempt-only";
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
    }
  | {
      readonly kind: "evidence";
      readonly claim: ZeroPathClaimId;
      readonly evidence: ReferenceCoreEvidence;
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
    }
  | {
      readonly kind: "invalid-evidence";
      readonly claim: ZeroPathClaimId;
      readonly problems: readonly string[];
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
    };

export async function submitZeroPathResponse(
  input: ZeroPathSubmission,
): Promise<ZeroPathSubmissionResult> {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rateLimitCheck = await zeroPathLimiter.check(ip);
  if (!rateLimitCheck.success) return { kind: "rate-limited" };

  const parsed = ZeroPathSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      kind: "invalid-input",
      error: parsed.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const compiled = compileCanonicalNếpPracticeAttempt(parsed.data);
  if (!compiled) return { kind: "unresolvable" };

  const wiringInput: ZeroPathEvidenceInput = {
    lesson: compiled.lesson,
    action: compiled.action,
    response: parsed.data.response,
    responseSource: parsed.data.responseSource,
    evaluation: compiled.evaluation,
    supportUsed: parsed.data.supportUsed,
    latencyMs: parsed.data.latencyMs,
    occurredAt: new Date().toISOString(),
    sequence: parsed.data.sequence,
  };

  const result = toLearnerStateEvidence(wiringInput);
  const base = { evaluation: compiled.evaluation, feedback: compiled.feedback };
  if (!result) return { kind: "attempt-only", ...base };
  if (!result.ok) {
    return {
      kind: "invalid-evidence",
      claim: result.claim,
      problems: result.problems.map((problem) => JSON.stringify(problem)),
      ...base,
    };
  }
  return { kind: "evidence", claim: result.claim, evidence: result.evidence, ...base };
}
