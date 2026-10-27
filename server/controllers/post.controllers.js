import { literalSearch } from "../utils/search.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";

// 1. CREATE POST
export const createPost = async (req, res) => {
  try {
    const { content, mediaUrl, category } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content cannot be empty.",
      });
    }

    const newPost = await Post.create({
      author: req.user._id,
      content: content.trim(),
      mediaUrl: mediaUrl || "",
      category: category || "General",
    });

    await newPost.populate("author", "name username avatar department year");

    return res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post: newPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post.",
      error: error.message,
    });
  }
};

// 2. GET FEED POSTS (with category filter and pagination)
export const getFeedPosts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.content = { $regex: literalSearch(search), $options: "i" };
    }

    if (req.query.author) query.author = req.query.author;
    const pageNumber = Math.max(1, Number.parseInt(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const posts = await Post.find(query)
      .populate("author", "name username avatar department year")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts.",
      error: error.message,
    });
  }
};

// 3. GET SINGLE POST
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name username avatar department year",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comments = await Comment.find({ post: post._id })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      post,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch post.",
      error: error.message,
    });
  }
};

// 4. LIKE / UNLIKE POST
export const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
      await post.save();
      return res.status(200).json({
        success: true,
        liked: false,
        likesCount: post.likes.length,
        message: "Post unliked.",
      });
    } else {
      post.likes.push(userId);
      await post.save();

      // Notify post author if not self
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          message: `@${req.user.username} liked your post.`,
          relatedId: post._id,
        });
      }

      return res.status(200).json({
        success: true,
        liked: true,
        likesCount: post.likes.length,
        message: "Post liked!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle like on post.",
      error: error.message,
    });
  }
};

// 5. ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text cannot be empty.",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const newComment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
    });

    await newComment.populate("author", "name username avatar");

    // Notify author if not self
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        message: `@${req.user.username} commented: "${content.slice(0, 35)}..."`,
        relatedId: post._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Comment added!",
      comment: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add comment.",
      error: error.message,
    });
  }
};

// 6. GET COMMENTS FOR A POST
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments.",
      error: error.message,
    });
  }
};

// 7. EDIT POST
export const editPost = async (req, res) => {
  try {
    const { content, category, mediaUrl } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this post.",
      });
    }

    if (content) post.content = content.trim();
    if (category) post.category = category;
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;

    await post.save();
    await post.populate("author", "name username avatar department year");

    return res.status(200).json({
      success: true,
      message: "Post updated successfully!",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update post.",
      error: error.message,
    });
  }
};

// 8. DELETE POST
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post.",
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete post.",
      error: error.message,
    });
  }
};
