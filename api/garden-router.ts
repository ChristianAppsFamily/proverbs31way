import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  dailyContent,
  gardenComments,
  gardenReactions,
  readingStreaks,
  subscriptions,
  users,
} from "@db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

function toDateInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const gardenRouter = createRouter({
  /* ── Get content for a specific date ── */
  getContentByDate: publicQuery
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ input }) => {
      const dateStr = input.date ?? toDateInput(new Date());
      const db = getDb();
      const rows = await db
        .select()
        .from(dailyContent)
        .where(eq(dailyContent.publishDate, dateStr))
        .limit(1);
      return rows[0] ?? null;
    }),

  /* ── Get content for a week (date sidebar) ── */
  getWeekContent: publicQuery
    .input(z.object({ endDate: z.string().optional() }))
    .query(async ({ input }) => {
      const end = input.endDate ?? toDateInput(new Date());
      const endObj = new Date(end);
      const startObj = new Date(endObj);
      startObj.setDate(startObj.getDate() - 6);
      const start = toDateInput(startObj);

      const db = getDb();
      const rows = await db
        .select({
          id: dailyContent.id,
          reference: dailyContent.reference,
          publishDate: dailyContent.publishDate,
        })
        .from(dailyContent)
        .where(
          and(
            gte(dailyContent.publishDate, start),
            lte(dailyContent.publishDate, end)
          )
        )
        .orderBy(dailyContent.publishDate);

      return rows;
    }),

  /* ── List comments for a content item ── */
  listComments: publicQuery
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({
          id: gardenComments.id,
          body: gardenComments.body,
          createdAt: gardenComments.createdAt,
          userName: users.name,
        })
        .from(gardenComments)
        .leftJoin(users, eq(gardenComments.userId, users.id))
        .where(eq(gardenComments.contentId, input.contentId))
        .orderBy(gardenComments.createdAt);
      return rows;
    }),

  /* ── Create a comment (authed) ── */
  createComment: authedQuery
    .input(
      z.object({
        contentId: z.number(),
        body: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(gardenComments).values({
        userId: ctx.user.id,
        contentId: input.contentId,
        body: input.body,
      });
      return { success: true };
    }),

  /* ── Get reaction counts for a content item ── */
  getReactionCounts: publicQuery
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({
          reactionType: gardenReactions.reactionType,
          count: gardenReactions.id,
        })
        .from(gardenReactions)
        .where(eq(gardenReactions.contentId, input.contentId))
        .groupBy(gardenReactions.reactionType);

      const counts: Record<string, number> = { heart: 0, needed: 0, praying: 0 };
      for (const row of rows) {
        counts[row.reactionType] = (counts[row.reactionType] ?? 0) + 1;
      }
      return counts;
    }),

  /* ── Create a reaction (authed) ── */
  createReaction: authedQuery
    .input(
      z.object({
        contentId: z.number(),
        reactionType: z.enum(["heart", "needed", "praying"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(gardenReactions).values({
        userId: ctx.user.id,
        contentId: input.contentId,
        reactionType: input.reactionType,
      });
      return { success: true };
    }),

  /* ── Get reading streak (authed) ── */
  getReadingStreak: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(readingStreaks)
      .where(eq(readingStreaks.userId, ctx.user.id))
      .limit(1);
    return rows[0] ?? null;
  }),

  /* ── Update reading streak (authed) ── */
  updateReadingStreak: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const today = toDateInput(new Date());
    const existing = await db
      .select()
      .from(readingStreaks)
      .where(eq(readingStreaks.userId, ctx.user.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(readingStreaks).values({
        userId: ctx.user.id,
        currentStreak: 1,
        lastVisitDate: today,
      });
      return { currentStreak: 1 };
    }

    const last = existing[0];
    const lastDate = new Date(last.lastVisitDate);
    const todayDate = new Date(today);
    const diffMs = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { currentStreak: last.currentStreak };
    } else if (diffDays === 1) {
      const newStreak = last.currentStreak + 1;
      await db
        .update(readingStreaks)
        .set({ currentStreak: newStreak, lastVisitDate: today })
        .where(eq(readingStreaks.userId, ctx.user.id));
      return { currentStreak: newStreak };
    } else {
      await db
        .update(readingStreaks)
        .set({ currentStreak: 1, lastVisitDate: today })
        .where(eq(readingStreaks.userId, ctx.user.id));
      return { currentStreak: 1 };
    }
  }),

  /* ── Get user subscription tier (authed) ── */
  getSubscription: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);
    return rows[0] ?? null;
  }),

  /* ── Comment count (for pulse dot) ── */
  commentCount: publicQuery
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({ count: gardenComments.id })
        .from(gardenComments)
        .where(eq(gardenComments.contentId, input.contentId));
      return rows.length;
    }),
});
