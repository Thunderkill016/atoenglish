import { describe, expect, it } from "vitest";

import {
  compileLegacyUnitContract,
  isLegacyContractLessonId,
  legacyContractLessonId,
  resolveLegacyContract,
  stripLegacyHtml,
} from "./legacy-unit-contract.v1";
import { evaluateNếpAction } from "./evaluator";
import { qaLesson, type LessonAction } from "./lesson-contract";
import {
  compileCanonicalNếpPracticeAttempt,
  resolveNếpLesson,
} from "./practice-execution.v1";
import { zeroPathLessonEnvelope } from "./zero-path-pilot.v1";
import {
  isMissionLesson,
  legacyUnitEntry,
  legacyUnitSlugs,
} from "../lessons/legacy-unit-registry";

const ASSESSED_KINDS = new Set([
  "comprehend",
  "retrieve",
  "produce",
  "repair",
  "retry",
  "transfer",
]);

describe("legacy-unit-contract compiler", () => {
  it("compiles a legacy unit into a stable contract id", () => {
    const contract = compileLegacyUnitContract("unit-1");
    expect(contract).not.toBeNull();
    expect(contract?.id).toBe("legacy.unit-1");
    expect(contract?.version).toBe(1);
    expect(contract?.capabilityId).toBe("legacy.unit-1");
  });

  it("returns null for mission lessons (they keep their own runtime)", () => {
    expect(compileLegacyUnitContract("unit-a0-1")).toBeNull();
  });

  it("returns null for unknown slugs", () => {
    expect(compileLegacyUnitContract("unit-999")).toBeNull();
    expect(compileLegacyUnitContract("not-a-unit")).toBeNull();
  });

  it("compiles every non-mission legacy unit without throwing", () => {
    const failures: string[] = [];
    for (const slug of legacyUnitSlugs()) {
      const entry = legacyUnitEntry(slug);
      if (entry && isMissionLesson(entry.data)) continue;
      const contract = compileLegacyUnitContract(slug);
      if (!contract || contract.actions.length === 0) failures.push(slug);
    }
    expect(failures).toEqual([]);
  });

  it("only marks actions assessed when they carry an answer key", () => {
    const contract = compileLegacyUnitContract("unit-1");
    expect(contract).not.toBeNull();
    for (const action of contract!.actions) {
      if (action.assessment) {
        expect(
          action.targetSignals && action.targetSignals.length > 0,
          `assessed action ${action.id} must carry target signals`,
        ).toBe(true);
      }
      if (ASSESSED_KINDS.has(action.kind) && !action.assessment) {
        // Unassessed respondable actions are only allowed via collectsResponse
        // (honest self-report for open-ended prompts).
        expect(
          action.collectsResponse,
          `unassessed ${action.kind} action ${action.id} must be collectsResponse`,
        ).toBe(true);
      }
    }
  });

  it("never reveals an answer before the learner attempts", () => {
    for (const slug of ["unit-1", "unit-13", "unit-28", "unit-42"]) {
      const contract = compileLegacyUnitContract(slug)!;
      expect(
        contract.actions.every((action) => action.revealsAnswer !== true),
        `${slug} must not contain answer-revealing actions`,
      ).toBe(true);
    }
  });

  it("declares only channels the compiled actions actually exercise", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const channels = new Set(contract.evidenceChannels);
    for (const channel of channels) {
      expect(["comprehension", "retrieval"]).toContain(channel);
    }
    // Never claims channels the adapter cannot honestly exercise.
    expect(channels.has("transfer")).toBe(false);
    expect(channels.has("retention")).toBe(false);
    expect(channels.has("repair")).toBe(false);
  });

  it("does not fabricate research provenance", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    expect(contract.sourceDerived.principleIds).toEqual([]);
    expect(contract.sourceDerived.claimIds).toEqual([]);
  });
});

describe("legacy contract lint (coverage report)", () => {
  const compiledUnits = () =>
    legacyUnitSlugs()
      .filter((slug) => {
        const entry = legacyUnitEntry(slug);
        return entry && !isMissionLesson(entry.data);
      })
      .map((slug) => ({ slug, contract: compileLegacyUnitContract(slug)! }));

  // Legacy units have no research trace by construction — the only error
  // qaLesson may raise is EVIDENCE_TRACE_REQUIRED, which is honest (the
  // alternative would be fabricating principle/claim ids).
  const TOLERATED_ERRORS = new Set(["EVIDENCE_TRACE_REQUIRED"]);

  it("passes contract QA on every compiled unit", () => {
    const violations: string[] = [];
    for (const { slug, contract } of compiledUnits()) {
      for (const issue of qaLesson(contract)) {
        if (issue.severity === "error" && !TOLERATED_ERRORS.has(issue.code)) {
          violations.push(
            `${slug}:${issue.code}@${issue.message.slice(0, 60)}`,
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("compiles the answer-keyed sections it can represent", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const ids = contract.actions.map((action) => action.id);
    expect(ids.some((id) => id.startsWith("match-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("corr-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("arr-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("ctx-reading-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("read-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("ctx-job-"))).toBe(true);
  });

  it("never surfaces listenAndArrange audio_text as the arrange stimulus", () => {
    // audio_text may legitimately appear in presentation contexts (dialogues)
    // — the leak would be showing it on the arrange task itself.
    for (const { slug, contract } of compiledUnits()) {
      const unit = legacyUnitEntry(slug)!.data as {
        listenAndArrangeExercises?: { audio_text: string }[];
      };
      for (const item of unit.listenAndArrangeExercises ?? []) {
        const audio = stripLegacyHtml(item.audio_text);
        for (const action of contract.actions) {
          if (!action.id.startsWith("arr-")) continue;
          expect(action.prompt ?? "").not.toContain(audio);
          expect(action.model ?? "").not.toContain(audio);
        }
      }
    }
  });

  it("declares prerequisites from the authored next-chain only", () => {
    const unit1 = compileLegacyUnitContract("unit-1")!;
    expect(unit1.prerequisites).toEqual(["legacy.unit-a0-8"]);
    const unit2 = compileLegacyUnitContract("unit-2")!;
    expect(unit2.prerequisites).toEqual(["legacy.unit-1"]);
    // a0-7→a0-8 is explicit in the chain; nothing points at a0-7 itself.
    expect(compileLegacyUnitContract("unit-a0-8")!.prerequisites).toEqual([
      "legacy.unit-a0-7",
    ]);
    expect(compileLegacyUnitContract("unit-a0-7")!.prerequisites).toEqual([]);
  });

  it("does not order scrambled banks in answer order", () => {
    // The alphabetized bank must never show the answer contiguously —
    // the leak linter would flag it via the model check, but the bank
    // rides in prompt (stimulus), so assert the invariant directly.
    for (const { slug, contract } of compiledUnits()) {
      const unit = legacyUnitEntry(slug)!.data as {
        scrambleExercises?: { id: string; answer: string }[];
      };
      for (const action of contract.actions) {
        if (!action.id.startsWith("arr-")) continue;
        const normalized = (action.prompt ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9' -]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        for (const signal of action.targetSignals ?? []) {
          const normalizedSignal = signal
            .toLowerCase()
            .replace(/[^a-z0-9' -]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (normalizedSignal.length < 4) continue;
          expect(
            ` ${normalized} `.includes(` ${normalizedSignal} `),
            `${slug}:${action.id} bank must not show the answer contiguously`,
          ).toBe(false);
        }
      }
    }
  });
});

describe("legacy HTML markup hygiene", () => {
  it("stripLegacyHtml removes inline tags and decodes entities", () => {
    expect(
      stripLegacyHtml(
        'Người Việt nói <span class="text-primary">"good morning"</span> &amp; cười.',
      ),
    ).toBe('Người Việt nói "good morning" & cười.');
  });

  it("no compiled action exposes HTML tags in learner-visible or evaluator fields", () => {
    const TAG = /<[a-zA-Z][^>]*>/;
    const check = (slug: string, label: string, value?: string) => {
      if (value !== undefined) {
        expect(TAG.test(value), `${slug}:${label} leaks HTML: ${value}`).toBe(
          false,
        );
      }
    };
    for (const slug of legacyUnitSlugs()) {
      const entry = legacyUnitEntry(slug);
      if (entry && isMissionLesson(entry.data)) continue;
      const contract = compileLegacyUnitContract(slug)!;
      check(slug, "mission", contract.mission);
      check(slug, "learnerCanDo", contract.learnerCanDo);
      for (const action of contract.actions) {
        check(slug, `${action.id}.title`, action.title);
        check(slug, `${action.id}.instruction`, action.instruction);
        check(slug, `${action.id}.prompt`, action.prompt);
        check(slug, `${action.id}.model`, action.model);
        check(slug, `${action.id}.supportVi`, action.supportVi);
        for (const choice of action.choices ?? []) {
          check(slug, `${action.id}.choice`, choice);
        }
        for (const signal of action.targetSignals ?? []) {
          check(slug, `${action.id}.targetSignal`, signal);
        }
      }
    }
  });

  it("assessed-action support never contains the answer", () => {
    for (const slug of legacyUnitSlugs()) {
      const entry = legacyUnitEntry(slug);
      if (entry && isMissionLesson(entry.data)) continue;
      const contract = compileLegacyUnitContract(slug)!;
      for (const action of contract.actions) {
        if (!action.assessment || !action.supportVi) continue;
        for (const signal of action.targetSignals ?? []) {
          expect(
            action.supportVi.toLowerCase().includes(signal.toLowerCase()),
            `${slug}:${action.id} supportVi leaks the answer "${signal}"`,
          ).toBe(false);
        }
      }
    }
  });
});

describe("compiled listening and speech surfaces", () => {
  it("listenAndChoose compiles to listen-modality recognition, not reading", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const listen = contract.actions.filter(
      (action) => action.modality === "listen" && action.kind === "comprehend",
    );
    expect(listen.length).toBeGreaterThan(0);
    for (const action of listen) {
      expect(action.kind).toBe("comprehend");
      expect(action.assessment?.evidenceType).toBe("recognition");
      // Hidden stimulus text stays in the contract as TTS input + eval key.
      expect(action.prompt?.length).toBeGreaterThan(0);
      // The widened choice contract applies: answer present among choices.
      const choices = (action.choices ?? []).map((choice) =>
        choice.trim().toLowerCase(),
      );
      expect(choices).toContain(action.targetSignals![0].trim().toLowerCase());
    }
  });

  it("a listen attempt mints listening-reception evidence, not reading", async () => {
    const { createZeroPathSession } = await import("./session-runner.v1");
    const contract = compileLegacyUnitContract("unit-1")!;
    const listen = contract.actions.find(
      (action) =>
        action.modality === "listen" &&
        action.kind === "comprehend" &&
        action.assessment,
    )!;
    const runner = createZeroPathSession({ sessionId: "listen-evidence" });
    const outcome = runner.recordSubmission({
      lessonId: contract.id,
      lessonVersion: 1,
      actionId: listen.id,
      idempotencyKey: "listen-key-1",
      response: listen.targetSignals![0],
      responseSource: "text",
      supportLevelUsed: 0,
      latencyMs: 900,
    });
    // The same recognition evidenceType binds to the audio claim when the
    // stimulus modality is listen — never the reading claim.
    expect(outcome).toMatchObject({
      kind: "evidence",
      claim: "recognize_audio",
      evidence: {
        targetId: "nep.en.v1.communication-activity.listening-reception",
      },
    });
  });

  it("self-report speaking prompts compile to speech modality, still unassessed", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const speak = contract.actions.filter((action) =>
      action.id.startsWith("speak-"),
    );
    expect(speak.length).toBeGreaterThan(0);
    for (const action of speak) {
      expect(action.kind).toBe("produce");
      expect(action.modality).toBe("speech");
      // Self-report practice captures the attempt but mints no evidence —
      // speech input ≠ pronunciation assessment.
      expect(action.collectsResponse).toBe(true);
      expect(action.assessment).toBeUndefined();
    }
  });

  it("listen-and-repeat compiles a bounded assessed spoken task", async () => {
    const { createZeroPathSession } = await import("./session-runner.v1");
    const contract = compileLegacyUnitContract("unit-1")!;
    const echo = contract.actions.filter((action) =>
      action.id.startsWith("echo-"),
    );
    expect(echo.length).toBeGreaterThan(0);
    expect(echo.length).toBeLessThanOrEqual(2);
    for (const action of echo) {
      // Reproducing a heard form is retrieval evidence, not free production.
      expect(action.kind).toBe("retrieve");
      expect(action.modality).toBe("listen");
      // Hidden audio stimulus = the repeat target.
      expect(action.prompt).toBe(action.targetSignals![0]);
      expect(action.assessment?.evidenceType).toBe("retrieval");
    }

    // A spoken echo that reproduces the sentence mints spoken retrieval
    // evidence — the first assessed spoken channel in compiled units.
    const runner = createZeroPathSession({ sessionId: "echo-evidence" });
    const outcome = runner.recordSubmission({
      lessonId: contract.id,
      lessonVersion: 1,
      actionId: echo[0].id,
      idempotencyKey: "echo-key-1",
      response: echo[0].targetSignals![0],
      responseSource: "speech",
      supportLevelUsed: 0,
      latencyMs: 1500,
    });
    expect(outcome).toMatchObject({
      kind: "evidence",
      claim: "retrieve_form",
      evidence: {
        targetId: "nep.en.v1.communication-activity.spoken-production",
      },
    });
  });

  it("dialogue context actions carry the recorded audio asset", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const dialogueContexts = contract.actions.filter(
      (action) => action.audioSrc,
    );
    expect(dialogueContexts.length).toBeGreaterThan(0);
    for (const action of dialogueContexts) {
      expect(action.audioSrc).toMatch(/^\/audio\/unit-1\/.+\.mp3$/);
    }
  });

  it("envelope exposes audioSrc to the learner surface", () => {
    const envelope = zeroPathLessonEnvelope("legacy.unit-1")!;
    const withAudio = envelope.actions.filter((action) => action.audioSrc);
    expect(withAudio.length).toBeGreaterThan(0);
  });
});

describe("legacy contract id helpers", () => {
  it("round-trips slug ↔ lesson id", () => {
    expect(legacyContractLessonId("unit-7")).toBe("legacy.unit-7");
    expect(isLegacyContractLessonId("legacy.unit-7")).toBe(true);
    expect(isLegacyContractLessonId("LESSON-CAP002-FIRST-MEETING-V1")).toBe(
      false,
    );
  });

  it("resolves a legacy contract through the canonical lesson resolver", () => {
    const resolved = resolveNếpLesson("legacy.unit-1", 1);
    expect(resolved).not.toBeNull();
    expect(resolved?.id).toBe("legacy.unit-1");
  });

  it("rejects wrong versions and non-legacy ids", () => {
    expect(resolveNếpLesson("legacy.unit-1", 2)).toBeNull();
    expect(resolveLegacyContract("LESSON-CAP002-FIRST-MEETING-V1")).toBeNull();
    expect(resolveLegacyContract("legacy.unit-999")).toBeNull();
  });
});

describe("legacy actions through the canonical evaluator", () => {
  it("evaluates a compiled assessed action end-to-end", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const assessed = contract.actions.find((action) => action.assessment);
    expect(assessed).toBeDefined();
    const result = compileCanonicalNếpPracticeAttempt({
      lessonId: contract.id,
      lessonVersion: 1,
      actionId: assessed!.id,
      idempotencyKey: crypto.randomUUID(),
      response: assessed!.targetSignals![0],
      responseSource: "text",
      supportLevelUsed: 0,
      latencyMs: 1200,
    });
    expect(result).not.toBeNull();
    expect(result!.evaluation?.success).toBe(true);
    expect(result!.record).not.toBeNull();
  });

  it("choice modality exact-matches — a wrong option containing the answer text fails", () => {
    const action = {
      id: "ret-x",
      kind: "retrieve",
      modality: "choice",
      title: "t",
      instruction: "i",
      choices: ["cat", "category"],
      targetSignals: ["cat"],
      assessment: {
        targetCapabilityId: "legacy.x",
        evidenceType: "recognition",
        contextId: "x:retrieve:ret-x",
        evaluator: "nep-choice-v1",
      },
    } satisfies LessonAction;
    expect(evaluateNếpAction(action, "category").success).toBe(false);
    expect(evaluateNếpAction(action, "cat").success).toBe(true);
  });

  it("self-report actions resolve without evaluation", () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    const selfReport = contract.actions.find(
      (action) => !action.assessment && action.collectsResponse,
    );
    expect(selfReport).toBeDefined();
    const result = compileCanonicalNếpPracticeAttempt({
      lessonId: contract.id,
      lessonVersion: 1,
      actionId: selfReport!.id,
      idempotencyKey: crypto.randomUUID(),
      response: "Tôi thấy bài này ổn.",
      responseSource: "text",
      supportLevelUsed: 0,
      latencyMs: 800,
    });
    expect(result).not.toBeNull();
    expect(result!.evaluation).toBeNull();
    expect(result!.record).toBeNull();
  });
});

describe("legacy lesson envelope safety", () => {
  it("exposes a learner-safe envelope without evaluator internals", () => {
    const envelope = zeroPathLessonEnvelope("legacy.unit-1");
    expect(envelope).not.toBeNull();
    expect(envelope!.lessonId).toBe("legacy.unit-1");
    expect(envelope!.actions.length).toBeGreaterThan(0);
    for (const action of envelope!.actions) {
      const keys = Object.keys(action);
      expect(keys).not.toContain("targetSignals");
      expect(keys).not.toContain("requiredSignalGroups");
      expect(keys).not.toContain("assessment");
    }
  });

  it("marks assessed and self-report actions respondable, presentation actions not", () => {
    const envelope = zeroPathLessonEnvelope("legacy.unit-1")!;
    const assessed = envelope.actions.filter((action) => action.respondable);
    const presentation = envelope.actions.filter(
      (action) => !action.respondable,
    );
    expect(assessed.length).toBeGreaterThan(0);
    expect(presentation.length).toBeGreaterThan(0);
    // Choices ride with the envelope but never carry correctness markers.
    for (const action of assessed) {
      if (action.choices.length > 0) {
        expect(Object.keys(action)).not.toContain("answer");
      }
    }
  });
});
