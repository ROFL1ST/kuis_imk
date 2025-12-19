// src/pages/dashboard/ReviewPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Calendar,
  ListChecks,
  Timer,
  BookOpen
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
        setData(res.data.data); // Sesuai JSON yang kamu kirim
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

  // Helper Format Durasi
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

  // --- LOGIC PARSING DATA BARU ---
  // Data backend flat: questions[], snapshot{}, score, quiz_title
  const { quiz_title, score, created_at, time_taken, questions = [], snapshot = {} } = data;
  const isPass = score >= 70;

  // Hitung Statistik Manual (Mapping Questions <-> Snapshot)
  let correctCount = 0;
  const detailedAnswers = questions.map((q) => {
    // Pastikan ID di snapshot dicocokkan sebagai string
    const userAnswer = snapshot[String(q.ID)]; 
    const isCorrect = userAnswer === q.correct;
    
    if (isCorrect) correctCount++;

    return {
      ...q,
      userAnswer,
      isCorrect,
    };
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

      {/* 1. Summary Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="bg-slate-50/50 p-6 sm:p-8 border-b border-slate-100 text-center sm:text-left">
           <h1 className="text-2xl font-bold text-slate-900 mb-2">{quiz_title}</h1>
           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200">
                 <Calendar size={14} /> 
                 {new Date(created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200">
                 <ListChecks size={14} /> 
                 {questions.length} Soal
              </span>
              {/* INFO TIME TAKEN */}
              <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 font-medium">
                 <Timer size={14} /> 
                 {formatDuration(time_taken)}
              </span>
           </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
           {/* Skor */}
           <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Skor Kamu</span>
              <span className="text-4xl font-black text-indigo-600">{score}</span>
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
               
               {/* Hint / Penjelasan (Jika ada) */}
               {q.hint && (
                 <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-100">
                    <strong>💡 Hint/Penjelasan:</strong> {q.hint}
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