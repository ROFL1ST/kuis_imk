// src/pages/about/About.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Rocket, Zap, Users, Trophy, Code, Heart, Github, Globe,
  CheckCircle, Swords, BrainCircuit, Sparkles, ChevronRight,
  ArrowLeft, Code2, Smartphone,
} from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

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

const About = () => {
  const { t }      = useLanguage();
  const navigate   = useNavigate();

  useEffect(() => { document.title = t("about.title") + " | QuizApp"; }, [t]);

  const features = [
    { icon: <BrainCircuit size={28} style={{ color: BRAND }} />,       title: t("about.feature1"), desc: t("about.feature1Desc"), accent: "rgb(99 102 241 / 0.10)",  border: "rgb(99 102 241 / 0.22)" },
    { icon: <Swords       size={28} style={{ color: "#fb923c" }} />,   title: t("about.feature2"), desc: t("about.feature2Desc"), accent: "rgb(249 115 22 / 0.10)", border: "rgb(249 115 22 / 0.22)" },
    { icon: <Trophy       size={28} style={{ color: "#fbbf24" }} />,   title: t("about.feature3"), desc: t("about.feature3Desc"), accent: "rgb(234 179 8 / 0.10)",  border: "rgb(234 179 8 / 0.22)"  },
  ];

  const TechBadge = ({ label, color }) => (
    <div
      className="flex items-center justify-center gap-2 p-4 rounded-xl font-black text-sm"
      style={{ background: S800, color, border: `1px solid ${S700}` }}
    >
      <Code size={16} /> {label}
    </div>
  );

  const CheckChip = ({ label }) => (
    <div
      className="flex items-center gap-2 text-xs font-black px-4 py-2 rounded-lg"
      style={{ background: S800, color: S300, border: `1px solid ${S700}` }}
    >
      <CheckCircle size={14} style={{ color: "#4ade80" }} /> {label}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto pb-16 px-4"
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div style={{ position:"absolute", top:0, left:"25%", width:"24rem", height:"24rem", borderRadius:"50%", background:"rgb(99 102 241 / 0.06)", filter:"blur(80px)" }} />
        <div style={{ position:"absolute", bottom:0, right:"25%", width:"24rem", height:"24rem", borderRadius:"50%", background:"rgb(168 85 247 / 0.06)", filter:"blur(80px)" }} />
      </div>

      {/* ═══ STICKY HEADER ═══ */}
      <div
        className="sticky top-0 z-10 mb-8 rounded-b-2xl"
        style={{ background: "rgb(10 10 20 / 0.85)", backdropFilter:"blur(16px)", borderBottom: `1px solid ${S800}` }}
      >
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full transition"
              style={{ color: S400 }}
              onMouseEnter={e => e.currentTarget.style.background = S800}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-black" style={{ color: S100 }}>{t("about.title")}</h1>
          </div>
          <span
            className="text-[11px] font-black px-3 py-1.5 rounded-full"
            style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.22)" }}
          >
            {t("about.version")}
          </span>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <div className="text-center py-16">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div
            className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-3 hover:rotate-6 transition-transform duration-500"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 20px 60px rgb(99 102 241 / 0.35)" }}
          >
            <Zap size={44} className="fill-white" style={{ color: "#fff" }} />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ color: S100 }}>
            {t("about.heroTitle1")} <br />
            <span style={{ background: "linear-gradient(90deg, #818cf8, #a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {t("about.heroTitle2")}
            </span>
          </h2>
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: S400 }}>
            {t("about.heroDesc")}
          </p>
        </motion.div>
      </div>

      {/* ═══ FITUR UTAMA ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {features.map((f, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl flex flex-col"
            style={{ background: S900, border: `1px solid ${f.border}` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 rotate-3"
              style={{ background: f.accent }}
            >
              {f.icon}
            </div>
            <h3 className="text-lg font-black mb-2" style={{ color: S100 }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: S500 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* ═══ MISSION ═══ */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
        className="rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden"
        style={{ background: S900, border: `1px solid ${S800}` }}
      >
        {/* Corner accent */}
        <div style={{ position:"absolute", top:0, right:0, width:"12rem", height:"12rem", background:"linear-gradient(135deg, rgb(99 102 241 / 0.07), rgb(168 85 247 / 0.07))", borderBottomLeftRadius:"100%", pointerEvents:"none" }} />

        <div className="flex flex-col md:flex-row items-start gap-10">
          <div className="flex-1">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: S100 }}>
              <Code2 size={22} style={{ color: BRAND }} /> {t("about.missionTitle")}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: S400 }}>
              <p>{t("about.missionP1")}</p>
              <p>{t("about.missionP2")}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CheckChip label={t("about.freeToPlay")} />
              <CheckChip label={t("about.realtime")} />
              <CheckChip label={t("about.mobileFriendly")} />
            </div>
          </div>

          {/* Tech badges */}
          <div className="flex-1 w-full flex justify-center">
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <TechBadge label="React"      color="#60a5fa" />
              <TechBadge label="Golang"     color="#22d3ee" />
              <TechBadge label="Tailwind"   color="#2dd4bf" />
              <TechBadge label="PostgreSQL" color={BRAND}  />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ FOOTER / CREDITS ═══ */}
      <div className="text-center pt-12" style={{ borderTop: `1px solid ${S800}` }}>
        <h3 className="text-xl font-black mb-2" style={{ color: S200 }}>Ingin berkontribusi?</h3>
        <p className="text-sm mb-8" style={{ color: S500 }}>Proyek ini bersifat Open Source. Bergabunglah dengan kami!</p>

        <div className="flex justify-center gap-4 mb-12">
          <a
            href="https://github.com/ROFL1ST/kuis_imk"
            className="p-3 rounded-full transition hover:scale-110"
            style={{ background: S800, color: S200, border: `1px solid ${S700}` }}
            onMouseEnter={e => e.currentTarget.style.background = S700}
            onMouseLeave={e => e.currentTarget.style.background = S800}
          >
            <Github size={20} />
          </a>
          <a
            href="#"
            className="p-3 rounded-full transition hover:scale-110"
            style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.25)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgb(99 102 241 / 0.12)"}
          >
            <Globe size={20} />
          </a>
        </div>

        <p className="text-sm flex items-center justify-center gap-1" style={{ color: S600 }}>
          {t("about.madeWith")} <Heart size={13} className="fill-red-500 animate-pulse" style={{ color: "#f87171" }} /> {t("about.byTeam")}
        </p>
      </div>

      {/* ═══ WHATS NEW LINK ═══ */}
      <div className="mt-10 pt-8" style={{ borderTop: `1px solid ${S800}` }}>
        <h3 className="font-black mb-4 text-sm" style={{ color: S400 }}>Informasi Lainnya</h3>
        <Link
          to="/whats-new"
          className="group flex items-center justify-between p-4 rounded-xl transition-all"
          style={{ background: S900, border: `1px solid ${S800}` }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = S700; e.currentTarget.style.background = S800; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = S800; e.currentTarget.style.background = S900; }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg transition-transform group-hover:scale-110"
              style={{ background: "rgb(234 179 8 / 0.12)", color: "#fbbf24" }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: S200 }}>{t("about.whatsNew")}</p>
              <p className="text-xs" style={{ color: S600 }}>{t("about.checkFeatures")}</p>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: S600 }} />
        </Link>
      </div>
    </motion.div>
  );
};

export default About;
