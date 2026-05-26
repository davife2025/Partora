"""
Basic Pitch (Spotify) — converts audio to MIDI notes with onset/offset/pitch.
Returns a list of note events ready for Kimi K2.6 harmonisation.
"""

import asyncio
from pathlib import Path
from typing import List, Dict, Any


async def extract_midi_and_key(audio_path: Path, output_dir: Path) -> List[Dict[str, Any]]:
    """
    Run Basic Pitch in an executor (CPU-bound).
    Returns list of: { midi, note_name, onset, offset, duration, velocity, frequency }
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_basic_pitch, audio_path, output_dir)


def _run_basic_pitch(audio_path: Path, output_dir: Path) -> List[Dict[str, Any]]:
    from basic_pitch.inference import predict
    from basic_pitch            import ICASSP_2022_MODEL_PATH

    # Run prediction
    model_output, midi_data, note_events = predict(
        str(audio_path),
        ICASSP_2022_MODEL_PATH,
        onset_threshold=0.5,
        frame_threshold=0.3,
        minimum_note_length=0.05,  # 50ms minimum
        minimum_frequency=60.0,    # ~B1 — bass range bottom
        maximum_frequency=1100.0,  # ~C6 — soprano top
        melodia_trick=True,        # better melody extraction
    )

    notes = []
    for note in note_events:
        pitch     = int(note[2])
        onset     = float(note[0])
        offset    = float(note[1])
        velocity  = int(note[3]) if len(note) > 3 else 80

        notes.append({
            "midi":      pitch,
            "note_name": _midi_to_note_name(pitch),
            "onset":     round(onset, 4),
            "offset":    round(offset, 4),
            "duration":  round(offset - onset, 4),
            "velocity":  velocity,
            "frequency": round(440.0 * (2 ** ((pitch - 69) / 12)), 2),
        })

    # Sort by onset time
    notes.sort(key=lambda n: n["onset"])
    return notes


def _midi_to_note_name(midi: int) -> str:
    note_names = ["C", "C#", "D", "D#", "E", "F",
                  "F#", "G", "G#", "A", "A#", "B"]
    octave = (midi // 12) - 1
    name   = note_names[midi % 12]
    return f"{name}{octave}"
