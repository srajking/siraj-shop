import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section>
      <h2>الصفحة غير موجودة</h2>
      <p><Link to="/">ارجع الى كل المنتجات</Link></p>
    </section>
  )
}
