import Link from "next/link";

// unknown URLs and notFound() — in the shop's own look
export default function NotFound() {
  return (
    <main>
      <h1>We could not find that page</h1>
      <p><Link href="/">Back to all products</Link></p>
    </main>
  );
}
