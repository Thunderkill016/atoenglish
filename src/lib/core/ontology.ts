import { COMMUNICATION_ACTIVITIES, SKILL_NODE_KINDS } from "./domain";
import type { CommunicationActivity, SkillNodeKind } from "./domain";
import { CORE_EVIDENCE_ROLES } from "./evidence-role";
import type { CoreEvidenceRole } from "./evidence-role";

export const ONTOLOGY_CONTRACT_ID = "nep.english-ontology.v1" as const;
export const ONTOLOGY_NODE_ID_PATTERN = /^nep\.en\.v1\.(language-system|communication-activity)\.[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const LANGUAGE_SYSTEM_FAMILIES = [
  "phonetics-phonology",
  "orthography",
  "morphology",
  "lexis-phraseology",
  "syntax-grammar",
  "semantics",
  "pragmatics-sociolinguistics",
  "discourse-genre",
  "processing-strategic-competence",
] as const;
export type LanguageSystemFamily = (typeof LANGUAGE_SYSTEM_FAMILIES)[number];

export const ONTOLOGY_GRANULARITIES = [
  "feature",
  "phone",
  "syllable",
  "word-form",
  "phrase",
  "construction",
  "sentence-turn",
  "discourse-move",
  "task-capability",
  "domain-capability",
] as const;
export type OntologyGranularity = (typeof ONTOLOGY_GRANULARITIES)[number];

export const ONTOLOGY_MODALITIES = [
  "text-input",
  "text-output",
  "audio-input",
  "speech-output",
  "audiovisual-input",
  "live-interaction",
  "multimodal",
] as const;
export type OntologyModality = (typeof ONTOLOGY_MODALITIES)[number];

export const ONTOLOGY_RELATION_TYPES = [
  "prerequisite-of",
  "component-of",
  "enables",
  "contrasts-with",
  "confusable-with",
  "variant-of",
  "register-variant-of",
  "realization-of",
  "requires-context",
  "transfers-to",
  "remediated-by",
  "assessed-by",
] as const;
export type OntologyRelationType = (typeof ONTOLOGY_RELATION_TYPES)[number];

export const SYMMETRIC_ONTOLOGY_RELATION_TYPES = ["contrasts-with", "confusable-with"] as const;
export const ACYCLIC_ONTOLOGY_RELATION_TYPES = [
  "prerequisite-of",
  "component-of",
  "enables",
] as const;

export const ONTOLOGY_SUPPORT_LEVELS = ["none", "limited", "guided"] as const;
export type OntologySupportLevel = (typeof ONTOLOGY_SUPPORT_LEVELS)[number];

export const CONTEXT_DIMENSIONS = [
  "audience",
  "channel",
  "domain",
  "register",
  "setting",
] as const;
export type ContextDimension = (typeof CONTEXT_DIMENSIONS)[number];

export type OntologyTaskConstraint = {
  readonly taskType: string;
  readonly supportLevel?: OntologySupportLevel;
};

export type OntologyContextConstraint = {
  readonly dimension: ContextDimension;
  readonly value: string;
};

export type OntologySourceRef = {
  readonly sourceId: string;
  readonly version: string;
  readonly locator?: string;
};

type OntologyNodeBase = {
  readonly id: string;
  readonly contractVersion: 1;
  readonly label: string;
  readonly definition: string;
  readonly kind: SkillNodeKind;
  readonly granularity: OntologyGranularity;
  readonly modalities: readonly OntologyModality[];
  readonly taskConstraints: readonly OntologyTaskConstraint[];
  readonly contextConstraints: readonly OntologyContextConstraint[];
  /** Compatibility only: this never records an observation or certifies learner state. */
  readonly allowedEvidenceRoles: readonly CoreEvidenceRole[];
  readonly sources: readonly OntologySourceRef[];
};

export type LanguageSystemOntologyNode = OntologyNodeBase & {
  readonly domain: "language-system";
  readonly family: LanguageSystemFamily;
};

export type CommunicationActivityOntologyNode = OntologyNodeBase & {
  readonly domain: "communication-activity";
  readonly activity: CommunicationActivity;
};

export type OntologyNode = LanguageSystemOntologyNode | CommunicationActivityOntologyNode;

export type OntologyRelation = {
  readonly from: string;
  readonly to: string;
  readonly type: OntologyRelationType;
  readonly contextTags?: readonly string[];
};

export const LICENSE_CLASSIFICATIONS = [
  "open",
  "copyrighted-reference",
  "proprietary",
] as const;
export type LicenseClassification = (typeof LICENSE_CLASSIFICATIONS)[number];

export const PERMITTED_EXTERNAL_USES = [
  "reference-only",
  "research",
  "redistribution",
  "production",
] as const;
export type PermittedExternalUse = (typeof PERMITTED_EXTERNAL_USES)[number];

export const FRAMEWORK_MAPPINGS = [
  "exact",
  "close",
  "broad",
  "narrow",
  "related",
] as const;
export type FrameworkMapping = (typeof FRAMEWORK_MAPPINGS)[number];

export const OVERLAY_REVIEW_STATUSES = [
  "unreviewed",
  "reviewed-reference",
] as const;
export type OverlayReviewStatus = (typeof OVERLAY_REVIEW_STATUSES)[number];

export type ExternalProvenance = {
  readonly sourceId: string;
  readonly version: string;
  readonly locator: string;
  readonly license: {
    readonly classification: LicenseClassification;
    readonly permittedUse: PermittedExternalUse;
  };
};

export type FrameworkCrosswalk = {
  readonly id: string;
  readonly nodeId: string;
  readonly frameworkId: string;
  readonly frameworkVersion: string;
  readonly externalTargetId: string;
  readonly mapping: FrameworkMapping;
  readonly provenance: ExternalProvenance;
};

export type LearnerHypothesisOverlay = {
  readonly id: string;
  readonly nodeId: string;
  readonly populationTag: string;
  readonly hypothesis: string;
  readonly reviewStatus: OverlayReviewStatus;
  readonly provenance: ExternalProvenance;
};

export type OntologyGraphInput = {
  readonly nodes: readonly OntologyNode[];
  readonly relations?: readonly OntologyRelation[];
  readonly crosswalks?: readonly FrameworkCrosswalk[];
  readonly overlays?: readonly LearnerHypothesisOverlay[];
};

export type OntologyGraph = {
  readonly contractId: typeof ONTOLOGY_CONTRACT_ID;
  readonly nodes: readonly Readonly<OntologyNode>[];
  readonly relations: readonly Readonly<OntologyRelation>[];
  readonly crosswalks: readonly Readonly<FrameworkCrosswalk>[];
  readonly overlays: readonly Readonly<LearnerHypothesisOverlay>[];
};

export type OntologyProblemCode =
  | "dependency-cycle"
  | "duplicate-crosswalk"
  | "duplicate-node"
  | "duplicate-overlay"
  | "duplicate-relation"
  | "forbidden-authority-field"
  | "invalid-activity"
  | "invalid-compatibility"
  | "invalid-family"
  | "invalid-id"
  | "invalid-node"
  | "invalid-provenance"
  | "invalid-relation"
  | "missing-node"
  | "self-relation";

export type OntologyProblem = {
  readonly code: OntologyProblemCode;
  readonly subject: string;
  readonly detail: string;
};

export type OntologyBuildResult =
  | { readonly ok: true; readonly graph: OntologyGraph }
  | { readonly ok: false; readonly problems: readonly OntologyProblem[] };

const INPUT_MODALITIES = new Set<OntologyModality>([
  "text-input",
  "audio-input",
  "audiovisual-input",
  "live-interaction",
  "multimodal",
]);
const OUTPUT_MODALITIES = new Set<OntologyModality>([
  "text-output",
  "speech-output",
  "live-interaction",
  "multimodal",
]);
const RECEPTIVE_EVIDENCE = new Set<CoreEvidenceRole>([
  "receptive-discrimination",
  "meaning-recognition",
]);
const PRODUCTIVE_EVIDENCE = new Set<CoreEvidenceRole>([
  "controlled-production",
  "free-production",
  "interactional-repair",
  "near-transfer",
  "far-transfer",
]);
export const FORBIDDEN_AUTHORITY_FIELDS = new Set([
  "authority",
  "authorityGrant",
  "calibration",
  "evidence",
  "mastery",
  "observation",
  "promotion",
  "replacementNode",
]);

const LANGUAGE_SYSTEM_NODE_KEYS = new Set([
  "id",
  "contractVersion",
  "domain",
  "family",
  "label",
  "definition",
  "kind",
  "granularity",
  "modalities",
  "taskConstraints",
  "contextConstraints",
  "allowedEvidenceRoles",
  "sources",
]);

const COMMUNICATION_ACTIVITY_NODE_KEYS = new Set([
  "id",
  "contractVersion",
  "domain",
  "activity",
  "label",
  "definition",
  "kind",
  "granularity",
  "modalities",
  "taskConstraints",
  "contextConstraints",
  "allowedEvidenceRoles",
  "sources",
]);

const TASK_CONSTRAINT_KEYS = new Set(["taskType", "supportLevel"]);
const CONTEXT_CONSTRAINT_KEYS = new Set(["dimension", "value"]);
const SOURCE_REF_KEYS = new Set(["sourceId", "version", "locator"]);
const PROVENANCE_KEYS = new Set(["sourceId", "version", "locator", "license"]);
const LICENSE_KEYS = new Set(["classification", "permittedUse"]);
const CROSSWALK_KEYS = new Set([
  "id",
  "nodeId",
  "frameworkId",
  "frameworkVersion",
  "externalTargetId",
  "mapping",
  "provenance",
]);
const OVERLAY_KEYS = new Set([
  "id",
  "nodeId",
  "populationTag",
  "hypothesis",
  "reviewStatus",
  "provenance",
]);
const RELATION_KEYS = new Set(["from", "to", "type", "contextTags"]);

export function buildOntologyGraph(input: OntologyGraphInput): OntologyBuildResult {
  const problems: OntologyProblem[] = [];
  const nodeIds = validateNodes(input.nodes, problems);
  const relations = normalizeRelations(input.relations ?? [], nodeIds, problems);
  validateDependencyCycles(relations, nodeIds, problems);
  validateExternalRecords(input.crosswalks ?? [], "crosswalk", nodeIds, problems);
  validateExternalRecords(input.overlays ?? [], "overlay", nodeIds, problems);

  if (problems.length > 0) {
    return { ok: false, problems: Object.freeze(problems.sort(compareProblems)) };
  }

  const graph: OntologyGraph = {
    contractId: ONTOLOGY_CONTRACT_ID,
    nodes: Object.freeze([...input.nodes].sort((a, b) => a.id.localeCompare(b.id)).map(freezeNode)),
    relations: Object.freeze(relations.map(freezeRelation)),
    crosswalks: Object.freeze(
      [...(input.crosswalks ?? [])].sort((a, b) => a.id.localeCompare(b.id)).map(freezeExternal),
    ),
    overlays: Object.freeze(
      [...(input.overlays ?? [])].sort((a, b) => a.id.localeCompare(b.id)).map(freezeExternal),
    ),
  };

  return { ok: true, graph: Object.freeze(graph) };
}

function validateNodes(nodes: readonly OntologyNode[], problems: OntologyProblem[]): Set<string> {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (typeof node !== "object" || node === null || Array.isArray(node)) {
      addProblem(problems, "invalid-node", "unknown", "Node must be an object");
      continue;
    }
    const raw = node as unknown as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id : "unknown";
    if (ids.has(id)) addProblem(problems, "duplicate-node", id, "Node ID occurs more than once");
    ids.add(id);

    const domain = raw.domain;
    if (domain !== "language-system" && domain !== "communication-activity") {
      addProblem(problems, "invalid-node", id, `Unknown or missing domain: ${String(domain)}`);
    }

    if (!ONTOLOGY_NODE_ID_PATTERN.test(id)) {
      addProblem(problems, "invalid-id", id, "Node ID must use the nep.en.v1 namespace");
    } else {
      if (domain === "language-system" && !id.startsWith("nep.en.v1.language-system.")) {
        addProblem(problems, "invalid-id", id, "Node ID domain segment must match node.domain 'language-system'");
      } else if (domain === "communication-activity" && !id.startsWith("nep.en.v1.communication-activity.")) {
        addProblem(problems, "invalid-id", id, "Node ID domain segment must match node.domain 'communication-activity'");
      }
    }

    const allowedKeys =
      domain === "communication-activity"
        ? COMMUNICATION_ACTIVITY_NODE_KEYS
        : LANGUAGE_SYSTEM_NODE_KEYS;
    for (const key of Object.keys(raw)) {
      if (FORBIDDEN_AUTHORITY_FIELDS.has(key)) {
        addProblem(problems, "forbidden-authority-field", id, key);
      } else if (!allowedKeys.has(key)) {
        addProblem(problems, "invalid-node", id, `Unexpected property: ${key}`);
      }
    }

    if (domain === "language-system") {
      if (raw.activity !== undefined) {
        addProblem(problems, "invalid-node", id, "Language-system node must not have activity property");
      }
      if (
        typeof raw.family !== "string" ||
        !LANGUAGE_SYSTEM_FAMILIES.includes(raw.family as LanguageSystemFamily)
      ) {
        addProblem(problems, "invalid-family", id, `Unknown or missing family: ${String(raw.family)}`);
      }
    } else if (domain === "communication-activity") {
      if (raw.family !== undefined) {
        addProblem(problems, "invalid-node", id, "Communication-activity node must not have family property");
      }
      if (
        typeof raw.activity !== "string" ||
        !COMMUNICATION_ACTIVITIES.includes(raw.activity as CommunicationActivity)
      ) {
        addProblem(problems, "invalid-activity", id, `Unknown or missing activity: ${String(raw.activity)}`);
      }
    }

    if (
      node.contractVersion !== 1 ||
      typeof node.label !== "string" ||
      !node.label.trim() ||
      typeof node.definition !== "string" ||
      !node.definition.trim() ||
      !SKILL_NODE_KINDS.includes(node.kind) ||
      !ONTOLOGY_GRANULARITIES.includes(node.granularity)
    ) {
      addProblem(
        problems,
        "invalid-node",
        id,
        "Version, label, definition, kind, or granularity is invalid",
      );
    }

    validateTaskConstraints(node, problems);
    validateContextConstraints(node, problems);
    validateSourceRefs(node, problems);
    validateCompatibility(node, problems);
  }
  return ids;
}

function validateTaskConstraints(node: OntologyNode, problems: OntologyProblem[]): void {
  if (!Array.isArray(node.taskConstraints)) {
    addProblem(problems, "invalid-compatibility", node.id, "taskConstraints must be an array");
    return;
  }
  for (const tc of node.taskConstraints) {
    if (typeof tc !== "object" || tc === null || Array.isArray(tc)) {
      addProblem(problems, "invalid-compatibility", node.id, "Task constraint must be an object");
      continue;
    }
    const raw = tc as Record<string, unknown>;
    for (const key of Object.keys(raw)) {
      if (FORBIDDEN_AUTHORITY_FIELDS.has(key)) {
        addProblem(problems, "forbidden-authority-field", node.id, `taskConstraints.${key}`);
      } else if (!TASK_CONSTRAINT_KEYS.has(key)) {
        addProblem(problems, "invalid-compatibility", node.id, `Unexpected property in task constraint: ${key}`);
      }
    }
    if (typeof raw.taskType !== "string" || !raw.taskType.trim()) {
      addProblem(problems, "invalid-compatibility", node.id, "Task constraint requires non-empty taskType");
    }
    if (
      raw.supportLevel !== undefined &&
      (typeof raw.supportLevel !== "string" ||
        !(ONTOLOGY_SUPPORT_LEVELS as readonly string[]).includes(raw.supportLevel))
    ) {
      addProblem(
        problems,
        "invalid-compatibility",
        node.id,
        `Invalid task constraint supportLevel: ${String(raw.supportLevel)}`,
      );
    }
  }
}

function validateContextConstraints(node: OntologyNode, problems: OntologyProblem[]): void {
  if (!Array.isArray(node.contextConstraints)) {
    addProblem(problems, "invalid-compatibility", node.id, "contextConstraints must be an array");
    return;
  }
  for (const cc of node.contextConstraints) {
    if (typeof cc !== "object" || cc === null || Array.isArray(cc)) {
      addProblem(problems, "invalid-compatibility", node.id, "Context constraint must be an object");
      continue;
    }
    const raw = cc as Record<string, unknown>;
    for (const key of Object.keys(raw)) {
      if (FORBIDDEN_AUTHORITY_FIELDS.has(key)) {
        addProblem(problems, "forbidden-authority-field", node.id, `contextConstraints.${key}`);
      } else if (!CONTEXT_CONSTRAINT_KEYS.has(key)) {
        addProblem(problems, "invalid-compatibility", node.id, `Unexpected property in context constraint: ${key}`);
      }
    }
    if (
      typeof raw.dimension !== "string" ||
      !(CONTEXT_DIMENSIONS as readonly string[]).includes(raw.dimension as ContextDimension)
    ) {
      addProblem(
        problems,
        "invalid-compatibility",
        node.id,
        `Invalid context constraint dimension: ${String(raw.dimension)}`,
      );
    }
    if (typeof raw.value !== "string" || !raw.value.trim()) {
      addProblem(problems, "invalid-compatibility", node.id, "Context constraint requires non-empty value");
    }
  }
}

function validateSourceRefs(node: OntologyNode, problems: OntologyProblem[]): void {
  if (!Array.isArray(node.sources)) {
    addProblem(problems, "invalid-provenance", node.id, "sources must be an array");
    return;
  }
  for (const src of node.sources) {
    if (typeof src !== "object" || src === null || Array.isArray(src)) {
      addProblem(problems, "invalid-provenance", node.id, "Source ref must be an object");
      continue;
    }
    const raw = src as Record<string, unknown>;
    for (const key of Object.keys(raw)) {
      if (FORBIDDEN_AUTHORITY_FIELDS.has(key)) {
        addProblem(problems, "forbidden-authority-field", node.id, `sources.${key}`);
      } else if (!SOURCE_REF_KEYS.has(key)) {
        addProblem(problems, "invalid-provenance", node.id, `Unexpected property in source ref: ${key}`);
      }
    }
    if (typeof raw.sourceId !== "string" || !raw.sourceId.trim()) {
      addProblem(problems, "invalid-provenance", node.id, "Source ref requires non-empty sourceId");
    }
    if (typeof raw.version !== "string" || !raw.version.trim()) {
      addProblem(problems, "invalid-provenance", node.id, "Source ref requires non-empty version");
    }
    if (raw.locator !== undefined && (typeof raw.locator !== "string" || !raw.locator.trim())) {
      addProblem(
        problems,
        "invalid-provenance",
        node.id,
        "Source ref locator must be a non-empty string when provided",
      );
    }
  }
}

function validateCompatibility(node: OntologyNode, problems: OntologyProblem[]): void {
  if (
    !Array.isArray(node.modalities) ||
    node.modalities.length === 0 ||
    !Array.isArray(node.allowedEvidenceRoles) ||
    node.allowedEvidenceRoles.length === 0
  ) {
    addProblem(problems, "invalid-compatibility", node.id, "Modalities and evidence roles must be non-empty");
    return;
  }
  if (!node.modalities.every((value) => ONTOLOGY_MODALITIES.includes(value))) {
    addProblem(problems, "invalid-compatibility", node.id, "Unknown modality");
  }
  if (!node.allowedEvidenceRoles.every((value) => CORE_EVIDENCE_ROLES.includes(value))) {
    addProblem(problems, "invalid-compatibility", node.id, "Unknown evidence role");
  }
  if (node.kind === "perception" && !node.modalities.some((value) => INPUT_MODALITIES.has(value))) {
    addProblem(problems, "invalid-compatibility", node.id, "Perception requires an input modality");
  }
  if (node.kind === "perception" && !node.allowedEvidenceRoles.some((value) => RECEPTIVE_EVIDENCE.has(value))) {
    addProblem(problems, "invalid-compatibility", node.id, "Perception requires a receptive evidence role");
  }
  if (node.kind === "production" && !node.modalities.some((value) => OUTPUT_MODALITIES.has(value))) {
    addProblem(problems, "invalid-compatibility", node.id, "Production requires an output modality");
  }
  if (node.kind === "production" && !node.allowedEvidenceRoles.some((value) => PRODUCTIVE_EVIDENCE.has(value))) {
    addProblem(problems, "invalid-compatibility", node.id, "Production requires a productive evidence role");
  }
  const hasInteractionModality =
    node.modalities.some((value) => value === "live-interaction" || value === "multimodal") ||
    (node.modalities.some((value) => INPUT_MODALITIES.has(value)) &&
      node.modalities.some((value) => OUTPUT_MODALITIES.has(value)));
  if (node.kind === "interaction" && !hasInteractionModality) {
    addProblem(
      problems,
      "invalid-compatibility",
      node.id,
      "Interaction requires an interaction modality or bidirectional input/output modalities",
    );
  }
}

function normalizeRelations(
  relations: readonly OntologyRelation[],
  nodeIds: ReadonlySet<string>,
  problems: OntologyProblem[],
): OntologyRelation[] {
  const normalized: OntologyRelation[] = [];
  const keys = new Set<string>();
  for (const relation of relations) {
    if (typeof relation !== "object" || relation === null || Array.isArray(relation)) {
      addProblem(problems, "invalid-relation", "unknown", "Relation must be an object");
      continue;
    }
    const raw = relation as unknown as Record<string, unknown>;
    const rawFrom = raw.from;
    const rawTo = raw.to;
    const subject = `${String(rawFrom ?? "unknown")}->${String(rawTo ?? "unknown")}`;
    for (const key of Object.keys(raw)) {
      if (FORBIDDEN_AUTHORITY_FIELDS.has(key)) {
        addProblem(problems, "forbidden-authority-field", subject, key);
      } else if (!RELATION_KEYS.has(key)) {
        addProblem(problems, "invalid-relation", subject, `Unexpected property in relation: ${key}`);
      }
    }

    let hasFieldProblem = false;
    if (typeof raw.type !== "string" || !(ONTOLOGY_RELATION_TYPES as readonly string[]).includes(raw.type as OntologyRelationType)) {
      addProblem(
        problems,
        "invalid-relation",
        subject,
        `Invalid relation type: ${String(raw.type)}`,
      );
      hasFieldProblem = true;
    }

    if (typeof rawFrom !== "string" || !rawFrom.trim()) {
      addProblem(problems, "invalid-relation", subject, "Relation 'from' must be a non-empty string");
      hasFieldProblem = true;
    }

    if (typeof rawTo !== "string" || !rawTo.trim()) {
      addProblem(problems, "invalid-relation", subject, "Relation 'to' must be a non-empty string");
      hasFieldProblem = true;
    }

    let validatedTags: string[] | undefined = undefined;
    if (raw.contextTags !== undefined) {
      if (!Array.isArray(raw.contextTags)) {
        addProblem(problems, "invalid-relation", subject, "Relation 'contextTags' must be an array of strings");
        hasFieldProblem = true;
      } else {
        const cleanTags: string[] = [];
        for (const tag of raw.contextTags) {
          if (typeof tag !== "string" || !tag.trim()) {
            addProblem(
              problems,
              "invalid-relation",
              subject,
              "Relation 'contextTags' elements must be non-empty strings",
            );
            hasFieldProblem = true;
            break;
          }
          cleanTags.push(tag.trim());
        }
        if (!hasFieldProblem) {
          validatedTags = cleanTags.sort();
        }
      }
    }

    if (hasFieldProblem) {
      continue;
    }

    let from = rawFrom as string;
    let to = rawTo as string;
    const type = raw.type as OntologyRelationType;

    if (
      (SYMMETRIC_ONTOLOGY_RELATION_TYPES as readonly OntologyRelationType[]).includes(type) &&
      from.localeCompare(to) > 0
    ) {
      [from, to] = [to, from];
    }
    let hasTopologyProblem = false;
    if (from === to) {
      addProblem(problems, "self-relation", from, type);
      hasTopologyProblem = true;
    }
    if (!nodeIds.has(from)) {
      addProblem(problems, "missing-node", from, type);
      hasTopologyProblem = true;
    }
    if (!nodeIds.has(to)) {
      addProblem(problems, "missing-node", to, type);
      hasTopologyProblem = true;
    }
    const key = `${type}\u0000${from}\u0000${to}\u0000${(validatedTags ?? []).join("\u0000")}`;
    if (keys.has(key)) {
      addProblem(problems, "duplicate-relation", `${from}->${to}`, type);
    } else {
      keys.add(key);
      if (!hasTopologyProblem) {
        normalized.push(
          Object.freeze({
            from,
            to,
            type,
            ...(validatedTags && validatedTags.length > 0
              ? { contextTags: Object.freeze(validatedTags) }
              : {}),
          }),
        );
      }
    }
  }
  return normalized.sort(compareRelations);
}

function validateDependencyCycles(
  relations: readonly OntologyRelation[],
  nodeIds: ReadonlySet<string>,
  problems: OntologyProblem[],
): void {
  for (const type of ACYCLIC_ONTOLOGY_RELATION_TYPES) {
    const adjacency = new Map<string, string[]>();
    for (const relation of relations) {
      if (relation.type !== type || !nodeIds.has(relation.from) || !nodeIds.has(relation.to)) continue;
      adjacency.set(relation.from, [...(adjacency.get(relation.from) ?? []), relation.to]);
    }
    for (const targets of adjacency.values()) targets.sort();
    const visited = new Set<string>();
    const active = new Set<string>();
    const stack: string[] = [];
    const visit = (id: string): string[] | undefined => {
      if (active.has(id)) return [...stack.slice(stack.indexOf(id)), id];
      if (visited.has(id)) return undefined;
      active.add(id);
      stack.push(id);
      for (const target of adjacency.get(id) ?? []) {
        const cycle = visit(target);
        if (cycle) return cycle;
      }
      stack.pop();
      active.delete(id);
      visited.add(id);
      return undefined;
    };
    for (const id of [...nodeIds].sort()) {
      const cycle = visit(id);
      if (cycle) {
        addProblem(problems, "dependency-cycle", type, cycle.join(" -> "));
        break;
      }
    }
  }
}

function validateExternalRecords(
  records: readonly FrameworkCrosswalk[] | readonly LearnerHypothesisOverlay[],
  kind: "crosswalk" | "overlay",
  nodeIds: ReadonlySet<string>,
  problems: OntologyProblem[],
): void {
  const ids = new Set<string>();
  const allowedKeys = kind === "crosswalk" ? CROSSWALK_KEYS : OVERLAY_KEYS;
  for (const record of records) {
    if (typeof record !== "object" || record === null || Array.isArray(record)) {
      addProblem(problems, "invalid-node", "unknown", `${kind} record must be an object`);
      continue;
    }
    const raw = record as unknown as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id : "unknown";
    if (ids.has(id)) {
      addProblem(
        problems,
        kind === "crosswalk" ? "duplicate-crosswalk" : "duplicate-overlay",
        id,
        "ID occurs more than once",
      );
    }
    ids.add(id);

    for (const key of Object.keys(raw)) {
      if (FORBIDDEN_AUTHORITY_FIELDS.has(key) || !allowedKeys.has(key)) {
        addProblem(problems, "forbidden-authority-field", id, key);
      }
    }

    if (typeof raw.nodeId !== "string" || !raw.nodeId.trim()) {
      addProblem(problems, "invalid-node", id, `${kind} requires non-empty nodeId`);
    } else if (!nodeIds.has(raw.nodeId)) {
      addProblem(problems, "missing-node", raw.nodeId, kind);
    }

    if (kind === "crosswalk") {
      if (typeof raw.frameworkId !== "string" || !raw.frameworkId.trim()) {
        addProblem(problems, "invalid-provenance", id, "Crosswalk requires non-empty frameworkId");
      }
      if (typeof raw.frameworkVersion !== "string" || !raw.frameworkVersion.trim()) {
        addProblem(problems, "invalid-provenance", id, "Crosswalk requires non-empty frameworkVersion");
      }
      if (typeof raw.externalTargetId !== "string" || !raw.externalTargetId.trim()) {
        addProblem(problems, "invalid-provenance", id, "Crosswalk requires non-empty externalTargetId");
      }
      if (
        typeof raw.mapping !== "string" ||
        !(FRAMEWORK_MAPPINGS as readonly string[]).includes(raw.mapping as FrameworkMapping)
      ) {
        addProblem(problems, "invalid-compatibility", id, `Invalid crosswalk mapping: ${String(raw.mapping)}`);
      }
    } else {
      if (typeof raw.populationTag !== "string" || !raw.populationTag.trim()) {
        addProblem(problems, "invalid-node", id, "Overlay requires non-empty populationTag");
      }
      if (typeof raw.hypothesis !== "string" || !raw.hypothesis.trim()) {
        addProblem(problems, "invalid-node", id, "Overlay requires non-empty hypothesis");
      }
      if (
        typeof raw.reviewStatus !== "string" ||
        !(OVERLAY_REVIEW_STATUSES as readonly string[]).includes(raw.reviewStatus as OverlayReviewStatus)
      ) {
        addProblem(problems, "invalid-node", id, `Invalid overlay reviewStatus: ${String(raw.reviewStatus)}`);
      }
    }

    validateExternalProvenance(raw.provenance, id, problems);
  }
}

function validateExternalProvenance(
  provenance: unknown,
  subjectId: string,
  problems: OntologyProblem[],
): void {
  if (typeof provenance !== "object" || provenance === null || Array.isArray(provenance)) {
    addProblem(
      problems,
      "invalid-provenance",
      subjectId,
      "Complete versioned provenance and permitted use are required",
    );
    return;
  }
  const raw = provenance as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (FORBIDDEN_AUTHORITY_FIELDS.has(key)) {
      addProblem(problems, "forbidden-authority-field", subjectId, `provenance.${key}`);
    } else if (!PROVENANCE_KEYS.has(key)) {
      addProblem(problems, "invalid-provenance", subjectId, `Unexpected property in provenance: ${key}`);
    }
  }
  const hasStrings =
    typeof raw.sourceId === "string" &&
    raw.sourceId.trim().length > 0 &&
    typeof raw.version === "string" &&
    raw.version.trim().length > 0 &&
    typeof raw.locator === "string" &&
    raw.locator.trim().length > 0;
  if (!hasStrings) {
    addProblem(
      problems,
      "invalid-provenance",
      subjectId,
      "Complete versioned provenance and permitted use are required",
    );
  }

  if (typeof raw.license !== "object" || raw.license === null || Array.isArray(raw.license)) {
    addProblem(problems, "invalid-provenance", subjectId, "Provenance license must be an object");
    return;
  }
  const lic = raw.license as Record<string, unknown>;
  for (const key of Object.keys(lic)) {
    if (FORBIDDEN_AUTHORITY_FIELDS.has(key)) {
      addProblem(problems, "forbidden-authority-field", subjectId, `provenance.license.${key}`);
    } else if (!LICENSE_KEYS.has(key)) {
      addProblem(problems, "invalid-provenance", subjectId, `Unexpected property in provenance license: ${key}`);
    }
  }
  if (
    typeof lic.classification !== "string" ||
    !(LICENSE_CLASSIFICATIONS as readonly string[]).includes(lic.classification as LicenseClassification)
  ) {
    addProblem(
      problems,
      "invalid-provenance",
      subjectId,
      `Invalid license classification: ${String(lic.classification)}`,
    );
  }
  if (
    typeof lic.permittedUse !== "string" ||
    !(PERMITTED_EXTERNAL_USES as readonly string[]).includes(lic.permittedUse as PermittedExternalUse)
  ) {
    addProblem(
      problems,
      "invalid-provenance",
      subjectId,
      `Invalid permitted external use: ${String(lic.permittedUse)}`,
    );
  }
}

function freezeNode(node: OntologyNode): Readonly<OntologyNode> {
  return Object.freeze({
    ...node,
    modalities: Object.freeze([...node.modalities].sort()),
    taskConstraints: Object.freeze(
      [...node.taskConstraints].sort(compareJson).map((constraint) => Object.freeze({ ...constraint })),
    ),
    contextConstraints: Object.freeze(
      [...node.contextConstraints].sort(compareJson).map((constraint) =>
        Object.freeze({ ...constraint }),
      ),
    ),
    allowedEvidenceRoles: Object.freeze([...node.allowedEvidenceRoles].sort()),
    sources: Object.freeze(
      [...node.sources].sort(compareJson).map((source) => Object.freeze({ ...source })),
    ),
  });
}

function freezeRelation(relation: OntologyRelation): Readonly<OntologyRelation> {
  return Object.freeze({ ...relation, ...(relation.contextTags ? { contextTags: Object.freeze([...relation.contextTags]) } : {}) });
}

function freezeExternal<T extends FrameworkCrosswalk | LearnerHypothesisOverlay>(value: T): Readonly<T> {
  return Object.freeze({
    ...value,
    provenance: Object.freeze({ ...value.provenance, license: Object.freeze({ ...value.provenance.license }) }),
  }) as Readonly<T>;
}

function compareRelations(a: OntologyRelation, b: OntologyRelation): number {
  return `${a.type}\u0000${a.from}\u0000${a.to}\u0000${(a.contextTags ?? []).join("\u0000")}`.localeCompare(
    `${b.type}\u0000${b.from}\u0000${b.to}\u0000${(b.contextTags ?? []).join("\u0000")}`,
  );
}

function compareProblems(a: OntologyProblem, b: OntologyProblem): number {
  return `${a.code}\u0000${a.subject}\u0000${a.detail}`.localeCompare(`${b.code}\u0000${b.subject}\u0000${b.detail}`);
}

function compareJson(a: object, b: object): number {
  return JSON.stringify(a).localeCompare(JSON.stringify(b));
}

function addProblem(problems: OntologyProblem[], code: OntologyProblemCode, subject: string, detail: string): void {
  problems.push({ code, subject, detail });
}

export { COMMUNICATION_ACTIVITIES, CORE_EVIDENCE_ROLES, SKILL_NODE_KINDS };
export type { CommunicationActivity, CoreEvidenceRole, SkillNodeKind };
