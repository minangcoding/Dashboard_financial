import { db } from "../db";
import { transactions } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export class AnalyticsService {
  async getSummary(userId: string) {
    // Menghitung total pemasukan dan total pengeluaran untuk logic sederhana MVP
    const results = await db
      .select({
        type: transactions.type,
        totalAmount: sql<number>`SUM(${transactions.amount})`.mapWith(Number),
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .groupBy(transactions.type);

    let totalIncome = 0;
    let totalExpense = 0;

    results.forEach(val => {
      if (val.type === 'income') totalIncome += val.totalAmount;
      if (val.type === 'expense') totalExpense += val.totalAmount;
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : 0;
    const monthlyBurnRate = totalExpense; // Simulasi per bulan dari semua data
    const projAnnualProfit = netSavings * 12; // Proyeksi simple jika data = sebulan

    return {
      netSavingsRate: savingsRate + '%',
      netSavings,
      monthlyBurnRate,
      projAnnualProfit
    };
  }
}
