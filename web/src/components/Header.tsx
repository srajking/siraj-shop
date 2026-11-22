import s from './Header.module.css'
import { useCartStore, selectCount, selectTotal, dispatch } from '../cartStore.ts'
import { cleared } from '../cartSlice.ts'
import { iqd } from '../money.ts'
import CartPanel from './CartPanel.tsx'
import ThemeToggle from './ThemeToggle.tsx'

export default function Header() {
  const count = useCartStore(selectCount)                      // memoized selectors (chapter 11)
  const total = useCartStore(selectTotal)

  return (
    <header className={s.header}>
      <h1 className={s.title}>متجر سراج</h1>
      <p>دفاتر واقلام وحقائب</p>
      <div className={s.cart} id="cart">          {/* a div: the dialog and its heading cannot live in a <p> */}
        السلة: <b id="count">{count}</b> — <bdi lang="en">{iqd(total)}</bdi>
        {count > 0 && <button onClick={() => dispatch(cleared())}>افرغ السلة</button>}
        <CartPanel />
      </div>
      <ThemeToggle />                                 {/* owns dark: the header does not */}
    </header>
  )
}
