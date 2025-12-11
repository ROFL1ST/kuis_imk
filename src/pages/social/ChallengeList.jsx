import { useEffect, useState } from "react";
import { socialAPI } from "../../services/api";
import { Link } from "react-router-dom";
import {
  Swords,
  Clock,
  CheckCircle2,
  PlayCircle,
  Trophy,
  XCircle,
  Crown,
  Frown,
  MinusCircle,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";

const ChallengeList = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = () => {
    socialAPI
      .getMyChallenges()
      .then((res) => setChallenges(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id) => {
    try {
      await socialAPI.acceptChallenge(id);
      toast.success("Tantangan diterima!");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menerima tantangan");
    }
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    challengeId: null,
    challengerName: "",
  });

  const handleRefuse = async () => {
    try {
      await socialAPI.refuseChallenge(confirmModal.challengeId);
      toast.success("Tantangan ditolak.");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Gagal menolak tantangan");
    } finally {
      setConfirmModal({ challengeId: null, challengerName: "", isOpen: false });
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 font-medium text-slate-500">
        Memuat arena duel...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
        <Swords className="text-orange-600" size={32} /> Arena Duel
      </h1>
      <p className="text-slate-500 mb-8">Riwayat dan tantangan aktifmu.</p>
      {challenges.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
          <Swords size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">
            Belum ada duel aktif
          </h3>
          <p className="text-slate-500 mb-6">
            Tantang temanmu dari halaman Kuis!
          </p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            Cari Lawan
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {challenges.map((duel) => {
            const isMeChallenger = duel.challenger_id === user.ID;
            const myScore = isMeChallenger
              ? duel.challenger_score
              : duel.opponent_score;
            const enemyScore = isMeChallenger
              ? duel.opponent_score
              : duel.challenger_score;
            const enemy = isMeChallenger ? duel.opponent : duel.challenger;

            const isPending = duel.status === "pending";
            const isActive = duel.status === "active";
            const isFinished = duel.status === "finished";
            const isRejected = duel.status === "rejected";
            const iHavePlayed = myScore !== -1;

            const amIWinner = isFinished && duel.winner_id === user.ID;
            const isDraw = isFinished && duel.winner_id === null;
            const amILoser = isFinished && !amIWinner && !isDraw;

            if (isFinished) {
              return (
                <div
                  key={duel.ID}
                  className={`relative overflow-hidden rounded-2xl shadow-md border-2 p-6 transition-all hover:shadow-xl
                  ${
                    amIWinner
                      ? "bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-400"
                      : isDraw
                      ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300"
                      : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 grayscale-[30%]"
                  }`}
                >
                  {amIWinner && (
                    <Trophy
                      className="absolute -top-6 -right-6 text-yellow-200 opacity-50 rotate-12"
                      size={120}
                      fill="currentColor"
                    />
                  )}
                  {amILoser && (
                    <Frown
                      className="absolute -top-6 -right-6 text-slate-200 opacity-50 -rotate-12"
                      size={120}
                    />
                  )}

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        <Clock size={14} /> Selesai pada{" "}
                        {new Date(duel.UpdatedAt).toLocaleDateString()}
                      </div>

                      {amIWinner ? (
                        <h3 className="text-3xl font-black text-yellow-700 flex items-center justify-center md:justify-start gap-2 mb-1 animate-pulse">
                          <Crown size={32} fill="currentColor" /> VICTORY!
                        </h3>
                      ) : isDraw ? (
                        <h3 className="text-3xl font-black text-blue-700 flex items-center justify-center md:justify-start gap-2 mb-1">
                          <MinusCircle size={32} /> SERI / DRAW
                        </h3>
                      ) : (
                        <h3 className="text-3xl font-black text-slate-600 flex items-center justify-center md:justify-start gap-2 mb-1">
                          <Frown size={32} /> DEFEAT
                        </h3>
                      )}

                      <p className="text-lg font-medium text-slate-600">
                        Duel{" "}
                        <span className="font-bold">{duel.quiz?.title}</span> vs{" "}
                        {enemy?.name}
                      </p>
                    </div>

                    <div className="flex items-end gap-8 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-sm">
                      <div className="flex flex-col items-center">
                        {amIWinner && (
                          <Crown
                            size={28}
                            className="text-yellow-500 mb-1 animate-bounce-slow"
                            fill="currentColor"
                          />
                        )}
                        <span
                          className={`text-5xl font-black leading-none ${
                            amIWinner
                              ? "text-yellow-600 scale-110"
                              : "text-slate-500"
                          }`}
                        >
                          {myScore}
                        </span>
                        <span className="text-xs font-bold text-slate-500 mt-2 tracking-widest">
                          KAMU
                        </span>
                      </div>

                      <div className="text-3xl text-slate-300 font-thin pb-2">
                        :
                      </div>

                      <div className="flex flex-col items-center relative">
                        {amILoser && (
                          <Crown
                            size={28}
                            className="text-yellow-500 mb-1"
                            fill="currentColor"
                          />
                        )}
                        <span
                          className={`text-5xl font-black leading-none ${
                            amILoser
                              ? "text-yellow-600 scale-110"
                              : "text-slate-500"
                          }`}
                        >
                          {enemyScore}
                        </span>
                        <span className="text-xs font-bold text-slate-500 mt-2 tracking-widest truncate w-24 text-center">
                          {enemy?.name?.split(" ")[0].toUpperCase()}
                        </span>
                        {amIWinner && (
                          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transform rotate-12">
                            KALAH
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={duel.ID}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 transition hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <Clock size={12} />{" "}
                    {new Date(duel.CreatedAt).toLocaleDateString()} •{" "}
                    {duel.quiz?.title}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <span className="text-slate-400 font-normal text-sm">
                      VS
                    </span>
                    {enemy ? enemy.name : "Loading..."}
                    <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      @{enemy ? enemy.username : "?"}
                    </span>
                  </h3>

                  {isPending ? (
                    isMeChallenger ? (
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock size={16} /> Menunggu {enemy?.name} Menerima...
                      </span>
                    ) : (
                      <span className="text-orange-600 font-bold flex items-center gap-1 animate-pulse">
                        <Swords size={16} /> {enemy?.name} Menantangmu!
                      </span>
                    )
                  ) : isRejected ? (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <XCircle size={16} /> Tantangan Ditolak
                    </span>
                  ) : (
                    <span className="text-indigo-600 font-bold flex items-center gap-1">
                      <Swords size={16} /> Duel Aktif!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-lg border border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold mb-1">
                      KAMU
                    </p>
                    <p
                      className={`text-3xl font-black ${
                        myScore === -1 ? "text-slate-300" : "text-indigo-600"
                      }`}
                    >
                      {myScore === -1 ? "-" : myScore}
                    </p>
                  </div>
                  <div className="text-slate-300 font-light text-2xl pb-1">
                    :
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold mb-1 truncate w-20">
                      {enemy?.name?.split(" ")[0]}
                    </p>
                    <p
                      className={`text-3xl font-black ${
                        enemyScore === -1 ? "text-slate-300" : "text-red-500"
                      }`}
                    >
                      {enemyScore === -1 ? "-" : enemyScore}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex gap-2 font-bold">
                  {/* isRejected → hanya tampil badge */}
                  {isRejected && (
                    <button
                      disabled
                      className="w-full px-5 py-3 bg-red-50 text-red-400 border border-red-100 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} /> Ditolak
                    </button>
                  )}

                  {/* Pending */}
                  {!isRejected && isPending && (
                    <>
                      {isMeChallenger ? (
                        <button
                          disabled
                          className="w-full px-5 py-3 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Clock size={20} /> Menunggu
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAccept(duel.ID)}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                          >
                            <CheckCircle2 size={20} /> Terima
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                challengeId: duel.ID,
                                challengerName: enemy?.name,
                              })
                            }
                            className="flex-1 px-4 py-3 bg-white border-2 border-red-100 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-300 flex items-center justify-center gap-2 transition-all"
                          >
                            <XCircle size={20} /> Tolak
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* Active */}
                  {!isRejected && isActive && (
                    <>
                      {!iHavePlayed ? (
                        <Link
                          to={`/play/${duel.quiz_id}`}
                          state={{
                            title: duel.quiz?.title,
                            isChallenge: true,
                          }}
                          className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all animate-pulse"
                        >
                          <PlayCircle size={20} /> MAINKAN SEKARANG
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full px-6 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <CheckCircle2 size={20} /> Menunggu Lawan
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        maxWidth="max-w-sm"
      >
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Tolak Tantangan?</h2>
        </div>

        <p className="text-slate-600 mb-6 text-base leading-relaxed">
          Apakah kamu yakin ingin menolak tantangan dari{" "}
          <span className="font-bold text-slate-800">
            {confirmModal.challengerName}
          </span>{" "}
          ?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            onClick={handleRefuse}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
          >
            Ya, Hapus
          </button>
        </div>
      </Modal>
      F
    </div>
  );
};

export default ChallengeList;
