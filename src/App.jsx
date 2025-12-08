import React, { useState, useEffect } from 'react';
import { quizData } from './data/data';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, RefreshCw, Eye, ArrowLeft, User, History, Trophy, Lightbulb } from 'lucide-react';

const getStorage = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  if (!saved) return defaultValue;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return defaultValue;
  }
};

function App() {
  const [gameState, setGameState] = useState(() => getStorage('quiz_gameState', 'intro')); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => getStorage('quiz_index', 0));
  const [answers, setAnswers] = useState(() => getStorage('quiz_answers', {}));
  const [userName, setUserName] = useState(() => getStorage('quiz_username', ''));
  const [quizHistory, setQuizHistory] = useState(() => getStorage('quiz_history_data', []));
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  
  // State baru untuk Hint
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    localStorage.setItem('quiz_gameState', JSON.stringify(gameState));
    localStorage.setItem('quiz_index', JSON.stringify(currentQuestionIndex));
    localStorage.setItem('quiz_answers', JSON.stringify(answers));
    localStorage.setItem('quiz_username', JSON.stringify(userName));
  }, [gameState, currentQuestionIndex, answers, userName]);

  useEffect(() => {
    localStorage.setItem('quiz_history_data', JSON.stringify(quizHistory));
  }, [quizHistory]);

  // Reset hint setiap kali ganti soal
  useEffect(() => {
    setShowHint(false);
  }, [currentQuestionIndex]);

  const handleStart = () => {
    if (!userName.trim()) {
      alert("Mohon masukkan nama terlebih dahulu!");
      return;
    }
    setGameState('quiz');
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = (currentAnswers) => {
    let score = 0;
    quizData.mcq.forEach(q => {
      if (currentAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.mcq.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    const finalScore = calculateScore(answers);
    const newHistoryEntry = {
      id: Date.now(),
      date: new Date().toLocaleString('id-ID'),
      name: userName,
      score: finalScore,
      totalMcq: quizData.mcq.length,
      savedAnswers: answers
    };

    setQuizHistory(prev => [newHistoryEntry, ...prev]);
    setGameState('review');
  };

  const handleRestart = () => {
    localStorage.removeItem('quiz_gameState');
    localStorage.removeItem('quiz_index');
    localStorage.removeItem('quiz_answers');
    localStorage.removeItem('quiz_username');
    
    setAnswers({});
    setUserName('');
    setGameState('intro');
    setCurrentQuestionIndex(0);
    setShowHint(false);
  };

  const handleViewHistoryDetail = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setGameState('history_review');
  };

  // --- RENDER COMPONENTS ---

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-6 text-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-lg w-full border border-white/20">
        <h1 className="text-4xl font-bold mb-2">Kuis IMK</h1>
        <p className="text-lg mb-6 opacity-90">Interaksi Manusia dan Komputer</p>

        <div className="mb-6 text-left">
          <label className="block text-sm font-medium mb-2 text-blue-100">Nama Peserta</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Masukkan nama lengkap..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
            />
          </div>
        </div>
        
        <div className="bg-black/20 p-4 rounded-lg mb-6 text-sm flex items-center justify-between">
          <span>📝 Pilihan Ganda</span>
          <span className="font-bold bg-white/20 px-2 py-1 rounded">{quizData.mcq.length} Soal</span>
        </div>
        
        <button 
          onClick={handleStart}
          disabled={!userName.trim()}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-400 text-blue-900 font-bold rounded-xl transition-transform hover:scale-105 shadow-lg"
        >
          {userName && Object.keys(answers).length > 0 ? "Lanjutkan Kuis" : "Mulai Mengerjakan"}
        </button>

        {quizHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center justify-center gap-2">
              <History size={16}/> Riwayat Terakhir
            </h3>
            <div className="max-h-32 overflow-y-auto space-y-2 text-xs text-left pr-2">
              {quizHistory.slice(0, 5).map((h) => (
                <div key={h.id} className="bg-white/10 p-2 rounded flex justify-between items-center hover:bg-white/20 cursor-pointer" onClick={() => handleViewHistoryDetail(h)}>
                  <div className="truncate w-32">{h.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-green-500/20 px-2 rounded text-green-200">
                      {h.score}/{h.totalMcq}
                    </span>
                    <Eye size={12} className="text-white/50"/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuiz = () => {
    const question = quizData.mcq[currentQuestionIndex];
    const totalQ = quizData.mcq.length;
    const progress = ((currentQuestionIndex + 1) / totalQ) * 100;

    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <span className="font-bold text-slate-600 hidden sm:inline">{userName}</span>
             </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {currentQuestionIndex + 1} / {totalQ}
            </span>
          </div>

          <div className="w-full bg-slate-300 h-2 rounded-full mb-6 overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 relative transition-all">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-6">{question.question}</h2>
            
            {/* FITUR HINT */}
            <div className="mb-6">
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200"
                >
                  <Lightbulb size={16} className={showHint ? "fill-yellow-500" : ""}/>
                  {showHint ? "Sembunyikan Bantuan" : "Lihat Bantuan (Hint)"}
                </button>
                
                {showHint && (
                  <div className="mt-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-slate-700 text-sm italic rounded-r-lg animate-fade-in">
                    💡 <strong>Hint:</strong> {question.hint}
                  </div>
                )}
            </div>

            <div className="space-y-3">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(question.id, idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[question.id] === idx 
                      ? 'border-blue-500 bg-blue-50 text-blue-800' 
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 text-slate-600 font-semibold disabled:opacity-50 hover:text-blue-600"
            >
              <ChevronLeft size={20} /> Prev
            </button>
            
            <button 
              onClick={nextQuestion}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                currentQuestionIndex === totalQ - 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {currentQuestionIndex === totalQ - 1 ? 'Selesai' : 'Next'} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = () => {
    const score = calculateScore(answers);
    const totalMcq = quizData.mcq.length;
    
    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center border-t-8 border-blue-600">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Hasil Kuis</h2>
            <p className="text-lg text-blue-600 font-semibold mb-6">Peserta: {userName}</p>
            <div className="inline-block bg-slate-100 rounded-xl p-6 mb-6">
              <div className="text-sm text-slate-500 uppercase tracking-wide mb-1">Skor Akhir</div>
              <div className="text-5xl font-black text-blue-600">{score} <span className="text-2xl text-slate-400">/ {totalMcq}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-xl font-bold border-b pb-4 mb-4 flex items-center gap-2 text-slate-700">
              <Trophy className="text-yellow-500" /> Riwayat Pengerjaan (Semua User)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Skor</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizHistory.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-400">Belum ada data history.</td></tr>
                  ) : (
                    quizHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors"> 
                        <td className="p-3 text-slate-500">{h.date}</td>
                        <td className="p-3 font-semibold text-slate-700">{h.name}</td>
                        <td className="p-3 font-bold text-blue-600">{h.score} / {h.totalMcq}</td>
                        <td className="p-3 text-center">
                            <button 
                                onClick={() => handleViewHistoryDetail(h)}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mx-auto"
                            >
                                <Eye size={14}/> Review
                            </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="text-center pb-12 flex justify-center gap-4">
            <button 
              onClick={() => handleViewHistoryDetail({name: userName, savedAnswers: answers, score: score, totalMcq: totalMcq, date: "Baru Saja"})} 
              className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50"
            >
              Lihat Detail Jawaban Saya
            </button>
            <button 
              onClick={handleRestart} 
              className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2"
            >
              <RefreshCw size={20}/> User Baru
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailView = () => {
    if (!selectedHistoryItem) return null;

    const { name, savedAnswers, score, totalMcq, date } = selectedHistoryItem;

    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
            <button 
                onClick={() => setGameState('review')} 
                className="mb-6 flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 transition-colors"
            >
                <ArrowLeft size={20}/> Kembali ke Riwayat
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-center border-l-4 border-purple-500">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Detail Jawaban</h2>
                    <p className="text-slate-500">Peserta: <span className="font-semibold text-slate-700">{name}</span> • {date}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <div className="text-3xl font-black text-purple-600">{score} <span className="text-lg text-slate-400">/ {totalMcq}</span></div>
                    <div className="text-xs text-slate-400 uppercase font-bold">Skor Perolehan</div>
                </div>
            </div>
            
            <div className="space-y-6 pb-12">
                {quizData.mcq.map((q, index) => {
                    const userAnswerIdx = savedAnswers[q.id];
                    const isCorrect = userAnswerIdx === q.correctIndex;
                    const isSkipped = userAnswerIdx === undefined;
                    
                    return (
                        <div key={q.id} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${isCorrect ? 'border-green-100' : isSkipped ? 'border-slate-100' : 'border-red-100'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 min-w-[30px] h-[30px] rounded-full flex items-center justify-center text-white font-bold text-sm ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">{q.question}</h3>
                                    
                                    <div className="space-y-2">
                                        <div className={`p-3 rounded-lg flex items-center gap-2 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                            {isCorrect ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                                            <span className="font-bold">Jawaban Anda:</span> 
                                            {isSkipped ? "(Tidak dijawab)" : q.options[userAnswerIdx]}
                                        </div>

                                        {!isCorrect && (
                                            <div className="p-3 rounded-lg bg-slate-50 text-slate-600 flex items-center gap-2 border border-slate-200">
                                                <CheckCircle size={18} className="text-green-600"/>
                                                <span className="font-bold text-slate-700">Kunci Jawaban:</span> {q.correct}
                                            </div>
                                        )}
                                        
                                        {/* Tampilkan Hint juga di review sebagai pembelajaran */}
                                        <div className="mt-2 text-xs text-slate-400 italic">
                                            💡 Info: {q.hint}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {gameState === 'intro' && renderIntro()}
      {gameState === 'quiz' && renderQuiz()}
      {gameState === 'review' && renderReview()}
      {gameState === 'history_review' && renderDetailView()}
    </div>
  );
}

export default App;