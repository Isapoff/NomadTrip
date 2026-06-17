import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

/**
 * Requires a valid provider session. Narrows ctx.provider to non-null
 * for downstream resolvers.
 */
const requireProvider = t.middleware(({ ctx, next }) => {
  if (!ctx.provider) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Требуется вход в кабинет провайдера",
    });
  }
  return next({ ctx: { ...ctx, provider: ctx.provider } });
});

export const protectedQuery = t.procedure.use(requireProvider);
export const protectedMutation = t.procedure.use(requireProvider);
