import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/shop";
import AddToCart from "./AddToCart";
import Reviews from "./Reviews";
import ReviewArea from "./ReviewArea";

// build these shells ahead of time — the reviews still stream in on every visit
export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: String(p.id) }));
}

// the title a search result and a shared link show — from the same cached product
export async function generateMetadata({ params }: PageProps<"/products/[id]">, parent: ResolvingMetadata): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return { title: "Not found" };
  const description = `${product.name} — ${product.price.toLocaleString("en")} IQD at Siraj Shop`;
  // openGraph here REPLACES the layout's — so carry its picture over
  const images = (await parent).openGraph?.images ?? [];
  return { title: product.name, description, openGraph: { title: product.name, description, images } };
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
      <AddToCart id={product.id} stock={product.stock} />
      <Suspense fallback={<p className="wait">Loading reviews…</p>}>
        <Reviews id={id} />
      </Suspense>
      <Suspense fallback={null}>
        <ReviewArea productId={id} />
      </Suspense>
      <h3>More products</h3>
      <ul>
        {others.map((p) => (
          <li key={p.id}><Link href={`/products/${p.id}`}>{p.name}</Link></li>
        ))}
      </ul>
    </main>
  );
}
