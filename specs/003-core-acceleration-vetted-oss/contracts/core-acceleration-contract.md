# Contract: Core Acceleration and Vetted Open-Source Matrix V1

- **Contract Identifier**: `nep.vetted-oss-matrix.v1`.
- **Contract Version**: `1`.
- **Reuse-First Policy Invariants**:
  - A commodity capability MUST NOT be built from scratch without first auditing the vetted open-source matrix.
  - Decision hierarchy MUST proceed in order:
    1. Direct library dependency (permissive license, pure TS/Wasm/ONNX, low footprint).
    2. Pinned source adaptation (pure invariant algorithm, explicit provenance and attribution).
    3. Isolated local service / sidecar (native runtime, PyTorch/Java, or LGPL process boundary).
    4. Baseline / benchmark donor only (offline comparative validation).
    5. Internal build only when 1–4 are formally unviable.
- **Constitutional Epistemic Boundary**:
  - External engine outputs are strictly classified as **Raw Observations** (`CoreObservation`).
  - Open-source adapters MUST NOT emit certified evidence, durable calibration authority, or learner mastery.
  - ASR confidence, VAD probabilities, grammar flags, and BKT probabilities cannot mutate learner skill projections directly.
- **Copyleft Isolation Invariants**:
  - **LGPL-2.1+**: Components like LanguageTool MUST operate across an isolated network/process boundary (loopback HTTP/REST or IPC daemon). Direct bundling/linking into the core TypeScript package is strictly prohibited.
  - **GPL-3.0+**: Direct linking of GPLv3 components (e.g. `bootphon/phonemizer`) into core distribution is REJECTED.
  - **Non-Commercial**: Any model or code carrying non-commercial restrictions (`CC-BY-NC`) is strictly REJECTED from the production path.
- **Provenance & Attribution Invariants**:
  - Every vetted engine MUST have pinned upstream repository URL, release tag, and an immutable full 40-character hexadecimal git commit SHA (`/^[0-9a-f]{40}$/i`). Tag strings or short SHAs are strictly prohibited.
  - Upstream copyright notices, licenses, and author citations MUST be preserved in the third-party notice registry.
  - Code and model/data licenses MUST be evaluated independently; permissive code never auto-approves incompatible model/data terms under direct linking.
- **Model/Data Artifact Provenance Invariants (GEMINI-ACCEL-003)**:
  - Code and model/data weights/data artifacts MUST maintain strict provenance separation via explicit `ModelArtifactRecord` (`artifactId`, `upstreamSource`, `revision`, `license`, `status`).
  - Permissive source code (MIT, Apache-2.0, BSD) MUST NOT imply approved model/data weights.
  - Any package with `modelArtifact.status: "unapproved"` or `modelLicense: "unapproved"` MUST fail closed and is strictly rejected for production-capable integration (`direct-library`, `source-adaptation`, `isolated-service`).
  - Baseline-only packages (`montreal-forced-aligner`, `speechbrain`, `stanfordnlp-stanza`, `openai-whisper`) MUST explicitly declare that no runtime model artifact is approved for production (`status: "unapproved"` or `"not-applicable"`).
- **Runtime Boundary & Payload Immutability Invariants (GEMINI-ACCEL-003)**:
  - `createVettedCoreObservation` MUST act as a fail-closed runtime boundary, not merely a TypeScript generic.
  - Accepted payloads MUST undergo discriminated schema validation with exact key whitelisting and finite/range validation on all numeric fields (timing, probabilities, durations, confidences).
  - All 5 adapter families MUST cross into canonical `CoreObservation` envelopes without `as any` or parallel observation ontologies; linguistic maps to `SyntaxDiagnosticPayload` and alignment maps to `AcousticDiagnosticPayload`.
  - Recursive anti-injection scanner MUST detect and reject forbidden authority/mastery/calibration fields at any nesting depth.
  - Runtime activity MUST be validated against canonical `COMMUNICATION_ACTIVITIES`.
  - The accepted payload and resulting observation envelope MUST be deeply cloned and deeply frozen (`deepFreeze`) to guarantee complete post-construction immutability.
- **Purity & Determinism**:
  - The registry, policy engine, adapters, and observation wrapper MUST be pure and deterministic with zero ambient time (`new Date()`, `Date.now()`) or network dependencies.
  - Given identical semantic inputs and explicit ISO timestamp string, adapter execution MUST replay byte-deterministically.

