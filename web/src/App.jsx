import { useState } from 'react'
import Header from './components/Header.jsx'
import ProductList from './components/ProductList.jsx'
import Reviews from './components/Reviews.jsx'
import { products } from './products.js'

export default function App() {
  const [cart, setCart] = useState({})          // { productId: qty }

  function add(product, n) {
    setCart(c => ({ ...c, [product.id]: Math.min((c[product.id] ?? 0) + n, product.stock) }))
  }
  const count = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = products.reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0)

  return (
    <main dir="rtl">
      <Header count={count} total={total} onClear={() => setCart({})} />
      <ProductList products={products} cart={cart} onAdd={add} />
      <Reviews />
    </main>
  )
}
