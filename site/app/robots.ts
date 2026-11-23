import type { MetadataRoute } from "next";
import { SITE } from "./layout";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/login", "/revalidate", "/api/"] }, sitemap: `${SITE}/sitemap.xml` };
}
