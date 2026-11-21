import { useRef } from 'react'
import s from './CartPanel.module.css'
import { useCart } from '../useCart.ts'
import { products } from '../products.ts'

export default function CartPanel() {
  const { cart } = useCart()
  const dialogRef = useRef(null)                         // the real <dialog> element
  const items = products.filter(p => cart[p.id])

  return (
    <>
      <button onClick={() => dialogRef.current.showModal()}>عرض السلة</button>
      <dialog ref={dialogRef} className={s.dialog} aria-labelledby="cart-title">
        <h2 id="cart-title">سلتك</h2>
        <ul>{items.map(p => <li key={p.id}>{p.name} × {cart[p.id]}</li>)}</ul>
        <button onClick={() => dialogRef.current.close()}>اغلق</button>
      </dialog>
    </>
  )
}
