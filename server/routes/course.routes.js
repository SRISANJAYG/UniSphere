import express from "express";
import {
  getAllCourses,
  getCourseById,
  enrollInCourse,
  createCourse,
  addCourseAnnouncement,
  addCourseResource,
} from "../controllers/course.controllers.js";
import {
  isAuthenticated,
  isStaffOrAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllCourses);
router.get("/:id", isAuthenticated, getCourseById);
router.post("/:id/enroll", isAuthenticated, enrollInCourse);

// Staff / Admin actions
router.post("/", isAuthenticated, isStaffOrAdmin, createCourse);
router.post(
  "/:id/announcement",
  isAuthenticated,
  isStaffOrAdmin,
  addCourseAnnouncement,
);
router.post(
  "/:id/resource",
  isAuthenticated,
  isStaffOrAdmin,
  addCourseResource,
);

export default router;
