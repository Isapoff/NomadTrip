import { z } from "zod";
import { createRouter, publicQuery, protectedQuery, protectedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { bookings } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const STATUSES = ["new", "progress", "confirmed", "closed", "cancelled"] as const;

export const bookingRouter = createRouter({
  // ── Public: создание заявки с публичного сайта ────────────────
  create: publicQuery
    .input(
      z.object({
        routeId: z.string(),
        routeName: z.string().optional(),
        name: z.string().min(1),
        phone: z.string().min(1),
        date: z.string().optional(),
        pax: z.number().min(1).max(20).default(1),
        comment: z.string().optional(),
        total: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const bookingId = `BK${Date.now().toString(36).toUpperCase()}`;

      const text = `Заявка на тур NOMADTRIP
Маршрут: ${input.routeName || input.routeId}
Имя: ${input.name}
Телефон: ${input.phone}
Дата: ${input.date || "не указана"}
Кол-во человек: ${input.pax}
Итого: ${input.total || 0} сом
Комментарий: ${input.comment || "-"}`;

      const whatsappUrl = `https://wa.me/996700000000?text=${encodeURIComponent(text)}`;

      await db.insert(bookings).values({
        bookingId,
        routeId: input.routeId,
        routeName: input.routeName || input.routeId,
        name: input.name,
        phone: input.phone,
        date: input.date,
        pax: input.pax,
        comment: input.comment,
        total: input.total,
        whatsappUrl,
        status: "new",
      });

      return {
        success: true,
        bookingId,
        total: input.total || 0,
        whatsappUrl,
        message: "Заявка успешно создана",
      };
    }),

  // ── Кабинет провайдера: список всех заявок ────────────────────
  list: protectedQuery
    .input(
      z.object({ status: z.enum(STATUSES).optional() }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      if (input?.status) return rows.filter((b) => b.status === input.status);
      return rows;
    }),

  // ── Кабинет: сводка по статусам ───────────────────────────────
  stats: protectedQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(bookings);
    const by = (s: string) => rows.filter((b) => b.status === s).length;
    return {
      total: rows.length,
      new: by("new"),
      progress: by("progress"),
      confirmed: by("confirmed"),
      closed: by("closed"),
      cancelled: by("cancelled"),
      revenue: rows
        .filter((b) => b.status === "confirmed" || b.status === "closed")
        .reduce((sum, b) => sum + (b.total || 0), 0),
    };
  }),

  // ── Кабинет: смена статуса ────────────────────────────────────
  setStatus: protectedMutation
    .input(z.object({ id: z.number(), status: z.enum(STATUSES) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(bookings).set({ status: input.status }).where(eq(bookings.id, input.id));
      return { success: true };
    }),

  // ── Кабинет: редактирование заявки ────────────────────────────
  update: protectedMutation
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        phone: z.string().min(1),
        date: z.string().optional(),
        pax: z.number().min(1).max(50),
        total: z.number().optional(),
        comment: z.string().optional(),
        status: z.enum(STATUSES),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rest } = input;
      const values = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined),
      );
      await db.update(bookings).set(values).where(eq(bookings.id, id));
      return { success: true };
    }),

  // ── Кабинет: удаление заявки ──────────────────────────────────
  remove: protectedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(bookings).where(eq(bookings.id, input.id));
      return { success: true };
    }),
});
