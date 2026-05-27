import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partora — AI Voice Parts & Tonic Solfa for Singers",
  description: "Generate SATB voice parts and tonic solfa for any song instantly. Upload audio, type lyrics, search, or record — Partora does the rest.",
};

const FEATURES = [
  {
    icon: "✍️",
    title: "Type Lyrics",
    desc: "Paste any song lyrics, choose the key — get full SATB harmonisation with tonic solfa in under 60 seconds.",
    color: "soprano",
  },
  {
    icon: "🎵",
    title: "Upload Audio",
    desc: "Drop any MP3 or WAV file. We separate the vocals, detect the key automatically, and generate all four voice parts.",
    color: "alto",
  },
  {
    icon: "🔍",
    title: "Search Any Song",
    desc: "Search millions of songs by name or artist. Tap once to generate complete SATB parts with tonic solfa.",
    color: "tenor",
  },
  {
    icon: "🎤",
    title: "Record Live",
    desc: "Hum or sing a melody into your phone. We recognise the song, detect the key, and build all voice parts from your recording.",
    color: "bass",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Choose your input", desc: "Type lyrics, upload a file, search a song, or record yourself humming." },
  { step: "02", title: "AI analyses the music", desc: "Kimi K2.6 harmonises the melody into all four SATB voice parts with tonic solfa notation." },
  { step: "03", title: "Hear each part", desc: "ElevenLabs speaks the solfa for each part. DiffSinger sings the notes at the correct pitch." },
  { step: "04", title: "Practice with your coach", desc: "Ask our AI voice coach any question about your part, intervals, or music theory — in real time." },
];

const TESTIMONIALS = [
  { name: "Adaeze O.", role: "Choir Director, Lagos",  text: "Partora cut our rehearsal prep time in half. My sopranos can now practice their solfa independently before we even meet." },
  { name: "Kwame A.",  role: "Music Teacher, Accra",   text: "My students used to struggle with tonic solfa. Now they upload the song and hear exactly how their part should sound." },
  { name: "Fatima B.", role: "Worship Leader, Abuja",  text: "We used it for our Easter cantata. Every section knew their part perfectly before the first rehearsal." },
];

const VOICE_COLORS: Record<string, string> = {
  soprano: "bg-soprano/10 border-soprano/30 text-soprano",
  alto:    "bg-alto/10    border-alto/30    text-alto",
  tenor:   "bg-tenor/10   border-tenor/30   text-tenor",
  bass:    "bg-bass/10    border-bass/30    text-bass",
};

const PART_COLORS: Record<string, string> = {
  soprano: "#7F77DD",
  alto:    "#2DA882",
  tenor:   "#D4820A",
  bass:    "#185FA5",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white overflow-x-hidden">

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                      px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-white">Partora</span>
          <span className="hidden sm:inline text-xs text-muted px-2 py-0.5 rounded-full
                           border border-border bg-background-secondary">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-white transition-colors hidden sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-soprano text-white
                       hover:bg-soprano-dark transition-all active:scale-95"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
               style={{ background: "radial-gradient(circle, #7F77DD, transparent)" }} />
          <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl"
               style={{ background: "radial-gradient(circle, #2DA882, transparent)" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-10 blur-3xl"
               style={{ background: "radial-gradient(circle, #D4820A, transparent)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          border border-soprano/30 bg-soprano/10 text-soprano text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-soprano animate-pulse" />
            AI-powered music education
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
            Know your{" "}
            <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #7F77DD, #2DA882, #D4820A, #185FA5)" }}>
              voice part
            </span>
            <br />before the first rehearsal
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Partora turns any song into tonic solfa notation for all four SATB parts —
            Soprano, Alto, Tenor, Bass — with AI-generated audio so you hear exactly how to sing it.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         px-8 py-4 rounded-2xl bg-soprano text-white font-semibold text-base
                         hover:bg-soprano-dark transition-all active:scale-95
                         shadow-xl shadow-soprano/30"
            >
              Start for free →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         px-8 py-4 rounded-2xl border border-border bg-background-secondary
                         text-white font-medium text-base hover:bg-background-tertiary transition-all"
            >
              Sign in
            </Link>
          </div>

          <p className="text-xs text-muted pt-1">No credit card required · Works on mobile & desktop</p>
        </div>

        {/* ── HERO DEMO CARD ─────────────────────────────────── */}
        <div className="relative max-w-2xl mx-auto mt-16">
          <div className="rounded-3xl border border-border bg-background-secondary p-6 shadow-2xl shadow-black/50
                          text-left space-y-5">
            {/* Song header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                              bg-background-tertiary border border-border shrink-0">
                🎶
              </div>
              <div>
                <p className="font-semibold text-white">Amazing Grace</p>
                <p className="text-xs text-muted">Traditional · G major · 3/4</p>
              </div>
              <div className="ml-auto flex gap-1.5">
                {["soprano","alto","tenor","bass"].map((p) => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium"
                        style={{ color: PART_COLORS[p], borderColor: PART_COLORS[p] + "50", background: PART_COLORS[p] + "15" }}>
                    {p[0].toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* SATB solfa preview */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { part: "soprano", solfa: "Sol Do Mi Sol Mi Sol La Sol", label: "Soprano" },
                { part: "alto",    solfa: "Mi Sol Sol Mi Re Mi Fa Mi",   label: "Alto"    },
                { part: "tenor",   solfa: "Do Mi Do Do Ti Do Re Do",     label: "Tenor"   },
                { part: "bass",    solfa: "Do Do Sol Do Sol Do Fa Do",   label: "Bass"    },
              ].map(({ part, solfa, label }) => (
                <div key={part} className="rounded-xl border p-3 space-y-2"
                     style={{ borderColor: PART_COLORS[part] + "40", background: PART_COLORS[part] + "10" }}>
                  <p className="text-xs font-semibold" style={{ color: PART_COLORS[part] }}>{label}</p>
                  <div className="flex flex-wrap gap-1">
                    {solfa.split(" ").map((s, i) => (
                      <span key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: i === 0 ? PART_COLORS[part] : PART_COLORS[part] + "20",
                              color: i === 0 ? "white" : PART_COLORS[part],
                            }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Audio controls row */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 flex-1">
                {["soprano","alto","tenor","bass"].map((p) => (
                  <div key={p} className="flex-1 flex items-end justify-center gap-px h-6">
                    {[3,5,4,6,3,5,4].map((h, i) => (
                      <div key={i} className="w-1 rounded-full animate-bounce"
                           style={{
                             height: `${h * 3}px`,
                             background: PART_COLORS[p],
                             animationDelay: `${i * 100}ms`,
                             animationDuration: "0.8s",
                           }} />
                    ))}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted font-mono">0:24</span>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-3 -right-3 bg-green-500/20 border border-green-500/30
                          text-green-400 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            ✓ Key detected: G major
          </div>
          <div className="absolute -bottom-3 -left-3 bg-soprano/20 border border-soprano/30
                          text-soprano text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            🎤 4 parts generated
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-border/50 bg-background-secondary/50">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-sm text-muted">Trusted by musicians, choir directors and music teachers</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { label: "Songs analysed", value: "10,000+" },
              { label: "Voice parts generated", value: "40,000+" },
              { label: "Countries", value: "24" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-semibold text-white">{s.value}</p>
                <p className="text-xs text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              Four ways to analyse any song
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Whether you have lyrics, a recording, or just know the song name — Partora works with what you have.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                   className={`rounded-2xl border p-6 space-y-3 ${VOICE_COLORS[f.color]}`}>
                <span className="text-3xl">{f.icon}</span>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-background-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">How it works</h2>
            <p className="text-muted">From input to singing in under 2 minutes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-soprano/20 border border-soprano/30
                                flex items-center justify-center text-soprano font-bold text-sm">
                  {s.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOICE COACH HIGHLIGHT ─────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-soprano/20 bg-gradient-to-br
                          from-soprano/10 via-background-secondary to-bass/10 p-8 sm:p-12
                          flex flex-col sm:flex-row items-start gap-8">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-soprano
                              px-3 py-1.5 rounded-full border border-soprano/30 bg-soprano/10">
                🎤 AI Voice Coach
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Ask anything about your part
              </h2>
              <p className="text-muted leading-relaxed">
                Our real-time AI coach answers questions about tonic solfa, voice ranges,
                harmony, and music theory — in your voice, over WebSocket, with context
                from the song you&apos;re learning.
              </p>
              <Link href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                               bg-soprano text-white text-sm font-medium
                               hover:bg-soprano-dark transition-all active:scale-95">
                Try the coach →
              </Link>
            </div>

            {/* Chat mockup */}
            <div className="w-full sm:w-72 shrink-0 space-y-3">
              {[
                { role: "user",      text: "How do I sing the soprano part for bar 4?" },
                { role: "assistant", text: "Bar 4 is Sol–La–Sol in G major. That's G4–A4–G4. Hold the La (A4) for a full beat — it's the highest note in that phrase." },
                { role: "user",      text: "What note is Sol in G major?" },
                { role: "assistant", text: "Sol in G major is D. You're singing D4 for that passage — just above middle C, comfortable soprano range." },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed
                    ${m.role === "user"
                      ? "bg-soprano/20 border border-soprano/30 text-white rounded-br-sm"
                      : "bg-background-secondary border border-border text-muted rounded-bl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-background-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-white text-center mb-12">
            What musicians are saying
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                   className="rounded-2xl border border-border bg-background-secondary p-5 space-y-4">
                <p className="text-sm text-muted leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div aria-hidden className="flex justify-center gap-2 mb-6">
            {["soprano","alto","tenor","bass"].map((p) => (
              <span key={p} className="text-2xl w-12 h-12 rounded-full flex items-center justify-center
                                       border font-bold text-sm"
                    style={{ color: PART_COLORS[p], borderColor: PART_COLORS[p] + "40", background: PART_COLORS[p] + "15" }}>
                {p[0].toUpperCase()}
              </span>
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white">
            Every singer deserves to know their part
          </h2>
          <p className="text-muted text-lg">
            Join thousands of choir members, worship leaders, and music educators
            who use Partora to make music education accessible to everyone.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2
                       px-10 py-4 rounded-2xl bg-soprano text-white font-semibold text-base
                       hover:bg-soprano-dark transition-all active:scale-95
                       shadow-xl shadow-soprano/30"
          >
            Create your free account →
          </Link>
          <p className="text-xs text-muted">Free to start · No credit card · Works on any device</p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Partora</span>
            <span>· AI-powered tonic solfa</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login"    className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
          <p>© {new Date().getFullYear()} Partora. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}