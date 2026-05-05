// src/pages/auth/Login.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { LogIn, User, Lock, Sparkles, ArrowRight, Coins, Zap } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { useLanguage } from "../../context/LanguageContext";

const BRAND = "var(--color-brand-400)";
const S100  = "var(--color-surface-100)";
const S300  = "var(--color-surface-300)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S900  = "var(--color-surface-900)";
const S950  = "var(--color-surface-950, #05050f)";

const DarkInput = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: S600 }} />
    <input
      {...props}
      className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all font-medium text-sm"
      style={{
        background: S800,
        border: `1.5px solid ${S700}`,
        color: S100,
      }}
      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.12)"; }}
      onBlur={e  => { e.target.style.borderColor = S700;  e.target.style.boxShadow = "none"; }}
    />
  </div>
);

const Login = () => {
  const { login, loading } = useAuth();
  const { t }              = useLanguage();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [form, setForm]               = useState({ username: "", password: "" });
  const [rewardData, setRewardData]   = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const from = location.state?.from || "/dashboard";

  useEffect(() => { document.title = "Login | QuizApp"; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error("Semua field harus diisi!");
    const result = await login(form);
    if (result.success) {
      if (result.coins_gained > 0) {
        setRewardData({ coins: result.coins_gained, message: result.streak_message });
        setShowRewardModal(true);
      } else {
        toast.success(t("auth.success"));
        navigate(from, { replace: true });
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleCloseReward = () => {
    setShowRewardModal(false);
    navigate(from, { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: S950 }}
    >
      {/* Ambient blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:"500px", height:"500px", background:"rgb(99 102 241 / 0.07)", borderRadius:"50%", filter:"blur(100px)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-10%",  width:"500px", height:"500px", background:"rgb(139 92 246 / 0.06)", borderRadius:"50%", filter:"blur(100px)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, var(--color-surface-800) 1px, transparent 1px)`, backgroundSize:"32px 32px", opacity:0.30 }} />
      </div>

      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="w-full max-w-md relative" style={{ zIndex:1 }}
      >
        {/* Logo */}
        <motion.div className="text-center mb-8" initial={{ scale:0.9 }} animate={{ scale:1 }} transition={{ delay:0.2 }}>
          <div className="flex gap-3 items-center justify-center mb-2">
            <div className="p-2 rounded-xl" style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow:"0 4px 16px rgb(99 102 241 / 0.35)" }}>
              <Zap size={22} fill="white" style={{ color:"white" }} />
            </div>
            <span className="text-3xl font-black" style={{ background:"linear-gradient(90deg,#818cf8,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>QuizApp</span>
          </div>
          <p className="text-sm" style={{ color: S500 }}>{t("auth.loginSubtitle")}</p>
        </motion.div>

        {/* Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="p-8 rounded-3xl relative overflow-hidden"
          style={{ background:"rgb(10 10 22 / 0.80)", backdropFilter:"blur(20px)", border:`1px solid ${S800}`, boxShadow:"0 24px 60px rgb(0 0 0 / 0.50)" }}
        >
          {/* Inner glow */}
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"180px", height:"180px", background:"rgb(99 102 241 / 0.06)", borderRadius:"50%", filter:"blur(50px)", pointerEvents:"none" }} />

          <div className="flex items-center justify-center gap-3 mb-8">
            <LogIn size={22} style={{ color: BRAND }} />
            <h2 className="text-2xl font-black" style={{ color: S100 }}>{t("auth.loginTitle")}</h2>
          </div>

          <div className="space-y-5">
            <motion.div initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.4 }}>
              <DarkInput icon={User} placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </motion.div>
            <motion.div initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.5 }}>
              <DarkInput icon={Lock} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </motion.div>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-black transition"
                style={{ color: S500 }}
                onMouseEnter={e => e.currentTarget.style.color = BRAND}
                onMouseLeave={e => e.currentTarget.style.color = S500}
              >
                Lupa Password?
              </Link>
            </motion.div>
          </div>

          <motion.button
            disabled={loading}
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            className="w-full mt-6 p-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 group transition-all"
            style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", boxShadow:"0 8px 24px rgb(99 102 241 / 0.30)", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <><motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" /><span>Memproses...</span></>
            ) : (
              <><span>Masuk ke QuizApp</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </motion.button>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }} className="mt-6 text-center">
            <p className="text-sm" style={{ color: S500 }}>
              Belum punya akun?{" "}
              <Link to="/register" className="font-black inline-flex items-center gap-1 group" style={{ color: BRAND }}>
                Daftar Sekarang <Sparkles size={13} className="group-hover:rotate-12 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </motion.form>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }} className="text-center text-xs mt-6" style={{ color: S600 }}>
          Bergabung dengan ribuan pengguna QuizApp
        </motion.p>
      </motion.div>

      {/* Daily Reward Modal */}
      <Modal isOpen={showRewardModal} onClose={handleCloseReward}>
        <div className="text-center py-4">
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-bounce"
            style={{ background:"rgb(234 179 8 / 0.12)", border:"1px solid rgb(234 179 8 / 0.25)" }}
          >
            <Coins size={36} style={{ color:"#fbbf24" }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: S100 }}>Daily Reward!</h2>
          <p className="text-sm mb-6" style={{ color: S400 }}>{rewardData?.message}</p>
          <div
            className="flex justify-center items-center gap-2 p-3 rounded-xl mb-6"
            style={{ background:"rgb(234 179 8 / 0.10)", border:"1px solid rgb(234 179 8 / 0.20)" }}
          >
            <span className="text-3xl font-black" style={{ color:"#fbbf24" }}>+{rewardData?.coins}</span>
            <span className="text-sm font-black" style={{ color:"#fbbf24" }}>Coins</span>
          </div>
          <button
            onClick={handleCloseReward}
            className="w-full py-3 rounded-xl font-black text-sm transition hover:scale-105"
            style={{ background:"linear-gradient(135deg,#d97706,#ea580c)", color:"white", boxShadow:"0 6px 20px rgb(234 88 12 / 0.30)" }}
          >
            Klaim Hadiah 🎁
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
