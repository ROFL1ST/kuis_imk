import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Lock,
  Bell,
  Globe,
  Moon,
  Trash2,
  Save,
  Shield,
  Smartphone,
  AlertTriangle,
  UserCog,
  Mail,
  Construction // Icon untuk indikator 'Dalam Pengembangan'
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { userAPI } from "../../services/api";
import Modal from "../../components/ui/Modal";

const Settings = () => {
  const { user, logout } = useAuth();
  
  // State untuk form password
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // State untuk preferensi
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    language: "id"
  });

  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- LOGIKA LOAD & SAVE PREFERENCES ---
  useEffect(() => {
    // Load dari LocalStorage saat mount
    const savedNotif = localStorage.getItem("settings_notifications");
    if (savedNotif !== null) {
      setPreferences(prev => ({ ...prev, notifications: JSON.parse(savedNotif) }));
    }
  }, []);

  const toggleNotifications = () => {
    const newVal = !preferences.notifications;
    setPreferences(prev => ({ ...prev, notifications: newVal }));
    
    // Simpan ke LocalStorage
    localStorage.setItem("settings_notifications", JSON.stringify(newVal));
    
    toast.success(newVal ? "Notifikasi diaktifkan" : "Notifikasi dinonaktifkan", {
        icon: newVal ? '🔔' : '🔕'
    });
  };

  // Handler Ganti Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok!");
    }
    if (passForm.newPassword.length < 6) {
      return toast.error("Password minimal 6 karakter");
    }

    setLoading(true);
    try {
      await userAPI.updateProfile({ 
        password: passForm.newPassword 
      });
      
      toast.success("Password berhasil diubah!");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  // Handler Delete Account
  const handleDeleteAccount = async () => {
    try {
      // await userAPI.deleteAccount(); // Implementasi backend nanti
      toast.success("Akun berhasil dihapus (Simulasi)");
      logout(); 
    } catch (err) {
      toast.error("Gagal menghapus akun");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto pb-12 px-4"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <UserCog className="text-indigo-600" size={32} />
          Pengaturan Akun
        </h1>
        <p className="text-slate-500 mt-2">Kelola preferensi dan keamanan akunmu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KOLOM KIRI: MENU NAVIGASI --- */}
        <div className="lg:col-span-1 space-y-6">
           {/* Card Info User Singkat */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                 {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                 <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                 <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
              </div>
           </div>

           {/* Menu Links */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-50 font-bold text-slate-700">Menu Cepat</div>
              <nav className="flex flex-col p-2">
                 <button className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition text-left">
                    <Mail size={18} /> Email
                 </button>
                 <button className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition text-left">
                    <Shield size={18} /> Keamanan
                 </button>
                 <button className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition text-left">
                    <Smartphone size={18} /> Preferensi
                 </button>
              </nav>
           </div>
        </div>

        {/* --- KOLOM KANAN: FORM & SETTINGS --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. INFORMASI AKUN (EMAIL) - [DEV MODE] */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Mail className="text-indigo-600" size={20} /> Email
                </h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                    <Construction size={12} /> Dalam Pengembangan
                </span>
             </div>
             
             <div className="space-y-4 opacity-60">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
                   <input 
                     type="email" 
                     disabled
                     className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                     placeholder="Belum ada email terhubung"
                     value={user?.email || ""}
                   />
                   <p className="text-xs text-slate-400 mt-1">Fitur menautkan email akan segera hadir.</p>
                </div>
                <div className="flex justify-end pt-2">
                   <button 
                     disabled
                     className="px-6 py-2.5 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed flex items-center gap-2"
                   >
                      <Save size={18} /> Simpan Email
                   </button>
                </div>
             </div>
          </section>

          {/* 2. KEAMANAN (GANTI PASSWORD) - [AKTIF] */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Lock className="text-indigo-600" size={20} /> Keamanan
             </h2>
             
             <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                      <input 
                        type="password" 
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="Minimal 6 karakter"
                        value={passForm.newPassword}
                        onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
                      <input 
                        type="password" 
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="Ulangi password"
                        value={passForm.confirmPassword}
                        onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
                      />
                   </div>
                </div>
                <div className="flex justify-end pt-2">
                   <button 
                     type="submit" 
                     disabled={loading || !passForm.newPassword}
                     className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-sm"
                   >
                      {loading ? "Menyimpan..." : <><Save size={18} /> Update Password</>}
                   </button>
                </div>
             </form>
          </section>

          {/* 3. PREFERENSI APLIKASI - [SEBAGIAN DEV] */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Smartphone className="text-blue-600" size={20} /> Preferensi
             </h2>
             
             <div className="space-y-4">
                {/* Toggle Notifikasi (AKTIF & LOCALSTORAGE) */}
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer" onClick={toggleNotifications}>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Bell size={18} /></div>
                      <div>
                         <p className="font-bold text-slate-700 text-sm">Notifikasi Email</p>
                         <p className="text-xs text-slate-500">Terima update tentang kuis dan teman.</p>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                      <input 
                        type="checkbox" 
                        checked={preferences.notifications} 
                        readOnly
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </label>
                </div>

                {/* Toggle Dark Mode (DEV) */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 opacity-70 cursor-not-allowed">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Moon size={18} /></div>
                      <div>
                         <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            Mode Gelap <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-normal">Dev</span>
                         </p>
                         <p className="text-xs text-slate-500">Tampilan ramah mata.</p>
                      </div>
                   </div>
                   <div className="w-11 h-6 bg-slate-200 rounded-full opacity-60"></div>
                </div>

                {/* Bahasa (DEV) */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 opacity-70 cursor-not-allowed">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Globe size={18} /></div>
                      <div>
                         <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            Bahasa <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-normal">Dev</span>
                         </p>
                         <p className="text-xs text-slate-500">Pilih bahasa aplikasi.</p>
                      </div>
                   </div>
                   <select disabled className="bg-slate-100 border border-slate-200 text-slate-400 text-sm rounded-lg block p-2 cursor-not-allowed">
                      <option>Indonesia</option>
                   </select>
                </div>
             </div>
          </section>

          {/* 4. ZONA BAHAYA */}
          <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
             <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> Zona Bahaya
             </h2>
             <p className="text-sm text-red-800/70 mb-4">
                Menghapus akun bersifat permanen dan tidak dapat dibatalkan. Semua data kuis, teman, dan achievement akan hilang.
             </p>
             <div className="flex justify-end">
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-5 py-2 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm flex items-center gap-2"
                >
                   <Trash2 size={18} /> Hapus Akun
                </button>
             </div>
          </section>

        </div>
      </div>

      {/* Modal Konfirmasi Hapus Akun */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="max-w-sm">
         <div className="text-center">
            <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Akun Permanen?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
               Anda yakin ingin menghapus akun <strong>@{user?.username}</strong>? <br/>
               Tindakan ini <b>tidak dapat dibatalkan</b>.
            </p>
            <div className="flex gap-3">
               <button 
                 onClick={() => setIsDeleteModalOpen(false)} 
                 className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
               >
                  Batal
               </button>
               <button 
                 onClick={handleDeleteAccount} 
                 className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
               >
                  Ya, Hapus
               </button>
            </div>
         </div>
      </Modal>

    </motion.div>
  );
};

export default Settings;