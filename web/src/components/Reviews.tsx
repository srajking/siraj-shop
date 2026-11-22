// Reviews.tsx — a product's reviews live on the server: read with useQuery, add with an optimistic useMutation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import s from './Reviews.module.css'
import ReviewForm, { type ReviewForm as Fields } from './ReviewForm.tsx'
import { getJson, postJson } from '../api.ts'
import { isReviews, isReviewSaved, type Review } from '../checks.ts'

export default function Reviews({ productId }: { productId: number }) {
  const qc = useQueryClient()
  const key = ['reviews', productId]
  const url = `/api/products/${productId}/reviews`
  const { data: reviews = [] } = useQuery({ queryKey: key, queryFn: ({ signal }) => getJson(url, isReviews, signal) })

  const add = useMutation({
    mutationFn: (f: Fields) => postJson(url, { name: f.name, stars: Number(f.stars), text: f.text }, isReviewSaved),
    onMutate: async f => {
      await qc.cancelQueries({ queryKey: key })                      // no refetch may overwrite the guess
      const before = qc.getQueryData<Review[]>(key)
      qc.setQueryData<Review[]>(key, old => [...(old ?? []), { id: -1, name: f.name, stars: Number(f.stars), text: f.text }])
      return { before }
    },
    onError: (_e, _f, ctx) => qc.setQueryData(key, ctx?.before),   // refused: take the guess back
    onSettled: () => qc.invalidateQueries({ queryKey: key }),       // then ask for the truth
  })

  const total = reviews.reduce((sum, r) => sum + r.stars, 0)
  const average = reviews.length ? (total / reviews.length).toFixed(1) : '—'

  return (
    <section className={s.box} aria-labelledby="rev-title">
      <h2 id="rev-title">تقييمات الزبائن</h2>
      <p id="avg">المعدل: <bdi>{average}</bdi> من 5 — {reviews.length} تقييم</p>
      <ul>{reviews.map(r => <li key={r.id}><b>{r.name}</b> ({r.stars}★): {r.text}</li>)}</ul>
      {add.isError && <p role="alert">لم يحفظ التقييم — حاول مرة اخرى</p>}
      <ReviewForm onAdd={f => add.mutate(f)} />                      {/* owns the fields: typing stays inside it */}
    </section>
  )
}
