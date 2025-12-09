import { useEffect, useState } from "react";
import { socialAPI } from "../../services/api";
import toast from "react-hot-toast";
import { UserPlus, Trash2, User } from "lucide-react";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFriends = () => {
    socialAPI.getFriends().then((res) => {
      setFriends(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!usernameInput) return;
    try {
      await socialAPI.addFriend(usernameInput);
      toast.success("Teman berhasil ditambahkan!");
      setUsernameInput("");
      fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah teman");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm("Hapus teman ini?")) return;
    try {
      await socialAPI.removeFriend(friendId);
      toast.success("Teman dihapus");
      fetchFriends();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menghapus teman");
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Kolom Kiri: Tambah Teman */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-600" /> Tambah Teman
          </h2>
          <form onSubmit={handleAddFriend}>
            <input
              type="text"
              placeholder="Username teman..."
              className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
              Kirim Permintaan
            </button>
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Daftar Teman */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Daftar Teman ({friends.length})
        </h2>

        {loading ? (
          <div>Memuat...</div>
        ) : friends.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500">
            Belum ada teman.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((item) => (
              <div
                key={item.ID}
                className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {item.friend.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      @{item.friend.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFriend(item.friend_id)}
                  className="text-slate-400 hover:text-red-500 transition"
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
