import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import {
  MessageSquare,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";

const Feed = () => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const linkedPost = params.get("post");
  const { addToast } = useToast();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    "All",
    "General",
    "Academic",
    "Project",
    "Campus",
    "Question",
  ];

  const fetchFeed = async (nextPage = 1) => {
    setLoading(true);
    try {
      let url = `/api/posts/feed?category=${selectedCategory}&page=${nextPage}&limit=20`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await API.get(linkedPost ? "/api/posts/" + linkedPost : url);
      if (res.data.success) {
        setPosts((prev) =>
          linkedPost
            ? [res.data.post]
            : nextPage === 1
              ? res.data.posts || []
              : [...prev, ...(res.data.posts || [])],
        );
        setPage(nextPage);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      addToast("Failed to fetch feed posts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [selectedCategory, linkedPost]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeed();
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Feed Header & Create Post Quick Bar */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 border border-indigo-500/25">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || "student"}`
            }
            alt={user?.name}
            className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="input-field text-left text-slate-400 hover:text-slate-200 cursor-pointer text-xs sm:text-sm py-3 px-5 transition-colors"
            style={{ borderRadius: "var(--radius-full)" }}
          >
            What are you working on, {user?.name?.split(" ")[0]}? Share with
            campus...
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs shrink-0 w-full sm:w-auto"
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-full)",
          }}
        >
          <PlusCircle className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs"
            style={{
              paddingLeft: "2.75rem",
              height: "2.5rem",
              borderRadius: "var(--radius-full)",
            }}
          />
        </form>
      </div>

      {/* 3. Posts Stream with Generous Card Gaps */}
      {loading ? (
        <div className="glass-card p-16 text-center flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400 font-medium">
            Loading campus posts...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-16 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-white">No posts found</h4>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            No posts matched your current category or search criteria. Be the
            first to start the conversation!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs mt-3"
            style={{
              borderRadius: "var(--radius-full)",
              padding: "0.75rem 1.75rem",
            }}
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}

      {page < totalPages && (
        <button
          className="btn-secondary self-center"
          onClick={() => fetchFeed(page + 1)}
          disabled={loading}
        >
          Load more posts
        </button>
      )}
      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Feed;
