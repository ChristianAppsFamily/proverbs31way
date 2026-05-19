import { authRouter } from "./auth-router";
import { gardenRouter } from "./garden-router";
import { roomRouter } from "./room-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  garden: gardenRouter,
  room: roomRouter,
});

export type AppRouter = typeof appRouter;
