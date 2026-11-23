import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Siraj Shop — notebooks, pens and bags";

// one share picture for the whole shop, made at build time
export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#1d1d1f", color: "white" }}>
      <div style={{ fontSize: 110, fontWeight: 700 }}>Siraj Shop</div>
      <div style={{ fontSize: 48, opacity: 0.75 }}>Notebooks · pens · bags</div>
    </div>,
    size,
  );
}
