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

export interface Review { id: number; name?: string; stars: number; text: string }   // old reviews have no name

function isReview(x: unknown): x is Review {
  return typeof x === 'object' && x !== null
    && 'id' in x && typeof x.id === 'number'
    && 'stars' in x && typeof x.stars === 'number'
    && 'text' in x && typeof x.text === 'string'
}
export const isReviewSaved = isReview
export function isReviews(data: unknown): data is Review[] {
  return Array.isArray(data) && data.every(isReview)
}
