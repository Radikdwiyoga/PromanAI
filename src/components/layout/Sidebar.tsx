import React, { useState, useEffect } from 'react';
import { useProject, ActiveView } from '../../context/ProjectContext';
import { 
  Kanban, 
  Calendar as CalendarIcon, 
  ListOrdered, 
  GanttChartSquare, 
  AlertTriangle, 
  Users2, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Flame, 
  ChevronRight, 
  Settings, 
  Activity, 
  Crown, 
  FolderKanban,
  X,
  LogOut,
  Key,
  Pin,
  PinOff,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { analyzeProjectRisks } from '../../utils/aiSimulator';
import { TechLogo } from '../common/TechLogo';
import { UserAvatar } from '../common/UserAvatar';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentProject,
    currentProjectId,
    projects,
    tasks,
    users,
    currentUser,
    filters,
    setFilters,
    setIsSummaryModalOpen,
    isSuperAdmin,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    setIsChangePasswordModalOpen,
    logout,
  } = useProject();

  // Auto-hide / Compact Icon Mode State
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('proman_sidebar_pinned') === 'true';
  });

  const isExpanded = isPinned || isHovered;

  const togglePin = () => {
    setIsPinned(prev => {
      const next = !prev;
      localStorage.setItem('proman_sidebar_pinned', String(next));
      return next;
    });
  };

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setIsMobileSidebarOpen(false);
  };

  const riskAnalysis = analyzeProjectRisks(tasks, users);
  const myTasksCount = tasks.filter(t =>
    (currentProjectId === 'all' || t.projectId === currentProject.id) &&
    t.status !== 'done' &&
    (t.assigneeIds || []).includes(currentUser.id)
  ).length;
  const urgentTasksCount = tasks.filter(t =>
    (currentProjectId === 'all' || t.projectId === currentProject.id) &&
    t.status !== 'done' &&
    t.priority === 'urgent'
  ).length;
  const totalActiveTasks = tasks.filter(t =>
    (currentProjectId === 'all' || t.projectId === currentProject.id) &&
    t.status !== 'done'
  ).length;

  const viewItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'kanban', label: 'Papan Kanban', icon: <Kanban className="w-4 h-4 shrink-0" />, badge: totalActiveTasks },
    { id: 'timeline', label: 'Timeline & Gantt', icon: <GanttChartSquare className="w-4 h-4 shrink-0" /> },
    { id: 'calendar', label: 'Kalender Proyek', icon: <CalendarIcon className="w-4 h-4 shrink-0" /> },
    { id: 'list', label: 'Daftar & Tabel', icon: <ListOrdered className="w-4 h-4 shrink-0" /> },
  ];

  const aiViews: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    { 
      id: 'risk_dashboard', 
      label: 'Predictive Risk & Delay', 
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
      badge: riskAnalysis.atRiskTasksCount > 0 ? `${riskAnalysis.atRiskTasksCount} Risiko` : undefined,
      badgeColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
    },
    { 
      id: 'resource_allocation', 
      label: 'Smart Resource / Beban', 
      icon: <Users2 className="w-4 h-4 text-blue-500 shrink-0" />,
      badge: riskAnalysis.overloadedMembersCount > 0 ? `${riskAnalysis.overloadedMembersCount} Overload` : undefined,
      badgeColor: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
    },
  ];

  const renderNavContent = (expanded: boolean) => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Header Toggle (Desktop Pin Button) */}
      <div className={`p-2.5 border-b border-slate-200 dark:border-slate-800/80 flex items-center ${expanded ? 'justify-between' : 'justify-center'} bg-canvas-light/50 dark:bg-canvas/50`}>
        {expanded ? (
          <>
            <div className="flex items-center gap-2 pl-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider truncate">
                Navigasi Utama
              </span>
            </div>
            <button
              onClick={togglePin}
              className={`p-1.5 rounded-md transition ${
                isPinned 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isPinned ? 'Lepas Pin (Auto-Hide Aktif)' : 'Kunci Navigasi (Pin Sidebar)'}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
          </>
        ) : (
          <button
            onClick={togglePin}
            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-elevated/60 transition"
            title="Kunci / Buka Navigasi (Klik untuk Pin)"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Body */}
      <div className="p-2 space-y-4 overflow-y-auto flex-1 touch-scroll-y">
        {/* Core Views */}
        <div>
          {expanded && (
            <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Tampilan Project</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-22.5">
                {currentProject.name}
              </span>
            </div>
          )}
          <nav className="space-y-1">
            {viewItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-md text-xs font-medium transition relative group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-900 dark:text-readable font-bold ring-1 ring-inset ring-emerald-500/40'
                      : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-readable hover:bg-slate-100 dark:hover:bg-elevated/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={isActive ? 'text-emerald-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition'}>
                      {item.icon}
                    </span>
                    {expanded && <span className="truncate">{item.label}</span>}
                  </div>
                  {expanded && item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${isActive ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-mono' : 'bg-slate-200 dark:bg-elevated/60 text-slate-600 dark:text-muted font-mono'}`}>
                      {item.badge}
                    </span>
                  )}
                  {!expanded && item.badge !== undefined && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Divider in compact mode */}
        {!expanded && <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2" />}

        {/* Project Management Section */}
        <div>
          {expanded && (
            <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="w-3 h-3 text-emerald-600" />
              <span>Manajemen Project</span>
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('project_management')}
              title="Daftar & Hub Project"
              className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-md text-xs font-medium transition group ${
                activeView === 'project_management'
                  ? 'bg-emerald-500/10 text-emerald-900 dark:text-readable font-bold ring-1 ring-inset ring-emerald-500/40'
                  : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-readable hover:bg-slate-100 dark:hover:bg-elevated/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderKanban className={`w-4 h-4 shrink-0 ${activeView === 'project_management' ? 'text-emerald-900 dark:text-white' : 'text-slate-500 group-hover:text-emerald-600'}`} />
                {expanded && <span className="truncate">Daftar &amp; Hub Project</span>}
              </div>
              {expanded && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
            </button>
          </nav>
        </div>

        {/* Divider in compact mode */}
        {!expanded && <div className="h-px bg-slate-200 dark:border-slate-800 mx-2" />}

        {/* AI-Powered Intelligence Suite */}
        <div>
          {expanded && (
            <div className="px-2.5 pb-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Fitur Berbasis AI</span>
            </div>
          )}
          <nav className="space-y-1">
            {aiViews.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-md text-xs font-medium transition relative group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-900 dark:text-readable font-bold ring-1 ring-inset ring-emerald-500/40'
                      : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-readable hover:bg-slate-100 dark:hover:bg-elevated/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span>{item.icon}</span>
                    {expanded && <span className="truncate">{item.label}</span>}
                  </div>
                  {expanded && item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border shrink-0 ${isActive ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-mono border-emerald-700' : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {!expanded && item.badge && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>
              );
            })}

            {/* Direct Trigger: Auto-Status Modal */}
            <button
              onClick={() => {
                setIsSummaryModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              title="Auto-Status Summary (Laporan AI)"
              className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-md text-xs font-medium text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-readable hover:bg-slate-100 dark:hover:bg-elevated/60 transition group`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                {expanded && <span>Auto-Status Summary</span>}
              </div>
              {expanded && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-500/30 shrink-0">
                  Laporan
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Super Admin Control Section */}
        {isSuperAdmin && (
          <div>
            {expanded && (
              <div className="px-2.5 pb-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>Tata Kelola Enterprise</span>
              </div>
            )}
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('admin_settings')}
                title="Admin Settings"
                className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-md text-xs font-medium transition group ${
                  activeView === 'admin_settings'
                    ? 'bg-emerald-500/10 text-emerald-900 dark:text-readable font-bold ring-1 ring-inset ring-emerald-500/40'
                    : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-readable hover:bg-slate-100 dark:hover:bg-elevated/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings className="w-4 h-4 text-amber-500 shrink-0" />
                  {expanded && <span>Admin Settings</span>}
                </div>
                {expanded && (
                  <span className="telemetry-badge telemetry-badge--muted shrink-0">
                    ADMIN
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}

        {/* Quick Filters */}
        <div>
          {expanded && (
            <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Filter Cepat
            </div>
          )}
          <div className="space-y-1">
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, assigneeId: prev.assigneeId === currentUser.id ? null : currentUser.id }));
                setIsMobileSidebarOpen(false);
              }}
              title={`Tugas Saya (${myTasksCount})`}
              className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center px-0'} py-1.5 rounded-md text-xs transition relative group ${
                filters.assigneeId === currentUser.id ? 'bg-emerald-500/10 text-emerald-900 dark:text-readable font-bold ring-1 ring-inset ring-emerald-500/40' : 'text-slate-600 dark:text-muted hover:bg-slate-100 dark:hover:bg-elevated/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {expanded && <span>Tugas Saya</span>}
              </div>
              {expanded && <span className="text-[10px]">{myTasksCount}</span>}
              {!expanded && myTasksCount > 0 && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, priority: prev.priority === 'urgent' ? null : 'urgent' }));
                setIsMobileSidebarOpen(false);
              }}
              title={`Prioritas Urgent (${urgentTasksCount})`}
              className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center px-0'} py-1.5 rounded-md text-xs transition relative group ${
                filters.priority === 'urgent' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 font-bold ring-1 ring-inset ring-rose-500/40' : 'text-slate-600 dark:text-muted hover:bg-slate-100 dark:hover:bg-elevated/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                {expanded && <span>Prioritas Urgent</span>}
              </div>
              {expanded && <span className="text-[10px]">{urgentTasksCount}</span>}
              {!expanded && urgentTasksCount > 0 && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer: User Profile & Quick Actions */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800/80 bg-canvas-light/70 dark:bg-surface/70 space-y-2 shrink-0">
        {expanded ? (
          <>
            {/* User Card */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-elevated/60 border border-slate-200 dark:border-white/10 elevated-tray">
              <div className="flex items-center gap-2.5 truncate">
                <UserAvatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                    {currentUser.personaType}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setIsChangePasswordModalOpen(true);
                  }}
                  className="p-1.5 rounded-md bg-slate-100 dark:bg-elevated hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition active:scale-95 cursor-pointer"
                  title="Ganti Kata Sandi (Password)"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    logout();
                  }}
                  className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 transition active:scale-95 cursor-pointer"
                  title="Keluar dari Akun (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Health Card */}
            {(() => {
              const isGlobalBoard = currentProjectId === 'all';
              const globalHealthScore = projects.length > 0
                ? Math.round(projects.reduce((acc, p) => acc + (p.healthScore || 85), 0) / projects.length)
                : 85;

              const displayHealthScore = isGlobalBoard ? globalHealthScore : (currentProject.healthScore || 85);
              const displayTitle = isGlobalBoard ? 'Global Health' : 'Project Health';
              const displayStatus = isGlobalBoard ? 'GLOBAL' : currentProject.status.toUpperCase();
              const displaySubtext = isGlobalBoard 
                ? `${tasks.length} Total Tugas` 
                : `${tasks.filter(t => t.projectId === currentProject.id).length} Tugas`;

              return (
                <div className="p-2.5 rounded-lg bg-white dark:bg-elevated/60 border border-slate-200 dark:border-white/10 elevated-tray">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="truncate text-[11px]">{displayTitle}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      displayHealthScore >= 75 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}>
                      {displayHealthScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        displayHealthScore >= 75 ? 'bg-linear-to-r from-emerald-500 to-teal-400' : 'bg-linear-to-r from-amber-500 to-rose-400'
                      }`}
                      style={{ width: `${displayHealthScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[9.5px] text-slate-500 dark:text-slate-400">
                    <span className="truncate">{displaySubtext}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{displayStatus}</span>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          /* Compact Footer Icon View */
          <div className="flex flex-col items-center gap-2">
            <UserAvatar src={currentUser.avatar} name={currentUser.name} size="sm" />
            <button
              onClick={() => {
                setIsChangePasswordModalOpen(true);
              }}
              className="p-2 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-elevated transition"
              title="Ganti Password"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Aside (Auto-Hide / Icon-Only by Default with Smooth Hover & Pin) */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col justify-between shrink-0 h-full select-none text-slate-800 dark:text-readable bg-white dark:bg-canvas border-r border-slate-200 dark:border-white/10 transition-all duration-300 ease-in-out z-20 ${
          isExpanded ? 'w-64 shadow-xl' : 'w-16'
        }`}
      >
        {renderNavContent(isExpanded)}
      </aside>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Dark Backdrop Overlay */}
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" 
          />

          {/* Off-Canvas Slide Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-canvas border-r border-slate-200 dark:border-white/10 flex flex-col justify-between h-full shadow-2xl z-10 animate-slide-right text-slate-800 dark:text-slate-200">
            {/* Mobile Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-canvas-light dark:bg-canvas/80">
              <TechLogo size="sm" />
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-elevated transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Body (Always Full on Mobile) */}
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

