import ProductCard from './ProductCard.jsx'

export default function ProductList({ products }) {
  return (
    <section>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </section>
  )
}
