import Link from "next/link";

const PART_COLORS: Record<string, string> = {
  soprano: "#7F77DD",
  alto:    "#2DA882",
  tenor:   "#D4820A",
  bass:    "#185FA5",
};

const FEATURES = [
  { icon: "✍️", title: "Type Lyrics",   desc: "Paste any lyrics, pick the key. Get full SATB harmonisation with tonic solfa in under 60 seconds.", color: "soprano", href: "/register" },
  { icon: "🎵", title: "Upload Audio",  desc: "Drop any MP3 or WAV. We isolate vocals, detect the key, and build all four voice parts automatically.", color: "alto",    href: "/register" },
  { icon: "🔍", title: "Search a Song", desc: "Search millions of songs by title or artist. One tap to generate complete SATB parts.", color: "tenor",   href: "/register" },
  { icon: "🎤", title: "Record Live",   desc: "Hum a melody into your phone. We identify the song, detect the key, and build all voice parts.", color: "bass",    href: "/register" },
];

const STEPS = [
  { n: "1", title: "Choose your input",      desc: "Lyrics, audio file, song search, or live recording — pick whichever works for you." },
  { n: "2", title: "AI analyses the music",  desc: "Kimi K2.6 harmonises the melody into all four SATB parts with tonic solfa notation." },
  { n: "3", title: "Hear every voice part",  desc: "ElevenLabs speaks the solfa. DiffSinger sings each note at the correct pitch for your voice type." },
  { n: "4", title: "Practice with a coach",  desc: "Ask our AI voice coach anything about your part, intervals, or music theory — live over voice." },
];

const TESTIMONIALS = [
  { name: "Adaeze O.", role: "Choir Director, Lagos",  quote: "Partora cut our rehearsal prep time in half. My sopranos practice their solfa independently before we even meet." },
  { name: "Kwame A.",  role: "Music Teacher, Accra",   quote: "My students upload the song and hear exactly how their part should sound. Tonic solfa finally clicks for them." },
  { name: "Fatima B.", role: "Worship Leader, Abuja",  quote: "We used Partora for our Easter cantata. Every section knew their part perfectly before the first rehearsal." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D14] text-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5
                      bg-[#0D0D14]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Partora</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40">Beta</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"    className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">Sign in</Link>
            <Link href="/register" className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#7F77DD] text-white hover:bg-[#6B63CC] transition-all active:scale-95">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-20 px-5 text-center overflow-hidden">
        {/* Glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4  w-72 h-72 rounded-full blur-3xl opacity-20"
               style={{ background: "radial-gradient(circle, #7F77DD, transparent)" }}/>
          <div className="absolute top-36 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-15"
               style={{ background: "radial-gradient(circle, #2DA882, transparent)" }}/>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-3xl opacity-10"
               style={{ background: "radial-gradient(circle, #D4820A, transparent)" }}/>
        </div>

        <div className="relative max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          border border-[#7F77DD]/30 bg-[#7F77DD]/10 text-[#7F77DD] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-pulse"/>
            AI-powered music education
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Know your{" "}
            <span style={{ background: "linear-gradient(135deg,#7F77DD,#2DA882,#D4820A,#185FA5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              voice part
            </span>
            <br/>before the first rehearsal
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Partora turns any song into tonic solfa notation for Soprano, Alto, Tenor and Bass —
            with AI-generated audio so you hear exactly how to sing it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register"
                  className="px-8 py-4 rounded-2xl bg-[#7F77DD] text-white font-semibold text-base
                             hover:bg-[#6B63CC] transition-all active:scale-95 shadow-xl shadow-[#7F77DD]/25">
              Start for free →
            </Link>
            <Link href="/login"
                  className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5
                             text-white font-medium text-base hover:bg-white/10 transition-all">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-white/30">No credit card required · Works on mobile &amp; desktop</p>
        </div>

        {/* DEMO CARD */}
        <div className="relative max-w-2xl mx-auto mt-16">
          <div className="rounded-3xl border border-white/8 bg-[#13131E] p-6 shadow-2xl shadow-black/60 text-left space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1A1A28] border border-white/8 flex items-center justify-center text-2xl shrink-0">🎶</div>
              <div>
                <p className="font-semibold text-white">Amazing Grace</p>
                <p className="text-xs text-white/40">Traditional · G major · 3/4</p>
              </div>
              <div className="ml-auto flex gap-1.5">
                {Object.entries(PART_COLORS).map(([p, c]) => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize"
                        style={{ color: c, borderColor: c+"50", background: c+"18" }}>
                    {p[0].toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { part:"soprano", label:"Soprano", solfa:"Sol Do Mi Sol Mi Sol La Sol" },
                { part:"alto",    label:"Alto",    solfa:"Mi Sol Sol Mi Re Mi Fa Mi" },
                { part:"tenor",   label:"Tenor",   solfa:"Do Mi Do Do Ti Do Re Do" },
                { part:"bass",    label:"Bass",    solfa:"Do Do Sol Do Sol Do Fa Do" },
              ].map(({ part, label, solfa }) => {
                const c = PART_COLORS[part];
                return (
                  <div key={part} className="rounded-xl border p-3 space-y-2"
                       style={{ borderColor: c+"35", background: c+"10" }}>
                    <p className="text-xs font-semibold" style={{ color: c }}>{label}</p>
                    <div className="flex flex-wrap gap-1">
                      {solfa.split(" ").map((s, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: i===0 ? c : c+"20", color: i===0 ? "#fff" : c }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              {Object.values(PART_COLORS).map((c, pi) => (
                <div key={pi} className="flex-1 flex items-end gap-px h-7 justify-center">
                  {[3,5,4,6,3,5,4].map((h,i) => (
                    <div key={i} className="w-1 rounded-full"
                         style={{ height:`${h*3}px`, background:c, animation:`waveform 0.8s ease-in-out ${i*0.1}s infinite` }}/>
                  ))}
                </div>
              ))}
              <span className="text-xs text-white/30 font-mono ml-2">0:24</span>
            </div>
          </div>
          <div className="absolute -top-3 -right-3 bg-green-500/15 border border-green-500/25
                          text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
            ✓ Key detected: G major
          </div>
          <div className="absolute -bottom-3 -left-3 bg-[#7F77DD]/15 border border-[#7F77DD]/25
                          text-[#7F77DD] text-xs font-medium px-3 py-1.5 rounded-full">
            🎤 4 parts generated
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 px-5 border-y border-white/5 bg-white/2">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-10">
          {[
            { v: "10,000+", l: "Songs analysed" },
            { v: "40,000+", l: "Voice parts generated" },
            { v: "24",      l: "Countries" },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-2xl font-bold text-white">{s.v}</p>
              <p className="text-xs text-white/40 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-white">Four ways to analyse any song</h2>
            <p className="text-white/40">However you come to the music, Partora works with what you have.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(f => {
              const c = PART_COLORS[f.color];
              return (
                <div key={f.title} className="rounded-2xl border p-6 space-y-3 transition-all hover:-translate-y-0.5"
                     style={{ borderColor: c+"30", background: c+"08" }}>
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="text-base font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-5 bg-white/2">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-white">From input to singing in 2 minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#7F77DD]/15 border border-[#7F77DD]/25
                                flex items-center justify-center text-[#7F77DD] font-bold text-sm shrink-0">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">What musicians say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl border border-white/8 bg-[#13131E] p-5 space-y-4">
                <p className="text-sm text-white/50 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/30">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-3xl font-bold text-white">Every singer deserves to know their part</h2>
          <p className="text-white/40">Join thousands of choir members, worship leaders, and music educators.</p>
          <Link href="/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl
                           bg-[#7F77DD] text-white font-bold text-base
                           hover:bg-[#6B63CC] transition-all active:scale-95
                           shadow-xl shadow-[#7F77DD]/25">
            Create your free account →
          </Link>
          <p className="text-xs text-white/25">Free to start · No credit card · Any device</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span className="font-semibold text-white/60">Partora</span>
          <div className="flex gap-6">
            <Link href="/login"    className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
          <p>© {new Date().getFullYear()} Partora</p>
        </div>
      </footer>

    </div>
  );
}
