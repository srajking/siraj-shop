import * as z from "zod";

// kept in memory for now — enough to watch one server; a database would keep it across restarts
const seen: { name: string; value: number; page: string }[] = [];
const Vital = z.object({
  name: z.enum(["TTFB", "FCP", "LCP", "CLS", "INP"]),
  value: z.number().min(0).max(60_000),
  page: z.string().regex(/^\/[\w/-]*$/).max(100),
});

export async function POST(req: Request) {
  const input = Vital.safeParse(await req.json().catch(() => null)); // a stranger's body: check it (chapter 11)
  if (!input.success) return new Response(null, { status: 400 });
  seen.push(input.data);
  return new Response(null, { status: 204 });
}

// GET /api/vitals — the 75th percentile of each metric on each page (the number Google uses)
export async function GET() {
  const groups = Map.groupBy(seen, (v) => `${v.page} ${v.name}`);
  const p75 = [...groups].map(([key, list]) => {
    const sorted = list.map((v) => v.value).sort((a, b) => a - b);
    return { key, count: list.length, p75: Number(sorted[Math.ceil(sorted.length * 0.75) - 1].toFixed(3)) };
  });
  return Response.json(p75.sort((a, b) => a.key.localeCompare(b.key)));
}
