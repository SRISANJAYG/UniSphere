import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UniSphereLogo } from "../components/UniSphereLogo";
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

import API from "../api/axios";

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [demo, setDemo] = useState(false);
  useEffect(() => {
    API.get("/api/health")
      .then(({ data }) => setDemo(data.demo === true))
      .catch(() => {});
  }, []);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !password) {
      setErrorMsg("Please fill in both email/username and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await login(loginIdentifier, password);
      if (res.success) {
        addToast(`Welcome back, ${res.user.name}!`, "success");
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Filler
  const fillDemoAccount = () => {
    setLoginIdentifier("alexr");
    setPassword("Student@123");
    setErrorMsg("");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 relative py-12">
      {/* Ambient Mesh Orbs */}
      <div className="ambient-mesh">
        <div className="ambient-orb orb-primary" />
        <div className="ambient-orb orb-secondary" />
      </div>

      <div className="glass-panel w-full max-w-md p-8 sm:p-10 shadow-2xl relative z-10 border border-indigo-500/30 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <UniSphereLogo size={48} variant="icon" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your UniSphere academic and social campus
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        {demo && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 shadow-inner">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Demo Student Credentials</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Username: <code className="text-white">alexr</code> | Pass:{" "}
                <code className="text-white">Student@123</code>
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="btn-secondary text-xs"
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              Auto-Fill
            </button>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs mb-5 animate-fadeIn">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="alex@unisphere.edu or alexr"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="input-field"
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "2.75rem", paddingRight: "3rem" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-3 text-sm"
            style={{ padding: "0.85rem", borderRadius: "var(--radius-full)" }}
          >
            {loading ? "Authenticating..." : "Sign In to UniSphere"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-8 pt-5 border-t border-white/[0.08] text-xs text-slate-400">
          New to UniSphere?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-bold text-decoration-none transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
