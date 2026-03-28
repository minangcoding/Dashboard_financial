import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new TransactionController();

router.use(requireAuth); // Wajib login untuk akses transaksi

router.get("/export/csv", controller.exportCSV); // Endpoints spesifik harus ditaruh di atas parameterized routes
router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
