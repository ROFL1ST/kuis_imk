// src/components/layout/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Memuat data akun...
      </div>
    );
  }

  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
};

export default ProtectedRoute;