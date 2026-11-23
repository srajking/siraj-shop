import Link from "next/link";
import { getProducts } from "@/lib/shop";

// the home page — rendered on the server, so the products are in the HTML
export default async function Home() {
  const products = await getProducts();
  return (
    <main>
      <h1>Products</h1>
      <ul className="grid">
        {products.map((p) => (
          <li key={p.id}>
            <h3><Link href={`/products/${p.id}`}>{p.name}</Link></h3>
            <p>{p.price.toLocaleString("en")} IQD</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
