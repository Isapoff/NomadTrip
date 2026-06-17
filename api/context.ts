import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { providers } from "@db/schema";
import { parseCookies, verifySession, SESSION_COOKIE } from "./lib/auth";

export type AuthedProvider = {
  id: number;
  login: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  role: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  provider: AuthedProvider | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  let provider: AuthedProvider | null = null;

  try {
    const cookies = parseCookies(opts.req.headers.get("cookie"));
    const payload = verifySession(cookies[SESSION_COOKIE]);
    if (payload) {
      const db = getDb();
      const rows = await db
        .select()
        .from(providers)
        .where(eq(providers.id, payload.pid))
        .limit(1);
      const row = rows[0];
      if (row && row.isActive === 1) {
        provider = {
          id: row.id,
          login: row.login,
          name: row.name,
          company: row.company,
          phone: row.phone,
          email: row.email,
          role: row.role,
        };
      }
    }
  } catch {
    // If the DB is unreachable we simply treat the request as anonymous.
    provider = null;
  }

  return { req: opts.req, resHeaders: opts.resHeaders, provider };
}
