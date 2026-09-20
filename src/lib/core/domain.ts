import type { ResponseModality } from "@/lib/learning/evidence";

import type { CoreEvidenceRole } from "./evidence-role";

export const LANGUAGE_SYSTEMS = [
  "phonetics",
  "phonology",
  "prosody",
  "orthography",
  "morphology",
  "lexis",
  "phraseology",
  "grammar",
  "syntax",
  "semantics",
  "pragmatics",
  "sociolinguistics",
  "discourse",
  "genre",
  "processing",
  "strategy",
  "metacognition",
] as const;

export type LanguageSystem = (typeof LANGUAGE_SYSTEMS)[number];

export const COMMUNICATION_ACTIVITIES = [
  "listening-reception",
  "audiovisual-reception",
  "reading-reception",
  "spoken-production",
  "written-production",
  "spoken-interaction",
  "written-interaction",
  "text-mediation",
  "concept-mediation",
  "communication-mediation",
  "multimodal-interaction",
] as const;

export type CommunicationActivity = (typeof COMMUNICATION_ACTIVITIES)[number];

export const SKILL_NODE_KINDS = [
  "knowledge",
  "perception",
  "retrieval",
  "production",
  "interaction",
  "mediation",
  "strategy",
  "automaticity",
  "metacognition",
  "composite",
] as const;

export type SkillNodeKind = (typeof SKILL_NODE_KINDS)[number];

export const SKILL_RELATION_TYPES = [
  "prerequisite-of",
  "component-of",
  "enables",
  "contrasts-with",
  "confusable-with",
  "commonly-cooccurs-with",
  "variant-of",
  "register-variant-of",
  "realization-of",
  "requires-context",
  "transfers-to",
  "remediated-by",
  "assessed-by",
] as const;

export type SkillRelationType = (typeof SKILL_RELATION_TYPES)[number];

export const ACYCLIC_SKILL_RELATION_TYPES = [
  "prerequisite-of",
  "component-of",
  "enables",
] as const satisfies readonly SkillRelationType[];

export type CoreSourceRef = {
  sourceId: string;
  version?: string;
  locator?: string;
};

export type SkillNode = {
  id: string;
  version: number;
  title: string;
  description: string;
  kind: SkillNodeKind;
  systems: LanguageSystem[];
  activities: CommunicationActivity[];
  allowedEvidence: CoreEvidenceRole[];
  allowedResponses: ResponseModality[];
  tags: string[];
  sources: CoreSourceRef[];
};

export type SkillRelation = {
  from: string;
  to: string;
  type: SkillRelationType;
  weight?: number;
  contextTags?: string[];
};

export type SkillGraph = {
  version: string;
  nodes: SkillNode[];
  relations: SkillRelation[];
};

export type SkillGraphProblem =
  | { type: "duplicate-node"; nodeId: string }
  | { type: "self-relation"; nodeId: string; relation: SkillRelationType }
  | { type: "missing-node"; nodeId: string; relation: SkillRelationType }
  | { type: "dependency-cycle"; relation: SkillRelationType; path: string[] };

/**
 * Persistence-neutral structural validation. Pedagogical validity and benchmark validity are
 * separate gates; this function prevents malformed or cyclic dependency topology from entering
 * the core. Associative relations such as `confusable-with` are intentionally allowed to cycle.
 */
export function validateSkillGraph(graph: SkillGraph): SkillGraphProblem[] {
  const problems: SkillGraphProblem[] = [];
  const seen = new Set<string>();

  for (const node of graph.nodes) {
    if (seen.has(node.id)) {
      problems.push({ type: "duplicate-node", nodeId: node.id });
    }
    seen.add(node.id);
  }

  for (const relation of graph.relations) {
    if (relation.from === relation.to) {
      problems.push({ type: "self-relation", nodeId: relation.from, relation: relation.type });
    }

    if (!seen.has(relation.from)) {
      problems.push({ type: "missing-node", nodeId: relation.from, relation: relation.type });
    }
    if (!seen.has(relation.to)) {
      problems.push({ type: "missing-node", nodeId: relation.to, relation: relation.type });
    }
  }

  for (const relationType of ACYCLIC_SKILL_RELATION_TYPES) {
    const cycle = findDirectedCycle(graph, relationType, seen);
    if (cycle) {
      problems.push({ type: "dependency-cycle", relation: relationType, path: cycle });
    }
  }

  return problems;
}

function findDirectedCycle(
  graph: SkillGraph,
  relationType: SkillRelationType,
  knownNodes: Set<string>,
): string[] | null {
  const adjacency = new Map<string, string[]>();

  for (const relation of graph.relations) {
    if (relation.type !== relationType) continue;
    if (!knownNodes.has(relation.from) || !knownNodes.has(relation.to)) continue;
    const targets = adjacency.get(relation.from) ?? [];
    targets.push(relation.to);
    adjacency.set(relation.from, targets);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  const visit = (nodeId: string): string[] | null => {
    if (visiting.has(nodeId)) {
      const start = stack.indexOf(nodeId);
      return [...stack.slice(start), nodeId];
    }
    if (visited.has(nodeId)) return null;

    visiting.add(nodeId);
    stack.push(nodeId);

    for (const next of adjacency.get(nodeId) ?? []) {
      const cycle = visit(next);
      if (cycle) return cycle;
    }

    stack.pop();
    visiting.delete(nodeId);
    visited.add(nodeId);
    return null;
  };

  for (const nodeId of knownNodes) {
    const cycle = visit(nodeId);
    if (cycle) return cycle;
  }

  return null;
}
