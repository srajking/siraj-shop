import { test, expect, vi } from 'vitest'
import { useCartStore, dispatch } from './cartStore.ts'

test('decreasing to zero removes the product from the cart', () => {
  dispatch({ type: 'added', id: 3, n: 1, stock: 3 })
  dispatch({ type: 'decreased', id: 3 })
  expect(useCartStore.getState().items).toEqual({})
})

test('a cart saved before persist ({ id: qty }) still loads', async () => {
  localStorage.setItem('siraj-shop:cart', '{"3":2}')            // what returning customers have
  vi.resetModules()                                             // load the store again, like a new visit
  const { useCartStore: fresh } = await import('./cartStore.ts')
  expect(fresh.getState().items).toEqual({ 3: 2 })
})
