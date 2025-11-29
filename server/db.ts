import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { analyses, buzzwords, InsertAnalysis, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Analysis queries
export async function saveAnalysis(analysis: InsertAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(analyses).values(analysis);
  return result;
}

export async function getRecentAnalyses(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(analyses).orderBy(desc(analyses.createdAt)).limit(limit);
}

// Buzzword queries
export async function incrementBuzzword(word: string, language: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Try to insert or update count
  await db.insert(buzzwords)
    .values({ word, language, count: 1 })
    .onDuplicateKeyUpdate({ set: { count: sql`count + 1`, updatedAt: new Date() } });
}

export async function getTopBuzzwords(language: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(buzzwords)
    .where(eq(buzzwords.language, language))
    .orderBy(desc(buzzwords.count))
    .limit(limit);
}

export async function getAllTopBuzzwords(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(buzzwords)
    .orderBy(desc(buzzwords.count))
    .limit(limit);
}
