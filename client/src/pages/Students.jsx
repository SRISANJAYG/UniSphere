import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  GraduationCap,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";

const Students = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [department, setDepartment] = useState("");
  const [followingMap, setFollowingMap] = useState({});

  const departments = [
    "All Departments",
    "Computer Science & Engineering",
    "Artificial Intelligence & Data Science",
    "Electronics & Communication",
    "Mechanical & Robotics",
    "Information Technology",
  ];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = "/api/users/all?";
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;
      if (department && department !== "All Departments") {
        url += `department=${encodeURIComponent(department)}&`;
      }

      const res = await API.get(url);
      if (res.data.success) {
        setStudents(res.data.students || []);

        // Initialize following state map
        const initialMap = {};
        (res.data.students || []).forEach((s) => {
          initialMap[s._id] = s.followers?.some((f) => f === currentUser?._id);
        });
        setFollowingMap(initialMap);
      }
    } catch (err) {
      addToast("Failed to fetch students directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleFollowToggle = async (studentId, studentUsername) => {
    try {
      const res = await API.post(`/api/users/${studentId}/follow`);
      if (res.data.success) {
        setFollowingMap((prev) => ({
          ...prev,
          [studentId]: res.data.isFollowing,
        }));
        addToast(res.data.message, "success");
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update follow status",
        "error",
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>Campus Network</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Student Discovery Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect with peers, find project collaborators, and follow
            university innovators
          </p>
        </div>

        {/* Search & Department Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 sm:w-64"
          >
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, skill, or handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field text-xs"
              style={{ paddingLeft: "2.25rem", height: "2.35rem" }}
            />
          </form>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field text-xs sm:w-56"
            style={{ height: "2.35rem" }}
          >
            {departments.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="glass-card p-16 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Discovering students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          No students found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => {
            const isMe = student._id === currentUser?._id;
            const isFollowing = followingMap[student._id];

            return (
              <div
                key={student._id}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={
                        student.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${student.username}`
                      }
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                    />
                    <span className="badge badge-indigo text-[9px]">
                      {student.year}
                    </span>
                  </div>

                  <Link
                    to={`/profile/${student.username}`}
                    className="text-base font-bold text-white hover:text-indigo-400 text-decoration-none transition-colors block"
                  >
                    {student.name}
                  </Link>
                  <p className="text-xs text-slate-400">@{student.username}</p>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {student.department}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {student.bio ||
                      "University student exploring tech and collaboration."}
                  </p>

                  {/* Skills Badges */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {student.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <Link
                    to={`/profile/${student.username}`}
                    className="btn-secondary text-xs flex-1 text-center justify-center"
                    style={{ padding: "0.45rem" }}
                  >
                    View Profile
                  </Link>

                  {!isMe && (
                    <button
                      onClick={() =>
                        handleFollowToggle(student._id, student.username)
                      }
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 border-0 cursor-pointer transition-all ${
                        isFollowing
                          ? "bg-white/10 text-slate-200 hover:bg-rose-500/20 hover:text-rose-200"
                          : "btn-primary"
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Students;
