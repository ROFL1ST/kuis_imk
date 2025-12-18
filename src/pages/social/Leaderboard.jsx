import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { socialAPI } from "../../services/api";
import { Medal, ArrowLeft } from "lucide-react";
import UserAvatar from "../../components/ui/UserAvatar";

const Leaderboard = () => {
  const { slug } = useParams();
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
    document.title = `Leaderboard: ${slug} | QuizApp`;
  }, [slug]);

  const getRankStyle = (index) => {
    if (index === 0) return "bg-yellow-100 border-yellow-200 text-yellow-800";
    if (index === 1) return "bg-slate-100 border-slate-200 text-slate-700";
    if (index === 2) return "bg-orange-100 border-orange-200 text-orange-800";
    return "bg-white border-slate-100 text-slate-600";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to={`/topic/${slug}`}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft size={18} /> Kembali ke Kuis
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 capitalize">
          Top 10 {slug}
        </h1>
        <p className="text-slate-500">Pejuang skor tertinggi di topik ini</p>
      </div>

      {loading ? (
        <div className="text-center">Memuat Peringkat...</div>
      ) : (
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

               
                <UserAvatar
                  user={entry} 
                  size="md"
                />

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
              Belum ada data leaderboard. Jadilah yang pertama!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
