import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Layout,
  Globe,
  Bug,
  Calendar,
  Construction,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { changelogData, APP_VERSION } from "../../data/changelog";

const WhatsNew = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `${t("whatsNew.title")} | QuizApp`;
  }, [t]);

  // Helper to get text based on language
  const getText = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item[language] || item.id || item.en || "";
  };

  const features = [
    {
      icon: <Globe className="text-blue-500" size={24} />,
      title: t("whatsNew.feature1Title") || "Multi-Language",
      description:
        t("whatsNew.feature1Desc") || "Support English, Indonesia, Japan",
    },
    {
      icon: <Sparkles className="text-amber-500" size={24} />,
      title: t("whatsNew.feature2Title") || "AI Genius Mode",
      description: t("whatsNew.feature2Desc") || "Generate quizzes with AI",
    },
    {
      icon: <Layout className="text-purple-500" size={24} />,
      title: t("whatsNew.feature3Title") || "New UI Design",
      description: t("whatsNew.feature3Desc") || "Fresh look and feel",
    },
  ];

  // Helper untuk icon & warna tipe perubahan
  const getTypeConfig = (type) => {
    switch (type) {
      case "new":
        return {
          icon: <Sparkles size={14} />,
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
          icon: <Construction size={14} />,
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Featured Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition"
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

        {/* Timeline Pembaruan */}
        <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-200 space-y-12">
          {changelogData.map((update, idx) => (
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
              ></div>

              {/* Content Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          update.highlight
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        v{update.version}
                      </span>
                      <span className="text-sm text-slate-400">
                        {getText(update.date)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {getText(update.title)}
                    </h2>
                  </div>
                </div>

                {getText(update.description) && (
                  <p className="text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                    {getText(update.description)}
                  </p>
                )}

                <div className="space-y-4">
                  {update.changes.map((change, cIdx) => {
                    const config = getTypeConfig(change.type);
                    return (
                      <div key={cIdx} className="flex gap-4">
                        <div className="mt-1 flex-shrink-0">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              config.color
                                .replace("text-", "bg-")
                                .replace("100", "100")
                                .split(" ")[1]
                            } ${config.color.split(" ")[0]}`}
                          >
                            {config.icon}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wider">
                            {config.label}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {getText(change.text)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {t("whatsNew.idea")}
            </h2>
            <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg">
              {t("whatsNew.contactUs")}
            </button>
          </div>
          <Sparkles className="absolute -top-10 -right-10 text-white/10 w-64 h-64 rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
