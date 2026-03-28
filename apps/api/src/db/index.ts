import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

// Gunakan pengecekan agar tidak crash jika env belum masuk
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL tidak ditemukan di Environment Variables!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Memaksa koneksi aman di Vercel
  }
});

export const db = drizzle(pool, { schema });