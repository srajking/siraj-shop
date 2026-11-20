import ProductCard from './ProductCard.jsx'
import s from './ProductList.module.css'

export default function Shelf({ title, products }) {
  return (
    <>
      <h2>{title}</h2>
      <section className={s.list}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </section>
    </>
  )
}
