// cartStore.ts — the cart in a Zustand store: the same reducer, saved under STORAGE.cart
import { create } from 'zustand'
import { cartReducer } from './cartReducer.ts'
import { STORAGE } from './storage.ts'
import type { Cart, CartAction } from './types.ts'

const saved = localStorage.getItem(STORAGE.cart)
export const useCart = create<Cart>()(() => (saved === null ? {} : JSON.parse(saved)))   // the hook IS the store
useCart.subscribe(cart => localStorage.setItem(STORAGE.cart, JSON.stringify(cart)))

export function dispatch(action: CartAction) {                 // the same rules, from anywhere
  useCart.setState(cartReducer(useCart.getState(), action), true)   // true: replace — a removed id must go
}
