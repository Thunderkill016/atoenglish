import type { ResponseModality } from "@/lib/learning/evidence";

import type { CommunicationActivity, CoreSourceRef } from "./domain";
import type { CoreEvidenceRole } from "./evidence-role";

export const TRANSFER_DISTANCES = ["same-context", "near-transfer", "far-transfer"] as const;
export type TransferDistance = (typeof TRANSFER_DISTANCES)[number];

export type CoreTaskSpec = {
  id: string;
  version: number;
  targetIds: string[];
  activity: CommunicationActivity;
  responseModality: ResponseModality;
  allowedEvidenceRoles: CoreEvidenceRole[];
  support: {
    level: number;
    revealAllowed: boolean;
  };
  transferDistance: TransferDistance;
  contextTags: string[];
  timeConstraintMs: number | null;
  scoringContractId: string;
  sources: CoreSourceRef[];
};

export type CoreTaskProblem =
  | { type: "missing-target" }
  | { type: "missing-evidence-role" }
  | { type: "invalid-support-level"; value: number }
  | { type: "invalid-time-constraint"; value: number }
  | { type: "transfer-role-mismatch"; role: CoreEvidenceRole; distance: TransferDistance };

export function validateCoreTask(task: CoreTaskSpec): CoreTaskProblem[] {
  const problems: CoreTaskProblem[] = [];

  if (task.targetIds.length === 0) problems.push({ type: "missing-target" });
  if (task.allowedEvidenceRoles.length === 0) problems.push({ type: "missing-evidence-role" });
  if (!Number.isFinite(task.support.level) || task.support.level < 0) {
    problems.push({ type: "invalid-support-level", value: task.support.level });
  }
  if (
    task.timeConstraintMs !== null &&
    (!Number.isFinite(task.timeConstraintMs) || task.timeConstraintMs <= 0)
  ) {
    problems.push({ type: "invalid-time-constraint", value: task.timeConstraintMs });
  }

  for (const role of task.allowedEvidenceRoles) {
    if (role === "near-transfer" && task.transferDistance !== "near-transfer") {
      problems.push({ type: "transfer-role-mismatch", role, distance: task.transferDistance });
    }
    if (role === "far-transfer" && task.transferDistance !== "far-transfer") {
      problems.push({ type: "transfer-role-mismatch", role, distance: task.transferDistance });
    }
  }

  return problems;
}
