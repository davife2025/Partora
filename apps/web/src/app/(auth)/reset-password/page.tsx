import { resetPasswordAction } from "@/app/actions/auth.actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <div className="glass p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Set new password</h2>
        <p className="text-muted text-sm mt-1">Choose a strong password for your account</p>
      </div>

      <AuthForm action={resetPasswordAction}>
        <AuthInput
          label="New password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          required
          autoComplete="new-password"
          minLength={8}
        />
        <AuthInput
          label="Confirm password"
          name="confirm_password"
          type="password"
          placeholder="Repeat password"
          required
          autoComplete="new-password"
          minLength={8}
        />
        <AuthButton>Update password</AuthButton>
      </AuthForm>
    </div>
  );
}
