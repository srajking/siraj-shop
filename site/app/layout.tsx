import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siraj Shop",
  description: "Notebooks, pens and bags — Siraj Shop",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
