import { Link } from 'react-router'
import s from './ProductCard.module.css'
import { useCart, dispatch } from '../cartStore.ts'
import { added, decreased } from '../cartSlice.ts'
import { iqd } from '../money.ts'
import type { Product } from '../types.ts'

interface Props {
  product: Product                                             // a whole product — not a search hit
}

export default function ProductCard({ product }: Props) {
  const qty = useCart(cart => cart[product.id] ?? 0)          // only this card's qty
  const out = product.stock === 0

  return (
    <article className={out ? `${s.card} ${s.out}` : s.card}>
      <img src={`${import.meta.env.BASE_URL}img/${product.img}-400.jpg`} alt={product.alt} width={240} height={180} />
      <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
      <p>{product.desc}</p>
      <p className={s.price}><bdi lang="en">{iqd(product.price)}</bdi></p>
      {out ? <p>نفد</p> : <p>متوفر: {product.stock}</p>}
      <div className={s.buy}>
        <button disabled={out || qty === product.stock} onClick={() => dispatch(added({ id: product.id, n: 1, stock: product.stock }))}>اضف</button>
        <button disabled={out || qty === product.stock} onClick={() => dispatch(added({ id: product.id, n: 2, stock: product.stock }))}>اضف 2</button>
        <button disabled={out} onClick={() => dispatch(decreased(product.id))}>انقص</button>
        {qty > 0 && <span>في السلة: {qty}</span>}
      </div>
    </article>
  )
}
