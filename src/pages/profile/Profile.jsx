import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI, socialAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import UserAvatar from "../../components/ui/UserAvatar"; // [BARU] Import UserAvatar
import ReportModal from "../../components/ui/ReportModal"; // [BARU] Import ReportModal
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Edit3,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Zap,
  Star,
  TrendingUp,
  Crown,
  Shield,
  ChevronRight,
  Target as TargetIcon,
  BrainCircuit,
  UserPlus,
  UserCheck,
  Hourglass,
  Flag,
  Target,
  BarChart2,
  Share2,
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

const Profile = () => {
  const { username } = useParams();
  const { t } = useLanguage();
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageHover, setIsImageHover] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false); // State Report Modal

  // State khusus Friend Status ("none", "pending", "friend")
  const [friendStatus, setFriendStatus] = useState("none");

  // Form State
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });

  const cleanUrlUsername = username ? username.replace("@", "") : "";

  const isOwnProfile =
    !username || (authUser && cleanUrlUsername === authUser.username);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data;
      let achData = [];

      if (isOwnProfile) {
        // === SKENARIO 1: PROFIL SENDIRI ===
        const [profileRes, achRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getAchievements(),
        ]);

        data = profileRes.data.data;
        achData = achRes.data.data || [];

        // [PENTING] Gabungkan equipped_items ke dalam user object agar UserAvatar membacanya
        if (data.equipped_items && data.user) {
          data.user.equipped_items = data.equipped_items;
        }

        setForm({
          name: data.user.name,
          username: data.user.username,
          password: "",
        });
      } else {
        // === SKENARIO 2: PROFIL ORANG LAIN ===
        // 1. Ambil Data Profil Public
        const res = await userAPI.getUserProfile(cleanUrlUsername);
        const publicData = res.data.data;

        // 2. Cek Status Pertemanan
        try {
          const [friendsRes, requestsRes] = await Promise.all([
            socialAPI.getFriends(),
            socialAPI.getSentRequests(),
          ]);

          const myFriends = friendsRes.data.data || [];
          const myRequests = requestsRes.data.data || [];

          // Logika Cek
          if (myFriends.some((f) => f.username === publicData.username)) {
            setFriendStatus("friend");
          } else if (
            myRequests.some((r) => r.receiver?.username === publicData.username)
          ) {
            setFriendStatus("pending");
          } else {
            setFriendStatus("none");
          }
        } catch (error) {
          console.error("Gagal cek status teman", error);
        }

        // 3. Normalisasi Data agar UI Konsisten
        data = {
          user: {
            id: publicData.id,
            name: publicData.name,
            username: publicData.username,
            xp: publicData.stats.xp,
            level: publicData.stats.level,
            streak_count: publicData.stats.streak_count || 0,
            CreatedAt: publicData.stats.joined_at,
            last_activity_date: null,
            // [BARU] Masukkan equipped_items dari public data
            equipped_items: publicData.equipped_items || [],
          },
          stats: {
            total_quizzes: publicData.stats.total_quizzes,
            average_score: 0, // Hidden
            total_wins: publicData.stats.total_wins || 0,
            favorite_topic: "-",
          },
          topic_performance: [],
          level_progress: {
            progress_percent: 0,
            next_level_xp: 1000,
          },
        };

        // Mapping achievements public
        achData =
          publicData.achievements?.map((a) => ({
            ...a,
            is_unlocked: true, // Public achievements biasanya yang sudah unlocked
          })) || [];
      }

      setProfileData(data);
      setAchievements(achData);
    } catch (err) {
      console.error(err);
      toast.error("User tidak ditemukan");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username, isOwnProfile]);

  // Update Metadata
  useEffect(() => {
    if (!profileData) return;
    const { user } = profileData;

    const title = `${user.name} (@${user.username}) | ${t("profile.title")}`;
    document.title = title;

    const updateMeta = (name, content) => {
      let el =
        document.querySelector(`meta[name="${name}"]`) ||
        document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        name.startsWith("og:")
          ? el.setAttribute("property", name)
          : el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = t("profile.viewProfileDesc", {
      name: user.name,
      level: user.level,
      xp: user.xp,
    });
    updateMeta("description", desc);
    updateMeta("og:title", title);
    updateMeta("og:description", desc);
    updateMeta("og:url", window.location.href);
  }, [profileData, t]);

  // Handler Update (Own Profile)
  const handleUpdate = async (e) => {
    if (!isOwnProfile) return;
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(form);
      const freshRes = await userAPI.getProfile();
      const freshData = freshRes.data.data;

      toast.success(t("profile.updateSuccess"));
      setProfileData((prev) => ({ ...prev, user: freshData.user }));
      if (form.username !== cleanUrlUsername) {
        navigate(`/@${form.username}`, { replace: true });
      }
      setAuthUser(res.data.data);
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t("profile.updateFail"));
    }
  };

  // Handler Add Friend (Public Profile)
  const handleAddFriend = async () => {
    try {
      await socialAPI.addFriend(profileData.user.username);
      setFriendStatus("pending");
      toast.success(t("profile.reqSent"));
    } catch (err) {
      console.error(err);
      toast.error(t("profile.reqFail"));
    }
  };

  // Handler Share
  const handleShare = async () => {
    try {
      await userAPI.shareProfile();

      // Fitur Share Native Browser
      if (navigator.share) {
        await navigator.share({
          title: t("profile.title"),
          text: t("profile.viewProfileDesc", {
            name: user.name,
            level: user.level,
            xp: user.xp,
          }),
          url: window.location.href,
        });
      } else {
        // Fallback Copy Clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success(t("profile.shareSuccess"));
      }
    } catch (error) {
      console.error("Share failed", error);
      toast.error(t("profile.shareFail"));
    }
  };

  if (loading) {
    return (
      <div className="pb-20">
        {/* 1. Banner Area (Full Width / Container) */}
        <div className="relative mb-20 md:mb-24">
          {/* Gambar Banner */}
          <Skeleton className="w-full h-48 md:h-64 rounded-b-[2.5rem] md:rounded-b-[3rem]" />

          {/* Container untuk Avatar Overlay */}
          <div className="max-w-5xl mx-auto px-4 relative">
            <div className="absolute -bottom-16 md:-bottom-20 left-4 md:left-8">
              {/* Circle Wrapper (Border Putih) */}
              <div className="p-1.5 bg-white rounded-full">
                {/* Avatar Image Skeleton */}
                <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. User Info & Action Button */}
        <div className="max-w-5xl mx-auto px-6 md:px-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Nama & Bio */}
            <div className="space-y-3 mt-2">
              <Skeleton className="h-8 w-48 md:w-64" /> {/* Nama User */}
              <Skeleton className="h-4 w-32" /> {/* @username */}
              {/* Bio Box */}
              <div className="pt-2">
                <Skeleton className="h-4 w-full max-w-sm" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            </div>

            {/* Tombol Edit / Settings (Desktop: Kanan, Mobile: Bawah) */}
            <div className="flex gap-3 mt-2 md:mt-0">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 3. Stats Grid (Level, Streak, Rank, Coins) */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 md:h-24 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* 4. Tabs & Content (History / About) */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">
          {/* Tab Headers */}
          <div className="flex gap-6 border-b border-slate-100 pb-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>

          {/* Content Body (Misal Grid History) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4"
              >
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const { user, stats, topic_performance, level_progress } = profileData;
  const currentLevel = user.level || 1;
  const displayProgress = level_progress?.progress_percent || 0;

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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl transform -rotate-1"></div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar Section */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setIsImageHover(true)}
              onHoverEnd={() => setIsImageHover(false)}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 blur-md opacity-20"></div>

                {/* [UPDATE] MENGGUNAKAN COMPONENT UserAvatar (SUPPORT FRAME) */}
                <UserAvatar
                  user={user}
                  size="2xl"
                  className="shadow-2xl bg-white rounded-full"
                />

                {/* Level Badge (Tetap Absolute) */}
                <motion.div
                  animate={isImageHover ? { scale: 1.1 } : { scale: 1 }}
                  className="absolute z-20 -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-3 py-1.5 rounded-full border-4 border-white shadow-lg flex items-center gap-1"
                >
                  <Crown size={12} /> {t("profile.level")} {currentLevel}
                </motion.div>
              </div>

              {/* XP Progress (Hanya Own Profile) */}
              {isOwnProfile && (
                <div className="absolute -inset-4 pointer-events-none">
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
              )}
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center lg:justify-start gap-2">
                    {user.name}
                    {/* Tampilkan Title/Gelar jika ada */}
                    {user.equipped_items?.find((i) => i.type === "title") && (
                      <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200 font-bold shadow-sm">
                        {
                          user.equipped_items.find((i) => i.type === "title")
                            .name
                        }
                      </span>
                    )}
                  </h1>
                  <p className="text-slate-500 font-medium mt-1 flex items-center justify-center lg:justify-start gap-2">
                    <User size={16} />@{user.username}
                  </p>
                </div>

                {/* TOMBOL AKSI */}
                <div className="flex gap-2 justify-center lg:justify-end items-center">
                  {/* Tombol Share */}
                  {isOwnProfile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
                      title="Bagikan Profil"
                    >
                      <Share2 size={20} />
                    </motion.button>
                  )}

                  {isOwnProfile ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group shadow-md"
                    >
                      <Edit3 size={18} /> {t("profile.edit")}{" "}
                      <ChevronRight
                        className="group-hover:translate-x-1 transition-transform"
                        size={16}
                      />
                    </motion.button>
                  ) : (
                    <>
                      {/* Logika Tombol Teman */}
                      {friendStatus === "friend" ? (
                        <button
                          disabled
                          className="px-6 py-3 bg-green-100 text-green-700 font-bold rounded-xl flex items-center gap-2 border border-green-200 cursor-default opacity-80"
                        >
                          <UserCheck size={18} /> {t("profile.friend")}
                        </button>
                      ) : friendStatus === "pending" ? (
                        <button
                          disabled
                          className="px-6 py-3 bg-orange-100 text-orange-600 font-bold rounded-xl flex items-center gap-2 border border-orange-200 cursor-default opacity-80"
                        >
                          <Hourglass size={18} /> {t("profile.pending")}
                        </button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAddFriend}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group shadow-md"
                        >
                          <UserPlus size={18} /> {t("profile.addFriend")}
                        </motion.button>
                      )}

                      <button
                        onClick={() => setShowReportModal(true)}
                        className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-red-500 transition"
                        title={t("profile.report")}
                      >
                        <Flag size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-xl border border-yellow-200"
                >
                  <Zap className="text-yellow-600" size={18} />
                  <span className="font-bold text-yellow-700">
                    {user.xp?.toLocaleString()} XP
                  </span>
                </motion.div>

                {(user.streak_count > 0 || isOwnProfile) && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border border-orange-200"
                  >
                    <Target className="text-orange-600" size={18} />
                    <span className="font-bold text-orange-700">
                      {user.streak_count || 0} {t("profile.streak")}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Progress Bar (Own Profile) */}
              {isOwnProfile && (
                <div className="mt-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-600">
                      {t("profile.progress")} {currentLevel}
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
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. KONTEN DETAIL (Own Profile vs Public Profile) */}
      {isOwnProfile ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<BrainCircuit className="h-6 w-6 text-blue-500" />}
              label={t("profile.totalQuiz")}
              value={stats.total_quizzes}
              change="+12%"
              color="blue"
              delay={0.2}
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6 text-green-500" />}
              label={t("profile.avgScore")}
              value={`${Math.round(stats.average_score)}%`}
              change="+5%"
              color="green"
              delay={0.3}
            />
            <StatCard
              icon={<Crown className="h-6 w-6 text-yellow-500" />}
              label={t("profile.win")}
              value={stats.total_wins}
              change="+8%"
              color="yellow"
              delay={0.4}
            />
            <StatCard
              icon={<Star className="h-6 w-6 text-purple-500" />}
              label={t("profile.favTopic")}
              value={stats.favorite_topic || "-"}
              color="purple"
              delay={0.5}
              isText
            />
          </div>

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
                    <BarChart2 className="text-indigo-600" />{" "}
                    {t("profile.topicPerf")}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {t("profile.topicPerfDesc")}
                  </p>
                </div>
                <TargetIcon className="text-indigo-400" size={24} />
              </div>
              <div className="space-y-6">
                {topic_performance?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">{t("profile.startQuiz")}</p>
                  </div>
                ) : (
                  topic_performance?.map((topic, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      className="group hover:bg-slate-50 p-3 rounded-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">
                              {topic.topic_name}
                            </span>
                            <p className="text-xs text-slate-500">
                              {topic.total_quizzes} {t("profile.quizTaken")}
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
                        ></motion.div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Achievements & Info */}
            <div className="space-y-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Award className="text-yellow-500" />{" "}
                  {t("profile.achievements")}
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {achievements.length > 0 ? (
                    achievements.map((ach) => (
                      <AchievementItem
                        key={ach.id}
                        icon={<span className="text-xl">{ach.icon_url}</span>}
                        title={ach.name}
                        description={ach.description}
                        unlocked={ach.is_unlocked}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p>{t("profile.noAch")}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Shield className="text-slate-600" /> {t("profile.accInfo")}
                </h3>
                <div className="space-y-4">
                  <InfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label={t("profile.joined")}
                    value={
                      user.CreatedAt
                        ? new Date(user.CreatedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"
                    }
                  />
                  <InfoItem
                    icon={<Star className="h-4 w-4" />}
                    label={t("profile.status")}
                    value={
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                        <CheckCircle size={12} /> {t("profile.activeUser")}
                      </span>
                    }
                    isComponent
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </>
      ) : (
        // === TAMPILAN PUBLIC ===
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* 1. Statistic Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                  <Zap size={20} />
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase">
                  {t("profile.totalXp")}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-800">
                {user.xp?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Crown size={20} />
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase">
                  {t("profile.wins")}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-800">
                {stats.total_wins}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <BrainCircuit size={20} />
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase">
                  {t("profile.quizzes")}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-800">
                {stats.total_quizzes}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <Target size={20} />
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase">
                  {t("profile.streak")}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-800">
                {user.streak_count || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. Public Achievements */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Award size={20} className="text-yellow-500" />{" "}
                    {t("profile.achievements")}
                  </h3>
                  <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                    {achievements.length} {t("profile.unlocked")}
                  </span>
                </div>
                <div className="p-6">
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((ach, idx) => (
                        <AchievementItem
                          key={idx}
                          icon={<span className="text-xl">{ach.icon_url}</span>}
                          title={ach.name}
                          description={ach.description}
                          unlocked={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      {t("profile.noAchPublic")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Simple Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield size={18} /> {t("profile.accInfo")}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">
                      {t("profile.joined")}
                    </span>
                    <span className="font-bold text-slate-700">
                      {user.CreatedAt
                        ? new Date(user.CreatedAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">
                      {t("settings.preferences.langTitle")}
                    </span>
                    <span className="font-bold text-slate-700">
                      Indonesia 🇮🇩
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditOpen && isOwnProfile && (
          <Modal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            title={t("profile.edit")}
            description={t("profile.updateDesc")}
          >
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleUpdate}
              className="space-y-6"
            >
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2 flex items-center gap-2">
                  <User size={16} /> {t("profile.fullName")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2 flex items-center gap-2">
                  <Mail size={16} /> {t("auth.username")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  {t("profile.cancel")}
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> {t("profile.save")}
                </motion.button>
              </div>
            </motion.form>
          </Modal>
        )}
      </AnimatePresence>
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={profileData?.user?.id}
        targetType="user"
      />
    </motion.div>
  );
};

// --- HELPER COMPONENTS ---
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

const AchievementItem = ({ icon, title, description, unlocked }) => (
  <div
    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
      unlocked ? "hover:bg-slate-50" : "opacity-60 grayscale"
    }`}
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
