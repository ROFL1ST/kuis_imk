// src/pages/shop/Shop.jsx
import { useEffect, useState } from "react";
import { shopAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Coins,
  CheckCircle,
  Lock,
  ArrowRight,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import UserAvatar from "../../components/ui/UserAvatar";
import Modal from "../../components/ui/Modal";

const Shop = () => {
  const { user, setUser } = useAuth(); // Kita butuh setUser untuk update koin real-time
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'avatar_frame', 'title'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([
        shopAPI.getItems(),
        shopAPI.getInventory(),
      ]);
      setItems(itemsRes.data.data);
      setInventory(invRes.data.data.map((inv) => inv.item_id)); // Simpan ID saja biar mudah cek
    } catch (error) {
      console.error("Failed to load shop", error);
    } finally {
      setLoading(false);
    }
  };

  const openBuyModal = (item) => {
    setSelectedItem(item);
    setIsBuyModalOpen(true);
  };

  const handleBuy = async (item) => {
    if (!selectedItem) return;

    if (user.coins < item.price) {
      toast.error("Koin tidak cukup!");
      return;
    }
    setConfirmLoading(true);
    console.log("Membeli item:", item);
    try {
      const res = await shopAPI.buyItem(item.ID);

      // Update UI lokal
      setInventory([...inventory, item.ID]);

      // Update User Coins di Context
      setUser({ ...user, coins: res.data.data.coins_left });

      toast.success(`Berhasil membeli ${selectedItem.name}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal membeli item");
    } finally {
      setConfirmLoading(false);
      setIsBuyModalOpen(false);
    }
  };

  useEffect(() => {
    document.title = "Shop | QuizApp";
  }, []);

  // Filter Item
  const filteredItems =
    activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  if (loading) return <div className="p-8 text-center">Loading Shop...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Shop */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag /> Item Shop
          </h1>
          <p className="opacity-90 mt-2">Tukarkan koinmu dengan item keren!</p>

          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
            <Coins className="text-yellow-300" />
            <span className="font-bold text-xl">{user?.coins} Coins</span>
          </div>
        </div>
        {/* Dekorasi */}
        <Coins className="absolute -right-10 -bottom-10 h-64 w-64 text-white/10 rotate-12" />
      </div>

      {/* Tabs Kategori */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "avatar_frame", "title"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-bold text-sm capitalize transition ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Grid Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isOwned = inventory.includes(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl p-4 shadow-sm border ${
                isOwned ? "border-green-200 bg-green-50/30" : "border-slate-100"
              } flex flex-col`}
            >
              {/* Preview Gambar / Icon */}
              <div className="h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group">
                {item.type === "avatar_frame" ? (
                  <div className="scale-150">
                    {" "}
                    {/* Perbesar agar jelas */}
                    <UserAvatar
                      user={{
                        name: user.name,
                        equipped_items: [
                          { type: "avatar_frame", asset_url: item.asset_url },
                        ],
                      }}
                      size="md"
                    />
                  </div>
                ) : (
                  <span className="text-4xl">{item.asset_url || "✨"}</span>
                )}

                {isOwned && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                {isOwned ? (
                  <button
                    disabled
                    className="w-full py-2 bg-green-100 text-green-700 font-bold rounded-lg text-sm cursor-default"
                  >
                    Dimiliki
                  </button>
                ) : (
                  <button
                    onClick={() => openBuyModal(item)}
                    disabled={user.coins < item.price}
                    className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition ${
                      user.coins >= item.price
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {user.coins < item.price ? (
                      <Lock size={14} />
                    ) : (
                      <Coins size={14} />
                    )}
                    {item.price}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Modal Konfirmasi Pembelian */}
      <Modal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        title="Konfirmasi Pembelian"
        maxWidth="max-w-sm" // Kita buat agak kecil agar rapi
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Preview Item */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
              <div className="mb-3">
                {/* Reuse logic preview avatar/icon disini jika mau, atau icon simple */}
                {selectedItem.type === "avatar_frame" ? (
                  <UserAvatar
                    user={{
                      name: user.name,
                      equipped_items: [
                        { type: "avatar_frame", asset_url: selectedItem.asset_url },
                      ],
                    }}
                    size="xl"
                  />
                ) : (
                  <span className="text-4xl">
                    {selectedItem.asset_url || "🎁"}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-800">
                {selectedItem.name}
              </h3>
              <p className="text-sm text-slate-500">
                {selectedItem.type.replace("_", " ")}
              </p>
            </div>

            {/* Kalkulasi Harga */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Wallet size={16} /> Saldo Saat Ini
                </span>
                <span className="font-bold text-slate-700">{user.coins}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Harga Item</span>
                <span className="font-bold text-red-500">
                  -{selectedItem.price}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Sisa Saldo</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      user.coins - selectedItem.price < 0
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {user.coins - selectedItem.price}
                  </span>
                  {/* Icon warning jika minus (optional safety) */}
                  {user.coins < selectedItem.price && (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsBuyModalOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleBuy(selectedItem)}
                disabled={user.coins < selectedItem.price}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Beli Sekarang <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Shop;
