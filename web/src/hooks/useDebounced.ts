// useDebounced.ts — the value, but only after it stopped changing for `ms`
import { useState, useEffect } from 'react'

export function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value)                // the first value: at once
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(timer)                           // changed again: start over
  }, [value, ms])
  return settled
}
