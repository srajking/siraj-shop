import { cacheLife } from "next/cache";

// the shop API, read on the server — never from the browser
const API = "http://localhost:4000/api";

export type Product = { id: number; name: string; price: number; stock: number };
export type Review = { id: number; stars: number; text: string };

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(API + path);
  if (res.status === 404) return null;                      // not there: the page decides
  if (!res.ok) throw new Error(`${path} → ${res.status}`);  // anything else is a real failure
  return res.json();
}

// products change rarely: keep them for an hour
export async function getProducts() {
  "use cache";
  cacheLife("hours");
  return (await get<Product[]>("/products")) ?? [];
}

export async function getProduct(id: string) {
  "use cache";
  cacheLife("hours");
  return get<Product>(`/products/${id}`);
}

// newest reviews first, and how many there are in all
export async function getLatestReviews(id: string, limit = 5) {
  const res = await fetch(`${API}/reviews?product=${id}&limit=${limit}`);
  if (!res.ok) throw new Error(`/reviews → ${res.status}`);
  const { items } = (await res.json()) as { items: Review[] };
  return { items, total: Number(res.headers.get("X-Total-Count")) };
}
