import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shop";
import { SITE } from "./layout";

// /sitemap.xml — every product, so search engines find them without crawling
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: `${SITE}/`, changeFrequency: "daily" },
    { url: `${SITE}/about`, changeFrequency: "monthly" },
    ...products.map((p) => ({ url: `${SITE}/products/${p.id}`, changeFrequency: "weekly" as const })),
  ];
}
