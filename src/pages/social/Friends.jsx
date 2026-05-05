// src/pages/social/Friends.jsx
import { useEffect, useState } from "react";
import { socialAPI, userAPI } from "../../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  UserPlus, Trash2, User, Bell, Clock, X, Check,
  Construction, Search, Users, Loader2, UserCheck,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import UserHoverCard from "../../components/ui/UserHoverCard";
import UserAvatar from "../../components/ui/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import Skeleton from "../../components/ui/Skeleton";
import { motion } from "framer-motion";

/* ── CSS var shortcuts ── */
const BRAND = "var(--color-brand-400)";
const S50   = "var(--color-surface-50)";
const S100  = "var(--color-surface-100)";
const S200  = "var(--color-surface-200)";
const S300  = "var(--color-surface-300)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S900  = "var(--color-surface-900)";

const Friends = () => {
  const { user } = useAuth();
  const { t }    = useLanguage();

  const [friends, setFriends]           = useState([]);
  const [requests, setRequests]         = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, friendId: null, friendName: "" });

  useEffect(() => {
    document.title = `${t("social.title")} | QuizApp`;
    fetchData();
  }, [t]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      socialAPI.getFriends(),
      socialAPI.getFriendRequests(),
      socialAPI.getSentRequests(),
    ])
      .then(([fr, rq, sr]) => {
        setFriends(fr.data.data || []);
        setRequests(rq.data.data || []);
        setSentRequests(sr.data.data || []);
      })
      .catch(() => toast.error(t("modals.aiError")))
      .finally(() => setLoading(false));
  };

  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await userAPI.searchUsers(searchQuery);
      setSearchResults(res.data.data || []);
    } catch { toast.error(t("social.noUserFound")); }
  };

  const clearSearch = () => { setSearchQuery(""); setSearchResults([]); setIsSearching(false); };

  const handleAddFriend = async (targetUsername) => {
    try {
      await socialAPI.addFriend(targetUsername);
      toast.success(t("social.successSent"));
      const sr = await socialAPI.getSentRequests();
      setSentRequests(sr.data.data || []);
    } catch (err) { toast.error(err.response?.data?.message || t("social.failedSent")); }
  };

  const handleConfirmFriend = async (id) => {
    try { await socialAPI.confirmFriend(id); toast.success(t("social.successAccept")); fetchData(); }
    catch { toast.error(t("modals.aiError")); }
  };

  const handleRefuseFriend = async (id) => {
    try { await socialAPI.refuseFriend(id); toast.success(t("social.successRefuse")); fetchData(); }
    catch { toast.error(t("modals.aiError")); }
  };

  const handleCancelRequest = async (id) => {
    try { await socialAPI.cancelRequest(id); toast.success(t("social.successCancel")); fetchData(); }
    catch { toast.error(t("modals.aiError")); }
  };

  const executeRemoveFriend = async () => {
    try {
      await socialAPI.removeFriend(confirmModal.friendId);
      toast.success(t("social.successDelete"));
      fetchData();
    } catch { toast.error(t("modals.aiError")); }
    finally { setConfirmModal({ isOpen: false, friendId: null, friendName: "" }); }
  };

  /* ───────────── SKELETON ───────────── */
  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-6">
      <Skeleton className="w-full h-36 rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          {[1,2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  /* ───────────── RENDER ───────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto pb-24 px-4"
    >

      {/* ═══ HEADER BANNER ═══ */}
      <div
        className="w-full rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #1e1b4b 100%)" }}
      >
        {/* Blobs */}
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"220px", height:"220px", borderRadius:"50%", background:"rgb(99 102 241 / 0.2)", filter:"blur(50px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-30px", left:"20px", width:"150px", height:"150px", borderRadius:"50%", background:"rgb(168 85 247 / 0.15)", filter:"blur(35px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgb(255 255 255 / 0.04) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3" style={{ color: "#fff" }}>
              <span className="p-2 rounded-xl" style={{ background: "rgb(255 255 255 / 0.12)" }}>
                <Users size={22} style={{ color: "#c7d2fe" }} />
              </span>
              {t("social.title")}
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "rgb(199 210 254 / 0.8)" }}>{t("social.subtitle")}</p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 mt-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                style={{ background: "rgb(255 255 255 / 0.10)", color: "#e0e7ff" }}
              >
                <UserCheck size={12} /> {friends.length} {t("social.friendList")}
              </span>
              {requests.length > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                  style={{ background: "rgb(239 68 68 / 0.15)", color: "#fca5a5", border: "1px solid rgb(239 68 68 / 0.3)" }}
                >
                  <Bell size={12} /> {requests.length} {t("social.incomingRequests")}
                </span>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div
            className="p-4 rounded-2xl w-full md:w-auto md:min-w-[320px]"
            style={{ background: "rgb(255 255 255 / 0.08)", border: "1px solid rgb(255 255 255 / 0.15)" }}
          >
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "rgb(199 210 254 / 0.7)" }}>
              {t("social.searchUser")}
            </label>
            <form onSubmit={handleGlobalSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: "rgb(199 210 254 / 0.6)" }} />
                <input
                  type="text"
                  placeholder={t("social.searchPlaceholder")}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "rgb(255 255 255 / 0.08)", border: "1px solid rgb(255 255 255 / 0.15)", color: "#e0e7ff" }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-black transition-all"
                style={{ background: "#fff", color: "#4338ca" }}
                onMouseEnter={e => e.currentTarget.style.background = "#e0e7ff"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                {t("social.btnSearch")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── KOLOM KIRI: Requests ── */}
        <div className="lg:col-span-4 space-y-4">

          {/* Incoming Requests */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: S900, border: `1px solid ${S800}` }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${S800}` }}
            >
              <h2 className="font-black text-sm flex items-center gap-2" style={{ color: S100 }}>
                <span className="p-1.5 rounded-lg" style={{ background: "rgb(234 179 8 / 0.12)", color: "#fbbf24" }}>
                  <Bell size={14} />
                </span>
                {t("social.incomingRequests")}
              </h2>
              {requests.length > 0 && (
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: "rgb(239 68 68 / 0.15)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.25)" }}
                >
                  {requests.length}
                </span>
              )}
            </div>

            <div className="p-4">
              {requests.length === 0 ? (
                <div
                  className="text-center py-8 rounded-xl text-sm"
                  style={{ background: S800, color: S600, border: `1px dashed ${S700}` }}
                >
                  <Clock size={22} className="mx-auto mb-2" style={{ opacity: 0.4 }} />
                  {t("social.noIncoming")}
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map(req => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl"
                      style={{ background: S800, border: `1px solid ${S700}` }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <UserAvatar user={req.user} size="md" />
                        <div className="min-w-0">
                          <p className="font-black text-sm truncate" style={{ color: S100 }}>{req.user?.name}</p>
                          <p className="text-xs truncate" style={{ color: S500 }}>@{req.user?.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmFriend(req.user.ID || req.user.id)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all"
                          style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.25)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.22)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.12)"}
                        >
                          <Check size={12} /> {t("social.accept")}
                        </button>
                        <button
                          onClick={() => handleRefuseFriend(req.user.ID || req.user.id)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all"
                          style={{ background: "rgb(239 68 68 / 0.08)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.20)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgb(239 68 68 / 0.18)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgb(239 68 68 / 0.08)"}
                        >
                          <X size={12} /> {t("social.refuse")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: S900, border: `1px solid ${S800}` }}
            >
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: `1px solid ${S800}` }}>
                <span className="p-1.5 rounded-lg" style={{ background: "rgb(96 165 250 / 0.12)", color: "#60a5fa" }}>
                  <Clock size={14} />
                </span>
                <h2 className="font-black text-sm" style={{ color: S100 }}>{t("social.pendingRequests")}</h2>
              </div>
              <div className="p-4 space-y-2">
                {sentRequests.map(req => (
                  <div
                    key={req.ID || req.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: S800, border: `1px solid ${S700}` }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <UserAvatar user={req.friend} size="md" />
                      <div className="min-w-0">
                        <p className="font-black text-xs truncate" style={{ color: S100 }}>{req.friend?.name}</p>
                        <p className="text-xs truncate" style={{ color: S500 }}>@{req.friend?.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelRequest(req.friend_id)}
                      className="p-1.5 rounded-lg transition-colors shrink-0"
                      style={{ color: S500 }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgb(239 68 68 / 0.10)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = S500; e.currentTarget.style.background = "transparent"; }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── KOLOM KANAN: Friends / Search Results ── */}
        <div className="lg:col-span-8">

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-base flex items-center gap-2" style={{ color: S100 }}>
              {isSearching ? (
                <>
                  <Search size={16} style={{ color: BRAND }} />
                  {t("social.searchResults")}
                  <span className="text-xs font-medium" style={{ color: S500 }}>“{searchQuery}”</span>
                </>
              ) : (
                <>
                  <User size={16} style={{ color: BRAND }} />
                  {t("social.friendList")}
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND }}
                  >
                    {friends.length}
                  </span>
                </>
              )}
            </h2>
            {isSearching && (
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl transition-all"
                style={{ background: "rgb(239 68 68 / 0.08)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.20)" }}
              >
                <X size={12} /> {t("social.closeSearch")}
              </button>
            )}
          </div>

          {/* Cards grid */}
          {isSearching ? (
            searchResults.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: S900, border: `1px dashed ${S700}`, color: S600 }}
              >
                <Search size={28} className="mx-auto mb-3" style={{ opacity: 0.35 }} />
                <p className="text-sm">{t("social.noUserFound")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {searchResults
                  .filter(u => u.ID !== user.ID)
                  .map((u, idx) => {
                    const isSent     = sentRequests.some(s => s.friend_id === u.ID);
                    const isFriend   = friends.some(f => f.id === u.ID);
                    const isIncoming = requests.some(r => (r.user_id || r.user?.ID) === u.ID);
                    return (
                      <motion.div
                        key={u.id}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.04 * idx }}
                        className="relative rounded-2xl p-4"
                        style={{ background: S900, border: `1px solid ${S800}` }}
                      >
                        <UserHoverCard user={u}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative shrink-0">
                              <UserAvatar user={u} size="lg" />
                              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500" style={{ border: `2px solid ${S900}` }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-sm truncate" style={{ color: S100 }}>{u.name}</p>
                              <p className="text-xs truncate" style={{ color: S500 }}>@{u.username}</p>
                              <span
                                className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                                style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND }}
                              >
                                Lv.{u.level || 1}
                              </span>
                            </div>
                          </div>
                        </UserHoverCard>
                        <div className="flex gap-2">
                          <Link
                            to={`/@${u.username}`}
                            className="flex-1 py-2 text-center text-xs font-black rounded-xl transition-colors"
                            style={{ background: S800, color: S300, border: `1px solid ${S700}` }}
                          >
                            {t("social.viewProfile")}
                          </Link>
                          {isFriend ? (
                            <button disabled className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-black rounded-xl" style={{ background: "rgb(34 197 94 / 0.08)", color: "#4ade80", border: "1px solid rgb(34 197 94 / 0.18)" }}>
                              <UserCheck size={12} /> {t("social.friend")}
                            </button>
                          ) : isSent ? (
                            <button disabled className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-black rounded-xl" style={{ background: "rgb(249 115 22 / 0.08)", color: "#fb923c", border: "1px solid rgb(249 115 22 / 0.18)" }}>
                              <Clock size={12} /> {t("social.pending")}
                            </button>
                          ) : isIncoming ? (
                            <button disabled className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-black rounded-xl" style={{ background: "rgb(96 165 250 / 0.08)", color: "#60a5fa", border: "1px solid rgb(96 165 250 / 0.18)" }}>
                              <Bell size={12} /> {t("social.checkRequest")}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(u.username)}
                              className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-black rounded-xl transition-all"
                              style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.25)" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.22)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.12)"}
                            >
                              <UserPlus size={12} /> {t("social.add")}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )
          ) : friends.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ background: S900, border: `1px dashed ${S700}`, color: S600 }}
            >
              <Users size={32} className="mx-auto mb-3" style={{ opacity: 0.3 }} />
              <p className="text-sm">{t("social.noFriends")}</p>
              <p className="text-xs mt-1" style={{ color: S700 }}>Cari teman lewat search bar di atas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {friends.map((friend, idx) => (
                <motion.div
                  key={friend.ID || friend.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * idx }}
                  className="relative rounded-2xl p-4 group"
                  style={{ background: S900, border: `1px solid ${S800}` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = S700}
                  onMouseLeave={e => e.currentTarget.style.borderColor = S800}
                >
                  {/* Delete btn */}
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmModal({ isOpen: true, friendId: friend.id || friend.ID, friendName: friend.name }); }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: S500 }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgb(239 68 68 / 0.10)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = S500; e.currentTarget.style.background = "transparent"; }}
                  >
                    <Trash2 size={15} />
                  </button>

                  <UserHoverCard user={friend}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative shrink-0">
                        <UserAvatar user={friend} size="lg" />
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500" style={{ border: `2px solid ${S900}` }} />
                      </div>
                      <div className="min-w-0 pr-6">
                        <p className="font-black text-sm truncate" style={{ color: S100 }}>{friend.name}</p>
                        <p className="text-xs truncate" style={{ color: S500 }}>@{friend.username}</p>
                        <span
                          className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND }}
                        >
                          Lv.{friend.level || 1}
                        </span>
                      </div>
                    </div>
                  </UserHoverCard>

                  <div className="flex gap-2">
                    <Link
                      to={`/@${friend.username}`}
                      className="flex-1 py-2 text-center text-xs font-black rounded-xl transition-colors"
                      style={{ background: S800, color: S300, border: `1px solid ${S700}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = S700; }}
                      onMouseLeave={e => { e.currentTarget.style.background = S800; }}
                    >
                      {t("social.viewProfile")}
                    </Link>
                    <button
                      disabled
                      className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-black rounded-xl cursor-not-allowed"
                      style={{ background: S800, color: S600, border: `1px solid ${S700}` }}
                    >
                      <Construction size={12} /> {t("social.chat")}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ DELETE CONFIRM MODAL ═══ */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, friendId: null, friendName: "" })}
        maxWidth="max-w-sm"
      >
        <div className="text-center p-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgb(239 68 68 / 0.12)", color: "#f87171" }}
          >
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-black mb-2" style={{ color: S100 }}>{t("social.deleteFriendTitle")}</h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: S400 }}>
            {t("social.deleteFriendDesc").replace("{name}", confirmModal.friendName)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmModal({ isOpen: false, friendId: null, friendName: "" })}
              className="flex-1 py-2.5 rounded-xl font-black text-sm"
              style={{ background: S800, color: S300, border: `1px solid ${S700}` }}
            >
              {t("social.cancelBtn")}
            </button>
            <button
              onClick={executeRemoveFriend}
              className="flex-1 py-2.5 rounded-xl font-black text-sm text-white"
              style={{ background: "#dc2626" }}
            >
              {t("social.deleteBtn")}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Friends;
