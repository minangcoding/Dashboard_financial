import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new AnalyticsController();

router.use(requireAuth); 

router.get("/summary", controller.getSummary);

export default router;
