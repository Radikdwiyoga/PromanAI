import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '../../types';

export const CalendarView: React.FC = () => {
  const { filteredTasks, setSelectedTaskId } = useProject();

  const today = new Date();
  const todayDay   = today.getDate();
  const todayMonth = today.getMonth(); // 0-indexed
  const todayYear  = today.getFullYear();

  const [currentMonth, setCurrentMonth] = useState<number>(todayMonth);
  const [currentYear, setCurrentYear]   = useState<number>(todayYear);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Days in current month
  const daysInMonth   = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToToday = () => {
    setCurrentMonth(todayMonth);
    setCurrentYear(todayYear);
  };

  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    medium: 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
    high: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    urgent: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-bold',
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 space-y-4 text-slate-800 dark:text-readable transition-colors">
      {/* Calendar Header Nav */}
      <div className="flex items-center justify-between gap-3 shrink-0 pb-1">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>{monthNames[currentMonth]} {currentYear}</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-muted hidden sm:inline">
            Jadwal Tenggat Tugas &amp; Milestone
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 rounded-lg p-1 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-muted dark:hover:text-readable hover:bg-slate-100 dark:hover:bg-white/6 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-signal hover:underline font-mono"
          >
            Bulan Ini
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-muted dark:hover:text-readable hover:bg-slate-100 dark:hover:bg-white/6 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 min-h-0 bg-white dark:bg-surface/70 backdrop-blur border border-slate-200 dark:border-white/8 rounded-lg overflow-hidden flex flex-col shadow-sm elevated-tray">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-canvas/60 text-center text-xs font-bold text-slate-500 dark:text-muted py-2.5 font-mono uppercase tracking-wider">
          {daysOfWeek.map((day, idx) => (
            <div key={idx}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-100 dark:divide-white/6 overflow-auto" style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}>
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-white/2 p-2 min-h-[90px]" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
            // Tampilkan task pada seluruh hari dalam rentang durasinya (format YYYY-MM-DD bisa dibandingkan leksikografis)
            const dayTasks = filteredTasks.filter(t =>
              formattedDate >= t.startDate && formattedDate <= t.dueDate
            );
            const isToday = dayNumber === todayDay && currentMonth === todayMonth && currentYear === todayYear;

            return (
              <div 
                key={dayNumber} 
                className={`p-2 min-h-[90px] flex flex-col justify-between transition hover:bg-slate-50 dark:hover:bg-white/4 ${
                  isToday ? 'bg-emerald-50/40 dark:bg-emerald-500/8' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-emerald-600 text-white font-extrabold shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {dayNumber}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dayTasks.length} tugas
                    </span>
                  )}
                </div>

                {/* Day Tasks Snippets */}
                <div className="space-y-1 my-1 overflow-y-auto max-h-16 touch-scroll-y">
                  {dayTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`w-full text-left p-1 rounded-lg text-[10px] truncate border transition shadow-xs flex items-center gap-1 ${priorityColors[t.priority]}`}
                    >
                      {t.aiRisk && t.aiRisk.riskLevel === 'high' && (
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                      )}
                      <span className="truncate">{t.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
