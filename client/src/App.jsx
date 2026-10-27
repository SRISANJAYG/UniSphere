import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import SpaceBackground from "./components/SpaceBackground";
import "./space-theme.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Students from "./pages/Students";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import Settings from "./pages/Settings";

import Notifications from "./pages/Notifications";

import API from "./api/axios";

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    API.get("/api/health")
      .then(({ data }) => setDemo(data.demo === true))
      .catch(() => {});
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if current route is landing, login, or register
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="unisphere-app min-h-screen flex flex-col text-slate-100 relative">
      <SpaceBackground sparse={location.pathname === "/"}/>
      {/* Top Liquid Glass Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {demo && (
        <div
          role="status"
          className="text-center text-xs py-2 px-3 bg-sky-950 text-sky-200 border-b border-sky-800"
        >
          SHOWCASE DEMO · Sample accounts and activity · Test checkout unavailable
        </div>
      )}
      {/* Main App Container */}
      <div className="app-page-shell flex-1 flex">
        {/* Render Sidebar only on authenticated app pages */}
        {isAuthenticated && !isAuthPage && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Content Area with Generous Framer-Level Spacing */}
        <main
          key={location.pathname}
          className={`flex-1 transition-all ${
            isAuthenticated && !isAuthPage
              ? "page-container max-w-7xl mx-auto w-full"
              : ""
          }`}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Core Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clubs"
              element={
                <ProtectedRoute>
                  <Clubs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
