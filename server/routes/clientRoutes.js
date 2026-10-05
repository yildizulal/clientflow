import express from "express";

import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
} from "../controllers/clientController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Bu router altındaki HER endpoint JWT gerektirir.
router.use(protect);

router
  .route("/")
  .get(getClients)
  .post(createClient);

router
  .route("/:id")
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

export default router;