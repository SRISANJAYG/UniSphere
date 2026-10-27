import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import { X, Image, Sparkles, Send } from "lucide-react";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { addToast } = useToast();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = ["General", "Academic", "Project", "Campus", "Question"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast("Please write some content for your post", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/posts", {
        content: content.trim(),
        category,
        mediaUrl: mediaUrl.trim(),
      });

      if (res.data.success) {
        addToast("Post published to campus feed!", "success");
        setContent("");
        setMediaUrl("");
        setShowMediaInput(false);
        onClose();
        if (onPostCreated) onPostCreated(res.data.post);
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to publish post",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
      <div
        className="glass-panel w-full max-w-xl p-8 shadow-2xl relative border border-indigo-500/30"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">Create Campus Post</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border-0 bg-transparent cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Category Select Pills */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border-0 cursor-pointer ${
                    category === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                      : "bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Your Thoughts
            </label>
            <textarea
              rows={4}
              placeholder="What project are you building? Looking for hackathon teammates? Need study tips?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field text-sm resize-y min-h-[120px]"
              required
            />
          </div>

          {/* Media URL Toggle */}
          <div>
            {!showMediaInput ? (
              <button
                type="button"
                onClick={() => setShowMediaInput(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-bold border-0 bg-transparent cursor-pointer transition-colors"
              >
                <Image className="w-4 h-4" />
                Add Image or Demo Link URL
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">
                  Image / Screenshot URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs"
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
