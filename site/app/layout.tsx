import type { Metadata } from "next";
import Link from "next/link";
import CartCount from "./CartCount";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siraj Shop",
  description: "Notebooks, pens and bags — Siraj Shop",
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
