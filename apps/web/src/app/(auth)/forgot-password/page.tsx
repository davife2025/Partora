import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth.actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="glass p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Reset your password</h2>
        <p className="text-muted text-sm mt-1">
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>

      <AuthForm action={forgotPasswordAction}>
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <AuthButton>Send reset link</AuthButton>
      </AuthForm>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-soprano hover:text-soprano/80 transition-colors">
          ← Back to login
        </Link>
      </p>
    </div>
  );
}
