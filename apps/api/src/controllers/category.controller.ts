import { Request, Response } from "express";
import { CategoryService } from "../services/category.service.js";

const service = new CategoryService();

export class CategoryController {
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
      const { name, type, icon } = req.body;
      
      if (!name || !type || !icon) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = await service.create(userId, { name, type, icon });
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string; // PERBAIKAN: Cast ke string
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
      const id = req.params.id as string; // PERBAIKAN: Cast ke string

      const result = await service.delete(userId, id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}