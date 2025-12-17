import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { forgotPassword } from "../../services/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email wajib diisi");

    setLoading(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success("Link reset password telah dikirim!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengirim permintaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Lupa Password?</h2>
            <p className="text-slate-500 text-sm mt-2">
              Jangan khawatir. Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password.
            </p>
          </div>

          {!isSent ? (
            /* --- FORM INPUT EMAIL --- */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Kirim Link Reset"}
              </button>
            </form>
          ) : (
            /* --- STATE SETELAH KIRIM (SUCCESS) --- */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-green-50 p-6 rounded-xl border border-green-100"
            >
              <h3 className="font-bold text-green-800 mb-2">Cek Email Anda</h3>
              <p className="text-sm text-green-700 mb-4">
                Kami telah mengirimkan link reset password ke <strong>{email}</strong>.
              </p>
              <p className="text-xs text-green-600/80">
                Tidak menerima email? Cek folder spam atau coba kirim ulang dalam beberapa menit.
              </p>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;