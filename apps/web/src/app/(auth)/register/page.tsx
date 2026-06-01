import Link from "next/link";
import { registerAction, oAuthAction } from "@/app/actions/auth.actions";
import { AuthForm }       from "@/components/auth/AuthForm";
import { AuthInput }      from "@/components/auth/AuthInput";
import { AuthButton }     from "@/components/auth/AuthButton";
import { OAuthButton }    from "@/components/auth/OAuthButton";
import { VoicePartSelect } from "@/components/auth/VoicePartSelect";
import type { Metadata }   from "next";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Create your account</h2>
        <p className="text-sm text-white/40 mt-1">Start discovering your voice parts — free forever</p>
      </div>

      <AuthForm
        action={registerAction}
        successRedirect="/login?message=Check your email to confirm your account"
      >
        <AuthInput label="Full name" name="full_name" type="text"     placeholder="Your name"         autoComplete="name"         required />
        <AuthInput label="Email"     name="email"     type="email"    placeholder="you@example.com"   autoComplete="email"        required />
        <AuthInput label="Password"  name="password"  type="password" placeholder="Min. 8 characters" autoComplete="new-password" required minLength={8} />
        <VoicePartSelect />
        <AuthButton>Create account</AuthButton>
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
        Already have an account?{" "}
        <Link href="/login" className="text-[#7F77DD] hover:text-[#9B95E8] font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
