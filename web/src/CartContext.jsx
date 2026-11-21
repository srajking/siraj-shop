// CartContext.jsx — the cart and its dispatch, for every component below the provider
import { createContext, useContext } from 'react'
import { cartReducer } from './cartReducer.js'
import { useLocalReducer } from './hooks/useLocalStorage.js'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, dispatch] = useLocalReducer('cart', cartReducer, {})   // { productId: qty }

  return <CartContext value={{ cart, dispatch }}>{children}</CartContext>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw Error('useCart must be used inside <CartProvider>')
  return ctx
}
