import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight, 
  User, 
  AlertTriangle, 
  HelpCircle, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const ProjectCopilotDrawer: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    copilotMessages,
    sendCopilotQuery,
    setSelectedTaskId,
    setActiveView,
    setIsSummaryModalOpen,
    setIsAIBreakdownModalOpen,
  } = useProject();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isCopilotOpen) {
      scrollToBottom();
    }
  }, [copilotMessages, isCopilotOpen]);

  if (!isCopilotOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    sendCopilotQuery(inputQuery);
    setInputQuery('');
  };

  const handleChipClick = (suggestion: string) => {
    sendCopilotQuery(suggestion);
  };

  const handleActionClick = (actionLink: { type: string; payload: string }) => {
    if (actionLink.type === 'open_risk') {
      setActiveView('risk_dashboard');
    } else if (actionLink.type === 'open_workload') {
      setActiveView('resource_allocation');
    } else if (actionLink.type === 'filter_status') {
      setIsSummaryModalOpen(true);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white/95 dark:bg-slate-900/98 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col backdrop-blur-xl animate-slide-left text-slate-800 dark:text-slate-100 transition-colors">
      {/* Copilot Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 dark:from-indigo-950/80 via-purple-50 dark:via-purple-950/80 to-white dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Copilot</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 font-semibold">
                ProMan AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Asisten AI Cerdas ProMan</p>
          </div>
        </div>

        <button
          onClick={() => setIsCopilotOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {copilotMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                </div>
              )}

              <div className="max-w-[85%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none font-medium shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Action Link button */}
                  {msg.actionLink && (
                    <button
                      onClick={() => handleActionClick(msg.actionLink!)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-semibold transition text-[11px]"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Suggestions Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleChipClick(sug)}
                        className="text-[10px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition shadow-xs"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tanyakan status proyek, risiko, atau kapasitas..."
            className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="absolute right-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
