# Partora

> AI-powered voice parts & tonic solfa for singers and musicians.

## Quick Start

```bash
# 1. Clone & install
git clone <your-repo>
cd partora
npm install

# 2. Set up environment
cp .env.example .env
# Fill in all values in .env

# 3. Run Supabase migrations (in order)
# Go to your Supabase dashboard → SQL Editor and run:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_storage_buckets.sql
# supabase/migrations/003_auth_helpers.sql
# supabase/migrations/004_audio_analysis_columns.sql
# supabase/migrations/005_search_indexes.sql
# supabase/migrations/006_record_mode_columns.sql
# supabase/migrations/007_coach_tables.sql
# supabase/migrations/008_sharing.sql
# supabase/migrations/009_analytics.sql

# 4. Start Python audio processor (separate terminal)
cd services/audio-processor
pip install -e .
python -m src.main
# Runs on http://localhost:5001

# 5. Start dev servers
cd ../..
npm run dev
# Web: http://localhost:3000
# API: http://localhost:4000
```

## Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API |
| `ELEVENLABS_API_KEY` | elevenlabs.io → Profile → API Keys |
| `HUGGINGFACE_API_KEY` | huggingface.co → Settings → Access Tokens |
| `AUDD_API_TOKEN` | audd.io → Dashboard |
| `API_SECRET` | Any random 32+ char string |

## Deployment

### Web (Vercel)
1. Import repo to Vercel
2. Set root directory to `apps/web`
3. Add all `NEXT_PUBLIC_*` environment variables
4. Deploy

### API + Audio Processor (Render)
1. Connect repo to Render
2. Use `render.yaml` — it creates all 3 services automatically:
   - `partora-api` (Node.js)
   - `partora-audio-processor` (Docker)
   - `partora-redis` (Redis)
3. Add all environment variables in Render dashboard

### ElevenLabs Voice IDs
Replace the default voice IDs in your `.env` with your preferred voices:
- `ELEVENLABS_VOICE_SOPRANO` — a female voice for soprano
- `ELEVENLABS_VOICE_ALTO`    — a female voice for alto  
- `ELEVENLABS_VOICE_TENOR`   — a male voice for tenor
- `ELEVENLABS_VOICE_BASS`    — a male voice for bass

## Sessions Built

| Session | Description |
|---|---|
| 01 | Full monorepo scaffold |
| 02 | Authentication + Supabase data layer |
| 03 | UI design system + all components |
| 04 | Mode 1 — Lyrics + Key analysis |
| 05 | Mode 2 — Audio upload |
| 06 | Mode 3 — Live song search |
| 07 | Mode 4 — Microphone recording |
| 08 | ElevenLabs Speech Engine voice coach |
| 09 | Voice Changer + DiffSinger pitched singing |
| 10 | Library, history, sharing, PDF export |
| 11 | PWA, performance, landing page, deployment |
