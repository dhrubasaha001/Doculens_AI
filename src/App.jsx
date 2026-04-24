import { useState } from 'react'
import UploadCard from './components/UploadCard'
import ResultDashboard from './components/ResultDashboard'
import { FileText, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

function App() {
  const [analysisState, setAnalysisState] = useState('idle') // idle, analyzing, complete
  
  const handleAnalyze = () => {
    setAnalysisState('analyzing')
    // Simulate API call
    setTimeout(() => {
      setAnalysisState('complete')
    }, 4000)
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-background">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      
      {/* Navbar */}
      <header className="w-full relative z-10 border-b border-border bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <FileText size={20} />
            </div>
            <span className="font-display font-bold text-xl tracking-wide">DocuLens AI</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <Sparkles size={16} className="text-accent" />
            Upgrade to Pro
          </motion.button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 relative z-10 flex flex-col pt-12 md:pt-20">
        {analysisState !== 'complete' ? (
          <UploadCard 
            isAnalyzing={analysisState === 'analyzing'} 
            onAnalyze={handleAnalyze} 
          />
        ) : (
          <ResultDashboard onReset={() => setAnalysisState('idle')} />
        )}
      </main>
    </div>
  )
}

export default App
