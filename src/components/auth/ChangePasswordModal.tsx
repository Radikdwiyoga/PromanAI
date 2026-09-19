import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { changeUserPassword } from '../../services/authService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, showToast } = useProject();
  const { theme } = useTheme();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const calculateStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]|[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSuccess(false);

    if (!oldPassword.trim()) {
      setErrorMessage('Masukkan password saat ini!');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password baru minimal 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password baru tidak cocok!');
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMessage('Password baru tidak boleh sama dengan password lama!');
      return;
    }

    setIsLoading(true);

    try {
      await changeUserPassword(currentUser.id, currentUser.email, oldPassword, newPassword);
      updateUser(currentUser.id, { password: newPassword });

      setIsSuccess(true);
      showToast('Password akun Anda berhasil diperbarui!', 'success');

      setTimeout(() => {
        setIsSuccess(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setErrorMessage(err.message || 'Gagal mengubah password. Pastikan password lama Anda benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-slate-100 ring-1 ring-white/10' 
          : 'bg-white border-slate-200 text-slate-900 shadow-emerald-500/10'
      }`}>
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-blue-500" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-orange-200 dark:border-orange-500/30 shadow-sm">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <span>Ganti Password Akun</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbarui kata sandi untuk akun <span className="font-semibold text-emerald-700 dark:text-emerald-400">{currentUser.email}</span>
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className={`p-3.5 mb-4 rounded-2xl border text-xs flex items-start gap-2.5 animate-fade-in ${
            isDark ? 'bg-rose-950/50 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {isSuccess && (
          <div className={`p-4 mb-4 rounded-2xl border text-xs flex items-center gap-3 animate-fade-in ${
            isDark ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-bold">Password berhasil diubah! Menyimpan ke sistem...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Password Saat Ini (Lama)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password Baru (Min. 6 Karakter)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Buat password baru yang kuat"
                className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword && (
              <div className="pt-1 space-y-1">
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      strength <= 25 ? 'bg-rose-500 w-1/4' :
                      strength <= 50 ? 'bg-amber-500 w-2/4' :
                      strength <= 75 ? 'bg-blue-500 w-3/4' : 'bg-emerald-500 w-full'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Kekuatan Password:</span>
                  <span className={`font-bold ${
                    strength <= 25 ? 'text-rose-500' :
                    strength <= 50 ? 'text-amber-500' :
                    strength <= 75 ? 'text-blue-500' : 'text-emerald-500'
                  }`}>
                    {strength <= 25 ? 'Lemah' : strength <= 50 ? 'Cukup' : strength <= 75 ? 'Kuat' : 'Sangat Kuat'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 px-4 rounded-2xl border text-xs font-bold transition ${
                isDark 
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>Simpan Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className={`mt-5 pt-3 border-t text-center text-[11px] flex items-center justify-center gap-1.5 ${
          isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Password dienkripsi dengan standar keamanan AES-256</span>
        </div>
      </div>
    </div>
  );
};
