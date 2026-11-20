import Shelf from './Shelf.jsx'

export default function ProductList({ products }) {
  const inStock = products.filter(p => p.stock > 0)
  const soldOut = products.filter(p => p.stock === 0)
  return (
    <>
      <Shelf title="متوفر الآن" products={inStock} />
      <Shelf title="نفد" products={soldOut} />
    </>
  )
}
