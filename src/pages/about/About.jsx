import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    document.title = "Tentang Kami | QuizApp";
  }, []);
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

      {/* 1. HERO SECTION */}
      <div className="text-center py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
            Versi 1.2.0 (Beta)
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 leading-tight">
            Belajar Jadi Lebih <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Seru & Menantang
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            QuizApp adalah platform gamifikasi edukasi yang dirancang untuk
            menguji pengetahuanmu, menantang teman, dan melacak perkembangan
            belajarmu dengan cara yang menyenangkan.
          </p>
        </motion.div>
      </div>

      {/* 2. FITUR UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={<BrainCircuit className="text-white" size={24} />}
          title="Kuis Interaktif"
          desc="Ribuan soal dari berbagai topik menarik untuk mengasah otakmu setiap hari."
          color="bg-blue-500"
          delay={0.3}
        />
        <FeatureCard
          icon={<Swords className="text-white" size={24} />}
          title="Mode Duel"
          desc="Tantang temanmu dalam pertarungan pengetahuan real-time 1vs1."
          color="bg-purple-500"
          delay={0.4}
        />
        <FeatureCard
          icon={<Trophy className="text-white" size={24} />}
          title="Sistem Rank"
          desc="Naikkan level, raih achievement, dan jadilah yang teratas di Global Leaderboard."
          color="bg-yellow-500"
          delay={0.5}
        />
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
              <Rocket className="text-indigo-600" /> Misi Kami
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Kami percaya bahwa belajar tidak harus membosankan. Dengan
                menggabungkan elemen permainan (gamifikasi) ke dalam proses
                pembelajaran, kami ingin menciptakan ekosistem di mana pengguna
                termotivasi untuk terus mencari ilmu.
              </p>
              <p>
                Aplikasi ini dibangun sebagai proyek untuk mendemonstrasikan
                integrasi teknologi web modern, performa tinggi, dan pengalaman
                pengguna (UX) yang intuitif.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <CheckCircle size={16} className="text-green-500" /> Free to
                Play
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <CheckCircle size={16} className="text-green-500" /> Real-time
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <CheckCircle size={16} className="text-green-500" /> Mobile
                Friendly
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
            href=""
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition hover:scale-110"
          >
            <Globe size={20} />
          </a>
        </div>

        <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
          Dibuat dengan{" "}
          <Heart
            size={14}
            className="text-red-500 fill-red-500 animate-pulse"
          />{" "}
          oleh Tim QuizApp
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
              <p className="font-bold text-slate-800">What's New</p>
              <p className="text-xs text-slate-500">
                Cek fitur terbaru di versi 1.2.0
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

const FeatureCard = ({ icon, title, desc, color, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100"
  >
    <div
      className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 shadow-md rotate-3`}
    >
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const TechBadge = ({ label, color, bg }) => (
  <div
    className={`flex items-center justify-center gap-2 p-4 rounded-xl ${bg} border border-slate-100 font-bold ${color}`}
  >
    <Code size={18} /> {label}
  </div>
);

export default About;
