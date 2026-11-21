// useLocalStorage.ts — state that survives a reload, under ONE key from storage.ts
import { useState, useReducer, useEffect } from 'react'
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

export function useLocalReducer<S, A>(
  key: StorageKey,
  reducer: (state: S, action: A) => S,
  initial: S,
): [S, (action: A) => void] {
  const [state, dispatch] = useReducer(reducer, null, () => read(key, initial))
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state])
  return [state, dispatch]
}
