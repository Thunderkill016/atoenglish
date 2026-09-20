# Specification Quality Checklist: Core Learner Model V1

- [x] Canonical ontology binding is explicit.
- [x] Observation != evidence != state != mastery.
- [x] Unknown is not zero.
- [x] Role/activity/modality/support/reveal boundaries are explicit.
- [x] Changed-context transfer requires exact role/distance pairing and prior baseline context.
- [x] Failed transfer remains failed transfer evidence.
- [x] Accepted lineage and duplicate identity are retained for deterministic replay.
- [x] Batch replay is order-independent through canonical `(occurredAt,eventId)` sorting.
- [x] Incremental reducer is explicitly canonical append-only, not arbitrary-arrival replay.
- [x] Typed `out-of-order-event` fails closed for late earlier arrivals, including same-timestamp lower event IDs.
- [x] Post-validation semantic rejections retain their order key so transfer-first/earlier-baseline-later cannot rewrite history.
- [x] Canonical append-only batch/reducer equivalence covers near/far transfer.
- [x] Projection uses `decisionScope: "routing-only"`; no projection `authorityScope` or mastery flag.
- [x] Legacy compatibility preserves V1 model/status provenance.
- [x] Core has no ambient time/random/network/DB/provider dependency.
- [x] Envelope parser is total/non-throwing and grants no brand.
- [x] Public SHA-256 is treated as integrity only.
- [x] Detached JSON/cloned/rehashed envelopes cannot mint repository-reference routing evidence.
- [x] Envelope compatibility helper accepts only still-branded in-process sealed evidence.
- [x] Durable/reference envelope parsing is symmetric but remains untrusted.
- [ ] Exact-head focused/full verification and independent re-review PASS.

The stale reverse-arrival assertion has now been replaced by the canonical append-only equivalence assertion. The final checkbox remains open until exact-head CI is green and an independent review passes.
