import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import PostCard from "../components/PostCard";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Sparkles,
  MapPin,
  Edit3,
  UserCheck,
  UserPlus,
  Loader2,
  Tag,
  BookOpen,
} from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [peopleList, setPeopleList] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetIdentifier =
    id === "me" ? currentUser?.username || currentUser?._id : id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/users/${targetIdentifier}`);
        if (res.data.success) {
          setProfileUser(res.data.user);
          setIsFollowing(
            res.data.user.followers?.some((f) =>
              typeof f === "object"
                ? f._id === currentUser?._id
                : f === currentUser?._id,
            ),
          );

          // Fetch student's posts
          const postsRes = await API.get(
            `/api/posts/feed?limit=50&author=${res.data.user._id}`,
          );
          if (postsRes.data.success) {
            const authorPosts = (postsRes.data.posts || []).filter(
              (p) =>
                p.author?._id === res.data.user._id ||
                p.author === res.data.user._id,
            );
            setPosts(authorPosts);
          }
        }
      } catch (err) {
        addToast("Failed to fetch student profile", "error");
      } finally {
        setLoading(false);
      }
    };

    if (targetIdentifier) {
      fetchProfile();
    }
  }, [targetIdentifier]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    try {
      const res = await API.post(`/api/users/${profileUser._id}/follow`);
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
        addToast(res.data.message, "success");
      }
    } catch (err) {
      addToast("Failed to update follow status", "error");
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-16 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading student profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="glass-card p-12 text-center text-slate-400">
        Student profile not found.
      </div>
    );
  }

  const isMe = profileUser._id === currentUser?._id;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Profile Banner & Avatar */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-indigo-500/30">
        {/* Futuristic Gradient Banner */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Details Container */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <img
                src={
                  profileUser.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.username}`
                }
                alt={profileUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#070913] bg-[#070913] shadow-2xl shadow-indigo-950/60"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {profileUser.name}
                  </h1>
                  <span className="badge badge-indigo text-[10px]">
                    {profileUser.year}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  @{profileUser.username}
                </p>
              </div>
            </div>

            {/* Profile Action: Edit or Follow */}
            <div>
              {isMe ? (
                <Link
                  to="/settings"
                  className="btn-secondary text-xs"
                  style={{ padding: "0.6rem 1.25rem" }}
                >
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  Edit My Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border-0 cursor-pointer transition-all ${
                    isFollowing
                      ? "bg-white/10 text-slate-200 hover:bg-rose-500/20 hover:text-rose-200"
                      : "btn-primary"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow Student
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed mb-6">
            {profileUser.bio || "Student at UniSphere."}
          </p>

          {/* Academic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block">Department</span>
              <span className="font-semibold text-slate-200">
                {profileUser.department}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Degree / Course</span>
              <span className="font-semibold text-slate-200">
                {profileUser.course}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Student ID</span>
              <span className="font-semibold text-slate-200">
                {profileUser.studentId || "UNI-PASS"}
              </span>
            </div>
          </div>

          {/* Followers / Following Stats */}
          <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
            <div>
              <span className="font-bold text-white mr-1.5">
                {profileUser.followers?.length || 0}
              </span>
              <button
                onClick={() => setPeopleList("followers")}
                className="hover:text-white"
              >
                Followers
              </button>
            </div>
            <div>
              <span className="font-bold text-white mr-1.5">
                {profileUser.following?.length || 0}
              </span>
              <button
                onClick={() => setPeopleList("following")}
                className="hover:text-white"
              >
                Following
              </button>
            </div>
            <div>
              <span className="font-bold text-white mr-1.5">
                {posts.length}
              </span>
              <span>Campus Posts</span>
            </div>
          </div>

          {/* Skills & Interests Tags */}
          <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-white/10">
            {profileUser.skills && profileUser.skills.length > 0 && (
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Technical Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profileUser.skills.map((skill) => (
                    <span
                      key={skill}
                      className="badge badge-indigo text-[10px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileUser.interests && profileUser.interests.length > 0 && (
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Campus Interests
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profileUser.interests.map((interest) => (
                    <span
                      key={interest}
                      className="badge badge-fuchsia text-[10px]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {peopleList && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={peopleList}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        >
          <div className="glass-panel p-6 w-full max-w-md">
            <div className="flex justify-between mb-5">
              <h3 className="capitalize">{peopleList}</h3>
              <button onClick={() => setPeopleList(null)}>Close</button>
            </div>
            <div className="flex flex-col gap-3">
              {profileUser[peopleList]?.length ? (
                profileUser[peopleList].map((person) => (
                  <Link
                    key={person._id}
                    to={"/profile/" + person.username}
                    onClick={() => setPeopleList(null)}
                    className="p-3 rounded-xl bg-white/5"
                  >
                    {person.name}
                    <span className="text-slate-400 ml-2">
                      @{person.username}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-slate-400">No connections yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 2. Student's Posts Activity */}
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white">
          Recent Posts by {profileUser.name}
        </h3>

        {posts.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">
            This student has not created any posts yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
