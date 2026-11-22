// useLocalStorage.ts — state that survives a reload, under ONE key from storage.ts
import { useState, useEffect } from 'react'
import type { StorageKey } from '../storage.ts'

function read<T>(key: StorageKey, initial: T): T {
  const saved = localStorage.getItem(key)
  return saved === null ? initial : JSON.parse(saved)
}

export function useLocalStorage<T>(key: StorageKey, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState(() => read(key, initial))
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

