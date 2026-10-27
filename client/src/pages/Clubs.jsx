import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import {
  Sparkles,
  Users,
  Search,
  PlusCircle,
  Megaphone,
  CheckCircle2,
  X,
  Mail,
  Loader2,
} from "lucide-react";

import PublishPanel from "../components/PublishPanel";

const Clubs = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);

  // New club creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "Technology",
    lead: user?.name || "",
    email: "",
    logo: "",
  });

  const categories = [
    "All",
    "Technology",
    "Robotics",
    "Cultural",
    "Arts",
    "Sports",
    "Debate",
  ];

  const fetchClubs = async () => {
    setLoading(true);
    try {
      let url = "/api/clubs?";
      if (categoryFilter !== "All") url += `category=${categoryFilter}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

      const res = await API.get(url);
      if (res.data.success) {
        setClubs(res.data.clubs || []);
      }
    } catch (err) {
      addToast("Failed to fetch clubs directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [categoryFilter]);

  const handleJoinToggle = async (clubId) => {
    try {
      const res = await API.post(`/api/clubs/${clubId}/join`);
      if (res.data.success) {
        addToast(res.data.message, "success");
        setClubs((prev) =>
          prev.map((c) => {
            if (c._id === clubId) {
              return {
                ...c,
                isMember: res.data.isMember,
                membersCount: res.data.membersCount,
              };
            }
            return c;
          }),
        );
        if (selectedClub && selectedClub._id === clubId) {
          setSelectedClub((prev) => ({
            ...prev,
            isMember: res.data.isMember,
            membersCount: res.data.membersCount,
          }));
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Club action failed", "error");
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/clubs", newClub);
      if (res.data.success) {
        addToast("Student club registered successfully!", "success");
        setShowCreateModal(false);
        fetchClubs();
        setNewClub({
          name: "",
          tagline: "",
          description: "",
          category: "Technology",
          lead: user?.name || "",
          email: "",
          logo: "",
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create club", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Student Life</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Clubs & Communities
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Join student-led societies, competitive squads, and technical guilds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs"
            style={{ padding: "0.55rem 1rem" }}
          >
            <PlusCircle className="w-4 h-4" />
            Start a Club
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
              categoryFilter === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="glass-card p-16 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Loading student clubs...</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 text-sm">
          No clubs found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <img
                    src={
                      club.logo ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${club.name}`
                    }
                    alt={club.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                  />
                  <span className="badge badge-indigo text-[9px]">
                    {club.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {club.name}
                </h3>
                {club.tagline && (
                  <p className="text-xs text-indigo-300 font-medium mt-0.5">
                    {club.tagline}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {club.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1 text-xs text-slate-400">
                  <span>
                    Lead:{" "}
                    <strong className="text-slate-200">{club.lead}</strong>
                  </span>
                  <span>{club.membersCount} active student members</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => setSelectedClub(club)}
                  className="btn-secondary text-xs flex-1 text-center justify-center"
                  style={{ padding: "0.5rem" }}
                >
                  Announcements ({club.announcements?.length || 0})
                </button>

                <button
                  onClick={() => handleJoinToggle(club._id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-semibold border-0 cursor-pointer transition-all ${
                    club.isMember
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "btn-primary"
                  }`}
                >
                  {club.isMember ? "Joined ✓" : "Join Club"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Club Detail / Announcements Modal */}
      {selectedClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 shadow-2xl relative border border-indigo-500/30">
            <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedClub.logo ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedClub.name}`
                  }
                  alt={selectedClub.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedClub.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedClub.lead} • {selectedClub.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {selectedClub.description}
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Club Broadcasts & Announcements
            </h4>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 mb-4">
              {(selectedClub.createdBy === user?._id ||
                selectedClub.createdBy?._id === user?._id ||
                ["faculty", "admin"].includes(user?.role)) && (
                <PublishPanel
                  basePath={"/api/clubs/" + selectedClub._id}
                  onUpdate={() => {
                    API.get("/api/clubs/" + selectedClub._id).then(({ data }) =>
                      setSelectedClub(data.club),
                    );
                    fetchClubs();
                  }}
                />
              )}
              {!selectedClub.announcements ||
              selectedClub.announcements.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No announcements posted yet for this club.
                </p>
              ) : (
                selectedClub.announcements.map((ann, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                      <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{ann.title}</span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {ann.content}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(ann.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => handleJoinToggle(selectedClub._id)}
                className={`btn-primary text-xs ${
                  selectedClub.isMember
                    ? "bg-emerald-600 border-emerald-500"
                    : ""
                }`}
              >
                {selectedClub.isMember
                  ? "Joined ✓ (Click to Leave)"
                  : "Join Club"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 shadow-2xl relative border border-indigo-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">
                Register Student Club
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Club Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. UniSphere Developer Guild"
                  value={newClub.name}
                  onChange={(e) =>
                    setNewClub({ ...newClub, name: e.target.value })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building next-generation campus software"
                  value={newClub.tagline}
                  onChange={(e) =>
                    setNewClub({ ...newClub, tagline: e.target.value })
                  }
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newClub.category}
                    onChange={(e) =>
                      setNewClub({ ...newClub, category: e.target.value })
                    }
                    className="input-field text-xs"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option
                          key={c}
                          value={c}
                          className="bg-slate-900 text-white"
                        >
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Club Lead
                  </label>
                  <input
                    type="text"
                    value={newClub.lead}
                    onChange={(e) =>
                      setNewClub({ ...newClub, lead: e.target.value })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Mission, activities, meeting schedule..."
                  value={newClub.description}
                  onChange={(e) =>
                    setNewClub({ ...newClub, description: e.target.value })
                  }
                  className="input-field text-xs min-h-[70px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clubs;
