"use client";
import { useCart } from "@/lib/cart";

// reads and writes the shared cart — not its own useState any more
export default function AddToCart({ id, stock }: { id: number; stock: number }) {
  const qty = useCart((s) => s.items[id] ?? 0);
  const add = useCart((s) => s.add);
  const full = qty >= stock;
  return (
    <button onClick={() => add(id, stock)} disabled={full}>
      {full ? "No more in stock" : "Add to cart"} · in cart: {qty}
    </button>
  );
}
