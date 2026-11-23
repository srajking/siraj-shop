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

export const getProducts = async () => (await get<Product[]>("/products")) ?? [];
export const getProduct = (id: string) => get<Product>(`/products/${id}`);
export const getReviews = async (id: string) => (await get<Review[]>(`/products/${id}/reviews`)) ?? [];
