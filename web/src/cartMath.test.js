import { test, expect } from 'vitest'
import { cartCount, cartTotal } from './cartMath.ts'
import { products } from './products.js'

test('a saved cart with a removed product (99): header and panel agree', () => {
  const cart = { 1: 1, 99: 2 }
  expect(cartCount(cart, products)).toBe(1)
  expect(cartTotal(cart, products)).toBe(3000)
})
