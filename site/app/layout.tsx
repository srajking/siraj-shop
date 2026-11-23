import type { Metadata } from "next";
import Link from "next/link";
import CartCount from "./CartCount";
import "./globals.css";

// the real address comes from the environment in chapter 18; until then, this machine
export const SITE = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Siraj Shop", template: "%s · Siraj Shop" }, // every page gives its own %s
  description: "Notebooks, pens and bags — Siraj Shop",
  openGraph: { siteName: "Siraj Shop", type: "website" },
};

// one header for every page — it stays on screen while pages change
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="top">
          <Link href="/" className="brand">Siraj Shop</Link>
          <nav>
            <Link href="/">Products</Link>
            <Link href="/about">About</Link>
            <CartCount />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
