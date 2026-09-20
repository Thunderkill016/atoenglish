import { describe, expect, it } from "vitest";

import { SyntheticPilotStore } from "./store";


describe("native pilot synthetic artifact lineage", () => {
  it("propagates participant lineage through feature -> model -> prediction -> result dependencies", () => {
    const store = new SyntheticPilotStore();

    const feature = store.registerArtifact("feature:p-a", "feature", ["p-a"]);
    const model = store.registerArtifact("model:shared", "model", ["p-b"], [feature.artifactId]);
    const prediction = store.registerArtifact(
      "prediction:p-b",
      "prediction",
      ["p-b"],
      [model.artifactId],
    );
    const result = store.registerArtifact("result:aggregate", "result", [], [prediction.artifactId]);

    expect(model.participantIds).toEqual(["p-a", "p-b"]);
    expect(prediction.participantIds).toEqual(["p-a", "p-b"]);
    expect(result.participantIds).toEqual(["p-a", "p-b"]);
    expect(result.dependsOnArtifactIds).toEqual(["prediction:p-b"]);

    const deletion = store.deleteParticipant("p-a");
    expect(deletion.invalidatedArtifactIds).toEqual([
      "feature:p-a",
      "model:shared",
      "prediction:p-b",
      "result:aggregate",
    ]);
    expect(store.listValidArtifacts()).toEqual([]);
  });

  it("fails closed on missing or already-invalidated dependencies", () => {
    const store = new SyntheticPilotStore();

    expect(() =>
      store.registerArtifact("prediction:orphan", "prediction", [], ["model:missing"]),
    ).toThrow("Synthetic artifact dependency is missing: model:missing");

    store.registerArtifact("feature:p-a", "feature", ["p-a"]);
    store.registerArtifact("model:p-a", "model", [], ["feature:p-a"]);
    store.deleteParticipant("p-a");

    expect(() =>
      store.registerArtifact("result:stale", "result", [], ["model:p-a"]),
    ).toThrow("Synthetic artifact dependency is invalidated: model:p-a");
  });
});
