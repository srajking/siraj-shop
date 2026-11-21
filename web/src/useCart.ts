// useCart.ts — two contexts: the cart (changes on every click) and dispatch (never changes)
import { createContext, useContext } from 'react'
import type { Cart, CartAction } from './types.ts'

export type CartDispatch = (action: CartAction) => void

export const CartContext = createContext<Cart | null>(null)                  // null: no provider above
export const CartDispatchContext = createContext<CartDispatch | null>(null)

export function useCart(): Cart {                              // read the cart: redraw when it changes
  const cart = useContext(CartContext)
  if (!cart) throw Error('useCart must be used inside <CartProvider>')
  return cart
}

export function useCartDispatch(): CartDispatch {             // only change it: never redrawn by it
  const dispatch = useContext(CartDispatchContext)
  if (!dispatch) throw Error('useCartDispatch must be used inside <CartProvider>')
  return dispatch
}
