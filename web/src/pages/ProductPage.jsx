import { Link, useParams } from 'react-router'
import ProductCard from '../components/ProductCard.jsx'
import NotFound from './NotFound.jsx'
import { products } from '../products.js'

export default function ProductPage() {
  const { id } = useParams()                                   // a string: "1"
  const product = products.find(p => p.id === Number(id))
  if (!product) return <NotFound />
  const others = products.filter(p => p.id !== product.id)

  return (
    <section>
      <h2>{product.name}</h2>
      <ProductCard product={product} />
      <h3>منتجات اخرى</h3>
      <ul>
        {others.map(p => <li key={p.id}><Link to={`/products/${p.id}`}>{p.name}</Link></li>)}
      </ul>
      <p><Link to="/">كل المنتجات</Link></p>
    </section>
  )
}
