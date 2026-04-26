import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadCard({ isAnalyzing, onAnalyzeComplete, setAnalysisState }) {
  const [isHovering, setIsHovering] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [hasFile, setHasFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setHasFile(true);
      setFileName(e.target.files[0].name);
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setHasFile(true);
      setFileName(e.dataTransfer.files[0].name);
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const API_BASE_URL = 'http://localhost:8000';

  const handleAnalyzeClick = async () => {
    setErrorMsg('');
    setAnalysisState('analyzing');
    
    try {
      let resultData;
      if (uploadMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Analysis failed. Backend returned status: ' + response.status);
        resultData = await response.json();
      } else if (uploadMode === 'text' && textInput.trim()) {
        const blob = new Blob([textInput], { type: 'text/plain' });
        const file = new File([blob], 'pasted-text.txt', { type: 'text/plain' });
        
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Analysis failed. Backend returned status: ' + response.status);
        resultData = await response.json();
      } else {
        setErrorMsg('Please upload a file or paste some text first.');
        setAnalysisState('idle');
        return;
      }
      
      onAnalyzeComplete(resultData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect to the server. Make sure the FastAPI backend is running.');
      setAnalysisState('idle');
    }
  };

  const loadingMessages = [
    "Scanning document...",
    "Extracting clauses...",
    "Analyzing risks...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  // Simulate progress when analyzing
  React.useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, loadingMessages.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl w-full mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur-md"
        >
          <span className="text-sm font-medium tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI-Powered Legal Analysis</span>
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent transform transition-all hover:scale-[1.02] duration-500">
          Understand Legal Docs<br/>
          <span className="bg-gradient-to-r from-primary via-[#8A2BE2] to-accent bg-clip-text text-transparent">Instantly.</span>
        </h1>
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Upload a contract, agreement, or notice. Our AI will instantly isolate risks, summarize clauses, and suggest next steps with pinpoint accuracy.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
        <AnimatePresence mode="wait">
          {!isAnalyzing ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex gap-4 mb-6 border-b border-border pb-4">
                <button
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 text-sm font-medium pb-2 transition-colors ${uploadMode === 'file' ? 'text-primary border-b-2 border-primary' : 'text-white/50 hover:text-white/80'}`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMode('text')}
                  className={`flex-1 text-sm font-medium pb-2 transition-colors ${uploadMode === 'text' ? 'text-primary border-b-2 border-primary' : 'text-white/50 hover:text-white/80'}`}
                >
                  Paste Text instead
                </button>
              </div>

              {uploadMode === 'file' ? (
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative group overflow-hidden ${isHovering ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border/60 hover:border-primary/50'} ${hasFile ? 'bg-gradient-to-b from-surfaceHover to-surface border-primary/50 shadow-[0_0_30px_rgba(67,97,238,0.15)]' : 'bg-surface/30'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                  onDragLeave={() => setIsHovering(false)}
                  onDrop={handleDrop}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                  
                  {hasFile ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 text-primary rounded-full flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(67,97,238,0.2)] ring-4 ring-primary/10">
                        <File size={36} className="text-primary drop-shadow-md" />
                      </div>
                      <p className="font-display font-medium text-xl text-white mb-2">{fileName || 'document.pdf'}</p>
                      <p className="text-sm text-white/50 mt-1">Ready for analysis</p>
                      <button 
                        onClick={() => {
                          setHasFile(false);
                          setSelectedFile(null);
                        }}
                        className="text-xs text-red-400 mt-4 underline underline-offset-2 hover:text-red-300"
                      >
                        Remove file
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center z-10 relative"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-20 h-20 bg-surface/80 border border-border/50 text-white/50 rounded-full flex items-center justify-center mb-5 shadow-inner transition-colors group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5"
                      >
                        <UploadCloud size={36} />
                      </motion.div>
                      <p className="font-display font-medium text-xl mb-2 text-white/90">Drag & drop your document</p>
                      <p className="text-sm text-white/40 mb-8 max-w-[250px] mx-auto">Supports PDF files up to 50MB</p>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".pdf"
                      />
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-background font-medium px-6 py-2.5 rounded-full text-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all pointer-events-auto flex items-center gap-2"
                      >
                        Browse Files
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <textarea 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full h-48 bg-surface/50 backdrop-blur-md border border-border/80 rounded-xl p-5 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/50 resize-none transition-all relative z-10 shadow-inner"
                    placeholder="Paste your legal text here... Our engine will process it just like a document."
                  />
                </motion.div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <motion.button 
                  whileHover={(!hasFile && !textInput) ? {} : { scale: 1.02 }}
                  whileTap={(!hasFile && !textInput) ? {} : { scale: 0.98 }}
                  onClick={handleAnalyzeClick}
                  disabled={!hasFile && !textInput.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(67,97,238,0.4)] hover:shadow-[0_0_30px_rgba(67,97,238,0.6)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles size={18} />
                    Analyze Document
                  </span>
                </motion.button>
              </div>
              
              {errorMsg && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <p className="text-sm text-red-400">{errorMsg}</p>
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
                <AlertCircle size={14} />
                <span>DocuLens AI analyzes documents but does not constitute legal advice.</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 size={48} className="text-primary animate-spin mb-6" />
              <motion.p 
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium text-white/80"
              >
                {loadingMessages[messageIndex]}
              </motion.p>
              <div className="w-48 h-1 bg-surfaceHover rounded-full mt-6 overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
