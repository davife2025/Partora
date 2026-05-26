"""
Partora Audio Processor Microservice
Handles: Demucs source separation + Basic Pitch MIDI extraction + key detection
Called by: apps/api (Node.js) over HTTP
"""

import os
import tempfile
import json
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

from .demucs_service  import separate_vocals
from .pitch_service   import extract_midi_and_key
from .key_service     import detect_key_from_midi

app = FastAPI(
    title="Partora Audio Processor",
    version="0.1.0",
    docs_url="/docs" if os.getenv("ENV") != "production" else None,
)

# ── Health ─────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "audio-processor"}


# ── Main analysis endpoint ─────────────────────────────────────────
@app.post("/analyse")
async def analyse_audio(file: UploadFile = File(...)):
    """
    Full pipeline:
    1. Receive audio file
    2. Demucs — separate vocals from instruments
    3. Basic Pitch — convert vocal stem to MIDI notes
    4. Key detection from MIDI
    5. Return: key, mode, midi_notes, duration
    """
    allowed = {"audio/mpeg", "audio/mp3", "audio/wav", "audio/webm",
               "audio/ogg", "audio/aac", "audio/flac", "audio/x-wav"}

    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported audio type: {file.content_type}")

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        # Save upload
        input_path = tmp_path / f"input{Path(file.filename or 'audio.mp3').suffix}"
        content = await file.read()
        input_path.write_bytes(content)

        try:
            # Step 1: Demucs — isolate vocals
            vocals_path = await separate_vocals(input_path, tmp_path)

            # Step 2: Basic Pitch — MIDI extraction
            midi_notes = await extract_midi_and_key(vocals_path, tmp_path)

            # Step 3: Key detection
            key_result = detect_key_from_midi([n["midi"] for n in midi_notes])

            return JSONResponse({
                "success":    True,
                "key":        key_result["key"],
                "mode":       key_result["mode"],
                "confidence": key_result["confidence"],
                "midi_notes": midi_notes[:200],   # cap for API response size
                "note_count": len(midi_notes),
                "duration":   midi_notes[-1]["offset"] if midi_notes else 0,
            })

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── Vocals-only endpoint (used by Mode 4 mic recording) ───────────
@app.post("/isolate")
async def isolate_vocals(file: UploadFile = File(...)):
    """Strip background, return clean vocal audio as bytes."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        input_path = tmp_path / "input.wav"
        input_path.write_bytes(await file.read())

        vocals_path = await separate_vocals(input_path, tmp_path)
        return JSONResponse({
            "success":    True,
            "vocals_b64": __import__("base64").b64encode(vocals_path.read_bytes()).decode(),
        })


if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=int(os.getenv("AUDIO_PROCESSOR_PORT", "5001")),
        reload=os.getenv("ENV") == "development",
    )
