import { useState, useEffect } from "react";
import { leaderboardAPI } from "../../services/newFeatures";
import { motion } from "framer-motion";
import { Medal, Trophy, User } from "lucide-react";

const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await leaderboardAPI.getGlobal();
        if (res.data.status === "success") {
          setLeaderboard(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Medal className="w-8 h-8 text-yellow-400" />;
    if (index === 1) return <Medal className="w-7 h-7 text-gray-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-400" />;
    return (
      <span className="text-xl font-bold text-gray-500">#{index + 1}</span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block p-4 rounded-full bg-yellow-100 mb-4"
        >
          <Trophy className="w-12 h-12 text-yellow-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-800">Global Leaderboard</h1>
        <p className="text-gray-500 mt-2">Top students across the platform</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No data available.
            </div>
          ) : (
            leaderboard.map((user, index) => (
              <motion.div
                key={user.ID || user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="w-12 flex justify-center items-center">
                  {getRankIcon(index)}
                </div>
                <div className="ml-4 flex-1 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200 overflow-hidden">
                    <User className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 font-mono">
                    {user.xp}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      XP
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">
                    LEVEL {user.level}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalLeaderboard;
