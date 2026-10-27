import express from "express";
import {
  createPost,
  getFeedPosts,
  getPostById,
  likeUnlikePost,
  addComment,
  getComments,
  editPost,
  deletePost,
} from "../controllers/post.controllers.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/feed", isAuthenticated, getFeedPosts);
router.post("/", isAuthenticated, createPost);
router.get("/:id", isAuthenticated, getPostById);
router.put("/:id", isAuthenticated, editPost);
router.delete("/:id", isAuthenticated, deletePost);
router.post("/:id/like", isAuthenticated, likeUnlikePost);
router.post("/:id/comment", isAuthenticated, addComment);
router.get("/:id/comments", isAuthenticated, getComments);

export default router;
