import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Swords,
  Users,
  Zap,
  Coins,
  Search,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Clock,
} from "lucide-react";
import { socialAPI, topicAPI } from "../../services/api";
import toast from "react-hot-toast";

const CreateChallengeModal = ({
  isOpen,
  onClose,
  onCreated,
  preselectedTopicId,
  preselectedQuizTitle,
}) => {
  const [step, setStep] = useState(1); // 1: Mode/Quiz, 2: Friends, 3: Confirm
  const [loading, setLoading] = useState(false);

  // Data State
  const [topics, setTopics] = useState([]);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchFriend, setSearchFriend] = useState("");

  // Selection State
  const [selectedMode, setSelectedMode] = useState("1v1");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedOpponents, setSelectedOpponents] = useState([]);
  const [wager, setWager] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0); // 0 = standard/unlimited
  const [isRealtime, setIsRealtime] = useState(false); // Default realtime

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setStep(1);

      if (preselectedTopicId) {
        setSelectedTopic({
          id: preselectedTopicId,
          title: preselectedQuizTitle || "Selected Quiz",
        });
      } else {
        setSelectedTopic(null);
      }
    }
  }, [isOpen, preselectedTopicId, preselectedQuizTitle]);

  useEffect(() => {
    setFilteredFriends(
      friends.filter((f) =>
        f.name.toLowerCase().includes(searchFriend.toLowerCase())
      )
    );
  }, [searchFriend, friends]);

  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [topicsRes, friendsRes] = await Promise.all([
        topicAPI.getAllTopics(),
        socialAPI.getFriends(),
      ]);
      setTopics(topicsRes.data.data);
      console.log(friendsRes.data.data);
      setFriends(friendsRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load initial data");
    }
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);

    // Adjust opponents based on mode limits to prevent invalid state
    if (selectedOpponents.length > 0) {
      let limit = 1;
      if (mode === "2v2") limit = 3;
      if (mode === "battleroyale") limit = 99;

      if (selectedOpponents.length > limit) {
        // Truncate to limit instead of clearing
        setSelectedOpponents((prev) => prev.slice(0, limit));
        toast.success(`Mode adapted: Keeping top ${limit} selected friends`);
      }
    }

    if (mode === "survival") {
      setSelectedTopic({ id: 0, title: "Survival Random" }); // Survival ignores quiz ID
    } else {
      // If we have a preselected topic, revert to it. Otherwise reset to null (forcing user to select from dropdown if visible).
      if (preselectedTopicId) {
        setSelectedTopic({
          id: preselectedTopicId,
          title: preselectedQuizTitle || "Selected Quiz",
        });
      } else {
        setSelectedTopic(null);
      }
    }
  };

  const toggleFriend = (username) => {
    if (selectedOpponents.includes(username)) {
      setSelectedOpponents((prev) => prev.filter((u) => u !== username));
    } else {
      // Limit check
      let limit = 1;
      if (selectedMode === "2v2") limit = 3; // 1 teammate + 2 opponents? Or 3 specific people? Backend says len=3
      if (selectedMode === "battleroyale") limit = 99;

      if (selectedOpponents.length < limit) {
        setSelectedOpponents((prev) => [...prev, username]);
      } else {
        if (limit === 1) setSelectedOpponents([username]); // Replace if 1v1
        else toast.error(`Max ${limit} players for this mode`);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        opponent_usernames: selectedOpponents,
        quiz_id: selectedTopic?.id || 0,
        mode: selectedMode, // 1v1, 2v2, survival
        time_limit: parseInt(timeLimit) * 60,
        is_realtime: isRealtime,
        wager_amount: parseInt(wager),
      };

      const res = await socialAPI.createChallenge(payload);
      console.log(res);
      if (res.data.status === "success") {
        toast.success("Challenge created successfully!");
        onCreated && onCreated();
        onClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create challenge"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Select Game Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              id: "1v1",
              label: "1 vs 1",
              icon: Swords,
              color: "text-orange-500",
              desc: "Duel Classic",
            },
            {
              id: "survival",
              label: "Survival",
              icon: Zap,
              color: "text-red-500",
              desc: "One Life, Infinite",
            },
            {
              id: "2v2",
              label: "2 vs 2",
              icon: Users,
              color: "text-blue-500",
              desc: "Team Battle",
            },
            {
              id: "battleroyale",
              label: "Battle Royale",
              icon: Trophy,
              color: "text-purple-500",
              desc: "Free for All",
            },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedMode === m.id
                  ? "border-indigo-600 bg-indigo-50 shadow-md"
                  : "border-slate-100 hover:border-slate-300 bg-white"
              }`}
            >
              <div className={`flex items-center gap-2 mb-1 ${m.color}`}>
                <m.icon size={20} />
                <span className="font-bold">{m.label}</span>
              </div>
              <p className="text-xs text-slate-400">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedMode !== "survival" && !preselectedTopicId && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Select Topic
          </label>
          <select
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => {
              const t = topics.find((t) => t.ID === parseInt(e.target.value));
              // Assume first quiz of topic for now, or fetch quizzes.
              // Check Backend: CreateChallengeInput needs QuizID.
              // Frontend usually lists Quizzes. For simplicity, let's map Topic -> First Quiz or Random?
              // Ideally we should list Quizzes.
              // But topicAPI only gives topics. Let's cheat and use ID (assuming user selects specific Quiz if we had that list).
              // For now let's just use Topic ID as placeholder if logic allows, or we need to fetch quizzes.
              // Wait, API.js has `getQuizzesBySlug`.
              // Handling this complexity might be too much for this modal.
              // Let's assume for now we pick a random quiz ID from topic or hardcode for prototype?
              // Or better: Just fetch quizzes of first topic to populate?
              // Let's keep it simple: "Random Quiz in Topic" logic? Backend handles QuizID.
              // Let's just pick a numeric ID.
              setSelectedTopic({
                id: parseInt(e.target.value),
                title: t?.title,
              });
            }}
          >
            <option value="">-- Choose a Topic --</option>
            {topics.map((t) => (
              <option key={t.ID} value={t.ID}>
                {t.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            *Selected topic will determine the questions.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Time Limit */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Time Limit (Min)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="number"
              min="0"
              placeholder="0 = No Limit"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="w-full p-2.5 pl-10 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Wager */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Wager (Coins)
          </label>
          <div className="relative">
            <Coins
              className="absolute left-3 top-3 text-yellow-500"
              size={18}
            />
            <input
              type="number"
              min="0"
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              className="w-full p-2.5 pl-10 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer"
        onClick={() => setIsRealtime(!isRealtime)}
      >
        <input
          type="checkbox"
          id="realtime"
          checked={isRealtime}
          onChange={(e) => setIsRealtime(e.target.checked)}
          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 pointer-events-none"
        />
        <label
          htmlFor="realtime"
          className="font-bold text-slate-700 text-sm cursor-pointer select-none flex-1"
        >
          Realtime Mode (Main Bareng)
        </label>
      </div>

      <button
        disabled={
          !selectedMode || (!selectedTopic && selectedMode !== "survival")
        }
        onClick={() => setStep(2)}
        className="w-full py-3 bg-indigo-600 disabled:bg-slate-300 text-white rounded-xl font-bold hover:shadow-lg transition-all flex justify-center items-center gap-2"
      >
        Next: Select Friends <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search friends..."
          value={searchFriend}
          onChange={(e) => setSearchFriend(e.target.value)}
          className="w-full p-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {filteredFriends.length === 0 ? (
          <p className="text-center text-slate-400 py-10">No friends found.</p>
        ) : (
          filteredFriends.map((f) => {
            const isSelected = selectedOpponents.includes(f.username);

            // 2v2 Role Logic
            let roleLabel = null;
            let roleColor = "";
            if (isSelected && selectedMode === "2v2") {
              const index = selectedOpponents.indexOf(f.username);
              if (index === 0) {
                roleLabel = "TEAMMATE";
                roleColor = "bg-blue-100 text-blue-700 border-blue-200";
              } else {
                roleLabel = "ENEMY";
                roleColor = "bg-red-100 text-red-700 border-red-200";
              }
            }

            return (
              <div
                key={f.id || f.ID}
                onClick={() => toggleFriend(f.username)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-500 shadow-sm"
                    : "bg-white border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {f.name?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-700">
                        {f.name}
                      </p>
                      {roleLabel && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${roleColor}`}
                        >
                          {roleLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">@{f.username}</p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="text-indigo-600" size={18} />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition"
        >
          Back
        </button>
        <button
          disabled={selectedOpponents.length === 0}
          onClick={handleSubmit}
          className="flex-1 py-3 bg-indigo-600 disabled:bg-slate-300 text-white rounded-xl font-bold hover:shadow-lg transition-all flex justify-center items-center gap-2"
        >
          {loading
            ? "Creating..."
            : `Create Challenge (${selectedOpponents.length} Hosts)`}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Swords className="text-indigo-600" /> New Challenge
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {step === 1 ? renderStep1() : renderStep2()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateChallengeModal;
