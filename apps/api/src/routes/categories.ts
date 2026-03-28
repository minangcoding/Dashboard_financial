import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.js"; // PERBAIKAN: Tambahkan .js
import { requireAuth } from "../middlewares/auth.middleware.js"; // PERBAIKAN: Tambahkan .js

const router = Router();
const controller = new CategoryController();

router.use(requireAuth); // Pukul rata semua route category harus login

router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;