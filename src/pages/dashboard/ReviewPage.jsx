import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Calendar,
  ListChecks,
  Timer,
  BookOpen,
  Swords // Import icon Swords
} from "lucide-react";
import { quizAPI } from "../../services/api";
import toast from "react-hot-toast";

const ReviewPage = () => {
  const { historyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await quizAPI.getHistoryById(historyId);
        setData(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat detail riwayat");
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [historyId, navigate]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} detik`;
    return `${m} menit ${s} detik`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { quiz_title, score, created_at, time_taken, questions = [], snapshot = {} } = data;
  const isPass = score >= 70;
  
  // Deteksi Duel Mode
  const isDuel = quiz_title.includes("[DUEL]");
  const cleanTitle = quiz_title.replace("[DUEL]", "").trim();

  // Hitung Statistik Manual
  let correctCount = 0;
  const detailedAnswers = questions.map((q) => {
    const userAnswer = snapshot[String(q.ID)]; 
    const isCorrect = userAnswer === q.correct;
    if (isCorrect) correctCount++;
    return { ...q, userAnswer, isCorrect };
  });

  const wrongCount = questions.length - correctCount;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      
      {/* Tombol Back */}
      <button 
        onClick={() => navigate("/history")}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Kembali ke Riwayat
      </button>

      {/* 1. Summary Card (Dengan Visual Duel) */}
      <div className={`rounded-3xl shadow-sm border overflow-hidden mb-8 relative 
          ${isDuel ? "bg-gradient-to-br from-orange-50 to-white border-orange-200" : "bg-white border-slate-200"}`}
      >
        {/* Watermark Duel */}
        {isDuel && (
          <div className="absolute right-0 top-0 text-orange-500/10 -translate-y-1/4 translate-x-1/4 pointer-events-none">
             <Swords size={200} strokeWidth={1} />
          </div>
        )}

        <div className={`p-6 sm:p-8 border-b text-center sm:text-left relative z-10
            ${isDuel ? "border-orange-100 bg-orange-50/50" : "border-slate-100 bg-slate-50/50"}`}
        >
           <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-2">
               <div>
                   {/* Badge Duel */}
                   {isDuel && (
                       <span className="inline-flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-sm">
                           <Swords size={12} /> DUEL MODE
                       </span>
                   )}
                   <h1 className="text-2xl font-bold text-slate-900">{cleanTitle}</h1>
               </div>
               
               {/* Time Taken Badge (Besar) */}
               <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm
                  ${isDuel ? "bg-white border-orange-200 text-orange-600 shadow-sm" : "bg-white border-indigo-200 text-indigo-600 shadow-sm"}`}
               >
                   <Timer size={18} />
                   {formatDuration(time_taken)}
               </div>
           </div>

           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
                 <Calendar size={14} /> 
                 {new Date(created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </span>
              <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
                 <ListChecks size={14} /> 
                 {questions.length} Soal
              </span>
           </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
           {/* Skor */}
           <div className={`col-span-2 md:col-span-1 p-4 rounded-2xl border flex flex-col items-center justify-center
               ${isDuel ? "bg-white border-orange-100 shadow-sm" : "bg-indigo-50 border-indigo-100"}`}
           >
              <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDuel ? "text-orange-400" : "text-indigo-400"}`}>
                  Skor Kamu
              </span>
              <span className={`text-4xl font-black ${isDuel ? "text-orange-500" : "text-indigo-600"}`}>
                  {score}
              </span>
           </div>

           {/* Status */}
           <div className={`col-span-2 md:col-span-1 p-4 rounded-2xl border flex flex-col items-center justify-center ${isPass ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isPass ? 'text-emerald-400' : 'text-red-400'}`}>Status</span>
              <span className={`text-xl font-bold flex items-center gap-2 ${isPass ? 'text-emerald-600' : 'text-red-500'}`}>
                 {isPass ? <CheckCircle size={24} /> : <XCircle size={24} />}
                 {isPass ? "LULUS" : "GAGAL"}
              </span>
           </div>
           
           {/* Benar */}
           <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Benar</span>
              <span className="text-2xl font-bold text-emerald-500">{correctCount}</span>
           </div>

           {/* Salah */}
           <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Salah</span>
              <span className="text-2xl font-bold text-red-500">{wrongCount}</span>
           </div>
        </div>
      </div>

      {/* 2. Detail Pembahasan */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
           <BookOpen className="text-indigo-600" /> Detail Jawaban
        </h2>

        {detailedAnswers.map((q, index) => {
           return (
             <div 
               key={q.ID} 
               className={`p-6 rounded-2xl border-2 transition-all ${
                  q.isCorrect 
                  ? "bg-white border-slate-100 hover:border-emerald-100" 
                  : "bg-white border-slate-100 hover:border-red-100"
               }`}
             >
               {/* Header Soal */}
               <div className="flex justify-between gap-4 mb-4">
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-lg h-fit">
                     No. {index + 1}
                  </span>
                  {q.isCorrect ? (
                     <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                        <CheckCircle size={14} /> Benar
                     </span>
                  ) : (
                     <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        <XCircle size={14} /> Salah
                     </span>
                  )}
               </div>

               {/* Pertanyaan */}
               <p className="text-lg font-medium text-slate-800 mb-6">{q.question}</p>

               {/* Opsi Jawaban */}
               <div className="grid gap-3">
                  {/* Jawaban User */}
                  <div className={`p-4 rounded-xl border flex justify-between items-center ${
                     q.isCorrect 
                     ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                     : "bg-red-50 border-red-200 text-red-800"
                  }`}>
                     <div>
                        <span className="text-xs font-bold uppercase opacity-60 block mb-1">Jawaban Kamu</span>
                        <span className="font-semibold">{q.userAnswer || "- Tidak Dijawab -"}</span>
                     </div>
                     {q.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>

                  {/* Kunci Jawaban (Jika Salah) */}
                  {!q.isCorrect && (
                     <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex justify-between items-center">
                        <div>
                           <span className="text-xs font-bold uppercase opacity-60 block mb-1">Jawaban Benar</span>
                           <span className="font-semibold">{q.correct}</span>
                        </div>
                        <CheckCircle size={20} />
                     </div>
                  )}
               </div>
               
               {/* Hint / Penjelasan */}
               {q.hint && (
                 <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-100 flex gap-2 items-start">
                    <span>💡</span>
                    <div>
                        <span className="font-bold block text-xs uppercase opacity-70 mb-0.5">Penjelasan</span>
                        {q.hint}
                    </div>
                 </div>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default ReviewPage;