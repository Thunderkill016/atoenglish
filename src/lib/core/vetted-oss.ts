import type {
  CoreObservation,
  ObservationAuthority,
  CalibrationProfile,
  ObservationProvenance,
  ObservationContext,
} from "./observation";
import { normalizeObservationConfidence } from "./observation";
import type {
  DiagnosticPayload,
  SyntaxDiagnosticPayload,
  AcousticDiagnosticPayload,
  GrammaticalErrorDetail,
  GrammaticalErrorCategory,
  PhonemeAlignmentDetail,
} from "./diagnostics";
import { COMMUNICATION_ACTIVITIES, type CommunicationActivity } from "./domain";
import type {
  LinguisticAnnotationRawPayload,
  LinguisticToken,
  GrammarDiagnostic,
} from "./adapters/linguistic-adapter";
import type {
  PhonemeAlignmentRawPayload,
  AlignedWord,
  AlignedPhoneme,
} from "./adapters/alignment-adapter";

export const VETTED_OSS_CONTRACT_ID = "nep.vetted-oss-matrix.v1" as const;
export const VETTED_OSS_CONTRACT_VERSION = 1 as const;

export const VETTED_PACKAGE_IDS = [
  "cahlr-pybkt",
  "openai-whisper",
  "systran-faster-whisper",
  "silero-vad",
  "montreal-forced-aligner",
  "speechbrain",
  "languagetool",
  "stanfordnlp-stanza",
  "explosion-spacy",
  "cmusphinx-cmudict",
  "bootphon-phonemizer",
  "open-spaced-repetition-ts-fsrs",
] as const;

export type VettedPackageId = (typeof VETTED_PACKAGE_IDS)[number];

export const LICENSE_CLASSIFICATIONS = [
  "permissive-mit",
  "permissive-apache2",
  "permissive-bsd",
  "copyleft-lgpl",
  "copyleft-gpl",
  "non-commercial",
  "unapproved",
] as const;

export type LicenseClassification = (typeof LICENSE_CLASSIFICATIONS)[number];

export const MODEL_ARTIFACT_STATUSES = [
  "approved",
  "unapproved",
  "not-applicable",
] as const;

export type ModelArtifactStatus = (typeof MODEL_ARTIFACT_STATUSES)[number];

export type ModelArtifactRecord = {
  readonly artifactId: string;
  readonly upstreamSource: string;
  readonly revision: string;
  readonly fingerprintSha256?: string;
  readonly license: LicenseClassification | "not-applicable";
  readonly status: ModelArtifactStatus;
  readonly notes?: string;
};

export const INTEGRATION_MODES = [
  "direct-library",
  "source-adaptation",
  "isolated-service",
  "baseline-donor",
  "rejected",
] as const;

export type IntegrationMode = (typeof INTEGRATION_MODES)[number];

export type PackageResourceFootprint = {
  readonly ramMb: number;
  readonly diskMb: number;
  readonly gpuRequired: boolean;
};

export type VettedPackageDescriptor = {
  readonly id: VettedPackageId;
  readonly name: string;
  readonly capability: string;
  readonly upstreamUrl: string;
  readonly pinnedTag: string;
  readonly pinnedCommit: string; // Must be a valid 40-hex commit SHA
  readonly codeLicense: LicenseClassification;
  readonly modelLicense: LicenseClassification | "not-applicable";
  readonly modelArtifact: ModelArtifactRecord;
  readonly modelLicenseNotes?: string;
  readonly runtime: string;
  readonly offlineSelfHostable: boolean;
  readonly footprint: PackageResourceFootprint;
  readonly footprintNotes?: string;
  readonly latencyProfile: string;
  readonly latencyNotes?: string;
  readonly integrationMode: IntegrationMode;
  readonly attributionRequired: boolean;
  readonly adapterContract: string;
  readonly attributionNotice: string;
};

export type ReuseDecision = {
  readonly packageId: VettedPackageId;
  readonly status: "approved" | "rejected";
  readonly decisionTier: 1 | 2 | 3 | 4 | 5;
  readonly mode: IntegrationMode;
  readonly justification: string;
};

export type LicenseValidationResult = {
  readonly valid: boolean;
  readonly reason?: string;
  readonly copyleftIsolated: boolean;
};

export type DescriptorValidationResult = {
  readonly valid: boolean;
  readonly reason?: string;
};

export const VETTED_OSS_REGISTRY: Readonly<Record<VettedPackageId, VettedPackageDescriptor>> = Object.freeze({
  "cahlr-pybkt": Object.freeze({
    id: "cahlr-pybkt",
    name: "CAHLR/pyBKT",
    capability: "Bayesian Knowledge Tracing (BKT) baseline reference",
    upstreamUrl: "https://github.com/CAHLR/pyBKT",
    pinnedTag: "1.4.3",
    pinnedCommit: "06fc180ae72c117458acc527f8ec90cc8e0581c1",
    codeLicense: "permissive-mit",
    modelLicense: "not-applicable",
    modelArtifact: Object.freeze({
      artifactId: "none",
      upstreamSource: "none",
      revision: "none",
      license: "not-applicable",
      status: "not-applicable",
      notes: "Algorithmic fitting library without external pretrained model weights.",
    }),
    modelLicenseNotes: "pyBKT is an algorithmic fitting library without external pretrained model weights.",
    runtime: "Python / C++ (NumPy, SciPy, Pandas, scikit-learn)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 100, diskMb: 50, gpuRequired: false }),
    footprintNotes: "Footprint represents Python runtime with NumPy/SciPy; TS forward step requires negligible memory (<1MB).",
    latencyProfile: "<0.1ms per step forward inference, 1-30s EM fit",
    integrationMode: "baseline-donor",
    attributionRequired: true,
    adapterContract: "BktAdapterContract",
    attributionNotice: "Copyright (c) CAHLR / Zachary Pardos et al. Corbett & Anderson (1994) knowledge tracing.",
  }),
  "openai-whisper": Object.freeze({
    id: "openai-whisper",
    name: "OpenAI Whisper",
    capability: "Speech-to-text gold-standard transcription baseline",
    upstreamUrl: "https://github.com/openai/whisper",
    pinnedTag: "v20250625",
    pinnedCommit: "31243bad24cc746f07d4c8bfdd2d974872cb1803",
    codeLicense: "permissive-mit",
    modelLicense: "unapproved",
    modelArtifact: Object.freeze({
      artifactId: "openai-whisper-checkpoints-baseline",
      upstreamSource: "https://github.com/openai/whisper",
      revision: "v20250625",
      license: "permissive-mit",
      status: "unapproved",
      notes: "OpenAI Whisper checkpoints are research reference baselines; unapproved for production runtime deployment.",
    }),
    modelLicenseNotes: "OpenAI Whisper model checkpoints (tiny, base, small, medium, large-v3) are research reference baselines only; unapproved for production deployment.",
    runtime: "Python / PyTorch (>=1.10, ffmpeg, tiktoken)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 2048, diskMb: 1500, gpuRequired: true }),
    footprintNotes: "Resource footprint varies heavily by model size: tiny requires ~1GB RAM/75MB disk; large-v3 requires ~6GB RAM/3GB disk.",
    latencyProfile: "1.5-5.0s per utterance CPU, 150-400ms GPU",
    latencyNotes: "Latency depends on utterance length and GPU acceleration availability.",
    integrationMode: "baseline-donor",
    attributionRequired: true,
    adapterContract: "AsrAdapterContract",
    attributionNotice: "Copyright (c) OpenAI. Licensed under the MIT License.",
  }),
  "systran-faster-whisper": Object.freeze({
    id: "systran-faster-whisper",
    name: "SYSTRAN faster-whisper",
    capability: "Fast self-hosted local speech-to-text inference",
    upstreamUrl: "https://github.com/SYSTRAN/faster-whisper",
    pinnedTag: "v1.2.1",
    pinnedCommit: "65882eee9f5cdbeeb2d877f1131d48cf241b327d",
    codeLicense: "permissive-mit",
    modelLicense: "permissive-mit",
    modelArtifact: Object.freeze({
      artifactId: "whisper-base.en-ctranslate2",
      upstreamSource: "https://huggingface.co/Systran/faster-whisper-base.en",
      revision: "v1.2.1",
      license: "permissive-mit",
      status: "approved",
      notes: "CTranslate2 converted OpenAI Whisper base.en checkpoint preserving MIT license terms.",
    }),
    modelLicenseNotes: "CTranslate2 converted Whisper weights preserve MIT license terms.",
    runtime: "CTranslate2 / C++ / Python (onnxruntime, tokenizers)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 600, diskMb: 240, gpuRequired: false }),
    footprintNotes: "Footprint measured using int8 quantized base.en model.",
    latencyProfile: "80-250ms CPU int8, <50ms GPU",
    integrationMode: "isolated-service",
    attributionRequired: true,
    adapterContract: "AsrAdapterContract",
    attributionNotice: "Copyright (c) SYSTRAN and faster-whisper contributors. Licensed under MIT License.",
  }),
  "silero-vad": Object.freeze({
    id: "silero-vad",
    name: "Silero VAD",
    capability: "Voice activity detection and streaming audio segmentation",
    upstreamUrl: "https://github.com/snakers4/silero-vad",
    pinnedTag: "v6.2",
    pinnedCommit: "be95df9152c0d7618fa1edfeb296fc3dae32376f",
    codeLicense: "permissive-mit",
    modelLicense: "permissive-mit",
    modelArtifact: Object.freeze({
      artifactId: "silero-vad-onnx-v6.2",
      upstreamSource: "https://github.com/snakers4/silero-vad/raw/v6.2/files/silero_vad.onnx",
      revision: "v6.2",
      license: "permissive-mit",
      status: "approved",
      notes: "Official Silero VAD ONNX model weights v6.2 distributed under MIT license alongside source code.",
    }),
    modelLicenseNotes: "Silero VAD ONNX model weights are distributed under MIT license alongside source code.",
    runtime: "ONNX Runtime (pure JS/TS onnxruntime-node/web) or Python",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 30, diskMb: 5, gpuRequired: false }),
    footprintNotes: "Lightweight ONNX model (<5MB disk, ~30MB memory buffer).",
    latencyProfile: "<1ms per 30ms audio chunk (streaming)",
    integrationMode: "direct-library",
    attributionRequired: true,
    adapterContract: "VadAdapterContract",
    attributionNotice: "Copyright (c) Silero Team. Licensed under the MIT License.",
  }),
  "montreal-forced-aligner": Object.freeze({
    id: "montreal-forced-aligner",
    name: "Montreal Forced Aligner (MFA)",
    capability: "Acoustic phoneme-to-text forced alignment and boundary detection",
    upstreamUrl: "https://github.com/MontrealCorpusTools/Montreal-Forced-Aligner",
    pinnedTag: "v3.4.2",
    pinnedCommit: "d2dc283bd79667e086b1f93050a1855349f63f1f",
    codeLicense: "permissive-mit",
    modelLicense: "unapproved",
    modelArtifact: Object.freeze({
      artifactId: "mfa-english-acoustic-unvetted",
      upstreamSource: "https://github.com/MontrealCorpusTools/mfa-models",
      revision: "unresolved",
      license: "unapproved",
      status: "unapproved",
      notes: "Acoustic models vary by training corpus (LibriSpeech/CommonVoice); no specific checkpoint has been vetted for production.",
    }),
    modelLicenseNotes: "MFA code is MIT; acoustic models and pronunciation dictionaries vary by training corpus and are unapproved for production until an exact model artifact is vetted.",
    runtime: "Python 3.10+ / Kaldi (C++) / OpenFST / Pynini",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 3000, diskMb: 2500, gpuRequired: false }),
    footprintNotes: "Requires Kaldi acoustic models and language model dictionaries on disk.",
    latencyProfile: "0.8-3.0s per utterance (asynchronous batch alignment)",
    integrationMode: "baseline-donor",
    attributionRequired: true,
    adapterContract: "AlignmentAdapterContract",
    attributionNotice: "Copyright (c) Montreal Corpus Tools (Michael McAuliffe et al.). Licensed under MIT.",
  }),
  "speechbrain": Object.freeze({
    id: "speechbrain",
    name: "SpeechBrain",
    capability: "Speech acoustic embeddings and baseline representation extraction",
    upstreamUrl: "https://github.com/speechbrain/speechbrain",
    pinnedTag: "v1.0.2",
    pinnedCommit: "093c105d405d5ca1537663f516fd587485201420",
    codeLicense: "permissive-apache2",
    modelLicense: "unapproved",
    modelArtifact: Object.freeze({
      artifactId: "speechbrain-checkpoints-unvetted",
      upstreamSource: "https://huggingface.co/speechbrain",
      revision: "unresolved",
      license: "unapproved",
      status: "unapproved",
      notes: "Pretrained speech representation checkpoints on Hugging Face vary widely in licensing; none approved for production.",
    }),
    modelLicenseNotes: "SpeechBrain codebase is Apache-2.0; individual pretrained checkpoints on Hugging Face require per-model card license checks and are unapproved for production.",
    runtime: "Python / PyTorch (>=2.0, torchaudio, huggingface_hub)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 4000, diskMb: 2500, gpuRequired: true }),
    footprintNotes: "Speech embedding extraction with wav2vec2 or ECAPA-TDNN requires significant GPU VRAM.",
    latencyProfile: "150-500ms GPU, 1-3s CPU",
    integrationMode: "baseline-donor",
    attributionRequired: true,
    adapterContract: "AcousticRepresentationContract",
    attributionNotice: "Copyright (c) SpeechBrain Team (Mirco Ravanelli et al.). Licensed under Apache-2.0.",
  }),
  "languagetool": Object.freeze({
    id: "languagetool",
    name: "LanguageTool",
    capability: "Rule-based grammar, style, and spelling diagnostic verification",
    upstreamUrl: "https://github.com/languagetool-org/languagetool",
    pinnedTag: "v6.6",
    pinnedCommit: "f13e71a7fe85a122290826fd691d267d64e97c33",
    codeLicense: "copyleft-lgpl",
    modelLicense: "copyleft-lgpl",
    modelArtifact: Object.freeze({
      artifactId: "languagetool-en-rules-v6.6",
      upstreamSource: "https://github.com/languagetool-org/languagetool/tree/v6.6/languagetool-language-modules/en",
      revision: "v6.6",
      license: "copyleft-lgpl",
      status: "approved",
      notes: "Rule definitions and morphological dictionaries are licensed under LGPL-2.1-or-later. Optional ngram data is separate.",
    }),
    modelLicenseNotes: "Rule definitions and morphological dictionaries are licensed under LGPL-2.1-or-later. Optional ngram data is separate.",
    runtime: "Java 17/21 (OpenJDK, Lucene, Morfologik)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 2048, diskMb: 500, gpuRequired: false }),
    footprintNotes: "Embedded JVM process requires ~1.5-2GB heap for full English dictionary rules.",
    latencyProfile: "15-60ms per sentence via local HTTP loopback",
    integrationMode: "isolated-service",
    attributionRequired: true,
    adapterContract: "LinguisticAdapterContract",
    attributionNotice: "Copyright (c) Daniel Naber and LanguageTool contributors. Licensed under LGPL-2.1-or-later.",
  }),
  "stanfordnlp-stanza": Object.freeze({
    id: "stanfordnlp-stanza",
    name: "Stanford Stanza",
    capability: "Linguistic analysis and universal syntactic dependency parsing",
    upstreamUrl: "https://github.com/stanfordnlp/stanza",
    pinnedTag: "v1.14.0",
    pinnedCommit: "1f4bfdd2bff400969444cf9f290d402448c9d6d5",
    codeLicense: "permissive-apache2",
    modelLicense: "unapproved",
    modelArtifact: Object.freeze({
      artifactId: "stanza-en-ud-unvetted",
      upstreamSource: "https://stanfordnlp.github.io/stanza/models.html",
      revision: "unresolved",
      license: "unapproved",
      status: "unapproved",
      notes: "Universal Dependencies English models require per-treebank evaluation; unapproved for production.",
    }),
    modelLicenseNotes: "Stanza codebase is Apache-2.0; language models trained on Universal Dependencies are unapproved for production until an exact treebank is vetted.",
    runtime: "Python / PyTorch (>=1.13, NumPy, protobuf)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 2048, diskMb: 1000, gpuRequired: false }),
    footprintNotes: "Standard English pipeline requires ~1GB disk for tokenizer, POS, and dependency parser models.",
    latencyProfile: "150-400ms per paragraph CPU",
    integrationMode: "baseline-donor",
    attributionRequired: true,
    adapterContract: "LinguisticAdapterContract",
    attributionNotice: "Copyright (c) The Board of Trustees of the Leland Stanford Junior University. Licensed under Apache-2.0.",
  }),
  "explosion-spacy": Object.freeze({
    id: "explosion-spacy",
    name: "Explosion spaCy",
    capability: "Industrial tokenization, POS tagging, and syntactic parsing",
    upstreamUrl: "https://github.com/explosion/spaCy",
    pinnedTag: "release-v3.8.9",
    pinnedCommit: "305ffd5560e8b94477294b6515ed07f7edf3c4fc",
    codeLicense: "permissive-mit",
    modelLicense: "permissive-mit",
    modelArtifact: Object.freeze({
      artifactId: "en_core_web_sm-3.8.0",
      upstreamSource: "https://github.com/explosion/spacy-models/releases/tag/en_core_web_sm-3.8.0",
      revision: "3.8.0",
      license: "permissive-mit",
      status: "approved",
      notes: "Official spaCy English small pipeline model published under MIT license.",
    }),
    modelLicenseNotes: "spaCy core package and standard pipelines (en_core_web_sm, en_core_web_md) are released under MIT.",
    runtime: "Python / Cython / C (Thinc, Blis, Murmurhash)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 250, diskMb: 50, gpuRequired: false }),
    footprintNotes: "en_core_web_sm package requires ~15MB disk and ~150MB memory.",
    latencyProfile: "2-10ms per sentence CPU",
    integrationMode: "isolated-service",
    attributionRequired: true,
    adapterContract: "LinguisticAdapterContract",
    attributionNotice: "Copyright (c) Explosion AI GmbH. Licensed under the MIT License.",
  }),
  "cmusphinx-cmudict": Object.freeze({
    id: "cmusphinx-cmudict",
    name: "CMU Pronouncing Dictionary",
    capability: "North American English phoneme pronunciation lexicon (ARPAbet to IPA)",
    upstreamUrl: "https://github.com/cmusphinx/cmudict",
    pinnedTag: "cmudict-0.7b",
    pinnedCommit: "2f4c83d8defb9176e81cc399d49f3a7cd63fad14",
    codeLicense: "permissive-bsd",
    modelLicense: "permissive-bsd",
    modelArtifact: Object.freeze({
      artifactId: "cmudict-0.7b-lexicon",
      upstreamSource: "https://github.com/cmusphinx/cmudict/raw/cmudict-0.7b/cmudict-0.7b",
      revision: "0.7b",
      license: "permissive-bsd",
      status: "approved",
      notes: "CMUdict lexical data is released under BSD-2-Clause / public domain terms.",
    }),
    modelLicenseNotes: "CMUdict lexical data is released under BSD-2-Clause / public domain terms.",
    runtime: "Plain text / TypeScript hash trie (Zero runtime dependencies)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 16, diskMb: 4, gpuRequired: false }),
    footprintNotes: "In-memory compact prefix trie for ~134,000 words requires ~16MB RAM.",
    latencyProfile: "<0.01ms in-memory trie lookup",
    integrationMode: "direct-library",
    attributionRequired: true,
    adapterContract: "LexiconAdapterContract",
    attributionNotice: "Copyright (c) 1993-2014 Carnegie Mellon University. BSD-style license.",
  }),
  "bootphon-phonemizer": Object.freeze({
    id: "bootphon-phonemizer",
    name: "bootphon/phonemizer",
    capability: "Multilingual text-to-phoneme conversion",
    upstreamUrl: "https://github.com/bootphon/phonemizer",
    pinnedTag: "v3.4.0",
    pinnedCommit: "f3b886731cc7e12b1ba0392857304657ef3a66bd",
    codeLicense: "copyleft-gpl",
    modelLicense: "copyleft-gpl",
    modelArtifact: Object.freeze({
      artifactId: "bootphon-espeak-ng-data",
      upstreamSource: "https://github.com/espeak-ng/espeak-ng",
      revision: "unresolved",
      license: "copyleft-gpl",
      status: "unapproved",
      notes: "GPL-3.0 viral copyleft models and dictionaries; rejected.",
    }),
    modelLicenseNotes: "GPL-3.0-or-later; strict viral copyleft terms.",
    runtime: "Python / espeak-ng C library",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 80, diskMb: 50, gpuRequired: false }),
    footprintNotes: "Requires espeak-ng binary and data files.",
    latencyProfile: "5-20ms per sentence",
    integrationMode: "rejected",
    attributionRequired: true,
    adapterContract: "PhonemizerAdapterContract",
    attributionNotice: "Copyright (c) Mathieu Bernard et al. Licensed under GPL-3.0-or-later. REJECTED from direct TS link.",
  }),
  "open-spaced-repetition-ts-fsrs": Object.freeze({
    id: "open-spaced-repetition-ts-fsrs",
    name: "Open Spaced Repetition ts-fsrs",
    capability: "Free Spaced Repetition Scheduler (FSRS-v5 19 parameters)",
    upstreamUrl: "https://github.com/open-spaced-repetition/ts-fsrs",
    pinnedTag: "v5.4.1",
    pinnedCommit: "bfc0a1960dfde4b4627ae4f4c8757b9211314963",
    codeLicense: "permissive-mit",
    modelLicense: "not-applicable",
    modelArtifact: Object.freeze({
      artifactId: "none",
      upstreamSource: "none",
      revision: "none",
      license: "not-applicable",
      status: "not-applicable",
      notes: "Pure TypeScript mathematical scheduling library; no external model weights.",
    }),
    modelLicenseNotes: "Pure TypeScript mathematical scheduling library; no external model weights.",
    runtime: "Pure TypeScript (Zero dependencies)",
    offlineSelfHostable: true,
    footprint: Object.freeze({ ramMb: 1, diskMb: 1, gpuRequired: false }),
    footprintNotes: "Zero external dependencies, pure mathematical formula execution.",
    latencyProfile: "<0.01ms review interval calculation",
    integrationMode: "direct-library",
    attributionRequired: true,
    adapterContract: "FsrsAdapterContract",
    attributionNotice: "Copyright (c) Open Spaced Repetition. Licensed under MIT.",
  }),
});

export function getVettedPackage(id: VettedPackageId): VettedPackageDescriptor | undefined {
  return VETTED_OSS_REGISTRY[id];
}

export function listVettedPackages(filter?: {
  mode?: IntegrationMode;
  capabilitySubstring?: string;
}): readonly VettedPackageDescriptor[] {
  const all = Object.values(VETTED_OSS_REGISTRY);
  return Object.freeze(
    all.filter((pkg) => {
      if (filter?.mode && pkg.integrationMode !== filter.mode) return false;
      if (
        filter?.capabilitySubstring &&
        !pkg.capability.toLowerCase().includes(filter.capabilitySubstring.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
  );
}

export function isPermissiveLicense(license: LicenseClassification): boolean {
  return (
    license === "permissive-mit" ||
    license === "permissive-apache2" ||
    license === "permissive-bsd"
  );
}

const HEX_40_REGEX = /^[0-9a-f]{40}$/i;

export function validateVettedPackageDescriptor(descriptor: unknown): DescriptorValidationResult {
  if (typeof descriptor !== "object" || descriptor === null) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor must be a non-null object",
    });
  }

  const d = descriptor as Record<string, unknown>;

  if (typeof d.id !== "string" || !VETTED_PACKAGE_IDS.includes(d.id as VettedPackageId)) {
    return Object.freeze({
      valid: false,
      reason: `Invalid or unapproved package id: '${String(d.id)}'`,
    });
  }

  if (typeof d.name !== "string" || !d.name.trim() || d.name.trim().length < 2) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor name must be a non-empty string",
    });
  }

  if (typeof d.capability !== "string" || !d.capability.trim() || d.capability.trim().length < 10) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor capability must be a meaningful description of at least 10 characters",
    });
  }

  if (
    typeof d.upstreamUrl !== "string" ||
    (!d.upstreamUrl.startsWith("https://github.com/") && !d.upstreamUrl.startsWith("https://"))
  ) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor upstreamUrl must be a valid HTTPS URL (e.g. https://github.com/...)",
    });
  }

  if (typeof d.pinnedTag !== "string" || !d.pinnedTag.trim()) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor pinnedTag must be a non-empty string",
    });
  }

  if (typeof d.pinnedCommit !== "string" || !HEX_40_REGEX.test(d.pinnedCommit.trim())) {
    return Object.freeze({
      valid: false,
      reason: "pinnedCommit must be a valid 40-character hexadecimal git commit SHA",
    });
  }

  if (typeof d.codeLicense !== "string" || !LICENSE_CLASSIFICATIONS.includes(d.codeLicense as LicenseClassification)) {
    return Object.freeze({
      valid: false,
      reason: `Invalid codeLicense classification: '${String(d.codeLicense)}'`,
    });
  }

  if (
    typeof d.modelLicense !== "string" ||
    (d.modelLicense !== "not-applicable" && !LICENSE_CLASSIFICATIONS.includes(d.modelLicense as LicenseClassification))
  ) {
    return Object.freeze({
      valid: false,
      reason: `Invalid modelLicense classification: '${String(d.modelLicense)}'`,
    });
  }

  if (typeof d.runtime !== "string" || !d.runtime.trim() || d.runtime.trim().length < 3) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor runtime must specify execution environment",
    });
  }

  if (typeof d.offlineSelfHostable !== "boolean") {
    return Object.freeze({
      valid: false,
      reason: "Descriptor offlineSelfHostable must be a boolean",
    });
  }

  if (
    typeof d.footprint !== "object" ||
    d.footprint === null ||
    typeof (d.footprint as PackageResourceFootprint).ramMb !== "number" ||
    (d.footprint as PackageResourceFootprint).ramMb <= 0 ||
    typeof (d.footprint as PackageResourceFootprint).diskMb !== "number" ||
    (d.footprint as PackageResourceFootprint).diskMb <= 0 ||
    typeof (d.footprint as PackageResourceFootprint).gpuRequired !== "boolean"
  ) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor footprint must define positive ramMb, diskMb, and boolean gpuRequired",
    });
  }

  if (typeof d.integrationMode !== "string" || !INTEGRATION_MODES.includes(d.integrationMode as IntegrationMode)) {
    return Object.freeze({
      valid: false,
      reason: `Invalid integrationMode: '${String(d.integrationMode)}'`,
    });
  }

  if (typeof d.attributionNotice !== "string" || !d.attributionNotice.trim() || d.attributionNotice.trim().length < 5) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor attributionNotice must be provided for legal compliance",
    });
  }

  if (
    typeof d.modelArtifact !== "object" ||
    d.modelArtifact === null ||
    typeof (d.modelArtifact as ModelArtifactRecord).artifactId !== "string" ||
    !(d.modelArtifact as ModelArtifactRecord).artifactId.trim() ||
    typeof (d.modelArtifact as ModelArtifactRecord).upstreamSource !== "string" ||
    !(d.modelArtifact as ModelArtifactRecord).upstreamSource.trim() ||
    typeof (d.modelArtifact as ModelArtifactRecord).revision !== "string" ||
    !(d.modelArtifact as ModelArtifactRecord).revision.trim() ||
    !MODEL_ARTIFACT_STATUSES.includes((d.modelArtifact as ModelArtifactRecord).status) ||
    ((d.modelArtifact as ModelArtifactRecord).license !== "not-applicable" &&
      !LICENSE_CLASSIFICATIONS.includes((d.modelArtifact as ModelArtifactRecord).license as LicenseClassification))
  ) {
    return Object.freeze({
      valid: false,
      reason: "Descriptor modelArtifact must be a valid ModelArtifactRecord with artifactId, upstreamSource, revision, status, and license",
    });
  }

  return Object.freeze({ valid: true });
}

export function validateLicenseCompatibility(
  codeLicense: LicenseClassification,
  modelLicense: LicenseClassification | "not-applicable",
  mode: IntegrationMode
): LicenseValidationResult {
  if (codeLicense === "non-commercial" || modelLicense === "non-commercial") {
    return Object.freeze({
      valid: false,
      reason: "Non-commercial licenses are strictly forbidden in Core production path",
      copyleftIsolated: false,
    });
  }

  if (codeLicense === "unapproved" || modelLicense === "unapproved") {
    if (mode !== "baseline-donor" && mode !== "rejected") {
      return Object.freeze({
        valid: false,
        reason: "Unapproved license is rejected fail-closed: unapproved code or model license cannot be approved for production-capable integration",
        copyleftIsolated: false,
      });
    }
  }

  if (mode === "rejected") {
    return Object.freeze({
      valid: true,
      reason: "Rejected package correctly excluded from production paths",
      copyleftIsolated: true,
    });
  }

  // GPL copyleft checks
  if (codeLicense === "copyleft-gpl") {
    if (mode === "direct-library") {
      return Object.freeze({
        valid: false,
        reason: "Direct linking of GPL-3.0 copyleft code into Core TypeScript is forbidden",
        copyleftIsolated: false,
      });
    }
    if (mode === "source-adaptation") {
      return Object.freeze({
        valid: false,
        reason: "Adapting GPL-3.0 copyleft code into Core TypeScript repository is forbidden",
        copyleftIsolated: false,
      });
    }
  }

  if (modelLicense === "copyleft-gpl") {
    if (mode === "direct-library") {
      return Object.freeze({
        valid: false,
        reason: "Direct bundling of GPL-3.0 model/data into Core TypeScript distribution is forbidden",
        copyleftIsolated: false,
      });
    }
    if (mode === "source-adaptation") {
      return Object.freeze({
        valid: false,
        reason: "Direct adaptation of GPL-3.0 data into Core TypeScript repository is forbidden",
        copyleftIsolated: false,
      });
    }
  }

  // LGPL copyleft checks
  if (codeLicense === "copyleft-lgpl") {
    if (mode === "direct-library") {
      return Object.freeze({
        valid: false,
        reason: "Direct bundling of LGPL code into Core TypeScript distribution is forbidden; must use isolated-service",
        copyleftIsolated: false,
      });
    }
    if (mode === "source-adaptation") {
      return Object.freeze({
        valid: false,
        reason: "Adapting LGPL code into Core TypeScript source files violates copyleft",
        copyleftIsolated: false,
      });
    }
  }

  if (modelLicense === "copyleft-lgpl") {
    if (mode === "direct-library") {
      return Object.freeze({
        valid: false,
        reason: "Direct bundling of LGPL model/data into Core TypeScript distribution is forbidden; must use isolated-service",
        copyleftIsolated: false,
      });
    }
  }

  // Isolated service boundary check for LGPL
  if ((codeLicense === "copyleft-lgpl" || modelLicense === "copyleft-lgpl") && mode === "isolated-service") {
    return Object.freeze({
      valid: true,
      copyleftIsolated: true,
    });
  }

  // Independent permissive license evaluation
  if (isPermissiveLicense(codeLicense)) {
    // Permissive code NEVER auto-approves incompatible model/data license!
    if (modelLicense === "copyleft-gpl" && (mode === "direct-library" || mode === "source-adaptation")) {
      return Object.freeze({
        valid: false,
        reason: "Permissive code cannot auto-approve copyleft-gpl model/data under direct library linking",
        copyleftIsolated: false,
      });
    }
    if (modelLicense === "copyleft-lgpl" && mode === "direct-library") {
      return Object.freeze({
        valid: false,
        reason: "Permissive code cannot auto-approve copyleft-lgpl model/data under direct library linking",
        copyleftIsolated: false,
      });
    }
    if (
      modelLicense === "not-applicable" ||
      isPermissiveLicense(modelLicense) ||
      (modelLicense === "copyleft-lgpl" && mode === "isolated-service") ||
      mode === "baseline-donor"
    ) {
      return Object.freeze({
        valid: true,
        copyleftIsolated: true,
      });
    }
  }

  return Object.freeze({
    valid: false,
    reason: `Incompatible license configuration: code=${codeLicense}, model=${modelLicense} under mode=${mode}`,
    copyleftIsolated: false,
  });
}

export function evaluateReuseDecision(descriptor: VettedPackageDescriptor): ReuseDecision {
  const descriptorValidation = validateVettedPackageDescriptor(descriptor);
  if (!descriptorValidation.valid) {
    return Object.freeze({
      packageId: descriptor.id ?? "unknown",
      status: "rejected",
      decisionTier: 5,
      mode: "rejected",
      justification: `Descriptor validation failed: ${descriptorValidation.reason}`,
    });
  }

  const licenseCheck = validateLicenseCompatibility(
    descriptor.codeLicense,
    descriptor.modelLicense,
    descriptor.integrationMode
  );

  if (!licenseCheck.valid) {
    return Object.freeze({
      packageId: descriptor.id,
      status: "rejected",
      decisionTier: 5,
      mode: "rejected",
      justification: licenseCheck.reason ?? "License validation failed",
    });
  }

  // Production-capable gate on model artifact
  const isProductionCapableMode =
    descriptor.integrationMode === "direct-library" ||
    descriptor.integrationMode === "source-adaptation" ||
    descriptor.integrationMode === "isolated-service";

  if (isProductionCapableMode) {
    if (descriptor.modelLicense === "unapproved") {
      return Object.freeze({
        packageId: descriptor.id,
        status: "rejected",
        decisionTier: 5,
        mode: "rejected",
        justification: `Production-capable integration mode '${descriptor.integrationMode}' cannot be approved with unapproved model license`,
      });
    }

    if (descriptor.modelLicense !== "not-applicable") {
      if (!descriptor.modelArtifact || descriptor.modelArtifact.status !== "approved") {
        return Object.freeze({
          packageId: descriptor.id,
          status: "rejected",
          decisionTier: 5,
          mode: "rejected",
          justification: `Production-capable integration mode '${descriptor.integrationMode}' rejected: exact model/data artifact is unapproved or unresolved`,
        });
      }
    }
  }

  if (descriptor.integrationMode === "direct-library") {
    return Object.freeze({
      packageId: descriptor.id,
      status: "approved",
      decisionTier: 1,
      mode: "direct-library",
      justification: "Pure TS / lightweight wasm library with permissive license fits directly into core",
    });
  }

  if (descriptor.integrationMode === "source-adaptation") {
    return Object.freeze({
      packageId: descriptor.id,
      status: "approved",
      decisionTier: 2,
      mode: "source-adaptation",
      justification: "Stable bounded algorithm adapted into pure deterministic TypeScript with pinned provenance",
    });
  }

  if (descriptor.integrationMode === "isolated-service") {
    return Object.freeze({
      packageId: descriptor.id,
      status: "approved",
      decisionTier: 3,
      mode: "isolated-service",
      justification: "Native runtime / heavy compute / LGPL copyleft strictly isolated across local loopback service boundary",
    });
  }

  if (descriptor.integrationMode === "baseline-donor") {
    return Object.freeze({
      packageId: descriptor.id,
      status: "approved",
      decisionTier: 4,
      mode: "baseline-donor",
      justification: "Reference benchmark comparator for offline evaluation and calibration validation; no runtime model artifact is approved for production.",
    });
  }

  return Object.freeze({
    packageId: descriptor.id,
    status: "rejected",
    decisionTier: 5,
    mode: "rejected",
    justification: "Candidate rejected due to unviable integration profile",
  });
}

export const FORBIDDEN_OBSERVATION_FIELDS = [
  "authority",
  "mastery",
  "calibration",
  "calibrationGrant",
  "durableAuthority",
  "canAffectDurableAssessment",
  "canBecomeMasteryCandidate",
  "certified",
  "validationState",
] as const;

const FORBIDDEN_FIELD_SET = new Set<string>(FORBIDDEN_OBSERVATION_FIELDS);
const FORBIDDEN_NAME_PATTERN = /(authority|mastery|calibration|validationstate|certified)/i;

/**
 * Recursively scans any object or array for forbidden authority/mastery/calibration fields.
 * Fails closed immediately if any forbidden field is detected at any nesting depth.
 */
export function checkForForbiddenFields(val: unknown, path = "payload"): void {
  if (val === null || val === undefined) return;
  if (typeof val === "object") {
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        checkForForbiddenFields(val[i], `${path}[${i}]`);
      }
      return;
    }

    const isBkt = (val as Record<string, unknown>).kind === "bkt-comparator";

    for (const key of Object.keys(val)) {
      // In BKT comparator payloads, priorMastery and posteriorMastery are standard scientific parameters (Corbett & Anderson 1994)
      if (isBkt && (key === "priorMastery" || key === "posteriorMastery")) {
        checkForForbiddenFields((val as Record<string, unknown>)[key], `${path}.${key}`);
        continue;
      }

      const lowerKey = key.toLowerCase();
      if (FORBIDDEN_FIELD_SET.has(key) || FORBIDDEN_NAME_PATTERN.test(lowerKey)) {
        const targetDesc = path.startsWith("options") && !path.includes("payload") ? "options" : "payload";
        throw new Error(
          `createVettedCoreObservation: Forbidden authority/mastery field injected in ${targetDesc}: '${key}'`
        );
      }
      checkForForbiddenFields((val as Record<string, unknown>)[key], `${path}.${key}`);
    }
  }
}

/**
 * Recursively deep freezes an object and all nested properties and arrays,
 * rendering post-validation mutation completely impossible.
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== null && (typeof val === "object" || typeof val === "function") && !Object.isFrozen(val)) {
      deepFreeze(val as object);
    }
  }
  return obj;
}

/**
 * Canonically maps a validated LinguisticAnnotationRawPayload into existing SyntaxDiagnosticPayload.
 */
export function mapLinguisticToSyntaxDiagnostic(
  raw: LinguisticAnnotationRawPayload
): SyntaxDiagnosticPayload {
  const tokens = raw.tokens.map((t) => t.text);
  const lemmas = raw.tokens.map((t) => t.lemma);
  const posTags = raw.tokens.map((t) => t.pos);
  const dependencies = raw.tokens.map((t, idx) => ({
    id: idx,
    head: t.headIndex,
    deprel: t.dep,
  }));

  const detectedErrors: GrammaticalErrorDetail[] = (raw.grammarDiagnostics ?? []).map((d) => {
    let startTokenIndex = 0;
    let endTokenIndex = 0;
    let charAcc = 0;
    for (let i = 0; i < raw.tokens.length; i++) {
      const tokLen = raw.tokens[i].text.length;
      if (charAcc <= d.offset && d.offset < charAcc + tokLen) {
        startTokenIndex = i;
      }
      if (charAcc <= d.offset + d.length && d.offset + d.length <= charAcc + tokLen + 1) {
        endTokenIndex = i;
      }
      charAcc += tokLen + 1;
    }
    if (endTokenIndex < startTokenIndex) endTokenIndex = startTokenIndex;

    const originalText = raw.text.slice(d.offset, d.offset + d.length) || d.message;
    const correctedText = d.replacements?.[0] ?? "";

    let errorCategory: GrammaticalErrorCategory = "OTHER";
    const ruleUpper = (d.ruleId + " " + d.category).toUpperCase();
    if (ruleUpper.includes("TENSE")) errorCategory = "VERB:TENSE";
    else if (ruleUpper.includes("AGREEMENT") || ruleUpper.includes("SVA")) errorCategory = "VERB:SVA";
    else if (ruleUpper.includes("NUM") || ruleUpper.includes("PLURAL")) errorCategory = "NOUN:NUM";
    else if (ruleUpper.includes("ARTICLE") || ruleUpper.includes("DET")) errorCategory = "DET:ART";
    else if (ruleUpper.includes("PREP") || ruleUpper.includes("COLLOCATION")) errorCategory = "PREP:COLL";
    else if (ruleUpper.includes("COPULA")) errorCategory = "MORPH:COPULA";
    else if (ruleUpper.includes("TOPIC") || ruleUpper.includes("SYNTAX")) errorCategory = "SYNTAX:TOPIC";

    return {
      startTokenIndex,
      endTokenIndex,
      originalText,
      correctedText,
      errorCategory,
      confidence: null,
      l1TransferHypothesis: false,
    };
  });

  return {
    kind: "syntax",
    tokens,
    lemmas,
    posTags,
    dependencies,
    detectedErrors,
    syntacticComplexity: {
      tokenCount: tokens.length,
      diagnosticCount: (raw.grammarDiagnostics ?? []).length,
    },
  };
}

export const mapLinguisticToDiagnosticPayload = mapLinguisticToSyntaxDiagnostic;

/**
 * Canonically maps a validated PhonemeAlignmentRawPayload into existing AcousticDiagnosticPayload.
 */
export function mapAlignmentToAcousticDiagnostic(
  raw: PhonemeAlignmentRawPayload
): AcousticDiagnosticPayload {
  const phonemeAlignments: PhonemeAlignmentDetail[] = [];
  let speechDurationMs = 0;

  for (const word of raw.words) {
    speechDurationMs += Math.max(0, word.endMs - word.startMs);
    for (const p of word.phonemes) {
      phonemeAlignments.push({
        expectedPhoneme: p.phone,
        observedPhoneme: p.phone,
        startTimeSec: p.startMs / 1000,
        endTimeSec: p.endMs / 1000,
        durationMs: Math.max(0, p.endMs - p.startMs),
        acousticScore: p.score ?? null,
        confidence: p.score != null ? Math.min(1, Math.max(0, p.score)) : null,
        operation: "match",
      });
    }
  }

  return {
    kind: "acoustic",
    utteranceDurationSec: raw.totalDurationMs / 1000,
    speechDurationSec: speechDurationMs / 1000,
    snrDb: null,
    clippingDetected: false,
    articulationRateSyllablesPerSec: null,
    pairwiseVariabilityIndex: null,
    voiceOnsetLatencyMs: phonemeAlignments[0] ? phonemeAlignments[0].startTimeSec * 1000 : null,
    phonemeAlignments,
    suspectedFinalConsonantDeletions: [],
    epentheticVowelDetected: null,
  };
}

export const mapAlignmentToDiagnosticPayload = mapAlignmentToAcousticDiagnostic;

export type AcceptedVettedPayload =
  | DiagnosticPayload
  | LinguisticAnnotationRawPayload
  | PhonemeAlignmentRawPayload;

/**
 * Runtime discriminated validation for accepted adapter payloads.
 * Whitelists exact top-level keys per kind and validates nested arrays/objects/primitives/numeric ranges.
 */
export function validateAcceptedPayload(payload: unknown): DiagnosticPayload {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("createVettedCoreObservation: payload must be a valid non-null object");
  }

  const p = payload as Record<string, unknown>;
  if (typeof p.kind !== "string" || !p.kind.trim()) {
    throw new Error("createVettedCoreObservation: payload must have a valid non-empty 'kind' discriminator");
  }

  switch (p.kind) {
    case "asr-transcription": {
      const allowedKeys = new Set(["kind", "text", "durationMs", "tokens", "noSpeechProbability", "engine", "occurredAt"]);
      for (const k of Object.keys(p)) {
        if (!allowedKeys.has(k)) {
          throw new Error(`createVettedCoreObservation: Unknown key '${k}' in asr-transcription payload`);
        }
      }
      if (typeof p.text !== "string") {
        throw new Error("createVettedCoreObservation: asr-transcription text must be a string");
      }
      if (typeof p.durationMs !== "number" || !Number.isFinite(p.durationMs) || Number.isNaN(p.durationMs) || p.durationMs < 0) {
        throw new Error("createVettedCoreObservation: asr-transcription durationMs must be a non-negative finite number");
      }
      if (
        typeof p.noSpeechProbability !== "number" ||
        !Number.isFinite(p.noSpeechProbability) ||
        Number.isNaN(p.noSpeechProbability) ||
        p.noSpeechProbability < 0 ||
        p.noSpeechProbability > 1
      ) {
        throw new Error("createVettedCoreObservation: asr-transcription noSpeechProbability must be a finite number in [0, 1]");
      }
      if (typeof p.engine !== "string" || !p.engine.trim()) {
        throw new Error("createVettedCoreObservation: asr-transcription engine must be a non-empty string");
      }
      if (!Array.isArray(p.tokens)) {
        throw new Error("createVettedCoreObservation: asr-transcription tokens must be an array");
      }
      const tokenKeys = new Set(["token", "startMs", "endMs", "confidence"]);
      for (const t of p.tokens) {
        if (typeof t !== "object" || t === null) {
          throw new Error("createVettedCoreObservation: asr-transcription token must be a non-null object");
        }
        for (const tk of Object.keys(t)) {
          if (!tokenKeys.has(tk)) {
            throw new Error(`createVettedCoreObservation: Unknown key '${tk}' in asr token`);
          }
        }
        if (typeof t.token !== "string") {
          throw new Error("createVettedCoreObservation: asr token.token must be a string");
        }
        if (typeof t.startMs !== "number" || !Number.isFinite(t.startMs) || Number.isNaN(t.startMs) || t.startMs < 0) {
          throw new Error("createVettedCoreObservation: asr token.startMs must be a non-negative finite number");
        }
        if (typeof t.endMs !== "number" || !Number.isFinite(t.endMs) || Number.isNaN(t.endMs) || t.endMs < t.startMs) {
          throw new Error("createVettedCoreObservation: asr token.endMs must be a finite number >= startMs");
        }
        if (typeof t.confidence !== "number" || !Number.isFinite(t.confidence) || Number.isNaN(t.confidence) || t.confidence < 0 || t.confidence > 1) {
          throw new Error("createVettedCoreObservation: asr token.confidence must be a finite number in [0, 1]");
        }
      }
      return p as unknown as DiagnosticPayload;
    }

    case "vad-speech": {
      const allowedKeys = new Set(["kind", "isSpeech", "speechProbability", "intervals", "totalDurationMs", "speechDurationMs", "engine", "occurredAt"]);
      for (const k of Object.keys(p)) {
        if (!allowedKeys.has(k)) {
          throw new Error(`createVettedCoreObservation: Unknown key '${k}' in vad-speech payload`);
        }
      }
      if (typeof p.isSpeech !== "boolean") {
        throw new Error("createVettedCoreObservation: vad-speech isSpeech must be a boolean");
      }
      if (
        typeof p.speechProbability !== "number" ||
        !Number.isFinite(p.speechProbability) ||
        Number.isNaN(p.speechProbability) ||
        p.speechProbability < 0 ||
        p.speechProbability > 1
      ) {
        throw new Error("createVettedCoreObservation: vad-speech speechProbability must be a finite number in [0, 1]");
      }
      if (typeof p.totalDurationMs !== "number" || !Number.isFinite(p.totalDurationMs) || Number.isNaN(p.totalDurationMs) || p.totalDurationMs < 0) {
        throw new Error("createVettedCoreObservation: vad-speech totalDurationMs must be a non-negative finite number");
      }
      if (
        typeof p.speechDurationMs !== "number" ||
        !Number.isFinite(p.speechDurationMs) ||
        Number.isNaN(p.speechDurationMs) ||
        p.speechDurationMs < 0 ||
        p.speechDurationMs > p.totalDurationMs
      ) {
        throw new Error("createVettedCoreObservation: vad-speech speechDurationMs must be a finite number between 0 and totalDurationMs");
      }
      if (typeof p.engine !== "string" || !p.engine.trim()) {
        throw new Error("createVettedCoreObservation: vad-speech engine must be a non-empty string");
      }
      if (!Array.isArray(p.intervals)) {
        throw new Error("createVettedCoreObservation: vad-speech intervals must be an array");
      }
      const intervalKeys = new Set(["startMs", "endMs"]);
      for (const int of p.intervals) {
        if (typeof int !== "object" || int === null) {
          throw new Error("createVettedCoreObservation: vad-speech interval must be a non-null object");
        }
        for (const ik of Object.keys(int)) {
          if (!intervalKeys.has(ik)) {
            throw new Error(`createVettedCoreObservation: Unknown key '${ik}' in vad interval`);
          }
        }
        if (typeof int.startMs !== "number" || !Number.isFinite(int.startMs) || Number.isNaN(int.startMs) || int.startMs < 0) {
          throw new Error("createVettedCoreObservation: vad interval.startMs must be a non-negative finite number");
        }
        if (typeof int.endMs !== "number" || !Number.isFinite(int.endMs) || Number.isNaN(int.endMs) || int.endMs < int.startMs) {
          throw new Error("createVettedCoreObservation: vad interval.endMs must be a finite number >= startMs");
        }
      }
      return p as unknown as DiagnosticPayload;
    }

    case "bkt-comparator": {
      const allowedKeys = new Set([
        "kind", "constructId", "priorMastery", "posteriorMastery",
        "pNextState", "predictedCorrectProbability", "correct",
        "parameters", "engine", "occurredAt"
      ]);
      for (const k of Object.keys(p)) {
        if (!allowedKeys.has(k)) {
          throw new Error(`createVettedCoreObservation: Unknown key '${k}' in bkt-comparator payload`);
        }
      }
      if (typeof p.constructId !== "string" || !p.constructId.trim()) {
        throw new Error("createVettedCoreObservation: bkt-comparator constructId must be a non-empty string");
      }
      for (const numKey of ["priorMastery", "posteriorMastery", "pNextState", "predictedCorrectProbability"] as const) {
        const val = p[numKey];
        if (typeof val !== "number" || !Number.isFinite(val) || Number.isNaN(val) || val < 0 || val > 1) {
          throw new Error(`createVettedCoreObservation: bkt-comparator ${numKey} must be a finite number in [0, 1]`);
        }
      }
      if (typeof p.correct !== "boolean") {
        throw new Error("createVettedCoreObservation: bkt-comparator correct must be a boolean");
      }
      if (typeof p.engine !== "string" || !p.engine.trim()) {
        throw new Error("createVettedCoreObservation: bkt-comparator engine must be a non-empty string");
      }
      if (typeof p.parameters !== "object" || p.parameters === null) {
        throw new Error("createVettedCoreObservation: bkt-comparator parameters must be an object");
      }
      const paramKeys = new Set(["pInit", "pTransit", "pGuess", "pSlip", "pForget"]);
      const params = p.parameters as Record<string, unknown>;
      for (const pk of Object.keys(params)) {
        if (!paramKeys.has(pk)) {
          throw new Error(`createVettedCoreObservation: Unknown key '${pk}' in bkt parameters`);
        }
      }
      for (const requiredParam of ["pInit", "pTransit", "pGuess", "pSlip"] as const) {
        const val = params[requiredParam];
        if (typeof val !== "number" || !Number.isFinite(val) || Number.isNaN(val) || val < 0 || val > 1) {
          throw new Error(`createVettedCoreObservation: bkt parameter ${requiredParam} must be a finite number in [0, 1]`);
        }
      }
      if (params.pForget !== undefined) {
        const val = params.pForget;
        if (typeof val !== "number" || !Number.isFinite(val) || Number.isNaN(val) || val < 0 || val > 1) {
          throw new Error("createVettedCoreObservation: bkt parameter pForget must be a finite number in [0, 1]");
        }
      }
      return p as unknown as DiagnosticPayload;
    }

    case "linguistic-annotation": {
      const allowedKeys = new Set(["kind", "text", "tokens", "grammarDiagnostics", "engine", "occurredAt"]);
      for (const k of Object.keys(p)) {
        if (!allowedKeys.has(k)) {
          throw new Error(`createVettedCoreObservation: Unknown key '${k}' in linguistic-annotation payload`);
        }
      }
      if (typeof p.text !== "string") {
        throw new Error("createVettedCoreObservation: linguistic-annotation text must be a string");
      }
      if (typeof p.engine !== "string" || !p.engine.trim()) {
        throw new Error("createVettedCoreObservation: linguistic-annotation engine must be a non-empty string");
      }
      if (!Array.isArray(p.tokens)) {
        throw new Error("createVettedCoreObservation: linguistic-annotation tokens must be an array");
      }
      const tokenKeys = new Set(["text", "lemma", "pos", "tag", "dep", "headIndex"]);
      for (const tok of p.tokens) {
        if (typeof tok !== "object" || tok === null) {
          throw new Error("createVettedCoreObservation: linguistic token must be a non-null object");
        }
        for (const tk of Object.keys(tok)) {
          if (!tokenKeys.has(tk)) {
            throw new Error(`createVettedCoreObservation: Unknown key '${tk}' in linguistic token`);
          }
        }
        for (const strKey of ["text", "lemma", "pos", "tag", "dep"] as const) {
          if (typeof tok[strKey] !== "string") {
            throw new Error(`createVettedCoreObservation: linguistic token.${strKey} must be a string`);
          }
        }
        if (typeof tok.headIndex !== "number" || !Number.isFinite(tok.headIndex) || Number.isNaN(tok.headIndex) || tok.headIndex < 0) {
          throw new Error("createVettedCoreObservation: linguistic token.headIndex must be a non-negative finite integer");
        }
      }
      if (p.grammarDiagnostics !== undefined) {
        if (!Array.isArray(p.grammarDiagnostics)) {
          throw new Error("createVettedCoreObservation: linguistic grammarDiagnostics must be an array");
        }
        const diagKeys = new Set(["ruleId", "message", "offset", "length", "replacements", "category"]);
        for (const d of p.grammarDiagnostics) {
          if (typeof d !== "object" || d === null) {
            throw new Error("createVettedCoreObservation: grammar diagnostic must be a non-null object");
          }
          for (const dk of Object.keys(d)) {
            if (!diagKeys.has(dk)) {
              throw new Error(`createVettedCoreObservation: Unknown key '${dk}' in grammar diagnostic`);
            }
          }
          for (const strKey of ["ruleId", "message", "category"] as const) {
            if (typeof d[strKey] !== "string") {
              throw new Error(`createVettedCoreObservation: grammar diagnostic.${strKey} must be a string`);
            }
          }
          if (typeof d.offset !== "number" || !Number.isFinite(d.offset) || Number.isNaN(d.offset) || d.offset < 0) {
            throw new Error("createVettedCoreObservation: grammar diagnostic.offset must be a non-negative finite number");
          }
          if (typeof d.length !== "number" || !Number.isFinite(d.length) || Number.isNaN(d.length) || d.length < 0) {
            throw new Error("createVettedCoreObservation: grammar diagnostic.length must be a non-negative finite number");
          }
          if (!Array.isArray(d.replacements)) {
            throw new Error("createVettedCoreObservation: grammar diagnostic.replacements must be an array");
          }
        }
      }
      return mapLinguisticToSyntaxDiagnostic(p as unknown as LinguisticAnnotationRawPayload);
    }

    case "phoneme-alignment": {
      const allowedKeys = new Set(["kind", "transcript", "words", "totalDurationMs", "engine", "occurredAt"]);
      for (const k of Object.keys(p)) {
        if (!allowedKeys.has(k)) {
          throw new Error(`createVettedCoreObservation: Unknown key '${k}' in phoneme-alignment payload`);
        }
      }
      if (typeof p.transcript !== "string") {
        throw new Error("createVettedCoreObservation: phoneme-alignment transcript must be a string");
      }
      if (typeof p.totalDurationMs !== "number" || !Number.isFinite(p.totalDurationMs) || Number.isNaN(p.totalDurationMs) || p.totalDurationMs < 0) {
        throw new Error("createVettedCoreObservation: phoneme-alignment totalDurationMs must be a non-negative finite number");
      }
      if (typeof p.engine !== "string" || !p.engine.trim()) {
        throw new Error("createVettedCoreObservation: phoneme-alignment engine must be a non-empty string");
      }
      if (!Array.isArray(p.words)) {
        throw new Error("createVettedCoreObservation: phoneme-alignment words must be an array");
      }
      const wordKeys = new Set(["word", "startMs", "endMs", "phonemes"]);
      const phoneKeys = new Set(["phone", "startMs", "endMs", "score"]);
      for (const w of p.words) {
        if (typeof w !== "object" || w === null) {
          throw new Error("createVettedCoreObservation: alignment word must be a non-null object");
        }
        for (const wk of Object.keys(w)) {
          if (!wordKeys.has(wk)) {
            throw new Error(`createVettedCoreObservation: Unknown key '${wk}' in alignment word`);
          }
        }
        if (typeof w.word !== "string") {
          throw new Error("createVettedCoreObservation: alignment word.word must be a string");
        }
        if (typeof w.startMs !== "number" || !Number.isFinite(w.startMs) || Number.isNaN(w.startMs) || w.startMs < 0) {
          throw new Error("createVettedCoreObservation: alignment word.startMs must be a non-negative finite number");
        }
        if (typeof w.endMs !== "number" || !Number.isFinite(w.endMs) || Number.isNaN(w.endMs) || w.endMs < w.startMs) {
          throw new Error("createVettedCoreObservation: alignment word.endMs must be a finite number >= startMs");
        }
        if (!Array.isArray(w.phonemes)) {
          throw new Error("createVettedCoreObservation: alignment word.phonemes must be an array");
        }
        for (const ph of w.phonemes) {
          if (typeof ph !== "object" || ph === null) {
            throw new Error("createVettedCoreObservation: alignment phoneme must be a non-null object");
          }
          for (const pk of Object.keys(ph)) {
            if (!phoneKeys.has(pk)) {
              throw new Error(`createVettedCoreObservation: Unknown key '${pk}' in alignment phoneme`);
            }
          }
          if (typeof ph.phone !== "string") {
            throw new Error("createVettedCoreObservation: alignment phoneme.phone must be a string");
          }
          if (typeof ph.startMs !== "number" || !Number.isFinite(ph.startMs) || Number.isNaN(ph.startMs) || ph.startMs < 0) {
            throw new Error("createVettedCoreObservation: alignment phoneme.startMs must be a non-negative finite number");
          }
          if (typeof ph.endMs !== "number" || !Number.isFinite(ph.endMs) || Number.isNaN(ph.endMs) || ph.endMs < ph.startMs) {
            throw new Error("createVettedCoreObservation: alignment phoneme.endMs must be a finite number >= startMs");
          }
          if (ph.score !== undefined) {
            if (typeof ph.score !== "number" || !Number.isFinite(ph.score) || Number.isNaN(ph.score) || ph.score < 0 || ph.score > 1) {
              throw new Error("createVettedCoreObservation: alignment phoneme.score must be a finite number in [0, 1]");
            }
          }
        }
      }
      return mapAlignmentToAcousticDiagnostic(p as unknown as PhonemeAlignmentRawPayload);
    }

    case "syntax":
    case "acoustic":
    case "lexical":
    case "comprehension":
    case "controlled-response":
    case "discourse-pragmatic": {
      return p as unknown as DiagnosticPayload;
    }

    default:
      throw new Error(`createVettedCoreObservation: Unsupported payload kind '${String(p.kind)}'`);
  }
}

const ALLOWED_OPTIONS_KEYS = new Set([
  "observationId",
  "targetId",
  "activity",
  "payload",
  "confidence",
  "evaluator",
  "evaluatorKind",
  "construct",
  "populationTags",
  "occurredAt",
  "contextId",
  "modelFingerprint",
]);

export type CreateVettedCoreObservationOptions<TPayload extends AcceptedVettedPayload = DiagnosticPayload> = {
  readonly observationId?: string;
  readonly targetId: string;
  readonly activity: CommunicationActivity;
  readonly payload: TPayload;
  readonly confidence?: number | null;
  readonly evaluator: string;
  readonly evaluatorKind?: "model" | "deterministic" | "hybrid";
  readonly construct: string;
  readonly populationTags?: readonly string[];
  readonly occurredAt: string;
  readonly contextId?: string | null;
  readonly modelFingerprint?: string;
};

/**
 * Nếp-owned constructor that safely wraps validated adapter payloads into canonical CoreObservation
 * envelopes with explicit unvalidated shadow calibration and authority: "none".
 *
 * Fails closed immediately if:
 * - Unknown top-level option or payload keys are passed;
 * - Forbidden authority/mastery/calibration fields are injected at any depth;
 * - Activity is not in canonical COMMUNICATION_ACTIVITIES;
 * - Confidence is NaN or out-of-range (<0 or >1);
 * - Payload structure/values/ranges fail discriminated validation;
 * - OccurredAt is missing or not a valid ISO timestamp.
 *
 * The returned CoreObservation is deeply frozen to guarantee complete post-construction immutability.
 */
export function createVettedCoreObservation<TPayload extends AcceptedVettedPayload = DiagnosticPayload>(
  options: CreateVettedCoreObservationOptions<TPayload>
): CoreObservation<DiagnosticPayload> {
  if (typeof options !== "object" || options === null) {
    throw new Error("createVettedCoreObservation: options must be a valid non-null object");
  }

  const optionsRecord = options as Record<string, unknown>;

  // 1. Fail-closed anti-injection check: scan options and payload recursively for forbidden authority/mastery fields FIRST
  checkForForbiddenFields(optionsRecord, "options");
  checkForForbiddenFields(options.payload, "payload");

  // 2. Strict options validation: no unknown top-level options
  for (const optKey of Object.keys(optionsRecord)) {
    if (!ALLOWED_OPTIONS_KEYS.has(optKey)) {
      throw new Error(`createVettedCoreObservation: Unknown top-level option: '${optKey}'`);
    }
  }

  // 3. Strict timestamp validation (No ambient clock)
  if (
    !options.occurredAt ||
    typeof options.occurredAt !== "string" ||
    Number.isNaN(Date.parse(options.occurredAt)) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(options.occurredAt)
  ) {
    throw new Error("createVettedCoreObservation: Valid occurredAt ISO timestamp string is required");
  }

  // 4. Strict string fields validation
  if (!options.targetId || typeof options.targetId !== "string" || !options.targetId.trim()) {
    throw new Error("createVettedCoreObservation: targetId must be a non-empty string");
  }
  if (!options.evaluator || typeof options.evaluator !== "string" || !options.evaluator.trim()) {
    throw new Error("createVettedCoreObservation: evaluator must be a non-empty string");
  }
  if (!options.construct || typeof options.construct !== "string" || !options.construct.trim()) {
    throw new Error("createVettedCoreObservation: construct must be a non-empty string");
  }

  // 5. Validate runtime activity against canonical communication activities
  if (!COMMUNICATION_ACTIVITIES.includes(options.activity)) {
    throw new Error(
      `createVettedCoreObservation: activity '${String(options.activity)}' is not a valid canonical CommunicationActivity`
    );
  }

  // 6. Strict confidence range validation
  if (options.confidence !== undefined && options.confidence !== null) {
    if (
      typeof options.confidence !== "number" ||
      Number.isNaN(options.confidence) ||
      !Number.isFinite(options.confidence) ||
      options.confidence < 0 ||
      options.confidence > 1
    ) {
      throw new Error("createVettedCoreObservation: confidence must be a finite number between 0 and 1 or null");
    }
  }

  // 7. Discriminated payload validation and canonical diagnostic mapping
  const canonicalDiagnosticPayload = validateAcceptedPayload(options.payload);

  // 8. Construct canonical CoreObservation envelope with explicit unvalidated shadow calibration and authority: "none"
  const observationId =
    options.observationId ??
    `obs_${options.evaluator.replace(/[^a-zA-Z0-9-]/g, "_")}_${options.targetId}_${Date.parse(options.occurredAt)}`;

  // Deep clone payload and options state before freezing to detach any caller references
  const clonedPayload = JSON.parse(JSON.stringify(canonicalDiagnosticPayload)) as DiagnosticPayload;
  const populationTags = options.populationTags ? [...options.populationTags] : [];

  const observation: CoreObservation<DiagnosticPayload> = {
    observationId,
    targetId: options.targetId,
    activity: options.activity,
    payload: clonedPayload,
    confidence: normalizeObservationConfidence(options.confidence),
    authority: "none",
    calibration: {
      validationState: "unvalidated",
      decision: "shadow",
      benchmarkId: null,
      modelFingerprint: options.modelFingerprint ?? `${options.evaluator}:uncalibrated`,
      scope: {
        activity: options.activity,
        construct: options.construct,
        requiredPopulationTags: [...populationTags],
      },
      metrics: {
        sampleSize: 0,
      },
    },
    provenance: {
      evaluator: options.evaluator,
      evaluatorKind: options.evaluatorKind ?? "model",
    },
    context: {
      populationTags: [...populationTags],
      construct: options.construct,
    },
    contextId: options.contextId ?? null,
    createdAt: options.occurredAt,
  };

  return deepFreeze(observation);
}

