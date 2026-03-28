import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.js"; // PERBAIKAN: Tambahkan /index.js
import * as schema from "./db/schema.js"; // PERBAIKAN: Tambahkan .js
import dotenv from "dotenv";

dotenv.config();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
  }),
  emailAndPassword: {  
    enabled: true // Buka akses login dengan Email & Password
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  // Tambahkan link Vercel kamu di sini agar login diizinkan
  trustedOrigins: [
    "http://localhost:5173", 
    "https://dashboard-financial-api-isc7.vercel.app"
  ] 
});