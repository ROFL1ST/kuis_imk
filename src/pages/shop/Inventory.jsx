// src/pages/shop/Inventory.jsx
import { useEffect, useState } from "react";
import { shopAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import UserAvatar from "../../components/ui/UserAvatar";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Shield, Check, Layout, Type, Sparkles } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

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

const Inventory = () => {
  const { user, setUser } = useAuth();
  const { t }             = useLanguage();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => { document.title = "Inventory | QuizApp"; fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await shopAPI.getInventory();
      setInventory(res.data.data);
    } catch { toast.error("Gagal memuat tas"); }
    finally { setLoading(false); }
  };

  const handleEquip = async (targetUserItem) => {
    try {
      // Optimistic update
      setInventory(prev =>
        prev.map(inv => ({
          ...inv,
          is_equipped: inv.item.type === targetUserItem.item.type
            ? inv.item_id === targetUserItem.item_id
            : inv.is_equipped,
        }))
      );

      await shopAPI.equipItem(targetUserItem.item_id);

      const currentEquipped = user.equipped_items ? [...user.equipped_items] : [];
      const filtered = currentEquipped.filter(e => e.item?.type !== targetUserItem.item.type);
      filtered.push({ ...targetUserItem, is_equipped: true, item: targetUserItem.item });
      setUser({ ...user, equipped_items: filtered });

      toast.success(t("inventory.successEquip", { item: targetUserItem.item.name }), {
        icon: "✨",
        style: { borderRadius: "12px", background: "#1e1b4b", color: "#e0e7ff" },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memakai item");
      fetchInventory();
    }
  };

  const filteredInventory = activeTab === "all" ? inventory : inventory.filter(inv => inv.item.type === activeTab);

  const renderItemPreview = (item) => {
    if (item.type === "avatar_frame") return (
      <div className="transform scale-110 pointer-events-none">
        <UserAvatar user={{ ...user, equipped_items: [{ item }] }} size="lg" />
      </div>
    );
    if (item.type === "title") return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-1">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: S600 }}>Preview</span>
        <div
          className="px-3 py-1.5 text-xs font-black rounded-lg uppercase tracking-wide"
          style={{ background: "rgb(99 102 241 / 0.15)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.25)" }}
        >
          {item.name}
        </div>
      </div>
    );
    return <Sparkles size={28} style={{ color: S600 }} />;
  };

  /* ───────────── SKELETON ───────────── */
  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4"><Skeleton className="h-80 w-full rounded-3xl" /></div>
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="flex gap-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-24 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  /* ───────────── RENDER ───────────── */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-4 pb-24">

      {/* Mobile title */}
      <div className="mb-5 lg:hidden">
        <h1 className="text-xl font-black flex items-center gap-2" style={{ color: S100 }}>
          <Package size={20} style={{ color: BRAND }} /> {t("inventory.title")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── KOLOM KIRI: Profile Preview ── */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] overflow-hidden"
            style={{ background: S900, border: `1px solid ${S800}` }}
          >
            {/* Gradient top strip */}
            <div
              className="h-28 relative"
              style={{ background: "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)" }}
            >
              <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgb(255 255 255 / 0.04) 1px, transparent 1px)", backgroundSize:"18px 18px" }} />
            </div>

            <div className="px-6 pb-6 -mt-14 relative z-10 flex flex-col items-center">
              {/* Avatar */}
              <div className="relative p-1.5 rounded-full" style={{ background: S900 }}>
                <UserAvatar user={user} size="2xl" />
                <div
                  className="absolute -bottom-1 -right-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: S800, color: BRAND, border: `1px solid ${S700}` }}
                >
                  Lv.{user.level}
                </div>
              </div>

              <div className="text-center mt-3 w-full">
                <h2 className="text-lg font-black" style={{ color: S100 }}>{user.name}</h2>
                <p className="text-sm mb-3" style={{ color: S500 }}>@{user.username}</p>

                {/* Equipped title */}
                <div className="min-h-[2rem]">
                  {user.equipped_items?.find(i => i.item.type === "title") ? (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                      style={{ background: "rgb(234 179 8 / 0.12)", color: "#fbbf24", border: "1px solid rgb(234 179 8 / 0.25)" }}
                    >
                      <Shield size={11} />
                      {user.equipped_items.find(i => i.item.type === "title").item.name}
                    </span>
                  ) : (
                    <span className="text-xs italic" style={{ color: S700 }}>{t("inventory.noTitle")}</span>
                  )}
                </div>
              </div>

              {/* Stats mini */}
              <div
                className="grid grid-cols-2 gap-2 w-full mt-5 pt-5"
                style={{ borderTop: `1px solid ${S800}` }}
              >
                <div className="text-center p-2 rounded-xl" style={{ background: S800 }}>
                  <p className="text-[10px] font-black uppercase" style={{ color: S600 }}>{t("shop.tabs.avatar_frame")}</p>
                  <p className="text-xs font-black truncate px-1" style={{ color: S300 }}>
                    {user.equipped_items?.find(i => i.item.type === "avatar_frame")?.item.name || "-"}
                  </p>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: S800 }}>
                  <p className="text-[10px] font-black uppercase" style={{ color: S600 }}>{t("inventory.totalItem")}</p>
                  <p className="text-xs font-black" style={{ color: S300 }}>{inventory.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── KOLOM KANAN: Items ── */}
        <div className="lg:col-span-8">
          {/* Desktop title */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-black flex items-center gap-3" style={{ color: S100 }}>
              <span className="p-2 rounded-xl" style={{ background: "rgb(99 102 241 / 0.10)", color: BRAND }}>
                <Package size={22} />
              </span>
              {t("inventory.subtitle")}
            </h1>
            <p className="ml-14 text-sm" style={{ color: S500 }}>{t("inventory.desc")}</p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { id: "all",          label: t("shop.tabs.all"),          icon: null },
              { id: "avatar_frame", label: t("shop.tabs.avatar_frame"), icon: <Layout size={13} /> },
              { id: "title",        label: t("shop.tabs.title"),        icon: <Type size={13} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm transition-all active:scale-95"
                style={{
                  background: activeTab === tab.id ? BRAND                              : S800,
                  color:      activeTab === tab.id ? "#1e1b4b"                          : S400,
                  border:     `1px solid ${activeTab === tab.id ? "transparent" : S700}`,
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <motion.div layout className="min-h-[300px]">
            <AnimatePresence mode="popLayout">
              {filteredInventory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 rounded-3xl text-center px-4"
                  style={{ background: S900, border: `2px dashed ${S700}` }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: S800, color: S700 }}>
                    <Package size={28} />
                  </div>
                  <h3 className="text-base font-black mb-1" style={{ color: S300 }}>{t("inventory.emptyTitle")}</h3>
                  <p className="text-sm" style={{ color: S600 }}>{t("inventory.emptyDesc")}</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInventory.map(inv => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={inv.item_id}
                      className="relative rounded-2xl p-4 flex flex-col items-center text-center gap-3 group transition-all"
                      style={{
                        background: inv.is_equipped ? "rgb(99 102 241 / 0.07)" : S900,
                        border:     `2px solid ${inv.is_equipped ? "rgb(99 102 241 / 0.40)" : S800}`,
                      }}
                      onMouseEnter={e => !inv.is_equipped && (e.currentTarget.style.borderColor = S700)}
                      onMouseLeave={e => !inv.is_equipped && (e.currentTarget.style.borderColor = S800)}
                    >
                      {/* Equipped badge */}
                      {inv.is_equipped && (
                        <div
                          className="absolute top-3 right-3 p-1 rounded-full z-10"
                          style={{ background: BRAND }}
                        >
                          <Check size={11} strokeWidth={4} color="#1e1b4b" />
                        </div>
                      )}

                      {/* Preview */}
                      <div
                        className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                        style={{ background: inv.is_equipped ? "rgb(99 102 241 / 0.10)" : S800 }}
                      >
                        {renderItemPreview(inv.item)}
                      </div>

                      {/* Info */}
                      <div className="w-full">
                        <h3 className="font-black text-sm truncate" style={{ color: inv.is_equipped ? BRAND : S200 }}>{inv.item.name}</h3>
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: S600 }}>
                          {inv.item.description || "Item koleksi yang sangat langka."}
                        </p>
                      </div>

                      {/* Equip button */}
                      <button
                        onClick={() => !inv.is_equipped && handleEquip(inv)}
                        disabled={inv.is_equipped}
                        className="w-full py-2.5 rounded-xl text-xs font-black transition-all mt-auto flex items-center justify-center gap-1.5"
                        style={{
                          background: inv.is_equipped ? "rgb(99 102 241 / 0.10)" : S800,
                          color:      inv.is_equipped ? BRAND                    : S300,
                          border:     `1px solid ${inv.is_equipped ? "rgb(99 102 241 / 0.25)" : S700}`,
                          cursor:     inv.is_equipped ? "default" : "pointer",
                        }}
                        onMouseEnter={e => !inv.is_equipped && (e.currentTarget.style.background = S700)}
                        onMouseLeave={e => !inv.is_equipped && (e.currentTarget.style.background = S800)}
                      >
                        {inv.is_equipped ? t("inventory.equipped") : t("inventory.equip")}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Inventory;
