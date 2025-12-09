import { useEffect, useState } from "react";
import { topicAPI } from "../../services/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Book, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    topicAPI.getAllTopics()
      .then((res) => setTopics(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Memuat Topik...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Topik Pembelajaran</h1>
        <p className="text-slate-500">Pilih mata kuliah untuk melihat kuis yang tersedia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, idx) => (
          <motion.div
            key={topic.ID}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={`/topic/${topic.slug}`}>
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Book size={24} />
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">{topic.title}</h2>
                <p className="text-slate-500 text-sm line-clamp-2">{topic.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;