import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SECRET = "dev-session-secret"; // moves to an environment variable in chapter 18
export type Session = { userId: number; name: string; role: "customer" | "admin"; exp: number };

const sign = (body: string) => createHmac("sha256", SECRET).update(body).digest("base64url");

// "body.signature" — readable by anyone, changeable by no one without the key (chapter 13)
export function encode(s: Session) {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decode(token: string | undefined): Session | null {
  const [body, sig] = (token ?? "").split(".");
  if (!body || !sig) return null;
  const good = Buffer.from(sign(body));
  const got = Buffer.from(sig);
  if (got.length !== good.length || !timingSafeEqual(got, good)) return null;
  const s: Session = JSON.parse(Buffer.from(body, "base64url").toString());
  return s.exp > Date.now() / 1000 ? s : null;
}

export async function createSession(user: Omit<Session, "exp">) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  (await cookies()).set("session", encode({ ...user, exp }), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 });
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
