"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  children: React.ReactNode;
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; message?: string } | void>;
  successRedirect?: string;
}

interface FormState {
  error:   string | undefined;
  success: boolean;
  message: string | undefined;
}

const initialState: FormState = {
  error:   undefined,
  success: false,
  message: undefined,
};

export function AuthForm({ children, action, successRedirect }: AuthFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await action(formData);
      return {
        error:   result?.error   ?? undefined,
        success: result?.success ?? false,
        message: result?.message ?? undefined,
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success && successRedirect) {
      router.push(successRedirect);
    }
  }, [state.success, successRedirect, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3">
          {state.error}
        </div>
      )}
      {state.message && state.success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl p-3">
          {state.message}
        </div>
      )}

      <fieldset disabled={isPending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}