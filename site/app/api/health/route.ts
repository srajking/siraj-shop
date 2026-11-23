import { connection } from "next/server";

import { env } from "@/lib/env";

const API = env.SHOP_API;

// GET /api/health — is the site up, and can it reach the shop API?
// a monitor (and the deploy in chapter 18) reads the status code: 200 or 503
export async function GET() {
  await connection(); // answer now, never from a build-time copy
  const started = Date.now();
  const api = await fetch(`${API}/products`, { signal: AbortSignal.timeout(2000) })
    .then((r) => (r.ok ? "up" : "down"))
    .catch(() => "down");
  const ok = api === "up";
  return Response.json({ ok, api, ms: Date.now() - started }, { status: ok ? 200 : 503 });
}
