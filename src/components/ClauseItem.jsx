import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function ClauseItem({ title, text, highlight, onExplain }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl hover:bg-surfaceHover border border-transparent hover:border-border transition-colors group relative">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
            {title}
            {highlight && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Important</span>}
          </h4>
          <p className="text-sm text-white/70 leading-relaxed">{text}</p>
        </div>
        <button 
          onClick={onExplain}
          className="shrink-0 p-2 text-white/40 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors flex items-center gap-1"
          title="Explain this clause"
        >
          <HelpCircle size={18} />
          <span className="text-xs font-medium hidden sm:inline">Explain</span>
        </button>
      </div>
    </div>
  );
}
