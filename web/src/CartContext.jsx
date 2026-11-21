// CartContext.jsx — the provider: the cart and its dispatch, for every component below it
import { cartReducer } from './cartReducer.js'
import { useLocalReducer } from './hooks/useLocalStorage.js'
import { CartContext } from './useCart.js'

export function CartProvider({ children }) {
  const [cart, dispatch] = useLocalReducer('cart', cartReducer, {})   // { productId: qty }

  return <CartContext value={{ cart, dispatch }}>{children}</CartContext>
}
