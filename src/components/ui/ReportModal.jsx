import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, AlertOctagon } from "lucide-react";
import toast from "react-hot-toast";
import { reportAPI } from "../../services/newFeatures";

const ReportModal = ({ isOpen, onClose, targetId, targetType }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Mohon berikan alasan");

    setLoading(true);
    try {
      const res = await reportAPI.createReport({
        target_id: targetId,
        target_type: targetType,
        reason: reason,
      });

      if (res.data.status === "success") {
        toast.success("Laporan berhasil dikirim");
        onClose();
        setReason("");
      }
    } catch (error) {
      toast.error("Gagal mengirim laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden">
              <div className="p-6 bg-red-50 border-b border-red-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Flag className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Laporkan Konten</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-0.5">
                      {targetType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mengapa Anda melaporkan ini?
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Jelaskan masalahnya..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-32 text-gray-700"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      "Mengirim..."
                    ) : (
                      <>
                        <AlertOctagon className="w-4 h-4" />
                        Kirim Laporan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
