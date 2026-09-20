import crypto from "node:crypto";

import type { CommunicationActivity } from "@/lib/core/domain";
import type { CoreEvidenceRole } from "@/lib/core/evidence-role";
import type { CoreTaskSpec, TransferDistance } from "@/lib/core/task";
import { validateCoreTask } from "@/lib/core/task";
import type { ResponseModality } from "@/lib/learning/evidence";

import { freezePilotTaskDefinition } from "./identity";
import {
  NATIVE_PILOT_CONTENT_SLICE,
  NATIVE_PILOT_CONTRACT_ID,
  NATIVE_PILOT_SCORING_CONTRACT_ID,
  NATIVE_PILOT_TARGET_ID,
  PILOT_TASK_FAMILIES,
  type FrozenPilotTaskDefinition,
  type PilotTaskDefinition,
  type PilotTaskFamily,
} from "./types";

type TaskFamilySemantics = {
  readonly activity: CommunicationActivity;
  readonly responseModality: ResponseModality;
  readonly role: CoreEvidenceRole;
  readonly supportLevel: number;
  readonly revealAllowed: boolean;
  readonly transferDistance: TransferDistance;
  readonly defaultContextId: string;
  readonly stimulusFormGroup: string;
};

const FAMILY_SEMANTICS: Readonly<Record<PilotTaskFamily, TaskFamilySemantics>> = Object.freeze({
  "recognition-independent": Object.freeze({
    activity: "reading-reception",
    responseModality: "choice",
    role: "meaning-recognition",
    supportLevel: 0,
    revealAllowed: false,
    transferDistance: "same-context",
    defaultContextId: "ctx-baseline-a",
    stimulusFormGroup: "form-a",
  }),
  "recognition-supported": Object.freeze({
    activity: "reading-reception",
    responseModality: "choice",
    role: "meaning-recognition",
    supportLevel: 1,
    revealAllowed: true,
    transferDistance: "same-context",
    defaultContextId: "ctx-baseline-a",
    stimulusFormGroup: "form-b",
  }),
  "free-recall": Object.freeze({
    activity: "written-production",
    responseModality: "text",
    role: "free-recall",
    supportLevel: 0,
    revealAllowed: false,
    transferDistance: "same-context",
    defaultContextId: "ctx-baseline-a",
    stimulusFormGroup: "form-c",
  }),
  "delayed-free-recall": Object.freeze({
    activity: "written-production",
    responseModality: "text",
    role: "free-recall",
    supportLevel: 0,
    revealAllowed: false,
    transferDistance: "same-context",
    defaultContextId: "ctx-baseline-a",
    stimulusFormGroup: "form-d",
  }),
  "near-transfer": Object.freeze({
    activity: "written-production",
    responseModality: "text",
    role: "near-transfer",
    supportLevel: 0,
    revealAllowed: false,
    transferDistance: "near-transfer",
    defaultContextId: "ctx-near-transfer-b",
    stimulusFormGroup: "form-e",
  }),
});

function sha256(value: string): `sha256:${string}` {
  return `sha256:${crypto.createHash("sha256").update(value, "utf8").digest("hex")}`;
}

export type BuildPilotTaskOptions = {
  readonly contextId?: string;
  readonly stimulusFormGroup?: string;
  readonly contentKey?: string;
};

export function buildPilotTaskDefinition(
  family: PilotTaskFamily,
  options: BuildPilotTaskOptions = {},
): FrozenPilotTaskDefinition {
  const semantics = FAMILY_SEMANTICS[family];
  const contextId = options.contextId ?? semantics.defaultContextId;
  const stimulusFormGroup = options.stimulusFormGroup ?? semantics.stimulusFormGroup;
  const contentKey = options.contentKey ?? `${family}:${stimulusFormGroup}:v1`;
  const taskId = `native-pilot-v1:${family}:${stimulusFormGroup}:${contextId}`;

  const task: CoreTaskSpec = Object.freeze({
    id: taskId,
    version: 1,
    targetIds: Object.freeze([NATIVE_PILOT_TARGET_ID]) as unknown as string[],
    activity: semantics.activity,
    responseModality: semantics.responseModality,
    allowedEvidenceRoles: Object.freeze([semantics.role]) as unknown as CoreEvidenceRole[],
    support: Object.freeze({
      level: semantics.supportLevel,
      revealAllowed: semantics.revealAllowed,
    }),
    transferDistance: semantics.transferDistance,
    contextTags: Object.freeze([
      NATIVE_PILOT_CONTENT_SLICE,
      `pilot-family:${family}`,
      `context:${contextId}`,
      `stimulus-form-group:${stimulusFormGroup}`,
    ]) as unknown as string[],
    timeConstraintMs: null,
    scoringContractId: NATIVE_PILOT_SCORING_CONTRACT_ID,
    sources: Object.freeze([
      Object.freeze({
        sourceId: "spec:005-native-evidence-pilot-v1",
        version: "1",
        locator: "specs/005-native-evidence-pilot-v1/spec.md",
      }),
    ]) as unknown as CoreTaskSpec["sources"],
  });

  const problems = validateCoreTask(task);
  if (problems.length > 0) {
    throw new Error(`Invalid native pilot task ${taskId}: ${JSON.stringify(problems)}`);
  }

  const definition: PilotTaskDefinition = Object.freeze({
    pilotContractId: NATIVE_PILOT_CONTRACT_ID,
    family,
    task,
    contentFingerprint: sha256(contentKey),
    contextId,
    stimulusFormGroup,
    scoringContractId: NATIVE_PILOT_SCORING_CONTRACT_ID,
  });
  return freezePilotTaskDefinition(definition);
}

export function buildFrozenPilotTaskMatrix(): readonly FrozenPilotTaskDefinition[] {
  return Object.freeze(PILOT_TASK_FAMILIES.map((family) => buildPilotTaskDefinition(family)));
}
