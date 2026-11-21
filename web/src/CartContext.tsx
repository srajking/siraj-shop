// CartContext.tsx — the provider: the cart and its dispatch, for every component below it
import type { ReactNode } from 'react'
import { cartReducer } from './cartReducer.ts'
import { useLocalReducer } from './hooks/useLocalStorage.ts'
import { CartContext } from './useCart.ts'
import { STORAGE } from './storage.ts'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useLocalReducer(STORAGE.cart, cartReducer, {})   // { productId: qty }

  return <CartContext value={{ cart, dispatch }}>{children}</CartContext>
}
