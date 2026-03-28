import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const controller = new AnalyticsController();

router.use(requireAuth); 

router.get("/summary", controller.getSummary);

export default router;
