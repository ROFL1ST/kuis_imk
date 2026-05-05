// src/pages/auth/ForgotPassword.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "../../services/api";
import toast from "react-hot-toast";

const BRAND = "var(--color-brand-400)";
const S100  = "var(--color-surface-100)";
const S200  = "var(--color-surface-200)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S950  = "var(--color-surface-950, #05050f)";

const ForgotPassword = () => {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent]   = useState(false);

  useEffect(() => { document.title = "Lupa Password | QuizApp"; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email wajib diisi");
    setLoading(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success("Link reset password telah dikirim!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim permintaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: S950 }}>
      {/* Blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:"400px", height:"400px", background:"rgb(99 102 241 / 0.07)", borderRadius:"50%", filter:"blur(100px)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, var(--color-surface-800) 1px, transparent 1px)`, backgroundSize:"32px 32px", opacity:0.28 }} />
      </div>

      <motion.div
        initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        className="max-w-md w-full rounded-3xl overflow-hidden relative"
        style={{ background:"rgb(10 10 22 / 0.80)", backdropFilter:"blur(20px)", border:`1px solid ${S800}`, boxShadow:"0 24px 60px rgb(0 0 0 / 0.50)", zIndex:1 }}
      >
        <div className="p-8">
          {/* Icon header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background:"rgb(99 102 241 / 0.10)", border:"1px solid rgb(99 102 241 / 0.20)" }}
            >
              <KeyRound size={26} style={{ color: BRAND }} />
            </div>
            <h2 className="text-2xl font-black" style={{ color: S100 }}>Lupa Password?</h2>
            <p className="text-sm mt-2" style={{ color: S500 }}>
              Jangan khawatir. Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password.
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black mb-2" style={{ color: S400 }}>Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: S600 }} />
                  <input
                    type="email" required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-sm font-medium"
                    style={{ background: S800, border:`1.5px solid ${S700}`, color: S100 }}
                    placeholder="nama@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.12)"; }}
                    onBlur={e  => { e.target.style.borderColor = S700;  e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", boxShadow:"0 8px 24px rgb(99 102 241 / 0.28)", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Kirim Link Reset"}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              className="text-center p-6 rounded-2xl"
              style={{ background:"rgb(74 222 128 / 0.06)", border:"1px solid rgb(74 222 128 / 0.18)" }}
            >
              <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color:"#4ade80" }} />
              <h3 className="font-black mb-2" style={{ color:"#4ade80" }}>Cek Email Anda</h3>
              <p className="text-sm mb-2" style={{ color: S400 }}>
                Kami telah mengirimkan link reset password ke <strong style={{ color: S200 }}>{email}</strong>.
              </p>
              <p className="text-xs" style={{ color: S600 }}>Tidak menerima email? Cek folder spam atau coba kirim ulang dalam beberapa menit.</p>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-xs font-black flex items-center justify-center gap-2 transition"
              style={{ color: S500 }}
              onMouseEnter={e => e.currentTarget.style.color = BRAND}
              onMouseLeave={e => e.currentTarget.style.color = S500}
            >
              <ArrowLeft size={14} /> Kembali ke Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
