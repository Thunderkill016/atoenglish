import {
  COMMUNICATION_ACTIVITIES,
  LANGUAGE_SYSTEM_FAMILIES,
  buildOntologyGraph,
  type CommunicationActivity,
  type CommunicationActivityOntologyNode,
  type CoreEvidenceRole,
  type LanguageSystemFamily,
  type LanguageSystemOntologyNode,
  type OntologyBuildResult,
  type OntologyModality,
  type OntologyNode,
  type SkillNodeKind,
} from "./ontology";

const HUMAN_LABELS: Record<LanguageSystemFamily | CommunicationActivity, string> = {
  "phonetics-phonology": "Phonetics and phonology",
  orthography: "Orthography",
  morphology: "Morphology",
  "lexis-phraseology": "Lexis and phraseology",
  "syntax-grammar": "Syntax and grammar",
  semantics: "Semantics",
  "pragmatics-sociolinguistics": "Pragmatics and sociolinguistics",
  "discourse-genre": "Discourse and genre",
  "processing-strategic-competence": "Processing and strategic competence",
  "listening-reception": "Listening reception",
  "audiovisual-reception": "Audiovisual reception",
  "reading-reception": "Reading reception",
  "spoken-production": "Spoken production",
  "written-production": "Written production",
  "spoken-interaction": "Spoken interaction",
  "written-interaction": "Written interaction",
  "text-mediation": "Text mediation",
  "concept-mediation": "Concept mediation",
  "communication-mediation": "Communication mediation",
  "multimodal-interaction": "Multimodal interaction",
};

function languageSystemNode(family: LanguageSystemFamily): LanguageSystemOntologyNode {
  return {
    id: `nep.en.v1.language-system.${family}`,
    contractVersion: 1,
    domain: "language-system",
    family,
    label: HUMAN_LABELS[family],
    definition: `Top-level scope for ${HUMAN_LABELS[family].toLowerCase()} constructs.`,
    kind: family === "processing-strategic-competence" ? "strategy" : "knowledge",
    granularity: "domain-capability",
    modalities: ["multimodal"],
    taskConstraints: [],
    contextConstraints: [],
    allowedEvidenceRoles: ["meaning-recognition", "free-recall", "near-transfer"],
    sources: [],
  };
}

export type CanonicalActivityProfile = {
  readonly kind: SkillNodeKind;
  readonly modalities: readonly OntologyModality[];
  readonly allowedEvidenceRoles: readonly CoreEvidenceRole[];
};

export const CANONICAL_ACTIVITY_PROFILES: Record<CommunicationActivity, CanonicalActivityProfile> = {
  "listening-reception": {
    kind: "perception",
    modalities: ["audio-input"],
    allowedEvidenceRoles: ["receptive-discrimination", "meaning-recognition"],
  },
  "audiovisual-reception": {
    kind: "perception",
    modalities: ["audiovisual-input"],
    allowedEvidenceRoles: ["receptive-discrimination", "meaning-recognition"],
  },
  "reading-reception": {
    kind: "perception",
    modalities: ["text-input"],
    allowedEvidenceRoles: ["receptive-discrimination", "meaning-recognition"],
  },
  "spoken-production": {
    kind: "production",
    modalities: ["speech-output"],
    allowedEvidenceRoles: ["controlled-production", "free-production", "near-transfer"],
  },
  "written-production": {
    kind: "production",
    modalities: ["text-output"],
    allowedEvidenceRoles: ["controlled-production", "free-production", "near-transfer"],
  },
  "spoken-interaction": {
    kind: "interaction",
    modalities: ["live-interaction"],
    allowedEvidenceRoles: ["free-production", "interactional-repair", "near-transfer"],
  },
  "written-interaction": {
    kind: "interaction",
    modalities: ["text-input", "text-output"],
    allowedEvidenceRoles: ["free-production", "interactional-repair", "near-transfer"],
  },
  "multimodal-interaction": {
    kind: "interaction",
    modalities: ["multimodal"],
    allowedEvidenceRoles: ["free-production", "interactional-repair", "near-transfer"],
  },
  "text-mediation": {
    kind: "mediation",
    modalities: ["text-input", "text-output"],
    allowedEvidenceRoles: ["controlled-production", "free-production", "near-transfer"],
  },
  "concept-mediation": {
    kind: "mediation",
    modalities: ["multimodal"],
    allowedEvidenceRoles: ["controlled-production", "free-production", "near-transfer"],
  },
  "communication-mediation": {
    kind: "mediation",
    modalities: ["multimodal"],
    allowedEvidenceRoles: ["controlled-production", "free-production", "near-transfer"],
  },
};

function activityNode(activity: CommunicationActivity): CommunicationActivityOntologyNode {
  const profile = CANONICAL_ACTIVITY_PROFILES[activity];
  return {
    id: `nep.en.v1.communication-activity.${activity}`,
    contractVersion: 1,
    domain: "communication-activity",
    activity,
    label: HUMAN_LABELS[activity],
    definition: `Top-level scope for ${HUMAN_LABELS[activity].toLowerCase()} tasks.`,
    kind: profile.kind,
    granularity: "task-capability",
    modalities: profile.modalities,
    taskConstraints: [],
    contextConstraints: [],
    allowedEvidenceRoles: profile.allowedEvidenceRoles,
    sources: [],
  };
}

export const ENGLISH_ONTOLOGY_V1_SEED_NODES: readonly OntologyNode[] = Object.freeze([
  ...LANGUAGE_SYSTEM_FAMILIES.map(languageSystemNode),
  ...COMMUNICATION_ACTIVITIES.map(activityNode),
]);

export function buildEnglishOntologyV1(): OntologyBuildResult {
  return buildOntologyGraph({ nodes: ENGLISH_ONTOLOGY_V1_SEED_NODES });
}
