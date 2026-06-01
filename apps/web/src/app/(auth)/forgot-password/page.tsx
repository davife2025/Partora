import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth.actions";
import { AuthForm }   from "@/components/auth/AuthForm";
import { AuthInput }  from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-white">Reset password</h2><p className="text-sm text-white/40 mt-1">We&apos;ll send a reset link to your email</p></div>
      <AuthForm action={forgotPasswordAction}>
        <AuthInput label="Email" name="email" type="email" placeholder="you@example.com" required autoComplete="email"/>
        <AuthButton>Send reset link</AuthButton>
      </AuthForm>
      <p className="text-center text-sm text-white/30"><Link href="/login" className="text-[#7F77DD] hover:text-[#9B95E8] transition-colors">← Back to login</Link></p>
    </div>
  );
}
