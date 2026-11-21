import { useEffect } from 'react'
import s from './Header.module.css'
import { useCart } from '../useCart.ts'
import { iqd } from '../money.ts'
import { cartCount, cartTotal } from '../cartMath.ts'
import { products } from '../products.ts'
import { useLocalStorage } from '../hooks/useLocalStorage.ts'
import { STORAGE } from '../storage.ts'
import CartPanel from './CartPanel.jsx'

export default function Header() {
  const { cart, dispatch } = useCart()
  const count = cartCount(cart, products)                    // only products that exist
  const total = cartTotal(cart, products)

  const [dark, setDark] = useLocalStorage(STORAGE.dark, false)  // 'siraj-shop:dark'
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
