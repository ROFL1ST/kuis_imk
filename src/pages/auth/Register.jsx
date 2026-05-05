// src/pages/auth/Register.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UserPlus, User, Lock, Mail, Sparkles, ArrowRight, Zap } from "lucide-react";

const BRAND = "var(--color-brand-400)";
const S100  = "var(--color-surface-100)";
const S200  = "var(--color-surface-200)";
const S300  = "var(--color-surface-300)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S900  = "var(--color-surface-900)";
const S950  = "var(--color-surface-950, #05050f)";

const DarkInput = ({ icon: Icon, label, hint, ...props }) => (
  <div>
    {label && <label className="block text-xs font-black mb-2" style={{ color: S400 }}>{label}</label>}
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: S600 }} />
      <input
        {...props}
        className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all font-medium text-sm"
        style={{ background: S800, border: `1.5px solid ${S700}`, color: S100 }}
        onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.12)"; }}
        onBlur={e  => { e.target.style.borderColor = S700;  e.target.style.boxShadow = "none"; }}
      />
    </div>
    {hint && <p className="text-[11px] mt-1.5" style={{ color: S600 }}>{hint}</p>}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", username:"", password:"" });

  useEffect(() => { document.title = "Register | QuizApp"; }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) return toast.error("Semua field harus diisi!");
    if (form.password.length < 6)   return toast.error("Password harus minimal 6 karakter!");
    if (form.username.includes(" ")) return toast.error("Username tidak boleh mengandung spasi!");
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success("Registrasi Berhasil! Silakan Login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registrasi Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: S950 }}>
      {/* Ambient blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:"500px", height:"500px", background:"rgb(99 102 241 / 0.07)", borderRadius:"50%", filter:"blur(100px)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-10%",  width:"500px", height:"500px", background:"rgb(34 211 238 / 0.05)", borderRadius:"50%", filter:"blur(100px)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, var(--color-surface-800) 1px, transparent 1px)`, backgroundSize:"32px 32px", opacity:0.28 }} />
      </div>

      <motion.div
        initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5 }}
        className="w-full max-w-lg relative" style={{ zIndex:1 }}
      >
        {/* Logo */}
        <motion.div className="text-center mb-8" initial={{ scale:0.9 }} animate={{ scale:1 }} transition={{ delay:0.2 }}>
          <div className="flex gap-3 items-center justify-center mb-2">
            <div className="p-2 rounded-xl" style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow:"0 4px 16px rgb(99 102 241 / 0.35)" }}>
              <Zap size={22} fill="white" style={{ color:"white" }} />
            </div>
            <span className="text-3xl font-black" style={{ background:"linear-gradient(90deg,#818cf8,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>QuizApp</span>
          </div>
          <p className="text-sm" style={{ color: S500 }}>Uji pengetahuanmu dengan kuis seru!</p>
        </motion.div>

        {/* Card */}
        <motion.form
          onSubmit={handleRegister}
          initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="p-8 rounded-3xl relative overflow-hidden"
          style={{ background:"rgb(10 10 22 / 0.80)", backdropFilter:"blur(20px)", border:`1px solid ${S800}`, boxShadow:"0 24px 60px rgb(0 0 0 / 0.50)" }}
        >
          {/* Inner glow blobs */}
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"180px", height:"180px", background:"rgb(99 102 241 / 0.06)", borderRadius:"50%", filter:"blur(50px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-60px", left:"-60px", width:"180px", height:"180px", background:"rgb(34 211 238 / 0.04)", borderRadius:"50%", filter:"blur(50px)", pointerEvents:"none" }} />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <UserPlus size={22} style={{ color: BRAND }} />
              <h2 className="text-2xl font-black" style={{ color: S100 }}>Buat Akun Baru</h2>
            </div>

            <div className="space-y-5">
              <motion.div initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.4 }}>
                <DarkInput icon={User} label="Nama Lengkap" type="text" required placeholder="Masukkan nama lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </motion.div>
              <motion.div initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.5 }}>
                <DarkInput icon={Mail} label="Username" type="text" required placeholder="Pilih username unik" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </motion.div>
              <motion.div initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.6 }}>
                <DarkInput icon={Lock} label="Password" type="password" required placeholder="Buat password kuat" hint="Minimal 6 karakter dengan kombinasi huruf dan angka" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </motion.div>
            </div>

            {/* Submit */}
            <motion.button
              disabled={loading}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              className="w-full mt-8 p-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 group relative overflow-hidden transition-all"
              style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", boxShadow:"0 8px 24px rgb(99 102 241 / 0.30)", opacity: loading ? 0.6 : 1 }}
            >
              {/* Shine */}
              <motion.div
                className="absolute inset-0"
                style={{ background:"linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent)" }}
                initial={{ x:"-100%" }} whileHover={{ x:"100%" }} transition={{ duration:0.5 }}
              />
              {loading ? (
                <><motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" /><span>Membuat Akun...</span></>
              ) : (
                <><span>Daftar Sekarang</span><ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
              )}
            </motion.button>

            {/* Login link */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
              className="mt-6 text-center p-4 rounded-xl"
              style={{ background:"rgb(99 102 241 / 0.06)", border:`1px solid ${S800}` }}
            >
              <p className="text-sm" style={{ color: S500 }}>
                Sudah punya akun?{" "}
                <Link to="/login" className="font-black inline-flex items-center gap-1 group" style={{ color: BRAND }}>
                  Masuk ke akunmu <Sparkles size={13} className="group-hover:rotate-12 transition-transform" />
                </Link>
              </p>
            </motion.div>

            {/* Feature chips */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
              className="mt-6 grid grid-cols-2 gap-3 text-xs"
            >
              {["Akses ke 1000+ kuis","Statistik pribadi","Kompetisi dengan teman","Leaderboard global"].map((txt, i) => (
                <div key={i} className="flex items-center gap-2" style={{ color: S500 }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND }} />
                  <span>{txt}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.form>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }} className="text-center text-xs mt-5" style={{ color: S600 }}>
          Dengan mendaftar, kamu menyetujui Syarat &amp; Ketentuan QuizApp
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
