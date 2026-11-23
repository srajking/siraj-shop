"use client";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  return (
    <form action={action} className="login-form">
      <input type="hidden" name="from" value={from} />
      <input name="username" placeholder="Username" aria-label="Username" required />
      <input name="password" type="password" placeholder="Password" aria-label="Password" required />
      <button disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
      {state.error && <p role="alert" className="error">{state.error}</p>}
    </form>
  );
}
