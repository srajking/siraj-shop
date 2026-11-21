import { describe, test, expect } from 'vitest'
import { cartReducer } from './cartReducer.ts'

describe('cartReducer', () => {
  test('adds, but never past the stock', () => {
    const cart = cartReducer({}, { type: 'added', id: 3, n: 2, stock: 3 })
    expect(cart).toEqual({ 3: 2 })
    expect(cartReducer(cart, { type: 'added', id: 3, n: 2, stock: 3 })).toEqual({ 3: 3 })
  })
  test('decreasing the last one removes the product', () => {
    expect(cartReducer({ 3: 1 }, { type: 'decreased', id: 3 })).toEqual({})
  })
  test('an added action without stock is an error, not NaN', () => {
    expect(() => cartReducer({}, { type: 'added', id: 3, n: 2 })).toThrow('cart action is missing stock')
  })
  test('an unknown action is an error', () => {
    expect(() => cartReducer({}, { type: 'sold' })).toThrow('Unknown action: sold')
  })
})
