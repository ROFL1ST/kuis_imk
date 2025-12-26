// src/pages/dashboard/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  CheckCircle,
  Gift,
  Zap,
  Coins,
  Hash,
  Flame,
  BrainCircuit,
  Globe,
  Play,
  AlertTriangle, // Icon Warning
  Loader2,       // Icon Loading
  XCircle,       // Icon Weakness
  ArrowRight
} from "lucide-react";
import { topicAPI, dailyAPI, quizAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Skeleton from "../../components/ui/Skeleton";
import Modal from "../../components/ui/Modal"; // Pastikan Modal diimport

const Dashboard = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  // State Data Utama
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState(null);

  // State Modal Remedial & Analisis
  const [showRemedialModal, setShowRemedialModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [weakTopics, setWeakTopics] = useState([]); 

  useEffect(() => {
    document.title = "Dashboard | QuizApp";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topicRes, dailyRes] = await Promise.allSettled([
          topicAPI.getAllTopics(),
          dailyAPI.getInfo(),
        ]);

        if (topicRes.status === "fulfilled") {
          setTopics(topicRes.value.data.data || []);
        }

        if (dailyRes.status === "fulfilled") {
          setDailyData(dailyRes.value.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClaimLogin = async () => {
    try {
      const res = await dailyAPI.claimLogin();
      toast.success(`+${res.data.data.coins_gained} Koin!`);

      setDailyData((prev) => ({
        ...prev,
        streak: { ...prev.streak, status: "claimed" },
      }));
      refreshProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal klaim");
    }
  };

  const handleClaimMission = async (missionId) => {
    try {
      const res = await dailyAPI.claimMission(missionId);
      toast.success(`Misi Selesai! +${res.data.data.reward} Koin`);

      setDailyData((prev) => ({
        ...prev,
        missions: prev.missions.map((m) =>
          m.id === missionId ? { ...m, status: "claimed" } : m
        ),
      }));
      refreshProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal klaim");
    }
  };

  // --- LOGIC DIAGNOSIS REMEDIAL ---
  const handleOpenRemedial = async () => {
    setShowRemedialModal(true);
    setAnalyzing(true);
    setWeakTopics([]);

    try {
      // 1. Fetch soal remedial dulu untuk diintip isinya
      const res = await quizAPI.getRemedial();
      const questions = res.data.data || [];

      // 2. Ekstrak nama Quiz/Topik dari soal
      // Note: Backend perlu Preload("Quiz") agar properti 'Quiz.Title' atau 'quiz.title' tersedia.
      // Jika backend belum update, akan tampil "Materi Umum" atau "Quiz ID: ..."
      const topicsFound = questions.map(q => {
         // Cek berbagai kemungkinan struktur response (CamelCase/SnakeCase)
         return q.Quiz?.Title || q.quiz?.title || q.Quiz?.title || (q.quiz_id ? `Quiz Materi #${q.quiz_id}` : "Materi Umum");
      });

      // Hilangkan duplikat
      const uniqueTopics = [...new Set(topicsFound)];
      
      // Ambil maksimal 3 topik untuk ditampilkan
      setWeakTopics(uniqueTopics.slice(0, 3)); 

    } catch (err) {
      // Jika 404, artinya tidak ada remedial (User Aman)
      if (err.response && err.response.status === 404) {
        setShowRemedialModal(false);
        toast.success("Hebat! Tidak ada materi yang perlu diulang saat ini.", {
          icon: "🎉",
          duration: 4000,
        });
      } else {
        toast.error("Gagal menganalisis data remedial.");
        setShowRemedialModal(false);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const startRemedial = () => {
    setShowRemedialModal(false);
    navigate("/play/remedial");
  };

  const quizStreakCount = dailyData?.streak?.quiz_streak ?? user?.streak_count ?? 0;
  const isQuizDoneToday = dailyData?.streak?.is_quiz_done ?? false;
  const loginStreakDay = dailyData?.streak?.day ?? 1;
  const isLoginRewardClaimed = dailyData?.streak?.status === "cooldown" || dailyData?.streak?.status === "claimed";

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="w-full h-48 md:h-64 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="text-yellow-500 fill-yellow-500" />
            Selamat Datang, {user?.name}!
          </h1>
          <p className="text-slate-500 mt-1">
            Siap untuk mengasah otak hari ini?
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">
                Level
              </p>
              <p className="text-lg font-bold text-slate-800">
                {user?.level || 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DAILY SECTION */}
      {dailyData && dailyData.streak && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Streak (Belajar) & Daily Gift (Login) */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

            {/* Bagian Atas: QUIZ STREAK (Activity) */}
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Flame
                  size={18}
                  className={
                    quizStreakCount > 0 || isQuizDoneToday
                      ? "fill-white text-orange-400"
                      : "text-slate-300"
                  }
                />
                <span className="font-bold">Mode Serius</span>
              </div>

              <h2 className="text-4xl font-black mb-1">
                {quizStreakCount} Hari
              </h2>
              <p className="opacity-80 text-sm font-medium">
                Streak Quiz Beruntun
              </p>

              <div
                className={`mt-4 text-xs p-2 rounded-lg backdrop-blur-sm inline-block font-bold ${
                  isQuizDoneToday
                    ? "bg-green-500/20 text-green-100"
                    : "bg-orange-500/20 text-orange-100"
                }`}
              >
                {isQuizDoneToday
                  ? "🔥 Api aman! Kamu sudah latihan hari ini."
                  : "❄️ Api hampir padam! Kerjakan kuis sekarang."}
              </div>
            </div>

            {/* Bagian Bawah: LOGIN STREAK (Hadiah Harian) */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-indigo-100 uppercase font-bold">
                    Hadiah Login (Hari ke-{loginStreakDay})
                  </span>
                  <span className="font-bold flex items-center gap-1 text-sm">
                    <Gift size={14} className="text-yellow-300" />
                    {dailyData.streak.reward} Koin
                  </span>
                </div>
                <button
                  onClick={handleClaimLogin}
                  disabled={dailyData.streak.status !== "claimable"}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                    dailyData.streak.status === "claimable"
                      ? "bg-white text-indigo-600 hover:bg-indigo-50 cursor-pointer animate-bounce"
                      : "bg-black/20 text-white/70 cursor-not-allowed"
                  }`}
                >
                  {isLoginRewardClaimed ? "TERAMBIL" : "KLAIM"}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Missions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={20} /> Misi Hari
                Ini
              </h3>
              <span className="text-xs font-medium text-slate-400">
                Reset tiap 24 jam
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {dailyData.missions?.map((mission) => (
                <div
                  key={mission.id}
                  className="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-colors bg-slate-50/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm">
                        {mission.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {mission.description}
                      </p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Coins size={10} /> {mission.reward}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1">
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            mission.status === "claimable" ||
                            mission.status === "claimed"
                              ? "bg-emerald-500"
                              : "bg-indigo-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (mission.progress / mission.target) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 text-right">
                        {mission.progress}/{mission.target}
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaimMission(mission.id)}
                      disabled={mission.status !== "claimable"}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        mission.status === "claimable"
                          ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {mission.status === "claimed"
                        ? "Selesai"
                        : mission.status === "claimable"
                        ? "Klaim"
                        : "Jalan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MENU PINTAR (Remedial & Komunitas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Smart Remedial (Active with Modal Insight) */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BrainCircuit className="text-rose-500" /> Smart Remedial
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              AI akan mendeteksi kelemahanmu dan menyusun soal khusus.
            </p>
            {/* Ubah onClick ke handleOpenRemedial */}
            <button
              onClick={handleOpenRemedial}
              className="mt-4 px-5 py-2 bg-white text-rose-600 font-bold rounded-lg shadow-sm border border-rose-100 hover:shadow-md transition text-sm cursor-pointer"
            >
              Analisis Kelemahan Saya
            </button>
          </div>
          <div className="hidden sm:block text-rose-200 relative z-0">
            <BrainCircuit size={64} />
          </div>
        </div>

        {/* 2. Kuis Komunitas (Coming Soon) */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-inner flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-2 opacity-70">
            <div>
              <h3 className="font-bold text-slate-600 flex items-center gap-2">
                <Globe className="text-slate-400" /> Kuis Komunitas
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Coba kuis buatan pemain lain.
              </p>
            </div>
            <div className="p-3 bg-white rounded-full text-slate-300 border border-slate-100">
              <Globe size={24} />
            </div>
          </div>

          <button
            disabled
            className="w-full text-center py-2 bg-slate-200 text-slate-400 rounded-lg font-bold cursor-not-allowed text-sm border border-slate-300"
          >
            Segera Hadir 🚧
          </button>
        </div>
      </div>

      {/* TOPICS GRID */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Jelajahi Topik
          </h2>
        </div>
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.ID}
                to={`/topic/${topic.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Hash size={24} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2">
                    {topic.description ||
                      "Topik menarik untuk mengasah pengetahuanmu."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-wider">
                    Mulai Kuis
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Play size={14} fill="currentColor" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              Belum ada topik yang tersedia.
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL DIAGNOSIS REMEDIAL --- */}
      <Modal
        isOpen={showRemedialModal}
        onClose={() => setShowRemedialModal(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center">
          {analyzing ? (
            <div className="py-8">
                <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Menganalisis Jawabanmu...</h3>
                <p className="text-sm text-slate-400">Sistem sedang mencari topik yang perlu kamu ulang.</p>
            </div>
          ) : (
            <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                    <AlertTriangle size={32} />
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-2">Diagnosis Selesai</h2>
                <p className="text-slate-500 text-sm mb-6 px-4">
                   Kamu sering melakukan kesalahan pada topik-topik berikut:
                </p>
                
                {/* Daftar Topik Lemah */}
                <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Fokus Perbaikan Hari Ini:</h4>
                    <div className="space-y-2">
                        {weakTopics.length > 0 ? weakTopics.map((topicName, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <XCircle size={18} className="text-red-500 shrink-0" />
                                <span className="font-bold text-slate-700 text-sm">{topicName}</span>
                            </div>
                        )) : (
                            <div className="text-center text-slate-400 text-xs italic">
                                Data spesifik tidak tersedia, tapi soal sudah siap dikerjakan!
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowRemedialModal(false)}
                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                    >
                        Nanti Saja
                    </button>
                    <button 
                        onClick={startRemedial}
                        className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-200 transition flex items-center justify-center gap-2"
                    >
                        Mulai Perbaikan <ArrowRight size={18} />
                    </button>
                </div>
            </>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;