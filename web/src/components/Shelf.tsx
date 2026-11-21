import ProductCard from './ProductCard.tsx'
import { useCart } from '../useCart.ts'
import s from './ProductList.module.css'
import type { Product } from '../types.ts'

interface ShelfProps {
  title: string
  products: Product[]
}

export default function Shelf({ title, products }: ShelfProps) {
  const cart = useCart()                                       // the shelf reads the cart, once
  return (
    <>
      <h2>{title}</h2>
      <section className={s.list}>
        {products.map(p => <ProductCard key={p.id} product={p} qty={cart[p.id] ?? 0} />)}
      </section>
    </>
  )
}
