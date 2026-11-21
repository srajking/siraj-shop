import { useState, useEffect } from 'react'
import s from './SearchBox.module.css'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!q.trim()) return setResults([])
    const controller = new AbortController()
    const timer = setTimeout(() => {              // ask only after typing pauses
      fetch('/api/products?q=' + encodeURIComponent(q), { signal: controller.signal })
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(e => { if (e.name !== 'AbortError') throw e })
    }, 300)
    return () => {                                // a newer q: cancel the wait and the old answer
      clearTimeout(timer)
      controller.abort()
    }
  }, [q])

  return (
    <search className={s.box}>
      <label>
        ابحث في المتجر <input type="search" value={q} onChange={e => setQ(e.target.value)} />
      </label>
      {q && <p role="status">{results.length} نتيجة: {results.map(p => p.name).join('، ')}</p>}
    </search>
  )
}
