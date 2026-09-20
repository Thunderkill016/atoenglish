import { describe, expect, it } from "vitest";

import { COMMUNICATION_ACTIVITIES as LEGACY_ACTIVITIES } from "./domain";
import { CORE_EVIDENCE_ROLES as LEGACY_EVIDENCE_ROLES } from "./evidence-role";
import {
  COMMUNICATION_ACTIVITIES,
  LANGUAGE_SYSTEM_FAMILIES,
  ONTOLOGY_CONTRACT_ID,
  buildOntologyGraph,
  type FrameworkCrosswalk,
  type LearnerHypothesisOverlay,
  type OntologyNode,
  type OntologyRelation,
} from "./ontology";
import {
  CANONICAL_ACTIVITY_PROFILES,
  ENGLISH_ONTOLOGY_V1_SEED_NODES,
  buildEnglishOntologyV1,
} from "./ontology-seed";

function node(id: string, overrides: Partial<OntologyNode> = {}): OntologyNode {
  return {
    id,
    contractVersion: 1,
    domain: "language-system",
    family: "semantics",
    label: id,
    definition: id,
    kind: "knowledge",
    granularity: "feature",
    modalities: ["multimodal"],
    taskConstraints: [],
    contextConstraints: [],
    allowedEvidenceRoles: ["meaning-recognition"],
    sources: [],
    ...overrides,
  } as OntologyNode;
}

function expectProblem(result: ReturnType<typeof buildOntologyGraph>, code: string): void {
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.problems.some((problem) => problem.code === code)).toBe(true);
}

describe("English ontology V1 seed", () => {
  it("covers exactly nine language systems and eleven independent activities", () => {
    const result = buildEnglishOntologyV1();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.graph.contractId).toBe(ONTOLOGY_CONTRACT_ID);
    expect(result.graph.nodes).toHaveLength(20);
    expect(result.graph.nodes.filter((item) => item.domain === "language-system").map((item) => item.family)).toEqual([...LANGUAGE_SYSTEM_FAMILIES].sort());
    expect(result.graph.nodes.filter((item) => item.domain === "communication-activity").map((item) => item.activity)).toEqual([...COMMUNICATION_ACTIVITIES].sort());
  });

  it("normalizes graph output independent of insertion order and freezes the result", () => {
    const forward = buildOntologyGraph({ nodes: ENGLISH_ONTOLOGY_V1_SEED_NODES });
    const reverse = buildOntologyGraph({ nodes: [...ENGLISH_ONTOLOGY_V1_SEED_NODES].reverse() });
    expect(JSON.stringify(forward)).toBe(JSON.stringify(reverse));
    if (forward.ok) {
      expect(Object.isFrozen(forward.graph)).toBe(true);
      expect(Object.isFrozen(forward.graph.nodes)).toBe(true);
    }
  });
});

describe("fail-closed graph validation", () => {
  const a = node("nep.en.v1.language-system.a");
  const b = node("nep.en.v1.language-system.b");
  const c = node("nep.en.v1.language-system.c");

  it.each([
    ["duplicate-node", { nodes: [a, a] }],
    ["invalid-id", { nodes: [node("invalid")] }],
    ["invalid-node", { nodes: [node("nep.en.v1.language-system.invalid", { label: "" })] }],
    ["missing-node", { nodes: [a], relations: [{ from: a.id, to: b.id, type: "enables" }] }],
    ["self-relation", { nodes: [a], relations: [{ from: a.id, to: a.id, type: "enables" }] }],
  ] as const)("rejects %s", (code, input) => expectProblem(buildOntologyGraph(input), code));

  it.each(["prerequisite-of", "component-of", "enables"] as const)("rejects direct and multi-node %s cycles", (type) => {
    expectProblem(buildOntologyGraph({ nodes: [a, b], relations: [{ from: a.id, to: b.id, type }, { from: b.id, to: a.id, type }] }), "dependency-cycle");
    expectProblem(buildOntologyGraph({ nodes: [a, b, c], relations: [{ from: a.id, to: b.id, type }, { from: b.id, to: c.id, type }, { from: c.id, to: a.id, type }] }), "dependency-cycle");
  });

  it("canonicalizes symmetric relations once and rejects reverse duplicates", () => {
    const relation: OntologyRelation = { from: b.id, to: a.id, type: "confusable-with" };
    const single = buildOntologyGraph({ nodes: [a, b], relations: [relation] });
    expect(single.ok && single.graph.relations).toEqual([{ from: a.id, to: b.id, type: "confusable-with" }]);
    expectProblem(buildOntologyGraph({ nodes: [a, b], relations: [relation, { ...relation, from: a.id, to: b.id }] }), "duplicate-relation");
  });

  it("keeps transfer directional and does not infer its reverse", () => {
    const result = buildOntologyGraph({ nodes: [a, b], relations: [{ from: b.id, to: a.id, type: "transfers-to" }] });
    expect(result.ok && result.graph.relations).toEqual([{ from: b.id, to: a.id, type: "transfers-to" }]);
  });

  it("sorts failures independent of input order", () => {
    const relations: OntologyRelation[] = [{ from: "missing-z", to: a.id, type: "enables" }, { from: "missing-a", to: a.id, type: "component-of" }];
    expect(JSON.stringify(buildOntologyGraph({ nodes: [a], relations }))).toBe(JSON.stringify(buildOntologyGraph({ nodes: [a], relations: [...relations].reverse() })));
  });

  it("rejects invalid modality, context, and evidence-role combinations", () => {
    expectProblem(buildOntologyGraph({ nodes: [node(a.id, { kind: "production", modalities: ["audio-input"], allowedEvidenceRoles: ["meaning-recognition"] })] }), "invalid-compatibility");
    expectProblem(buildOntologyGraph({ nodes: [node(a.id, { contextConstraints: [{ dimension: "register", value: "" }] })] }), "invalid-compatibility");
    expectProblem(buildOntologyGraph({ nodes: [node(a.id, { allowedEvidenceRoles: [] })] }), "invalid-compatibility");
  });
});

describe("non-authoritative overlays", () => {
  const canonical = node("nep.en.v1.language-system.semantics");
  const provenance = { sourceId: "coe.cefr", version: "2020", locator: "companion-volume", license: { classification: "copyrighted-reference" as const, permittedUse: "reference-only" as const } };

  it("accepts provenance-aware crosswalks and population hypotheses without mutating nodes", () => {
    const crosswalk: FrameworkCrosswalk = { id: "cw.cefr.semantics", nodeId: canonical.id, frameworkId: "cefr", frameworkVersion: "2020", externalTargetId: "external-ref", mapping: "related", provenance };
    const overlay: LearnerHypothesisOverlay = { id: "overlay.vi.semantics", nodeId: canonical.id, populationTag: "vi-L1", hypothesis: "Candidate transfer risk for validation", reviewStatus: "unreviewed", provenance };
    const result = buildOntologyGraph({ nodes: [canonical], crosswalks: [crosswalk], overlays: [overlay] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.graph.nodes[0]).toEqual(canonical);
  });

  it.each(["authority", "calibration", "evidence", "mastery", "observation", "replacementNode"])("rejects injected %s fields", (field) => {
    const injected = { id: `cw.${field}`, nodeId: canonical.id, frameworkId: "x", frameworkVersion: "1", externalTargetId: "x", mapping: "related", provenance, [field]: true } as unknown as FrameworkCrosswalk;
    expectProblem(buildOntologyGraph({ nodes: [canonical], crosswalks: [injected] }), "forbidden-authority-field");
  });

  it("rejects authority metadata injected into a canonical node", () => {
    const injected = { ...canonical, promotion: { status: "certified" } } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [injected] }), "forbidden-authority-field");
  });

  it("rejects incomplete provenance", () => {
    const overlay = { id: "overlay.invalid", nodeId: canonical.id, populationTag: "vi-L1", hypothesis: "x", reviewStatus: "unreviewed", provenance: { ...provenance, version: "" } } as LearnerHypothesisOverlay;
    expectProblem(buildOntologyGraph({ nodes: [canonical], overlays: [overlay] }), "invalid-provenance");
  });

  it("does not alter legacy evidence or activity contracts", () => {
    expect(COMMUNICATION_ACTIVITIES).toEqual(LEGACY_ACTIVITIES);
    expect(LEGACY_EVIDENCE_ROLES).toContain("near-transfer");
  });
});

describe("CODEX-ONTOLOGY-002: discriminator and namespace binding", () => {
  const validSystemId = "nep.en.v1.language-system.syntax-grammar";
  const validActivityId = "nep.en.v1.communication-activity.reading-reception";

  it("rejects missing or unknown domain at runtime", () => {
    const raw = node(validSystemId, {
      domain: "unknown-domain" as unknown as "language-system",
    });
    expectProblem(buildOntologyGraph({ nodes: [raw] }), "invalid-node");
  });

  it("rejects language-system ID on communication-activity node", () => {
    const raw = {
      ...node(validSystemId),
      domain: "communication-activity",
      activity: "reading-reception",
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [raw] }), "invalid-id");
  });

  it("rejects communication-activity ID on language-system node", () => {
    const raw = {
      ...node(validActivityId),
      domain: "language-system",
      family: "syntax-grammar",
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [raw] }), "invalid-id");
  });

  it("rejects language-system node with discriminator activity property", () => {
    const raw = {
      ...node(validSystemId),
      activity: "reading-reception",
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [raw] }), "invalid-node");
  });

  it("rejects communication-activity node with discriminator family property", () => {
    const raw = {
      ...node(validActivityId),
      domain: "communication-activity",
      activity: "reading-reception",
      family: "syntax-grammar",
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [raw] }), "invalid-node");
  });

  it("rejects invalid family or activity enumerations", () => {
    const badFamily = {
      ...node(validSystemId),
      family: "not-a-real-family",
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [badFamily] }), "invalid-family");

    const badActivity = {
      ...node(validActivityId),
      domain: "communication-activity",
      activity: "not-a-real-activity",
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [badActivity] }), "invalid-activity");
  });
});

describe("CODEX-ONTOLOGY-002: structural fail-closed metadata validation", () => {
  const canonical = node("nep.en.v1.language-system.semantics");
  const baseProv = {
    sourceId: "coe.cefr",
    version: "2020",
    locator: "companion-volume",
    license: {
      classification: "copyrighted-reference" as const,
      permittedUse: "reference-only" as const,
    },
  };

  it.each([
    ["authority", { authority: "granted" }],
    ["calibration", { calibration: "gold" }],
    ["evidence", { evidence: "observed" }],
    ["mastery", { mastery: true }],
    ["observation", { observation: "pass" }],
    ["promotion", { promotion: "certified" }],
    ["replacementNode", { replacementNode: "alt" }],
  ])("rejects forbidden authority in taskConstraints: %s", (_name, injected) => {
    const target = {
      ...canonical,
      taskConstraints: [{ taskType: "drill", ...injected }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [target] }), "forbidden-authority-field");
  });

  it.each([
    ["authority", { authority: "evaluator" }],
    ["mastery", { mastery: 0.95 }],
  ])("rejects forbidden authority in contextConstraints: %s", (_name, injected) => {
    const target = {
      ...canonical,
      contextConstraints: [{ dimension: "register", value: "formal", ...injected }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [target] }), "forbidden-authority-field");
  });

  it.each([
    ["calibration", { calibration: "calibrated" }],
    ["evidence", { evidence: "layer0" }],
  ])("rejects forbidden authority in source refs: %s", (_name, injected) => {
    const target = {
      ...canonical,
      sources: [{ sourceId: "src", version: "1", ...injected }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [target] }), "forbidden-authority-field");
  });

  it.each([
    ["mastery", { mastery: "full" }],
    ["promotion", { promotion: true }],
  ])("rejects forbidden authority in provenance and license: %s", (_name, injected) => {
    const provWithInjected = {
      ...baseProv,
      ...injected,
    };
    const cw = {
      id: "cw.prov.inject",
      nodeId: canonical.id,
      frameworkId: "cefr",
      frameworkVersion: "2020",
      externalTargetId: "ref",
      mapping: "related",
      provenance: provWithInjected,
    } as unknown as FrameworkCrosswalk;
    expectProblem(buildOntologyGraph({ nodes: [canonical], crosswalks: [cw] }), "forbidden-authority-field");

    const provWithLicInjected = {
      ...baseProv,
      license: {
        ...baseProv.license,
        ...injected,
      },
    };
    const cwLic = {
      id: "cw.lic.inject",
      nodeId: canonical.id,
      frameworkId: "cefr",
      frameworkVersion: "2020",
      externalTargetId: "ref",
      mapping: "related",
      provenance: provWithLicInjected,
    } as unknown as FrameworkCrosswalk;
    expectProblem(buildOntologyGraph({ nodes: [canonical], crosswalks: [cwLic] }), "forbidden-authority-field");
  });

  it("rejects forbidden authority on relations", () => {
    const target = node("nep.en.v1.language-system.b");
    const relation = {
      from: canonical.id,
      to: target.id,
      type: "enables",
      authority: "admin",
    } as unknown as OntologyRelation;
    expectProblem(buildOntologyGraph({ nodes: [canonical, target], relations: [relation] }), "forbidden-authority-field");
  });

  it("rejects unexpected properties in nested metadata", () => {
    const badTc = {
      ...canonical,
      taskConstraints: [{ taskType: "drill", rogueProperty: true }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [badTc] }), "invalid-compatibility");

    const badCc = {
      ...canonical,
      contextConstraints: [{ dimension: "audience", value: "peers", rogueProperty: true }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [badCc] }), "invalid-compatibility");

    const badSrc = {
      ...canonical,
      sources: [{ sourceId: "s", version: "1", rogueProperty: true }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [badSrc] }), "invalid-provenance");
  });

  it("validates runtime enums and non-empty required fields across metadata", () => {
    // Task supportLevel
    const badSupport = {
      ...canonical,
      taskConstraints: [{ taskType: "drill", supportLevel: "invalid-level" }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [badSupport] }), "invalid-compatibility");

    // Task empty taskType
    const emptyTask = {
      ...canonical,
      taskConstraints: [{ taskType: "   " }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [emptyTask] }), "invalid-compatibility");

    // Context dimension
    const badDimension = {
      ...canonical,
      contextConstraints: [{ dimension: "not-a-dimension", value: "x" }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [badDimension] }), "invalid-compatibility");

    // Context value
    const emptyContextVal = {
      ...canonical,
      contextConstraints: [{ dimension: "domain", value: "  " }],
    } as unknown as OntologyNode;
    expectProblem(buildOntologyGraph({ nodes: [emptyContextVal] }), "invalid-compatibility");

    // Crosswalk mapping
    const badMapping = {
      id: "cw.map.bad",
      nodeId: canonical.id,
      frameworkId: "cefr",
      frameworkVersion: "2020",
      externalTargetId: "ref",
      mapping: "invalid-mapping",
      provenance: baseProv,
    } as unknown as FrameworkCrosswalk;
    expectProblem(buildOntologyGraph({ nodes: [canonical], crosswalks: [badMapping] }), "invalid-compatibility");

    // Crosswalk empty identifiers
    const emptyFw = {
      id: "cw.fw.empty",
      nodeId: canonical.id,
      frameworkId: "",
      frameworkVersion: "2020",
      externalTargetId: "ref",
      mapping: "exact",
      provenance: baseProv,
    } as unknown as FrameworkCrosswalk;
    expectProblem(buildOntologyGraph({ nodes: [canonical], crosswalks: [emptyFw] }), "invalid-provenance");

    // Overlay reviewStatus
    const badReview = {
      id: "ov.rev.bad",
      nodeId: canonical.id,
      populationTag: "vi-L1",
      hypothesis: "h",
      reviewStatus: "approved-prod",
      provenance: baseProv,
    } as unknown as LearnerHypothesisOverlay;
    expectProblem(buildOntologyGraph({ nodes: [canonical], overlays: [badReview] }), "invalid-node");

    // Overlay empty populationTag
    const emptyPop = {
      id: "ov.pop.empty",
      nodeId: canonical.id,
      populationTag: "  ",
      hypothesis: "h",
      reviewStatus: "unreviewed",
      provenance: baseProv,
    } as unknown as LearnerHypothesisOverlay;
    expectProblem(buildOntologyGraph({ nodes: [canonical], overlays: [emptyPop] }), "invalid-node");

    // License classification & permittedUse enums
    const badLicClass = {
      id: "cw.lic.bad",
      nodeId: canonical.id,
      frameworkId: "cefr",
      frameworkVersion: "2020",
      externalTargetId: "ref",
      mapping: "exact",
      provenance: {
        ...baseProv,
        license: { classification: "public-domain-unverified", permittedUse: "reference-only" },
      },
    } as unknown as FrameworkCrosswalk;
    expectProblem(buildOntologyGraph({ nodes: [canonical], crosswalks: [badLicClass] }), "invalid-provenance");
  });
});

describe("CODEX-ONTOLOGY-002: canonical activity-to-modality semantics", () => {
  it("verifies exact canonical kind and modality mapping for every communication activity in the seed", () => {
    const seed = buildEnglishOntologyV1();
    expect(seed.ok).toBe(true);
    if (!seed.ok) return;

    const activityNodes = seed.graph.nodes.filter(
      (n) => n.domain === "communication-activity",
    );
    expect(activityNodes).toHaveLength(COMMUNICATION_ACTIVITIES.length);

    // Written interaction preserves text input and text output semantics
    const writtenInteraction = activityNodes.find(
      (n) => n.id === "nep.en.v1.communication-activity.written-interaction",
    );
    expect(writtenInteraction).toBeDefined();
    expect(writtenInteraction?.kind).toBe("interaction");
    expect([...(writtenInteraction?.modalities ?? [])].sort()).toEqual(["text-input", "text-output"]);

    // Multimodal interaction preserves multimodal semantics
    const multimodalInteraction = activityNodes.find(
      (n) => n.id === "nep.en.v1.communication-activity.multimodal-interaction",
    );
    expect(multimodalInteraction).toBeDefined();
    expect(multimodalInteraction?.kind).toBe("interaction");
    expect(multimodalInteraction?.modalities).toEqual(["multimodal"]);

    // Spoken interaction preserves live interaction semantics
    const spokenInteraction = activityNodes.find(
      (n) => n.id === "nep.en.v1.communication-activity.spoken-interaction",
    );
    expect(spokenInteraction).toBeDefined();
    expect(spokenInteraction?.kind).toBe("interaction");
    expect(spokenInteraction?.modalities).toEqual(["live-interaction"]);

    // Text mediation preserves text input and text output semantics
    const textMediation = activityNodes.find(
      (n) => n.id === "nep.en.v1.communication-activity.text-mediation",
    );
    expect(textMediation).toBeDefined();
    expect(textMediation?.kind).toBe("mediation");
    expect([...(textMediation?.modalities ?? [])].sort()).toEqual(["text-input", "text-output"]);
  });

  it.each(COMMUNICATION_ACTIVITIES)(
    "preserves exact declarative kind, modalities, and roles for %s",
    (activity) => {
      const seed = buildEnglishOntologyV1();
      expect(seed.ok).toBe(true);
      if (!seed.ok) return;

      const node = seed.graph.nodes.find(
        (n) => n.id === `nep.en.v1.communication-activity.${activity}`,
      );
      expect(node).toBeDefined();
      const expected = CANONICAL_ACTIVITY_PROFILES[activity];
      expect(node?.kind).toBe(expected.kind);
      expect([...(node?.modalities ?? [])].sort()).toEqual([...expected.modalities].sort());
      expect([...(node?.allowedEvidenceRoles ?? [])].sort()).toEqual(
        [...expected.allowedEvidenceRoles].sort(),
      );
    },
  );

  it("validates interaction compatibility requires interaction modality or bidirectional input/output", () => {
    const baseInteraction = {
      id: "nep.en.v1.communication-activity.written-interaction",
      contractVersion: 1 as const,
      domain: "communication-activity" as const,
      activity: "written-interaction" as const,
      label: "Written interaction",
      definition: "Written interaction",
      kind: "interaction" as const,
      granularity: "task-capability" as const,
      modalities: ["text-input", "text-output"] as const,
      taskConstraints: [],
      contextConstraints: [],
      allowedEvidenceRoles: ["free-production" as const],
      sources: [],
    };

    // Valid bidirectional written interaction
    const validResult = buildOntologyGraph({ nodes: [baseInteraction] });
    expect(validResult.ok).toBe(true);

    // Invalid: interaction with only text-input (unidirectional input)
    const unidirectionalInput = {
      ...baseInteraction,
      modalities: ["text-input"] as const,
    };
    expectProblem(buildOntologyGraph({ nodes: [unidirectionalInput] }), "invalid-compatibility");

    // Invalid: interaction with only text-output (unidirectional output)
    const unidirectionalOutput = {
      ...baseInteraction,
      modalities: ["text-output"] as const,
    };
    expectProblem(buildOntologyGraph({ nodes: [unidirectionalOutput] }), "invalid-compatibility");
  });
});

describe("GEMINI-ONTOLOGY-003: relation runtime validation fail-closed boundary", () => {
  const a = node("nep.en.v1.language-system.a");
  const b = node("nep.en.v1.language-system.b");

  it("does not throw and fails closed on numeric or object from/to on symmetric relations", () => {
    const numericFrom = { from: 42, to: b.id, type: "confusable-with" } as unknown as OntologyRelation;
    const res1 = buildOntologyGraph({ nodes: [a, b], relations: [numericFrom] });
    expectProblem(res1, "invalid-relation");

    const objectTo = { from: a.id, to: { id: "bad" }, type: "confusable-with" } as unknown as OntologyRelation;
    const res2 = buildOntologyGraph({ nodes: [a, b], relations: [objectTo] });
    expectProblem(res2, "invalid-relation");

    const emptyFrom = { from: "   ", to: b.id, type: "confusable-with" } as unknown as OntologyRelation;
    const res3 = buildOntologyGraph({ nodes: [a, b], relations: [emptyFrom] });
    expectProblem(res3, "invalid-relation");

    const missingTo = { from: a.id, type: "confusable-with" } as unknown as OntologyRelation;
    const res4 = buildOntologyGraph({ nodes: [a, b], relations: [missingTo] });
    expectProblem(res4, "invalid-relation");
  });

  it("does not throw and fails closed on non-array contextTags: 42", () => {
    const relNumberTags = {
      from: a.id,
      to: b.id,
      type: "enables",
      contextTags: 42,
    } as unknown as OntologyRelation;
    const res = buildOntologyGraph({ nodes: [a, b], relations: [relNumberTags] });
    expectProblem(res, "invalid-relation");
  });

  it("fails closed on contextTags: 'ab' instead of treating string as character tag iterable", () => {
    const relStringTags = {
      from: a.id,
      to: b.id,
      type: "enables",
      contextTags: "ab",
    } as unknown as OntologyRelation;
    const res = buildOntologyGraph({ nodes: [a, b], relations: [relStringTags] });
    expectProblem(res, "invalid-relation");
  });

  it("fails closed on contextTags containing non-string or empty entries", () => {
    const relNonStringEntry = {
      from: a.id,
      to: b.id,
      type: "enables",
      contextTags: ["valid-tag", 123],
    } as unknown as OntologyRelation;
    expectProblem(buildOntologyGraph({ nodes: [a, b], relations: [relNonStringEntry] }), "invalid-relation");

    const relEmptyEntry = {
      from: a.id,
      to: b.id,
      type: "enables",
      contextTags: ["valid-tag", "   "],
    } as unknown as OntologyRelation;
    expectProblem(buildOntologyGraph({ nodes: [a, b], relations: [relEmptyEntry] }), "invalid-relation");
  });

  it("keeps valid string tags sorted and deterministic", () => {
    const rel = {
      from: a.id,
      to: b.id,
      type: "enables" as const,
      contextTags: ["z-tag", "a-tag", "m-tag"],
    };
    const res = buildOntologyGraph({ nodes: [a, b], relations: [rel] });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.graph.relations[0].contextTags).toEqual(["a-tag", "m-tag", "z-tag"]);
      expect(Object.isFrozen(res.graph.relations[0])).toBe(true);
      expect(Object.isFrozen(res.graph.relations[0].contextTags)).toBe(true);
    }
  });

  it("ensures malformed relations never appear in a successful graph", () => {
    const malformed = { from: 123, to: 456, type: "unknown-type" } as unknown as OntologyRelation;
    const valid = { from: a.id, to: b.id, type: "enables" as const };
    const res = buildOntologyGraph({ nodes: [a, b], relations: [valid, malformed] });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.problems.some((p) => p.code === "invalid-relation")).toBe(true);
    }
  });
});

