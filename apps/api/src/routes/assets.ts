import { Router } from "express";
import { AssetController } from "../controllers/asset.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const controller = new AssetController();

router.use(requireAuth); 

router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
