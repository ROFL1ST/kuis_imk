import { useEffect, useState, useRef, useCallback } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Swords,
  History as HistoryIcon,
  BarChart3,
  Timer,
  Loader2
} from "lucide-react";
import { quizAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [histories, setHistories] = useState([]);
  const [stats, setStats] = useState({ total_quiz: 0, average_score: 0 }); // State untuk statistik
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // State Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const navigate = useNavigate();
  const observer = useRef();

  useEffect(() => {
    document.title = "Riwayat Aktivitas | QuizApp";
    fetchHistory(1);
  }, []);

  const fetchHistory = async (pageNum) => {
    setLoading(true);
    try {
      const res = await quizAPI.getMyHistory(pageNum, limit);
      
      // [PENTING] Struktur baru dari Backend (Utils Response)
      // res.data.data berisi { list: [...], stats: {...} }
      const { list, stats: serverStats } = res.data.data;
      const meta = res.data.meta || {};

      setHistories((prev) => {
        return pageNum === 1 ? list : [...prev, ...list];
      });

      // Update stats hanya saat load halaman pertama agar konsisten
      if (pageNum === 1 && serverStats) {
        setStats(serverStats);
      }

      // Cek apakah masih ada data berikutnya
      if (list.length < limit || (meta.current_page >= meta.total_pages)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Gagal load history:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Logic Infinite Scroll (Intersection Observer)
  const lastHistoryElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => {
          const nextPage = prevPage + 1;
          fetchHistory(nextPage);
          return nextPage;
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const goToReview = (historyId) => {
    navigate(`/history/review/${historyId}`);
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

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

        {/* Stats Card (Menggunakan Data dari Backend) */}
        {!initialLoading && (
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Total
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {stats.total_quiz} Kuis
                </p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <BarChart3 size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Rata-rata
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {stats.average_score}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTENT */}
      {initialLoading ? (
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
            Kamu belum mengerjakan kuis apapun.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {histories.map((item, index) => {
            const isDuel = item.quiz_title.includes("[DUEL]");
            const cleanTitle = item.quiz_title.replace("[DUEL]", "").trim();
            const isPass = item.score >= 70;
            const isLastElement = index === histories.length - 1;

            return (
              <div
                key={`${item.ID}-${index}`}
                ref={isLastElement ? lastHistoryElementRef : null}
                onClick={() => goToReview(item.ID)}
                className={`group relative overflow-hidden p-5 rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 
                  ${
                    isDuel
                      ? "bg-gradient-to-r from-orange-50/80 to-white border-orange-200 hover:border-orange-300"
                      : "bg-white border-slate-200 hover:border-indigo-200"
                  }`}
              >
                {/* Visual Tambahan untuk Duel */}
                {isDuel ? (
                  <>
                    <div className="absolute -right-6 -bottom-6 text-orange-500/10 rotate-12 pointer-events-none">
                      <Swords size={100} strokeWidth={1.5} />
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400"></div>
                  </>
                ) : (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isPass ? "bg-emerald-500" : "bg-red-400"
                    }`}
                  ></div>
                )}

                <div className="flex items-start gap-4 pl-2 w-full sm:w-auto z-10">
                  {/* Score Badge */}
                  <div
                    className={`
                    w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 shadow-sm
                    ${
                      isDuel
                        ? "bg-white border-orange-100 text-orange-600"
                        : isPass
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-red-50 border-red-100 text-red-500"
                    }
                  `}
                  >
                    <span className="font-extrabold text-xl leading-none">
                      {item.score}
                    </span>
                    {isDuel ? (
                      <Swords size={12} className="mt-0.5 opacity-60" />
                    ) : (
                      <span className="text-[9px] font-bold uppercase mt-0.5 opacity-80">
                        {isPass ? "Lulus" : "Gagal"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isDuel && (
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Swords size={10} /> DUEL MODE
                        </span>
                      )}
                      <h3
                        className={`text-lg font-bold transition-colors line-clamp-1 ${
                          isDuel
                            ? "text-slate-900"
                            : "text-slate-800 group-hover:text-indigo-600"
                        }`}
                      >
                        {cleanTitle}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-white/60 px-2 py-1 rounded-md border border-slate-200/50">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(item.CreatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border 
                        ${
                          isDuel
                            ? "bg-orange-100/50 text-orange-700 border-orange-200/50"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        }`}
                      >
                        <Timer size={12} /> {formatDuration(item.time_taken)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center self-end sm:self-center z-10">
                  <span
                    className={`text-xs font-bold mr-2 transition-colors uppercase tracking-wide hidden sm:block ${
                      isDuel
                        ? "text-orange-400 group-hover:text-orange-600"
                        : "text-slate-400 group-hover:text-indigo-600"
                    }`}
                  >
                    Review
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm
                        ${
                          isDuel
                            ? "bg-white text-orange-400 group-hover:bg-orange-500 group-hover:text-white"
                            : "bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white"
                        }`}
                  >
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loader saat Fetching Data Baru */}
          {loading && (
            <div className="py-4 flex justify-center items-center text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-medium">Memuat lebih banyak...</span>
            </div>
          )}
          
          {/* Tanda sudah habis */}
          {!hasMore && histories.length > 0 && (
            <div className="py-6 text-center text-slate-400 text-xs font-medium border-t border-dashed border-slate-200 mt-4">
              Semua riwayat telah ditampilkan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;