export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="glass p-10 max-w-md w-full space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-semibold tracking-tight">Partora</span>
        </div>
        <p className="text-muted text-sm">
          AI-powered voice parts &amp; tonic solfa for musicians.
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <span className="solfa-pill bg-voice-soprano border text-soprano">Soprano</span>
          <span className="solfa-pill bg-voice-alto border text-alto">Alto</span>
          <span className="solfa-pill bg-voice-tenor border text-tenor">Tenor</span>
          <span className="solfa-pill bg-voice-bass border text-bass">Bass</span>
        </div>
        <p className="text-muted-foreground text-xs pt-2">
          Session 1 scaffold — UI implemented in Session 3
        </p>
      </div>
    </main>
  );
}
