import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from "better-auth/node";
import { auth } from './auth';

import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';
import assetRoutes from './routes/assets';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * PERBAIKAN DI SINI:
 * Menambahkan 'any' setelah tanda '*' karena versi terbaru path-to-regexp 
 * (yang digunakan Express) mewajibkan wildcard memiliki nama parameter.
 */
app.all("/api/auth/*any", toNodeHandler(auth));

// Pemasangan REST API (CRUD & Layanan Laporan)
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend Finance Dashboard is running',
    timestamp: new Date() 
  });
});

// Endpoints
import { db } from './db';
import { categories, transactions, assets } from './db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

app.post('/api/seed', async (req, res) => {
  try {
    const sessionUrl = process.env.BETTER_AUTH_URL || "http://localhost:3001";
    // We will just fetch auth data or require the frontend to pass the user id.
    // Easier: assume frontend sends userId inside body for this dummy endpoint.
    const { userId } = req.body;
    if (!userId) return res.status(400).json({error: "Need userId"});

    // Check if seeded
    const existing = await db.select().from(categories).where(eq(categories.userId, userId));
    if (existing.length > 0) return res.json({ message: "Sudah di-seed sebelumnya" });

    // Seeding Categories
    const dummyCats = [
      { id: uuidv4(), userId, name: "Gaji Pokok", type: "income", icon: "payments" },
      { id: uuidv4(), userId, name: "Dividen", type: "income", icon: "monitoring" },
      { id: uuidv4(), userId, name: "Kebutuhan", type: "expense", icon: "shopping_cart" },
      { id: uuidv4(), userId, name: "Hiburan", type: "expense", icon: "movie" }
    ] as const;
    await db.insert(categories).values(dummyCats);

    // Seeding Transactions
    await db.insert(transactions).values([
      { id: uuidv4(), userId, categoryId: dummyCats[0].id, date: new Date(), description: "Gaji Bulanan", type: "income", amount: "12500000" },
      { id: uuidv4(), userId, categoryId: dummyCats[2].id, date: new Date(), description: "Belanja", subDescription: "Supermarket", type: "expense", amount: "3500000" },
      { id: uuidv4(), userId, categoryId: dummyCats[3].id, date: new Date(Date.now() - 86400000), description: "Tiket Nonton", type: "expense", amount: "150000" },
    ]);

    // Seeding Assets
    await db.insert(assets).values([
      { id: uuidv4(), userId, assetClass: "cash", name: "Bank Mandiri", ticker: "IDR", balance: "15000000", costBasis: "15000000", currentValue: "15000000" },
      { id: uuidv4(), userId, assetClass: "investment", name: "S&P 500", ticker: "VOO", balance: "20", costBasis: "2000", currentValue: "2200" }
    ]);

    res.json({ message: "Seed berhasil untuk " + userId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Server
app.listen(port, () => {
  console.log(`[API] Server is running on http://localhost:${port}`);
  console.log(`[API] Health check: http://localhost:${port}/api/health`);
});