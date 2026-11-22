import Link from "next/link";
import { notFound } from "next/navigation";
import products from "../../../../server/data/products.json";
import AddToCart from "./AddToCart";

// one HTML file per product, written at build time
export function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }));
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = products.find((p) => String(p.id) === id);
  if (!product) notFound();
  const others = products.filter((p) => p.id !== product.id);

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString("en")} IQD · {product.stock} in stock</p>
      <AddToCart stock={product.stock} />
      <h3>More products</h3>
      <ul>
        {others.map((p) => (
          <li key={p.id}><Link href={`/products/${p.id}`}>{p.name}</Link></li>
        ))}
      </ul>
    </main>
  );
}
