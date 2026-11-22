// searchCache.ts — answers we already have, by search text, with their age (chapter 13)
import type { SearchHit } from './checks.ts'

const FRESH_MS = 60_000                                        // an answer stays fresh for a minute
const answers = new Map<string, { hits: SearchHit[]; at: number }>()

export function freshHits(q: string): SearchHit[] | undefined {
  const a = answers.get(q)
  return a && Date.now() - a.at < FRESH_MS ? a.hits : undefined
}
export const saveHits = (q: string, hits: SearchHit[]) => answers.set(q, { hits, at: Date.now() })
export const clearSearchCache = () => answers.clear()          // tests start empty
