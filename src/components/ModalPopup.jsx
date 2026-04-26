import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';

export default function ModalPopup({ isOpen, onClose, clause, explanation, isLoading }) {
  if (!clause) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-surfaceHover">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles size={18} />
                <span className="font-display font-semibold tracking-wide text-sm">AI Explanation</span>
              </div>
              <button 
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{clause.title}</h3>
              <div className="bg-surface p-4 rounded-xl border border-border mb-6">
                <p className="text-sm font-medium text-white/50 mb-1">Original Text:</p>
                <p className="text-sm text-white/80 italic">"{clause.text}"</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/50 mb-2">Plain English:</p>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Analyzing clause...</span>
                  </div>
                ) : (
                  <p className="text-white/90 leading-relaxed text-base">
                    {explanation || "No explanation available for this clause."}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-surface/50 border-t border-border p-4 flex justify-end">
              <button 
                onClick={onClose}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
