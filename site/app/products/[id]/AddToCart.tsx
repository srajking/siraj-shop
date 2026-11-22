"use client";
import { useState } from "react";

// the only part of the product page that runs in the browser
export default function AddToCart({ stock }: { stock: number }) {
  const [qty, setQty] = useState(0);
  const full = qty >= stock;
  return (
    <button onClick={() => setQty(qty + 1)} disabled={full}>
      {full ? "No more in stock" : "Add to cart"} · in cart: {qty}
    </button>
  );
}
