import { Request, Response } from "express";
import { AssetService } from "../services/asset.service";

const service = new AssetService();

export class AssetController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await service.getAll(userId);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const payload = req.body;
      
      const requiredFields = ['assetClass', 'name', 'balance', 'costBasis', 'currentValue'];
      for (const field of requiredFields) {
        if (payload[field] === undefined) return res.status(400).json({ error: `Missing ${field}` });
      }

      const data = await service.create(userId, payload);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string; // PERBAIKAN: Cast as string
      const payload = req.body;

      const data = await service.update(userId, id, payload);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string; // PERBAIKAN: Cast as string

      const result = await service.delete(userId, id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}