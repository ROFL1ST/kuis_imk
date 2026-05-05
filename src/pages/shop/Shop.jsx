// src/pages/shop/Shop.jsx
import { useEffect, useState } from "react";
import { shopAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import toast from "react-hot-toast";
import { ShoppingBag, Coins, CheckCircle, Lock, ArrowRight, Wallet, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import UserAvatar from "../../components/ui/UserAvatar";
import Modal from "../../components/ui/Modal";
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

const TABS = ["all", "avatar_frame", "title"];

const Shop = () => {
  const { user, setUser } = useAuth();
  const { t }             = useLanguage();

  const [items, setItems]               = useState([]);
  const [inventory, setInventory]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [activeTab, setActiveTab]       = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  useEffect(() => { document.title = "Shop | QuizApp"; fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([shopAPI.getItems(), shopAPI.getInventory()]);
      setItems(itemsRes.data.data);
      setInventory(invRes.data.data.map(inv => inv.item_id));
    } catch { console.error("Failed to load shop"); }
    finally { setLoading(false); }
  };

  const openBuyModal = (item) => { setSelectedItem(item); setIsBuyModalOpen(true); };

  const handleBuy = async (item) => {
    if (!selectedItem) return;
    if (user.coins < item.price) { toast.error(t("shop.insufficient")); return; }
    setConfirmLoading(true);
    try {
      const res = await shopAPI.buyItem(item.ID);
      setInventory([...inventory, item.ID]);
      setUser({ ...user, coins: res.data.data.coins_left });
      toast.success(t("shop.successBuy", { item: selectedItem.name }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membeli item");
    } finally { setConfirmLoading(false); setIsBuyModalOpen(false); }
  };

  const filteredItems = activeTab === "all" ? items : items.filter(i => i.type === activeTab);

  /* ───────────── SKELETON ───────────── */
  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-6">
      <Skeleton className="w-full h-40 rounded-3xl" />
      <div className="flex gap-3"> {[1,2,3].map(i => <Skeleton key={i} className="w-24 h-10 rounded-full" />)} </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-12 px-4">

      {/* ═══ HEADER BANNER ═══ */}
      <div
        className="w-full rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)" }}
      >
        <div style={{ position:"absolute", top:"-50px", right:"-40px", width:"220px", height:"220px", borderRadius:"50%", background:"rgb(99 102 241 / 0.18)", filter:"blur(50px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-20px", left:"20px", width:"140px", height:"140px", borderRadius:"50%", background:"rgb(168 85 247 / 0.12)", filter:"blur(30px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgb(255 255 255 / 0.04) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />
        <Coins className="absolute -right-10 -bottom-10 pointer-events-none" size={200} style={{ color: "rgb(255 255 255 / 0.04)", transform: "rotate(12deg)" }} />

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3" style={{ color: "#fff" }}>
            <span className="p-2 rounded-xl" style={{ background: "rgb(255 255 255 / 0.12)" }}>
              <ShoppingBag size={22} style={{ color: "#c7d2fe" }} />
            </span>
            {t("shop.title")}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "rgb(199 210 254 / 0.75)" }}>{t("shop.subtitle")}</p>

          <div
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "rgb(255 255 255 / 0.10)", border: "1px solid rgb(255 255 255 / 0.18)" }}
          >
            <Coins size={18} style={{ color: "#fbbf24" }} />
            <span className="font-black text-lg" style={{ color: "#fff" }}>
              {user?.coins} <span style={{ color: "rgb(199 210 254 / 0.7)", fontSize: "0.85em" }}>{t("shop.coins")}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-full font-black text-sm transition-all shrink-0"
            style={{
              background: activeTab === tab ? BRAND : S800,
              color:      activeTab === tab ? "#1e1b4b" : S400,
              border:     `1px solid ${activeTab === tab ? "transparent" : S700}`,
            }}
          >
            {t(`shop.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* ═══ GRID ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map((item, idx) => {
          const isOwned    = inventory.includes(item.ID);
          const canAfford  = user.coins >= item.price;

          return (
            <motion.div
              key={item.ID}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-2xl p-4 flex flex-col"
              style={{
                background: isOwned ? "rgb(34 197 94 / 0.06)" : S900,
                border: `1px solid ${isOwned ? "rgb(34 197 94 / 0.25)" : S800}`,
              }}
            >
              {/* Preview */}
              <div
                className="h-32 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
                style={{ background: S800 }}
              >
                {item.type === "avatar_frame" ? (
                  <div className="scale-150">
                    <UserAvatar
                      user={{ name: user.name, equipped_items: [{ type: "avatar_frame", asset_url: item.asset_url }] }}
                      size="md"
                    />
                  </div>
                ) : (
                  <span className="text-4xl">{item.asset_url || "✨"}</span>
                )}

                {isOwned && (
                  <div
                    className="absolute top-2 right-2 p-1 rounded-full"
                    style={{ background: "#22c55e" }}
                  >
                    <CheckCircle size={14} color="#fff" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-black text-sm" style={{ color: S100 }}>{item.name}</h3>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: S500 }}>{item.description}</p>
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${S800}` }}>
                {isOwned ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-lg text-xs font-black cursor-default"
                    style={{ background: "rgb(34 197 94 / 0.10)", color: "#4ade80" }}
                  >
                    {t("shop.owned")}
                  </button>
                ) : (
                  <button
                    onClick={() => openBuyModal(item)}
                    disabled={!canAfford}
                    className="w-full py-2 flex items-center justify-center gap-2 rounded-lg font-black text-xs transition-all"
                    style={{
                      background: canAfford ? "rgb(99 102 241 / 0.12)" : S800,
                      color:      canAfford ? BRAND : S600,
                      border:     `1px solid ${canAfford ? "rgb(99 102 241 / 0.25)" : S700}`,
                      cursor:     canAfford ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={e => canAfford && (e.currentTarget.style.background = "rgb(99 102 241 / 0.22)")}
                    onMouseLeave={e => canAfford && (e.currentTarget.style.background = "rgb(99 102 241 / 0.12)")}
                  >
                    {canAfford ? <Coins size={13} /> : <Lock size={13} />}
                    {item.price}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ BUY MODAL ═══ */}
      <Modal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} title={t("shop.confirmTitle")} maxWidth="max-w-sm">
        {selectedItem && (
          <div className="space-y-5">
            {/* Preview */}
            <div
              className="flex flex-col items-center justify-center p-6 rounded-2xl"
              style={{ background: S800, border: `1px solid ${S700}` }}
            >
              <div className="mb-3">
                {selectedItem.type === "avatar_frame" ? (
                  <UserAvatar
                    user={{ name: user.name, equipped_items: [{ type: "avatar_frame", asset_url: selectedItem.asset_url }] }}
                    size="xl"
                  />
                ) : (
                  <span className="text-4xl">{selectedItem.asset_url || "🎁"}</span>
                )}
              </div>
              <h3 className="font-black text-base" style={{ color: S100 }}>{selectedItem.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: S500 }}>{selectedItem.type.replace("_", " ")}</p>
            </div>

            {/* Price calc */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2" style={{ color: S500 }}><Wallet size={14} /> {t("shop.currentBalance")}</span>
                <span className="font-black" style={{ color: S200 }}>{user.coins}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: S500 }}>{t("shop.price")}</span>
                <span className="font-black" style={{ color: "#f87171" }}>-{selectedItem.price}</span>
              </div>
              <div style={{ height: "1px", background: S700 }} />
              <div className="flex justify-between items-center">
                <span className="font-black text-sm" style={{ color: S300 }}>{t("shop.remainingBalance")}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="font-black"
                    style={{ color: user.coins - selectedItem.price < 0 ? "#f87171" : "#4ade80" }}
                  >
                    {user.coins - selectedItem.price}
                  </span>
                  {user.coins < selectedItem.price && <AlertCircle size={14} style={{ color: "#f87171" }} />}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setIsBuyModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-black text-sm"
                style={{ background: S800, color: S300, border: `1px solid ${S700}` }}
              >
                {t("shop.cancel")}
              </button>
              <button
                onClick={() => handleBuy(selectedItem)}
                disabled={user.coins < selectedItem.price || confirmLoading}
                className="flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "rgb(99 102 241 / 0.12)", color: BRAND, border: "1px solid rgb(99 102 241 / 0.25)" }}
                onMouseEnter={e => !(user.coins < selectedItem.price) && (e.currentTarget.style.background = "rgb(99 102 241 / 0.22)")}
                onMouseLeave={e => !(user.coins < selectedItem.price) && (e.currentTarget.style.background = "rgb(99 102 241 / 0.12)")}
              >
                {t("shop.buy")} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Shop;
