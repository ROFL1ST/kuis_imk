// src/pages/profile/Settings.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Lock, Bell, Globe, Moon, Trash2, Save, Shield, Smartphone,
  AlertTriangle, UserCog, Mail, CheckCircle, XCircle,
  ChevronDown, Check,
} from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import { updateProfile } from "../../services/api";
import Modal from "../../components/ui/Modal";

/* ── CSS var shortcuts ── */
const BRAND = "var(--color-brand-400)";
const S50   = "var(--color-surface-50)";
const S100  = "var(--color-surface-100)";
const S200  = "var(--color-surface-200)";
const S300  = "var(--color-surface-300)";
const S400  = "var(--color-surface-400)";
const S500  = "var(--color-surface-500)";
const S600  = "var(--color-surface-600)";
const S700  = "var(--color-surface-700)";
const S800  = "var(--color-surface-800)";
const S900  = "var(--color-surface-900)";

const inputStyle = {
  background: S800,
  border: `1px solid ${S700}`,
  color: S100,
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
  fontSize: "0.875rem",
};

const Settings = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [email, setEmail]         = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [preferences, setPreferences]   = useState({ notifications: true, darkMode: false });
  const [loading, setLoading]           = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("email");

  useEffect(() => { document.title = `${t("settings.title")} | QuizApp`; }, [t]);
  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);
  useEffect(() => {
    const saved = localStorage.getItem("settings_notifications");
    if (saved !== null) setPreferences(p => ({ ...p, notifications: JSON.parse(saved) }));
  }, []);

  const toggleNotifications = () => {
    const v = !preferences.notifications;
    setPreferences(p => ({ ...p, notifications: v }));
    localStorage.setItem("settings_notifications", JSON.stringify(v));
    toast.success(v ? "Notifikasi diaktifkan" : "Notifikasi dinonaktifkan", { icon: v ? "🔔" : "🔕" });
  };

  const handleUpdateEmail = async () => {
    if (!email || !email.includes("@")) return toast.error("Masukkan alamat email yang valid");
    if (email === user.email && user.is_email_verified) return toast("Email ini sudah tersimpan dan terverifikasi.", { icon: "ℹ️" });
    setEmailLoading(true);
    try {
      const res = await updateProfile({ email });
      if (!res.data.user.is_email_verified) toast.success(t("settings.email.sent"), { duration: 5000, icon: "📧" });
      else toast.success(t("settings.email.success"));
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...res.user }));
    } catch (err) { toast.error(err.response?.data?.message || "Gagal memperbarui email"); }
    finally { setEmailLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error("Konfirmasi password tidak cocok!");
    if (passForm.newPassword.length < 6) return toast.error("Password minimal 6 karakter");
    setLoading(true);
    try {
      await updateProfile({ password: passForm.newPassword });
      toast.success(t("settings.security.success"));
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Gagal mengubah password"); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    try { toast.success("Akun berhasil dihapus (Simulasi)"); logout(); }
    catch (err) { toast.error("Gagal menghapus akun"); }
  };

  /* ── Nav items ── */
  const NAV = [
    { id: "email",       icon: <Mail       size={16} />, label: t("settings.menu.email"),       accent: "#60a5fa" },
    { id: "security",    icon: <Shield     size={16} />, label: t("settings.menu.security"),    accent: "#a78bfa" },
    { id: "preferences", icon: <Smartphone size={16} />, label: t("settings.menu.preferences"), accent: "#34d399" },
    { id: "danger",      icon: <AlertTriangle size={16} />, label: t("settings.danger.title"),  accent: "#f87171" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pb-24 px-4"
    >
      {/* ══ PAGE HEADER ══ */}
      <div className="mb-8 mt-2">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3" style={{ color: S50 }}>
          <span
            className="p-2 rounded-xl"
            style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND }}
          >
            <UserCog size={22} />
          </span>
          {t("settings.title")}
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: S500 }}>{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        {/* ══ SIDEBAR ══ */}
        <aside className="space-y-4">

          {/* User mini card */}
          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: S900, border: `1px solid ${S700}` }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shrink-0"
              style={{ background: "rgb(99 102 241 / 0.15)", color: BRAND }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm truncate" style={{ color: S100 }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: S500 }}>@{user?.username}</p>
              {user?.email && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-full mt-1"
                  style={user.is_email_verified
                    ? { background: "rgb(34 197 94 / 0.10)", color: "#4ade80" }
                    : { background: "rgb(234 179 8 / 0.10)", color: "#fbbf24" }
                  }
                >
                  {user.is_email_verified
                    ? <><CheckCircle size={9} /> {t("settings.email.verified")}</>
                    : <><XCircle size={9} /> {t("settings.email.unverified")}</>
                  }
                </span>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav
            className="rounded-2xl overflow-hidden p-2 space-y-1"
            style={{ background: S900, border: `1px solid ${S800}` }}
          >
            <p
              className="text-[10px] font-black uppercase px-3 py-2 tracking-widest"
              style={{ color: S600 }}
            >
              {t("settings.menu.quickMenu")}
            </p>
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black text-left transition-all"
                style={
                  activeSection === item.id
                    ? { background: `${item.accent}18`, color: item.accent, border: `1px solid ${item.accent}30` }
                    : { color: S400, border: "1px solid transparent" }
                }
                onMouseEnter={e => { if (activeSection !== item.id) e.currentTarget.style.color = S200; }}
                onMouseLeave={e => { if (activeSection !== item.id) e.currentTarget.style.color = S400; }}
              >
                <span
                  className="p-1.5 rounded-lg"
                  style={activeSection === item.id
                    ? { background: `${item.accent}25`, color: item.accent }
                    : { background: S800, color: S500 }
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <div className="space-y-5">

          {/* 1. EMAIL */}
          <motion.section
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: S900, border: `1px solid ${S800}` }}
          >
            {/* Section header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${S800}` }}
            >
              <h2 className="font-black text-base flex items-center gap-2" style={{ color: S100 }}>
                <span className="p-1.5 rounded-lg" style={{ background: "rgb(96 165 250 / 0.12)", color: "#60a5fa" }}>
                  <Mail size={15} />
                </span>
                {t("settings.email.title")}
              </h2>
              {user?.email && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full"
                  style={user.is_email_verified
                    ? { background: "rgb(34 197 94 / 0.10)", color: "#4ade80", border: "1px solid rgb(34 197 94 / 0.20)" }
                    : { background: "rgb(234 179 8 / 0.10)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.20)" }
                  }
                >
                  {user.is_email_verified
                    ? <><CheckCircle size={10} /> {t("settings.email.verified")}</>
                    : <><XCircle size={10} /> {t("settings.email.unverified")}</>
                  }
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-2" style={{ color: S500 }}>
                  {t("settings.email.label")}
                </label>
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={e => e.target.style.borderColor = BRAND}
                  onBlur={e => e.target.style.borderColor = S700}
                />
                <p className="text-xs mt-1.5" style={{ color: S600 }}>{t("settings.email.hint")}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateEmail}
                  disabled={emailLoading || (email === user?.email && user?.is_email_verified)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "rgb(96 165 250 / 0.12)", color: "#60a5fa", border: "1px solid rgb(96 165 250 / 0.25)" }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "rgb(96 165 250 / 0.20)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "rgb(96 165 250 / 0.12)"}
                >
                  {emailLoading ? t("settings.email.saving") : <><Save size={15} /> {t("settings.email.save")}</>}
                </button>
              </div>
            </div>
          </motion.section>

          {/* 2. PASSWORD */}
          <motion.section
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: S900, border: `1px solid ${S800}` }}
          >
            <div
              className="px-6 py-4"
              style={{ borderBottom: `1px solid ${S800}` }}
            >
              <h2 className="font-black text-base flex items-center gap-2" style={{ color: S100 }}>
                <span className="p-1.5 rounded-lg" style={{ background: "rgb(167 139 250 / 0.12)", color: "#a78bfa" }}>
                  <Lock size={15} />
                </span>
                {t("settings.security.title")}
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-2" style={{ color: S500 }}>
                    {t("settings.security.newPass")}
                  </label>
                  <input
                    type="password"
                    style={inputStyle}
                    placeholder={t("settings.security.placeholderPass")}
                    value={passForm.newPassword}
                    onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                    onFocus={e => e.target.style.borderColor = BRAND}
                    onBlur={e => e.target.style.borderColor = S700}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-2" style={{ color: S500 }}>
                    {t("settings.security.confirmPass")}
                  </label>
                  <input
                    type="password"
                    style={inputStyle}
                    placeholder={t("settings.security.placeholderConfirm")}
                    value={passForm.confirmPassword}
                    onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                    onFocus={e => e.target.style.borderColor = BRAND}
                    onBlur={e => e.target.style.borderColor = S700}
                  />
                </div>
              </div>

              {/* Password match hint */}
              {passForm.newPassword && passForm.confirmPassword && (
                <p
                  className="text-xs font-black"
                  style={{ color: passForm.newPassword === passForm.confirmPassword ? "#4ade80" : "#f87171" }}
                >
                  {passForm.newPassword === passForm.confirmPassword ? "✓ Password cocok" : "✗ Password tidak cocok"}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !passForm.newPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "rgb(167 139 250 / 0.12)", color: "#a78bfa", border: "1px solid rgb(167 139 250 / 0.25)" }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "rgb(167 139 250 / 0.22)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "rgb(167 139 250 / 0.12)"}
                >
                  {loading ? t("settings.email.saving") : <><Save size={15} /> {t("settings.security.update")}</>}
                </button>
              </div>
            </form>
          </motion.section>

          {/* 3. PREFERENCES */}
          <motion.section
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: S900, border: `1px solid ${S800}` }}
          >
            <div
              className="px-6 py-4"
              style={{ borderBottom: `1px solid ${S800}` }}
            >
              <h2 className="font-black text-base flex items-center gap-2" style={{ color: S100 }}>
                <span className="p-1.5 rounded-lg" style={{ background: "rgb(52 211 153 / 0.12)", color: "#34d399" }}>
                  <Smartphone size={15} />
                </span>
                {t("settings.preferences.title")}
              </h2>
            </div>

            <div className="p-5 space-y-2">

              {/* Notifications toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors"
                style={{ background: S800, border: `1px solid ${S700}` }}
                onClick={toggleNotifications}
                onMouseEnter={e => e.currentTarget.style.borderColor = S600}
                onMouseLeave={e => e.currentTarget.style.borderColor = S700}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="p-2 rounded-lg"
                    style={{ background: "rgb(234 179 8 / 0.12)", color: "#fbbf24" }}
                  >
                    <Bell size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-black" style={{ color: S200 }}>{t("settings.preferences.notifTitle")}</p>
                    <p className="text-xs" style={{ color: S600 }}>{t("settings.preferences.notifDesc")}</p>
                  </div>
                </div>
                {/* Toggle pill */}
                <div
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: preferences.notifications ? BRAND : S700 }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    style={{ left: preferences.notifications ? "calc(100% - 20px)" : "4px" }}
                  />
                </div>
              </div>

              {/* Dark mode (disabled) */}
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: S800, border: `1px solid ${S700}`, opacity: 0.45, cursor: "not-allowed" }}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg" style={{ background: "rgb(167 139 250 / 0.12)", color: "#a78bfa" }}>
                    <Moon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-black flex items-center gap-2" style={{ color: S200 }}>
                      {t("settings.preferences.darkModeTitle")}
                      <span
                        className="text-[9px] font-black px-1.5 py-0.5 rounded"
                        style={{ background: S700, color: S500 }}
                      >
                        Dev
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: S600 }}>{t("settings.preferences.darkModeDesc")}</p>
                  </div>
                </div>
                <div className="w-11 h-6 rounded-full" style={{ background: S700 }} />
              </div>

              {/* Language selector */}
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: S800, border: `1px solid ${S700}` }}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg" style={{ background: "rgb(52 211 153 / 0.12)", color: "#34d399" }}>
                    <Globe size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-black" style={{ color: S200 }}>{t("settings.preferences.langTitle")}</p>
                    <p className="text-xs" style={{ color: S600 }}>{t("settings.preferences.langDesc")}</p>
                  </div>
                </div>

                <Listbox value={language} onChange={setLanguage}>
                  <div className="relative">
                    <ListboxButton
                      className="relative w-28 cursor-pointer rounded-xl py-2 pl-3 pr-8 text-left text-sm font-black transition-all"
                      style={{ background: S900, border: `1px solid ${S600}`, color: S200 }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">
                          {language === "id" ? "🇮🇩" : language === "en" ? "🇺🇸" : "🇯🇵"}
                        </span>
                        <span className="text-xs">
                          {language === "id" ? "ID" : language === "en" ? "EN" : "JP"}
                        </span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <ChevronDown size={14} style={{ color: S500 }} />
                      </span>
                    </ListboxButton>

                    <ListboxOptions
                      className="absolute right-0 mt-1 w-40 overflow-auto rounded-xl py-1 text-sm shadow-2xl z-50"
                      style={{ background: S800, border: `1px solid ${S700}` }}
                    >
                      {[
                        { code: "id", label: "Indonesia", flag: "🇮🇩" },
                        { code: "en", label: "English",   flag: "🇺🇸" },
                        { code: "jp", label: "日本語",      flag: "🇯🇵" },
                      ].map(lang => (
                        <ListboxOption
                          key={lang.code}
                          value={lang.code}
                          className=""
                        >
                          {({ focus, selected }) => (
                            <div
                              className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                              style={{
                                background: focus ? "rgb(99 102 241 / 0.10)" : "transparent",
                                color: selected ? BRAND : S300,
                              }}
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="text-lg">{lang.flag}</span>
                                <span className={selected ? "font-black" : "font-medium"}>{lang.label}</span>
                              </span>
                              {selected && <Check size={14} style={{ color: BRAND }} />}
                            </div>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
            </div>
          </motion.section>

          {/* 4. DANGER ZONE */}
          <motion.section
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgb(239 68 68 / 0.05)", border: "1px solid rgb(239 68 68 / 0.18)" }}
          >
            <div
              className="px-6 py-4"
              style={{ borderBottom: "1px solid rgb(239 68 68 / 0.15)" }}
            >
              <h2 className="font-black text-base flex items-center gap-2" style={{ color: "#f87171" }}>
                <span className="p-1.5 rounded-lg" style={{ background: "rgb(239 68 68 / 0.12)", color: "#f87171" }}>
                  <AlertTriangle size={15} />
                </span>
                {t("settings.danger.title")}
              </h2>
            </div>

            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm leading-relaxed" style={{ color: "rgb(252 165 165 / 0.75)" }}>
                {t("settings.danger.desc")}
              </p>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm shrink-0 transition-all"
                style={{ background: "rgb(239 68 68 / 0.10)", color: "#f87171", border: "1px solid rgb(239 68 68 / 0.25)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgb(239 68 68 / 0.10)"; e.currentTarget.style.color = "#f87171"; }}
              >
                <Trash2 size={15} /> {t("settings.danger.delete")}
              </button>
            </div>
          </motion.section>

        </div>
      </div>

      {/* ══ DELETE MODAL ══ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="max-w-sm"
      >
        <div className="text-center p-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgb(239 68 68 / 0.12)", color: "#f87171" }}
          >
            <AlertTriangle size={26} />
          </div>
          <h3 className="text-lg font-black mb-2" style={{ color: S100 }}>
            {t("settings.danger.modalTitle")}
          </h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: S400 }}>
            {t("settings.danger.modalDesc")} <strong style={{ color: S200 }}>@{user?.username}</strong>?{" "}
            <br />
            <span style={{ color: "#f87171" }}>Tindakan ini <b>tidak dapat dibatalkan</b>.</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl font-black text-sm transition-colors"
              style={{ background: S800, color: S300, border: `1px solid ${S700}` }}
            >
              {t("settings.danger.cancel")}
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 py-2.5 rounded-xl font-black text-sm text-white"
              style={{ background: "#dc2626" }}
            >
              {t("settings.danger.confirm")}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Settings;
