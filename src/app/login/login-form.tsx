"use client";

import { useActionState } from "react";

import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="grid gap-2 text-sm font-medium">
        Username
        <input
          autoComplete="username"
          className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          name="username"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        PIN
        <input
          autoComplete="current-password"
          className="h-10 rounded-lg border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          inputMode="numeric"
          name="pin"
          required
          type="password"
        />
      </label>

      {state.error ? <p className="text-sm text-destructive" role="alert">{state.error}</p> : null}

      <button className="h-10 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50" disabled={isPending} type="submit">
        {isPending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
