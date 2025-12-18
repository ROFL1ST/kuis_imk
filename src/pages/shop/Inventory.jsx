import { useEffect, useState } from "react";
import { shopAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import UserAvatar from "../../components/ui/UserAvatar"; // Import komponen Avatar baru
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Package, Shield, Check, Layout, Type } from "lucide-react";

const Inventory = () => {
  const { user, setUser } = useAuth();
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

  const handleEquip = async (userItem) => {
    try {
      await shopAPI.equipItem(userItem.item_id);

      const updatedInv = inventory.map((inv) => {
        if (inv.item.type === userItem.item.type) {
          return { ...inv, is_equipped: false };
        }
        return inv;
      });

      const finalInv = updatedInv.map((inv) =>
        inv.item_id === userItem.item_id ? { ...inv, is_equipped: true } : inv
      );

      setInventory(finalInv);

      const newEquippedItems = user.equipped_items
        ? [...user.equipped_items]
        : [];

      const filteredItems = newEquippedItems.filter(
        (i) => i.type !== userItem.item.type
      );

      filteredItems.push(userItem.item);

      setUser({ ...user, equipped_items: filteredItems });

      toast.success(`${userItem.item.name} dipakai!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memakai item");
    }
  };

  useEffect(() => {
    document.title = "Inventory | QuizApp";
  }, []);

  const filteredInventory =
    activeTab === "all"
      ? inventory
      : inventory.filter((inv) => inv.item.type === activeTab);

  if (loading)
    return <div className="p-12 text-center text-slate-500">Memuat Tas...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* === KOLOM KIRI: PREVIEW === */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-50 sticky top-24 text-center">
            <h2 className="font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
              <Shield className="text-indigo-600" /> Preview Tampilan
            </h2>

            {/* Preview Avatar Besar */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
                {/* Komponen UserAvatar akan otomatis merender frame dari Context 'user' */}
                <UserAvatar user={user} size="2xl" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user.name}
              </h3>
              <p className="text-slate-500 text-sm">@{user.username}</p>

              {/* Tampilkan Title yang sedang dipakai */}
              {user.equipped_items?.find((i) => i.type === "title") && (
                <div className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                  {user.equipped_items.find((i) => i.type === "title").name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === KOLOM KANAN: LIST BARANG === */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                <Package /> Inventory Saya
              </h1>
              <p className="text-slate-500 mt-1">
                Kelola koleksi item kerenmu.
              </p>
            </div>
          </div>

          {/* Tabs Kategori */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: "all", label: "Semua", icon: null },
              {
                id: "avatar_frame",
                label: "Bingkai",
                icon: <Layout size={14} />,
              },
              { id: "title", label: "Gelar", icon: <Type size={14} /> },
              // { id: 'theme', label: 'Tema', icon: <Palette size={14}/> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition border ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white border-slate-800 shadow-lg"
                    : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Grid Items */}
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
              <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                Belum ada item di kategori ini.
              </p>
              <p className="text-sm text-slate-400">
                Yuk belanja di Shop dulu!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredInventory.map((inv) => (
                <motion.div
                  key={inv.item_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                    inv.is_equipped
                      ? "border-green-500 ring-1 ring-green-500 shadow-green-100"
                      : "border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Icon / Preview Kecil */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center bg-slate-50 text-2xl border border-slate-100 relative overflow-hidden`}
                  >
                    {inv.item.type === "avatar_frame" ? (
                      // Hacky Preview untuk Frame di List
                      <div
                        className={`w-12 h-12 border-4 rounded-full ${
                          inv.item.asset_url === "frame_gold"
                            ? "border-yellow-400"
                            : "border-slate-300"
                        }`}
                      ></div>
                    ) : (
                      <span>{inv.item.asset_url || "✨"}</span>
                    )}

                    {inv.is_equipped && (
                      <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                        <Check className="text-green-600 drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800">
                        {inv.item.name}
                      </h3>
                      {inv.is_equipped && (
                        <span className="text-[10px] uppercase font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Dipakai
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {inv.item.description}
                    </p>

                    <button
                      onClick={() => !inv.is_equipped && handleEquip(inv)}
                      disabled={inv.is_equipped}
                      className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition ${
                        inv.is_equipped
                          ? "bg-slate-100 text-slate-400 cursor-default"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                      }`}
                    >
                      {inv.is_equipped ? "Sedang Dipakai" : "Pakai Item"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
