import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function UpgradeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const features = [
    "Unlimited document analysis",
    "Priority AI processing speed",
    "Advanced risk detection algorithms",
    "Export reports to PDF/Word",
    "24/7 dedicated support"
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-surface border border-primary/30 rounded-3xl shadow-[0_0_50px_rgba(67,97,238,0.2)] overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[200px] bg-primary/20 blur-[100px] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors bg-background/50 rounded-full p-1"
          >
            <X size={20} />
          </button>

          <div className="p-8 relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 border border-primary/30 shadow-[0_0_30px_rgba(67,97,238,0.3)] text-primary">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-3">Upgrade to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pro</span></h2>
              <p className="text-white/60">Unlock the full power of DocuLens AI and protect yourself from hidden legal risks.</p>
            </div>

            <div className="bg-background/50 border border-border rounded-2xl p-6 mb-8">
              <ul className="space-y-4">
                {features.map((feature, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <CheckCircle2 size={18} className="text-accent shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(67,97,238,0.4)] flex items-center justify-center gap-2 text-lg group"
              >
                <Zap size={20} className="group-hover:animate-pulse" />
                Upgrade Now - $9.99/mo
              </button>
              <p className="text-center text-xs text-white/40">
                Cancel anytime. No questions asked.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
