import { create } from "zustand";
import { persist } from "zustand/middleware";

// the cart lives in the browser: one store for every page, kept in localStorage between visits
type Cart = {
  items: Record<number, number>; // product id → how many
  add: (id: number, stock: number) => void;
};

export const useCart = create<Cart>()(
  persist(
    (set) => ({
      items: {},
      add: (id, stock) =>
        set((s) => ({ items: { ...s.items, [id]: Math.min((s.items[id] ?? 0) + 1, stock) } })),
    }),
    { name: "siraj-cart" },
  ),
);

export const countOf = (items: Cart["items"]) => Object.values(items).reduce((a, b) => a + b, 0);
