import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { CartProvider } from '../CartContext.jsx'
import ProductCard from './ProductCard.tsx'
import { products } from '../products.ts'

const bag = products.find(p => p.name === 'حقيبة ظهر')     // stock: 3
const pen = products.find(p => p.name === 'قلم حبر')       // stock: 0

function show(product) {                          // the card needs a router and a cart around it
  render(<MemoryRouter><CartProvider><ProductCard product={product} /></CartProvider></MemoryRouter>)
}

test('shows the name as a link to its page', () => {
  show(bag)
  expect(screen.getByRole('link', { name: 'حقيبة ظهر' })).toHaveAttribute('href', '/products/3')
  expect(screen.getByText('19,000 IQD')).toBeInTheDocument()
})

test('a sold-out product cannot be added', () => {
  show(pen)
  expect(screen.getByText('نفد')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'اضف' })).toBeDisabled()
})

test('adding stops at the stock', async () => {
  const user = userEvent.setup()                  // a user: real clicks, real keys
  show(bag)
  await user.click(screen.getByRole('button', { name: 'اضف 2' }))
  expect(screen.getByText('في السلة: 2')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'اضف 2' }))
  expect(screen.getByText('في السلة: 3')).toBeInTheDocument()          // 3, not 4
  expect(screen.getByRole('button', { name: 'اضف' })).toBeDisabled()
})
