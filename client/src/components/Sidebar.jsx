import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  FileCheck2,
  Calendar,
  Sparkles,
  User,
  Settings,
  Shield,
  Bell,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { name: "Academic Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Social Feed", path: "/feed", icon: MessageSquare },
    { name: "Student Discovery", path: "/students", icon: Users },
    { name: "Courses & Syllabi", path: "/courses", icon: BookOpen },
    { name: "Assignments", path: "/assignments", icon: FileCheck2 },
    { name: "Campus Events", path: "/events", icon: Calendar },
    { name: "Clubs & Guilds", path: "/clubs", icon: Sparkles },
    {
      name: "My Profile",
      path: `/profile/${user?.username || "me"}`,
      icon: User,
    },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed md:sticky top-[72px] left-0 h-[calc(100vh-72px)] w-64 shrink-0 overflow-y-auto bg-[#060818]/80 backdrop-blur-2xl border-r border-white/[0.08] z-40 flex flex-col justify-between p-5 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Campus Menu
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `nav-pill-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Student ID Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-slate-900/40 border border-indigo-500/25 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                {user?.studentId || "CAMPUS PASS"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.department || "UniSphere Portal"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
