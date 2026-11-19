import ProductCard from './ProductCard.jsx'
import s from './ProductList.module.css'

export default function ProductList({ products, cart, onAdd }) {
  return (
    <section className={s.list}>
      {products.map(p => <ProductCard key={p.id} product={p} qty={cart[p.id] ?? 0} onAdd={onAdd} />)}
    </section>
  )
}
