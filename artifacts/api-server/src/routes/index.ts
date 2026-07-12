import { Router } from "express";
import health from "./health";
import auth from "./auth";
import users from "./users";
import products from "./products";
import orders from "./orders";
import stats from "./stats";
import notifications from "./notifications";

const router = Router();

router.use("/healthz", health);
router.use("/auth", auth);
router.use("/users", users);
router.use("/products", products);
router.use("/orders", orders);
router.use("/stats", stats);
router.use("/notifications", notifications);

export default router;
