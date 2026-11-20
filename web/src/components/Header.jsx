import s from './Header.module.css'
import { useCart } from '../CartContext.jsx'
import { products } from '../products.js'

function iqd(n) {
  return n.toLocaleString('en-US') + ' IQD'
}

export default function Header() {
  const { cart, dispatch } = useCart()
  const count = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = products.reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0)

  return (
    <header className={s.header}>
      <h1 className={s.title}>متجر سراج</h1>
      <p>دفاتر واقلام وحقائب</p>
      <p className={s.cart} id="cart">
        السلة: <b id="count">{count}</b> — <bdi lang="en">{iqd(total)}</bdi>
        {count > 0 && <button onClick={() => dispatch({ type: 'cleared' })}>افرغ السلة</button>}
      </p>
    </header>
  )
}
