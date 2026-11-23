import { connection } from "next/server";
import { getLatestReviews } from "@/lib/shop";

// fresh on every visit, and streamed: the product does not wait for it
export default async function Reviews({ id }: { id: string }) {
  await connection();
  const { items, total } = await getLatestReviews(id);
  return (
    <section className="reviews">
      <h3>Reviews ({total})</h3>
      <ul>{items.map((r) => <li key={r.id}>{"★".repeat(r.stars)} {r.text}</li>)}</ul>
    </section>
  );
}
