// src/pages/landing/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Trophy, Target, Users, ShoppingBag, ArrowRight, Star,
  CheckCircle2, Play, BarChart3, Crown, Sparkles, Smartphone,
  X, Menu, Monitor, Infinity, Layers, Database, Gamepad2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";

/* ── CSS var shortcuts ── */
const BRAND  = "var(--color-brand-400)";
const S100   = "var(--color-surface-100)";
const S200   = "var(--color-surface-200)";
const S300   = "var(--color-surface-300)";
const S400   = "var(--color-surface-400)";
const S500   = "var(--color-surface-500)";
const S600   = "var(--color-surface-600)";
const S700   = "var(--color-surface-700)";
const S800   = "var(--color-surface-800)";
const S900   = "var(--color-surface-900)";
const S950   = "var(--color-surface-950, #05050f)";

// =========================================================
// MINI QUIZ DEMO
// =========================================================
const MiniQuizDemo = () => {
  const { user } = useAuth();
  const { t }    = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected]   = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  if (user) return <Navigate to="/dashboard" replace />;

  const questions = [{
    text:    t("landing.demo.q1"),
    options: [t("landing.demo.opt1a"), t("landing.demo.opt1b"), t("landing.demo.opt1c")],
    answer:  0,
  }];

  const current = questions[currentQuestionIndex];

  const handleAnswer = (idx) => {
    setSelected(idx);
    setIsCorrect(idx === current.answer);
  };

  const handleNext = () => {
    setCurrentQuestionIndex(prev =>
      prev < questions.length - 1 ? prev + 1 : 0
    );
    setSelected(null);
    setIsCorrect(null);
  };

  return (
    <div
      className="rounded-3xl p-6 md:p-8 max-w-lg w-full mx-auto relative overflow-hidden"
      style={{ background: S900, border: `1px solid ${S800}`, boxShadow: "0 24px 60px rgb(0 0 0 / 0.45)" }}
    >
      {/* Subtle glow blob inside card */}
      <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"140px", height:"140px", borderRadius:"50%", background:"rgb(99 102 241 / 0.08)", filter:"blur(40px)", pointerEvents:"none" }} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: S600 }}>
            {t("landing.livePreview")}
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-black"
          style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.20)" }}
        >
          {t("landing.question")} {currentQuestionIndex + 1}/{questions.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-black mb-6 leading-snug" style={{ color: S100 }}>
            {current.text}
          </h3>

          <div className="space-y-3">
            {current.options.map((opt, idx) => {
              let bg     = S800;
              let border = S700;
              let color  = S300;

              if (selected !== null) {
                if (idx === current.answer) {
                  bg = "rgb(34 197 94 / 0.10)"; border = "rgb(34 197 94 / 0.40)"; color = "#4ade80";
                } else if (idx === selected && !isCorrect) {
                  bg = "rgb(239 68 68 / 0.10)"; border = "rgb(239 68 68 / 0.40)"; color = "#f87171";
                } else {
                  bg = S900; border = S800; color = S600;
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selected === null && handleAnswer(idx)}
                  className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all"
                  style={{ background: bg, border: `2px solid ${border}`, color, cursor: selected ? "default" : "pointer" }}
                >
                  <span className="text-sm font-bold">{opt}</span>
                  {selected === idx && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {isCorrect ? <CheckCircle2 size={18} /> : <X size={18} />}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mt-6 pt-4 text-center"
            style={{ borderTop: `1px solid ${S800}` }}
          >
            <p className="font-black mb-3 text-sm" style={{ color: isCorrect ? "#4ade80" : "#f87171" }}>
              {isCorrect ? "Jawaban Benar! 🎉" : "Ups, kurang tepat!"}
            </p>
            {isCorrect ? (
              <button
                onClick={handleNext}
                className="text-sm font-black flex items-center justify-center gap-1 mx-auto"
                style={{ color: BRAND }}
              >
                {currentQuestionIndex < questions.length - 1 ? <> Soal Selanjutnya <ArrowRight size={14} /></> : "Ulangi Demo"}
              </button>
            ) : (
              <button
                onClick={() => { setSelected(null); setIsCorrect(null); }}
                className="text-sm font-bold underline decoration-dashed"
                style={{ color: S500 }}
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

// =========================================================
// LANDING PAGE UTAMA
// =========================================================
const LandingPage = () => {
  const [scrolled, setScrolled]             = useState(false);
  const [isMobileMenuOpen, setMobileMenu]   = useState(false);
  const navigate                             = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: S950, color: S200 }}
    >

      {/* =============== NAVBAR =============== */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          padding: "1rem 0",
          background: scrolled ? "rgb(8 8 18 / 0.90)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${S800}` : "none",
          boxShadow: scrolled ? "0 4px 30px rgb(0 0 0 / 0.30)" : "none",
        }}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group z-50 relative">
            <div
              className="p-2 rounded-xl group-hover:rotate-12 transition-transform"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 16px rgb(99 102 241 / 0.35)" }}
            >
              <Zap size={22} fill="white" style={{ color: "white" }} />
            </div>
            <span
              className="text-2xl font-black"
              style={{ background: "linear-gradient(90deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              QuizApp
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-black" style={{ color: S500 }}>
            {["features", "demo", "roadmap"].map(id => (
              <button key={id} onClick={() => scrollTo(id)}
                className="capitalize transition"
                style={{ color: S500 }}
                onMouseEnter={e => e.currentTarget.style.color = BRAND}
                onMouseLeave={e => e.currentTarget.style.color = S500}
              >
                {id === "features" ? "Fitur" : id === "demo" ? "Demo" : "Roadmap"}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="font-black text-sm px-4 py-2 rounded-lg transition"
              style={{ color: S400 }}
              onMouseEnter={e => e.currentTarget.style.color = BRAND}
              onMouseLeave={e => e.currentTarget.style.color = S400}
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="font-black text-sm px-6 py-2.5 rounded-full transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white", boxShadow: "0 4px 20px rgb(99 102 241 / 0.35)" }}
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg z-50 transition"
            style={{ color: S300 }}
            onClick={() => setMobileMenu(v => !v)}
            onMouseEnter={e => e.currentTarget.style.background = S800}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="absolute top-0 left-0 w-full pt-24 pb-8 px-6 md:hidden flex flex-col gap-5"
              style={{ background: "rgb(8 8 18 / 0.97)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${S800}` }}
            >
              {["features", "demo", "roadmap"].map(id => (
                <button
                  key={id} onClick={() => scrollTo(id)}
                  className="text-base font-black text-left pb-3 capitalize"
                  style={{ color: S300, borderBottom: `1px solid ${S800}` }}
                >
                  {id === "features" ? "Fitur" : id === "demo" ? "Demo" : "Roadmap"}
                </button>
              ))}
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  to="/login"
                  className="w-full text-center py-3 rounded-xl font-black text-sm"
                  style={{ border: `1px solid ${S700}`, color: S300, background: S900 }}
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-3 rounded-xl font-black text-sm"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white", boxShadow: "0 4px 20px rgb(99 102 241 / 0.30)" }}
                >
                  Daftar Gratis
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* =============== HERO =============== */}
      <header className="relative pt-36 pb-20 md:pt-52 md:pb-36 overflow-hidden">
        {/* Blobs */}
        <div style={{ position:"absolute", top:0, right:0, width:"520px", height:"520px", background:"rgb(139 92 246 / 0.10)", borderRadius:"50%", filter:"blur(100px)", transform:"translate(40%, -40%)", pointerEvents:"none", zIndex:0 }} />
        <div style={{ position:"absolute", bottom:0, left:0, width:"520px", height:"520px", background:"rgb(99 102 241 / 0.10)", borderRadius:"50%", filter:"blur(100px)", transform:"translate(-40%, 40%)", pointerEvents:"none", zIndex:0 }} />
        {/* Dot grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, ${S800} 1px, transparent 1px)`, backgroundSize:"32px 32px", opacity:0.35, pointerEvents:"none", zIndex:0 }} />

        <div className="container mx-auto px-6 text-center relative" style={{ zIndex:1 }}>
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-black mb-8 cursor-default"
              style={{ background: "rgb(99 102 241 / 0.10)", border: "1px solid rgb(99 102 241 / 0.22)", color: BRAND }}
            >
              <Sparkles size={14} className="fill-yellow-400" style={{ color: "#facc15" }} />
              <span>Baru: Mode Battle Royale & Smart Remedial</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]" style={{ color: S100 }}>
              Ubah Cara Belajarmu <br />
              <span style={{ background: "linear-gradient(90deg, #818cf8, #a78bfa, #f472b6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Jadi Petualangan
              </span>
            </h1>

            <p className="text-base md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: S500 }}>
              Platform kuis interaktif yang menggabungkan analisis AI canggih dengan keseruan game kompetitif.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition-all hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color:"white", boxShadow:"0 8px 30px rgb(99 102 241 / 0.40)" }}
              >
                Mulai Sekarang <ArrowRight size={20} />
              </Link>
              <button
                onClick={() => scrollTo("demo")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition-all"
                style={{ background: S900, color: S300, border: `2px solid ${S700}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S700; e.currentTarget.style.color = S300; }}
              >
                <Play size={18} fill="currentColor" /> Coba Demo
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* =============== DEMO SECTION =============== */}
      <section id="demo" className="py-20 md:py-32 relative" style={{ background: S950 }}>
        {/* Divider glow line top */}
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"60%", height:"1px", background:"linear-gradient(90deg, transparent, rgb(99 102 241 / 0.25), transparent)" }} />

        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-14 md:gap-20">
            {/* Left copy */}
            <div className="md:w-1/2">
              <span className="text-xs font-black uppercase tracking-widest mb-3 block" style={{ color: BRAND }}>Coba Langsung</span>
              <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ color: S100 }}>
                Rasakan Pengalaman Kuis Interaktif
              </h2>
              <p className="text-base mb-8 leading-relaxed" style={{ color: S500 }}>
                Tidak perlu mendaftar untuk melihat betapa mudahnya mengerjakan kuis.
                Coba jawab soal di samping ini! Sistem kami akan langsung memberikan umpan balik instan.
              </p>
              <ul className="space-y-4 mb-8">
                {["Antarmuka bersih dan responsif", "Feedback instan setelah menjawab", "Animasi halus yang memanjakan mata"].map((txt, i) => (
                  <ListItem key={i} text={txt} />
                ))}
              </ul>
              <Link
                to="/register"
                className="font-black flex items-center gap-2 transition-all group text-sm"
                style={{ color: BRAND }}
                onMouseEnter={e => e.currentTarget.style.gap = "12px"}
                onMouseLeave={e => e.currentTarget.style.gap = "8px"}
              >
                Buat Akun Full Akses <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right demo card */}
            <div className="md:w-1/2 w-full">
              <div className="relative">
                <div style={{ position:"absolute", top:"-32px", right:"-32px", width:"120px", height:"120px", background:"rgb(234 179 8 / 0.08)", borderRadius:"50%", filter:"blur(40px)" }} />
                <div style={{ position:"absolute", bottom:"-32px", left:"-32px", width:"120px", height:"120px", background:"rgb(139 92 246 / 0.08)", borderRadius:"50%", filter:"blur(40px)" }} />
                <MiniQuizDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============== FEATURES GRID =============== */}
      <section id="features" className="py-20 md:py-32 relative" style={{ background: S900 }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"60%", height:"1px", background:"linear-gradient(90deg, transparent, rgb(99 102 241 / 0.20), transparent)" }} />

        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ color: S100 }}>Fitur Power-Up Belajarmu</h2>
            <p className="text-base" style={{ color: S500 }}>Kami tidak hanya memberikan soal, tapi juga ekosistem lengkap untuk pertumbuhan akademismu.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            <FeatureCard icon={<Target  style={{ color: "#f87171" }} />} title="Smart Remedial"    desc="AI mendeteksi kelemahanmu dan menyusun soal perbaikan khusus secara otomatis." accent="rgb(239 68 68 / 0.08)" border="rgb(239 68 68 / 0.18)" />
            <FeatureCard icon={<Crown   style={{ color: "#fb923c" }} />} title="Battle Royale"     desc="Mode bertahan hidup melawan 50 pemain lain. Siapa yang terakhir bertahan?"     accent="rgb(249 115 22 / 0.08)" border="rgb(249 115 22 / 0.18)" />
            <FeatureCard icon={<BarChart3 style={{ color: BRAND }} />}  title="Analisis Mendalam" desc="Grafik perkembangan belajar, analisis topik, dan prediksi performa ujian."       accent="rgb(99 102 241 / 0.08)" border="rgb(99 102 241 / 0.18)" />
            <FeatureCard icon={<Users   style={{ color: "#60a5fa" }} />} title="Duel Realtime"     desc="Tantang teman 1v1 atau 2v2 dengan sinkronisasi skor tanpa delay."               accent="rgb(96 165 250 / 0.08)" border="rgb(96 165 250 / 0.18)" />
            <FeatureCard icon={<ShoppingBag style={{ color: "#c084fc" }} />} title="Gamifikasi Shop" desc="Tukar koin hasil belajar dengan avatar frame eksklusif dan title keren."       accent="rgb(192 132 252 / 0.08)" border="rgb(192 132 252 / 0.18)" />
            <FeatureCard icon={<Smartphone style={{ color: "#4ade80" }} />} title="Multi Platform"  desc="Akses dari Laptop, Tablet, atau HP dengan tampilan yang tetap optimal."          accent="rgb(74 222 128 / 0.08)" border="rgb(74 222 128 / 0.18)" />
          </div>
        </div>
      </section>

      {/* =============== ROADMAP =============== */}
      <section id="roadmap" className="py-20 md:py-32 overflow-hidden relative" style={{ background: S950 }}>
        {/* Glow */}
        <div style={{ position:"absolute", top:0, right:0, width:"600px", height:"600px", background:"rgb(99 102 241 / 0.07)", borderRadius:"50%", filter:"blur(120px)", transform:"translate(40%, -40%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"60%", height:"1px", background:"linear-gradient(90deg, transparent, rgb(99 102 241 / 0.20), transparent)" }} />

        <div className="container mx-auto px-6 relative" style={{ zIndex:1 }}>
          <div className="flex flex-col md:flex-row gap-14 md:gap-20 items-center">
            {/* Left */}
            <div className="md:w-1/2">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-black mb-5"
                style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.22)" }}
              >
                FUTURE UPDATES
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ color: S100 }}>Roadmap Masa Depan</h2>
              <p className="text-base mb-10 leading-relaxed" style={{ color: S500 }}>
                Kami terus berinovasi. Berikut adalah fitur-fitur besar yang sedang kami kembangkan untuk membuat pengalaman belajarmu makin epik.
              </p>
              <div className="space-y-6">
                <RoadmapItem title="Challenge Rewards (Q1 2026)"  desc="Dapatkan Koin & XP besar setiap memenangkan duel PvP."                    status="Coming Soon" color="#facc15" />
                <RoadmapItem title="Achievement System (Q2 2026)" desc="Ratusan lencana unik untuk dipamerkan di profilmu."                       status="In Progress" color="#c084fc" />
                <RoadmapItem title="AI Quiz Generator (Future)"   desc="Generate soal otomatis dari materi PDF/Teks apapun."                     status="Concept"     color="#22d3ee" />
              </div>
            </div>

            {/* Right — Gamification card */}
            <div
              className="md:w-1/2 p-6 md:p-8 rounded-3xl w-full"
              style={{ background: S900, border: `1px solid ${S800}`, backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 20px rgb(99 102 241 / 0.35)" }}
                >
                  🚀
                </div>
                <div>
                  <div className="text-xl font-black" style={{ color: S100 }}>Level 24</div>
                  <div className="text-sm" style={{ color: S500 }}>Master Quizzer</div>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-black uppercase mb-2" style={{ color: S600 }}>
                <span>XP Progress</span><span>2,450 / 3,000</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden mb-8" style={{ background: S800 }}>
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: "80%" }} transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full"
                  style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: <Trophy size={20} style={{ color: "#facc15" }} />, val: "15",   label: "Wins"   },
                  { icon: <Target size={20} style={{ color: "#f87171" }} />, val: "92%",  label: "Akurasi" },
                  { icon: <Star   size={20} style={{ color: "#c084fc" }} />, val: "Top 3",label: "Rank"   },
                ].map(({ icon, val, label }, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: S800, border: `1px solid ${S700}` }}>
                    <div className="mb-2 flex justify-center">{icon}</div>
                    <div className="font-black text-lg" style={{ color: S100 }}>{val}</div>
                    <div className="text-[10px] font-black uppercase" style={{ color: S600 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============== CTA FOOTER =============== */}
      <section className="py-20 md:py-32 container mx-auto px-6">
        <div
          className="rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)", border: "1px solid rgb(99 102 241 / 0.25)", boxShadow: "0 20px 60px rgb(99 102 241 / 0.20)" }}
        >
          {/* Dot grid overlay */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgb(255 255 255 / 0.04) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />
          {/* Corner sparkles */}
          <Sparkles className="absolute -top-12 -right-12" size={240} style={{ color:"rgb(255 255 255 / 0.04)", transform:"rotate(12deg)" }} />
          <Sparkles className="absolute -bottom-12 -left-12" size={200} style={{ color:"rgb(255 255 255 / 0.04)", transform:"rotate(-12deg)" }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ color: "#fff" }}>Siap Menjadi Juara?</h2>
            <p className="text-base mb-10 leading-relaxed" style={{ color: "#c7d2fe" }}>
              Bergabunglah sekarang dan buktikan kemampuanmu di hadapan ribuan pengguna lainnya. Gratis selamanya.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-10 py-4 rounded-xl font-black text-lg transition-all hover:-translate-y-1 hover:scale-105"
                style={{ background: "rgb(255 255 255 / 0.12)", color: "#e0e7ff", border: "1px solid rgb(255 255 255 / 0.20)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgb(255 255 255 / 0.20)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgb(255 255 255 / 0.12)"}
              >
                Buat Akun Sekarang
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 rounded-xl font-black text-lg transition-all"
                style={{ color: "#a5b4fc", border: "1px solid rgb(99 102 241 / 0.35)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgb(99 102 241 / 0.15)"; e.currentTarget.style.borderColor = "rgb(99 102 241 / 0.50)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgb(99 102 241 / 0.35)"; }}
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =============== FOOTER SIMPLE =============== */}
      <footer className="py-12 text-center" style={{ borderTop: `1px solid ${S800}`, background: S950 }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4 font-black text-xl" style={{ color: S200 }}>
            <Zap size={18} fill="currentColor" style={{ color: BRAND }} /> QuizApp
          </div>
          <p className="mb-6 text-xs" style={{ color: S600 }}>© {new Date().getFullYear()} QuizApp. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-xs font-black" style={{ color: S500 }}>
            <Link to="/about"
              style={{ color: S500 }}
              onMouseEnter={e => e.currentTarget.style.color = BRAND}
              onMouseLeave={e => e.currentTarget.style.color = S500}
            >Tentang</Link>
            <Link to="/whats-new"
              style={{ color: S500 }}
              onMouseEnter={e => e.currentTarget.style.color = BRAND}
              onMouseLeave={e => e.currentTarget.style.color = S500}
            >Changelog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// =========================================================
// SUB-COMPONENTS
// =========================================================

const StatItem = ({ icon, number, label, desc, color, delay }) => (
  <motion.div
    initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay, duration:0.5 }}
    whileHover={{ y:-5 }}
    className="p-6 rounded-3xl flex flex-col items-center text-center group transition-all"
    style={{ background: "var(--color-surface-900)", border: "1px solid var(--color-surface-800)" }}
  >
    <div className="w-12 h-12 mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: "var(--color-surface-800)" }}>
      {icon}
    </div>
    <div className="text-3xl font-black mb-1" style={{ color: "var(--color-surface-100)" }}>{number}</div>
    <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: "var(--color-surface-500)" }}>{label}</div>
    <p className="text-xs" style={{ color: "var(--color-surface-600)" }}>{desc}</p>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc, accent, border }) => (
  <motion.div
    whileHover={{ y:-5 }}
    className="p-6 md:p-8 rounded-3xl transition-all group"
    style={{ background: accent, border: `1px solid ${border}` }}
  >
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
      style={{ background: "var(--color-surface-800)" }}
    >
      {React.cloneElement(icon, { size: 26 })}
    </div>
    <h3 className="text-lg font-black mb-2" style={{ color: "var(--color-surface-100)" }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: "var(--color-surface-500)" }}>{desc}</p>
  </motion.div>
);

const RoadmapItem = ({ title, desc, status, color }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-4 h-4 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
      <div className="w-px flex-1 my-2" style={{ background: "var(--color-surface-800)" }} />
    </div>
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-1">
        <h4 className="font-black text-base" style={{ color }}>{title}</h4>
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded uppercase"
          style={{ background: "var(--color-surface-800)", color: "var(--color-surface-400)", border: "1px solid var(--color-surface-700)" }}
        >{status}</span>
      </div>
      <p className="text-sm" style={{ color: "var(--color-surface-500)" }}>{desc}</p>
    </div>
  </div>
);

const ListItem = ({ text }) => (
  <div className="flex items-center gap-3 font-bold text-sm">
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "rgb(74 222 128 / 0.10)", border: "1px solid rgb(74 222 128 / 0.25)" }}
    >
      <CheckCircle2 size={13} style={{ color: "#4ade80" }} />
    </div>
    <span style={{ color: "var(--color-surface-400)" }}>{text}</span>
  </div>
);

export default LandingPage;
