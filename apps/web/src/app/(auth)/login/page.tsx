import Link from "next/link";
import { loginAction, oAuthAction } from "@/app/actions/auth.actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { OAuthButton } from "@/components/auth/OAuthButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string };
}) {
  return (
    <div className="glass p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
        <p className="text-muted text-sm mt-1">Sign in to your Partora account</p>
      </div>

      {searchParams.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3">
          {searchParams.error}
        </div>
      )}

      <AuthForm action={loginAction}>
        {searchParams.redirect && (
          <input type="hidden" name="redirect" value={searchParams.redirect} />
        )}
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end -mt-2">
          <Link href="/forgot-password" className="text-xs text-muted hover:text-white transition-colors">
            Forgot password?
          </Link>
        </div>
        <AuthButton>Sign in</AuthButton>
      </AuthForm>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative text-center">
          <span className="bg-background-secondary px-3 text-xs text-muted">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <OAuthButton provider="google" action={oAuthAction} />
        <OAuthButton provider="apple" action={oAuthAction} />
      </div>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-soprano hover:text-soprano/80 transition-colors font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
