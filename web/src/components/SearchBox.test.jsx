import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBox from './SearchBox.jsx'

test('asks the server once, after typing stops', async () => {
  const fetch = vi.fn(async () => ({ ok: true, json: async () => [{ id: 3, name: 'حقيبة ظهر' }] }))
  vi.stubGlobal('fetch', fetch)                   // no real server in a test
  const user = userEvent.setup()
  render(<SearchBox />)

  await user.type(screen.getByRole('searchbox', { name: 'ابحث في المتجر' }), 'حقيبة')
  expect(await screen.findByText('1 نتيجة: حقيبة ظهر')).toBeInTheDocument()   // waits up to 1s
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch.mock.calls[0][0]).toBe('/api/products?q=' + encodeURIComponent('حقيبة'))
  vi.unstubAllGlobals()
})

test('a server error is a message, not a crash', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, json: async () => ({ error: 'boom' }) })))
  const user = userEvent.setup()
  render(<SearchBox />)

  await user.type(screen.getByRole('searchbox', { name: 'ابحث في المتجر' }), 'حقيبة')
  expect(await screen.findByText('البحث غير متاح الآن')).toBeInTheDocument()
  vi.unstubAllGlobals()
})
