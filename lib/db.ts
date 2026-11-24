import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/lib/schema";

const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

const pool =
  globalForDb.pool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL ?? "mysql://localhost/unconfigured",
    timezone: "Z",
    connectionLimit: 5,
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });

export function isDuplicateEntryError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth++) {
    if (typeof current === "object" && "code" in current && current.code === "ER_DUP_ENTRY") {
      return true;
    }
    current = typeof current === "object" && "cause" in current ? current.cause : undefined;
  }
  return false;
}
