import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Brain, LogIn, User, Lock, Sparkles, ArrowRight } from "lucide-react";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.username === "" || form.password === "") {
      toast.error("Semua field harus diisi!");
      return;
    }
    const result = await login(form);
    if (result.success) {
      toast.success("Login Berhasil!");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

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
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            QuizzApp
          </h1>
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
          </div>

          {/* Login Button */}
          <motion.button
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group"
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
    </div>
  );
};

export default Login;
