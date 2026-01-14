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
  BarChart2,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

import { changelogData } from "../../data/changelog";

const WhatsNew = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Apa yang Baru? | QuizApp";
  }, []);

  const { t, language } = useLanguage();

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

  // Helper untuk mendapatkan teks berdasarkan bahasa (fallback ke 'en' atau 'id')
  const getLocalizedText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj; // Legacy support
    return textObj[language] || textObj["en"] || textObj["id"] || "";
  };

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
            <h1 className="text-lg font-bold text-slate-800">
              {t("whatsNew.title")}
            </h1>
            <p className="text-xs text-slate-500">{t("whatsNew.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Roadmap */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Rocket className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800">
              {t("whatsNew.comingSoon")}
            </h2>
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
            {t("whatsNew.idea")}{" "}
            <a
              href="https://github.com/ROFL1ST"
              className="text-indigo-600 font-bold hover:underline"
            >
              {t("whatsNew.contactUs")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
