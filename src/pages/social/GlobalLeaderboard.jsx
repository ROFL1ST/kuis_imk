// src/pages/social/GlobalLeaderboard.jsx

import { useState, useEffect } from "react";
import { leaderboardAPI } from "../../services/newFeatures";
import { motion } from "framer-motion";
import { Medal, Trophy, Crown, Star, Zap } from "lucide-react";
import UserAvatar from "../../components/ui/UserAvatar";
import { useLanguage } from "../../context/LanguageContext";
import Skeleton from "../../components/ui/Skeleton";

const RANK_CONFIG = [
  {
    bg: "rgb(234 179 8 / 0.10)",
    border: "rgb(234 179 8 / 0.30)",
    nameColor: "#fbbf24",
    badgeBg: "rgb(234 179 8 / 0.15)",
    badgeColor: "#fbbf24",
    xpColor: "#fbbf24",
    rankIcon: <Crown size={20} fill="#fbbf24" color="#fbbf24" />,
    glow: "0 0 24px rgb(234 179 8 / 0.15)",
    levelColor: "rgb(234 179 8 / 0.7)",
  },
  {
    bg: "rgb(148 163 184 / 0.08)",
    border: "rgb(148 163 184 / 0.25)",
    nameColor: "#cbd5e1",
    badgeBg: "rgb(148 163 184 / 0.12)",
    badgeColor: "#94a3b8",
    xpColor: "#94a3b8",
    rankIcon: <Medal size={18} color="#94a3b8" />,
    glow: "none",
    levelColor: "rgb(148 163 184 / 0.6)",
  },
  {
    bg: "rgb(249 115 22 / 0.08)",
    border: "rgb(249 115 22 / 0.22)",
    nameColor: "#fb923c",
    badgeBg: "rgb(249 115 22 / 0.12)",
    badgeColor: "#fb923c",
    xpColor: "#fb923c",
    rankIcon: <Star size={18} fill="#fb923c" color="#fb923c" />,
    glow: "none",
    levelColor: "rgb(249 115 22 / 0.6)",
  },
];

const getConfig = (index) =>
  RANK_CONFIG[index] || {
    bg: "var(--color-surface-900)",
    border: "var(--color-surface-800)",
    nameColor: "var(--color-surface-100)",
    badgeBg: "var(--color-surface-800)",
    badgeColor: "var(--color-surface-400)",
    xpColor: "#818cf8",
    rankIcon: null,
    glow: "none",
    levelColor: "var(--color-surface-500)",
  };

const GlobalLeaderboard = () => {
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await leaderboardAPI.getGlobal();
        if (res.data.status === "success") {
          setLeaderboard(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: "linear-gradient(135deg, rgb(234 179 8 / 0.18), rgb(234 179 8 / 0.05))",
            border: "1px solid rgb(234 179 8 / 0.28)",
            boxShadow: "0 0 40px rgb(234 179 8 / 0.15)",
          }}
        >
          <Trophy size={36} fill="#fbbf24" color="#fbbf24" />
        </motion.div>

        <h1
          className="text-3xl font-black tracking-tight mb-1"
          style={{ color: "var(--color-surface-50)" }}
        >
          {t("globalLeaderboard.title")}
        </h1>
        <p className="text-sm" style={{ color: "var(--color-surface-500)" }}>
          {t("globalLeaderboard.subtitle")}
        </p>
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "var(--color-surface-800)",
              }}
            >
              <Skeleton className="w-10 h-10 rounded-full shrink-0" style={{ background: "var(--color-surface-800)" }} />
              <Skeleton className="w-11 h-11 rounded-full shrink-0" style={{ background: "var(--color-surface-800)" }} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" style={{ background: "var(--color-surface-800)" }} />
                <Skeleton className="h-3 w-24" style={{ background: "var(--color-surface-800)" }} />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-5 w-20 ml-auto" style={{ background: "var(--color-surface-800)" }} />
                <Skeleton className="h-3 w-14 ml-auto" style={{ background: "var(--color-surface-800)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div
          className="text-center py-24 rounded-2xl border"
          style={{
            background: "var(--color-surface-900)",
            borderColor: "var(--color-surface-800)",
          }}
        >
          <Trophy size={40} className="mx-auto mb-3" style={{ color: "var(--color-surface-700)" }} />
          <p style={{ color: "var(--color-surface-500)" }}>
            {t("globalLeaderboard.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {leaderboard.map((user, index) => {
            const cfg = getConfig(index);
            return (
              <motion.div
                key={user.ID || user.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex items-center p-4 rounded-2xl border transition-all cursor-default"
                style={{
                  background: cfg.bg,
                  borderColor: cfg.border,
                  boxShadow: cfg.glow,
                }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Rank */}
                <div className="w-10 flex justify-center items-center shrink-0">
                  {index < 3 ? (
                    cfg.rankIcon
                  ) : (
                    <span
                      className="text-sm font-black"
                      style={{ color: cfg.nameColor }}
                    >
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar + name */}
                <div className="ml-3 flex-1 flex items-center gap-3">
                  <UserAvatar user={user} size="md" />
                  <div>
                    <h3
                      className="font-black text-sm leading-tight"
                      style={{ color: cfg.nameColor }}
                    >
                      {user.name}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-surface-500)" }}
                    >
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* XP + Level */}
                <div className="text-right shrink-0">
                  <div
                    className="flex items-center gap-1 justify-end font-black text-base font-mono"
                    style={{ color: cfg.xpColor }}
                  >
                    <Zap size={13} fill={cfg.xpColor} />
                    {user.xp}
                    <span
                      className="text-xs font-normal ml-0.5"
                      style={{ color: "var(--color-surface-500)" }}
                    >
                      XP
                    </span>
                  </div>
                  <p
                    className="text-[10px] font-black tracking-widest uppercase mt-0.5"
                    style={{ color: cfg.levelColor }}
                  >
                    LVL {user.level}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GlobalLeaderboard;
