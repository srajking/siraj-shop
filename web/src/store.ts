// store.ts — a tiny external store (chapter 7) and the hook that reads one piece of it
import { useSyncExternalStore } from 'react'

export function createStore<T>(initial: T) {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    getState: () => state,
    setState(next: T) {
      if (Object.is(next, state)) return                       // nothing new: tell no one
      state = next
      listeners.forEach(l => l())
    },
    subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l) } },
  }
}
export type Store<T> = ReturnType<typeof createStore<T>>

export function useStore<T, S>(store: Store<T>, select: (state: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => select(store.getState()))   // redraw only if S changed
}
