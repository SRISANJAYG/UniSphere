import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  registerForEvent,
} from "../controllers/event.controllers.js";
import {
  isAuthenticated,
  isStaffOrAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllEvents);
router.get("/:id", isAuthenticated, getEventById);
router.post("/:id/register", isAuthenticated, registerForEvent);
router.post("/", isAuthenticated, isStaffOrAdmin, createEvent);

export default router;
