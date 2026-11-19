import s from './Header.module.css'

export default function Header() {
  return (
    <header className={s.header}>
      <h1 className={s.title}>متجر سراج</h1>
      <p>دفاتر واقلام وحقائب</p>
    </header>
  )
}
