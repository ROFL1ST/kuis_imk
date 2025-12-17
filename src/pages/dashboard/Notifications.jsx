import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  Check,
  Clock,
} from "lucide-react";
import { notificationAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
  });
  useEffect(() => {
    document.title = "Notifikasi | QuizApp";
  }, []);

  // Fetch Notifikasi dari Database
  const fetchNotifs = async () => {
    try {
      const res = await notificationAPI.getList();
      setNotifs(res.data.data);
    } catch (error) {
      console.error("Gagal load notifikasi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Handler: Tandai sudah dibaca
  const handleMarkRead = async (id, link) => {
    try {
      // Update UI Optimistic
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      // Call API (Background)
      await notificationAPI.markRead(id);

      // Jika ada link, redirect
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Hapus Semua
  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifs([]);
      toast.success("Notifikasi dibersihkan");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membersihkan");
    } finally {
      setConfirmModal({ isOpen: false });
    }
  };

  // Helper Icon & Warna
  const getStyle = (type) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="text-green-500" />,
          bg: "bg-green-50 border-green-100",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="text-orange-500" />,
          bg: "bg-orange-50 border-orange-100",
        };
      case "error":
        return {
          icon: <X className="text-red-500" />,
          bg: "bg-red-50 border-red-100",
        };
      default:
        return {
          icon: <Info className="text-blue-500" />,
          bg: "bg-blue-50 border-blue-100",
        };
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 py-8 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifikasi</h1>
            <p className="text-slate-500 text-sm">
              Update aktivitas terbaru Anda
            </p>
          </div>
        </div>

        {notifs.length > 0 && (
          <button
            onClick={() => setConfirmModal({ isOpen: true })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition"
          >
            <Trash2 size={16} /> Bersihkan
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Memuat...</div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Bell size={32} />
            </div>
            <h3 className="font-bold text-slate-700 text-lg">
              Tidak ada notifikasi
            </h3>
            <p className="text-slate-400 text-sm">
              Semua update akan muncul di sini.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notifs.map((n) => {
              const style = getStyle(n.type);
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleMarkRead(n.id, n.link)}
                  className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-md ${
                    n.is_read
                      ? "bg-white border-slate-100 opacity-70"
                      : `border-transparent shadow-sm ${style.bg}`
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 flex-shrink-0 ${
                        n.is_read ? "grayscale opacity-50" : ""
                      }`}
                    >
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4
                          className={`font-bold text-base ${
                            n.is_read ? "text-slate-600" : "text-slate-800"
                          }`}
                        >
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-1 leading-relaxed ${
                          n.is_read ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {n.message}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> {timeAgo(n.created_at)}
                        </span>
                        {n.link && (
                          <span className="text-xs font-bold text-indigo-500 hover:underline">
                            Lihat Detail
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, friendId: null, friendName: "" })
        }
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Hapus Notifikasi?
          </h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Apakah Anda yakin ingin menghapus semua daftar notifikasi?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: false,
                  friendId: null,
                  friendName: "",
                })
              }
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Notifications;
