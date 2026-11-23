"use server";
import { refresh } from "next/cache";
import * as z from "zod";
import { getProduct } from "@/lib/shop";
import { getSession } from "@/lib/dal";

const API = "http://localhost:4000/api";
export type ReviewState = { error: string | null; sent: number };

// everything from the form is a string from a stranger: check it on the server
const ReviewInput = z.object({
  productId: z.string().regex(/^\d+$/, "No such product"),
  stars: z.coerce.number().int().min(1, "Stars must be 1 to 5").max(5, "Stars must be 1 to 5"),
  text: z.string().trim().min(3, "Write 3 to 500 letters").max(500, "Write 3 to 500 letters"),
});

export async function sendReview(prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await getSession(); // the action checks for itself: hiding the form is not enough
  if (!session) return { ...prev, error: "Log in to write a review" };
  const input = ReviewInput.safeParse(Object.fromEntries(formData));
  if (!input.success) return { ...prev, error: input.error.issues[0].message };
  const { productId, stars, text } = input.data;
  if (!(await getProduct(productId))) return { ...prev, error: "No such product" };
  try {
    const res = await fetch(`${API}/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: session.name, stars, text }), // the name comes from the session, not the form
    });
    if (!res.ok) throw new Error(`reviews API answered ${res.status}`);
  } catch (e) {
    console.error("sendReview failed:", e); // the details stay in the server log
    return { ...prev, error: "The shop could not save it — try again soon" };
  }
  refresh(); // the reviews are not cached: draw the page again, with the new one
  return { error: null, sent: prev.sent + 1 };
}
