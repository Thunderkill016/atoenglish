from __future__ import annotations

import argparse


def main() -> int:
    parser = argparse.ArgumentParser(
        description="CORE-REALITY-001 orchestration boundary: B0/B1/B2 are unblocked; B3 remains blocked"
    )
    parser.add_argument(
        "--acknowledge-data-terms",
        action="store_true",
        help="Only records that the human operator has completed the required legitimate Dataverse terms/Guestbook flow; this flag does not bypass access controls.",
    )
    args = parser.parse_args()
    if not args.acknowledge_data_terms:
        raise SystemExit(
            "No benchmark data execution: legitimate Dataverse terms/Guestbook acceptance has not been acknowledged. "
            "Run the individual metadata/parser tests instead; never bypass the access gate."
        )
    raise SystemExit(
        "Terms acknowledged, but orchestration intentionally remains explicit. Run validate_artifacts.py, "
        "then B0 / run_r0_b1_oracle.py / B2 with frozen track inputs. B3 is still blocked."
    )


if __name__ == "__main__":
    raise SystemExit(main())
