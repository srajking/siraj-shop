function iqd(n) {
  return n.toLocaleString('en-US') + ' IQD'
}

export default function ProductCard({ product }) {
  return (
    <article>
      <img src={`/img/${product.img}-400.jpg`} alt={product.alt} width={240} height={180} />
      <h3>{product.name}</h3>
      <p>{product.desc}</p>
      <p><bdi lang="en">{iqd(product.price)}</bdi></p>
      {product.stock > 0 ? <p>متوفر: {product.stock}</p> : <p>نفد</p>}
    </article>
  )
}
