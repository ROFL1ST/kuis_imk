// src/pages/auth/ResetPassword.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Save, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { resetPassword } from "../../services/api";
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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token    = searchParams.get("token");

  const [form, setForm]       = useState({ password:"", confirmPassword:"" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { document.title = "Reset Password | QuizApp"; }, []);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: S950 }}>
        <p className="text-sm" style={{ color: S500 }}>Token reset password tidak valid atau hilang.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)              return toast.error("Password minimal 6 karakter");
    if (form.password !== form.confirmPassword) return toast.error("Konfirmasi password tidak cocok");
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      toast.success("Password berhasil diubah!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mereset password. Token mungkin sudah kadaluarsa.");
    } finally {
      setLoading(false);
    }
  };

  const passInput = (field, placeholder) => (
    <div>
      <label className="block text-xs font-black mb-2" style={{ color: S400 }}>
        {field === "password" ? "Password Baru" : "Konfirmasi Password"}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: S600 }} />
        <input
          type={showPass ? "text" : "password"}
          required
          className="w-full pl-11 pr-12 py-3.5 rounded-xl outline-none transition-all text-sm font-medium"
          style={{ background: S800, border:`1.5px solid ${S700}`, color: S100 }}
          placeholder={placeholder}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.12)"; }}
          onBlur={e  => { e.target.style.borderColor = S700;  e.target.style.boxShadow = "none"; }}
        />
        {field === "password" && (
          <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: S600 }}
            onMouseEnter={e => e.currentTarget.style.color = S300}
            onMouseLeave={e => e.currentTarget.style.color = S600}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: S950 }}>
      {/* Blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:"400px", height:"400px", background:"rgb(99 102 241 / 0.07)", borderRadius:"50%", filter:"blur(100px)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, var(--color-surface-800) 1px, transparent 1px)`, backgroundSize:"32px 32px", opacity:0.28 }} />
      </div>

      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="max-w-md w-full rounded-3xl overflow-hidden"
        style={{ background:"rgb(10 10 22 / 0.80)", backdropFilter:"blur(20px)", border:`1px solid ${S800}`, boxShadow:"0 24px 60px rgb(0 0 0 / 0.50)", position:"relative", zIndex:1 }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background:"rgb(99 102 241 / 0.10)", border:"1px solid rgb(99 102 241 / 0.20)" }}
            >
              <ShieldCheck size={26} style={{ color: BRAND }} />
            </div>
            <h2 className="text-2xl font-black" style={{ color: S100 }}>Password Baru</h2>
            <p className="text-sm mt-2" style={{ color: S500 }}>Silakan buat password baru yang aman untuk akun Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {passInput("password",        "Minimal 6 karakter")}
            {passInput("confirmPassword", "Ulangi password baru")}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", boxShadow:"0 8px 24px rgb(99 102 241 / 0.28)", opacity: loading ? 0.6 : 1 }}
            >
              {loading
                ? <Loader2 className="animate-spin" size={18} />
                : <><Save size={16} /> Simpan Password</>
              }
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
