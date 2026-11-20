// CartContext.jsx — the cart and its dispatch, for every component below the provider
import { createContext, useContext, useEffect, useReducer } from 'react'
import { cartReducer } from './cartReducer.js'

const CartContext = createContext(null)

// read the saved cart ONCE, before the first render
function loadCart() {
  return JSON.parse(localStorage.getItem('cart') ?? '{}')
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, null, loadCart)   // { productId: qty }

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))          // save on every change
  }, [cart])

  return <CartContext value={{ cart, dispatch }}>{children}</CartContext>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw Error('useCart must be used inside <CartProvider>')
  return ctx
}
