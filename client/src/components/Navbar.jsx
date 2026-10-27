import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import { UniSphereLogo } from "./UniSphereLogo";
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  Menu,
  CheckCheck,
  ChevronDown,
} from "lucide-react";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch notifications for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const res = await API.get("/api/notifications");
        if (res.data?.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // Silent catch
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put("/api/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast("All notifications marked as read", "success");
    } catch (err) {
      addToast("Failed to mark notifications read", "error");
    }
  };

  const handleLogout = async () => {
    await logout();
    addToast("Logged out successfully", "info");
    navigate("/login");
  };

  return (
    <header className="glass-nav">
      <div
        className="app-container"
        style={{
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-8 text-xs text-slate-400 absolute left-1/2 -translate-x-1/2">
            <Link to="/#possibilities">The experience</Link>
            <Link to="/register">Your community</Link>
          </nav>
        )}
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated && !["/", "/login", "/register"].includes(location.pathname) && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors md:hidden border-0 bg-transparent cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center text-decoration-none group transition-transform hover:scale-[1.02]"
          >
            <UniSphereLogo size={36} showTagline={false} />
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        {isAuthenticated && (
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 max-w-lg mx-auto"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search students by name, department, or skill…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: "2.75rem",
                height: "2.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
              }}
            />
          </form>
        )}

        {/* Right: Actions / Auth User Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              {/* Notification Bell with Badge */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 bg-white/[0.03] cursor-pointer relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Drawer */}
                {showNotifications && (
                  <div
                    className="glass-elevated animate-slideDown absolute right-0 mt-3 w-80 sm:w-96 p-4 shadow-2xl z-50"
                    style={{ borderRadius: "var(--radius-lg)" }}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="badge badge-indigo text-[10px]">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold bg-transparent border-0 cursor-pointer transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="block text-xs text-sky-200 mb-3"
                    >
                      View all notifications →
                    </Link>
                    <div className="max-h-80 overflow-y-auto flex flex-col gap-2.5 pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No notifications at the moment.
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item._id}
                            className={`p-3 rounded-2xl transition-all text-xs flex gap-3 ${
                              item.isRead
                                ? "bg-white/[0.02] border border-transparent"
                                : "bg-indigo-950/40 border border-indigo-500/30"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                              <Bell className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-200 font-medium leading-relaxed">
                                {item.message}
                              </p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {new Date(item.createdAt).toLocaleDateString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill & Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white/10 transition-all text-left bg-white/[0.04] border border-white/10 cursor-pointer"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || "student"}`
                    }
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/50 shadow-sm"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white leading-tight">
                      {user?.name?.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-indigo-300 font-medium leading-tight">
                      @{user?.username}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div
                    className="glass-elevated animate-slideDown absolute right-0 mt-3 w-60 p-2 shadow-2xl z-50"
                    style={{ borderRadius: "var(--radius-lg)" }}
                  >
                    <div className="p-3 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user?.email}
                      </p>
                      <span className="badge badge-indigo mt-1.5 text-[9px]">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to={`/profile/${user?.username || user?._id}`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold text-decoration-none transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      View Profile
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold text-decoration-none transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings & Preferences
                    </Link>

                    <div className="border-t border-white/10 my-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 text-xs font-semibold border-0 bg-transparent cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="btn-secondary text-xs"
                style={{ padding: "0.55rem 1.25rem" }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-xs hidden sm:inline-flex"
                style={{ padding: "0.55rem 1.25rem" }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
