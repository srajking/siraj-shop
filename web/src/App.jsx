import { useReducer } from 'react'
import Header from './components/Header.jsx'
import ProductList from './components/ProductList.jsx'
import Reviews from './components/Reviews.jsx'
import { cartReducer } from './cartReducer.js'
import { products } from './products.js'

export default function App() {
  const [cart, dispatch] = useReducer(cartReducer, {})          // { productId: qty }

  const add = (product, n) => dispatch({ type: 'added', id: product.id, n, stock: product.stock })
  const decrease = product => dispatch({ type: 'decreased', id: product.id })
  const count = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = products.reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0)

  return (
    <main dir="rtl">
      <Header count={count} total={total} onClear={() => dispatch({ type: 'cleared' })} />
      <ProductList products={products} cart={cart} onAdd={add} onDecrease={decrease} />
      <Reviews />
    </main>
  )
}
