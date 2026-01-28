import { useState, useEffect } from "react";
import { socialAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import Modal from "./Modal";
import { Search, UserPlus, CheckCircle2, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

const InviteFriendModal = ({
  isOpen,
  onClose,
  challengeId,
  currentPlayers = [],
}) => {
  const { t } = useLanguage();
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(null); // username of friend being invited

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  useEffect(() => {
    setFilteredFriends(
      friends.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, friends]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const res = await socialAPI.getFriends();
      setFriends(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(t("social.friendList") + " error"); // Simplified fallback
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (friend) => {
    setInviting(friend.username);
    try {
      await socialAPI.inviteToLobby(challengeId, friend.username); // Need to implement this
      toast.success(`${t("challenge.inviteFriend")} ${friend.name}`);
    } catch (err) {
      console.error(err);
      toast.error(t("review.failed") || "Gagal mengundang");
    } finally {
      setInviting(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <UserPlus className="text-indigo-600" /> {t("challenge.inviteFriend")}
        </h3>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t("createChallenge.searchFriend")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-indigo-600" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center text-slate-400 py-10">
            {t("createChallenge.noFriends")}
          </div>
        ) : (
          filteredFriends.map((f) => {
            const isAlreadyIn = currentPlayers.some((p) => p.user_id === f.id); // Check ID match
            return (
              <div
                key={f.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {f.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-700">{f.name}</p>
                    <p className="text-[10px] text-slate-400">@{f.username}</p>
                  </div>
                </div>
                {isAlreadyIn ? (
                  <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                    Joined
                  </span>
                ) : (
                  <button
                    onClick={() => handleInvite(f)}
                    disabled={inviting === f.username}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
                  >
                    {inviting === f.username ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <UserPlus size={14} />
                    )}
                    {t("challenge.inviteFriend").split(" ")[0]}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};

export default InviteFriendModal;
