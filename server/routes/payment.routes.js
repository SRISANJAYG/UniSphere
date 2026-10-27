import express from "express";
import {
  getRazorpayKey,
  createPaymentOrder,
  verifyPaymentSignature,
  getMyPayments,
} from "../controllers/payment.controllers.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/key", isAuthenticated, getRazorpayKey);
router.post("/order", isAuthenticated, createPaymentOrder);
router.post("/verify", isAuthenticated, verifyPaymentSignature);
router.get("/history", isAuthenticated, getMyPayments);

export default router;
