// setup.js — runs before every test file
import '@testing-library/jest-dom/vitest'          // toBeInTheDocument(), toHaveFocus(), toBeDisabled() …
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { useCartStore } from '../cartStore.ts'
import { clearSearchCache } from '../searchCache.ts'

afterEach(() => {
  cleanup()                                        // remove what the test rendered
  localStorage.clear()
  useCartStore.setState({ items: {} })             // the cart starts empty in every test
  clearSearchCache()
})
