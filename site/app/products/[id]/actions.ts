"use server";
import { refresh } from "next/cache";

const API = "http://localhost:4000/api";
export type ReviewState = { error: string | null; sent: number };

// runs on the server; the form calls it with the fields
export async function sendReview(prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const id = String(formData.get("productId"));
  const text = String(formData.get("text") ?? "").trim();
  if (text.length < 3) return { ...prev, error: "Write at least 3 letters" };
  const res = await fetch(`${API}/products/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stars: Number(formData.get("stars")), text }),
  });
  if (!res.ok) return { ...prev, error: `The shop could not save it (${res.status})` };
  refresh(); // the reviews are not cached: draw the page again, with the new one
  return { error: null, sent: prev.sent + 1 };
}
