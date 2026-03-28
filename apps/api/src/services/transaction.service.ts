import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { transactions, categories } from "../db/schema";
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  async getAll(userId: string, filters: any = {}) {
    const conditions = [eq(transactions.userId, userId)];

    if (filters.type) {
      conditions.push(eq(transactions.type, filters.type));
    }
    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }
    if (filters.startDate) {
      conditions.push(gte(transactions.date, new Date(filters.startDate)));
    }
    if (filters.endDate) {
      conditions.push(lte(transactions.date, new Date(filters.endDate)));
    }

    let query = db.select({
      id: transactions.id,
      date: transactions.date,
      description: transactions.description,
      subDescription: transactions.subDescription,
      type: transactions.type,
      amount: transactions.amount,
      category: {
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
      }
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date));

    // Pagination
    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const offset = (page - 1) * limit;

    const data = await query.limit(limit).offset(offset);
    
    // Count Total (simpel untuk MVP)
    const countQuery = await db.select({ total: sql`count(*)`.mapWith(Number) })
      .from(transactions)
      .where(and(...conditions));
    const total = countQuery[0]?.total || 0;

    return { 
      data, 
      meta: { total, page, limit } 
    };
  }

  async getAllForExport(userId: string) {
    return await db.select({
      id: transactions.id,
      date: transactions.date,
      description: transactions.description,
      subDescription: transactions.subDescription,
      type: transactions.type,
      amount: transactions.amount,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date));
  }

  async getById(userId: string, transactionId: string) {
    const result = await db.select().from(transactions).where(eq(transactions.id, transactionId));
    if (result.length > 0 && result[0].userId === userId) {
      return result[0];
    }
    return null;
  }

  async create(userId: string, payload: any) {
    const [newTrx] = await db.insert(transactions).values({
      id: uuidv4(),
      userId,
      categoryId: payload.categoryId,
      date: new Date(payload.date),
      description: payload.description,
      subDescription: payload.subDescription || null,
      type: payload.type,
      amount: payload.amount,
    }).returning();
    return newTrx;
  }

  async update(userId: string, transactionId: string, payload: any) {
    const trx = await this.getById(userId, transactionId);
    if (!trx) throw new Error("Transaction not found or access denied");

    const updatePayload = { ...payload, updatedAt: new Date() };
    if (payload.date) updatePayload.date = new Date(payload.date);

    const [updated] = await db.update(transactions)
      .set(updatePayload)
      .where(eq(transactions.id, transactionId))
      .returning();
    return updated;
  }

  async delete(userId: string, transactionId: string) {
    const trx = await this.getById(userId, transactionId);
    if (!trx) throw new Error("Transaction not found or access denied");

    await db.delete(transactions).where(eq(transactions.id, transactionId));
    return { success: true };
  }
}
