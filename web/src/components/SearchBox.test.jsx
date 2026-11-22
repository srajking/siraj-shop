import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import SearchBox from './SearchBox.tsx'

const show = (url = '/') => render(<MemoryRouter initialEntries={[url]}><SearchBox /></MemoryRouter>)

test('asks the server once, after typing stops', async () => {
  const fetch = vi.fn(async () => ({ ok: true, json: async () => [{ id: 3, name: 'حقيبة ظهر' }] }))
  vi.stubGlobal('fetch', fetch)                   // no real server in a test
  const user = userEvent.setup()
  show()

  await user.type(screen.getByRole('searchbox', { name: 'ابحث في المتجر' }), 'حقيبة')
  expect(await screen.findByText('1 نتيجة: حقيبة ظهر')).toBeInTheDocument()   // waits up to 1s
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch.mock.calls[0][0]).toBe('/api/products?q=' + encodeURIComponent('حقيبة'))
  vi.unstubAllGlobals()
})

test('a server error is a message, not a crash', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, json: async () => ({ error: 'boom' }) })))
  const user = userEvent.setup()
  show()

  await user.type(screen.getByRole('searchbox', { name: 'ابحث في المتجر' }), 'حقيبة')
  expect(await screen.findByText('البحث غير متاح الآن')).toBeInTheDocument()
  vi.unstubAllGlobals()
})

test('an answer in the wrong shape is a message, not a crash', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ items: [{ id: 3, name: 'حقيبة ظهر' }] }) })))
  const user = userEvent.setup()
  show()

  await user.type(screen.getByRole('searchbox', { name: 'ابحث في المتجر' }), 'حقيبة')
  expect(await screen.findByText('البحث غير متاح الآن')).toBeInTheDocument()
  vi.unstubAllGlobals()
})

test('a shared link /?q= fills the box and searches at once', async () => {
  const fetch = vi.fn(async () => ({ ok: true, json: async () => [{ id: 3, name: 'حقيبة ظهر' }] }))
  vi.stubGlobal('fetch', fetch)
  show('/?q=' + encodeURIComponent('حقيبة'))                    // a friend opens the link
  expect(screen.getByRole('searchbox', { name: 'ابحث في المتجر' })).toHaveValue('حقيبة')
  expect(await screen.findByText('1 نتيجة: حقيبة ظهر')).toBeInTheDocument()
  vi.unstubAllGlobals()
})

test('searching the same words again does not ask the server again', async () => {
  const fetch = vi.fn(async () => ({ ok: true, json: async () => [{ id: 3, name: 'حقيبة ظهر' }] }))
  vi.stubGlobal('fetch', fetch)
  const user = userEvent.setup()
  show()
  const box = screen.getByRole('searchbox', { name: 'ابحث في المتجر' })
  await user.type(box, 'حقيبة')
  expect(await screen.findByText('1 نتيجة: حقيبة ظهر')).toBeInTheDocument()
  await user.clear(box)
  await user.type(box, 'حقيبة')                                  // the same question, a second time
  expect(await screen.findByText('1 نتيجة: حقيبة ظهر')).toBeInTheDocument()
  await new Promise(r => setTimeout(r, 400))                      // give a second request time to happen
  expect(fetch).toHaveBeenCalledTimes(1)
  vi.unstubAllGlobals()
})
