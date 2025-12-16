import { useEffect, useState } from "react";
import { socialAPI } from "../../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  UserPlus,
  Trash2,
  User,
  Bell,
  Clock,
  ArrowRight,
  AlertTriangle,
  X,
  Check,
  MessageSquare,
  MoreVertical,
  Construction, // Icon baru untuk indikator dev
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import UserHoverCard from "../../components/ui/UserHoverCard";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(true);

  // State Modal Konfirmasi
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    friendId: null,
    friendName: "",
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      socialAPI.getFriends(),
      socialAPI.getFriendRequests(),
      socialAPI.getSentRequests(),
    ])
      .then(([friendsRes, requestsRes, sentRes]) => {
        setFriends(friendsRes.data.data || []);
        setRequests(requestsRes.data.data || []);
        setSentRequests(sentRes.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat data sosial");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!usernameInput) return;
    try {
      await socialAPI.addFriend(usernameInput);
      toast.success("Permintaan pertemanan dikirim!");
      setUsernameInput("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim permintaan");
    }
  };

  const handleConfirmFriend = async (requesterId) => {
    try {
      await socialAPI.confirmFriend(requesterId);
      toast.success("Pertemanan diterima!");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menerima pertemanan");
    }
  };

  const handleRefuseFriend = async (requesterId) => {
    try {
      await socialAPI.refuseFriend(requesterId);
      toast.success("Permintaan ditolak");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menolak permintaan");
    }
  };

  const handleCancelRequest = async (friendId) => {
    try {
      await socialAPI.cancelRequest(friendId);
      toast.success("Permintaan dibatalkan");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal membatalkan permintaan");
    }
  };

  const openDeleteModal = (friend) => {
    setConfirmModal({
      isOpen: true,
      friendId: friend.ID,
      friendName: friend.name,
    });
  };

  const executeRemoveFriend = async () => {
    try {
      await socialAPI.removeFriend(confirmModal.friendId);
      toast.success("Teman dihapus");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menghapus teman");
    } finally {
      setConfirmModal({ isOpen: false, friendId: null, friendName: "" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header & Add Friend Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Social Hub</h1>
          <p className="text-slate-500">Kelola teman dan interaksi sosialmu</p>
        </div>

        <form
          onSubmit={handleAddFriend}
          className="flex w-full md:w-auto relative group"
        >
          <UserPlus
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition"
            size={18}
          />
          <input
            type="text"
            placeholder="Add by username..."
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-l-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none w-full md:w-64 transition-all"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
          <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-r-xl hover:bg-indigo-700 transition shadow-sm">
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === LEFT COLUMN: REQUEST === */}
        <div className="lg:col-span-4 space-y-6">
          {/* REQUEST MASUK */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="text-amber-500" size={18} /> Permintaan Masuk
              </span>
              {requests.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {requests.length}
                </span>
              )}
            </h2>

            {requests.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock size={24} className="mx-auto mb-2 opacity-50" />
                Tidak ada permintaan baru.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.ID}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 transition hover:border-indigo-100 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                        {req.requester?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">
                          {req.requester?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          @{req.requester?.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmFriend(req.user_id)}
                        className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-1"
                      >
                        <Check size={14} /> Terima
                      </button>
                      <button
                        onClick={() => handleRefuseFriend(req.user_id)}
                        className="flex-1 py-1.5 bg-white text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1"
                      >
                        <X size={14} /> Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REQUEST TERKIRIM */}
          {sentRequests.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="text-blue-500" size={18} /> Menunggu
                Konfirmasi
              </h2>
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div
                    key={req.ID}
                    className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                        <ArrowRight size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">
                          {req.friend?.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          @{req.friend?.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelRequest(req.friend_id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                      title="Batalkan"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* === RIGHT COLUMN: DAFTAR TEMAN === */}

        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <User className="text-indigo-600" /> Daftar Teman{" "}
              <span className="text-slate-400 text-sm font-normal">
                ({friends.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">
              Memuat teman...
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} />
              </div>
              <p className="text-slate-500">
                Belum ada teman. Tambahkan seseorang!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.ID}
                  className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-visible z-0 hover:z-10"
                >
                  {/* Tombol Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(friend);
                    }}
                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition z-20"
                    title="Hapus Teman"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* --- HOVER CARD WRAPPER --- */}
                  <UserHoverCard user={friend}>
                    <div className="flex items-center gap-4 mb-4 max-w-[300px]">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>

                      {/* Info User */}
                      <div className="flex-1 min-w-0 pr-8">
                        <h3 className="font-bold text-slate-800 truncate text-base group-hover:text-indigo-600 transition">
                          {friend.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          @{friend.username}
                        </p>

                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">
                          Lvl {friend.level || 1}
                        </span>
                      </div>
                    </div>
                  </UserHoverCard>

                  {/* Action Buttons Row */}
                  <div className="flex gap-2 relative z-10">
                    <Link
                      to={`/@${friend.username}`}
                      className="flex-1 py-2 text-center text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                    >
                      Lihat Profil
                    </Link>

                    {/* --- TOMBOL CHAT DISABLED --- */}
                    <button
                      disabled
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed rounded-lg"
                      title="Fitur ini dalam pengembangan"
                    >
                      <Construction size={14} />
                      Chat (Dev)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Delete */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, friendId: null, friendName: "" })
        }
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Hapus Teman?
          </h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Apakah Anda yakin ingin menghapus{" "}
            <span className="font-bold text-slate-800">
              {confirmModal.friendName}
            </span>{" "}
            dari daftar teman?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: false,
                  friendId: null,
                  friendName: "",
                })
              }
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={executeRemoveFriend}
              className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Friends;
