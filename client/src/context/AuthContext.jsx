import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = async () => {
    const res = await API.get("/api/users/profile");
    setUser(res.data.user);
    return res.data.user;
  };
  useEffect(() => {
    localStorage.removeItem("unisphere_token");
    localStorage.removeItem("unisphere_user");
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const login = async (loginIdentifier, password) => {
    const { data } = await API.post("/api/auth/login", {
      loginIdentifier,
      password,
    });
    setUser(data.user);
    return data;
  };
  const register = async (form) => {
    const { data } = await API.post("/api/auth/register", form);
    setUser(data.user);
    return data;
  };
  const logout = async () => {
    await API.post("/api/auth/logout");
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser: setUser,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
