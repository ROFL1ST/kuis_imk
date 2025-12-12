import { useEffect, useState } from "react";
import { userAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Edit3,
  Trophy,
  Target,
  BarChart2,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Zap,
  Star,
  TrendingUp,
  Crown,
  Clock,
  Shield,
  ChevronRight,
  Sparkles,
  Target as TargetIcon,
  BrainCircuit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { setUser: setAuthUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]); // State untuk achievement
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageHover, setIsImageHover] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });

  const fetchData = async () => {
    try {
      // Panggil API Profil dan Achievements secara paralel
      const [profileRes, achRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getAchievements(),
      ]);

      setProfile(profileRes.data.data);
      setAchievements(achRes.data.data || []);

      setForm({
        name: profileRes.data.data.user.name,
        username: profileRes.data.data.user.username,
        password: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(form);
      toast.success("Profil berhasil diperbarui!");

      setProfile({ ...profile, user: res.data.data });
      setAuthUser(res.data.data);

      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal update profil");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { user, stats, topic_performance, level_progress } = profile;

  // Gunakan data dari backend, dengan fallback value agar tidak error
  const currentProgress = level_progress ? level_progress.progress_percent : 0;
  const nextLevelXp = level_progress ? level_progress.next_level_xp : 1000;
  const currentXp = user.xp;
  const currentLevel = user.level;
  const displayProgress = Math.min(currentProgress, 100);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto pb-12 px-4"
    >
      {/* Floating Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* 1. HERO PROFILE SECTION */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mb-8"
      >
        {/* Background Card */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl transform -rotate-1"></div>

        {/* Content */}
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar Section */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setIsImageHover(true)}
              onHoverEnd={() => setIsImageHover(false)}
              className="relative"
            >
              <div className="relative">
                {/* Avatar Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 blur-md opacity-50"></div>

                {/* Avatar */}
                <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-5xl font-black text-indigo-600 border-8 border-white shadow-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Level Badge */}
                <motion.div
                  animate={isImageHover ? { scale: 1.1 } : { scale: 1 }}
                  className="absolute z-20 -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-3 py-1.5 rounded-full border-4 border-white shadow-lg flex items-center gap-1"
                >
                  <Crown size={12} />
                  Lvl {currentLevel}
                </motion.div>
              </div>

              {/* XP Progress Ring */}
              <div className="absolute -inset-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: displayProgress / 100 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {user.name}
                  </h1>
                  <p className="text-slate-500 font-medium mt-1 flex items-center justify-center lg:justify-start gap-2">
                    <User size={16} />@{user.username}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group shadow-md"
                >
                  <Edit3 size={18} />
                  Edit Profil
                  <ChevronRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={16}
                  />
                </motion.button>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 flex flex-wrap gap-3">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-xl border border-yellow-200"
                >
                  <Zap className="text-yellow-600" size={18} />
                  <span className="font-bold text-yellow-700">
                    {user.xp.toLocaleString()} XP
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border border-orange-200"
                >
                  <Target className="text-orange-600" size={18} />
                  <span className="font-bold text-orange-700">
                    {user.streak_count} Hari Streak
                  </span>
                </motion.div>

                {/* <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200"
                >
                  <CheckCircle className="text-green-600" size={18} />
                  <span className="font-bold text-green-700">Rank #{stats.rank || "1"}</span>
                </motion.div> */}
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">
                    Progress Level {currentLevel}
                  </span>
                  <span className="font-bold text-indigo-600">
                    {displayProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<BrainCircuit className="h-6 w-6 text-blue-500" />}
          label="Total Kuis"
          value={stats.total_quizzes}
          change="+12%"
          color="blue"
          delay={0.2}
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-green-500" />}
          label="Rata-rata Skor"
          value={`${Math.round(stats.average_score)}%`}
          change="+5%"
          color="green"
          delay={0.3}
        />
        <StatCard
          icon={<Crown className="h-6 w-6 text-yellow-500" />}
          label="Kemenangan"
          value={stats.total_wins}
          change="+8%"
          color="yellow"
          delay={0.4}
        />
        <StatCard
          icon={<Star className="h-6 w-6 text-purple-500" />}
          label="Topik Favorit"
          value={stats.favorite_topic || "Belum ada"}
          change=""
          color="purple"
          delay={0.5}
          isText
        />
      </div>

      {/* 3. PERFORMANCE & ACHIEVEMENTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Topic Performance */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="text-indigo-600" /> Performa Topik
              </h3>
              <p className="text-slate-500 text-sm">
                Analisis kemampuan berdasarkan topik
              </p>
            </div>
            <TargetIcon className="text-indigo-400" size={24} />
          </div>

          <div className="space-y-6">
            {topic_performance.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-3 bg-slate-100 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-400">
                  Mulai kerjakan kuis untuk melihat performa!
                </p>
              </div>
            ) : (
              topic_performance.map((topic, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="group hover:bg-slate-50 p-3 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">
                          {topic.topic_name}
                        </span>
                        <p className="text-xs text-slate-500">
                          {topic.total_quizzes} kuis dikerjakan
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {Math.round(topic.avg_score)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.avg_score}%` }}
                      transition={{ duration: 1, delay: 0.2 * idx }}
                      className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Achievement & Info */}
        <div className="space-y-8">
          {/* Achievements (DINAMIS DARI DATABASE) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="text-yellow-500" /> Pencapaian
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {achievements.length > 0 ? (
                achievements.map((ach) => (
                  <AchievementItem
                    key={ach.id}
                    icon={
                      <span className="text-xl leading-none">
                        {ach.icon_url}
                      </span>
                    } // Menggunakan Emoji dari DB
                    title={ach.name}
                    description={ach.description}
                    unlocked={ach.is_unlocked}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>Belum ada achievement tersedia.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Shield className="text-slate-600" /> Info Akun
            </h3>
            <div className="space-y-4">
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Bergabung"
                value={new Date(user.CreatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <InfoItem
                icon={<Clock className="h-4 w-4" />}
                label="Terakhir Aktif"
                value={
                  user.last_activity_date
                    ? new Date(user.last_activity_date).toLocaleString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Baru saja"
                }
              />
              <InfoItem
                icon={<Star className="h-4 w-4" />}
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                    <CheckCircle size={12} />
                    Active User
                  </span>
                }
                isComponent
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. ACTIVITY SUMMARY */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Terus tingkatkan kemampuanmu! 🚀
            </h3>
            <p className="text-indigo-100">
              {stats.total_quizzes > 0
                ? `Kamu sudah menyelesaikan ${
                    stats.total_quizzes
                  } kuis dengan rata-rata skor ${Math.round(
                    stats.average_score
                  )}%. Pertahankan semangat belajar!`
                : `Mulai petualangan kuis pertamamu dan dapatkan XP!`}
            </p>
          </div>
          <button
            onClick={() => {
              navigate("/");
            }}
            className="px-6 py-3 bg-white cursor-pointer text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Sparkles size={18} />
            Kerjakan Kuis Baru
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <Modal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            title="Edit Profil"
            description="Perbarui informasi akunmu"
          >
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleUpdate}
              className="space-y-6"
            >
              {/* Name Field */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2 flex items-center gap-2">
                  <User size={16} /> Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:border-slate-400"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2 flex items-center gap-2">
                  <Mail size={16} /> Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:border-slate-400"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2 flex items-center gap-2">
                  <Lock size={16} /> Password Baru
                  <span className="text-xs text-slate-500 font-normal">
                    (Opsional)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Kosongkan jika tidak ingin mengganti"
                    className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:border-slate-400"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Simpan Perubahan
                </motion.button>
              </div>
            </motion.form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({
  icon,
  label,
  value,
  change,
  color,
  delay,
  isText = false,
}) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
    green: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    yellow: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",
    purple: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200",
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-white shadow-sm`}>{icon}</div>
        {change && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full bg-white/70 ${
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
        <p
          className={`font-bold text-slate-900 ${
            isText ? "text-xl" : "text-3xl"
          }`}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
};

// Achievement Item Component (UPDATED FOR DYNAMIC DATA)
const AchievementItem = ({ icon, title, description, unlocked }) => (
  <div
    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300
    ${unlocked ? "hover:bg-slate-50" : "opacity-60 grayscale"}
  `}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border ${
        unlocked
          ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200"
          : "bg-slate-100 border-slate-200"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p
        className={`font-bold ${
          unlocked ? "text-slate-800" : "text-slate-500"
        }`}
      >
        {title}
      </p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    {unlocked ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <div className="h-5 w-5 border-2 border-slate-300 rounded-full"></div>
    )}
  </div>
);

// Info Item Component
const InfoItem = ({ icon, label, value, isComponent = false }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-slate-100 rounded-lg">{icon}</div>
      <span className="text-slate-600">{label}</span>
    </div>
    {isComponent ? (
      value
    ) : (
      <span className="font-medium text-slate-800">{value}</span>
    )}
  </div>
);

export default Profile;
