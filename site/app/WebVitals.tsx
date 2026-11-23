"use client";
import { useReportWebVitals } from "next/web-vitals";

// what real visitors feel — LCP, CLS, INP… — sent to our own server, not to a stranger's
export default function WebVitals() {
  useReportWebVitals((m) => {
    const body = JSON.stringify({ name: m.name, value: m.value, page: location.pathname });
    navigator.sendBeacon("/api/vitals", body); // survives the page closing
  });
  return null;
}
