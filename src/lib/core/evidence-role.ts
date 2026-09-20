export const CORE_EVIDENCE_ROLES = [
  "receptive-discrimination",
  "meaning-recognition",
  "cued-recall",
  "free-recall",
  "controlled-production",
  "free-production",
  "interactional-repair",
  "near-transfer",
  "far-transfer",
  "retention-probe",
  "chronometric-processing",
] as const;

/**
 * Epistemic role of an observation in the learning system.
 *
 * These values deliberately do not encode communication channels such as listening or reading.
 * A channel/activity describes what the learner did; an evidence role describes what the task can
 * legitimately support as a learning claim.
 */
export type CoreEvidenceRole = (typeof CORE_EVIDENCE_ROLES)[number];
