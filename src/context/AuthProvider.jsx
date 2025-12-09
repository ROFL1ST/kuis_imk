import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI } from "../services/api";
import { getToken, setToken, removeToken, getUser, setUser as saveUser } from "../services/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      const { token: newToken, user: newUser } = res.data.data;

      setTokenState(newToken);
      setUser(newUser);
      setToken(newToken);
      saveUser(newUser);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login gagal" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setTokenState(null);
    setUser(null);
    removeToken();
  };

  const value = { user, token, login, logout, loading, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};