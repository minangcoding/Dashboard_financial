import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from "better-auth/node";
import { auth } from './auth.js';

import categoryRoutes from './routes/categories.js';
import transactionRoutes from './routes/transactions.js';
import assetRoutes from './routes/assets.js';
import analyticsRoutes from './routes/analytics.js';

import { db } from './db/index.js';
import { categories, transactions, assets } from './db/schema.js';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- MIDDLEWARES ---
app.use(cors({
  origin: ['http://localhost:5173', 'https://dashboard-financial-beta.vercel.app'], // Sesuaikan link Vercel kamu nanti
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- AUTH ROUTE ---
// Menggunakan *any untuk kompatibilitas path-to-regexp terbaru
app.all("/api/auth/*any", toNodeHandler(auth));

// --- REST API ROUTES ---
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend Finance Dashboard is running',
    timestamp: new Date() 
  });
});

// --- SEEDING ENDPOINT ---
// Digunakan untuk mengisi data awal agar dashboard tidak kosong
app.post('/api/seed', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId wajib diisi di body request" });

    // Cek apakah user sudah punya data kategori
    const existing = await db.select().from(categories).where(eq(categories.userId, userId));
    if (existing.length > 0) {
      return res.json({ message: "Data sudah ada (seeded), tidak perlu seed ulang." });
    }

    // 1. Seed Categories
    const dummyCats = [
      { id: uuidv4(), userId, name: "Gaji Pokok", type: "income" as any, icon: "payments" },
      { id: uuidv4(), userId, name: "Dividen", type: "income" as any, icon: "monitoring" },
      { id: uuidv4(), userId, name: "Operasional", type: "expense" as any, icon: "business" },
      { id: uuidv4(), userId, name: "Marketing", type: "expense" as any, icon: "campaign" }
    ];
    await db.insert(categories).values(dummyCats);

    // 2. Seed Transactions
    await db.insert(transactions).values([
      { 
        id: uuidv4(), 
        userId, 
        categoryId: dummyCats[0].id, 
        date: new Date(), 
        description: "Injeksi Modal Awal", 
        type: "income" as any, 
        amount: "50000000" 
      },
      { 
        id: uuidv4(), 
        userId, 
        categoryId: dummyCats[2].id, 
        date: new Date(), 
        description: "Sewa Kantor", 
        subDescription: "Bulanan", 
        type: "expense" as any, 
        amount: "5000000" 
      }
    ] as any);

    // 3. Seed Assets
    await db.insert(assets).values([
      { 
        id: uuidv4(), 
        userId, 
        assetClass: "cash" as any, 
        name: "Kas Perusahaan", 
        ticker: "IDR", 
        balance: "45000000", 
        costBasis: "45000000", 
        currentValue: "45000000" 
      }
    ] as any);

    res.json({ message: "Seed data berhasil dimasukkan untuk user: " + userId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 [API] Server running: http://localhost:${port}`);
  console.log(`✅ [API] Health check: http://localhost:${port}/api/health`);
  console.log(`-----------------------------------------------`);
});