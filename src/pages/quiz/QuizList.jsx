import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PlayCircle, Trophy, ArrowLeft, Swords, X } from "lucide-react";
import { topicAPI, socialAPI } from "../../services/api";
import toast from "react-hot-toast";

const QuizList = () => {
  const { slug } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => {
    // Load Kuis & Teman sekaligus
    Promise.all([
      topicAPI.getQuizzesBySlug(slug),
      socialAPI.getFriends()
    ]).then(([quizRes, friendRes]) => {
      setQuizzes(quizRes.data.data || []);
      setFriends(friendRes.data.data || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const openChallengeModal = (quizId) => {
    setSelectedQuizId(quizId);
    setIsModalOpen(true);
  };

  const handleSendChallenge = async (friendUsername) => {
    try {
      await socialAPI.createChallenge({
        quiz_id: selectedQuizId,
        opponent_username: friendUsername
      });
      toast.success(`Tantangan dikirim ke ${friendUsername}!`);
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
      toast.error("Gagal mengirim tantangan.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6">
        <ArrowLeft size={18} /> Kembali ke Topik
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">Kuis: {slug}</h1>
          <p className="text-slate-500">Pilih kuis untuk mulai mengerjakan atau menantang teman.</p>
        </div>
        <Link 
          to={`/leaderboard/${slug}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-full font-bold hover:bg-yellow-200 transition"
        >
          <Trophy size={18} /> Leaderboard
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
            <div key={quiz.ID} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{quiz.title}</h3>
                <p className="text-slate-500">{quiz.description}</p>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => openChallengeModal(quiz.ID)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold hover:bg-orange-200 flex items-center justify-center gap-2 transition"
                >
                  <Swords size={18} /> Tantang
                </button>
                <Link 
                  to={`/play/${quiz.ID}`} 
                  state={{ title: quiz.title }} 
                  className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition"
                >
                  <PlayCircle size={18} /> Main
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === MODAL TANTANG TEMAN === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Swords className="text-orange-500" /> Pilih Lawan Duel
            </h2>
            
            {friends.length === 0 ? (
              <p className="text-slate-500 text-center py-6">
                Kamu belum punya teman untuk ditantang. <br/>
                <Link to="/friends" className="text-indigo-600 font-bold">Cari teman dulu yuk!</Link>
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {friends.map(friend => (
                  <button
                    key={friend.ID}
                    onClick={() => handleSendChallenge(friend.username)}
                    className="w-full text-left p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 flex justify-between items-center group transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {friend.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{friend.name}</p>
                        <p className="text-xs text-slate-400">@{friend.username}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizList;