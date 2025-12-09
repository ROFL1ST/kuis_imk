import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { quizAPI } from "../../services/api";
import { CheckCircle2, XCircle } from "lucide-react";

const ReviewPage = () => {
  const { historyId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.getHistoryById(historyId)
      .then((res) => setDetail(res.data.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [historyId]);

  if (loading) return <div className="text-center py-10">Mengambil data...</div>;
  if (!detail) return <div className="text-center py-10">Data tidak ditemukan</div>;

  const { quiz_title, questions, snapshot } = detail;
  console.log(detail);
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">{quiz_title}</h1>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const userAnswer = snapshot[q.ID];
          const isCorrect = userAnswer === q.correct;

          return (
            <div key={q.ID} className="bg-white p-5 rounded-xl shadow border">
              <h3 className="font-bold text-lg mb-3">
                {index + 1}. {q.question}
              </h3>

              {q.options.map((opt, idx) => {
                const selected = userAnswer === opt;
                const correct = q.correct === opt;

                return (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg mb-2 flex items-center justify-between
                      ${selected ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}
                      ${correct ? "bg-green-50 border-green-400" : ""}
                    `}
                  >
                    <span>{opt}</span>

                    {correct && <CheckCircle2 className="text-green-600" />}
                    {selected && !correct && <XCircle className="text-red-600" />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewPage;
