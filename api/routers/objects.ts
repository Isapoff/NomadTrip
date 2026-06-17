import { z } from "zod";
import { createRouter, publicQuery, protectedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { objects } from "@db/schema";
import { eq } from "drizzle-orm";

// lat/lng are required so the object appears on the map.
const objectInput = z.object({
  objectId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  region: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().min(0).default(0),
  currency: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  season: z.string().optional(),
});

export const objectsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        region: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const all = await db.select().from(objects);

      if (!input) return all;

      return all.filter((o) => {
        if (input.category && !o.category?.toLowerCase().includes(input.category.toLowerCase())) return false;
        if (input.region && o.region !== input.region && input.region !== "Все") return false;
        return true;
      });
    }),

  categories: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(objects);
    const cats = [...new Set(all.map((o) => o.category))];
    return cats;
  }),

  // ── Admin CRUD (provider login required) ──────────────────────
  create: protectedMutation
    .input(objectInput)
    .mutation(async ({ input }) => {
      const db = getDb();
      const exists = await db
        .select({ id: objects.id })
        .from(objects)
        .where(eq(objects.objectId, input.objectId))
        .limit(1);
      if (exists.length > 0) {
        return { success: false, error: `Объект с ID ${input.objectId} уже существует` };
      }
      await db.insert(objects).values(input);
      return { success: true, objectId: input.objectId };
    }),

  update: protectedMutation
    .input(objectInput.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...values } = input;
      await db.update(objects).set(values).where(eq(objects.id, id));
      return { success: true, objectId: input.objectId };
    }),

  remove: protectedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(objects).where(eq(objects.id, input.id));
      return { success: true };
    }),
});
