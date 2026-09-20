import { assertPilotEvidenceLineage } from "./identity";
import {
  SYNTHETIC_ONLY_STATUS,
  type SyntheticArtifactKind,
  type SyntheticArtifactRecord,
  type SyntheticPilotEvent,
} from "./types";

export type SyntheticParticipantExport = {
  readonly status: typeof SYNTHETIC_ONLY_STATUS;
  readonly participantId: string;
  readonly events: readonly {
    readonly eventId: string;
    readonly family: string;
    readonly occurredAt: string;
    readonly availableAt: string;
    readonly definitionFingerprint: `sha256:${string}`;
    readonly evidenceDigest: `sha256:${string}`;
  }[];
};

export class SyntheticPilotStore {
  private readonly eventsByParticipant = new Map<string, SyntheticPilotEvent[]>();
  private readonly artifacts = new Map<string, SyntheticArtifactRecord>();

  addEvent(event: SyntheticPilotEvent): void {
    assertPilotEvidenceLineage(event);
    const current = this.eventsByParticipant.get(event.participantId) ?? [];
    current.push(event);
    this.eventsByParticipant.set(event.participantId, current);
  }

  addEvents(events: readonly SyntheticPilotEvent[]): void {
    for (const event of events) this.addEvent(event);
  }

  getEvents(participantId: string): readonly SyntheticPilotEvent[] {
    return Object.freeze([...(this.eventsByParticipant.get(participantId) ?? [])]);
  }

  exportParticipant(participantId: string): SyntheticParticipantExport {
    const events = this.eventsByParticipant.get(participantId) ?? [];
    return Object.freeze({
      status: SYNTHETIC_ONLY_STATUS,
      participantId,
      events: Object.freeze(
        events.map((event) => {
          assertPilotEvidenceLineage(event);
          return Object.freeze({
            eventId: event.evidence.eventId,
            family: event.taskDefinition.family,
            occurredAt: event.evidence.occurredAt,
            availableAt: event.availableAt,
            definitionFingerprint: event.lineage.definitionFingerprint,
            evidenceDigest: event.lineage.evidenceDigest,
          });
        }),
      ),
    });
  }

  registerArtifact(
    artifactId: string,
    kind: SyntheticArtifactKind,
    participantIds: readonly string[],
    dependsOnArtifactIds: readonly string[] = [],
  ): SyntheticArtifactRecord {
    if (this.artifacts.has(artifactId)) {
      throw new Error(`Duplicate synthetic artifact id: ${artifactId}`);
    }

    const dependencyIds = [...new Set(dependsOnArtifactIds)].sort();
    if (dependencyIds.includes(artifactId)) {
      throw new Error(`Synthetic artifact cannot depend on itself: ${artifactId}`);
    }

    const effectiveParticipantIds = new Set(participantIds);
    for (const dependencyId of dependencyIds) {
      const dependency = this.artifacts.get(dependencyId);
      if (!dependency) throw new Error(`Synthetic artifact dependency is missing: ${dependencyId}`);
      if (!dependency.valid) {
        throw new Error(`Synthetic artifact dependency is invalidated: ${dependencyId}`);
      }
      for (const participantId of dependency.participantIds) effectiveParticipantIds.add(participantId);
    }

    const record: SyntheticArtifactRecord = Object.freeze({
      artifactId,
      kind,
      participantIds: Object.freeze([...effectiveParticipantIds].sort()),
      dependsOnArtifactIds: Object.freeze(dependencyIds),
      valid: true,
      invalidatedReason: null,
    });
    this.artifacts.set(artifactId, record);
    return record;
  }

  getArtifact(artifactId: string): SyntheticArtifactRecord | null {
    return this.artifacts.get(artifactId) ?? null;
  }

  listValidArtifacts(): readonly SyntheticArtifactRecord[] {
    return Object.freeze([...this.artifacts.values()].filter((artifact) => artifact.valid));
  }

  deleteParticipant(participantId: string): {
    readonly participantId: string;
    readonly removedEventCount: number;
    readonly invalidatedArtifactIds: readonly string[];
  } {
    const removedEventCount = this.eventsByParticipant.get(participantId)?.length ?? 0;
    this.eventsByParticipant.delete(participantId);

    const invalidatedArtifactIds: string[] = [];
    for (const [artifactId, artifact] of this.artifacts.entries()) {
      if (!artifact.valid || !artifact.participantIds.includes(participantId)) continue;
      const invalidated: SyntheticArtifactRecord = Object.freeze({
        ...artifact,
        valid: false,
        invalidatedReason: `participant-deleted:${participantId}`,
      });
      this.artifacts.set(artifactId, invalidated);
      invalidatedArtifactIds.push(artifactId);
    }

    invalidatedArtifactIds.sort();
    return Object.freeze({
      participantId,
      removedEventCount,
      invalidatedArtifactIds: Object.freeze(invalidatedArtifactIds),
    });
  }
}
