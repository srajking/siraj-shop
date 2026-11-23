import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getReviews } from "@/lib/shop";
import AddToCart from "./AddToCart";

// one HTML file per product, written at build time
export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: String(p.id) }));
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const [product, reviews, all] = await Promise.all([getProduct(id), getReviews(id), getProducts()]);
  if (!product) notFound();
  const others = all.filter((p) => p.id !== product.id);

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString("en")} IQD · {product.stock} in stock</p>
      <AddToCart stock={product.stock} />
      <h3>Reviews ({reviews.length})</h3>
      <ul>{reviews.map((r) => <li key={r.id}>{"★".repeat(r.stars)} {r.text}</li>)}</ul>
      <h3>More products</h3>
      <ul>
        {others.map((p) => (
          <li key={p.id}><Link href={`/products/${p.id}`}>{p.name}</Link></li>
        ))}
      </ul>
    </main>
  );
}
