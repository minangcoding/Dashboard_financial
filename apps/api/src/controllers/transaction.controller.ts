import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service.js";
import pkg from 'json2csv';
const { Parser } = pkg;

const service = new TransactionService();

export class TransactionController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const filters = req.query; 
      const data = await service.getAll(userId, filters);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async exportCSV(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await service.getAllForExport(userId);

      const fields = ['id', 'date', 'description', 'subDescription', 'type', 'amount', 'categoryName'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);

      res.header('Content-Type', 'text/csv');
      res.attachment('transactions.csv');
      return res.send(csv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const payload = req.body;
      
      const requiredFields = ['categoryId', 'date', 'description', 'type', 'amount'];
      for (const field of requiredFields) {
        if (!payload[field]) return res.status(400).json({ error: `Missing ${field}` });
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