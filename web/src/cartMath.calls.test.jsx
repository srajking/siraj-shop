// cartMath.calls.test.jsx — how many times the cart's math runs for ONE click
import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

const { calls } = vi.hoisted(() => ({ calls: { count: 0, total: 0 } }))
vi.mock('./cartMath.ts', async orig => {
  const real = await orig()
  return {
    cartCount: (...a) => { calls.count++; return real.cartCount(...a) },
    cartTotal: (...a) => { calls.total++; return real.cartTotal(...a) },
  }
})

test('one add computes the count once and the total once', async () => {
  vi.resetModules()                                        // load the app again, with the counting cartMath
  const { default: App } = await import('./App.tsx')
  const user = userEvent.setup()
  render(<MemoryRouter><App /></MemoryRouter>)
  calls.count = calls.total = 0
  await user.click(screen.getAllByRole('button', { name: 'اضف' })[0])
  expect(calls).toEqual({ count: 1, total: 1 })
})
