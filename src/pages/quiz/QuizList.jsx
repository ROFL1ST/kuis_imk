import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PlayCircle, Trophy, ArrowLeft } from "lucide-react";
import { topicAPI } from "../../services/api";

const QuizList = () => {
  const { slug } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    topicAPI.getQuizzesBySlug(slug)
      .then((res) => setQuizzes(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6">
        <ArrowLeft size={18} /> Kembali ke Topik
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">Kuis: {slug}</h1>
          <p className="text-slate-500">Pilih kuis untuk mulai mengerjakan.</p>
        </div>
        <Link 
          to={`/leaderboard/${slug}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-full font-bold hover:bg-yellow-200 transition"
        >
          <Trophy size={18} /> Lihat Leaderboard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">Memuat Kuis...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-slate-500">Belum ada kuis di topik ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div key={quiz.ID} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{quiz.title}</h3>
                <p className="text-slate-500">{quiz.description}</p>
              </div>
              <Link 
                to={`/play/${quiz.ID}`} 
                state={{ title: quiz.title }} // Kirim title via state
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"
              >
                <PlayCircle size={18} /> Mulai
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;