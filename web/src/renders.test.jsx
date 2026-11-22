// renders.test.jsx — how much of the page one click redraws (each wrapped component counts its renders)
import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

const { renders, counted } = vi.hoisted(() => {
  const renders = {}
  const counted = name => async orig => {                   // same component, plus a counter
    const real = (await orig()).default
    const { memo } = await import('react')
    const inner = real.type ?? real                           // memo(): count the function inside it
    const counting = props => { renders[name] = (renders[name] ?? 0) + 1; return inner(props) }
    return { default: real.type ? memo(counting) : counting }
  }
  return { renders, counted }
})
vi.mock('./components/Header.tsx', counted('Header'))
vi.mock('./components/CartPanel.tsx', counted('CartPanel'))
vi.mock('./components/ProductCard.tsx', counted('ProductCard'))
vi.mock('./components/Reviews.tsx', counted('Reviews'))
vi.mock('./components/Shelf.tsx', counted('Shelf'))
import App from './App.tsx'

test('the theme button redraws only itself — not the header, not the cart', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><App /></MemoryRouter>)
  for (const k in renders) delete renders[k]
  await user.click(screen.getByRole('button', { name: 'الوضع الداكن' }))
  expect(renders).toEqual({})
})

test('adding one product redraws its own card — not every card', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><App /></MemoryRouter>)
  for (const k in renders) delete renders[k]
  await user.click(screen.getAllByRole('button', { name: 'اضف' })[0])
  expect(renders.ProductCard).toBe(1)
})

test('typing a review redraws the form — not the reviews section', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><App /></MemoryRouter>)
  for (const k in renders) delete renders[k]
  await user.type(screen.getByRole('textbox', { name: 'الاسم' }), 'سراج')        // 4 keystrokes
  expect(renders.Reviews).toBeUndefined()
})

test('adding a product redraws the cards that show it — not the shelves', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><App /></MemoryRouter>)
  for (const k in renders) delete renders[k]
  await user.click(screen.getAllByRole('button', { name: 'اضف' })[0])
  expect(renders).toEqual({ ProductCard: 1, Header: 1, CartPanel: 1 })    // and nothing else
})
