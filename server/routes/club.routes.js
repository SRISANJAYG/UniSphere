import express from "express";
import {
  getAllClubs,
  getClubById,
  joinLeaveClub,
  createClub,
  addClubAnnouncement,
} from "../controllers/club.controllers.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllClubs);
router.get("/:id", isAuthenticated, getClubById);
router.post("/:id/join", isAuthenticated, joinLeaveClub);
router.post("/", isAuthenticated, createClub);
router.post("/:id/announcement", isAuthenticated, addClubAnnouncement);

export default router;
