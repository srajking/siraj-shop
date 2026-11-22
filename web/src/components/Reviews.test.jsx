import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import Reviews from './Reviews.tsx'

test('an empty review: the error is announced and focus goes to the first field', async () => {
  const user = userEvent.setup()
  render(<Reviews />)
  await user.click(screen.getByRole('button', { name: 'ارسل التقييم' }))
  const name = screen.getByRole('textbox', { name: 'الاسم' })
  expect(name).toHaveFocus()
  expect(name).toHaveAttribute('aria-invalid', 'true')
  expect(name).toHaveAccessibleDescription('اكتب اسمك')
})

test('axe finds no violations in the form', async () => {
  const { container } = render(<Reviews />)
  const { violations } = await axe.run(container)
  expect(violations.map(v => v.id)).toEqual([])
})

test('fixing a field removes its error — the message follows the form', async () => {
  const user = userEvent.setup()
  render(<Reviews />)
  await user.click(screen.getByRole('button', { name: 'ارسل التقييم' }))   // empty: two errors
  await user.type(screen.getByRole('textbox', { name: 'الاسم' }), 'سراج')
  expect(screen.queryByText('اكتب اسمك')).toBeNull()                       // the name is fine now
  expect(screen.getByText('اكتب 5 احرف على الاقل')).toBeInTheDocument()   // the text still is not
})
