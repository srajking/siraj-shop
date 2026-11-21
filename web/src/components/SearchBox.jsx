import { useState, useEffect } from 'react'
import s from './SearchBox.module.css'
import { getJson, HttpError } from '../api.ts'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!q.trim()) return                         // nothing to ask
    const controller = new AbortController()
    const timer = setTimeout(() => {              // ask only after typing pauses
      getJson('/api/products?q=' + encodeURIComponent(q), controller.signal)
        .then(data => { setResults(data); setFailed(false) })
        .catch(e => {
          if (e.name === 'AbortError') return
          if (e instanceof HttpError) return setFailed(true)     // the server said no
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
