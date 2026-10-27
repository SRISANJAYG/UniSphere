import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import {
  BookOpen,
  Search,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  FileText,
  Megaphone,
  Download,
  PlusCircle,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";

import PublishPanel from "../components/PublishPanel";

const Courses = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "enrolled"
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Modal for new course creation (staff / admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    description: "",
    department: "Computer Science & Engineering",
    instructor: "",
    credits: 4,
    schedule: "Mon, Wed, Fri 10:00 AM",
    room: "LH-101",
    syllabus: "",
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let url = "/api/courses?";
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}`;
      const res = await API.get(url);
      if (res.data.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      addToast("Failed to fetch courses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnrollToggle = async (courseId) => {
    try {
      const res = await API.post(`/api/courses/${courseId}/enroll`);
      if (res.data.success) {
        addToast(res.data.message, "success");
        // Update local courses state
        setCourses((prev) =>
          prev.map((c) => {
            if (c._id === courseId) {
              const enrolled = res.data.enrolled;
              const nextStudents = enrolled
                ? [...(c.enrolledStudents || []), user._id]
                : (c.enrolledStudents || []).filter(
                    (s) => s !== user._id && s._id !== user._id,
                  );
              return { ...c, enrolledStudents: nextStudents };
            }
            return c;
          }),
        );
        if (selectedCourse && selectedCourse._id === courseId) {
          setSelectedCourse((prev) => ({
            ...prev,
            enrolledStudents: res.data.enrolled
              ? [...(prev.enrolledStudents || []), user._id]
              : (prev.enrolledStudents || []).filter(
                  (s) => s !== user._id && s._id !== user._id,
                ),
          }));
        }
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Enrollment action failed",
        "error",
      );
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/courses", newCourse);
      if (res.data.success) {
        addToast("Course created successfully!", "success");
        setCourses((prev) => [...prev, res.data.course]);
        setShowCreateModal(false);
        setNewCourse({
          code: "",
          title: "",
          description: "",
          department: "Computer Science & Engineering",
          instructor: "",
          credits: 4,
          schedule: "Mon, Wed, Fri 10:00 AM",
          room: "LH-101",
          syllabus: "",
        });
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to create course",
        "error",
      );
    }
  };

  const isEnrolled = (course) => {
    return course.enrolledStudents?.some(
      (s) => s === user?._id || s._id === user?._id,
    );
  };

  const displayedCourses = courses.filter((c) => {
    if (filterType === "enrolled") return isEnrolled(c);
    return true;
  });

  const isStaff = user?.role === "faculty" || user?.role === "admin";

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchCourses();
        }}
        className="flex gap-3"
      >
        <input
          aria-label="Search courses"
          className="input-field"
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-secondary" type="submit">
          Search
        </button>
      </form>
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Academic Curriculum</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Course Hub & Syllabi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse university courses, review syllabus outlines, download
            lecture resources, and enroll
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Filter */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all border-0 cursor-pointer ${
                filterType === "all"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setFilterType("enrolled")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all border-0 cursor-pointer ${
                filterType === "enrolled"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              My Enrolled
            </button>
          </div>

          {isStaff && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs"
              style={{ padding: "0.55rem 1rem" }}
            >
              <PlusCircle className="w-4 h-4" />
              New Course
            </button>
          )}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="glass-card p-16 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">
            Loading university courses...
          </p>
        </div>
      ) : displayedCourses.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 text-sm">
          No courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCourses.map((course) => {
            const enrolled = isEnrolled(course);
            return (
              <div
                key={course._id}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge badge-indigo text-[10px]">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Instructor:</span>
                      <span className="font-semibold text-slate-200">
                        {course.instructor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Room: {course.room}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="btn-secondary text-xs flex-1 text-center justify-center"
                    style={{ padding: "0.5rem" }}
                  >
                    View Syllabus & Notes
                  </button>

                  <button
                    onClick={() => handleEnrollToggle(course._id)}
                    className={`text-xs px-3.5 py-2 rounded-xl font-semibold border-0 cursor-pointer transition-all ${
                      enrolled
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "btn-primary"
                    }`}
                  >
                    {enrolled ? "Enrolled ✓" : "Enroll"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-indigo-500/30">
            <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-indigo text-[10px]">
                    {selectedCourse.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedCourse.department}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedCourse.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Instructor: {selectedCourse.instructor}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Course Overview
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            {/* Syllabus */}
            {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Curriculum Modules
                </h4>
                <div className="flex flex-col gap-2">
                  {selectedCourse.syllabus.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lecture Resources */}
            {selectedCourse.resources &&
              selectedCourse.resources.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Study Materials & Documents
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedCourse.resources.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 text-slate-200">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span className="font-semibold">{res.title}</span>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-decoration-none"
                        >
                          <Download className="w-3.5 h-3.5" /> Access
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Announcements */}
            {selectedCourse.announcements &&
              selectedCourse.announcements.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Course Announcements
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedCourse.announcements.map((a, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-white mb-1">
                          <Megaphone className="w-4 h-4 text-purple-400" />
                          <span>{a.title}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {a.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {isStaff && (
              <PublishPanel
                resources
                basePath={"/api/courses/" + selectedCourse._id}
                onUpdate={(data) => {
                  setSelectedCourse((prev) => ({
                    ...prev,
                    ...(data.resources ? { resources: data.resources } : {}),
                    ...(data.announcements
                      ? { announcements: data.announcements }
                      : {}),
                  }));
                  fetchCourses();
                }}
              />
            )}
            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
              <span className="text-xs text-slate-400">
                {selectedCourse.enrolledStudents?.length || 0} students enrolled
              </span>
              <button
                onClick={() => handleEnrollToggle(selectedCourse._id)}
                className={`btn-primary text-xs ${
                  isEnrolled(selectedCourse)
                    ? "bg-emerald-600 border-emerald-500"
                    : ""
                }`}
              >
                {isEnrolled(selectedCourse)
                  ? "Enrolled ✓ (Click to Drop)"
                  : "Enroll in Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 shadow-2xl relative border border-indigo-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">
                Create New University Course
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS402"
                    value={newCourse.code}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, code: e.target.value })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={newCourse.credits}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        credits: Number(e.target.value),
                      })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Cloud Systems"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Instructor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Marcus Vance"
                  value={newCourse.instructor}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, instructor: e.target.value })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Comprehensive description of the course..."
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
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
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
