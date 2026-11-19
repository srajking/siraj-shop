import s from './Header.module.css'

function iqd(n) {
  return n.toLocaleString('en-US') + ' IQD'
}

export default function Header({ count, total, onClear }) {
  return (
    <header className={s.header}>
      <h1 className={s.title}>متجر سراج</h1>
      <p>دفاتر واقلام وحقائب</p>
      <p className={s.cart} id="cart">
        السلة: <b id="count">{count}</b> — <bdi lang="en">{iqd(total)}</bdi>
        {count > 0 && <button onClick={onClear}>افرغ السلة</button>}
      </p>
    </header>
  )
}
