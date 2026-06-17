import "dotenv/config";
import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { providers } from "./schema";
import { hashPassword } from "../api/lib/auth";

/**
 * Seeds the provider admin accounts.
 * Run with:  npm run db:seed:providers
 *
 * Default accounts (change the passwords in production!):
 *   login: admin   password: nomad2025   (role: admin)
 *   login: demo    password: demo1234     (role: provider)
 */
const SEED_PROVIDERS = [
  {
    login: "admin",
    password: "nomad2025",
    name: "Администратор",
    company: "NOMADTRIP",
    phone: "+996700000000",
    email: "admin@nomadtrip.kg",
    role: "admin",
  },
  {
    login: "demo",
    password: "demo1234",
    name: "Демо Провайдер",
    company: "Demo Tours",
    phone: "+996555111222",
    email: "demo@nomadtrip.kg",
    role: "provider",
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const db = getDb();

  for (const p of SEED_PROVIDERS) {
    const existing = await db
      .select()
      .from(providers)
      .where(eq(providers.login, p.login))
      .limit(1);

    const values = {
      login: p.login.toLowerCase(),
      passwordHash: hashPassword(p.password),
      name: p.name,
      company: p.company,
      phone: p.phone,
      email: p.email,
      role: p.role,
      isActive: 1,
    };

    if (existing[0]) {
      await db
        .update(providers)
        .set(values)
        .where(eq(providers.id, existing[0].id));
      console.log(`updated provider: ${p.login}`);
    } else {
      await db.insert(providers).values(values);
      console.log(`created provider: ${p.login} (password: ${p.password})`);
    }
  }

  console.log("\nProvider accounts ready.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
