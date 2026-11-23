import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/shop";
import AddToCart from "./AddToCart";
import Reviews from "./Reviews";
import ReviewForm from "./ReviewForm";

// build these shells ahead of time — the reviews still stream in on every visit
export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: String(p.id) }));
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const [product, all] = await Promise.all([getProduct(id), getProducts()]);
  if (!product) notFound();
  const others = all.filter((p) => p.id !== product.id);

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString("en")} IQD · {product.stock} in stock</p>
      <AddToCart stock={product.stock} />
      <Suspense fallback={<p className="wait">Loading reviews…</p>}>
        <Reviews id={id} />
      </Suspense>
      <ReviewForm productId={id} />
      <h3>More products</h3>
      <ul>
        {others.map((p) => (
          <li key={p.id}><Link href={`/products/${p.id}`}>{p.name}</Link></li>
        ))}
      </ul>
    </main>
  );
}
