import { revalidateTag } from "next/cache";

const SECRET = "dev-secret"; // moves to an environment variable in chapter 18

// the shop admin calls this after changing a product: POST /revalidate?id=1
export async function POST(req: Request) {
  if (req.headers.get("x-secret") !== SECRET) return Response.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const tag = id ? `product-${id}` : "products";
  revalidateTag(tag, "max");
  return Response.json({ revalidated: tag });
}
