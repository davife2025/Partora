# Partora Audio Processor

Python microservice for audio analysis.

## What it does

1. **Demucs (Meta)** — separates uploaded audio into vocal + instrumental stems using the `htdemucs` model
2. **Basic Pitch (Spotify)** — converts the vocal stem to MIDI notes with onset/offset/velocity
3. **Key detection** — Krumhansl-Schmuckler tonal profile analysis to detect key and mode

## Endpoints

| Method | Path       | Description                              |
|--------|------------|------------------------------------------|
| GET    | /health    | Health check                             |
| POST   | /analyse   | Full pipeline: upload → MIDI + key       |
| POST   | /isolate   | Vocals-only isolation (used for mic mode)|

## Running locally

```bash
pip install -e .
python -m src.main
# Runs on http://localhost:5001
```

## Environment variables

| Variable               | Default | Description              |
|------------------------|---------|--------------------------|
| AUDIO_PROCESSOR_PORT   | 5001    | Port to listen on        |
| ENV                    | development | Environment          |
