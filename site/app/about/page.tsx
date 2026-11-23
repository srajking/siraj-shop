import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Who we are — notebooks, pens and school bags delivered across Iraq" };

// /about — a folder and a page.tsx, nothing else
export default function About() {
  return (
    <main>
      <h1>About Siraj Shop</h1>
      <p>Notebooks, pens and school bags — delivered across Iraq.</p>
    </main>
  );
}
