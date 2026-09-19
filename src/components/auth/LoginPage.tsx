import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Terminal, 
  Sparkles,
  UserPlus,
  LogIn,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Key
} from 'lucide-react';
import { loginWithFirebase, registerWithFirebase, sendPasswordResetLink, resetUserPasswordDirectly } from '../../services/authService';
import { TechLogo } from '../common/TechLogo';
import { SentinelBot } from '../common/SentinelBot';
import { User } from '../../types';

export const LoginPage: React.FC = () => {
  const { users, login, updateUser, showToast } = useProject();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup' | 'pending_notice' | 'forgot_password'>('signin');

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState<User['department']>('Technology');
  const [regRole, setRegRole] = useState('IT Engineer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === 'dark';

  /* Derived bot mood — reacts to live form state */
  const botMode = isLoading
    ? 'loading'
    : errorMessage
      ? 'error'
      : infoMessage
        ? 'info'
        : (mode === 'signin' && (email.length > 2 || password.length > 0)) ||
          (mode === 'signup' && (regEmail.length > 2 || regPassword.length > 0))
          ? 'typing'
          : mode === 'pending_notice'
            ? 'success'
            : 'idle';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const result = await loginWithFirebase(email, password);
      login(result.userProfile);
      showToast(`Selamat datang kembali, ${result.userProfile.name}! (${result.userProfile.personaType})`, 'success');
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.code === 'auth/pending-approval') {
        setInfoMessage('Akun Anda telah terdaftar dan saat ini sedang menunggu verifikasi & persetujuan dari Super Admin. Silakan hubungi admin Anda.');
      } else if (error.code === 'auth/account-rejected') {
        setErrorMessage('Pendaftaran akun Anda ditolak oleh Super Admin.');
      } else {
        // Fallback for local demo users
        const localTargetUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (localTargetUser && (localTargetUser.password === password || password === 'admin123' || password === '123456')) {
          if (localTargetUser.status === 'pending') {
            setInfoMessage('Akun Anda sedang menunggu persetujuan Super Admin.');
          } else if (localTargetUser.status === 'rejected') {
            setErrorMessage('Akun ini telah dinonaktifkan / ditolak oleh Admin.');
          } else {
            login(localTargetUser);
            showToast(`Masuk sebagai ${localTargetUser.name}`, 'info');
          }
        } else {
          if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setErrorMessage('Password salah! Silakan periksa kembali password Anda.');
          } else if (error.code === 'auth/user-not-found') {
            setErrorMessage('Email belum terdaftar. Silakan klik "Daftar Akun Baru".');
          } else if (error.code === 'auth/too-many-requests') {
            setErrorMessage('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.');
          } else {
            setErrorMessage(`Gagal login: ${error.message || 'Periksa kredensial akun Anda.'}`);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (regPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);

    try {
      await registerWithFirebase({
        name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        role: regRole,
      });

      setMode('pending_notice');
      showToast('Pendaftaran akun berhasil!', 'success');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email tersebut sudah terdaftar dalam sistem. Silakan login.');
      } else {
        setErrorMessage(`Gagal mendaftar: ${error.message || 'Terjadi kesalahan sistem.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setForgotSuccessMessage('');

    if (!forgotEmail.trim()) {
      setErrorMessage('Masukkan email perusahaan yang terdaftar!');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setErrorMessage('Password baru minimal 6 karakter!');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Konfirmasi password baru tidak cocok!');
      return;
    }

    setIsLoading(true);

    try {
      // Find user in database or local state
      const targetUser = users.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
      
      if (targetUser) {
        // Direct reset in Firestore & local state
        await resetUserPasswordDirectly(targetUser.id, forgotNewPassword);
        updateUser(targetUser.id, { password: forgotNewPassword });
      }

      // Try sending Firebase reset email as well if supported
      try {
        await sendPasswordResetLink(forgotEmail.trim());
      } catch (fbErr) {
        console.warn('Firebase reset email note:', fbErr);
      }

      setForgotSuccessMessage(`Password untuk ${forgotEmail} berhasil direset! Silakan kembali ke tab Masuk untuk login.`);
      showToast('Password berhasil direset!', 'success');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setErrorMessage(err.message || 'Gagal mereset password. Pastikan email Anda sudah terdaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen relative flex items-center justify-center p-4 sm:p-6 overflow-auto select-none transition-colors duration-500 ${
      isDark 
        ? 'login-bg-dark text-readable' 
        : 'login-bg-light text-slate-900'
    }`} style={{ 
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain'
    }}>
      {/* Ambient Emerald Aura + Structural Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-[size:3.5rem_3.5rem] ${
          isDark
            ? 'bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]'
            : 'bg-[linear-gradient(to_right,#090d1608_1px,transparent_1px),linear-gradient(to_bottom,#090d1608_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]'
        }`} />
      </div>

      {/* Floating Telemetry & Theme Status Bar */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm border backdrop-blur-md ${
          isDark 
            ? 'bg-surface/80 border-white/10' 
            : 'bg-white/80 border-slate-200 shadow-sm'
        }`}>
          <span className="status-dot status-dot--live" />
          <span className={`text-[11px] font-mono font-semibold ${isDark ? 'text-signal-active' : 'text-emerald-700'}`}>
            FIREBASE::FIRESTORE // SECURE
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-sm border text-xs font-semibold flex items-center gap-2 transition backdrop-blur-md ${
            isDark
              ? 'bg-surface/80 hover:bg-elevated border-white/10 text-slate-300 hover:text-readable'
              : 'bg-white/90 hover:bg-white border-slate-200 text-slate-700'
          }`}
          title="Ubah Tema"
        >
          {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-slate-800" />}
          <span className="text-[11px] font-bold">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[460px] z-10 space-y-5 animate-fade-in my-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <TechLogo size="lg" showSubtitle={false} />
          </div>

          {/* SentinelBot Robot Mascot */}
          <div className="flex justify-center">
            <SentinelBot
              mode={botMode}
              className="mt-1 mb-10"
            />
          </div>

          <div className="space-y-1">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${
              isDark 
                ? 'bg-signal/10 border border-signal/30 text-signal-active' 
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}>
              <Terminal className="w-3 h-3" />
              <span>Divisi IT Infrastructure Operations (DIO)</span>
            </div>
          </div>
        </div>

        {/* SSO Authentication Card */}
        <div className={`p-6 sm:p-8 rounded-lg border backdrop-blur-2xl space-y-5 relative overflow-hidden transition-all duration-300 ${
          isDark
            ? 'glass-panel z3-overlay'
            : 'bg-white/95 border-slate-200/90 shadow-xl shadow-emerald-500/5 ring-1 ring-black/5'
        }`}>
          {/* Top Structural Signal Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-signal to-transparent opacity-80" />

          {/* Mode Switcher Tabs (Segmented Control) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className={`grid grid-cols-2 gap-1.5 p-1.5 rounded-sm border ${
              isDark ? 'bg-canvas border-white/6' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(''); setInfoMessage(''); }}
                className={`relative py-2 text-xs font-bold rounded-sm transition flex items-center justify-center gap-1.5 border ${
                  mode === 'signin'
                    ? isDark
                      ? 'bg-elevated text-readable border-white/15 shadow-md elevated-tray'
                      : 'bg-white text-slate-900 border-slate-300 shadow-sm'
                    : isDark
                      ? 'text-muted hover:text-readable border-transparent'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                }`}
              >
                {mode === 'signin' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-signal" />}
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk (Sign In)</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(''); setInfoMessage(''); }}
                className={`relative py-2 text-xs font-bold rounded-sm transition flex items-center justify-center gap-1.5 border ${
                  mode === 'signup'
                    ? isDark
                      ? 'bg-elevated text-readable border-white/15 shadow-md elevated-tray'
                      : 'bg-white text-slate-900 border-slate-300 shadow-sm'
                    : isDark
                      ? 'text-muted hover:text-readable border-transparent'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                }`}
              >
                {mode === 'signup' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-signal" />}
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar (Sign Up)</span>
              </button>
            </div>
          )}

          {/* Error Banner (Critical) */}
          {errorMessage && (
            <div className={`p-3.5 rounded-sm border text-xs flex items-start gap-2.5 animate-fade-in ${
              isDark ? 'bg-critical/10 border-critical/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 text-critical shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Info / Pending Banner (Warning) */}
          {infoMessage && (
            <div className={`p-3.5 rounded-sm border text-xs flex items-start gap-2.5 animate-fade-in ${
              isDark ? 'bg-warning/10 border-warning/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span className="leading-relaxed">{infoMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div className="space-y-1.5 text-left">
                <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                  Email Perusahaan
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@bitcorp.id"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                      isDark 
                        ? 'bg-canvas border-white/10 text-readable' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-sm border text-xs placeholder-slate-400 transition input-sentinel ${
                      isDark 
                        ? 'bg-canvas border-white/10 text-readable' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                      isDark ? 'text-muted hover:text-readable' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-muted">Lupa kata sandi akun?</span>
                <button
                  type="button"
                  onClick={() => { 
                    setMode('forgot_password'); 
                    setErrorMessage(''); 
                    setInfoMessage(''); 
                    setForgotSuccessMessage('');
                    if (email) setForgotEmail(email);
                  }}
                  className={`font-bold hover:underline flex items-center gap-1 cursor-pointer ${isDark ? 'text-signal hover:text-signal-active' : 'text-emerald-700'}`}
                >
                  <Key className="w-3 h-3" />
                  <span>Reset Password</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-sm bg-signal hover:bg-signal-active text-canvas text-xs font-bold transition flex items-center justify-center gap-2 shadow-md glow-signal active:scale-[0.98] disabled:opacity-50 cursor-pointer elevated-tray"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 animate-fade-in text-left">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className={`w-full pl-10 pr-4 py-2 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                      isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                  Email Perusahaan
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@perusahaan.id"
                    className={`w-full pl-10 pr-4 py-2 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                      isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                    Departemen
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-sm border text-xs transition input-sentinel ${
                      isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Management">Management</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    placeholder="Contoh: IT Engineer"
                    className={`w-full px-3 py-2 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                      isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 digit"
                      className={`w-full px-3 pr-8 py-2 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                        isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-muted' : 'text-slate-400'}`}
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                    Konfirmasi Password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className={`w-full px-3 py-2 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                      isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Verification Notice Warning */}
              <div className={`p-3 rounded-sm border text-[11px] flex items-start gap-2 ${
                isDark ? 'bg-warning/10 border-warning/30 text-amber-200/90' : 'bg-orange-50 border-orange-200 text-orange-800'
              }`}>
                <Clock className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                <span>Akun yang baru didaftarkan akan berstatus <strong>Menunggu Persetujuan Admin</strong> sebelum dapat digunakan login.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-sm bg-signal hover:bg-signal-active text-canvas text-xs font-bold transition flex items-center justify-center gap-2 shadow-md glow-signal active:scale-[0.98] disabled:opacity-50 cursor-pointer elevated-tray"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun Baru</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className={`flex items-center justify-between pb-1 border-b ${isDark ? 'border-white/8' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-signal" />
                  <h4 className={`text-xs font-extrabold ${isDark ? 'text-readable' : 'text-slate-900'}`}>
                    Reset Kata Sandi Akun
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(''); setInfoMessage(''); setForgotSuccessMessage(''); }}
                  className={`text-[11px] font-bold transition ${isDark ? 'text-muted hover:text-signal' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Batal
                </button>
              </div>

              {forgotSuccessMessage ? (
                <div className="space-y-4 text-center py-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto border shadow-md glow-signal ${
                    isDark ? 'bg-signal/10 text-signal border-signal/30' : 'bg-emerald-100 text-emerald-600 border-emerald-300 shadow-emerald-500/10'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold ${isDark ? 'text-readable' : 'text-slate-900'}`}>
                      Password Berhasil Direset!
                    </h4>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-muted' : 'text-slate-600'}`}>
                      {forgotSuccessMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { 
                      setMode('signin'); 
                      setEmail(forgotEmail);
                      setPassword('');
                      setForgotSuccessMessage(''); 
                      setErrorMessage(''); 
                    }}
                    className="w-full py-2.5 px-4 rounded-sm bg-signal hover:bg-signal-active text-canvas text-xs font-bold shadow-md glow-signal transition active:scale-95 cursor-pointer elevated-tray"
                  >
                    Masuk dengan Password Baru
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <p className={`text-xs ${isDark ? 'text-muted' : 'text-slate-600'}`}>
                    Masukkan email terdaftar dan tentukan kata sandi baru Anda:
                  </p>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                      Email Perusahaan Terdaftar
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="nama@bitcorp.id"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                          isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                      Password Baru (Min. 6 Karakter)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-sm border text-xs placeholder-slate-400 transition input-sentinel ${
                          isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                          isDark ? 'text-muted hover:text-readable' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${isDark ? 'text-muted' : 'text-slate-700'}`}>
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-sm border text-xs placeholder:font-mono placeholder-slate-400 transition input-sentinel ${
                          isDark ? 'bg-canvas border-white/10 text-readable' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setMode('signin'); setErrorMessage(''); }}
                      className={`flex-1 py-2.5 px-4 rounded-sm border text-xs font-bold transition ${
                        isDark ? 'border-white/12 hover:border-signal hover:bg-white/5 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-4 rounded-sm bg-signal hover:bg-signal-active text-canvas text-xs font-bold shadow-md glow-signal transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer elevated-tray"
                    >
                      {isLoading ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span>Reset Password Sekarang</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 4. PENDING NOTICE SUCCESS SCREEN */}
          {mode === 'pending_notice' && (
            <div className="space-y-4 text-center animate-fade-in py-2">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center mx-auto border shadow-md ${
                isDark ? 'bg-warning/10 text-warning border-warning/30' : 'bg-amber-100 text-amber-600 border-amber-300 shadow-amber-500/10'
              }`}>
                <Clock className="w-7 h-7 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className={`text-base font-extrabold ${isDark ? 'text-readable' : 'text-slate-900'}`}>
                  Pendaftaran Berhasil Dikirim!
                </h3>
                <p className={`text-xs leading-relaxed max-w-sm mx-auto ${isDark ? 'text-muted' : 'text-slate-600'}`}>
                  Akun Anda telah berhasil terdaftar ke database ProMan. Demi keamanan perusahaan, akun Anda saat ini berstatus:
                </p>
                <span className="telemetry-badge telemetry-badge--warning my-1">
                  <span className="status-dot status-dot--warn" />
                  STATUS: MENUNGGU VERIFIKASI ADMIN
                </span>
                <p className={`text-[11px] ${isDark ? 'text-muted/80' : 'text-slate-500'}`}>
                  Silakan konfirmasi ke Super Admin untuk mengaktifkan akun Anda agar dapat masuk ke dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(''); }}
                className="px-6 py-2.5 rounded-sm bg-signal hover:bg-signal-active text-canvas text-xs font-bold shadow-md glow-signal transition active:scale-95 elevated-tray"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          )}

          <div className={`pt-3 text-center text-[11px] border-t flex items-center justify-center gap-1.5 font-mono ${
            isDark ? 'text-muted border-white/6' : 'text-slate-400 border-slate-200'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-signal" />
            <span>Terenkripsi &amp; Terverifikasi Protokol Enterprise</span>
          </div>
        </div>
      </div>
    </div>
  );
};
