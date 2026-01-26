import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { reviewAPI } from "../../services/newFeatures";
import { useLanguage } from "../../context/LanguageContext";

const ReviewModal = ({ isOpen, onClose, quizId, onSuccess }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error(t("modals.selectRating"));

    setLoading(true);
    try {
      const res = await reviewAPI.addReview(quizId, {
        rating: rating,
        comment: comment,
      });

      if (res.data.status == "success") {
        toast.success(t("modals.successReview"), { icon: "⭐" });
        onClose();
        if (onSuccess) onSuccess(); // Call parent callback
        setRating(0);
        setComment("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("modals.errorReview"));
    } finally {
      setLoading(false);
    }
  };

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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden">
              <div className="p-6 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {t("modals.reviewTitle")}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {t("modals.shareExperience")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredStar || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200 fill-gray-100"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("modals.commentLabel")}
                  </label>
                  <div className="relative">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("modals.placeholderComment")}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none h-24 text-gray-700"
                    />
                    <MessageSquare className="absolute top-3.5 left-3 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-yellow-500/30"
                >
                  {loading ? t("modals.sending") : t("modals.sendReview")}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
