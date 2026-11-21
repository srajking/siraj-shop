import { memo } from 'react'
import { Link } from 'react-router'
import s from './ProductCard.module.css'
import { useCartDispatch } from '../useCart.ts'
import { iqd } from '../money.ts'
import type { Product } from '../types.ts'

interface Props {
  product: Product                                             // a whole product — not a search hit
  qty: number                                                  // how many in the cart, from the parent
}

export default memo(function ProductCard({ product, qty }: Props) {   // same props → no redraw
  const dispatch = useCartDispatch()
  const out = product.stock === 0

  return (
    <article className={out ? `${s.card} ${s.out}` : s.card}>
      <img src={`${import.meta.env.BASE_URL}img/${product.img}-400.jpg`} alt={product.alt} width={240} height={180} />
      <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
      <p>{product.desc}</p>
      <p className={s.price}><bdi lang="en">{iqd(product.price)}</bdi></p>
      {out ? <p>نفد</p> : <p>متوفر: {product.stock}</p>}
      <div className={s.buy}>
        <button disabled={out || qty === product.stock} onClick={() => dispatch({ type: 'added', id: product.id, n: 1, stock: product.stock })}>اضف</button>
        <button disabled={out || qty === product.stock} onClick={() => dispatch({ type: 'added', id: product.id, n: 2, stock: product.stock })}>اضف 2</button>
        <button disabled={out} onClick={() => dispatch({ type: 'decreased', id: product.id })}>انقص</button>
        {qty > 0 && <span>في السلة: {qty}</span>}
      </div>
    </article>
  )
})
