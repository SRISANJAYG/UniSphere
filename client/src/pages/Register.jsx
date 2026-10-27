import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UniSphereLogo } from "../components/UniSphereLogo";
import { User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    department: "Computer Science & Engineering",
    course: "B.Tech Computer Science",
    year: "1st Year",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const departments = [
    "Computer Science & Engineering",
    "Artificial Intelligence & Data Science",
    "Electronics & Communication",
    "Mechanical & Robotics",
    "Information Technology",
    "Design & Creative Media",
  ];

  const years = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "Postgraduate",
    "Faculty",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await register(formData);
      if (res.success) {
        addToast(
          "Welcome to UniSphere! Your student account is active.",
          "success",
        );
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Registration failed. Please check inputs.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 relative py-12">
      {/* Ambient Mesh Orbs */}
      <div className="ambient-mesh">
        <div className="ambient-orb orb-primary" />
        <div className="ambient-orb orb-secondary" />
      </div>

      <div className="glass-panel w-full max-w-lg p-8 sm:p-10 shadow-2xl relative z-10 border border-indigo-500/30 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <UniSphereLogo size={48} variant="icon" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Join your university's digital community & academic network
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs mb-5 animate-fadeIn">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Jordan Lee"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field text-xs"
                  style={{ paddingLeft: "2.75rem" }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="e.g. jordanl"
                value={formData.username}
                onChange={handleChange}
                className="input-field text-xs"
                required
              />
            </div>
          </div>

          {/* Email & Password */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                placeholder="jordan@unisphere.edu"
                value={formData.email}
                onChange={handleChange}
                className="input-field text-xs"
                style={{ paddingLeft: "2.75rem" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="input-field text-xs"
                style={{ paddingLeft: "2.75rem" }}
                required
              />
            </div>
          </div>

          {/* Department & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field text-xs cursor-pointer"
              >
                {departments.map((dept) => (
                  <option
                    key={dept}
                    value={dept}
                    className="bg-slate-900 text-white"
                  >
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Academic Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="input-field text-xs cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-3 text-sm"
            style={{ padding: "0.85rem", borderRadius: "var(--radius-full)" }}
          >
            {loading ? "Creating Profile..." : "Complete Student Registration"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-8 pt-5 border-t border-white/[0.08] text-xs text-slate-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-bold text-decoration-none transition-colors"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
