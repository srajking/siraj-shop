// ReviewForm.tsx — the review form owns its own state: typing redraws the form, not the reviews
import { useState, type ChangeEvent, type FormEvent } from 'react'
import s from './Reviews.module.css'

export interface ReviewForm { name: string; stars: string; text: string }   // what the fields hold: text
type Errors = { [K in keyof ReviewForm]?: string }                         // one message per field, maybe
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

const empty: ReviewForm = { name: '', stars: '5', text: '' }

function validate(form: ReviewForm): Errors {                          // the form → its errors, nothing stored
  const errors: Errors = {}
  if (!form.name.trim()) errors.name = 'اكتب اسمك'
  if (form.text.trim().length < 5) errors.text = 'اكتب 5 احرف على الاقل'
  return errors
}

export default function ReviewForm({ onAdd }: { onAdd: (form: ReviewForm) => void }) {
  const [form, setForm] = useState(empty)
  const [tried, setTried] = useState(false)                            // pressed send at least once?
  const errors = tried ? validate(form) : {}                           // derived: always matches the form

  const change = (e: ChangeEvent<Field>) => setForm({ ...form, [e.target.name]: e.target.value })

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTried(true)
    const first = Object.keys(validate(form))[0]
    if (first) {
      const field = e.currentTarget.elements.namedItem(first)
      if (field instanceof HTMLElement) field.focus()                  // namedItem may be a list, or null
      return
    }
    onAdd(form)                                                        // the list belongs to the parent
    setForm(empty)
    setTried(false)
  }

  const err = (key: keyof ReviewForm) => errors[key] && <p id={key + '-err'} className={s.err}>{errors[key]}</p>
  const aria = (key: keyof ReviewForm) => ({ 'aria-invalid': errors[key] ? true : undefined, 'aria-describedby': errors[key] ? key + '-err' : undefined })

  return (
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
  )
}
