import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center p-5">
      {/* Glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15"
             style={{ background: "radial-gradient(circle,#7F77DD,transparent)" }}/>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
             style={{ background: "radial-gradient(circle,#185FA5,transparent)" }}/>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white">Partora</h1>
            <p className="text-xs text-white/30 mt-1">Your voice, in every part.</p>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/8 bg-[#13131E] p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
