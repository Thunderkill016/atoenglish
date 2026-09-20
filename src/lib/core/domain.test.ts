import { describe, expect, it } from "vitest";

import { validateSkillGraph, type SkillGraph, type SkillNode } from "./domain";

function node(id: string): SkillNode {
  return {
    id,
    version: 1,
    title: id,
    description: id,
    kind: "knowledge",
    systems: ["lexis"],
    activities: ["reading-reception"],
    allowedEvidence: ["meaning-recognition"],
    allowedResponses: ["choice"],
    tags: [],
    sources: [],
  };
}

describe("validateSkillGraph", () => {
  it("rejects prerequisite cycles", () => {
    const graph: SkillGraph = {
      version: "test",
      nodes: [node("A"), node("B"), node("C")],
      relations: [
        { from: "A", to: "B", type: "prerequisite-of" },
        { from: "B", to: "C", type: "prerequisite-of" },
        { from: "C", to: "A", type: "prerequisite-of" },
      ],
    };

    expect(validateSkillGraph(graph)).toContainEqual({
      type: "dependency-cycle",
      relation: "prerequisite-of",
      path: ["A", "B", "C", "A"],
    });
  });

  it("rejects component cycles", () => {
    const graph: SkillGraph = {
      version: "test",
      nodes: [node("A"), node("B")],
      relations: [
        { from: "A", to: "B", type: "component-of" },
        { from: "B", to: "A", type: "component-of" },
      ],
    };

    expect(validateSkillGraph(graph).some((problem) => problem.type === "dependency-cycle")).toBe(true);
  });

  it("allows cycles for symmetric or associative relations", () => {
    const graph: SkillGraph = {
      version: "test",
      nodes: [node("A"), node("B")],
      relations: [
        { from: "A", to: "B", type: "confusable-with" },
        { from: "B", to: "A", type: "confusable-with" },
      ],
    };

    expect(validateSkillGraph(graph)).toEqual([]);
  });
});
