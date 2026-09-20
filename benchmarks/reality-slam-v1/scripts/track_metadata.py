from __future__ import annotations

TRACKS = {
    "en_es": {
        "targetLanguage": "English",
        "knownLanguage": "Spanish",
        "publishedTestAuc": 0.774,
        "publishedTestF1": 0.190,
    },
    "es_en": {
        "targetLanguage": "Spanish",
        "knownLanguage": "English",
        "publishedTestAuc": 0.746,
        "publishedTestF1": 0.175,
    },
    "fr_en": {
        "targetLanguage": "French",
        "knownLanguage": "English",
        "publishedTestAuc": 0.771,
        "publishedTestF1": 0.281,
    },
}


def track_metadata(track: str) -> dict[str, object]:
    try:
        return dict(TRACKS[track])
    except KeyError as exc:
        raise ValueError(f"unsupported SLAM track {track!r}") from exc
