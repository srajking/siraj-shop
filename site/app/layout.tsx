import type { Metadata } from "next";
import Link from "next/link";
import CartCount from "./CartCount";
import WebVitals from "./WebVitals";
import "./globals.css";

import { env } from "@/lib/env";

// the real address of the shop, from the environment
export const SITE = env.SITE_URL;

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
        <WebVitals />
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
