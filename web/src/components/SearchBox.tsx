import { useSearchParams } from 'react-router'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import s from './SearchBox.module.css'
import { getJson } from '../api.ts'
import { isSearchHits } from '../checks.ts'
import { useDebounced } from '../hooks/useDebounced.ts'

export default function SearchBox() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''                 // the search lives in the address: shareable, survives reload
  const setQ = (next: string) => setParams(next ? { q: next } : {}, { replace: true })   // typing adds no Back steps
  const asked = useDebounced(q.trim(), 300)       // ask only after typing pauses

  const search = useQuery({                       // server state: cached by ['search', asked] (chapter 14)
    queryKey: ['search', asked],
    queryFn: ({ signal }) => getJson('/api/products?q=' + encodeURIComponent(asked), isSearchHits, signal),
    enabled: asked !== '',                        // nothing to ask
    placeholderData: keepPreviousData,            // keep the last answer while the next one loads
  })
  const shown = q.trim() ? search.data ?? [] : [] // an empty box shows nothing — derived, no setState

  return (
    <search className={s.box}>
      <label>
        ابحث في المتجر <input type="search" value={q} onChange={e => setQ(e.target.value)} />
      </label>
      {q && (search.isError
        ? <p role="status">البحث غير متاح الآن</p>
        : <p role="status">{shown.length} نتيجة: {shown.map(p => p.name).join('، ')}</p>)}
    </search>
  )
}
