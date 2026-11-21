// renders.test.jsx — how much of the page one click redraws (each wrapped component counts its renders)
import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

const { renders, counted } = vi.hoisted(() => {
  const renders = {}
  const counted = name => async orig => {                   // same component, plus a counter
    const real = (await orig()).default
    return { default: props => { renders[name] = (renders[name] ?? 0) + 1; return real(props) } }
  }
  return { renders, counted }
})
vi.mock('./components/Header.tsx', counted('Header'))
vi.mock('./components/CartPanel.tsx', counted('CartPanel'))
import App from './App.tsx'

test('the theme button redraws only itself — not the header, not the cart', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><App /></MemoryRouter>)
  for (const k in renders) delete renders[k]
  await user.click(screen.getByRole('button', { name: 'الوضع الداكن' }))
  expect(renders).toEqual({})
})
