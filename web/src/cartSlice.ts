// cartSlice.ts — every rule of the cart as an RTK slice: Immer lets us write plain "mutations"
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Cart } from './types.ts'

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {} as Cart,                                    // { productId: qty }
  reducers: {
    added(cart, { payload: { id, n, stock } }: PayloadAction<{ id: number; n: number; stock: number }>) {
      cart[id] = Math.min((cart[id] ?? 0) + n, stock)           // never past the stock
    },
    decreased(cart, { payload: id }: PayloadAction<number>) {
      if ((cart[id] ?? 0) <= 1) delete cart[id]                 // the last one: gone
      else cart[id]--
    },
    cleared: () => ({}),                                       // a new state: return it
  },
})

export const { added, decreased, cleared } = cartSlice.actions
export type CartAction = ReturnType<typeof added | typeof decreased | typeof cleared>
