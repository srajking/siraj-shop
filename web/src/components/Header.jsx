import { useEffect } from 'react'
import s from './Header.module.css'
import { useCart } from '../useCart.js'
import { iqd } from '../money.ts'
import { products } from '../products.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import CartPanel from './CartPanel.jsx'

export default function Header() {
  const { cart, dispatch } = useCart()
  const count = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = products.reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0)

  const [dark, setDark] = useLocalStorage('dark', false)       // remembered under 'dark'
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  return (
    <header className={s.header}>
      <h1 className={s.title}>متجر سراج</h1>
      <p>دفاتر واقلام وحقائب</p>
      <div className={s.cart} id="cart">          {/* a div: the dialog and its heading cannot live in a <p> */}
        السلة: <b id="count">{count}</b> — <bdi lang="en">{iqd(total)}</bdi>
        {count > 0 && <button onClick={() => dispatch({ type: 'cleared' })}>افرغ السلة</button>}
        <CartPanel />
      </div>
      <button onClick={() => setDark(!dark)}>{dark ? 'الوضع الفاتح' : 'الوضع الداكن'}</button>
    </header>
  )
}
