import { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle2, ChevronRight, Swords, BookOpen } from "lucide-react";
import { quizAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Riwayat Aktivitas | QuizApp";
  }, []);

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
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Clock className="text-indigo-600" size={32} /> Riwayat Aktivitas
        </h1>
        <p className="text-slate-500 mt-1">Lacak perkembangan belajar dan skor kuis kamu.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Memuat riwayat...</div>
      ) : histories.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <Clock size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Belum ada riwayat</h3>
          <p className="text-slate-500">Kamu belum mengerjakan kuis apapun.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {histories.map((item) => {
             const isDuel = item.quiz_title.includes("[DUEL]");
             const cleanTitle = item.quiz_title.replace("[DUEL]", "").trim();
             const isPass = item.score >= 70;

             return (
              <div
                key={item.ID}
                onClick={() => goToReview(item.ID)}
                className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 
                    ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}
                  `}>
                    <span className="font-bold text-lg">{item.score}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                      {isDuel && <Swords size={16} className="text-orange-500" />}
                      {cleanTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-xs font-medium">
                        <Calendar size={12} /> {new Date(item.CreatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-xs font-medium">
                        <CheckCircle2 size={12} /> {item.total_soal} Soal
                      </span>
                      {isDuel && (
                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">
                           DUEL MODE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-500 text-sm font-medium self-end sm:self-auto">
                  Detail <ChevronRight size={18} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default History;