"""
Key detection using Krumhansl-Schmuckler tonal profiles.
More accurate than just counting pitch classes because it weights
musically important notes (tonic, dominant, mediant) more heavily.
"""

from typing import List, Dict, Any


# Krumhansl-Schmuckler major and minor profiles
MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]

MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F",
              "F#", "G", "G#", "A", "A#", "B"]


def detect_key_from_midi(midi_notes: List[int]) -> Dict[str, Any]:
    """
    Detect musical key and mode from a list of MIDI note numbers.
    Returns: { key, mode, confidence, scores }
    """
    if not midi_notes:
        return {"key": "C", "mode": "major", "confidence": 0.0}

    # Build pitch class distribution
    pitch_counts = [0.0] * 12
    for m in midi_notes:
        pitch_counts[m % 12] += 1

    # Normalise
    total = sum(pitch_counts) or 1.0
    pitch_dist = [c / total for c in pitch_counts]

    best_key    = "C"
    best_mode   = "major"
    best_score  = -float("inf")
    all_scores  = []

    for root in range(12):
        # Rotate profile to match root
        major_score = _correlation(pitch_dist, _rotate(MAJOR_PROFILE, root))
        minor_score = _correlation(pitch_dist, _rotate(MINOR_PROFILE, root))

        all_scores.append({"key": NOTE_NAMES[root], "mode": "major", "score": major_score})
        all_scores.append({"key": NOTE_NAMES[root], "mode": "minor", "score": minor_score})

        if major_score > best_score:
            best_score, best_key, best_mode = major_score, NOTE_NAMES[root], "major"
        if minor_score > best_score:
            best_score, best_key, best_mode = minor_score, NOTE_NAMES[root], "minor"

    # Confidence: how far ahead of second-best (0–1)
    sorted_scores = sorted(all_scores, key=lambda s: s["score"], reverse=True)
    gap        = sorted_scores[0]["score"] - sorted_scores[1]["score"]
    confidence = min(1.0, max(0.0, gap * 5))  # scale to 0–1

    return {
        "key":        best_key,
        "mode":       best_mode,
        "confidence": round(confidence, 3),
    }


def _rotate(profile: List[float], n: int) -> List[float]:
    return profile[n:] + profile[:n]


def _correlation(dist: List[float], profile: List[float]) -> float:
    """Pearson correlation coefficient between pitch distribution and tonal profile."""
    n     = len(dist)
    mean_d = sum(dist)    / n
    mean_p = sum(profile) / n

    numerator   = sum((dist[i] - mean_d) * (profile[i] - mean_p) for i in range(n))
    denom_d     = sum((dist[i] - mean_d) ** 2 for i in range(n)) ** 0.5
    denom_p     = sum((profile[i] - mean_p) ** 2 for i in range(n)) ** 0.5

    if denom_d * denom_p == 0:
        return 0.0
    return numerator / (denom_d * denom_p)
