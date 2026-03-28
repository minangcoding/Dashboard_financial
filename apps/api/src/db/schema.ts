import { pgTable, text, timestamp, boolean, uuid, decimal, jsonb } from "drizzle-orm/pg-core";

// --- BETTER AUTH BUILT-IN TABLES ---
export const user = pgTable("user", {
					id: text("id").primaryKey(),
					name: text("name").notNull(),
					email: text("email").notNull().unique(),
					emailVerified: boolean("emailVerified").notNull(),
					image: text("image"),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
					id: text("id").primaryKey(),
					expiresAt: timestamp("expiresAt").notNull(),
					token: text("token").notNull().unique(),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull(),
					ipAddress: text("ipAddress"),
					userAgent: text("userAgent"),
					userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
					id: text("id").primaryKey(),
					accountId: text("accountId").notNull(),
					providerId: text("providerId").notNull(),
					userId: text("userId").notNull().references(() => user.id),
					accessToken: text("accessToken"),
					refreshToken: text("refreshToken"),
					idToken: text("idToken"),
					accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
					refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
					scope: text("scope"),
					password: text("password"),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
					id: text("id").primaryKey(),
					identifier: text("identifier").notNull(),
					value: text("value").notNull(),
					expiresAt: timestamp("expiresAt").notNull(),
					createdAt: timestamp("createdAt"),
					updatedAt: timestamp("updatedAt")
});

// --- APP SPECIFIC TABLES ---

// Categories Table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Transactions Table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
  categoryId: uuid("categoryId").notNull().references(() => categories.id, { onDelete: 'restrict' }),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  subDescription: text("subDescription"),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Assets Table (Unified)
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
  assetClass: text("assetClass", { enum: ["cash", "investment", "crypto", "fixed"] }).notNull(),
  name: text("name").notNull(),
  ticker: text("ticker"), // E.g. "BTC", "BBCA"
  balance: decimal("balance", { precision: 20, scale: 6 }).notNull(), // Count of units or money
  costBasis: decimal("costBasis", { precision: 20, scale: 2 }).notNull(), // Original cost
  currentValue: decimal("currentValue", { precision: 20, scale: 2 }).notNull(), // Current market value
  metadata: jsonb("metadata"), // Flexibility for extra fields (e.g., location, image URL)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
