"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  error?:   string;
  success?: boolean;
  message?: string;
};

interface AuthFormProps {
  children:         React.ReactNode;
  action:           (fd: FormData) => Promise<FormState | void>;
  successRedirect?: string;
}

const initial: FormState = {};

export function AuthForm({ children, action, successRedirect }: AuthFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, fd: FormData): Promise<FormState> => {
      const result = await action(fd);
      return result ?? {};
    },
    initial
  );

  useEffect(() => {
    if (state.success && successRedirect) router.push(successRedirect);
  }, [state.success, successRedirect, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl p-3.5">
          {state.error}
        </div>
      )}
      {state.message && state.success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-2xl p-3.5">
          {state.message}
        </div>
      )}
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}