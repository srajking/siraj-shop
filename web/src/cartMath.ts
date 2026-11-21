// cartMath.ts — the cart's numbers, counted only over products that exist
import type { Cart, Product } from './types.ts'

export function cartCount(
  cart: Cart,
  products: Product[],
): number {
  return products.reduce((sum, p) => sum + (cart[p.id] ?? 0), 0)
}

export function cartTotal(
  cart: Cart,
  products: Product[],
): number {
  return products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * p.price, 0)
}
