import { eq } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../db/schema";
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
      type: payload.type,
      icon: payload.icon,
    }).returning();
    return newCategory;
  }

  async update(userId: string, categoryId: string, payload: { name?: string; type?: "income" | "expense"; icon?: string }) {
    // Memastikan kategori milik user ini
    const category = await this.getById(userId, categoryId);
    if (!category) throw new Error("Category not found or access denied");

    const [updated] = await db.update(categories)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(categories.id, categoryId))
      .returning();
    return updated;
  }

  async delete(userId: string, categoryId: string) {
    const category = await this.getById(userId, categoryId);
    if (!category) throw new Error("Category not found or access denied");

    await db.delete(categories).where(eq(categories.id, categoryId));
    return { success: true };
  }
}
