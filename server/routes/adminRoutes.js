import express from "express";

import {
  getAdminStats,
  getUsers,
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);

export default router;