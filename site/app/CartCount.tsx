"use client";
import { useCart, countOf } from "@/lib/cart";

// in the header, on every page. The server (and hydration) see an empty cart;
// zustand fills in the saved one right after — so the HTML never disagrees with React.
export default function CartCount() {
  const count = useCart((s) => countOf(s.items));
  return <span className="cart-count">Cart ({count})</span>;
}
