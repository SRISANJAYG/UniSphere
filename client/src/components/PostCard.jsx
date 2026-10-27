import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Edit3,
  Send,
  MoreVertical,
  Check,
  Tag,
} from "lucide-react";

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isLiked, setIsLiked] = useState(
    post.likes?.some((id) =>
      typeof id === "object" ? id._id === user?._id : id === user?._id,
    ),
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner =
    user && (post.author?._id === user._id || post.author === user._id);

  // Handle Like Toggle
  const handleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await API.post(`/api/posts/${post._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      addToast("Failed to update like", "error");
    }
  };

  // Load comments
  const toggleComments = async () => {
    if (!showComments && !commentsLoaded) {
      try {
        const res = await API.get(`/api/posts/${post._id}/comments`);
        if (res.data.success) {
          setComments(res.data.comments || []);
          setCommentsLoaded(true);
        }
      } catch (err) {
        addToast("Failed to load comments", "error");
      }
    }
    setShowComments(!showComments);
  };

  // Submit comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await API.post(`/api/posts/${post._id}/comment`, {
        content: commentText.trim(),
      });
      if (res.data.success) {
        setComments((prev) => [res.data.comment, ...prev]);
        setCommentText("");
        addToast("Comment posted!", "success");
      }
    } catch (err) {
      addToast("Failed to add comment", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Save edited post
  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const res = await API.put(`/api/posts/${post._id}`, {
        content: editContent.trim(),
      });
      if (res.data.success) {
        setIsEditing(false);
        addToast("Post updated successfully", "success");
        if (onPostUpdated) onPostUpdated(res.data.post);
      }
    } catch (err) {
      addToast("Failed to update post", "error");
    }
  };

  // Delete Post
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await API.delete(`/api/posts/${post._id}`);
      if (res.data.success) {
        addToast("Post deleted successfully", "info");
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch (err) {
      addToast("Failed to delete post", "error");
    }
  };

  const authorName = post.author?.name || "Student";
  const authorUsername = post.author?.username || "student";
  const authorAvatar =
    post.author?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${authorUsername}`;

  return (
    <article
      id={"post-" + post._id}
      className="glass-card p-6 sm:p-7 rounded-3xl flex flex-col gap-5 relative"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link to={`/profile/${authorUsername}`}>
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-12 h-12 rounded-2xl object-cover border border-white/10 hover:border-indigo-400 transition-colors shadow-md"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${authorUsername}`}
                className="text-sm font-bold text-white hover:text-indigo-400 text-decoration-none transition-colors"
              >
                {authorName}
              </Link>
              <span className="text-xs text-slate-400">@{authorUsername}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
              <span>{post.author?.department || "Student"}</span>
              <span>•</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Category & Owner Menu */}
        <div className="flex items-center gap-2">
          {post.category && (
            <span className="badge badge-indigo text-[10px] hidden sm:inline-flex">
              {post.category}
            </span>
          )}

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-36 glass-elevated p-1.5 shadow-2xl z-20">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 border-0 bg-transparent cursor-pointer font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border-0 bg-transparent cursor-pointer font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-field min-h-[100px] resize-y"
          />
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary text-xs"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="btn-primary text-xs"
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {/* Optional Media Preview */}
      {post.mediaUrl && (
        <div className="rounded-2xl overflow-hidden border border-white/10 max-h-96 bg-black/40">
          <img
            src={post.mediaUrl}
            alt="Post attachment"
            className="w-full h-auto object-cover max-h-96"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Actions (Like, Comment, Share) */}
      <div className="flex items-center gap-6 pt-3 border-t border-white/[0.08] text-xs font-bold text-slate-400">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors border-0 bg-transparent cursor-pointer py-1 ${
            isLiked ? "text-rose-500" : "hover:text-rose-400 text-slate-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
          <span>{likesCount} Likes</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-2 hover:text-indigo-400 text-slate-400 transition-colors border-0 bg-transparent cursor-pointer py-1"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{showComments ? "Hide Comments" : "Comments"}</span>
        </button>

        <button
          aria-label="Copy post link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                window.location.origin + "/feed?post=" + post._id,
              );
              addToast("Post link copied to clipboard!", "info");
            } catch {
              addToast(
                "Clipboard is unavailable. Please copy the page address.",
                "error",
              );
            }
          }}
          className="flex items-center gap-2 hover:text-indigo-400 text-slate-400 transition-colors border-0 bg-transparent cursor-pointer ml-auto py-1"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="flex flex-col gap-4 pt-4 border-t border-white/[0.08] animate-fadeIn">
          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2.5">
            <input
              type="text"
              placeholder="Write a constructive student comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field text-xs"
              style={{
                padding: "0.65rem 1rem",
                borderRadius: "var(--radius-full)",
              }}
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="btn-primary shrink-0 text-xs"
              style={{
                padding: "0.65rem 1.1rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comment List */}
          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No comments yet. Be the first student to reply!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-3 text-xs"
                >
                  <img
                    src={
                      comment.author?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author?.username || "peer"}`
                    }
                    alt={comment.author?.name}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {comment.author?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        @{comment.author?.username}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
