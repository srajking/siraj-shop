import { cache } from "react";
import { cookies } from "next/headers";
import { decode } from "./session";

// "who is this?" — answered once per request, wherever it is asked
export const getSession = cache(async () => decode((await cookies()).get("session")?.value));
