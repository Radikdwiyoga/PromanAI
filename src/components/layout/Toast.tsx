import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useProject();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
    warning: 'border-amber-500/30 bg-amber-950/80 text-amber-100',
    info: 'border-sky-500/30 bg-sky-950/80 text-sky-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-md border backdrop-blur-md z3-overlay ${borders[toastMessage.type]}`}>
        {icons[toastMessage.type]}
        <p className="text-sm font-medium">{toastMessage.text}</p>
      </div>
    </div>
  );
};
