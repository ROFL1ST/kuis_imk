import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { quizAPI } from "../../services/api";
import { CheckCircle2, XCircle, ArrowLeft, Trophy, Swords } from "lucide-react";

const ReviewPage = () => {
  const { historyId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI
      .getHistoryById(historyId)
      .then((res) => setDetail(res.data.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [historyId]);

  useEffect(() => {
    if (!detail) return;
    document.title = `Review: ${detail.quiz_title} | QuizApp`;
  }, [detail]);

  if (loading)
    return (
      <div className="text-center py-20 text-slate-500">Memuat detail...</div>
    );
  if (!detail)
    return <div className="text-center py-20">Data tidak ditemukan</div>;

  const { quiz_title, score, questions, snapshot } = detail;
  const isDuel = quiz_title.includes("[DUEL]");
  // const cleanTitle = quiz_title.replace("[DUEL]", "").trim();
  const isPass = score >= 70;

  // Hitung ulang benar/salah manual jika API tidak menyediakan count
  let correctCount = 0;
  questions.forEach((q) => {
    if (snapshot[q.ID] === q.correct) correctCount++;
  });
  const wrongCount = questions.length - correctCount;
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Kembali ke Riwayat
      </Link>

      {/* HEADER CARD SUMMARY */}
      <div
        className={`bg-white rounded-3xl shadow-sm border overflow-hidden mb-8 relative p-8 text-center
        ${isPass ? "border-green-200" : "border-red-200"}
      `}
      >
        <div
          className={`absolute top-0 left-0 w-full h-1.5 ${
            isPass ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>

        <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 flex justify-center items-center gap-2">
          {isDuel ? (
            <>
              <Swords size={16} /> Duel Report
            </>
          ) : (
            "Quiz Report"
          )}
        </h2>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">{detail.quiz_title}</h1>

        <div className="flex justify-center items-center mb-6">
          <div
            className={`relative w-32 h-32 rounded-full flex items-center justify-center border-[6px] 
              ${
                isPass
                  ? "border-green-100 bg-green-50 text-green-600"
                  : "border-red-100 bg-red-50 text-red-500"
              }
            `}
          >
            <div className="text-center">
              <span className="block text-4xl font-black">{score}</span>
              <span className="text-xs font-bold opacity-70">POIN</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="text-xs text-green-600 font-bold uppercase">
              Benar
            </div>
            <div className="text-xl font-black text-green-700">
              {correctCount}
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <div className="text-xs text-red-600 font-bold uppercase">
              Salah
            </div>
            <div className="text-xl font-black text-red-700">{wrongCount}</div>
          </div>
        </div>
      </div>

      {/* QUESTION LIST */}
      <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">
        Detail Jawaban
      </h3>
      <div className="space-y-4">
        {questions.map((q, index) => {
          const userAnswer = snapshot[q.ID];
          const isCorrect = userAnswer === q.correct;

          return (
            <div
              key={q.ID}
              className={`bg-white p-5 rounded-xl border-l-4 shadow-sm ${
                isCorrect ? "border-l-green-500" : "border-l-red-500"
              }`}
            >
              <div className="flex gap-4">
                <div className="text-slate-400 font-bold text-sm pt-1">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800 mb-4">
                    {q.question}
                  </h3>

                  <div className="space-y-2">
                    {/* Jawaban User */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border 
                          ${
                            isCorrect
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "bg-red-50 border-red-200 text-red-800"
                          }
                       `}
                    >
                      <span className="text-sm font-medium">
                        <span className="opacity-70 text-xs uppercase mr-2">
                          Jawabanmu:
                        </span>
                        {userAnswer || "(Tidak dijawab)"}
                      </span>
                      {isCorrect ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <XCircle size={18} />
                      )}
                    </div>

                    {/* Kunci Jawaban (jika salah) */}
                    {!isCorrect && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                        <CheckCircle2 size={18} className="text-green-600" />
                        <span className="text-sm">
                          <span className="opacity-70 text-xs uppercase mr-2">
                            Kunci:
                          </span>
                          <span className="font-bold text-slate-800">
                            {q.correct}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewPage;
