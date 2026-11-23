"use client";

// the product page failed (the shop API is down?) — the header stays, the visitor can retry
export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <main role="alert">
      <h1>Could not load this product</h1>
      <button onClick={() => reset()}>Try again</button>
    </main>
  );
}
