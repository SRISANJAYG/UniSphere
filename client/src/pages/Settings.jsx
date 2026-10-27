import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  CreditCard,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const Settings = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "payments"

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    department: user?.department || "Computer Science & Engineering",
    course: user?.course || "B.Tech Computer Science",
    year: user?.year || "3rd Year",
    avatar: user?.avatar || "",
    skills: user?.skills?.join(", ") || "",
    interests: user?.interests?.join(", ") || "",
  });

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === "payments") {
      setLoadingPayments(true);
      API.get("/api/payments/history")
        .then((res) => {
          if (res.data.success) {
            setPayments(res.data.payments || []);
          }
        })
        .catch(() => addToast("Failed to fetch payment history", "error"))
        .finally(() => setLoadingPayments(false));
    }
  }, [activeTab]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put("/api/users/profile", formData);
      if (res.data.success) {
        updateUser(res.data.user);
        addToast("Profile settings updated successfully!", "success");
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>Student Account</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Profile & Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your public student identity, academic credentials, and
            payment history
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all border-0 cursor-pointer ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white bg-transparent"
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all border-0 cursor-pointer ${
              activeTab === "payments"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white bg-transparent"
            }`}
          >
            Payment Receipts
          </button>
        </div>
      </div>

      {activeTab === "profile" ? (
        <form
          onSubmit={handleSaveProfile}
          className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-5 border border-white/10"
        >
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <img
              src={
                formData.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || "student"}`
              }
              alt="Avatar preview"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
            />
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Avatar Image URL (or DiceBear seed)
              </label>
              <input
                type="text"
                name="avatar"
                placeholder="https://images.unsplash.com/... or leave blank for cartoon avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Username (Handle)
              </label>
              <input
                type="text"
                value={`@${user?.username}`}
                disabled
                className="input-field text-xs opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Bio / Headline
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell other students about your interests, current projects, and background..."
              className="input-field text-xs min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Degree / Course
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Academic Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="input-field text-xs"
              >
                {[
                  "1st Year",
                  "2nd Year",
                  "3rd Year",
                  "4th Year",
                  "Postgraduate",
                  "Faculty",
                ].map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python, UI Design, AWS"
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Interests (comma-separated)
            </label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g. Hackathons, Robotics, Machine Learning, Web3"
              className="input-field text-xs"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs"
              style={{ padding: "0.6rem 1.5rem" }}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-4 border border-white/10">
          <h3 className="text-base font-bold text-white">
            Razorpay Payment & Event History
          </h3>
          <p className="text-xs text-slate-400">
            Records of verified transactions, event registration receipts, and
            payment status.
          </p>

          {loadingPayments ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Loading transactions...
            </p>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white/[0.02] rounded-xl border border-white/5">
              No transactions recorded yet. When you register for paid events,
              receipts will appear here.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {p.event?.title || "Campus Event Registration"}
                      </span>
                      <span
                        className={`badge text-[9px] ${
                          p.status === "verified"
                            ? "badge-emerald"
                            : "badge-amber"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Order: <code>{p.razorpayOrderId}</code> • Payment:{" "}
                      <code>{p.razorpayPaymentId || "Pending"}</code>
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(p.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-white">
                      ₹{p.amount}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {p.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
