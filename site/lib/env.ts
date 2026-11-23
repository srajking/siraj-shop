import * as z from "zod";

// every setting the shop reads, checked once when the server starts.
// A missing or weak one stops the server and says its name — instead of failing later, quietly.
const Env = z.object({
  SHOP_API: z.url().default("http://localhost:4000/api"),
  SITE_URL: z.url().default("http://localhost:3000"),
  SESSION_SECRET: z.string().min(32, "at least 32 characters"),
  REVALIDATE_SECRET: z.string().min(16, "at least 16 characters"),
});

const parsed = Env.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
  throw new Error(`The shop cannot start — fix these environment variables:\n${lines.join("\n")}`);
}
export const env = parsed.data;
