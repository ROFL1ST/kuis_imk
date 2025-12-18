import { useEffect, useState } from "react";
import { socialAPI, userAPI } from "../../services/api"; // userAPI untuk search
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  UserPlus,
  Trash2,
  User,
  Bell,
  Clock,
  X,
  Check,
  Construction,
  Search, // Icon Search
  Users,
  Loader2,
  UserCheck,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import UserHoverCard from "../../components/ui/UserHoverCard";
import UserAvatar from "../../components/ui/UserAvatar";
import { useAuth } from "../../hooks/useAuth";

const Friends = () => {
  const { user } = useAuth();
  // Data State
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Search State (Global)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // Mode pencarian aktif?

  const [loading, setLoading] = useState(true);

  // Modal Delete
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    friendId: null,
    friendName: "",
  });

  useEffect(() => {
    document.title = "Sosial | QuizApp";
    fetchData();
  }, []);

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

  // --- HANDLER SEARCH USER (Global) ---
  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true); // Aktifkan mode pencarian (mengganti tampilan kanan)
    setSearchResults([]); // Kosongkan hasil lama

    try {
      // Pastikan endpoint ini sudah ada di api.js
      const res = await userAPI.searchUsers(searchQuery);
      setSearchResults(res.data.data || []);
    } catch (error) {
      toast.error("User tidak ditemukan");
    }
  };

  // Handler untuk mereset pencarian dan kembali ke daftar teman
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  // --- HANDLER ADD FRIEND (Dari Hasil Search) ---
  const handleAddFriend = async (targetUsername) => {
    try {
      await socialAPI.addFriend(targetUsername);
      toast.success(`Permintaan dikirim ke @${targetUsername}`);
      // Refresh data sent requests agar status tombol berubah
      const sentRes = await socialAPI.getSentRequests();
      setSentRequests(sentRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim permintaan");
    }
  };

  // --- HANDLERS EXISTING ---
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      {/* === HEADER SECTION BARU (Gradient & Search) === */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-indigo-200" size={32} /> Social Hub
            </h1>
            <p className="text-indigo-100 mt-2 max-w-md">
              Cari teman baru dan kelola interaksi sosialmu.
            </p>
          </div>

          {/* SEARCH BAR (Menggantikan form add friend lama) */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg">
            <label className="block text-xs font-bold text-indigo-200 mb-2 uppercase tracking-wide">
              Cari User Baru
            </label>
            <form
              onSubmit={handleGlobalSearch}
              className="flex relative group w-full md:w-80"
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari username..."
                className="pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-l-xl focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 w-full transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Tombol Clear Search */}
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              )}

              <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-r-xl hover:bg-indigo-50 transition shadow-lg">
                Cari
              </button>
            </form>
          </div>
        </div>
        <Users className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === KOLOM KIRI (TETAP SAMA): REQUEST === */}
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
                    key={req.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 transition hover:border-indigo-100 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden mb-3">
                      <UserAvatar user={req.user} size="md" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">
                          {req.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          @{req.user?.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleConfirmFriend(req.user.ID || req.user.id)
                        }
                        className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-1"
                      >
                        <Check size={14} /> Terima
                      </button>
                      <button
                        onClick={() =>
                          handleRefuseFriend(req.user.ID || req.user.id)
                        }
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
                    key={req.ID || req.id}
                    className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <UserAvatar user={req.friend} size="md" />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">
                          {req.friend?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
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

        {/* === KOLOM KANAN (GANTI KONTEN JIKA SEARCHING) === */}
        <div className="lg:col-span-8">
          {/* Header Section Kanan */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {isSearching ? (
                <>
                  <Search className="text-indigo-600" /> Hasil Pencarian
                  <span className="text-slate-400 text-sm font-normal">
                    "{searchQuery}"
                  </span>
                </>
              ) : (
                <>
                  <User className="text-indigo-600" /> Daftar Teman
                  <span className="text-slate-400 text-sm font-normal bg-slate-100 px-2 py-0.5 rounded-full">
                    {friends.length}
                  </span>
                </>
              )}
            </h2>

            {/* Tombol Close Search jika sedang searching */}
            {isSearching && (
              <button
                onClick={clearSearch}
                className="text-sm text-red-500 font-bold hover:underline flex items-center gap-1"
              >
                <X size={14} /> Tutup Pencarian
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <Loader2 className="animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {isSearching ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500">User tidak ditemukan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults
                      .filter((userResult) => userResult.ID !== user.ID) 
                      .map((userResult) => {
                        // Cek Status Hubungan
                        const isSent = sentRequests.some(
                          (s) => s.friend_id === userResult.ID
                        );
                        const isFriend = friends.some(
                          (f) => f.id === userResult.ID
                        );
                        const isIncoming = requests.some(
                          (r) => (r.user_id || r.user?.ID) === userResult.ID
                        );

                        return (
                       
                          <div
                            key={userResult.id}
                            className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-visible z-0 hover:z-10"
                          >
                            {/* Perbedaan 1: Tidak ada tombol hapus (Trash Icon) di sini */}

                            <UserHoverCard user={userResult}>
                              <div className="flex items-center gap-4 mb-4 max-w-[300px]">
                                <div className="relative flex-shrink-0">
                                  <UserAvatar user={userResult} size="lg" />
                                  {/* Visual indicator online status (disamakan dgn friend list) */}
                                  <div className="absolute z-20 bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                  <h3 className="font-bold text-slate-800 truncate text-base group-hover:text-indigo-600 transition">
                                    {userResult.name}
                                  </h3>
                                  <p className="text-xs text-slate-500 truncate">
                                    @{userResult.username}
                                  </p>
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">
                                    Lvl {userResult.level || 1}
                                  </span>
                                </div>
                              </div>
                            </UserHoverCard>

                            {/* Perbedaan 2: Tombol Aksi bawah disesuaikan (Lihat Profil + Add/Status) */}
                            <div className="flex gap-2 relative z-10">
                              <Link
                                to={`/@${userResult.username}`}
                                className="flex-1 py-2 text-center text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                              >
                                Lihat Profil
                              </Link>

                              {/* Logic Tombol Kanan menggantikan tombol "Chat" */}
                              <div className="flex-1">
                                {isFriend ? (
                                  <button
                                    disabled
                                    className="w-full h-full bg-green-50 text-green-600 rounded-lg text-xs font-bold cursor-default flex items-center justify-center gap-1 border border-green-100"
                                  >
                                    <UserCheck size={14} /> Teman
                                  </button>
                                ) : isSent ? (
                                  <button
                                    disabled
                                    className="w-full h-full bg-orange-50 text-orange-500 rounded-lg text-xs font-bold cursor-default flex items-center justify-center gap-1 border border-orange-100"
                                  >
                                    <Clock size={14} /> Pending
                                  </button>
                                ) : isIncoming ? (
                                  <button
                                    disabled
                                    className="w-full h-full bg-blue-50 text-blue-500 rounded-lg text-xs font-bold cursor-default flex items-center justify-center gap-1 border border-blue-100"
                                  >
                                    <Bell size={14} /> Cek Request
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleAddFriend(userResult.username)
                                    }
                                    className="w-full h-full bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    <UserPlus size={14} /> Add
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )
              ) : // === MODE DAFTAR TEMAN (DEFAULT) ===
              friends.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={32} />
                  </div>
                  <p className="text-slate-500">
                    Belum ada teman. Cari user baru di kolom pencarian di atas!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.ID || friend.id}
                      className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-visible z-0 hover:z-10"
                    >
                      {/* Tombol Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({
                            isOpen: true,
                            friendId: friend.id || friend.ID,
                            friendName: friend.name,
                          });
                        }}
                        className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition z-20"
                        title="Hapus Teman"
                      >
                        <Trash2 size={16} />
                      </button>

                      <UserHoverCard user={friend}>
                        <div className="flex items-center gap-4 mb-4 max-w-[300px]">
                          <div className="relative flex-shrink-0">
                            <UserAvatar user={friend} size="lg" />
                            <div className="absolute z-20 bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
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

                      <div className="flex gap-2 relative z-10">
                        <Link
                          to={`/@${friend.username}`}
                          className="flex-1 py-2 text-center text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                        >
                          Lihat Profil
                        </Link>
                        <button
                          disabled
                          className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed rounded-lg"
                        >
                          <Construction size={14} /> Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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
