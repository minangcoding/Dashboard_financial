import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { assets } from "../db/schema.js";
import { v4 as uuidv4 } from 'uuid';

export class AssetService {
  async getAll(userId: string) {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async getById(userId: string, assetId: string) {
    const result = await db.select().from(assets).where(eq(assets.id, assetId));
    if (result.length > 0 && result[0].userId === userId) {
      return result[0];
    }
    return null;
  }

  async create(userId: string, payload: any) {
    const [newAsset] = await db.insert(assets).values({
      id: uuidv4(),
      userId,
      assetClass: payload.assetClass as any,
      name: payload.name,
      ticker: payload.ticker || null,
      balance: payload.balance,
      costBasis: payload.costBasis,
      currentValue: payload.currentValue,
      metadata: payload.metadata || {},
    } as any).returning();
    return newAsset;
  }

  async update(userId: string, assetId: string, payload: any) {
    const asset = await this.getById(userId, assetId);
    if (!asset) throw new Error("Asset not found or access denied");

    const updatePayload = { ...payload, updatedAt: new Date() };

    const [updated] = await db.update(assets)
      .set(updatePayload as any)
      .where(and(eq(assets.id, assetId), eq(assets.userId, userId)))
      .returning();
    return updated;
  }

  async delete(userId: string, assetId: string) {
    const asset = await this.getById(userId, assetId);
    if (!asset) throw new Error("Asset not found or access denied");

    await db.delete(assets).where(and(eq(assets.id, assetId), eq(assets.userId, userId)));
    return { success: true };
  }
}