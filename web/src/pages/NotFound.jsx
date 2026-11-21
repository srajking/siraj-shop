import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section>
      <title>غير موجودة — متجر سراج</title>
      <h2 data-page-title tabIndex={-1}>الصفحة غير موجودة</h2>
      <p><Link to="/">ارجع الى كل المنتجات</Link></p>
    </section>
  )
}
