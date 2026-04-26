import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, LogIn, Github } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/50 text-sm">Sign in to access your saved documents</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="email"
                    defaultValue="example@email.com"
                    placeholder="you@example.com"
                    className="w-full bg-surfaceHover border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-white/70">Password</label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="password"
                    defaultValue="password123"
                    placeholder="••••••••"
                    className="w-full bg-surfaceHover border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
              >
                <LogIn size={18} />
                Sign In
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-2 text-white/40">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-surfaceHover border border-border hover:bg-surface/80 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                  <Github size={18} />
                  GitHub
                </button>
                <button className="flex-1 bg-surfaceHover border border-border hover:bg-surface/80 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-white/50 mt-8">
              Don't have an account? <a href="#" className="text-primary hover:underline">Sign up</a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
