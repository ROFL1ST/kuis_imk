import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success("Registrasi Berhasil! Silakan Login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registrasi Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleRegister} className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">Buat Akun Baru</h1>
        <p className="text-center text-slate-500 mb-6">Mulai perjalanan kuis kamu sekarang</p>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Username"
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        
        <button 
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
        
        <div className="mt-6 text-center text-sm">
            Sudah punya akun? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Masuk disini</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;