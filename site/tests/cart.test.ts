import { describe, it, expect, beforeEach } from "vitest";
import { useCart, countOf } from "@/lib/cart";

// the cart store from chapter 14 — no React needed to test a zustand store
describe("cart", () => {
  beforeEach(() => useCart.setState({ items: {} }));

  it("adds one at a time and counts across products", () => {
    useCart.getState().add(3, 10);
    useCart.getState().add(3, 10);
    useCart.getState().add(1, 10);
    expect(useCart.getState().items).toEqual({ 1: 1, 3: 2 });
    expect(countOf(useCart.getState().items)).toBe(3);
  });

  it("never goes past the stock", () => {
    for (let i = 0; i < 5; i++) useCart.getState().add(2, 3);
    expect(useCart.getState().items[2]).toBe(3);
  });
});
