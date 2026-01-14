import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { socialAPI } from "../../services/api";
import { Medal, ArrowLeft } from "lucide-react";
import UserAvatar from "../../components/ui/UserAvatar";
import Skeleton from "../../components/ui/Skeleton";
import { useLanguage } from "../../context/LanguageContext";

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

  const getRankStyle = (index) => {
    if (index === 0) return "bg-yellow-100 border-yellow-200 text-yellow-800";
    if (index === 1) return "bg-slate-100 border-slate-200 text-slate-700";
    if (index === 2) return "bg-orange-100 border-orange-200 text-orange-800";
    return "bg-white border-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header Title */}
        <div className="flex flex-col items-center mb-8 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 border-b border-slate-50 last:border-0"
            >
              <Skeleton className="w-8 h-8 rounded-full" /> {/* Rank/Number */}
              <Skeleton className="w-10 h-10 rounded-full" /> {/* Avatar */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" /> {/* Name */}
                <Skeleton className="h-3 w-20" /> {/* Subtitle */}
              </div>
              <Skeleton className="h-6 w-16 rounded-full" /> {/* Score */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to={`/topic/${slug}`}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft size={18} /> {t("leaderboard.backToQuiz")}
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 capitalize">
          {t("leaderboard.top10")} {slug}
        </h1>
        <p className="text-slate-500">{t("leaderboard.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3">
        {leaders.map((entry, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${getRankStyle(
              index
            )}`}
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-400 w-6 text-center">
                #{index + 1}
              </span>

              <UserAvatar user={entry} size="md" />

              <div>
                <p className="font-bold text-slate-800">{entry.name}</p>
                <p className="text-xs text-slate-500">@{entry.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Medal size={18} />
              <span className="font-bold text-lg">
                {entry.total_points} Poin
              </span>
            </div>
          </div>
        ))}

        {leaders.length === 0 && (
          <div className="text-center p-8 text-slate-500 bg-white rounded-xl border">
            {t("leaderboard.empty")}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
