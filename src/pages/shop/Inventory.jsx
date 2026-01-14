import { useEffect, useState } from "react";
import { shopAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import UserAvatar from "../../components/ui/UserAvatar";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Shield, Check, Layout, Type, Sparkles } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

const Inventory = () => {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await shopAPI.getInventory();
      setInventory(res.data.data);
    } catch (error) {
      console.error("Gagal load inventory", error);
      toast.error("Gagal memuat tas");
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (targetUserItem) => {
    try {
      // Optimistic UI Update start
      const updatedInventory = inventory.map((inv) => {
        if (inv.item.type === targetUserItem.item.type) {
          return { ...inv, is_equipped: false };
        }
        return inv;
      });

      const finalInventory = updatedInventory.map((inv) =>
        inv.item_id === targetUserItem.item_id
          ? { ...inv, is_equipped: true }
          : inv
      );
      setInventory(finalInventory);
      // Optimistic UI Update end

      // API Call
      await shopAPI.equipItem(targetUserItem.item_id);

      // Update User Context
      const currentEquipped = user.equipped_items
        ? [...user.equipped_items]
        : [];
      const filteredEquipped = currentEquipped.filter(
        (equipped) => equipped.item?.type !== targetUserItem.item.type
      );
      const newItemEntry = {
        ...targetUserItem,
        is_equipped: true,
        item: targetUserItem.item,
      };
      filteredEquipped.push(newItemEntry);

      const updatedUser = { ...user, equipped_items: filteredEquipped };
      setUser(updatedUser);

      toast.success(
        t("inventory.successEquip", { item: targetUserItem.item.name }),
        {
          icon: "✨",
          style: { borderRadius: "12px", background: "#333", color: "#fff" },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal memakai item");
      fetchInventory(); // Refresh data jika gagal agar sinkron
    }
  };

  useEffect(() => {
    document.title = "Inventory | QuizApp";
  }, []);

  const filteredInventory =
    activeTab === "all"
      ? inventory
      : inventory.filter((inv) => inv.item.type === activeTab);

  // --- LOGIC PREVIEW ITEM (YANG DIPERBAIKI) ---
  const renderItemPreview = (item) => {
    // 1. Jika Item adalah FRAME
    if (item.type === "avatar_frame") {
      // Trik: Buat objek user sementara yang 'memakai' frame ini
      // agar UserAvatar merender frame tersebut secara visual
      const previewUser = {
        ...user,
        equipped_items: [{ item: item }],
      };

      return (
        <div className="transform scale-110 pointer-events-none">
          {/* Gunakan Avatar User sendiri untuk preview */}
          <UserAvatar user={previewUser} size="lg" />
        </div>
      );
    }

    // 2. Jika Item adalah TITLE
    if (item.type === "title") {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Preview
          </span>
          <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-lg shadow-md tracking-wide uppercase">
            {item.name}
          </div>
        </div>
      );
    }

    // 3. Default / Fallback
    return <Sparkles className="text-indigo-200" size={32} />;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
          <div className="w-full md:w-2/3">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-white"
                >
                  <Skeleton className="w-12 h-12 rounded-xl mx-auto" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Mobile Only */}
        <div className="mb-6 lg:hidden">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Package className="text-indigo-600" /> {t("inventory.title")}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* === KOLOM KIRI: PREVIEW PROFILE (Sticky) === */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 shadow-xl shadow-indigo-100 border border-white overflow-hidden relative"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
              <div className="absolute top-24 left-0 w-full h-16 bg-gradient-to-b from-black/5 to-transparent"></div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Avatar Wrapper */}
                <div className="relative mt-8 mb-4 group">
                  <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative p-1.5 bg-white rounded-full shadow-lg">
                    <UserAvatar user={user} size="2xl" />
                  </div>
                  {/* Badge Level */}
                  <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                    Lvl {user.level}
                  </div>
                </div>

                <div className="text-center w-full">
                  <h2 className="text-xl font-black text-slate-800 mt-2">
                    {user.name}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mb-4">
                    @{user.username}
                  </p>

                  {/* Active Title Badge */}
                  <div className="min-h-[2rem]">
                    {user.equipped_items?.find(
                      (i) => i.item.type === "title"
                    ) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100 shadow-sm">
                        <Shield size={12} className="text-orange-500" />
                        {
                          user.equipped_items.find(
                            (i) => i.item.type === "title"
                          ).item.name
                        }
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">
                        {t("inventory.noTitle")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Mini */}
                <div className="grid grid-cols-2 gap-2 w-full mt-6 pt-6 border-t border-slate-100">
                  <div className="text-center p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {t("shop.tabs.avatar_frame")}
                    </p>
                    <p className="text-xs font-bold text-slate-700 truncate px-1">
                      {user.equipped_items?.find(
                        (i) => i.item.type === "avatar_frame"
                      )?.item.name || "-"}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {t("inventory.totalItem")}
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      {inventory.length}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* === KOLOM KANAN: LIST BARANG === */}
          <div className="lg:col-span-8">
            <div className="hidden lg:block mb-8">
              <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                  <Package size={28} />
                </span>
                {t("inventory.subtitle")}
              </h1>
              <p className="text-slate-500 ml-14">{t("inventory.desc")}</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "all", label: t("shop.tabs.all"), icon: null },
                {
                  id: "avatar_frame",
                  label: t("shop.tabs.avatar_frame"),
                  icon: <Layout size={14} />,
                },
                {
                  id: "title",
                  label: t("shop.tabs.title"),
                  icon: <Type size={14} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    activeTab === tab.id
                      ? "bg-slate-800 text-white shadow-lg shadow-slate-200 ring-2 ring-slate-800 ring-offset-2"
                      : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-200"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content Grid */}
            <motion.div layout className="min-h-[300px]">
              <AnimatePresence mode="popLayout">
                {filteredInventory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center px-4"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Package className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">
                      {t("inventory.emptyTitle")}
                    </h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">
                      {t("inventory.emptyDesc")}
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInventory.map((inv) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={inv.item_id}
                        className={`group relative bg-white p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-3 ${
                          inv.is_equipped
                            ? "border-indigo-500 shadow-lg shadow-indigo-100 ring-1 ring-indigo-500"
                            : "border-slate-100 hover:border-indigo-300 hover:shadow-md"
                        }`}
                      >
                        {/* Badge Equipped */}
                        {inv.is_equipped && (
                          <div className="absolute top-3 right-3 bg-indigo-500 text-white p-1 rounded-full shadow-md z-10 animate-in zoom-in">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}

                        {/* AREA PREVIEW ITEM */}
                        <div
                          className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-1 transition-transform group-hover:scale-105 overflow-hidden ${
                            inv.is_equipped ? "bg-indigo-50/50" : "bg-slate-50"
                          }`}
                        >
                          {renderItemPreview(inv.item)}
                        </div>

                        {/* Text Info */}
                        <div className="w-full">
                          <h3
                            className={`font-bold text-sm truncate ${
                              inv.is_equipped
                                ? "text-indigo-700"
                                : "text-slate-700"
                            }`}
                          >
                            {inv.item.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                            {inv.item.description ||
                              "Item koleksi yang sangat langka."}
                          </p>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => !inv.is_equipped && handleEquip(inv)}
                          disabled={inv.is_equipped}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors mt-auto flex items-center justify-center gap-2 ${
                            inv.is_equipped
                              ? "bg-indigo-100 text-indigo-600 cursor-default"
                              : "bg-slate-800 text-white hover:bg-indigo-600 shadow-sm"
                          }`}
                        >
                          {inv.is_equipped ? (
                            <>{t("inventory.equipped")}</>
                          ) : (
                            <>{t("inventory.equip")}</>
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
