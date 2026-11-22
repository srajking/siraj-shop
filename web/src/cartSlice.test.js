import { describe, test, expect } from 'vitest'
import { cartSlice, added, decreased } from './cartSlice.ts'

const reduce = cartSlice.reducer
describe('cartSlice', () => {
  test('adds, but never past the stock', () => {
    const cart = reduce({}, added({ id: 3, n: 2, stock: 3 }))
    expect(cart).toEqual({ 3: 2 })
    expect(reduce(cart, added({ id: 3, n: 2, stock: 3 }))).toEqual({ 3: 3 })
  })
  test('decreasing the last one removes the product', () => {
    expect(reduce({ 3: 1 }, decreased(3))).toEqual({})
  })
  test('the old cart is never changed', () => {
    const before = { 3: 1 }
    reduce(before, added({ id: 3, n: 1, stock: 3 }))
    expect(before).toEqual({ 3: 1 })                             // Immer copied, did not touch
  })
  test('an unknown action leaves the cart as it is', () => {
    const cart = { 3: 1 }
    expect(reduce(cart, { type: 'cart/sold' })).toBe(cart)
  })
})
