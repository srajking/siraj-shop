import Header from './components/Header.jsx'
import ProductList from './components/ProductList.jsx'
import Reviews from './components/Reviews.jsx'
import SearchBox from './components/SearchBox.jsx'
import { CartProvider } from './CartContext.jsx'
import { products } from './products.js'

export default function App() {
  return (
    <CartProvider>
      <main dir="rtl">
        <Header />
        <SearchBox />
        <ProductList products={products} />
        <Reviews />
      </main>
    </CartProvider>
  )
}
