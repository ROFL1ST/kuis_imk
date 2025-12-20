// src/pages/about/WhatsNew.jsx

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Zap,
  Bug,
  Calendar,
  GitCommit,
  Coins,
  Trophy,
  Palette,
  Rocket,
  LayoutList,
  BarChart2
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WhatsNew = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Apa yang Baru? | QuizApp";
  }, []);

  const roadmap = [
    {
      title: "Challenge Rewards",
      description:
        "Menang duel lawan teman atau player lain akan memberikan hadiah Koin. Buktikan siapa yang paling pintar!",
      icon: <Coins className="text-yellow-500" size={24} />,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    {
      title: "Advanced Achievement System",
      description:
        "Selesaikan misi unik dan raih Achievement Badge. Setiap achievement yang terbuka memberikan bonus XP dan Koin.",
      icon: <Trophy className="text-purple-500" size={24} />,
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      title: "Theme Customization",
      description:
        "Bosan dengan tampilan standar? Nantinya Anda bisa mengganti tema aplikasi (Dark Mode, Light Mode, dan tema spesial lainnya).",
      icon: <Palette className="text-pink-500" size={24} />,
      bg: "bg-pink-50",
      border: "border-pink-200",
    },
  ];

  const updates = [
    {
      version: "1.5.0",
      date: "20 Des 2025",
      title: "Variasi Soal, Admin Tools & Security Upgrade",
      highlight: true,
      changes: [
        {
          type: "new",
          text: "Variasi Soal Lengkap: Kini mendukung tipe soal Isian Singkat, Benar/Salah, dan Multi Select (Jawaban > 1).",
        },
        {
          type: "improvement",
          text: "Admin Question Tools: Fitur filter soal per kuis, upload massal via CSV yang lebih cerdas, dan form input soal dinamis.",
        },
        {
          type: "improvement",
          text: "Keamanan Stream Realtime: Koneksi notifikasi dan lobi game kini menggunakan Cookie (bukan URL token) untuk keamanan maksimal.",
        },
        {
          type: "improvement",
          text: "Update Notifikasi: Penambahan fitur 'Tandai Semua Dibaca' dan perbaikan tampilan responsif di mobile.",
        },
        {
          type: "fix",
          text: "Perbaikan sinkronisasi item Inventory saat equip/unequip agar data lokal selalu akurat.",
        },
        {
          type: "fix",
          text: "Isolasi Skor Challenge: Mengerjakan kuis di mode latihan tidak akan lagi mengganggu progres/skor di Challenge yang sedang aktif.",
        },
      ],
    },
    {
        version: "1.4.0",
        date: "19 Des 2025",
        title: "Daily Reward, Daily Missions, Infinite Scroll & Randomized Quiz",
        highlight: false,
        changes: [
          {
            type: "new",
            text: "Daily Rewards dan Daily Missions: Dapatkan bonus Koin setiap hari dengan login dan menyelesaikan misi harian.",
          },
          {type: "improvement",
            text: "Tampilan Baru navigation bar mobile untuk akses lebih mudah ke fitur utama.",
          },
          {
            type: "improvement",
            text: "Tampilan Baru di Dashboard: Desain card topik yang lebih segar dan informatif.",
          },
          {
            type: "improvement",
            text: "Infinite Scroll pada Duel Arena: Load data lebih ringan dan cepat tanpa perlu klik halaman.",
          },
          {
            type: "improvement",
            text: "Statistik Duel Akurat: Data kemenangan dan total duel kini dihitung langsung dari server.",
          },
          {
            type: "improvement",
            text: "Acak Jawaban Kuis: Posisi opsi jawaban (A, B, C, D) kini diacak otomatis setiap kali bermain.",
          },
          {
            type: "fix",
            text: "Perbaikan bug pada perhitungan win rate di mode 2v2.",
          },
        ],
      },
    {
      version: "1.3.0",
      date: "18 Des 2025",
      title: "Social Search, Streak & 3D Avatar",
      highlight: false,
      changes: [
        {
          type: "new",
          text: "Global Search: Cari teman baru, cek status (Pending/Friend) & Add Friend instan.",
        },
        {
          type: "new",
          text: "Daily Streak: Login harian berturut-turut untuk bonus Koin melimpah.",
        },
        {
          type: "new",
          text: "Sistem Coin & Shop: Beli item frame avatar dan title keren dengan koin hasil bermain.",
        },
        {
          type: "improvement",
          text: "Rombak visual Social Hub agar lebih menarik dan interaktif.",
        },
        {
          type: "improvement",
          text: "Update status pemain secara realtime setelah selesai duel.",
        },
      ],
    },
    {
      version: "1.2.1",
      date: "18 Des 2025",
      title: "Realtime Progress Update",
      highlight: false,
      changes: [
        {
          type: "improvement",
          text: "Tampilkan progress bar lawan secara realtime saat duel berlangsung.",
        },
        { type: "fix", text: "Perbaikan sinkronisasi timer antar pemain." },
      ],
    },
    {
      version: "1.2.0",
      date: "17 Des 2025",
      title: "Realtime Challenge & Mode Duel",
      highlight: false,
      changes: [
        { type: "new", text: "Fitur Challenge: Tantang teman 1v1 atau 2v2." },
        {
          type: "new",
          text: "Mode Realtime: Sinkronisasi waktu mulai & hasil duel menggunakan Server-Sent Events (SSE).",
        },
        {
          type: "improvement",
          text: "Notifikasi Realtime dengan Badge di Navbar.",
        },
      ],
    },
    {
      version: "1.0.0",
      date: "5 Des 2025",
      title: "Grand Launching",
      highlight: false,
      changes: [
        { type: "new", text: "Rilis perdana QuizApp!" },
        { type: "new", text: "Sistem Kuis Dasar, Kategori, dan History." },
      ],
    },
  ];

  // Helper untuk icon & warna tipe perubahan
  const getTypeConfig = (type) => {
    switch (type) {
      case "new":
        return {
          icon: <Star size={14} />,
          color: "text-amber-500 bg-amber-100",
          label: "Baru",
        };
      case "improvement":
        return {
          icon: <Zap size={14} />,
          color: "text-blue-500 bg-blue-100",
          label: "Update",
        };
      case "fix":
        return {
          icon: <Bug size={14} />,
          color: "text-red-500 bg-red-100",
          label: "Fix",
        };
      default:
        return {
          icon: <GitCommit size={14} />,
          color: "text-slate-500 bg-slate-100",
          label: "Misc",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Apa yang Baru?</h1>
            <p className="text-xs text-slate-500">Riwayat pembaruan aplikasi</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Roadmap */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Rocket className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800">Coming Soon</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmap.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border ${item.border} ${item.bg} hover:shadow-md transition-shadow`}
              >
                <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Pembaruan */}
        <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-200 space-y-12">
          {updates.map((update, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Dot Timeline */}
              <div
                className={`absolute -left-[21px] sm:-left-[37px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm 
                ${
                  update.highlight
                    ? "bg-indigo-600 ring-4 ring-indigo-100"
                    : "bg-slate-400"
                }`}
              />

              {/* Header Versi */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800">
                      v{update.version}
                    </h2>
                    {update.highlight && (
                      <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Terbaru
                      </span>
                    )}
                  </div>
                  <h3 className="text-slate-600 font-medium">{update.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm w-fit">
                  <Calendar size={14} />
                  <span>{update.date}</span>
                </div>
              </div>

              {/* List Perubahan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm overflow-hidden">
                {update.changes.map((change, cIdx) => {
                  const config = getTypeConfig(change.type);
                  return (
                    <div
                      key={cIdx}
                      className="flex items-start gap-3 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition"
                    >
                      <div
                        className={`shrink-0 p-1.5 rounded-lg ${config.color} mt-0.5`}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-transparent ${config.color
                              .replace("bg-", "border-")
                              .replace("100", "200")}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {change.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            Punya ide fitur baru?{" "}
            <a
              href="https://github.com/ROFL1ST"
              className="text-indigo-600 font-bold hover:underline"
            >
              Hubungi Kami
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;