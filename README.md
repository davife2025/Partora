# Partora

> AI-powered voice part & tonic solfa generator for singers and musicians.

Partora analyses any song — by lyrics, audio upload, live search, or microphone recording — and returns all four SATB voice parts with tonic solfa notation and audio demonstration for each part.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS |
| Backend | Node.js · Express · TypeScript |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Monorepo | Turborepo |
| Multimodal LLM | Kimi K2.6 via HuggingFace Inference |
| Voice & Audio | ElevenLabs (TTS · Music · Speech Engine · Voice Changer · Forced Alignment) |
| Song Recognition | AudD API |
| Source Separation | Demucs (Meta AI) |
| Audio → MIDI | Basic Pitch (Spotify) |
| Pitched Singing | DiffSinger / SoulX (HuggingFace) |
| Deployments | Vercel (web) · Render (api) |

## Project Structure

```
partora/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── music-engine/ # Solfa conversion, SATB logic, MIDI utils
│   └── config/       # Shared ESLint & TSConfig
└── supabase/
    └── migrations/   # Database schema
```

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in all keys
3. Install dependencies: `npm install`
4. Run Supabase migrations (see `supabase/migrations/`)
5. Start dev servers: `npm run dev`

## Sessions

| Session | Description |
|---|---|
| 1 | Full architecture & scaffold (this session) |
| 2 | Authentication + Supabase data layer |
| 3 | UI design system + layout shell |
| 4 | Mode 1 — Lyrics + Key input |
| 5 | Mode 2 — Audio upload |
| 6 | Mode 3 — Live song search |
| 7 | Mode 4 — Microphone recording |
| 8 | ElevenLabs Speech Engine voice coach |
| 9 | Voice Changer + pitched singing |
| 10 | Library, history & sharing |
| 11 | Performance, PWA & deployment |
