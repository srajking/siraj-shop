// CartContext.jsx — the provider: the cart and its dispatch, for every component below it
import { cartReducer } from './cartReducer.ts'
import { useLocalReducer } from './hooks/useLocalStorage.js'
import { CartContext } from './useCart.js'
import { STORAGE } from './storage.ts'

export function CartProvider({ children }) {
  const [cart, dispatch] = useLocalReducer(STORAGE.cart, cartReducer, {})   // { productId: qty }

  return <CartContext value={{ cart, dispatch }}>{children}</CartContext>
}
