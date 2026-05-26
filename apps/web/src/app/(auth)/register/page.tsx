import Link from "next/link";
import { registerAction, oAuthAction } from "@/app/actions/auth.actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { VoicePartSelect } from "@/components/auth/VoicePartSelect";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="glass p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Create your account</h2>
        <p className="text-muted text-sm mt-1">Start discovering your voice parts</p>
      </div>

      <AuthForm action={registerAction} successRedirect="/login?message=Check your email to confirm your account">
        <AuthInput
          label="Full name"
          name="full_name"
          type="text"
          placeholder="Your name"
          required
          autoComplete="name"
        />
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
          placeholder="Min. 8 characters"
          required
          autoComplete="new-password"
          minLength={8}
        />
        <VoicePartSelect />
        <AuthButton>Create account</AuthButton>
      </AuthForm>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative text-center">
          <span className="bg-background-secondary px-3 text-xs text-muted">or</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <OAuthButton provider="google" action={oAuthAction} />
        <OAuthButton provider="apple" action={oAuthAction} />
      </div>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-soprano hover:text-soprano/80 transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
