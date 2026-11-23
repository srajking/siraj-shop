import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

const API = env.SHOP_API;

// A product page streams before it knows the product exists, so notFound()
// there can only send 200 + noindex (chapter 6). The proxy asks first —
// before a single byte of the page leaves the server.
export async function proxy(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/")[2];
  if (!/^\d+$/.test(id)) return missing(req);
  const res = await fetch(`${API}/products/${id}`, { method: "HEAD" }).catch(() => null);
  if (res?.status === 404) return missing(req);
  return NextResponse.next(); // found — or the API is down: let the page and error.tsx answer
}

// a path with no route: Next renders app/not-found.tsx with a real 404
function missing(req: NextRequest) {
  return NextResponse.rewrite(new URL("/_missing", req.url));
}

export const config = { matcher: "/products/:id" };
