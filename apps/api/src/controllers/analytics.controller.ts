import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

const service = new AnalyticsService();

export class AnalyticsController {
  async getSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      // Pastikan di AnalyticsService kamu ada method getSummary
      const data = await service.getSummary(userId);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}