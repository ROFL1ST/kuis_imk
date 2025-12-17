import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EmailAlert = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const hasEmail = user?.email && user.email.trim() !== "";
  
  if (!isAuthenticated || hasEmail) return null;

  const excludedPaths = ["/quiz", "/play", "/start"]; 

  const isExcluded = excludedPaths.some((path) => location.pathname.includes(path));

  if (isExcluded) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-orange-50 border-b border-orange-100 relative z-50"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-orange-800 text-sm">
            <div className="bg-orange-100 p-1.5 rounded-lg">
              <AlertTriangle size={16} className="text-orange-600" />
            </div>
            <span>
              <span className="font-bold">Keamanan Akun:</span> Anda belum menautkan email. 
              Tambahkan email untuk memulihkan akun jika lupa password.
            </span>
          </div>

          <Link
            to="/settings"
            className="whitespace-nowrap text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition flex items-center gap-1"
          >
            Tambah Email <ChevronRight size={14} />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailAlert;