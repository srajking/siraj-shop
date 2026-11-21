// checks.ts — type guards for what the server sends
import type { Product } from './types.ts'

export type SearchHit = Pick<Product, 'id' | 'name'>

function isSearchHit(x: unknown): x is SearchHit {
  return typeof x === 'object' && x !== null
    && 'id' in x && typeof x.id === 'number'
    && 'name' in x && typeof x.name === 'string'
}

export function isSearchHits(data: unknown): data is SearchHit[] {
  return Array.isArray(data) && data.every(isSearchHit)
}
