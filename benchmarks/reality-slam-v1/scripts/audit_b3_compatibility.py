from __future__ import annotations

import argparse
import json
from pathlib import Path

LEARNER_STATE_CONTRACT = {
    "contractId": "nep.learner-evidence-state.v1",
    "frontierMergeCommit": "ef42f2cf96f9aa079505ad73c83c0555a470bfab",
    "evidenceIngress": "in-process-branded-core-evidence-for-routing",
    "requiredSemantics": (
        "canonical-ontology-target",
        "evidence-role-and-activity",
        "response-modality-contract",
        "support-and-reveal",
        "transfer-context-semantics",
        "validated-reference-evidence-ingress",
    ),
}

TRACK_LANGUAGE = {
    "en_es": ("English", True),
    "es_en": ("Spanish", False),
    "fr_en": ("French", False),
}

# Frozen from the independently reviewed and merged #137 contract. The research harness
# deliberately carries a small contract descriptor instead of importing or reading runtime
# TypeScript modules. If #137 changes, this descriptor must be reviewed/versioned explicitly.
BLOCKING_SEMANTIC_DIMENSIONS = (
    {
        "id": "canonical-ontology-target",
        "slamGap": "SLAM token rows do not identify a canonical Nếp ontology target selected by a validated task spec.",
    },
    {
        "id": "evidence-role-and-activity",
        "slamGap": "Token correctness plus prompt format does not establish a canonical CoreEvidenceRole and communication activity.",
    },
    {
        "id": "response-modality-contract",
        "slamGap": "The release does not provide the learner response needed to prove the response modality/evidence semantics expected by Nếp.",
    },
    {
        "id": "support-and-reveal",
        "slamGap": "SLAM does not record Nếp supportLevel or revealUsed semantics; defaulting them would manufacture evidence strength.",
    },
    {
        "id": "transfer-context-semantics",
        "slamGap": "Session/prompt metadata is not a validated Nếp same/near/far-transfer task contract with changed-context evidence.",
    },
    {
        "id": "validated-reference-evidence-ingress",
        "slamGap": "Public corpus rows are detached data and cannot satisfy the in-process CoreEvidenceForRouting branding/reference-validation boundary by themselves.",
    },
)


def frozen_learner_contract() -> dict[str, object]:
    required = tuple(LEARNER_STATE_CONTRACT["requiredSemantics"])
    blockers = tuple(item["id"] for item in BLOCKING_SEMANTIC_DIMENSIONS)
    if required != blockers:
        raise RuntimeError("B3 contract descriptor drift: required semantics and compatibility blockers differ")
    return {
        "contractId": LEARNER_STATE_CONTRACT["contractId"],
        "frontierMergeCommit": LEARNER_STATE_CONTRACT["frontierMergeCommit"],
        "evidenceIngress": LEARNER_STATE_CONTRACT["evidenceIngress"],
        "requiredSemantics": list(required),
    }


def audit_track(track: str, total_rows: int | None = None) -> dict[str, object]:
    if track not in TRACK_LANGUAGE:
        raise ValueError(f"unsupported track {track!r}")
    if total_rows is not None and total_rows < 0:
        raise ValueError("total_rows must be non-negative when supplied")

    contract = frozen_learner_contract()
    target_language, language_compatible = TRACK_LANGUAGE[track]

    # This is a schema/contract compatibility decision. It is intentionally made without
    # downloading gated corpus bytes because the released schema itself cannot establish
    # the evidence semantics required by #137. `mappingCoverage` is therefore a structural
    # upper bound, not a measured row-wise corpus statistic.
    return {
        "track": track,
        "targetLanguage": target_language,
        "ontologyLanguageCompatible": language_compatible,
        "learnerStateContract": contract,
        "auditMode": "schema-level-no-corpus-bytes",
        "totalRowsAudited": total_rows,
        "rowLevelMappingAttempted": False,
        "mappedRows": 0,
        "unmappedRows": total_rows,
        "mappingCoverage": 0.0,
        "mappingCoverageBasis": "schema-level zero upper bound; not a measured row-wise fraction",
        "blockingSemanticDimensions": [dict(item) for item in BLOCKING_SEMANTIC_DIMENSIONS],
        "eligibleForB3": False,
        "decision": "b3-not-applicable-on-slam",
        "scientificDisposition": "not-applicable",
        "scoringExecuted": False,
        "activateIssue": 143,
        "rationale": (
            "The merged Nếp learner-state contract requires validated/branded evidence with explicit "
            "ontology, role/activity/modality, support/reveal, context/transfer, and provenance semantics. "
            "Original SLAM rows cannot establish those semantics without guessed defaults. Language "
            "compatibility alone is insufficient, so B3 must stop rather than fabricate an adapter."
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Emit the post-#140 SLAM -> Nếp compatibility audit")
    parser.add_argument("--track", choices=sorted(TRACK_LANGUAGE), required=True)
    parser.add_argument("--total-rows", type=int)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    result = audit_track(args.track, args.total_rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
