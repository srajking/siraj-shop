// cartSync.test.jsx — the cart in more than one tab, and a cart saved badly
import { test, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App.tsx'

test('a change made in another tab shows up in this tab', async () => {
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByText('0', { selector: '#count' })).toBeInTheDocument()
  const saved = JSON.stringify({ state: { items: { 1: 2 } }, version: 0 })       // what the other tab wrote
  localStorage.setItem('siraj-shop:cart', saved)
  await act(async () => window.dispatchEvent(new StorageEvent('storage', { key: 'siraj-shop:cart', newValue: saved })))
  expect(screen.getByText('2', { selector: '#count' })).toBeInTheDocument()
})

test('a broken saved cart starts empty instead of breaking the shop', async () => {
  localStorage.setItem('siraj-shop:cart', '{"3":2')                              // cut off mid-save
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.resetModules()
  const { useCartStore } = await import('./cartStore.ts')
  expect(useCartStore.getState().items).toEqual({})
  expect(errors).not.toHaveBeenCalled()                                         // handled, not thrown
  errors.mockRestore()
})
