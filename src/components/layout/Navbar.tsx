import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Bot, 
  ChevronDown, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  FolderKanban,
  Building2,
  Crown,
  Layers,
  Menu,
  Key
} from 'lucide-react';
import { TechLogo } from '../common/TechLogo';
import { UserAvatar } from '../common/UserAvatar';

export const Navbar: React.FC = () => {
  const {
    systemSettings,
    currentProject,
    currentProjectId,
    projects,
    setCurrentProjectId,
    currentUser,
    filters,
    setFilters,
    setIsCreateModalOpen,
    setIsAIBreakdownModalOpen,
    setIsCopilotOpen,
    isCopilotOpen,
    setIsChangePasswordModalOpen,
    logout,
    setActiveView,
    setIsMobileSidebarOpen,
  } = useProject();

  const { theme, toggleTheme } = useTheme();
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div className="flex flex-col z-30 shrink-0 select-none">
      <header className="h-16 border-b border-slate-200 dark:border-white/8 bg-white/95 dark:bg-surface/90 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between text-slate-800 dark:text-readable transition-colors">
        {/* Left: Mobile Hamburger & High-Tech IT Logo & Company Name */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Mobile Hamburger Drawer Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-elevated/60 border border-transparent hover:border-white/10 md:hidden transition cursor-pointer"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Modern IT Logo - Label text hidden on mobile, full on desktop */}
          <TechLogo size="sm" hideTextOnMobile={true} />

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Company Name Display */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-elevated/60 border border-slate-200 dark:border-white/10 elevated-tray text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-40 font-mono text-[11px] font-bold tracking-tight">{systemSettings.companyName}</span>
          </div>

          {/* Active Project Dropdown Switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-300/40 dark:border-emerald-500/30 hover:border-emerald-400/70 dark:hover:border-emerald-400/60 text-xs font-bold text-slate-800 dark:text-readable transition elevated-tray"
            >
              <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-30 sm:max-w-45 font-mono text-[11px]">{currentProject.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Projects Dropdown Menu */}
            {isProjectMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-lg bg-white dark:bg-elevated border border-slate-200 dark:border-white/10 z3-overlay p-2 z-50 animate-fade-in elevated-tray">
                <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-slate-400 dark:text-muted uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-white/8 pb-2 mb-1">
                  <span>Pilih Project Aktif</span>
                  <button
                    onClick={() => {
                      setIsProjectMenuOpen(false);
                      setActiveView('project_management');
                    }}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold text-[10px]"
                  >
                    Kelola Project
                  </button>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {/* Global Board Option */}
                  <button
                    onClick={() => {
                      setCurrentProjectId('all');
                      setIsProjectMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition text-left ${
                      currentProjectId === 'all'
                        ? 'bg-emerald-500/10 text-readable font-bold ring-1 ring-inset ring-emerald-500/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-elevated/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Layers className="w-4 h-4" />
                      <span className="truncate font-semibold">Semua Project (Global Board)</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${currentProjectId === 'all' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40' : 'bg-slate-200 dark:bg-elevated/60 text-slate-500 dark:text-muted'}`}>
                      ALL
                    </span>
                  </button>

                  {/* Individual Projects */}
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentProjectId(p.id);
                        setIsProjectMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition text-left ${
                        p.id === currentProjectId
                          ? 'bg-emerald-500/10 text-readable font-bold ring-1 ring-inset ring-emerald-500/40'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-elevated/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{p.icon}</span>
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${p.id === currentProjectId ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40' : 'bg-slate-200 dark:bg-elevated/60 text-slate-500 dark:text-muted'}`}>
                        {p.healthScore}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Search Input (Desktop) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Cari tiket, tugas operasional, tags..."
              className="w-full pl-10 pr-9 py-2 rounded-md bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-readable placeholder-slate-400 input-sentinel"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Mobile Search Toggle, AI Copilot, AI Breakdown, Create Task, Theme, Profile */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`p-2 rounded-md border md:hidden transition cursor-pointer ${
              isMobileSearchOpen
                ? 'bg-emerald-600 text-white border-emerald-500 glow-signal'
                : 'bg-slate-100 dark:bg-elevated/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-elevated'
            }`}
            title="Cari Tugas"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* AI Copilot Toggle Button - Highly Visible on Mobile & Desktop */}
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`relative p-2 sm:px-3 sm:py-2 rounded-md border transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
              isCopilotOpen 
                ? 'bg-emerald-600 text-white border-emerald-400 glow-signal' 
                : 'bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-500/20'
            }`}
            title="Buka ProMan AI Copilot Assistant"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">Copilot</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {/* AI Breakdown Button (Desktop / Tablet) */}
          <button
            onClick={() => setIsAIBreakdownModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-700 hover:from-emerald-700 hover:to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
            title="Pecah prompt fitur/operasional menjadi sub-tugas otomatis dengan AI"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>AI Breakdown</span>
          </button>

          {/* Create Task Button (Desktop / Tablet) */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold text-white dark:text-slate-900 transition shadow-sm active:scale-95 cursor-pointer elevated-tray"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tugas Baru</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md bg-slate-100 dark:bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 transition shadow-xs cursor-pointer"
            title={`Beralih ke mode ${theme === 'dark' ? 'Terang (Light)' : 'Gelap (Dark)'}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* User Info & Actions */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <UserAvatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-none flex items-center gap-1">
                  <span>{currentUser.name.split(' ')[0]}</span>
                  {currentUser.personaType === 'Super Admin' && <Crown className="w-3 h-3 text-amber-500" />}
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{currentUser.personaType}</span>
              </div>
            </div>

            {/* Change Password Action Button */}
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-md bg-slate-100 dark:bg-elevated/60 hover:bg-slate-200 dark:hover:bg-elevated border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer"
              title="Ganti Kata Sandi (Password)"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline ml-1">Ganti Password</span>
            </button>

            {/* Logout Action Button */}
            <button
              onClick={logout}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer"
              title="Keluar dari akun (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3 py-2.5 border-b border-slate-200 dark:border-white/8 bg-white/95 dark:bg-surface/90 backdrop-blur-md animate-fade-in elevated-tray">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Cari tiket, tugas, tags..."
              className="w-full pl-10 pr-9 py-2 rounded-md bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-readable placeholder-slate-400 input-sentinel"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
