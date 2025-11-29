import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Analyses table - stores all text analysis results
 */
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  text: text("text").notNull(),
  language: varchar("language", { length: 10 }).notNull(), // 'no' or 'en'
  score: int("score").notNull(), // 0-100
  suggestions: text("suggestions"), // JSON array of improvement suggestions
  buzzwords: text("buzzwords"), // JSON array of detected buzzwords
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Buzzwords table - tracks frequency of detected buzzwords across all analyses
 */
export const buzzwords = mysqlTable("buzzwords", {
  id: int("id").autoincrement().primaryKey(),
  word: varchar("word", { length: 255 }).notNull(),
  count: int("count").default(0).notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  wordLanguageIdx: uniqueIndex("word_language_idx").on(table.word, table.language),
}));

export type Buzzword = typeof buzzwords.$inferSelect;
export type InsertBuzzword = typeof buzzwords.$inferInsert;