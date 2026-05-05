// src/pages/social/Leaderboard.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { socialAPI } from "../../services/api";
import { Medal, ArrowLeft, Trophy, Crown, Star } from "lucide-react";
import UserAvatar from "../../components/ui/UserAvatar";
import Skeleton from "../../components/ui/Skeleton";
import { useLanguage } from "../../context/LanguageContext";

// Per-rank configs
const RANK_CONFIG = [
  {
    label: "1st",
    bg: "rgb(234 179 8 / 0.10)",
    border: "rgb(234 179 8 / 0.30)",
    namColor: "#fbbf24",
    badgeBg: "rgb(234 179 8 / 0.15)",
    badgeColor: "#fbbf24",
    icon: <Crown size={14} fill="#fbbf24" color="#fbbf24" />,
    rankColor: "#fbbf24",
    glow: "0 0 20px rgb(234 179 8 / 0.15)",
  },
  {
    label: "2nd",
    bg: "rgb(148 163 184 / 0.08)",
    border: "rgb(148 163 184 / 0.25)",
    namColor: "#cbd5e1",
    badgeBg: "rgb(148 163 184 / 0.12)",
    badgeColor: "#94a3b8",
    icon: <Medal size={14} color="#94a3b8" />,
    rankColor: "#94a3b8",
    glow: "none",
  },
  {
    label: "3rd",
    bg: "rgb(249 115 22 / 0.08)",
    border: "rgb(249 115 22 / 0.22)",
    namColor: "#fb923c",
    badgeBg: "rgb(249 115 22 / 0.12)",
    badgeColor: "#fb923c",
    icon: <Star size={14} fill="#fb923c" color="#fb923c" />,
    rankColor: "#fb923c",
    glow: "none",
  },
];

const getConfig = (index) =>
  RANK_CONFIG[index] || {
    bg: "var(--color-surface-900)",
    border: "var(--color-surface-800)",
    namColor: "var(--color-surface-100)",
    badgeBg: "var(--color-surface-800)",
    badgeColor: "var(--color-surface-400)",
    icon: null,
    rankColor: "var(--color-surface-500)",
    glow: "none",
  };

const Leaderboard = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialAPI
      .getLeaderboard(slug)
      .then((res) => setLeaders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    document.title = `Peringkat: ${slug} | QuizApp`;
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-5 w-32 mb-8" style={{ background: "var(--color-surface-800)" }} />
        <div className="flex flex-col items-center mb-10 space-y-2">
          <Skeleton className="h-8 w-52" style={{ background: "var(--color-surface-800)" }} />
          <Skeleton className="h-4 w-64" style={{ background: "var(--color-surface-800)" }} />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "var(--color-surface-800)",
              }}
            >
              <Skeleton className="w-8 h-8 rounded-full" style={{ background: "var(--color-surface-800)" }} />
              <Skeleton className="w-10 h-10 rounded-full" style={{ background: "var(--color-surface-800)" }} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" style={{ background: "var(--color-surface-800)" }} />
                <Skeleton className="h-3 w-20" style={{ background: "var(--color-surface-800)" }} />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" style={{ background: "var(--color-surface-800)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Back */}
      <Link
        to={`/topic/${slug}`}
        className="inline-flex items-center gap-2 mb-6 text-sm font-bold transition-colors"
        style={{ color: "var(--color-surface-500)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-surface-200)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-surface-500)")}
      >
        <ArrowLeft size={16} />
        {t("leaderboard.backToQuiz")}
      </Link>

      {/* Header */}
      <div className="text-center mb-10">
        {/* Trophy icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: "linear-gradient(135deg, rgb(234 179 8 / 0.15), rgb(234 179 8 / 0.05))",
            border: "1px solid rgb(234 179 8 / 0.25)",
            boxShadow: "0 0 32px rgb(234 179 8 / 0.12)",
          }}
        >
          <Trophy size={28} fill="#fbbf24" color="#fbbf24" />
        </div>

        <h1
          className="text-3xl font-black tracking-tight capitalize mb-1"
          style={{ color: "var(--color-surface-50)" }}
        >
          {t("leaderboard.top10")} <span style={{ color: "#fbbf24" }}>{slug}</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--color-surface-500)" }}>
          {t("leaderboard.subtitle")}
        </p>
      </div>

      {/* List */}
      {leaders.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border"
          style={{
            background: "var(--color-surface-900)",
            borderColor: "var(--color-surface-800)",
          }}
        >
          <Trophy size={36} className="mx-auto mb-3" style={{ color: "var(--color-surface-700)" }} />
          <p style={{ color: "var(--color-surface-500)" }}>{t("leaderboard.empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {leaders.map((entry, index) => {
            const cfg = getConfig(index);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-2xl border transition-all"
                style={{
                  background: cfg.bg,
                  borderColor: cfg.border,
                  boxShadow: cfg.glow,
                }}
              >
                {/* Left */}
                <div className="flex items-center gap-3">
                  {/* Rank number */}
                  <div
                    className="w-8 text-center font-black text-sm shrink-0"
                    style={{ color: cfg.rankColor }}
                  >
                    {index < 3 ? cfg.icon : `#${index + 1}`}
                  </div>

                  <UserAvatar user={entry} size="md" />

                  <div>
                    <p className="font-black text-sm" style={{ color: cfg.namColor }}>
                      {entry.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-surface-500)" }}>
                      @{entry.username}
                    </p>
                  </div>
                </div>

                {/* Right: score */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm"
                  style={{
                    background: cfg.badgeBg,
                    color: cfg.badgeColor,
                    border: `1px solid ${cfg.border}`,
                  }}
                >
                  <Medal size={14} />
                  {entry.total_points} Poin
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
