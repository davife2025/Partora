import Link       from "next/link";
import { loginAction, oAuthAction } from "@/app/actions/auth.actions";
import { AuthForm }   from "@/components/auth/AuthForm";
import { AuthInput }  from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { OAuthButton } from "@/components/auth/OAuthButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; message?: string }>;
}) {
  const { redirect, error, message } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back</h2>
        <p className="text-sm text-white/40 mt-1">Sign in to your Partora account</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl p-4">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-2xl p-4">
          {message}
        </div>
      )}

      <AuthForm action={loginAction}>
        {redirect && (
          <input type="hidden" name="redirect" value={redirect} />
        )}
        <AuthInput label="Email"    name="email"    type="email"    placeholder="you@example.com"  autoComplete="email"            required />
        <AuthInput label="Password" name="password" type="password" placeholder="••••••••"          autoComplete="current-password" required />
        <div className="flex justify-end -mt-1">
          <Link href="/forgot-password" className="text-xs text-white/30 hover:text-white transition-colors">
            Forgot password?
          </Link>
        </div>
        <AuthButton>Sign in</AuthButton>
      </AuthForm>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-white/8" />
        <span className="mx-3 text-xs text-white/25 bg-[#0D0D14] px-1">or</span>
        <div className="flex-1 border-t border-white/8" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <OAuthButton provider="google" action={oAuthAction} />
        <OAuthButton provider="apple"  action={oAuthAction} />
      </div>

      <p className="text-center text-sm text-white/30">
        No account?{" "}
        <Link href="/register" className="text-[#7F77DD] hover:text-[#9B95E8] font-semibold transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  );
}