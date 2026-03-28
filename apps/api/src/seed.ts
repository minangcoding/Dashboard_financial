import { db } from "./db";
import { categories, transactions, assets, user } from "./db/schema";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

import { auth } from "./auth";

async function runSeed() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Ambil user pertama yang ada di database atau buatkan otomatis
  let allUsers = await db.select().from(user);
  if (allUsers.length === 0) {
    console.log("⚠️ Tidak ada User di database. Membuat akun 'Demo User' (demo@fintrack.com)...");
    
    // Harus memanggil adapter signUp karena kita tidak di express per route context.
    // Tapi karena fungsi better auth memerlukan header (Request/Response API context) untuk sign up, kita insert via Drizzle saja 
    // dengan password dummy: "password" (sebagai ilustrasi jika kita bypass JWT / password matching untuk sementara)
    // Wait, lebih baik menggunakan fungsi create-user dari library auth.
    
    // Untuk ini, kita asumsikan user mendaftar lewat UI atau kita mock Request ke auth server API.

    console.log("❌ Tidak ada User di database.");
    console.log("👉 Panduan Penting: Buka aplikasi, masuk ke halaman Login, daftar akun baru (Misal: test@test.com), lalu jalankan perintah ini lagi.");
    process.exit(1);
  }

  const targetUserId = allUsers[0].id;
  console.log(`✅ User ditemukan: ${allUsers[0].email} (${targetUserId})`);

  // 2. Cek apakah sudah ada kategori, jika belum, buatkan Dummy Categories
  const existingCategories = await db.select().from(categories).where(eq(categories.userId, targetUserId));
  let seededCategories = existingCategories;

  if (existingCategories.length === 0) {
    console.log("📥 Seeding Categories...");
    const dummyCategories = [
      { id: uuidv4(), userId: targetUserId, name: "Gaji Pokok", type: "income", icon: "payments" },
      { id: uuidv4(), userId: targetUserId, name: "Dividen Saham", type: "income", icon: "monitoring" },
      { id: uuidv4(), userId: targetUserId, name: "Kebutuhan Pokok", type: "expense", icon: "shopping_cart" },
      { id: uuidv4(), userId: targetUserId, name: "Transportasi", type: "expense", icon: "directions_car" },
      { id: uuidv4(), userId: targetUserId, name: "Hiburan & Lifestyle", type: "expense", icon: "movie" },
    ];
    await db.insert(categories).values(dummyCategories);
    seededCategories = dummyCategories;
  }

  // 3. Cek transaksi, jika kosong, isi data dummy
  const existingTrx = await db.select().from(transactions).where(eq(transactions.userId, targetUserId));
  if (existingTrx.length === 0) {
    console.log("📥 Seeding Transactions...");
    const incomeCatId = seededCategories.find(c => c.type === 'income')?.id || seededCategories[0].id;
    const expenseCatId = seededCategories.find(c => c.type === 'expense')?.id || seededCategories[0].id;

    const dummyTransactions = [
      {
        id: uuidv4(),
        userId: targetUserId,
        categoryId: incomeCatId,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        description: "Gaji Bulan Ini",
        subDescription: "PT Intek Inovasi",
        type: "income",
        amount: "15000000"
      },
      {
        id: uuidv4(),
        userId: targetUserId,
        categoryId: expenseCatId,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        description: "Belanja Bulanan",
        subDescription: "Supermarket",
        type: "expense",
        amount: "1200000"
      },
      {
        id: uuidv4(),
        userId: targetUserId,
        categoryId: expenseCatId,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        description: "Bensin Mobil",
        subDescription: "SPBU",
        type: "expense",
        amount: "300000"
      }
    ];
    await db.insert(transactions).values(dummyTransactions);
  }

  // 4. Cek Assets, isi dummy jika kosong
  const existingAssets = await db.select().from(assets).where(eq(assets.userId, targetUserId));
  if (existingAssets.length === 0) {
    console.log("📥 Seeding Assets...");
    const dummyAssets = [
      {
        id: uuidv4(),
        userId: targetUserId,
        assetClass: "cash",
        name: "Mandiri Premier",
        ticker: "IDR",
        balance: "1240000000",
        costBasis: "1240000000",
        currentValue: "1240000000",
        metadata: { location: "Private Client" }
      },
      {
        id: uuidv4(),
        userId: targetUserId,
        assetClass: "investment",
        name: "PT Bank Central Asia Tbk",
        ticker: "BBCA",
        balance: "120000",
        costBasis: "8250",
        currentValue: "1140000000",
        metadata: { exchange: "IDX" }
      }
    ];
    await db.insert(assets).values(dummyAssets);
  }

  console.log("✅ Seeding selesai! Proses berhasil.");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("🔥 Error seeding database:", err);
  process.exit(1);
});
