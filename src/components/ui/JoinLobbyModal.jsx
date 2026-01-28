import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socialAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext"; // NEW
import toast from "react-hot-toast";
import { KeyRound, Loader2, X } from "lucide-react"; // Import X
import { motion, AnimatePresence } from "framer-motion"; // Import Animation

const JoinLobbyModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error(t("challenge.enterCode"));
      return;
    }

    setLoading(true);
    try {
      const res = await socialAPI.joinChallengeByCode(code);
      const challenge = res.data.data;
      toast.success(t("challenge.joinRoom") + " Success!");
      onClose();
      navigate(`/lobby/${challenge.ID}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t("review.failed"));
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
            {/* Main Modal Content */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto overflow-hidden flex flex-col relative">
              {/* Close Button Absolute */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-6">
                <div className="text-center mb-5 mt-1">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-indigo-50/50">
                    <KeyRound size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t("challenge.joinRoom")}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {t("challenge.enterCode")}
                  </p>
                </div>

                <form onSubmit={handleJoin} className="space-y-5">
                  <div>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder={t("classroom.codePlaceholder").split(" ")[0]}
                      maxLength={6}
                      className="w-full text-center text-4xl font-black tracking-[0.3em] py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none uppercase placeholder:text-slate-200 transition-all font-mono"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      t("challenge.join").toUpperCase() + " SEKARANG"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JoinLobbyModal;
