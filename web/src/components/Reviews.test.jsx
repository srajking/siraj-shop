import { test, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { QueryClientProvider } from '@tanstack/react-query'
import Reviews from './Reviews.tsx'
import { queryClient } from '../queryClient.ts'

let server                                                     // a pretend server: its reviews, its speed, its mood
beforeEach(() => {
  server = { reviews: [{ id: 1, productId: 3, name: 'علي', stars: 5, text: 'قوية وواسعة' }], delay: 0, refuse: false }
  vi.stubGlobal('fetch', vi.fn(async (url, init) => {
    await new Promise(r => setTimeout(r, server.delay))
    if (init?.method === 'POST') {
      if (server.refuse) return { ok: false, status: 500, json: async () => ({ error: 'boom' }) }
      const review = { id: server.reviews.length + 1, productId: 3, ...JSON.parse(init.body) }
      server.reviews.push(review)
      return { ok: true, status: 201, json: async () => review }
    }
    return { ok: true, json: async () => structuredClone(server.reviews) }
  }))
  return () => vi.unstubAllGlobals()
})
const show = () => render(<QueryClientProvider client={queryClient}><Reviews productId={3} /></QueryClientProvider>)
async function write(user, name, text) {
  await user.type(screen.getByRole('textbox', { name: 'الاسم' }), name)
  await user.type(screen.getByRole('textbox', { name: 'رأيك' }), text)
  await user.click(screen.getByRole('button', { name: 'ارسل التقييم' }))
}

test('an empty review: the error is announced and focus goes to the first field', async () => {
  const user = userEvent.setup()
  show()
  await user.click(screen.getByRole('button', { name: 'ارسل التقييم' }))
  const name = screen.getByRole('textbox', { name: 'الاسم' })
  expect(name).toHaveFocus()
  expect(name).toHaveAttribute('aria-invalid', 'true')
  expect(name).toHaveAccessibleDescription('اكتب اسمك')
})

test('axe finds no violations in the form', async () => {
  const { container } = show()
  const { violations } = await axe.run(container)
  expect(violations.map(v => v.id)).toEqual([])
})

test('fixing a field removes its error — the message follows the form', async () => {
  const user = userEvent.setup()
  show()
  await user.click(screen.getByRole('button', { name: 'ارسل التقييم' }))
  await user.type(screen.getByRole('textbox', { name: 'الاسم' }), 'سراج')
  expect(screen.queryByText('اكتب اسمك')).toBeNull()
  expect(screen.getByText('اكتب 5 احرف على الاقل')).toBeInTheDocument()
})

test('a review is still there after a reload — the server keeps it', async () => {
  const user = userEvent.setup()
  show()
  await write(user, 'سراج', 'حقيبة ممتازة')
  expect(await screen.findByText(/حقيبة ممتازة/)).toBeInTheDocument()
  cleanup(); queryClient.clear()                               // a reload: no page, no cache
  show()
  expect(await screen.findByText(/حقيبة ممتازة/)).toBeInTheDocument()
})

test('a new review shows at once, before the server answers', async () => {
  const user = userEvent.setup()
  show()
  await screen.findByText(/قوية وواسعة/)
  server.delay = 500                                           // a slow server
  await write(user, 'سراج', 'حقيبة ممتازة')
  expect(screen.getByText(/حقيبة ممتازة/)).toBeInTheDocument() // no waiting
})

test('a refused review disappears, and the customer is told', async () => {
  const user = userEvent.setup()
  show()
  await screen.findByText(/قوية وواسعة/)
  server.refuse = true
  await write(user, 'سراج', 'حقيبة ممتازة')
  expect(await screen.findByText('لم يحفظ التقييم — حاول مرة اخرى')).toBeInTheDocument()
  expect(screen.queryByText(/حقيبة ممتازة/)).toBeNull()
})
