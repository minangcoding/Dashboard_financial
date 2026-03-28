import { eq } from "drizzle-orm";
import { db } from "../db";
import { assets } from "../db/schema";
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
      assetClass: payload.assetClass,
      name: payload.name,
      ticker: payload.ticker || null,
      balance: payload.balance,
      costBasis: payload.costBasis,
      currentValue: payload.currentValue,
      metadata: payload.metadata || {},
    }).returning();
    return newAsset;
  }

  async update(userId: string, assetId: string, payload: any) {
    const asset = await this.getById(userId, assetId);
    if (!asset) throw new Error("Asset not found or access denied");

    const updatePayload = { ...payload, updatedAt: new Date() };

    const [updated] = await db.update(assets)
      .set(updatePayload)
      .where(eq(assets.id, assetId))
      .returning();
    return updated;
  }

  async delete(userId: string, assetId: string) {
    const asset = await this.getById(userId, assetId);
    if (!asset) throw new Error("Asset not found or access denied");

    await db.delete(assets).where(eq(assets.id, assetId));
    return { success: true };
  }
}
