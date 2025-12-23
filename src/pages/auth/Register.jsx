import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Brain,
  UserPlus,
  User,
  Lock,
  Mail,
  Sparkles,
  Trophy,
  ArrowRight,
  Zap,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.name === "" || form.username === "" || form.password === "") {
      toast.error("Semua field harus diisi!");
      return;
    } else if (form.password.length < 6) {
      toast.error("Password harus minimal 6 karakter!");
      return;
    } else if (form.username.includes(" ")) {
      toast.error("Username tidak boleh mengandung spasi!");
      return;
    }
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

  useEffect(() => {
    document.title = "Register | QuizApp";
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-x-3 items-center justify-center mb-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/30">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              QuizApp
            </span>
          </div>
          <p className="text-slate-600 mt-2">
            Uji pengetahuanmu dengan kuis seru!
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleRegister}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -top-20 -right-20 h-40 w-40 bg-blue-100 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-cyan-100 rounded-full blur-3xl"></div>

          {/* Form Content */}
          <div className="relative z-10">
            {/* Form Header */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <UserPlus className="h-7 w-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-800">
                Buat Akun Baru
              </h2>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-white"
                    placeholder="Masukkan nama lengkap"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </motion.div>

              {/* Username Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-white"
                    placeholder="Pilih username unik"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-white"
                    placeholder="Buat password kuat"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">
                  Minimal 6 karakter dengan kombinasi huruf dan angka
                </p>
              </motion.div>
            </div>

            {/* Register Button */}
            <motion.button
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-xl font-bold hover:shadow-xl shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />

              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Membuat Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </motion.button>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100"
            >
              <p className="text-slate-700">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-bold hover:text-blue-700 inline-flex items-center gap-2 group"
                >
                  Masuk ke akunmu
                  <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Link>
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-600"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span>Akses ke 1000+ kuis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span>Statistik pribadi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span>Kompetisi dengan teman</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span>Leaderboard global</span>
              </div>
            </motion.div>
          </div>
        </motion.form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-slate-500 text-sm mt-6"
        >
          Dengan mendaftar, kamu menyetujui Syarat & Ketentuan QuizzApp
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
