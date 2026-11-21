// useCart.ts — the cart context and the hook that reads it (no components in this file)
import { createContext, useContext } from 'react'
import type { Cart, CartAction } from './types.ts'

export interface CartValue {
  cart: Cart
  dispatch: (action: CartAction) => void
}

export const CartContext = createContext<CartValue | null>(null)   // null: no provider above

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw Error('useCart must be used inside <CartProvider>')
  return ctx                                                   // CartValue from here on
}
