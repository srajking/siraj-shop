"use client";
import { useActionState } from "react";
import { sendReview, type ReviewState } from "./actions";

export default function ReviewForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(sendReview, { error: null, sent: 0 });
  return (
    <form action={action} className="review-form">
      <input type="hidden" name="productId" value={productId} />
      <select name="stars" defaultValue="5" aria-label="Stars">
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
      </select>
      <input name="text" placeholder="Your review" aria-label="Your review" minLength={3} maxLength={500} required />
      <button disabled={pending}>{pending ? "Sending…" : "Send review"}</button>
      {state.error && <p role="alert" className="error">{state.error}</p>}
      {state.sent > 0 && <p className="thanks">Thank you — your review is on the page.</p>}
    </form>
  );
}
