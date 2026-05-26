"""
Demucs source separation service.
Separates audio into stems: vocals, drums, bass, other.
We use the 'htdemucs' model — highest quality, ~4x real-time on CPU.
"""

import asyncio
from pathlib import Path


async def separate_vocals(input_path: Path, output_dir: Path) -> Path:
    """
    Run Demucs in a subprocess to avoid blocking the event loop.
    Returns path to the isolated vocals WAV file.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_demucs, input_path, output_dir)


def _run_demucs(input_path: Path, output_dir: Path) -> Path:
    import demucs.separate

    # Run htdemucs — 4-stem model
    demucs.separate.main([
        "--two-stems", "vocals",        # only separate vocals vs rest
        "--out",       str(output_dir),
        "--name",      "htdemucs",
        "--mp3",                        # save as mp3 for speed
        str(input_path),
    ])

    # Demucs outputs to: output_dir/htdemucs/<input_stem>/vocals.mp3
    vocals_path = (
        output_dir
        / "htdemucs"
        / input_path.stem
        / "vocals.mp3"
    )

    if not vocals_path.exists():
        # Fallback: use wav output
        vocals_path = vocals_path.with_suffix(".wav")

    if not vocals_path.exists():
        raise FileNotFoundError(f"Demucs vocals output not found at {vocals_path}")

    return vocals_path
