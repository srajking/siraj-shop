import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App.tsx'

test('following a product link: new title, focus on its heading', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(document.title).toBe('متجر سراج')
  await user.click(screen.getByRole('link', { name: 'حقيبة ظهر' }))
  expect(screen.getByRole('heading', { level: 2, name: 'حقيبة ظهر' })).toHaveFocus()
  expect(document.title).toBe('حقيبة ظهر — متجر سراج')
})
