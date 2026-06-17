import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    // Managed MySQL (e.g. DigitalOcean) requires TLS. Set DB_SSL=true to enable.
    // DB_SSL_REJECT_UNAUTHORIZED=true additionally verifies the CA chain.
    const useSsl = process.env.DB_SSL === "true";
    const rejectUnauthorized =
      process.env.DB_SSL_REJECT_UNAUTHORIZED === "true";

    instance = drizzle({
      connection: useSsl
        ? { uri: env.databaseUrl, ssl: { rejectUnauthorized } }
        : { uri: env.databaseUrl },
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}
