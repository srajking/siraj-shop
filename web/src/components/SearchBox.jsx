import { useState, useEffect } from 'react'
import s from './SearchBox.module.css'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!q.trim()) return setResults([])
    const controller = new AbortController()
    fetch('/api/products?q=' + encodeURIComponent(q), { signal: controller.signal })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(e => { if (e.name !== 'AbortError') throw e })
    return () => controller.abort()               // a newer q: drop the old answer
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
