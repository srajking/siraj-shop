// useCart.js — the cart context and the hook that reads it (no components in this file)
import { createContext, useContext } from 'react'

export const CartContext = createContext(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw Error('useCart must be used inside <CartProvider>')
  return ctx
}
