// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI } from "../services/api";
import { getToken, setToken, removeToken, getUser, setUser as saveUser } from "../services/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setTokenState] = useState(getToken());
  
  // 1. Set loading TRUE di awal agar aplikasi menunggu cek token
  const [loading, setLoading] = useState(true);

  // 2. Effect untuk cek validitas token ke server saat refresh/load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      
      if (storedToken) {
        try {
          // Panggil API authMe
          const res = await authAPI.authMe();
          const { token: newToken, user: newUser } = res.data.data;

          // Update State & Storage jika token valid
          setTokenState(newToken);
          setUser(newUser);
          setToken(newToken);
          saveUser(newUser);
        } catch (error) {
          console.error("Sesi tidak valid:", error);
          logout(); // Token expired/invalid -> Logout
        }
      } else {
        logout(); // Tidak ada token -> Pastikan bersih
      }
      
      setLoading(false); // Proses selesai
    };

    initAuth();
  }, []);

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