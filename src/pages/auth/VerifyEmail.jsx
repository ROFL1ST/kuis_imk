import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Mail } from "lucide-react";
import { verifyEmail } from "../../services/api"; 
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState(token ? "" : "Token verifikasi tidak ditemukan.");
  
  const isCalled = useRef(false);

  useEffect(() => {
    // Jika tidak ada token, return saja (karena state sudah "error" dari awal)
    if (!token) return;

    // Prevent double-call di React StrictMode
    if (isCalled.current) return;
    isCalled.current = true;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        toast.success("Email berhasil diverifikasi!");
        
        // Update localStorage user
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser && currentUser.email) {
            currentUser.is_email_verified = true;
            localStorage.setItem("user", JSON.stringify(currentUser));
        }

        // Redirect
        setTimeout(() => {
            navigate("/profile/settings"); 
        }, 3000);

      } catch (err) {
        setStatus("error");
        const msg = err.response?.data?.message || "Link verifikasi tidak valid atau sudah kadaluarsa.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    };

    verify();
  }, [token, navigate]);

  useEffect(() => {
    document.title = "Verifikasi Email | QuizApp";
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="p-8 text-center">
            {/* --- STATE: LOADING --- */}
            {status === "loading" && (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Memverifikasi...</h2>
                    <p className="text-slate-500">Mohon tunggu sebentar, kami sedang memvalidasi token Anda.</p>
                </div>
            )}

            {/* --- STATE: SUCCESS --- */}
            {status === "success" && (
                <div className="flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                    >
                        <CheckCircle size={32} />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifikasi Berhasil!</h2>
                    <p className="text-slate-500 mb-6">
                        Terima kasih! Email Anda telah terverifikasi. Anda akan dialihkan ke halaman pengaturan dalam beberapa detik.
                    </p>
                    <button 
                        onClick={() => navigate("/profile/settings")}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition w-full"
                    >
                        Lanjut ke Pengaturan
                    </button>
                </div>
            )}

            {/* --- STATE: ERROR --- */}
            {status === "error" && (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifikasi Gagal</h2>
                    <p className="text-slate-500 mb-6">
                        {errorMessage}
                    </p>
                    <div className="space-y-3 w-full">
                        <button 
                            onClick={() => navigate("/profile/settings")}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition w-full flex items-center justify-center gap-2"
                        >
                             Kembali ke Pengaturan
                        </button>
                        <button 
                            onClick={() => navigate("/")}
                            className="px-6 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition w-full flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Ke Beranda
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        {/* Footer Hiasan */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Mail size={12} /> Quiz App Security
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;