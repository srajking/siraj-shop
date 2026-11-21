import { Link, useParams } from 'react-router'
import ProductCard from '../components/ProductCard.tsx'
import NotFound from './NotFound.tsx'
import { products } from '../products.ts'
import { useCart } from '../useCart.ts'

export default function ProductPage() {
  const { id } = useParams()                                   // a string: "1"
  const cart = useCart()
  const product = products.find(p => p.id === Number(id))
  if (!product) return <NotFound />
  const others = products.filter(p => p.id !== product.id)

  return (
    <section>
      <title>{product.name + ' — متجر سراج'}</title>
      <h2 data-page-title tabIndex={-1}>{product.name}</h2>
      <ProductCard product={product} qty={cart[product.id] ?? 0} />
      <h3>منتجات اخرى</h3>
      <ul>
        {others.map(p => <li key={p.id}><Link to={`/products/${p.id}`}>{p.name}</Link></li>)}
      </ul>
      <p><Link to="/">كل المنتجات</Link></p>
    </section>
  )
}
