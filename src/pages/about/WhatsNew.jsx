import { motion } from "framer-motion";
import { ArrowLeft, Star, Zap, Bug, Calendar, GitCommit } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const WhatsNew = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Apa yang Baru? | QuizApp";
  }, []);

  // Data pembaruan aplikasi
  const updates = [
    {
      version: "1.2.0",
      date: "17 Des 2025",
      title: "Realtime Challenge & Mode Duel",
      highlight: true, // Versi besar
      changes: [
        { type: "new", text: "Fitur Challenge: Tantang teman 1v1 atau 2v2." },
        {
          type: "new",
          text: "Mode Realtime: Sinkronisasi waktu mulai & hasil duel.",
        },
        {
          type: "improvement",
          text: "Notifikasi Realtime dengan Badge di Navbar.",
        },
         {
          type: "improvement",
          text: "Scroll to top otomatis saat navigasi.",
        },
        { type: "fix", text: "Perbaikan timer pada halaman Quiz Play." },
        { type: "fix", text: "Perbaikan bug minor lainnya." },
      ],
    },
    {
      version: "1.1.0",
      date: "10 Des 2025",
      title: "Social Update",
      highlight: false,
      changes: [
        { type: "new", text: "Sistem Teman: Tambah, Terima, dan Hapus teman." },
        {
          type: "new",
          text: "Leaderboard Global: Lihat peringkat pemain terbaik.",
        },
        {
          type: "improvement",
          text: "Tampilan profil pengguna yang lebih interaktif.",
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
        { type: "new", text: "Dasar sistem Kuis, Kategori, dan History." },
        { type: "new", text: "Sistem Level & XP dasar." },
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
