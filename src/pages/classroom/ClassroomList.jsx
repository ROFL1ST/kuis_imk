import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { classroomAPI } from "../../services/newFeatures";
import { Plus, Users, BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ClassroomList = () => {
  const { t } = useLanguage();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await classroomAPI.getMyClassrooms();
      if (res.data.status === "success") {
        setClassrooms(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Gagal memuat data kelas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      const loadingToast = toast.loading("Bergabung ke kelas...");
      const res = await classroomAPI.joinClassroom(joinCode.toLowerCase());
      toast.dismiss(loadingToast);

      if (res.data.status === "success") {
        toast.success("Berhasil bergabung ke kelas!");
        setShowJoinModal(false);
        setJoinCode("");
        fetchClassrooms();
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Gagal bergabung ke kelas");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t("classroom.title")}
          </h1>
          <p className="text-gray-500">{t("classroom.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t("classroom.join")}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700">
            {t("classroom.noClass")}
          </h3>
          <p className="text-gray-500">{t("classroom.joinPromo")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.joining.map((classroom, index) => (
            <motion.div
              key={classroom.ID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/classrooms/${classroom.ID}`} className="block h-full">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold font-mono">
                      {classroom.code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {classroom.name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center justify-between text-gray-500 text-sm border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{t("classroom.members")}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Gabung Kelas
            </h2>
            <form onSubmit={handleJoinClass}>
              <input
                type="text"
                placeholder="Masukkan Kode Kelas (misal: ABC1234)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-center text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none mb-6 uppercase"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  Gabung
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassroomList;
