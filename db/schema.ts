import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  date,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ─── Daily Content, The Garden's scripture + devotional ─── */

export const dailyContent = mysqlTable("daily_content", {
  id: serial("id").primaryKey(),
  verse: text("verse").notNull(),
  reference: varchar("reference", { length: 100 }).notNull(),
  devotional: text("devotional").notNull(),
  reflectionPrompt: text("reflection_prompt").notNull(),
  publishDate: date("publish_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DailyContent = typeof dailyContent.$inferSelect;
export type InsertDailyContent = typeof dailyContent.$inferInsert;

/* ─── Garden Comments ─── */

export const gardenComments = mysqlTable(
  "garden_comments",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .references(() => users.id)
      .notNull(),
    contentId: bigint("content_id", { mode: "number", unsigned: true })
      .references(() => dailyContent.id)
      .notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("comments_content_idx").on(table.contentId),
    index("comments_user_idx").on(table.userId),
  ]
);

export type GardenComment = typeof gardenComments.$inferSelect;
export type InsertGardenComment = typeof gardenComments.$inferInsert;

/* ─── Garden Reactions ─── */

export const gardenReactions = mysqlTable(
  "garden_reactions",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .references(() => users.id)
      .notNull(),
    contentId: bigint("content_id", { mode: "number", unsigned: true })
      .references(() => dailyContent.id)
      .notNull(),
    reactionType: mysqlEnum("reaction_type", ["heart", "needed", "praying"])
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("reactions_content_idx").on(table.contentId),
    index("reactions_user_idx").on(table.userId),
  ]
);

export type GardenReaction = typeof gardenReactions.$inferSelect;
export type InsertGardenReaction = typeof gardenReactions.$inferInsert;

/* ─── Reading Streaks ─── */

export const readingStreaks = mysqlTable("reading_streaks", {
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .references(() => users.id)
    .primaryKey(),
  currentStreak: int("current_streak").notNull().default(0),
  lastVisitDate: date("last_visit_date").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ReadingStreak = typeof readingStreaks.$inferSelect;
export type InsertReadingStreak = typeof readingStreaks.$inferInsert;

/* ─── Subscriptions (freemium) ─── */

export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .references(() => users.id)
    .notNull(),
  tier: mysqlEnum("tier", ["free", "paid"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"])
    .default("active")
    .notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/* ─── Unified Room Comments (all five rooms) ─── */

export const roomComments = mysqlTable(
  "room_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    roomSlug: varchar("room_slug", { length: 20 }).notNull(),
    userId: int("user_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("room_comments_slug_idx").on(table.roomSlug),
    index("room_comments_user_idx").on(table.userId),
  ]
);

export type RoomComment = typeof roomComments.$inferSelect;
export type InsertRoomComment = typeof roomComments.$inferInsert;
