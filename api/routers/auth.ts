import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, protectedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { providers } from "@db/schema";
import {
  verifyPassword,
  signSession,
  buildSessionCookie,
  buildClearCookie,
} from "../lib/auth";

export const authRouter = createRouter({
  /** Authenticate with login + password, set the session cookie. */
  login: publicQuery
    .input(
      z.object({
        login: z.string().min(1, "Введите логин"),
        password: z.string().min(1, "Введите пароль"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(providers)
        .where(eq(providers.login, input.login.trim().toLowerCase()))
        .limit(1);
      const row = rows[0];

      if (!row || row.isActive !== 1 || !verifyPassword(input.password, row.passwordHash)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный логин или пароль",
        });
      }

      await db
        .update(providers)
        .set({ lastLoginAt: new Date() })
        .where(eq(providers.id, row.id));

      const token = signSession(row.id);
      ctx.resHeaders.append("Set-Cookie", buildSessionCookie(token));

      return {
        success: true,
        provider: {
          id: row.id,
          login: row.login,
          name: row.name,
          company: row.company,
          phone: row.phone,
          email: row.email,
          role: row.role,
        },
      };
    }),

  /** Return the currently authenticated provider, or null. */
  me: publicQuery.query(({ ctx }) => {
    return { provider: ctx.provider };
  }),

  /** Clear the session cookie. */
  logout: publicQuery.mutation(({ ctx }) => {
    ctx.resHeaders.append("Set-Cookie", buildClearCookie());
    return { success: true };
  }),

  /** Example of a provider-only endpoint (full profile). */
  profile: protectedQuery.query(({ ctx }) => {
    return { provider: ctx.provider };
  }),
});
