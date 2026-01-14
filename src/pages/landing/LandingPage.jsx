// src/pages/landing/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Trophy,
  Target,
  Users,
  ShoppingBag,
  ArrowRight,
  Star,
  CheckCircle2,
  Play,
  BarChart3,
  Crown,
  Sparkles,
  Smartphone,
  X,
  Menu,
  Monitor,
  Infinity,
  Layers,
  Database,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";

// --- KOMPONEN MINI DEMO ---
const MiniQuizDemo = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const questions = [
    {
      text: t("landing.demo.q1"),
      options: [
        t("landing.demo.opt1a"),
        t("landing.demo.opt1b"),
        t("landing.demo.opt1c"),
      ],
      answer: 0,
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (index) => {
    setSelected(index);
    if (index === currentQuestion.answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
    } else {
      setCurrentQuestionIndex(0);
      setSelected(null);
      setIsCorrect(null);
    }
  };

  const resetSelection = () => {
    setSelected(null);
    setIsCorrect(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full mx-auto border border-slate-100 relative overflow-hidden">
      {/* Header Demo */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t("landing.livePreview")}
          </span>
        </div>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
          {t("landing.question")} {currentQuestionIndex + 1}/{questions.length}
        </div>
      </div>

      {/* Transisi Soal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6 leading-snug">
            {currentQuestion.text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              let stateClass =
                "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";

              if (selected === idx) {
                if (isCorrect && idx === currentQuestion.answer) {
                  stateClass =
                    "border-green-500 bg-green-50 text-green-700 font-bold";
                } else if (!isCorrect && idx === selected) {
                  stateClass =
                    "border-red-500 bg-red-50 text-red-700 font-bold";
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !selected && handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${stateClass} ${
                    selected ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span>{opt}</span>
                  {selected === idx && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {isCorrect ? <CheckCircle2 size={20} /> : <X size={20} />}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback & Navigation */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 pt-4 border-t border-slate-100 text-center"
          >
            <p
              className={`font-bold mb-3 ${
                isCorrect ? "text-green-600" : "text-red-500"
              }`}
            >
              {isCorrect ? "Jawaban Benar! 🎉" : "Ups, kurang tepat!"}
            </p>

            {isCorrect ? (
              <button
                onClick={handleNext}
                className="text-sm text-indigo-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Soal Selanjutnya <ArrowRight size={14} />
                  </>
                ) : (
                  "Ulangi Demo"
                )}
              </button>
            ) : (
              <button
                onClick={resetSelection}
                className="text-sm text-slate-400 hover:text-indigo-600 font-medium underline decoration-dashed"
              >
                Coba Lagi
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- LANDING PAGE UTAMA ---
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* === NAVBAR === */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm py-4"
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group z-50 relative">
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/30">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              QuizApp
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-indigo-600 transition"
            >
              Fitur
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="hover:text-indigo-600 transition"
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection("roadmap")}
              className="hover:text-indigo-600 transition"
            >
              Roadmap
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="font-bold text-slate-600 hover:text-indigo-600 transition"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/20"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 p-2 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 w-full bg-white shadow-xl border-b border-slate-100 pt-24 pb-8 px-6 md:hidden flex flex-col gap-6"
            >
              <button
                onClick={() => scrollToSection("features")}
                className="text-lg font-medium text-slate-700 hover:text-indigo-600 text-left border-b border-slate-50 pb-2"
              >
                Fitur
              </button>
              <button
                onClick={() => scrollToSection("demo")}
                className="text-lg font-medium text-slate-700 hover:text-indigo-600 text-left border-b border-slate-50 pb-2"
              >
                Demo
              </button>
              <button
                onClick={() => scrollToSection("roadmap")}
                className="text-lg font-medium text-slate-700 hover:text-indigo-600 text-left border-b border-slate-50 pb-2"
              >
                Roadmap
              </button>
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  to="/login"
                  className="w-full text-center py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition"
                >
                  Daftar Gratis
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* === HERO SECTION === */}
      <header className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-200/40 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-200/40 rounded-full blur-[80px] md:blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 px-4 py-2 rounded-full text-xs md:text-sm font-bold text-indigo-600 mb-6 md:mb-8 shadow-sm hover:shadow-md transition cursor-default">
              <Sparkles
                size={16}
                className="text-yellow-400 fill-yellow-400 animate-pulse"
              />
              <span>Baru: Mode Battle Royale & Smart Remedial</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Ubah Cara Belajarmu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                Jadi Petualangan
              </span>
            </h1>

            <p className="text-base md:text-xl text-slate-500 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Platform kuis interaktif yang menggabungkan analisis AI canggih
              dengan keseruan game kompetitif.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 md:mb-20">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 hover:-translate-y-1"
              >
                Mulai Sekarang <ArrowRight size={20} />
              </Link>
              <button
                onClick={() => scrollToSection("demo")}
                className="flex items-center justify-center gap-2 bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <Play size={20} fill="currentColor" /> Coba Demo
              </button>
            </div>
          </motion.div>

          {/* --- STATS BAR YANG BARU DAN MENARIK --- */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-2">
            <StatItem 
              icon={<Database size={24} />} 
              number="500+" 
              label="Bank Soal" 
              desc="Terus Bertambah"
              color="bg-indigo-50 text-indigo-600"
              delay={0.1}
            />
            <StatItem 
              icon={<Gamepad2 size={24} />} 
              number="3+" 
              label="Mode Game" 
              desc="Solo, Duel, BR"
              color="bg-purple-50 text-purple-600"
              delay={0.2}
            />
            <StatItem 
              icon={<Monitor size={24} />} 
              number="Multi" 
              label="Platform" 
              desc="Web & Mobile"
              color="bg-blue-50 text-blue-600"
              delay={0.3}
            />
            <StatItem 
              icon={<Infinity size={24} />} 
              number="100%" 
              label="Akses Gratis" 
              desc="Tanpa Biaya"
              color="bg-green-50 text-green-600"
              delay={0.4}
            />
          </div> */}
        </div>
      </header>

      {/* === DEMO SECTION (INTERACTIVE) === */}
      <section
        id="demo"
        className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 relative"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="md:w-1/2">
              <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm mb-2 block">
                Coba Langsung
              </span>
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Rasakan Pengalaman Kuis Interaktif
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Tidak perlu mendaftar untuk melihat betapa mudahnya mengerjakan
                kuis. Coba jawab soal di samping ini! Sistem kami akan langsung
                memberikan umpan balik instan.
              </p>

              <ul className="space-y-4 mb-8">
                <ListItem text="Antarmuka bersih dan responsif" />
                <ListItem text="Feedback instan setelah menjawab" />
                <ListItem text="Animasi halus yang memanjakan mata" />
              </ul>

              <Link
                to="/register"
                className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all group"
              >
                Buat Akun Full Akses <ArrowRight size={18} />
              </Link>
            </div>

            {/* Komponen Mini Demo */}
            <div className="md:w-1/2 w-full">
              <div className="relative">
                {/* Decorative Elements around demo */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>

                <MiniQuizDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES GRID === */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900">
              Fitur Power-Up Belajarmu
            </h2>
            <p className="text-slate-500 text-lg">
              Kami tidak hanya memberikan soal, tapi juga ekosistem lengkap
              untuk pertumbuhan akademismu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<Target className="text-red-500" />}
              title="Smart Remedial"
              desc="AI mendeteksi kelemahanmu dan menyusun soal perbaikan khusus secara otomatis."
            />
            <FeatureCard
              icon={<Crown className="text-orange-500" />}
              title="Battle Royale"
              desc="Mode bertahan hidup melawan 50 pemain lain. Siapa yang terakhir bertahan?"
            />
            <FeatureCard
              icon={<BarChart3 className="text-indigo-500" />}
              title="Analisis Mendalam"
              desc="Grafik perkembangan belajar, analisis topik, dan prediksi performa ujian."
            />
            <FeatureCard
              icon={<Users className="text-blue-500" />}
              title="Duel Realtime"
              desc="Tantang teman 1v1 atau 2v2 dengan sinkronisasi skor tanpa delay."
            />
            <FeatureCard
              icon={<ShoppingBag className="text-purple-500" />}
              title="Gamifikasi Shop"
              desc="Tukar koin hasil belajar dengan avatar frame eksklusif dan title keren."
            />
            <FeatureCard
              icon={<Smartphone className="text-green-500" />}
              title="Multi Platform"
              desc="Akses dari Laptop, Tablet, atau HP dengan tampilan yang tetap optimal."
            />
          </div>
        </div>
      </section>

      {/* === ROADMAP / GAMIFICATION === */}
      <section
        id="roadmap"
        className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="md:w-1/2">
              <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold mb-4 border border-indigo-500/30">
                FUTURE UPDATES
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Roadmap Masa Depan
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Kami terus berinovasi. Berikut adalah fitur-fitur besar yang
                sedang kami kembangkan untuk membuat pengalaman belajarmu makin
                epik.
              </p>

              <div className="space-y-6">
                <RoadmapItem
                  title="Challenge Rewards (Q1 2026)"
                  desc="Dapatkan Koin & XP besar setiap memenangkan duel PvP."
                  status="Coming Soon"
                  color="text-yellow-400"
                />
                <RoadmapItem
                  title="Achievement System (Q2 2026)"
                  desc="Ratusan lencana unik untuk dipamerkan di profilmu."
                  status="In Progress"
                  color="text-purple-400"
                />
                <RoadmapItem
                  title="AI Quiz Generator (Future)"
                  desc="Generate soal otomatis dari materi PDF/Teks apapun."
                  status="Concept"
                  color="text-cyan-400"
                />
              </div>
            </div>

            <div className="md:w-1/2 bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700 backdrop-blur-sm relative w-full">
              {/* Visualisasi Kartu Gamifikasi */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/40">
                  🚀
                </div>
                <div>
                  <div className="text-xl font-bold">Level 24</div>
                  <div className="text-slate-400 text-sm">Master Quizzer</div>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-xs font-bold uppercase text-slate-400">
                <span>XP Progress</span>
                <span>2,450 / 3,000</span>
              </div>
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-8">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "80%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                  <Trophy className="mx-auto text-yellow-400 mb-2" size={20} />
                  <div className="font-bold text-lg">15</div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    Wins
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                  <Target className="mx-auto text-red-400 mb-2" size={20} />
                  <div className="font-bold text-lg">92%</div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    Akurasi
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                  <Star className="mx-auto text-purple-400 mb-2" size={20} />
                  <div className="font-bold text-lg">Top 3</div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    Rank
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === CTA FOOTER === */}
      <section className="py-16 md:py-24 text-center container mx-auto px-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Siap Menjadi Juara?
            </h2>
            <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
              Bergabunglah sekarang dan buktikan kemampuanmu di hadapan ribuan
              pengguna lainnya. Gratis selamanya.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:-translate-y-1"
              >
                Buat Akun Sekarang
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 rounded-xl font-bold text-lg border border-indigo-400 hover:bg-indigo-700/50 transition-all"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER SIMPLE === */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-slate-500">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4 text-slate-900 font-bold text-xl">
            <Zap size={20} className="text-indigo-600" fill="currentColor" />{" "}
            QuizApp
          </div>
          <p className="mb-6 text-sm">
            © {new Date().getFullYear()} QuizApp. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-sm font-medium">
            <Link to="/about" className="hover:text-indigo-600 transition">
              Tentang
            </Link>
            <Link to="/whats-new" className="hover:text-indigo-600 transition">
              Changelog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---

// Kartu Statistik Baru (Card Style)
const StatItem = ({ icon, number, label, desc, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:border-indigo-100 transition-all"
  >
    <div
      className={`w-12 h-12 mb-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
    >
      {icon}
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1">{number}</div>
    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
      {label}
    </div>
    <p className="text-xs text-slate-400 font-medium">{desc}</p>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
  >
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

const RoadmapItem = ({ title, desc, status, color }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div
        className={`w-4 h-4 rounded-full border-2 border-slate-700 bg-slate-900 ${
          color === "text-yellow-400" ? "bg-yellow-400 border-yellow-400" : ""
        }`}
      />
      <div className="w-0.5 h-full bg-slate-800 my-2" />
    </div>
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-1">
        <h4 className={`font-bold text-lg ${color}`}>{title}</h4>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded text-slate-400 uppercase border border-slate-700">
          {status}
        </span>
      </div>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  </div>
);

const ListItem = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-700 font-medium">
    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
      <CheckCircle2 size={14} />
    </div>
    {text}
  </div>
);

export default LandingPage;
