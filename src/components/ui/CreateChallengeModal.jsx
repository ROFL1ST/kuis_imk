// src/components/ui/CreateChallengeModal.jsx

import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Swords,
  Users,
  Zap,
  Coins,
  Search,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { socialAPI, topicAPI } from "../../services/api";
import toast from "react-hot-toast";

const MODES = [
  { id: "1v1",         label: null, icon: Swords,  accentColor: "#fb923c",  accentBg: "rgb(249 115 22 / 0.12)" },
  { id: "survival",   label: null, icon: Zap,     accentColor: "#f87171",  accentBg: "rgb(239 68 68 / 0.12)"  },
  { id: "2v2",        label: null, icon: Users,   accentColor: "#60a5fa",  accentBg: "rgb(59 130 246 / 0.12)" },
  { id: "battleroyale",label: null, icon: Trophy, accentColor: "#c084fc",  accentBg: "rgb(168 85 247 / 0.12)" },
];

const CreateChallengeModal = ({
  isOpen,
  onClose,
  onCreated,
  preselectedTopicId,
  preselectedQuizTitle,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [topics, setTopics] = useState([]);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchFriend, setSearchFriend] = useState("");

  const [selectedMode, setSelectedMode] = useState("1v1");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedOpponents, setSelectedOpponents] = useState([]);
  const [wager, setWager] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setStep(1);
      if (preselectedTopicId) {
        setSelectedTopic({ id: preselectedTopicId, title: preselectedQuizTitle || "Selected Quiz" });
      } else {
        setSelectedTopic(null);
      }
    }
  }, [isOpen, preselectedTopicId, preselectedQuizTitle]);

  useEffect(() => {
    setFilteredFriends(
      friends.filter((f) => f.name.toLowerCase().includes(searchFriend.toLowerCase()))
    );
  }, [searchFriend, friends]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [topicsRes, friendsRes] = await Promise.all([
        topicAPI.getAllTopics(),
        socialAPI.getFriends(),
      ]);
      setTopics(topicsRes.data.data);
      setFriends(friendsRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data awal");
    }
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    if (selectedOpponents.length > 0) {
      let limit = 1;
      if (mode === "2v2") limit = 3;
      if (mode === "battleroyale") limit = 99;
      if (selectedOpponents.length > limit) setSelectedOpponents((p) => p.slice(0, limit));
    }
    if (mode === "survival") {
      setSelectedTopic({ id: 0, title: "Survival Random" });
    } else {
      if (preselectedTopicId) setSelectedTopic({ id: preselectedTopicId, title: preselectedQuizTitle || "Selected Quiz" });
      else setSelectedTopic(null);
    }
  };

  const toggleFriend = (username) => {
    if (selectedOpponents.includes(username)) {
      setSelectedOpponents((p) => p.filter((u) => u !== username));
    } else {
      let limit = 1;
      if (selectedMode === "2v2") limit = 3;
      if (selectedMode === "battleroyale") limit = 99;
      if (selectedOpponents.length < limit) {
        setSelectedOpponents((p) => [...p, username]);
      } else {
        if (limit === 1) setSelectedOpponents([username]);
        else toast.error(t("createChallenge.maxPlayers", { limit: limit.toString() }));
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        opponent_usernames: selectedOpponents,
        quiz_id: selectedTopic?.id || 0,
        mode: selectedMode,
        time_limit: parseInt(timeLimit) * 60,
        is_realtime: isRealtime,
        wager_amount: parseInt(wager),
      };
      const res = await socialAPI.createChallenge(payload);
      if (res.data.status === "success") {
        toast.success(t("createChallenge.success"));
        onCreated?.(res.data.data);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal membuat tantangan");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--color-surface-800)",
    border: "2px solid var(--color-surface-700)",
    color: "var(--color-surface-100)",
    borderRadius: "0.75rem",
    outline: "none",
    padding: "0.625rem 0.75rem",
    width: "100%",
    fontSize: "0.875rem",
    fontWeight: 600,
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Mode grid */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--color-surface-500)" }}>
          {t("createChallenge.selectMode")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeSelect(m.id)}
                className="p-4 rounded-xl border-2 text-left transition-all cursor-pointer"
                style={{
                  background: isSelected ? m.accentBg : "var(--color-surface-800)",
                  borderColor: isSelected ? m.accentColor : "var(--color-surface-700)",
                  boxShadow: isSelected ? `0 0 0 1px ${m.accentColor}40` : "none",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <m.icon size={18} style={{ color: m.accentColor }} />
                  <span className="font-black text-sm" style={{ color: isSelected ? m.accentColor : "var(--color-surface-200)" }}>
                    {t(`createChallenge.modes.${m.id}`)}
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: "var(--color-surface-500)" }}>
                  {t(`createChallenge.modes.${m.id}Desc`)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic select */}
      {selectedMode !== "survival" && !preselectedTopicId && (
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--color-surface-500)" }}>
            {t("createChallenge.selectTopic")}
          </p>
          <select
            style={{ ...inputStyle, padding: "0.75rem" }}
            onChange={(e) => {
              const found = topics.find((tp) => tp.ID === parseInt(e.target.value));
              setSelectedTopic({ id: parseInt(e.target.value), title: found?.title });
            }}
          >
            <option value="">{t("createChallenge.placeholderTopic")}</option>
            {topics.map((tp) => (
              <option key={tp.ID} value={tp.ID}>{tp.title}</option>
            ))}
          </select>
          <p className="text-[10px] mt-1" style={{ color: "var(--color-surface-600)" }}>
            {t("createChallenge.topicHint")}
          </p>
        </div>
      )}

      {/* Time + Wager */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--color-surface-500)" }}>
            {t("createChallenge.timeLimit")}
          </p>
          <div className="relative">
            <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-surface-500)" }} />
            <input
              type="number" min="0" value={timeLimit}
              placeholder={t("createChallenge.timeLimitPlaceholder")}
              onChange={(e) => setTimeLimit(e.target.value)}
              style={{ ...inputStyle, paddingLeft: "2.25rem" }}
            />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--color-surface-500)" }}>
            {t("createChallenge.wager")}
          </p>
          <div className="relative">
            <Coins size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#fbbf24" }} />
            <input
              type="number" min="0" value={wager}
              onChange={(e) => setWager(e.target.value)}
              style={{ ...inputStyle, paddingLeft: "2.25rem" }}
            />
          </div>
        </div>
      </div>

      {/* Realtime toggle */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
        style={{
          background: isRealtime ? "rgb(99 102 241 / 0.10)" : "var(--color-surface-800)",
          borderColor: isRealtime ? "rgb(99 102 241 / 0.40)" : "var(--color-surface-700)",
        }}
        onClick={() => setIsRealtime(!isRealtime)}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center border-2 transition-all"
          style={{
            background: isRealtime ? "#6366f1" : "var(--color-surface-700)",
            borderColor: isRealtime ? "#6366f1" : "var(--color-surface-600)",
          }}
        >
          {isRealtime && <CheckCircle2 size={12} className="text-white" />}
        </div>
        <label className="font-bold text-sm cursor-pointer select-none" style={{ color: "var(--color-surface-200)" }}>
          {t("createChallenge.realtime")}
        </label>
      </div>

      <button
        disabled={!selectedMode || (!selectedTopic && selectedMode !== "survival")}
        onClick={() => setStep(2)}
        className="w-full py-3.5 rounded-xl font-black flex justify-center items-center gap-2 cursor-pointer border-none transition-all"
        style={{
          background: (!selectedMode || (!selectedTopic && selectedMode !== "survival"))
            ? "var(--color-surface-800)"
            : "linear-gradient(135deg,#6366f1,#818cf8)",
          color: (!selectedMode || (!selectedTopic && selectedMode !== "survival"))
            ? "var(--color-surface-600)"
            : "#fff",
          boxShadow: (!selectedMode || (!selectedTopic && selectedMode !== "survival"))
            ? "none"
            : "0 8px 24px rgb(99 102 241 / 0.30)",
        }}
      >
        {t("createChallenge.next")} <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-surface-500)" }} />
        <input
          type="text"
          placeholder={t("createChallenge.searchFriend")}
          value={searchFriend}
          onChange={(e) => setSearchFriend(e.target.value)}
          style={{ ...inputStyle, paddingLeft: "2.5rem" }}
        />
      </div>

      <div className="h-60 overflow-y-auto pr-1 space-y-2">
        {filteredFriends.length === 0 ? (
          <p className="text-center py-10 text-sm font-bold" style={{ color: "var(--color-surface-500)" }}>
            {t("createChallenge.noFriends")}
          </p>
        ) : (
          filteredFriends.map((f) => {
            const isSelected = selectedOpponents.includes(f.username);
            let roleLabel = null;
            let roleBg = "", roleColor = "";
            if (isSelected && selectedMode === "2v2") {
              const index = selectedOpponents.indexOf(f.username);
              if (index === 0) { roleLabel = t("createChallenge.teammate"); roleBg = "rgb(59 130 246 / 0.15)"; roleColor = "#60a5fa"; }
              else { roleLabel = t("createChallenge.opponent"); roleBg = "rgb(239 68 68 / 0.15)"; roleColor = "#f87171"; }
            }
            return (
              <div
                key={f.id || f.ID}
                onClick={() => toggleFriend(f.username)}
                className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                style={{
                  background: isSelected ? "rgb(99 102 241 / 0.10)" : "var(--color-surface-800)",
                  borderColor: isSelected ? "rgb(99 102 241 / 0.40)" : "var(--color-surface-700)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{
                      background: isSelected ? "#6366f1" : "var(--color-surface-700)",
                      color: isSelected ? "#fff" : "var(--color-surface-400)",
                    }}
                  >
                    {f.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm" style={{ color: "var(--color-surface-100)" }}>{f.name}</p>
                      {roleLabel && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-black border" style={{ background: roleBg, color: roleColor, borderColor: roleColor + "66" }}>
                          {roleLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--color-surface-500)" }}>@{f.username}</p>
                  </div>
                </div>
                {isSelected && <CheckCircle2 size={18} style={{ color: "#818cf8" }} />}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1 px-4 py-3 rounded-xl font-bold cursor-pointer border text-sm"
          style={{
            background: "var(--color-surface-800)",
            borderColor: "var(--color-surface-700)",
            color: "var(--color-surface-400)",
          }}
        >
          <ChevronLeft size={16} /> {t("createChallenge.back")}
        </button>
        <button
          disabled={selectedOpponents.length === 0 || loading}
          onClick={handleSubmit}
          className="flex-1 py-3 rounded-xl font-black flex justify-center items-center gap-2 cursor-pointer border-none"
          style={{
            background: selectedOpponents.length === 0 || loading
              ? "var(--color-surface-800)"
              : "linear-gradient(135deg,#6366f1,#818cf8)",
            color: selectedOpponents.length === 0 || loading
              ? "var(--color-surface-600)"
              : "#fff",
          }}
        >
          <Swords size={15} />
          {loading
            ? t("createChallenge.creating")
            : `${t("createChallenge.create")} (${selectedOpponents.length})`}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-md pointer-events-auto rounded-2xl overflow-hidden flex flex-col max-h-[90vh] border"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "var(--color-surface-700)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              }}
            >
              {/* Accent bar */}
              <div className="h-1 w-full shrink-0" style={{ background: "linear-gradient(90deg,#f97316,#6366f1,#818cf8)" }} />

              {/* Header */}
              <div
                className="p-5 border-b flex justify-between items-center sticky top-0 z-10 shrink-0"
                style={{
                  background: "var(--color-surface-900)",
                  borderColor: "var(--color-surface-800)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgb(99 102 241 / 0.15)", color: "#818cf8" }}
                  >
                    <Swords size={17} />
                  </div>
                  <div>
                    <h2 className="font-black text-base" style={{ color: "var(--color-surface-50)" }}>
                      {t("createChallenge.title")}
                    </h2>
                    <p className="text-[10px] font-bold" style={{ color: "var(--color-surface-500)" }}>
                      Step {step} / 2
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer"
                  style={{
                    background: "var(--color-surface-800)",
                    borderColor: "var(--color-surface-700)",
                    color: "var(--color-surface-400)",
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {step === 1 ? renderStep1() : renderStep2()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateChallengeModal;
