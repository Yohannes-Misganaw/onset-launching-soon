import { sql } from "drizzle-orm";
import { datetime, index, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const waitlist = mysqlTable(
  "waitlist",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 254 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }).notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    language: varchar("language", { length: 8 }).notNull().default("en"),
    interests: varchar("interests", { length: 200 }).notNull().default(""),
    interestsOther: varchar("interests_other", { length: 200 }).notNull().default(""),
    roles: varchar("roles", { length: 160 }).notNull().default(""),
    rolesOther: varchar("roles_other", { length: 200 }).notNull().default(""),
    createdAt: datetime("created_at", { mode: "date", fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at", { mode: "date", fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [index("waitlist_created_at_idx").on(table.createdAt)],
);

export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;
