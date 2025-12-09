import { useEffect, useState } from "react";
import { socialAPI } from "../../services/api";
import toast from "react-hot-toast";
import { UserPlus, Trash2, User, Check, X, Bell } from "lucide-react";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]); // State untuk request masuk
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    // Fetch teman dan request secara paralel
    Promise.all([socialAPI.getFriends(), socialAPI.getFriendRequests()])
      .then(([friendsRes, requestsRes]) => {
        setFriends(friendsRes.data.data || []);
        setRequests(requestsRes.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat data teman");
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
      fetchData(); // Refresh data (opsional, siapa tau ada update status)
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim permintaan");
    }
  };

  const handleConfirmFriend = async (requesterId) => {
    try {
      await socialAPI.confirmFriend(requesterId);
      toast.success("Pertemanan diterima!");
      fetchData(); // Refresh list teman dan request
    } catch (err) {
      toast.error("Gagal menerima pertemanan");
    }
  };

  const handleRefuseFriend = async (requesterId) => {
    try {
      await socialAPI.refuseFriend(requesterId);
      toast.success("Permintaan ditolak");
      fetchData();
    } catch (err) {
      toast.error("Gagal menolak permintaan");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm("Hapus teman ini?")) return;
    try {
      await socialAPI.removeFriend(friendId);
      toast.success("Teman dihapus");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menghapus teman");
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Tambah Teman & Request Masuk */}
      <div className="lg:col-span-1 space-y-6">
        {/* Form Tambah Teman */}
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

        {/* List Request Masuk */}
        {requests.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Bell size={20} className="text-amber-500" /> Permintaan ({requests.length})
            </h2>
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.ID} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{req.requester.name}</p>
                      <p className="text-xs text-slate-500">@{req.requester.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirmFriend(req.user_id)}
                      className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1 hover:bg-indigo-700 transition"
                    >
                      <Check size={14} /> Terima
                    </button>
                    <button
                      onClick={() => handleRefuseFriend(req.user_id)}
                      className="flex-1 bg-white border border-slate-300 text-slate-600 text-xs py-1.5 rounded flex items-center justify-center gap-1 hover:bg-slate-50 transition"
                    >
                      <X size={14} /> Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kolom Kanan: Daftar Teman */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          Daftar Teman <span className="text-slate-400 text-lg font-normal">({friends.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat data teman...</div>
        ) : friends.length === 0 ? (
          <div className="p-12 bg-slate-50 rounded-xl text-center border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} />
            </div>
            <p className="text-slate-500">Belum ada teman. Yuk cari teman baru!</p>
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
                  onClick={() => handleRemoveFriend(user.ID)}
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
    </div>
  );
};

export default Friends;