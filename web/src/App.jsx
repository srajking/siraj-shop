import Header from './components/Header.jsx'
import ProductList from './components/ProductList.jsx'
import { products } from './products.js'

export default function App() {
  return (
    <main dir="rtl">
      <Header />
      <ProductList products={products} />
    </main>
  )
}
