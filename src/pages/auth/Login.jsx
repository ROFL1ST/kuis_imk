import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Brain,
  LogIn,
  User,
  Lock,
  Sparkles,
  ArrowRight,
  Coins,
  Flame,
  Zap,
} from "lucide-react";
import Modal from "../../components/ui/Modal";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [rewardData, setRewardData] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.username === "" || form.password === "") {
      toast.error("Semua field harus diisi!");
      return;
    }
    const result = await login(form);
    if (result.success) {
      if (result.coins_gained > 0) {
        setRewardData({
          coins: result.coins_gained,
          message: result.streak_message,
        });
        setShowRewardModal(true);
      } else {
        toast.success("Login Berhasil!");
        navigate("/dashboard");
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleCloseReward = () => {
    setShowRewardModal(false);
    navigate("/dashboard");
  };

  useEffect(() => {
    document.title = "Login | QuizApp";
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header dengan Logo */}
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
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20"
        >
          {/* Form Header */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <LogIn className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800">Masuk ke Akun</h2>
          </div>

          {/* Input Fields */}
          <div className="space-y-5">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </motion.div>

            {/* --- TOMBOL LUPA PASSWORD DITAMBAHKAN DI SINI --- */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end"
            >
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Lupa Password?
              </Link>
            </motion.div>
            {/* ------------------------------------------------ */}
          </div>

          {/* Login Button */}
          <motion.button
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke QuizzApp</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <p className="text-slate-600">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center gap-1 group"
              >
                Daftar Sekarang
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              </Link>
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute -top-3 -right-3 h-6 w-6 bg-yellow-400 rounded-full blur-sm"></div>
          <div className="absolute -bottom-3 -left-3 h-8 w-8 bg-purple-400 rounded-full blur-sm"></div>
        </motion.form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          Bergabung dengan ribuan pengguna QuizzApp
        </motion.p>
      </motion.div>
      <Modal isOpen={showRewardModal} onClose={handleCloseReward}>
        <div className="text-center py-4">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <Coins className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Daily Reward!
          </h2>
          <p className="text-slate-600 mb-6">{rewardData?.message}</p>

          <div className="flex justify-center items-center gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-6">
            <span className="text-3xl font-bold text-yellow-600">
              +{rewardData?.coins}
            </span>
            <span className="text-sm font-medium text-yellow-700">Coins</span>
          </div>

          <button
            onClick={handleCloseReward}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition transform hover:scale-105"
          >
            Klaim Hadiah 🎁
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
