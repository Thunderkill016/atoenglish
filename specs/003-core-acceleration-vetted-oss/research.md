# Research: Open-Source Engine Vetting and Adoption Matrix

**Feature**: [spec.md](./spec.md) | **Date**: 2026-09-04 | **Status**: Draft

---

## 1. Executive Summary & Reuse-First Posture

In accordance with **Issue #138** and the **Owner Directive (Comment 5543614380)**, AtoEnglish adopts a **reuse-first engineering posture**: commodity capabilities (ASR, VAD, forced alignment, linguistic parsing, grammar checking, pronunciation lexicons, and knowledge tracing baselines) must be adopted from vetted open-source engines rather than rebuilt from scratch.

### The 5-Tier Decision Hierarchy
1. **Tier 1 — Direct Library Dependency (Pure TS / npm)**: Permissive license (MIT/Apache-2.0/BSD), pure TypeScript/JavaScript or lightweight WebAssembly/ONNX, low footprint.
2. **Tier 2 — Pinned Source Adaptation / Port**: Bounded and mathematically invariant algorithms (e.g. Corbett & Anderson BKT forward update equations), ported to deterministic TypeScript with pinned upstream provenance and attribution.
3. **Tier 3 — Isolated Local Service / Sidecar Process**: Native C++/Python/Java runtimes, PyTorch/ONNX inference, or LGPL copyleft boundaries. Enforce strict isolation via local HTTP REST/IPC/Unix Domain Sockets. Zero host pollution.
4. **Tier 4 — Baseline / Benchmark Donor Only**: Heavy or complex engines serving as offline gold-standard reference comparators during model calibration and evaluation.
5. **Tier 5 — Reject**: Candidates with viral copyleft contamination (GPLv3) attempting direct linkage into core libraries, non-commercial restrictions (CC-BY-NC), or unmaintained/insecure codebases.

### Epistemic Invariant: Observation vs Learner State
All external engine outputs are classified strictly as **Raw Observations** (`CoreObservation`). Adapters MUST NOT emit certified evidence, durable calibration authority, or learner mastery. BKT transition probabilities or ASR confidence scores cannot directly update Nếp multidimensional construct states or grant mastery certifications.

---

## 2. Comprehensive Candidate Audit Matrix

| # | Engine / Candidate | Upstream URL | Pinned Stable Tag / Commit | Code License | Model / Data License | Runtime & Dependencies | Footprint (RAM / Disk / Proc) | Latency Profile | Integration Mode Recommendation | Nếp Contract Adapter Interface |
|---|-------------------|--------------|---------------------------|--------------|----------------------|------------------------|--------------------------------|-----------------|---------------------------------|--------------------------------|
| **1** | `CAHLR/pyBKT` | `github.com/CAHLR/pyBKT` | Tag `1.4.3` (`06fc180ae72c117458acc527f8ec90cc8e0581c1`) | `MIT` | N/A (Algorithmic) | Python 3.8+, C++, NumPy, SciPy, Pandas, scikit-learn | ~100MB RAM, ~50MB disk, CPU-only | <0.1ms (eval step), 1-30s (EM fit) | **Baseline / Benchmark Donor** + **Pinned TS Port** | `BktAdapterContract` |
| **2** | `openai/whisper` | `github.com/openai/whisper` | Tag `v20250625` (`31243bad24cc746f07d4c8bfdd2d974872cb1803`) | `MIT` | `MIT` | Python 3.8+, PyTorch >=1.10, ffmpeg, tiktoken | 1-6GB RAM, 75MB-3GB disk, GPU recommended | 1.5-5.0s (CPU), 150-400ms (GPU) | **Baseline / Benchmark Donor Only** | `AsrAdapterContract` |
| **3** | `SYSTRAN/faster-whisper` | `github.com/SYSTRAN/faster-whisper` | Tag `v1.2.1` (`65882eee9f5cdbeeb2d877f1131d48cf241b327d`) | `MIT` | `MIT` (CTranslate2 converted) | Python 3.8+, CTranslate2, onnxruntime, tokenizers | 300MB-1GB RAM, 75MB-1.5GB disk, CPU int8 / GPU | 80-250ms (CPU int8), <50ms (GPU) | **Isolated Local Service / Sidecar Process** | `AsrAdapterContract` |
| **4** | `snakers4/silero-vad` | `github.com/snakers4/silero-vad` | Tag `v6.2` (`be95df9152c0d7618fa1edfeb296fc3dae32376f`) | `MIT` | `MIT` (ONNX / TorchScript) | ONNX Runtime (Node/Python/Wasm) or PyTorch | 15-30MB RAM, 2-5MB disk, single CPU thread | <1ms per 30ms chunk (streaming) | **Direct Library (TS/ONNX)** or **Sidecar** | `VadAdapterContract` |
| **5** | `MontrealCorpusTools/Montreal-Forced-Aligner` | `github.com/MontrealCorpusTools/Montreal-Forced-Aligner` | Tag `v3.4.2` (`d2dc283bd79667e086b1f93050a1855349f63f1f`) | `MIT` | `MIT` / `CC-BY-4.0` | Python 3.10+, Kaldi (C++), OpenFST, Pynini, Conda | 1.5-4GB RAM, 2-3GB disk, multi-core CPU | 0.8-3.0s per utterance (batch) | **Isolated Local Service** + **Benchmark Donor** | `AlignmentAdapterContract` |
| **6** | `speechbrain/speechbrain` | `github.com/speechbrain/speechbrain` | Tag `v1.0.2` (`093c105d405d5ca1537663f516fd587485201420`) | `Apache-2.0` | `Apache-2.0` / `CC-BY-4.0` | Python 3.8+, PyTorch >=2.0, torchaudio, huggingface | 2-6GB RAM, 2.5GB+ disk, GPU recommended | 150-500ms (GPU), 1-3s (CPU) | **Baseline / Benchmark Donor Only** | `AcousticRepresentationContract` |
| **7** | `languagetool-org/languagetool` | `github.com/languagetool-org/languagetool` | Tag `v6.6` (`f13e71a7fe85a122290826fd691d267d64e97c33`) | `LGPL-2.1-or-later` | `LGPL-2.1` / `CC-BY-SA` | Java (JDK 17/21), Lucene, Morfologik, Maven | 1.5-4GB RAM, 250MB-8GB disk, multi-core CPU | 15-60ms per sentence (HTTP) | **Isolated Local Service / Sidecar Process** | `LinguisticAdapterContract` |
| **8** | `stanfordnlp/stanza` | `github.com/stanfordnlp/stanza` | Tag `v1.14.0` (`1f4bfdd2bff400969444cf9f290d402448c9d6d5`) | `Apache-2.0` | `CC-BY-SA 4.0` / `Apache-2.0` | Python 3.8+, PyTorch >=1.13, NumPy, protobuf | 1.5-3GB RAM, 2.4GB disk, CPU/GPU | 150-400ms per paragraph (CPU) | **Baseline / Benchmark Donor Only** | `LinguisticAdapterContract` |
| **9** | `explosion/spaCy` | `github.com/explosion/spaCy` | Tag `release-v3.8.9` (`305ffd5560e8b94477294b6515ed07f7edf3c4fc`) | `MIT` | `MIT` (`en_core_web_sm/md`) | Python 3.8+, Cython, Thinc, Blis, Murmurhash | 150-350MB RAM, 25-50MB disk, CPU-optimized | 2-10ms per sentence (CPU) | **Isolated Local Service** + **Pinned TS Port** | `LinguisticAdapterContract` |
| **10** | `cmusphinx/cmudict` | `github.com/cmusphinx/cmudict` | Tag `cmudict-0.7b` (`2f4c83d8defb9176e81cc399d49f3a7cd63fad14`) | `BSD-2-Clause` / Permissive CMU | `BSD-2-Clause` (ASCII dictionary) | Pure Text / TS Trie / Map / SQLite (Zero runtime) | 12-20MB RAM, 3.8MB uncompressed (1.1MB gz) | <0.01ms (O(1) memory lookup) | **Direct Library Dependency / Data Ingestion** | `LexiconAdapterContract` |
| **11** | `bootphon/phonemizer` | `github.com/bootphon/phonemizer` | Tag `v3.4.0` (`f3b886731cc7e12b1ba0392857304657ef3a66bd`) | `GPL-3.0-or-later` | Backend dependent (`espeak-ng` GPL-3.0+) | Python 3.8+, `espeak-ng` system C library | 50-100MB RAM, ~50MB disk, CPU-only | 5-20ms per sentence | **REJECT (from core TS)**; Sidecar/Donor only | `PhonemizerAdapterContract` (isolated) |

---

## 3. Copyleft & Privacy Boundary Protocols

1. **Copyleft Isolation Protocol**:
   - `bootphon/phonemizer` carries GPL-3.0-or-later. Direct linking into TypeScript core would infect AtoEnglish with viral copyleft obligations. Therefore, direct linkage is strictly REJECTED.
   - `languagetool` carries LGPL-2.1-or-later. It is strictly isolated across a network/HTTP process boundary running as an independent local daemon.
2. **Biometric Audio Privacy**:
   - Audio inputs are sensitive biometric data. All speech processing (`faster-whisper`, `silero-vad`, `MFA`) runs local-first / on-premise without external third-party cloud calls. In-memory buffers are ephemeral and zeroed out after feature extraction.
