import { products } from './products.js'

function iqd(n) {
  return n.toLocaleString('en-US') + ' IQD'
}

function Header() {
  return (
    <header>
      <h1>متجر سراج</h1>
      <p>دفاتر واقلام وحقائب</p>
    </header>
  )
}

export default function App() {
  return (
    <main dir="rtl">
      <Header />
      <section>
        {products.map(p => (
          <article key={p.id}>
            <img src={`/img/${p.img}-400.jpg`} alt={p.alt} width={240} height={180} />
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
            <p><bdi lang="en">{iqd(p.price)}</bdi></p>
            {p.stock > 0 ? <p>متوفر: {p.stock}</p> : <p>نفد</p>}
          </article>
        ))}
      </section>
    </main>
  )
}
