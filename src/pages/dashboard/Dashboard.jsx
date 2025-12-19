// src/pages/dashboard/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  BookOpen,
  Trophy,
  Calendar,
  CheckCircle,
  Gift,
  Zap,
  Coins,
  Hash,
} from "lucide-react";
import { topicAPI, dailyAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, refreshProfile } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Daily Reward
  const [dailyData, setDailyData] = useState(null);

  // --- 1. FETCH DATA (Topics & Daily) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load Topics
        const topicRes = await topicAPI.getAllTopics();
        setTopics(topicRes.data.data || []);

        // Load Daily Info
        try {
          const dailyRes = await dailyAPI.getInfo();
          // Simpan data "streak" dan "missions" ke state
          setDailyData(dailyRes.data.data);
        } catch (err) {
          console.error("Failed to load daily", err);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. HANDLE CLAIMS ---
  const handleClaimLogin = async () => {
    try {
      const res = await dailyAPI.claimLogin();
      // Pastikan path response sesuai dengan backend (res.data.data.coins_gained)
      console.log("Claim login response:", res);
      toast.success(`+${res.data.data.coins_gained} Koin!`);

      // Update UI lokal: Ubah status streak jadi 'claimed'
      setDailyData((prev) => ({
        ...prev,
        streak: { ...prev.streak, status: "claimed" }, // <--- FIX: Pakai 'streak'
      }));
      refreshProfile();
    } catch (error) {
      console.error("Claim login error:", error);
      toast.error(error.response?.data?.message || "Gagal klaim");
    }
  };

  const handleClaimMission = async (missionId) => {
    try {
      const res = await dailyAPI.claimMission(missionId);
      toast.success(`Misi Selesai! +${res.data.data.coins_gained} Koin`);

      // Update UI lokal: Ubah status misi jadi 'claimed'
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

  useEffect(() => {
    document.title = "Dashboard | QuizApp";
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

        {/* Quick Stats */}
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

      {/* === SECTION DAILY REWARDS & MISSIONS === */}
      {/* FIX: Cek dailyData.streak (bukan streak_info) */}
      {dailyData && dailyData.streak && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Login Streak Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

            <div>
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Calendar size={18} /> <span>Daily Streak</span>
              </div>

              {/* Judul berubah dinamis */}
              <h2 className="text-3xl font-bold">
                {dailyData.streak.status === "cooldown" ? "Next: " : ""}
                Hari ke-{dailyData.streak.day}
              </h2>

              <p className="opacity-80 text-sm mt-1">
                {dailyData.streak.status === "cooldown"
                  ? "Kamu sudah absen hari ini. Lanjut besok!"
                  : "Login berturut-turut untuk bonus besar!"}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <span className="font-bold flex items-center gap-2">
                  <Gift size={18} className="text-yellow-300" />
                  {dailyData.streak.reward} Koin
                </span>

                <button
                  onClick={handleClaimLogin}
                  // Disable jika status bukan claimable
                  disabled={dailyData.streak.status !== "claimable"}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dailyData.streak.status === "claimable"
                      ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-md cursor-pointer"
                      : "bg-black/20 text-white/70 cursor-not-allowed"
                  }`}
                >
                  {dailyData.streak.status === "cooldown"
                    ? "Besok Lagi"
                    : dailyData.streak.status === "claimed"
                    ? "Terklaim"
                    : "Klaim"}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Daily Missions List */}
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

                  {/* Progress & Button */}
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
                          : mission.status === "claimed"
                          ? "bg-slate-200 text-slate-400"
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

      {/* === SECTION TOPICS GRID === */}
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
                key={topic.id}
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
    </div>
  );
};

export default Dashboard;
