import pkg from 'pg';
const { Pool } = pkg; // Ambil Pool dari default export library pg
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js'; // WAJIB pakai .js di akhir untuk ESM
import dotenv from 'dotenv';

// Memastikan variabel environment terbaca
dotenv.config();

// Inisialisasi koneksi ke database (Neon/Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Tambahkan ssl jika menggunakan cloud database seperti Neon
  ssl: true 
});

// Inisialisasi Drizzle dengan pool dan schema
export const db = drizzle(pool, { schema });

/**
 * Tips: Jika kamu menjalankan ini secara lokal dan muncul error 'schema.js' not found,
 * pastikan file schema.ts kamu ada di folder yang sama. 
 * Node.js ESM mewajibkan penulisan ekstensi file .js pada saat import 
 * meskipun file aslinya adalah .ts.
 */