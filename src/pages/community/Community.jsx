// src/pages/community/Community.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizAPI, topicAPI } from "../../services/api";
import { Globe, Plus, User, PlayCircle, Loader2, ArrowLeft } from "lucide-react";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

const Community = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Create Quiz State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: "", description: "", topic_id: "" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [qRes, tRes] = await Promise.all([
                quizAPI.getCommunityQuizzes(),
                topicAPI.getAllTopics()
            ]);
            setQuizzes(qRes.data.data || []);
            setTopics(tRes.data.data || []);
            if(tRes.data.data.length > 0) {
                setFormData(prev => ({...prev, topic_id: tRes.data.data[0].ID}));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if(!formData.title || !formData.topic_id) return toast.error("Isi judul & topik!");
        
        try {
            await quizAPI.createCommunityQuiz({
                ...formData,
                topic_id: parseInt(formData.topic_id)
            });
            toast.success("Kuis berhasil dibuat!");
            setIsModalOpen(false);
            setFormData({ title: "", description: "", topic_id: topics[0]?.ID || "" });
            // Refresh list
            const res = await quizAPI.getCommunityQuizzes();
            setQuizzes(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Gagal membuat kuis");
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6">
                <ArrowLeft size={18} /> Kembali
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Globe className="text-indigo-600" /> Komunitas
                    </h1>
                    <p className="text-slate-500">Kuis buatan sesama pemain.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} /> Buat Kuis
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
            ) : quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500">Belum ada kuis komunitas.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.ID} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                                        {quiz.Topic?.title || "Umum"}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                        <User size={12} /> {quiz.Creator?.name || "Anonim"}
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{quiz.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{quiz.description || "Tidak ada deskripsi."}</p>
                            </div>
                            
                            <Link 
                                to={`/play/${quiz.ID}`}
                                state={{ title: quiz.title }}
                                className="w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition text-sm"
                            >
                                <PlayCircle size={16} /> Mainkan
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Kuis Baru">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Judul Kuis</label>
                        <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                               value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Topik</label>
                        <select className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.topic_id} onChange={e => setFormData({...formData, topic_id: e.target.value})}>
                            {topics.map(t => <option key={t.ID} value={t.ID}>{t.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                        <textarea className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3}
                                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <button onClick={handleCreate} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700">Simpan Kuis</button>
                </div>
            </Modal>
        </div>
    );
};

export default Community;