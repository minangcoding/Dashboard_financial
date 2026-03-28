import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories } from "../db/schema.js";
import { v4 as uuidv4 } from 'uuid';

export class CategoryService {
  async getAll(userId: string) {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getById(userId: string, categoryId: string) {
    const result = await db.select().from(categories).where(eq(categories.id, categoryId));
    if (result.length > 0 && result[0].userId === userId) {
      return result[0];
    }
    return null;
  }

  async create(userId: string, payload: { name: string; type: "income" | "expense"; icon: string }) {
    const [newCategory] = await db.insert(categories).values({
      id: uuidv4(),
      userId,
      name: payload.name,
      type: payload.type as any, // PERBAIKAN: as any
      icon: payload.icon,
    } as any).returning(); // PERBAIKAN: as any
    return newCategory;
  }

  async update(userId: string, categoryId: string, payload: { name?: string; type?: "income" | "expense"; icon?: string }) {
    const category = await this.getById(userId, categoryId);
    if (!category) throw new Error("Category not found or access denied");

    const [updated] = await db.update(categories)
      .set({ ...payload, updatedAt: new Date() } as any) // PERBAIKAN: as any
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();
    return updated;
  }

  async delete(userId: string, categoryId: string) {
    const category = await this.getById(userId, categoryId);
    if (!category) throw new Error("Category not found or access denied");

    await db.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
    return { success: true };
  }
}