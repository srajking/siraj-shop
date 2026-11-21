// useLocalStorage.js — state that survives a reload, under ONE key you pass in
import { useState, useReducer, useEffect } from 'react'

const read = (key, initial) => {
  const saved = localStorage.getItem(key)
  return saved === null ? initial : JSON.parse(saved)
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => read(key, initial))
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

export function useLocalReducer(key, reducer, initial) {
  const [state, dispatch] = useReducer(reducer, null, () => read(key, initial))
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state])
  return [state, dispatch]
}
