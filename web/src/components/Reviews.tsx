import { useState } from 'react'
import s from './Reviews.module.css'
import ReviewForm, { type ReviewForm as Fields } from './ReviewForm.tsx'

interface Review { id: number; name: string; stars: number; text: string }

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const total = reviews.reduce((sum, r) => sum + r.stars, 0)
  const average = reviews.length ? (total / reviews.length).toFixed(1) : '—'
  const add = (f: Fields) => setReviews([...reviews, { id: reviews.length + 1, ...f, stars: Number(f.stars) }])

  return (
    <section className={s.box} aria-labelledby="rev-title">
      <h2 id="rev-title">تقييمات الزبائن</h2>
      <p id="avg">المعدل: <bdi>{average}</bdi> من 5 — {reviews.length} تقييم</p>
      <ul>{reviews.map(r => <li key={r.id}><b>{r.name}</b> ({r.stars}★): {r.text}</li>)}</ul>
      <ReviewForm onAdd={add} />                    {/* owns the fields: typing stays inside it */}
    </section>
  )
}
