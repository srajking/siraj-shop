import { describe, it, expect, vi, beforeEach } from "vitest";

// what the action touches outside itself: the cookie jar, the cache helpers, the shop, the API
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (n: string) => (jar.has(n) ? { value: jar.get(n) } : undefined) }) }));
vi.mock("next/cache", () => ({ refresh: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/shop", () => ({ getProduct: vi.fn(async (id: string) => (id === "3" ? { id: 3, name: "Bag" } : null)) }));
const api = vi.fn(async (_url: string, _init?: RequestInit) => new Response("{}", { status: 201 }));
vi.stubGlobal("fetch", api);

import { sendReview } from "@/app/products/[id]/actions";
import { encode } from "@/lib/session";

const form = (f: Record<string, string>) => { const d = new FormData(); for (const [k, v] of Object.entries(f)) d.set(k, v); return d; };
const start = { error: null, sent: 0 };
const logIn = () => jar.set("session", encode({ userId: 1, name: "سراج", role: "customer", exp: Date.now() / 1000 + 600 }));

describe("sendReview", () => {
  beforeEach(() => { jar.clear(); api.mockClear(); });

  it("asks a stranger to log in (chapter 13)", async () => {
    expect((await sendReview(start, form({ productId: "3", stars: "5", text: "Good bag" }))).error).toBe("Log in to write a review");
    expect(api).not.toHaveBeenCalled();
  });
  it("refuses 9 stars and a missing product (chapter 10)", async () => {
    logIn();
    expect((await sendReview(start, form({ productId: "3", stars: "9", text: "Good bag" }))).error).toBe("Stars must be 1 to 5");
    expect((await sendReview(start, form({ productId: "99", stars: "5", text: "Good bag" }))).error).toBe("No such product");
    expect(api).not.toHaveBeenCalled();
  });
  it("refuses a forged session cookie", async () => {
    jar.set("session", "eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.forged");
    expect((await sendReview(start, form({ productId: "3", stars: "5", text: "Good bag" }))).error).toBe("Log in to write a review");
  });
  it("sends the name from the session, not from the form", async () => {
    logIn();
    const r = await sendReview(start, form({ productId: "3", stars: "4", text: "Good bag", name: "someone else" }));
    expect(r).toEqual({ error: null, sent: 1 });
    expect(JSON.parse(String(api.mock.calls[0][1]?.body))).toEqual({ name: "سراج", stars: 4, text: "Good bag" });
  });
});
