// src/pages/profile/Profile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI, socialAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import UserAvatar from "../../components/ui/UserAvatar";
import ReportModal from "../../components/ui/ReportModal";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Edit3, Award, BookOpen, Calendar,
  CheckCircle, Zap, Star, TrendingUp, Crown, Shield,
  ChevronRight, Target as TargetIcon, BrainCircuit,
  UserPlus, UserCheck, Hourglass, Flag, Target, BarChart2, Share2,
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

/* ─────────────── helpers ─────────────── */
const BRAND   = "var(--color-brand-400)";
const S50     = "var(--color-surface-50)";
const S100    = "var(--color-surface-100)";
const S200    = "var(--color-surface-200)";
const S300    = "var(--color-surface-300)";
const S400    = "var(--color-surface-400)";
const S500    = "var(--color-surface-500)";
const S600    = "var(--color-surface-600)";
const S700    = "var(--color-surface-700)";
const S800    = "var(--color-surface-800)";
const S900    = "var(--color-surface-900)";
const S950    = "var(--color-surface-950)";
const CARD    = { background: S900, border: `1px solid ${S800}` };
const CARD_LG = { background: S900, border: `1px solid ${S700}`, borderRadius: "1.25rem" };

const Profile = () => {
  const { username } = useParams();
  const { t }        = useLanguage();
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const navigate     = useNavigate();

  const [profileData, setProfileData]     = useState(null);
  const [achievements, setAchievements]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [isEditOpen, setIsEditOpen]       = useState(false);
  const [isImageHover, setIsImageHover]   = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [friendStatus, setFriendStatus]   = useState("none");
  const [form, setForm] = useState({ name: "", username: "", password: "" });

  const cleanUrlUsername = username ? username.replace("@", "") : "";
  const isOwnProfile = !username || (authUser && cleanUrlUsername === authUser.username);

  /* ─── fetch ─── */
  const fetchData = async () => {
    setLoading(true);
    try {
      let data, achData = [];
      if (isOwnProfile) {
        const [profileRes, achRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getAchievements(),
        ]);
        data    = profileRes.data.data;
        achData = achRes.data.data || [];
        if (data.equipped_items && data.user) data.user.equipped_items = data.equipped_items;
        setForm({ name: data.user.name, username: data.user.username, password: "" });
      } else {
        const res        = await userAPI.getUserProfile(cleanUrlUsername);
        const publicData = res.data.data;
        try {
          const [friendsRes, requestsRes] = await Promise.all([
            socialAPI.getFriends(),
            socialAPI.getSentRequests(),
          ]);
          const myFriends  = friendsRes.data.data || [];
          const myRequests = requestsRes.data.data || [];
          if (myFriends.some((f) => f.username === publicData.username)) setFriendStatus("friend");
          else if (myRequests.some((r) => r.receiver?.username === publicData.username)) setFriendStatus("pending");
          else setFriendStatus("none");
        } catch (e) { console.error(e); }

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
            equipped_items: publicData.equipped_items || [],
          },
          stats: { total_quizzes: publicData.stats.total_quizzes, average_score: 0, total_wins: publicData.stats.total_wins || 0, favorite_topic: "-" },
          topic_performance: [],
          level_progress: { progress_percent: 0, next_level_xp: 1000 },
        };
        achData = publicData.achievements?.map((a) => ({ ...a, is_unlocked: true })) || [];
      }
      setProfileData(data);
      setAchievements(achData);
    } catch (err) {
      console.error(err);
      toast.error("User tidak ditemukan");
      navigate("/");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [username, isOwnProfile]);

  useEffect(() => {
    if (!profileData) return;
    const { user } = profileData;
    const title = `${user.name} (@${user.username}) | ${t("profile.title")}`;
    document.title = title;
    const updateMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) { el = document.createElement("meta"); name.startsWith("og:") ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const desc = t("profile.viewProfileDesc", { name: user.name, level: user.level, xp: user.xp });
    updateMeta("description", desc); updateMeta("og:title", title); updateMeta("og:description", desc); updateMeta("og:url", window.location.href);
  }, [profileData, t]);

  const handleUpdate = async (e) => {
    if (!isOwnProfile) return;
    e.preventDefault();
    try {
      const res       = await userAPI.updateProfile(form);
      const freshRes  = await userAPI.getProfile();
      const freshData = freshRes.data.data;
      toast.success(t("profile.updateSuccess"));
      setProfileData((prev) => ({ ...prev, user: freshData.user }));
      if (form.username !== cleanUrlUsername) navigate(`/@${form.username}`, { replace: true });
      setAuthUser(res.data.data);
      setIsEditOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || t("profile.updateFail")); }
  };

  const handleAddFriend = async () => {
    try { await socialAPI.addFriend(profileData.user.username); setFriendStatus("pending"); toast.success(t("profile.reqSent")); }
    catch (err) { toast.error(t("profile.reqFail")); }
  };

  const handleShare = async () => {
    try {
      await userAPI.shareProfile();
      if (navigator.share) {
        await navigator.share({ title: t("profile.title"), text: t("profile.viewProfileDesc", { name: user.name, level: user.level, xp: user.xp }), url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success(t("profile.shareSuccess"));
      }
    } catch (error) { toast.error(t("profile.shareFail")); }
  };

  /* ─────────────────── SKELETON ─────────────────── */
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Cover */}
      <Skeleton className="w-full h-40 rounded-3xl" />
      {/* Hero card */}
      <div className="p-6 rounded-3xl space-y-4" style={CARD}>
        <div className="flex items-end gap-5">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 pb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="flex gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-2 rounded-full" />
      </div>
      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );

  if (!profileData) return null;

  const { user, stats, topic_performance, level_progress } = profileData;
  const currentLevel    = user.level || 1;
  const displayProgress = level_progress?.progress_percent || 0;
  const titleItem       = user.equipped_items?.find((i) => i.type === "title");

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 pb-24"
    >

      {/* ══════════════ COVER BANNER ══════════════ */}
      <div
        className="w-full h-36 md:h-48 rounded-3xl mb-0 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #312e81 0%, #4c1d95 40%, #1e1b4b 100%)" }}
      >
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"200px", height:"200px", borderRadius:"50%", background:"rgb(99 102 241 / 0.25)", filter:"blur(40px)" }} />
        <div style={{ position:"absolute", bottom:"-30px", left:"30px", width:"140px", height:"140px", borderRadius:"50%", background:"rgb(168 85 247 / 0.20)", filter:"blur(30px)" }} />
        {/* Subtle grid pattern */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgb(255 255 255 / 0.05) 1px, transparent 1px)", backgroundSize:"24px 24px" }} />
      </div>

      {/* ══════════════ HERO CARD ══════════════ */}
      <div
        className="relative mx-2 -mt-8 md:-mt-12 p-5 md:p-7 rounded-3xl mb-6"
        style={{ background: S900, border: `1px solid ${S700}`, boxShadow: "0 24px 60px rgb(0 0 0 / 0.35)" }}
      >
        <div className="flex flex-col md:flex-row md:items-end gap-5">

          {/* Avatar + Level badge */}
          <motion.div
            className="relative -mt-14 md:-mt-16 shrink-0 self-start"
            onHoverStart={() => setIsImageHover(true)}
            onHoverEnd={() => setIsImageHover(false)}
            whileHover={{ scale: 1.03 }}
          >
            {/* XP ring */}
            {isOwnProfile && (
              <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="47" fill="none" stroke={S800} strokeWidth="3" />
                <motion.circle cx="50" cy="50" r="47" fill="none"
                  stroke="url(#xp-grad)" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: displayProgress / 100 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="xp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            )}
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden"
              style={{ border: `3px solid ${S700}`, boxShadow: "0 0 0 2px #312e81" }}
            >
              <UserAvatar user={user} size="2xl" className="w-full h-full object-cover" />
            </div>
            {/* Level pill */}
            <div
              className="absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", border: `2px solid ${S900}` }}
            >
              <Crown size={10} /> {currentLevel}
            </div>
          </motion.div>

          {/* Name + username + title */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: S50 }}>
                {user.name}
              </h1>
              {titleItem && (
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={{ background: "rgb(234 179 8 / 0.12)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.25)" }}
                >
                  {titleItem.name}
                </span>
              )}
            </div>
            <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: S500 }}>
              <User size={13} /> @{user.username}
            </p>

            {/* XP + Streak chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                style={{ background: "rgb(234 179 8 / 0.10)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.20)" }}
              >
                <Zap size={12} /> {user.xp?.toLocaleString()} XP
              </span>
              {(user.streak_count > 0 || isOwnProfile) && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                  style={{ background: "rgb(249 115 22 / 0.10)", color: "#fb923c", border: "1px solid rgb(249 115 22 / 0.20)" }}
                >
                  <Target size={12} /> {user.streak_count || 0} {t("profile.streak")}
                </span>
              )}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                style={{ background: "rgb(99 102 241 / 0.10)", color: "var(--color-brand-300)", border: "1px solid rgb(99 102 241 / 0.20)" }}
              >
                <Award size={12} /> {t("profile.level")} {currentLevel}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0 self-start md:self-auto">
            {isOwnProfile ? (
              <>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl transition-colors"
                  style={{ background: S800, color: S400, border: `1px solid ${S700}` }}
                  onMouseEnter={e => e.currentTarget.style.color = BRAND}
                  onMouseLeave={e => e.currentTarget.style.color = S400}
                >
                  <Share2 size={18} />
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEditOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all"
                  style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.25)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.20)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.12)"}
                >
                  <Edit3 size={16} /> {t("profile.edit")}
                </motion.button>
              </>
            ) : (
              <>
                {friendStatus === "friend" ? (
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm"
                    style={{ background: "rgb(34 197 94 / 0.10)", color: "#4ade80", border: "1px solid rgb(34 197 94 / 0.20)" }}
                  >
                    <UserCheck size={16} /> {t("profile.friend")}
                  </span>
                ) : friendStatus === "pending" ? (
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm"
                    style={{ background: "rgb(249 115 22 / 0.10)", color: "#fb923c", border: "1px solid rgb(249 115 22 / 0.20)" }}
                  >
                    <Hourglass size={16} /> {t("profile.pending")}
                  </span>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddFriend}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm"
                    style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.25)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.20)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.12)"}
                  >
                    <UserPlus size={16} /> {t("profile.addFriend")}
                  </motion.button>
                )}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2.5 rounded-xl transition-colors"
                  style={{ background: S800, color: S500, border: `1px solid ${S700}` }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                  onMouseLeave={e => e.currentTarget.style.color = S500}
                >
                  <Flag size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* XP Progress bar (own only) */}
        {isOwnProfile && (
          <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${S800}` }}>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: S500 }}>{t("profile.progress")} {currentLevel}</span>
              <span className="font-black" style={{ color: BRAND }}>{displayProgress.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: S800 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#818cf8,#c084fc)" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ STAT ROW ══════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <BrainCircuit size={18} />, label: t("profile.totalQuiz"),  value: stats.total_quizzes,                  accent: "#60a5fa" },
          { icon: <TrendingUp    size={18} />, label: t("profile.avgScore"),   value: `${Math.round(stats.average_score)}%`, accent: "#34d399" },
          { icon: <Crown         size={18} />, label: t("profile.win"),        value: stats.total_wins,                     accent: "#fbbf24" },
          { icon: <Target        size={18} />, label: t("profile.streak"),     value: user.streak_count || 0,               accent: "#fb923c" },
        ].map(({ icon, label, value, accent }, i) => (
          <motion.div
            key={i}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl"
            style={{ ...CARD }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${accent}1a`, color: accent }}
            >
              {icon}
            </div>
            <p className="text-xs font-bold uppercase mb-1" style={{ color: S600 }}>{label}</p>
            <p className="text-2xl font-black" style={{ color: S100 }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: Topic Performance ── */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl p-5 md:p-6"
          style={CARD_LG}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base flex items-center gap-2" style={{ color: S100 }}>
                <BarChart2 size={18} style={{ color: BRAND }} />
                {t("profile.topicPerf")}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: S500 }}>{t("profile.topicPerfDesc")}</p>
            </div>
          </div>

          {(topic_performance?.length === 0 || !isOwnProfile) ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-xl" style={{ background: S950 || S900 }}>
              <BarChart2 size={28} style={{ color: S700 }} className="mb-2" />
              <p className="text-sm" style={{ color: S600 }}>{isOwnProfile ? t("profile.startQuiz") : t("profile.noTopicPublic") || "No public data"}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topic_performance.map((topic, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.08 * idx }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND }}
                      >
                        <BookOpen size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-black" style={{ color: S200 }}>{topic.topic_name}</p>
                        <p className="text-[10px]" style={{ color: S600 }}>{topic.total_quizzes} {t("profile.quizTaken")}</p>
                      </div>
                    </div>
                    <span className="text-base font-black" style={{ color: BRAND }}>{Math.round(topic.avg_score)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: S800 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.avg_score}%` }}
                      transition={{ duration: 1, delay: 0.15 * idx }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg,#818cf8,#c084fc)" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Right Column ── */}
        <div className="space-y-5">

          {/* Achievements */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={CARD_LG}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm flex items-center gap-2" style={{ color: S100 }}>
                <Award size={16} style={{ color: "#fbbf24" }} />
                {t("profile.achievements")}
              </h3>
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: "rgb(234 179 8 / 0.10)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.20)" }}
              >
                {achievements.filter(a => a.is_unlocked).length} / {achievements.length}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${S700} transparent` }}>
              {achievements.length > 0 ? (
                achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                    style={ach.is_unlocked
                      ? { background: "rgb(234 179 8 / 0.05)", border: "1px solid rgb(234 179 8 / 0.12)" }
                      : { background: S800, border: `1px solid ${S700}`, opacity: 0.5, filter: "grayscale(1)" }
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={ach.is_unlocked ? { background: "rgb(234 179 8 / 0.12)" } : { background: S800 }}
                    >
                      {ach.icon_url}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black truncate" style={{ color: ach.is_unlocked ? S100 : S600 }}>{ach.name}</p>
                      <p className="text-[10px] truncate" style={{ color: S600 }}>{ach.description}</p>
                    </div>
                    {ach.is_unlocked && <CheckCircle size={14} style={{ color: "#4ade80", shrink: 0 }} />}
                  </div>
                ))
              ) : (
                <p className="text-center text-xs py-8" style={{ color: S600 }}>{t("profile.noAch")}</p>
              )}
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5"
            style={CARD_LG}
          >
            <h3 className="font-black text-sm flex items-center gap-2 mb-4" style={{ color: S100 }}>
              <Shield size={15} style={{ color: S400 }} />
              {t("profile.accInfo")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2" style={{ color: S500 }}>
                  <Calendar size={13} /> {t("profile.joined")}
                </span>
                <span className="font-black" style={{ color: S200 }}>
                  {user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                </span>
              </div>
              <div
                className="flex items-center justify-between text-xs pt-3"
                style={{ borderTop: `1px solid ${S800}` }}
              >
                <span className="flex items-center gap-2" style={{ color: S500 }}>
                  <Star size={13} /> {t("profile.status")}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{ background: "rgb(34 197 94 / 0.10)", color: "#4ade80", border: "1px solid rgb(34 197 94 / 0.20)" }}
                >
                  <CheckCircle size={10} /> {t("profile.activeUser")}
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ══════════════ EDIT MODAL ══════════════ */}
      <AnimatePresence>
        {isEditOpen && isOwnProfile && (
          <Modal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            title={t("profile.edit")}
            description={t("profile.updateDesc")}
          >
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              onSubmit={handleUpdate}
              className="space-y-5"
            >
              {/* Name */}
              <div>
                <label className="text-xs font-black uppercase mb-2 flex items-center gap-1.5" style={{ color: S400 }}>
                  <User size={13} /> {t("profile.fullName")}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: S600 }} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{ background: S800, border: `1px solid ${S700}`, color: S100 }}
                    onFocus={e => e.target.style.borderColor = BRAND}
                    onBlur={e => e.target.style.borderColor = S700}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-black uppercase mb-2 flex items-center gap-1.5" style={{ color: S400 }}>
                  <Mail size={13} /> {t("auth.username")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: S600 }} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{ background: S800, border: `1px solid ${S700}`, color: S100 }}
                    onFocus={e => e.target.style.borderColor = BRAND}
                    onBlur={e => e.target.style.borderColor = S700}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-black text-sm transition-colors"
                  style={{ background: S800, color: S300, border: `1px solid ${S700}` }}
                >
                  {t("profile.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all inline-flex items-center justify-center gap-2"
                  style={{ background: "rgb(99 102 241 / 0.15)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.30)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.15)"}
                >
                  <CheckCircle size={16} /> {t("profile.save")}
                </button>
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

export default Profile;
