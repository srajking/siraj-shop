import { useState, type ChangeEvent, type FormEvent } from 'react'
import s from './Reviews.module.css'

interface Review { id: number; name: string; stars: number; text: string }
interface ReviewForm { name: string; stars: string; text: string }       // what the fields hold: text
type Errors = { [K in keyof ReviewForm]?: string }                       // one message per field, maybe
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

const empty: ReviewForm = { name: '', stars: '5', text: '' }

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Errors>({})

  const change = (e: ChangeEvent<Field>) => setForm({ ...form, [e.target.name]: e.target.value })
  const total = reviews.reduce((sum, r) => sum + r.stars, 0)
  const average = reviews.length ? (total / reviews.length).toFixed(1) : '—'

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'اكتب اسمك'
    if (form.text.trim().length < 5) next.text = 'اكتب 5 احرف على الاقل'
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) {
      const field = e.currentTarget.elements.namedItem(first)
      if (field instanceof HTMLElement) field.focus()                  // namedItem may be a list, or null
      return
    }
    setReviews([...reviews, { id: reviews.length + 1, ...form, stars: Number(form.stars) }])
    setForm(empty)
  }

  const err = (key: keyof ReviewForm) => errors[key] && <p id={key + '-err'} className={s.err}>{errors[key]}</p>
  const aria = (key: keyof ReviewForm) => ({ 'aria-invalid': errors[key] ? true : undefined, 'aria-describedby': errors[key] ? key + '-err' : undefined })

  return (
    <section className={s.box} aria-labelledby="rev-title">
      <h2 id="rev-title">تقييمات الزبائن</h2>
      <p id="avg">المعدل: <bdi>{average}</bdi> من 5 — {reviews.length} تقييم</p>
      <ul>{reviews.map(r => <li key={r.id}><b>{r.name}</b> ({r.stars}★): {r.text}</li>)}</ul>
      <form onSubmit={handleSubmit} noValidate className={s.form}>
        <label htmlFor="name">الاسم</label>
        <input id="name" name="name" value={form.name} onChange={change} {...aria('name')} />
        {err('name')}
        <label htmlFor="stars">النجوم</label>
        <select id="stars" name="stars" value={form.stars} onChange={change}>
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label htmlFor="text">رأيك</label>
        <textarea id="text" name="text" value={form.text} onChange={change} {...aria('text')} />
        {err('text')}
        <button>ارسل التقييم</button>
      </form>
    </section>
  )
}
