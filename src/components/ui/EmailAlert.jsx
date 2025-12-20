import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AlertTriangle, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EmailAlert = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(() => {
    const isDismissed = sessionStorage.getItem("email_alert_dismissed");
    return !isDismissed;
  });

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("email_alert_dismissed", "true");
  };

  const hasEmail = user?.email && user.email.trim() !== "";
  
  if (!isAuthenticated || hasEmail) return null;

  const excludedPaths = ["/quiz", "/play", "/start"]; 
  const isExcluded = excludedPaths.some((path) => location.pathname.includes(path));

  if (isExcluded) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
          className="bg-orange-50 border-b border-orange-100 relative z-50 overflow-hidden"
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-orange-800 text-sm flex-1">
              <div className="bg-orange-100 p-1.5 rounded-lg shrink-0">
                <AlertTriangle size={16} className="text-orange-600" />
              </div>
              <span className="leading-snug">
                <span className="font-bold">Keamanan Akun:</span> Anda belum menautkan email. 
                Tambahkan email untuk pemulihan akun.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="whitespace-nowrap text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition flex items-center gap-1"
              >
                Tambah <span className="hidden sm:inline">Email</span> <ChevronRight size={14} />
              </Link>

              <button 
                onClick={handleDismiss}
                className="p-1.5 rounded-md hover:bg-orange-200/50 text-orange-400 hover:text-orange-700 transition"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailAlert;