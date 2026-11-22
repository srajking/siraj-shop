import { test, expect } from 'vitest'
import { useCart, dispatch } from './cartStore.ts'

test('decreasing to zero removes the product from the cart', () => {
  dispatch({ type: 'added', id: 3, n: 1, stock: 3 })
  dispatch({ type: 'decreased', id: 3 })
  expect(useCart.getState()).toEqual({})                       // not { 3: 1 } left behind by a merge
})
