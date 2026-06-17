import { z } from "zod";
import { createRouter, publicQuery, protectedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { routes, objects, guesthouses } from "@db/schema";
import { eq, like, and, or } from "drizzle-orm";
import { runWSM, detectProfile } from "../lib/wsm";
import type { WSMRequest } from "../lib/wsm";

// Shape for create/update of a route. Scores (1–10) drive the WSM matching,
// objectIds (comma-separated, e.g. "O1,O9") links the route to map objects,
// startLat/startLng position it on the map.
const routeInput = z.object({
  routeId: z.string().min(1),
  name: z.string().min(1),
  nameShort: z.string().optional(),
  region: z.string().min(1),
  type: z.string().min(1),
  durationDays: z.number().int().min(1).max(60),
  budgetPerDay: z.number().int().min(0),
  difficulty: z.number().int().min(1).max(10),
  rating: z.number().min(0).max(5).optional(),
  season: z.string().min(1),
  transport: z.string().min(1),
  groupType: z.string().min(1),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  natureScore: z.number().int().min(1).max(10),
  cultureScore: z.number().int().min(1).max(10),
  comfortScore: z.number().int().min(1).max(10),
  adventureScore: z.number().int().min(1).max(10),
  costScore: z.number().int().min(1).max(10),
  profileMatch: z.string().optional(),
  imageUrl: z.string().optional(),
  objectIds: z.string().optional(),
  startLat: z.number().optional(),
  startLng: z.number().optional(),
  featured: z.number().int().min(0).max(1).optional(),
});

export const routesRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        region: z.string().optional(),
        profile: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.region && input.region !== "Все") {
        conditions.push(eq(routes.region, input.region));
      }
      if (input?.profile && input.profile !== "Все") {
        conditions.push(like(routes.profileMatch, `%${input.profile}%`));
      }
      if (input?.search) {
        conditions.push(
          or(
            like(routes.name, `%${input.search}%`),
            like(routes.region, `%${input.search}%`),
            like(routes.type, `%${input.search}%`)
          )
        );
      }

      const results =
        conditions.length > 0
          ? await db.select().from(routes).where(and(...conditions))
          : await db.select().from(routes);

      return results;
    }),

  byId: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const routeRows = await db.select().from(routes).where(eq(routes.routeId, input.id)).limit(1);
      if (routeRows.length === 0) return null;

      const route = routeRows[0];
      const objectIds = route.objectIds?.split(",") || [];
      const routeObjects = [];
      for (const oid of objectIds) {
        const objRows = await db.select().from(objects).where(eq(objects.objectId, oid.trim())).limit(1);
        if (objRows.length > 0) routeObjects.push(objRows[0]);
      }

      const nearbyGh = await db
        .select()
        .from(guesthouses)
        .where(eq(guesthouses.region, route.region))
        .limit(3);

      return { route, objects: routeObjects, guesthouses: nearbyGh };
    }),

  recommend: publicQuery
    .input(
      z.object({
        budgetDay: z.number().min(500).max(30000),
        days: z.number().min(1).max(21),
        season: z.string(),
        group: z.string(),
        fitness: z.number().min(1).max(5),
        goal: z.string(),
        regions: z.array(z.string()),
        wNature: z.number().min(1).max(5),
        wCulture: z.number().min(1).max(5),
        wComfort: z.number().min(1).max(5),
        wCost: z.number().min(1).max(5),
        wAdventure: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const allRoutes = await db.select().from(routes);

      const req: WSMRequest = {
        budgetDay: input.budgetDay,
        days: input.days,
        season: input.season,
        group: input.group,
        fitness: input.fitness,
        goal: input.goal,
        regions: input.regions.length > 0 ? input.regions : ["Все"],
        wNature: input.wNature,
        wCulture: input.wCulture,
        wComfort: input.wComfort,
        wCost: input.wCost,
        wAdventure: input.wAdventure,
      };

      const profile = detectProfile(req);
      const results = runWSM(allRoutes, req);
      const totalFound = results.length;

      const profileInfo: Record<string, { name: string; emoji: string; description: string }> = {
        "Экотурист": { name: "Экотурист", emoji: "🌿", description: "Природа, экология, уединение" },
        "Культурный": { name: "Культурный", emoji: "🏛", description: "История, традиции, кухня" },
        "Adventure": { name: "Adventure-seeker", emoji: "🏔", description: "Треккинг, рафтинг, горы" },
        "Семейный": { name: "Семейный", emoji: "👨‍👩‍👧", description: "Комфорт, безопасность, дети" },
        "Бюджетный": { name: "Бюджетный", emoji: "💰", description: "Максимум за минимум" },
      };

      return {
        profile,
        profileInfo: profileInfo[profile] || profileInfo["Adventure"],
        totalFound,
        results,
      };
    }),

  types: publicQuery.query(async () => {
    const typeEmojis: Record<string, string> = {
      "Треккинг": "🏔",
      "Горнолыжный": "⛷",
      "Водный": "🌊",
      "Оздоровительный": "💆",
      "Историко-культурный": "🏛",
      "Экотуризм": "🌿",
      "Городской": "🏙",
      "Конный": "🐴",
      "Альпинизм": "🧗",
      "Рафтинг": "🚣",
      "Гастрономический": "🍽",
      "Этнокультурный": "🎭",
      "Пляжно-экскурсионный": "🏖",
      "Автотур": "🚗",
      "Комбинированный": "🗺",
      "Паломнический": "🕌",
      "Спортивный": "🏋",
      "Бюджетный": "💰",
    };
    return typeEmojis;
  }),

  // ── Admin CRUD (provider login required) ──────────────────────
  create: protectedMutation
    .input(routeInput)
    .mutation(async ({ input }) => {
      const db = getDb();
      const exists = await db
        .select({ id: routes.id })
        .from(routes)
        .where(eq(routes.routeId, input.routeId))
        .limit(1);
      if (exists.length > 0) {
        return { success: false, error: `Маршрут с ID ${input.routeId} уже существует` };
      }
      await db.insert(routes).values({
        ...input,
        nameShort: input.nameShort ?? input.name,
        longDescription: input.longDescription ?? input.description,
        rating: input.rating ?? 0,
        featured: input.featured ?? 0,
      });
      return { success: true, routeId: input.routeId };
    }),

  update: protectedMutation
    .input(routeInput.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rest } = input;
      // Only update fields that were actually provided — never clobber
      // existing values (e.g. featured) with undefined.
      const values = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined),
      );
      await db.update(routes).set(values).where(eq(routes.id, id));
      return { success: true, routeId: input.routeId };
    }),

  remove: protectedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(routes).where(eq(routes.id, input.id));
      return { success: true };
    }),
});
