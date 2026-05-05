// src/pages/about/WhatsNew.jsx
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Layout, Globe, Bug, Calendar, Construction } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { changelogData, APP_VERSION } from "../../data/changelog";

/* ── CSS var shortcuts ── */
const BRAND = "var(--color-brand-400)";
const S100  = "var(--color-surface-100)";
const S200  = "var(--color-surface-200)";
const S300  = "var(--color-surface-300)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S900  = "var(--color-surface-900)";

/* change type → dark tinted config */
const TYPE_CFG = {
  new:         { icon: <Sparkles size={13} />,     bg: "rgb(234 179 8 / 0.12)",  color: "#fbbf24", border: "rgb(234 179 8 / 0.25)",  label: "Baru"   },
  improvement: { icon: <Zap      size={13} />,     bg: "rgb(99 102 241 / 0.10)", color: BRAND,    border: "rgb(99 102 241 / 0.20)", label: "Update" },
  fix:         { icon: <Bug      size={13} />,     bg: "rgb(239 68 68 / 0.10)",  color: "#f87171", border: "rgb(239 68 68 / 0.20)",  label: "Fix"    },
  default:     { icon: <Construction size={13} />, bg: "rgb(100 116 139 / 0.10)",color: S500,     border: "rgb(100 116 139 / 0.20)",label: "Misc"   },
};

const WhatsNew = () => {
  const navigate       = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => { document.title = `${t("whatsNew.title")} | QuizApp`; }, [t]);

  const getText = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item[language] || item.id || item.en || "";
  };

  const getCfg  = (type) => TYPE_CFG[type] || TYPE_CFG.default;

  const highlights = [
    { icon: <Globe    size={22} style={{ color: "#60a5fa" }} />, title: t("whatsNew.feature1Title") || "Multi-Language",  desc: t("whatsNew.feature1Desc") || "Support EN, ID, JP",      accent: "rgb(96 165 250 / 0.10)", border: "rgb(96 165 250 / 0.20)" },
    { icon: <Sparkles size={22} style={{ color: "#fbbf24" }} />, title: t("whatsNew.feature2Title") || "AI Genius Mode",   desc: t("whatsNew.feature2Desc") || "Generate quizzes with AI", accent: "rgb(234 179 8 / 0.10)",  border: "rgb(234 179 8 / 0.22)"  },
    { icon: <Layout   size={22} style={{ color: "#a78bfa" }} />, title: t("whatsNew.feature3Title") || "New UI Design",    desc: t("whatsNew.feature3Desc") || "Fresh dark look",          accent: "rgb(167 139 250 / 0.10)",border: "rgb(167 139 250 / 0.20)" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">

      {/* ═══ STICKY HEADER ═══ */}
      <div
        className="sticky top-0 z-10"
        style={{ background: "rgb(10 10 20 / 0.90)", backdropFilter:"blur(16px)", borderBottom: `1px solid ${S800}` }}
      >
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full transition"
            style={{ color: S400 }}
            onMouseEnter={e => e.currentTarget.style.background = S800}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black" style={{ color: S100 }}>{t("whatsNew.title")}</h1>
            <p className="text-xs" style={{ color: S600 }}>{t("whatsNew.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ═══ HIGHLIGHT CARDS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {highlights.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.08 }}
              className="p-6 rounded-2xl"
              style={{ background: item.accent, border: `1px solid ${item.border}` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: S800 }}
              >
                {item.icon}
              </div>
              <h3 className="text-base font-black mb-1" style={{ color: S100 }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: S500 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ═══ CHANGELOG TIMELINE ═══ */}
        <div
          className="relative pl-4 sm:pl-8 space-y-10"
          style={{ borderLeft: `2px solid ${S800}` }}
        >
          {changelogData.map((update, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-[21px] sm:-left-[37px] top-1 w-4 h-4 rounded-full"
                style={{
                  background: update.highlight ? BRAND : S700,
                  border: `2px solid ${update.highlight ? "rgb(99 102 241 / 0.40)" : S800}`,
                  boxShadow: update.highlight ? "0 0 0 4px rgb(99 102 241 / 0.12)" : "none",
                }}
              />

              {/* Content card */}
              <div
                className="rounded-3xl p-6 sm:p-8"
                style={{
                  background: S900,
                  border: `1px solid ${update.highlight ? "rgb(99 102 241 / 0.25)" : S800}`,
                }}
              >
                {/* Version row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-black"
                        style={{
                          background: update.highlight ? "rgb(99 102 241 / 0.12)" : S800,
                          color:      update.highlight ? BRAND                    : S400,
                          border:     `1px solid ${update.highlight ? "rgb(99 102 241 / 0.22)" : S700}`,
                        }}
                      >
                        v{update.version}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: S600 }}>
                        <Calendar size={11} /> {getText(update.date)}
                      </span>
                    </div>
                    <h2 className="text-xl font-black" style={{ color: S100 }}>{getText(update.title)}</h2>
                  </div>
                </div>

                {/* Description */}
                {getText(update.description) && (
                  <p
                    className="text-sm mb-6 leading-relaxed p-4 rounded-xl"
                    style={{ background: S800, color: S400, border: `1px dashed ${S700}` }}
                  >
                    {getText(update.description)}
                  </p>
                )}

                {/* Change list */}
                <div className="space-y-4">
                  {update.changes.map((change, cIdx) => {
                    const cfg = getCfg(change.type);
                    return (
                      <div key={cIdx} className="flex gap-4">
                        <div
                          className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.icon}
                        </div>
                        <div>
                          <span
                            className="text-[10px] font-black uppercase tracking-wider"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <p className="text-sm leading-relaxed mt-0.5" style={{ color: S400 }}>
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

        {/* ═══ FOOTER CTA ═══ */}
        <div
          className="mt-20 text-center rounded-3xl p-8 sm:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)", border: "1px solid rgb(99 102 241 / 0.25)" }}
        >
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgb(255 255 255 / 0.04) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />
          <Sparkles className="absolute -top-10 -right-10 pointer-events-none" size={220} style={{ color: "rgb(255 255 255 / 0.05)", transform:"rotate(12deg)" }} />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: "#fff" }}>
              {t("whatsNew.idea")}
            </h2>
            <button
              className="px-8 py-3 rounded-xl font-black text-sm transition hover:scale-105"
              style={{ background: "rgb(255 255 255 / 0.12)", color: "#e0e7ff", border: "1px solid rgb(255 255 255 / 0.20)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgb(255 255 255 / 0.20)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgb(255 255 255 / 0.12)"}
            >
              {t("whatsNew.contactUs")}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsNew;
