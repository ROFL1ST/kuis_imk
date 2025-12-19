// src/pages/dashboard/History.jsx

import { useEffect, useState } from "react";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Swords, 
  History as HistoryIcon, 
  BarChart3,
  Timer
} from "lucide-react";
import { quizAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Riwayat Aktivitas | QuizApp";
    
    quizAPI
      .getMyHistory()
      .then((res) => {
        const sorted = (res.data.data || []).sort(
          (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
        );
        setHistories(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const goToReview = (historyId) => {
    navigate(`/history/review/${historyId}`);
  };

  // Helper: Format Durasi (Detik -> Menit:Detik)
  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const averageScore = histories.length > 0 
    ? Math.round(histories.reduce((acc, curr) => acc + curr.score, 0) / histories.length) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <HistoryIcon className="text-indigo-600" /> Riwayat Aktivitas
          </h1>
          <p className="text-slate-500 mt-1">
            Lihat perjalanan belajar dan evaluasi hasil kuismu.
          </p>
        </div>

        {!loading && histories.length > 0 && (
          <div className="flex gap-3">
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                   <CheckCircle2 size={18} />
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Kuis</p>
                   <p className="text-sm font-bold text-slate-800">{histories.length} Selesai</p>
                </div>
             </div>
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                   <BarChart3 size={18} />
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rata-rata</p>
                   <p className="text-sm font-bold text-slate-800">{averageScore} Poin</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* LIST CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
           <p className="text-slate-500 text-sm font-medium">Memuat riwayat...</p>
        </div>
      ) : histories.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <Clock size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Belum ada riwayat</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">
            Kamu belum mengerjakan kuis apapun. Yuk mulai mainkan kuis pertamamu!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {histories.map((item) => {
             const isDuel = item.quiz_title.includes("[DUEL]");
             const cleanTitle = item.quiz_title.replace("[DUEL]", "").trim();
             const isPass = item.score >= 70;

             return (
              <div
                key={item.ID}
                onClick={() => goToReview(item.ID)}
                className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPass ? 'bg-emerald-500' : 'bg-red-400'}`}></div>

                <div className="flex items-start gap-4 pl-2 w-full sm:w-auto">
                  {/* Score Badge */}
                  <div className={`
                    w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2
                    ${isPass 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'bg-red-50 border-red-100 text-red-500'}
                  `}>
                    <span className="font-extrabold text-xl leading-none">{item.score}</span>
                    <span className="text-[9px] font-bold uppercase mt-0.5 opacity-80">
                      {isPass ? 'Lulus' : 'Gagal'}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-2 line-clamp-1">
                      {isDuel && (
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-extrabold border border-orange-200 flex items-center gap-1">
                           <Swords size={10} /> DUEL
                        </span>
                      )}
                      {cleanTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Calendar size={12} className="text-slate-400" /> 
                        {new Date(item.CreatedAt).toLocaleDateString('id-ID', {
                           day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <CheckCircle2 size={12} className="text-slate-400" /> {item.total_soal} Soal
                      </span>
                      
                      {/* [BARU] Time Taken Info */}
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">
                        <Timer size={12} /> {formatDuration(item.time_taken)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center self-end sm:self-center">
                   <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 mr-2 transition-colors uppercase tracking-wide hidden sm:block">
                      Review
                   </span>
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight size={16} />
                   </div>
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