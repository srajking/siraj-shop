// setup.js — runs before every test file
import '@testing-library/jest-dom/vitest'          // toBeInTheDocument(), toHaveFocus(), toBeDisabled() …
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()                                        // remove what the test rendered
  localStorage.clear()                             // the cart starts empty in every test
})
