import express from "express";
import {
  register,
  login,
  logout,
  getMyProfile,
  updateProfile,
  getStudents,
  getStudentProfile,
  followUnfollow,
} from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected student routes
router.get("/profile", isAuthenticated, getMyProfile);
router.put("/profile", isAuthenticated, updateProfile);
router.get("/all", isAuthenticated, getStudents);
router.get("/:id", isAuthenticated, getStudentProfile);
router.post("/:id/follow", isAuthenticated, followUnfollow);

export default router;
