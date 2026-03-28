import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

// Tambahkan timeout agar server tidak cepat menyerah
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Penting untuk Neon/Supabase di Vercel
  },
  connectionTimeoutMillis: 10000, // Tunggu 10 detik sebelum menyerah
});

export const db = drizzle(pool, { schema });