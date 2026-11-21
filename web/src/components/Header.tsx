import s from './Header.module.css'
import { useCart, useCartDispatch } from '../useCart.ts'
import { iqd } from '../money.ts'
import { cartCount, cartTotal } from '../cartMath.ts'
import { products } from '../products.ts'
import CartPanel from './CartPanel.tsx'
import ThemeToggle from './ThemeToggle.tsx'

export default function Header() {
  const cart = useCart()
  const dispatch = useCartDispatch()
  const count = cartCount(cart, products)                    // only products that exist
  const total = cartTotal(cart, products)

  return (
    <header className={s.header}>
      <h1 className={s.title}>متجر سراج</h1>
      <p>دفاتر واقلام وحقائب</p>
      <div className={s.cart} id="cart">          {/* a div: the dialog and its heading cannot live in a <p> */}
        السلة: <b id="count">{count}</b> — <bdi lang="en">{iqd(total)}</bdi>
        {count > 0 && <button onClick={() => dispatch({ type: 'cleared' })}>افرغ السلة</button>}
        <CartPanel />
      </div>
      <ThemeToggle />                                 {/* owns dark: the header does not */}
    </header>
  )
}
