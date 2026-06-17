import { z } from "zod";
import { createRouter, publicQuery, protectedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { guesthouses, kgstdCriteria } from "@db/schema";
import { eq } from "drizzle-orm";

const guesthouseInput = z.object({
  ghId: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  type: z.string().min(1),
  typeColor: z.string().optional(),
  description: z.string().optional(),
  pricePerNight: z.number().int().min(0).default(0),
  season: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  facilities: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  imageUrl: z.string().optional(),
  phone: z.string().optional(),
});

export const guesthousesRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        type: z.string().optional(),
        region: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const all = await db.select().from(guesthouses);

      if (!input) return all;

      return all.filter((gh) => {
        if (input.type && gh.type !== input.type) return false;
        if (input.region && gh.region !== input.region && input.region !== "Все") return false;
        return true;
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(guesthouses).where(eq(guesthouses.ghId, input.id)).limit(1);
      return rows[0] || null;
    }),

  kgstdCriteria: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(kgstdCriteria);
  }),

  updateKgstd: publicQuery
    .input(
      z.object({
        ghId: z.string(),
        answers: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(guesthouses).where(eq(guesthouses.ghId, input.ghId)).limit(1);
      if (rows.length === 0) return { success: false, error: "Guesthouse not found" };

      let score = 0;
      let max = 54; // 27 * 2
      for (const [, val] of Object.entries(input.answers)) {
        if (val === "yes") score += 2;
        else if (val === "partial") score += 1;
      }
      const pct = max > 0 ? (score / max) * 100 : 0;
      let stars = 0;
      if (pct >= 90) stars = 3;
      else if (pct >= 70) stars = 2;
      else if (pct >= 50) stars = 1;

      const starColors: Record<number, string> = {
        3: "#2D5A3D",
        2: "#C9973A",
        1: "#8B6020",
        0: "#8B2020",
      };

      await db
        .update(guesthouses)
        .set({
          kgstdScore: score,
          kgstdPct: Math.round(pct * 10) / 10,
          kgstdStars: stars,
          kgstdAnswers: JSON.stringify(input.answers),
        })
        .where(eq(guesthouses.ghId, input.ghId));

      return {
        success: true,
        score,
        pct: Math.round(pct * 10) / 10,
        stars,
        starColor: starColors[stars],
      };
    }),

  // ── Admin CRUD (provider login required) ──────────────────────
  create: protectedMutation
    .input(guesthouseInput)
    .mutation(async ({ input }) => {
      const db = getDb();
      const exists = await db
        .select({ id: guesthouses.id })
        .from(guesthouses)
        .where(eq(guesthouses.ghId, input.ghId))
        .limit(1);
      if (exists.length > 0) {
        return { success: false, error: `Жильё с ID ${input.ghId} уже существует` };
      }
      await db.insert(guesthouses).values(input);
      return { success: true, ghId: input.ghId };
    }),

  update: protectedMutation
    .input(guesthouseInput.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...values } = input;
      await db.update(guesthouses).set(values).where(eq(guesthouses.id, id));
      return { success: true, ghId: input.ghId };
    }),

  remove: protectedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(guesthouses).where(eq(guesthouses.id, input.id));
      return { success: true };
    }),
});
