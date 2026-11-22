import products from "../../server/data/products.json";

// the home page — rendered on the server, so the products are in the HTML
export default function Home() {
  return (
    <main>
      <h1>Products</h1>
      <ul className="grid">
        {products.map((p) => (
          <li key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.price.toLocaleString("en")} IQD</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
