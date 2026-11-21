import Shelf from './Shelf.tsx'
import type { Product } from '../types.ts'

export default function ProductList({ products }: { products: Product[] }) {
  const inStock = products.filter(p => p.stock > 0)
  const soldOut = products.filter(p => p.stock === 0)
  return (
    <>
      <Shelf title="متوفر الآن" products={inStock} />
      <Shelf title="نفد" products={soldOut} />
    </>
  )
}
