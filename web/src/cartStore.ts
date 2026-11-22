// cartStore.ts — the cart: typed state + actions, saved by persist under STORAGE.cart
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { cartSlice, type CartAction } from './cartSlice.ts'
import { STORAGE } from './storage.ts'
import type { Cart } from './types.ts'

interface CartState {
  items: Cart                                                  // { productId: qty }
  dispatch: (action: CartAction) => void                       // the rules: cartSlice.reducer
}

const storage = createJSONStorage<Pick<CartState, 'items'>>(() => ({
  getItem: key => {
    const raw = localStorage.getItem(key)
    if (raw === null || 'state' in JSON.parse(raw)) return raw
    return JSON.stringify({ state: { items: JSON.parse(raw) }, version: 0 })   // saved before persist: { id: qty }
  },
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: key => localStorage.removeItem(key),
}))

export const useCartStore = create<CartState>()(persist(set => ({
  items: {},
  dispatch: action => set(s => ({ items: cartSlice.reducer(s.items, action) })),   // merges: items is one key
}), { name: STORAGE.cart, storage, partialize: s => ({ items: s.items }) }))

export const dispatch = (action: CartAction) => useCartStore.getState().dispatch(action)
export const useCart = <S,>(select: (cart: Cart) => S): S => useCartStore(s => select(s.items))
