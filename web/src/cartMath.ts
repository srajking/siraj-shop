// cartMath.ts — the cart's numbers, counted only over products that exist
export function cartCount(
  cart: { [id: number]: number },                              // productId → qty
  products: { id: number }[],
): number {
  return products.reduce((sum, p) => sum + (cart[p.id] ?? 0), 0)
}

export function cartTotal(
  cart: { [id: number]: number },
  products: { id: number; price: number }[],
): number {
  return products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * p.price, 0)
}
