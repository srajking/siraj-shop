import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle.tsx'

test('the dark theme survives a reload', async () => {
  const user = userEvent.setup()
  const { unmount } = render(<ThemeToggle />)
  await user.click(screen.getByRole('button', { name: 'الوضع الداكن' }))
  expect(document.documentElement.dataset.theme).toBe('dark')
  unmount()                                                    // a reload: the component starts again
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'الوضع الفاتح' })).toBeInTheDocument()
  expect(document.documentElement.dataset.theme).toBe('dark')
})
