import { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle, Eye } from "lucide-react";
import { quizAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    quizAPI
      .getMyHistory()
      .then((res) => setHistories(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const goToReview = (historyId) => {
    navigate(`/history/review/${historyId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <Clock className="text-indigo-600" /> Riwayat Aktivitas
      </h1>

      {loading ? (
        <div className="text-center py-10">Memuat riwayat...</div>
      ) : histories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-slate-500">Kamu belum mengerjakan kuis apapun.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {histories.map((item) => (
            <div
              key={item.ID}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {item.quiz_title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />{" "}
                    {new Date(item.CreatedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle size={14} /> {item.total_soal} Soal
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* REVIEW BUTTON */}
                <button
                  onClick={() => goToReview(item.ID)}
                  className="px-4 py-2 rounded-lg  text-gray-600 text-sm flex items-center gap-2 hover:text-indigo-700"
                >
                  <Eye size={16} />
                  Review
                </button>
                {/* Score */}
                <div className="text-right">
                  <span
                    className={`text-2xl font-bold ${
                      item.score >= 70 ? "text-green-600" : "text-orange-500"
                    }`}
                  >
                    {item.score}
                  </span>
                  <p className="text-xs text-slate-400">Poin</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
