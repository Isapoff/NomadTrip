import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { analytics, routes, objects, guesthouses } from "@db/schema";

export const analyticsRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const allRoutes = await db.select().from(routes);
    const allObjects = await db.select().from(objects);
    const allGuesthouses = await db.select().from(guesthouses);

    const routesByRegion: Record<string, number> = {};
    for (const r of allRoutes) {
      routesByRegion[r.region] = (routesByRegion[r.region] || 0) + 1;
    }

    const avgRating =
      allRoutes.reduce((s, r) => s + (r.rating || 0), 0) / (allRoutes.length || 1);

    const requestsToday = 47;
    const requestsMonth = 312;
    const conversionRate = 25;
    const activeTours = 8;

    const allAnalytics = await db.select().from(analytics);

    return {
      totalRoutes: allRoutes.length,
      totalObjects: allObjects.length,
      totalGuesthouses: allGuesthouses.length,
      routesByRegion,
      avgCriteria: Math.round(avgRating * 10) / 10,
      conversionRate,
      requestsToday,
      requestsMonth,
      activeTours,
      analytics: allAnalytics,
    };
  }),

  chart: publicQuery
    .input(
      z.object({
        category: z.string(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const all = await db.select().from(analytics);
      if (!input?.category) return all;
      return all.filter((a) => a.category === input.category);
    }),
});
