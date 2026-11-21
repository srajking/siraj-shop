import { Routes, Route, Outlet } from 'react-router'
import Header from './components/Header.jsx'
import ProductList from './components/ProductList.jsx'
import Reviews from './components/Reviews.jsx'
import SearchBox from './components/SearchBox.jsx'
import ProductPage from './pages/ProductPage.jsx'
import NotFound from './pages/NotFound.jsx'
import { CartProvider } from './CartContext.jsx'
import { products } from './products.js'

function Layout() {
  return (
    <main dir="rtl">
      <Header />
      <Outlet />
    </main>
  )
}

function Home() {
  return (
    <>
      <SearchBox />
      <ProductList products={products} />
      <Reviews />
    </>
  )
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}
