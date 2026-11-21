import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBox from './SearchBox.jsx'

test('asks the server once, after typing stops', async () => {
  const fetch = vi.fn(async () => ({ json: async () => [{ id: 3, name: 'حقيبة ظهر' }] }))
  vi.stubGlobal('fetch', fetch)                   // no real server in a test
  const user = userEvent.setup()
  render(<SearchBox />)

  await user.type(screen.getByRole('searchbox', { name: 'ابحث في المتجر' }), 'حقيبة')
  expect(await screen.findByText('1 نتيجة: حقيبة ظهر')).toBeInTheDocument()   // waits up to 1s
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch.mock.calls[0][0]).toBe('/api/products?q=' + encodeURIComponent('حقيبة'))
  vi.unstubAllGlobals()
})
