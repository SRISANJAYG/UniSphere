import express from "express";
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  gradeSubmission,
} from "../controllers/assignment.controllers.js";
import {
  isAuthenticated,
  isStaffOrAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getAssignments);
router.get("/:id", isAuthenticated, getAssignmentById);
router.post("/:id/submit", isAuthenticated, submitAssignment);

// Creation and grading
router.post("/", isAuthenticated, isStaffOrAdmin, createAssignment);
router.post("/:id/grade", isAuthenticated, isStaffOrAdmin, gradeSubmission);

export default router;
