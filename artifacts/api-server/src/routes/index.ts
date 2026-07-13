import { Router } from "express";
import health from "./health";
import auth from "./auth";
import users from "./users";
import products from "./products";
import orders from "./orders";
import stats from "./stats";
import notifications from "./notifications";
import assets from "./assets";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    name: "Asset Manager API",
    version: "1.0.0",
    status: "running"
  });
});

router.use("/healthz", health);
router.use("/auth", auth);
router.use("/users", users);
router.use("/products", products);
router.use("/orders", orders);
router.use("/stats", stats);
router.use("/notifications", notifications);
router.use("/assets", assets);

export default router;
