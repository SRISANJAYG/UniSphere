import express from "express";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controllers.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getUserNotifications);
router.put("/read-all", isAuthenticated, markAllNotificationsRead);
router.put("/:id/read", isAuthenticated, markNotificationRead);

export default router;
