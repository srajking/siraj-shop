"use server";
import * as z from "zod";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";

import { env } from "@/lib/env";

const API = env.SHOP_API;
export type LoginState = { error: string | null };
const LoginInput = z.object({
  username: z.string().trim().min(1, "Write your username"),
  password: z.string().min(1, "Write your password"),
  from: z.string().regex(/^\/[^/]/).catch("/"), // only our own pages — never another site
});

export async function login(prev: LoginState, formData: FormData): Promise<LoginState> {
  const input = LoginInput.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: input.error.issues[0].message };
  const { username, password, from } = input.data;
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) return { error: "Username or password is wrong" };
  if (!res.ok) return { error: "The shop could not log you in — try again soon" };
  const { user } = (await res.json()) as { user: { id: number; name: string; role: "customer" | "admin" } };
  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect(from);
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
