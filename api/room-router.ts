import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { roomComments, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const roomRouter = createRouter({
  /* ── List comments for a room ── */
  listComments: publicQuery
    .input(z.object({ roomSlug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({
          id: roomComments.id,
          body: roomComments.body,
          createdAt: roomComments.createdAt,
          userName: users.name,
        })
        .from(roomComments)
        .leftJoin(users, eq(roomComments.userId, users.id))
        .where(eq(roomComments.roomSlug, input.roomSlug))
        .orderBy(roomComments.createdAt);
      return rows;
    }),

  /* ── Create a comment (authed) ── */
  createComment: authedQuery
    .input(
      z.object({
        roomSlug: z.string(),
        body: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(roomComments).values({
        roomSlug: input.roomSlug,
        userId: ctx.user.id,
        body: input.body,
      });
      return { success: true };
    }),
});
