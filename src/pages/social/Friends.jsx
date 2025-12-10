import { useEffect, useState } from "react";
import { socialAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  UserPlus,
  Trash2,
  User,
  Bell,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Modal from "../../components/ui/Modal"; // Import Modal
import { X } from "lucide-react";

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
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri - Sama seperti sebelumnya (tanpa perubahan) */}
      <div className="lg:col-span-1 space-y-6">
        {/* ... (Kode Form Add, Request Masuk, Request Terkirim tetap sama) ... */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
            <UserPlus size={20} className="text-indigo-600" /> Tambah Teman
          </h2>
          <form onSubmit={handleAddFriend}>
            <input
              type="text"
              placeholder="Username teman..."
              className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              Kirim Permintaan
            </button>
          </form>
        </div>

        {requests.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Bell size={20} className="text-amber-500" /> Permintaan Masuk
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            </h2>
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.ID}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        {req.requester.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        @{req.requester.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirmFriend(req.user_id)}
                      className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded hover:bg-indigo-700 transition"
                    >
                      Terima
                    </button>
                    <button
                      onClick={() => handleRefuseFriend(req.user_id)}
                      className="flex-1 bg-white border border-slate-300 text-slate-600 text-xs py-1.5 rounded hover:bg-slate-50 transition"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sentRequests.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Clock size={20} className="text-blue-500" /> Menunggu Konfirmasi
            </h2>
            <div className="space-y-3">
              {sentRequests.map((req) => (
                <div
                  key={req.ID}
                  className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <ArrowRight size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        {req.friend.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        @{req.friend.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelRequest(req.friend_id)}
                    className="text-slate-400 hover:text-red-500 transition p-1"
                    title="Batalkan Request"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kolom Kanan */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Daftar Teman{" "}
            <span className="text-slate-400 text-lg font-normal">
              ({friends.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Memuat data teman...
          </div>
        ) : friends.length === 0 ? (
          <div className="p-12 bg-slate-50 rounded-xl text-center border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} />
            </div>
            <p className="text-slate-500">Belum ada teman.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((user) => (
              <div
                key={user.ID}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => openDeleteModal(user)}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Hapus Teman"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === REUSABLE MODAL (KONFIRMASI HAPUS) === */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        maxWidth="max-w-sm"
      >
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Hapus Teman?</h2>
        </div>

        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          Apakah kamu yakin ingin menghapus{" "}
          <span className="font-bold text-slate-800">
            {confirmModal.friendName}
          </span>{" "}
          dari daftar temanmu?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            onClick={executeRemoveFriend}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
          >
            Ya, Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Friends;
