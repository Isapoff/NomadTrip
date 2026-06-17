import { createRouter, publicQuery } from "./middleware";
import { routesRouter } from "./routers/routes";
import { objectsRouter } from "./routers/objects";
import { guesthousesRouter } from "./routers/guesthouses";
import { bookingRouter } from "./routers/booking";
import { analyticsRouter } from "./routers/analytics";
import { authRouter } from "./routers/auth";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  routes: routesRouter,
  objects: objectsRouter,
  guesthouses: guesthousesRouter,
  booking: bookingRouter,
  analytics: analyticsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
