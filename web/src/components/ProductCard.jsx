import { Link } from 'react-router'
import s from './ProductCard.module.css'
import { useCart } from '../useCart.js'

function iqd(n) {
  return n.toLocaleString('en-US') + ' IQD'
}

export default function ProductCard({ product }) {
  const { cart, dispatch } = useCart()
  const qty = cart[product.id] ?? 0
  const out = product.stock === 0

  return (
    <article className={out ? `${s.card} ${s.out}` : s.card}>
      <img src={`/img/${product.img}-400.jpg`} alt={product.alt} width={240} height={180} />
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
}
