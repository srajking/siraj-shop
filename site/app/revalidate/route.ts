import { revalidateTag } from "next/cache";

const API = "http://localhost:4000/api";
const SECRET = "dev-secret"; // moves to an environment variable in chapter 18

// the shop admin calls this after changing a product: POST /revalidate?id=1
// a mistake must come back as a mistake — not as a quiet "revalidated"
export async function POST(req: Request) {
  if (req.headers.get("x-secret") !== SECRET) return Response.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (id === null) {
    revalidateTag("products", "max");
    return Response.json({ revalidated: "products" });
  }
  if (!/^\d+$/.test(id)) return Response.json({ error: "id must be a number" }, { status: 400 });
  // ask the API itself, not the cache: a product added a minute ago must count
  const found = await fetch(`${API}/products/${id}`);
  if (found.status === 404) return Response.json({ error: `no product ${id}` }, { status: 404 });
  revalidateTag(`product-${id}`, "max");
  return Response.json({ revalidated: `product-${id}` });
}
