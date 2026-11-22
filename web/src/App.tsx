import { useEffect, useRef } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router'
import Header from './components/Header.tsx'
import ProductList from './components/ProductList.tsx'
import Reviews from './components/Reviews.tsx'
import SearchBox from './components/SearchBox.tsx'
import ProductPage from './pages/ProductPage.tsx'
import NotFound from './pages/NotFound.tsx'
import { products } from './products.ts'

function Layout() {
  const { pathname } = useLocation()
  const last = useRef(pathname)
  useEffect(() => {                                      // a NEW page: move focus to its heading
    if (last.current === pathname) return                // first load (and StrictMode's 2nd run)
    last.current = pathname
    const title = document.querySelector('[data-page-title]')  // Element | null
    if (title instanceof HTMLElement) title.focus()              // only an HTMLElement has focus()
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
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
