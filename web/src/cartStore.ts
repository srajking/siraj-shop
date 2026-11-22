// cartStore.ts — the cart lives outside React: one store, one reducer, saved under STORAGE.cart
import { createStore, useStore } from './store.ts'
import { cartReducer } from './cartReducer.ts'
import { STORAGE } from './storage.ts'
import type { Cart, CartAction } from './types.ts'

const saved = localStorage.getItem(STORAGE.cart)
export const cartStore = createStore<Cart>(saved === null ? {} : JSON.parse(saved))
cartStore.subscribe(() => localStorage.setItem(STORAGE.cart, JSON.stringify(cartStore.getState())))

export function dispatch(action: CartAction) {                 // the same rules, from anywhere
  cartStore.setState(cartReducer(cartStore.getState(), action))
}

export function useCart<S>(select: (cart: Cart) => S): S {     // read ONE piece: redraw when it changes
  return useStore(cartStore, select)
}
