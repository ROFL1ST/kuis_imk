import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Rocket,
  Zap,
  Users,
  Trophy,
  Code,
  Heart,
  Github,
  Globe,
  CheckCircle,
  Swords,
  BrainCircuit,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Code2,
  Smartphone,
} from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("about.title") + " | QuizApp";
  }, [t]);

  const features = [
    {
      icon: <BrainCircuit className="text-indigo-600" size={32} />,
      title: t("about.feature1"),
      description: t("about.feature1Desc"),
      color: "bg-indigo-50",
    },
    {
      icon: <Swords className="text-orange-500" size={32} />,
      title: t("about.feature2"),
      description: t("about.feature2Desc"),
      color: "bg-orange-50",
    },
    {
      icon: <Trophy className="text-yellow-500" size={32} />,
      title: t("about.feature3"),
      description: t("about.feature3Desc"),
      color: "bg-yellow-50",
    },
  ];

  const TechBadge = ({ label, color, bg }) => (
    <div
      className={`flex items-center justify-center gap-2 p-4 rounded-xl ${bg} border border-slate-100 font-bold ${color}`}
    >
      <Code size={18} /> {label}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto pb-12 px-4"
    >
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 mb-8 rounded-b-2xl">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-800">
              {t("about.title")}
            </h1>
          </div>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">
            {t("about.version")}
          </span>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <div className="text-center py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6 rotate-3 hover:rotate-6 transition-transform duration-500">
            <Zap size={48} className="text-white fill-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 leading-tight">
            {t("about.heroTitle1")} <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t("about.heroTitle2")}
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t("about.heroDesc")}
          </p>
        </motion.div>
      </div>

      {/* 2. FITUR UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100"
          >
            <div
              className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md rotate-3`}
            >
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 3. STORY / MISSION */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 mb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-10"></div>

        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Code2 className="text-indigo-600" /> {t("about.missionTitle")}
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>{t("about.missionP1")}</p>
              <p>{t("about.missionP2")}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <CheckCircle size={16} className="text-green-500" />{" "}
                {t("about.freeToPlay")}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <CheckCircle size={16} className="text-green-500" />{" "}
                {t("about.realtime")}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <CheckCircle size={16} className="text-green-500" />{" "}
                {t("about.mobileFriendly")}
              </div>
            </div>
          </div>

          {/* Tech Stack Badge Visualization */}
          <div className="flex-1 w-full flex justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <TechBadge label="React" color="text-blue-400" bg="bg-blue-50" />
              <TechBadge label="Golang" color="text-cyan-600" bg="bg-cyan-50" />
              <TechBadge
                label="Tailwind"
                color="text-teal-500"
                bg="bg-teal-50"
              />
              <TechBadge
                label="PostgreSQL"
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. FOOTER / CREDITS */}
      <div className="text-center border-t border-slate-200 pt-12">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Ingin berkontribusi?
        </h3>
        <p className="text-slate-500 mb-6">
          Proyek ini bersifat Open Source. Bergabunglah dengan kami!
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <a
            href="https://github.com/ROFL1ST/kuis_imk"
            className="p-3 bg-slate-800 text-white rounded-full hover:bg-slate-900 transition hover:scale-110"
          >
            <Github size={20} />
          </a>
          <a
            href="#"
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition hover:scale-110"
          >
            <Globe size={20} />
          </a>
        </div>

        <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
          {t("about.madeWith")}{" "}
          <Heart
            size={14}
            className="text-red-500 fill-red-500 animate-pulse"
          />{" "}
          {t("about.byTeam")}
        </p>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Informasi Lainnya</h3>
        <Link
          to="/whats-new"
          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800">{t("about.whatsNew")}</p>
              <p className="text-xs text-slate-500">
                {t("about.checkFeatures")}
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-slate-400 group-hover:text-indigo-600"
          />
        </Link>
      </div>
    </motion.div>
  );
};

export default About;
