import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import s from './SearchBox.module.css'
import { getJson, HttpError, DataError } from '../api.ts'
import { isSearchHits, type SearchHit } from '../checks.ts'

export default function SearchBox() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''                 // the search lives in the address: shareable, survives reload
  const setQ = (next: string) => setParams(next ? { q: next } : {}, { replace: true })   // typing adds no Back steps
  const [results, setResults] = useState<SearchHit[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!q.trim()) return                         // nothing to ask
    const controller = new AbortController()
    const timer = setTimeout(() => {              // ask only after typing pauses
      getJson('/api/products?q=' + encodeURIComponent(q), isSearchHits, controller.signal)
        .then(data => { setResults(data); setFailed(false) })
        .catch(e => {
          if (e.name === 'AbortError') return
          if (e instanceof HttpError || e instanceof DataError) return setFailed(true)   // no, or nonsense
          throw e
        })
    }, 300)
    return () => {                                // a newer q: cancel the wait and the old answer
      clearTimeout(timer)
      controller.abort()
    }
  }, [q])
  const shown = q.trim() ? results : []           // an empty box shows nothing — derived, no setState

  return (
    <search className={s.box}>
      <label>
        ابحث في المتجر <input type="search" value={q} onChange={e => setQ(e.target.value)} />
      </label>
      {q && (failed
        ? <p role="status">البحث غير متاح الآن</p>
        : <p role="status">{shown.length} نتيجة: {shown.map(p => p.name).join('، ')}</p>)}
    </search>
  )
}
