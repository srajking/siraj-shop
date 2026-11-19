import { useState } from 'react'
import s from './ProductCard.module.css'

function iqd(n) {
  return n.toLocaleString('en-US') + ' IQD'
}

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(0)
  const out = product.stock === 0

  function add(n) {
    for (let i = 0; i < n; i++) setQty(q => Math.min(q + 1, product.stock))
  }

  return (
    <article className={out ? `${s.card} ${s.out}` : s.card}>
      <img src={`/img/${product.img}-400.jpg`} alt={product.alt} width={240} height={180} />
      <h3>{product.name}</h3>
      <p>{product.desc}</p>
      <p className={s.price}><bdi lang="en">{iqd(product.price)}</bdi></p>
      {out ? <p>نفد</p> : <p>متوفر: {product.stock}</p>}
      <div className={s.buy}>
        <button disabled={out || qty === product.stock} onClick={() => add(1)}>اضف</button>
        <button disabled={out || qty === product.stock} onClick={() => add(2)}>اضف 2</button>
        {qty > 0 && <span>في السلة: {qty}</span>}
      </div>
    </article>
  )
}
