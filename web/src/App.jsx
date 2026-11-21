import { useEffect, useRef } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router'
import Header from './components/Header.jsx'
import ProductList from './components/ProductList.jsx'
import Reviews from './components/Reviews.jsx'
import SearchBox from './components/SearchBox.jsx'
import ProductPage from './pages/ProductPage.jsx'
import NotFound from './pages/NotFound.jsx'
import { CartProvider } from './CartContext.jsx'
import { products } from './products.js'

function Layout() {
  const { pathname } = useLocation()
  const last = useRef(pathname)
  useEffect(() => {                                      // a NEW page: move focus to its heading
    if (last.current === pathname) return                // first load (and StrictMode's 2nd run)
    last.current = pathname
    document.querySelector('[data-page-title]')?.focus()
  }, [pathname])

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
      <title>متجر سراج</title>
      <h2 data-page-title tabIndex={-1}>كل المنتجات</h2>
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
