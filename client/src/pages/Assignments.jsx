import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  Send,
  X,
  Upload,
  Calendar,
  Loader2,
} from "lucide-react";

import GradePanel from "../components/GradePanel";

const Assignments = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");
  const [dueFilter, setDueFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "submitted"
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Submission state
  const [submissionText, setSubmissionText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New assignment modal state (faculty / admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxPoints: 100,
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      let url = "/api/assignments?";
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (courseFilter) url += `courseId=${courseFilter}&`;
      if (dueFilter) url += `dueBefore=${dueFilter}&`;
      const res = await API.get(url);
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      addToast("Failed to fetch assignments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // Fetch available courses for creating assignment
    API.get("/api/courses")
      .then((res) => {
        if (res.data.success) setCourses(res.data.courses || []);
      })
      .catch(() => addToast("Could not load courses", "error"));
  }, [statusFilter, courseFilter, dueFilter]);

  const handleOpenDetail = (assign) => {
    setSelectedAssignment(assign);
    setSubmissionText(assign.mySubmission?.submissionText || "");
    setAttachmentUrl(assign.mySubmission?.attachmentUrl || "");
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !attachmentUrl.trim()) {
      addToast(
        "Please provide either written answer text or a project repository/document URL",
        "error",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post(
        `/api/assignments/${selectedAssignment._id}/submit`,
        {
          submissionText: submissionText.trim(),
          attachmentUrl: attachmentUrl.trim(),
        },
      );

      if (res.data.success) {
        addToast("Assignment submitted successfully!", "success");
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to submit assignment",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (
      !newAssignment.courseId ||
      !newAssignment.title ||
      !newAssignment.dueDate
    ) {
      addToast("Please select a course and fill all fields", "error");
      return;
    }

    try {
      const res = await API.post("/api/assignments", newAssignment);
      if (res.data.success) {
        addToast("Assignment created and published to students!", "success");
        setShowCreateModal(false);
        fetchAssignments();
        setNewAssignment({
          courseId: "",
          title: "",
          description: "",
          dueDate: "",
          maxPoints: 100,
        });
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to create assignment",
        "error",
      );
    }
  };

  const isStaff = user?.role === "faculty" || user?.role === "admin";

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Filter by course"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="input-field sm:w-auto text-xs"
        >
          <option value="">All courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-3 text-xs text-slate-400">
          Due by{" "}
          <input
            aria-label="Due by"
            type="date"
            className="input-field w-auto"
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
          />
        </label>
      </div>
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>Academic Deliverables</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Course Assignments & Tasks
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track upcoming deadlines, submit project links, and check grading
            feedback
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            {["all", "pending", "submitted"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all border-0 cursor-pointer ${
                  statusFilter === tab
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white bg-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {isStaff && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs"
              style={{ padding: "0.55rem 1rem" }}
            >
              <PlusCircle className="w-4 h-4" />
              New Assignment
            </button>
          )}
        </div>
      </div>

      {/* Assignment List */}
      {loading ? (
        <div className="glass-card p-16 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 text-sm">
          No assignments found matching this status filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assign) => (
            <div
              key={assign._id}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-indigo text-[10px]">
                    {assign.course?.code}
                  </span>
                  <span
                    className={`badge text-[9px] ${
                      assign.isSubmitted ? "badge-emerald" : "badge-amber"
                    }`}
                  >
                    {assign.isSubmitted ? "Submitted ✓" : "Pending Due"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {assign.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {assign.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Due: {new Date(assign.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenDetail(assign)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold border-0 cursor-pointer ${
                    assign.isSubmitted ? "btn-secondary" : "btn-primary"
                  }`}
                >
                  {assign.isSubmitted ? "Review Submission" : "Submit Work"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Detail & Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 shadow-2xl relative border border-indigo-500/30">
            <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="badge badge-indigo text-[10px] mb-1">
                  {selectedAssignment.course?.code} -{" "}
                  {selectedAssignment.course?.title}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Due: {new Date(selectedAssignment.dueDate).toLocaleString()} •
                  Max Points: {selectedAssignment.maxPoints}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Instructions
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                {selectedAssignment.description}
              </p>
            </div>

            {isStaff && (
              <GradePanel
                assignment={selectedAssignment}
                onUpdate={() => {
                  fetchAssignments();
                  setSelectedAssignment(null);
                }}
              />
            )}
            {/* Submission Form */}
            <form
              onSubmit={handleSubmitAssignment}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Student Written Notes / Code Snippets
                </label>
                <textarea
                  placeholder="Paste written solutions, architectural rationale, or summary..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="input-field text-xs min-h-[90px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Project Repository or Document Link
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/project-repo"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              {selectedAssignment.isSubmitted &&
                selectedAssignment.mySubmission && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        Submitted on{" "}
                        {new Date(
                          selectedAssignment.mySubmission.submittedAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedAssignment.mySubmission.grade !== undefined && (
                      <p className="mt-1">
                        Grade:{" "}
                        <strong>
                          {selectedAssignment.mySubmission.grade}/
                          {selectedAssignment.maxPoints}
                        </strong>
                      </p>
                    )}
                    {selectedAssignment.mySubmission.feedback && (
                      <p className="text-emerald-300/80 mt-0.5">
                        Feedback: {selectedAssignment.mySubmission.feedback}
                      </p>
                    )}
                  </div>
                )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="btn-secondary text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs"
                >
                  {submitting
                    ? "Submitting..."
                    : selectedAssignment.isSubmitted
                      ? "Update Submission"
                      : "Turn In Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 shadow-2xl relative border border-indigo-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">
                Create New Course Assignment
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateAssignment}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Course
                </label>
                <select
                  value={newAssignment.courseId}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      courseId: e.target.value,
                    })
                  }
                  className="input-field text-xs"
                  required
                >
                  <option value="" className="bg-slate-900 text-white">
                    Select Course
                  </option>
                  {courses.map((c) => (
                    <option
                      key={c._id}
                      value={c._id}
                      className="bg-slate-900 text-white"
                    >
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Database Assignment 2"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      title: e.target.value,
                    })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: e.target.value,
                      })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={newAssignment.maxPoints}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        maxPoints: Number(e.target.value),
                      })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description & Specs
                </label>
                <textarea
                  placeholder="Detailed assignment specifications and deliverables..."
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      description: e.target.value,
                    })
                  }
                  className="input-field text-xs min-h-[80px]"
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
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
