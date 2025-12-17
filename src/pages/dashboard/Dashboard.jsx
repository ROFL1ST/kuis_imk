import { useEffect, useState } from "react";
import { topicAPI, socialAPI } from "../../services/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Book, ChevronRight, Activity, Zap } from "lucide-react";

const Dashboard = () => {
  const [topics, setTopics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | QuizApp";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, feedRes] = await Promise.all([
          topicAPI.getAllTopics(),
          socialAPI.getFeed(),
        ]);
        setTopics(topicsRes.data.data);
        setActivities(feedRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <div className="text-center py-20">Memuat Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* === KOLOM KIRI (Mata Kuliah) === */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Book className="text-indigo-600" /> Topik Pembelajaran
          </h1>
          <p className="text-slate-500 mt-1">
            Pilih mata kuliah untuk memulai kuis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic, idx) => (
            <motion.div
              key={topic.ID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/topic/${topic.slug}`}>
                <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 transition-all cursor-pointer group h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Book size={20} />
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-1">
                      {topic.title}
                    </h2>
                    <p className="text-slate-500 text-sm line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* === KOLOM KANAN (Activity Feed) === */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="text-pink-500" /> Aktivitas Teman
          </h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Belum ada aktivitas terbaru.
              </p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.ID}
                  className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {act.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-bold">{act.user.name}</span>{" "}
                      {act.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Zap size={10} />{" "}
                      {act.type.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
