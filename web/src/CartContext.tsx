// CartContext.tsx — the provider: the cart and its dispatch, each in its own context
import type { ReactNode } from 'react'
import { cartReducer } from './cartReducer.ts'
import { useLocalReducer } from './hooks/useLocalStorage.ts'
import { CartContext, CartDispatchContext } from './useCart.ts'
import { STORAGE } from './storage.ts'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useLocalReducer(STORAGE.cart, cartReducer, {})   // { productId: qty }

  return (
    <CartDispatchContext value={dispatch}>                 {/* the same function on every render */}
      <CartContext value={cart}>{children}</CartContext>
    </CartDispatchContext>
  )
}
