import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, FileText, AlertTriangle, ListChecks, CheckSquare } from 'lucide-react';
import RiskBadge from './RiskBadge';
import ProgressMeter from './ProgressMeter';
import ClauseItem from './ClauseItem';
import ModalPopup from './ModalPopup';

export default function ResultDashboard({ onReset }) {
  const [selectedClause, setSelectedClause] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  const dummyClauses = [
    {
      id: 1,
      title: 'Indemnification Clause',
      text: 'The user agrees to indemnify and hold harmless the Company from any claims resulting from use of the service.',
      highlight: true,
      explanation: 'You are taking full financial responsibility if someone sues the company because of how you used their service. This is a significant risk.'
    },
    {
      id: 2,
      title: 'Auto-Renewal',
      text: 'This agreement shall automatically renew for successive one-year terms unless either party provides 30 days written notice.',
      highlight: false,
      explanation: 'You will continue to be billed every year unless you remember to cancel at least 30 days before the renewal date.'
    },
    {
      id: 3,
      title: 'Data Collection',
      text: 'Company may collect and process telemetry data regarding user behavior for service improvement.',
      highlight: false,
      explanation: 'The company tracks how you use the app. They use this data to make the app better, but it means your actions are being monitored.'
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full pb-20"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Analysis Complete</h2>
          <p className="text-white/60">document.pdf • Scanned just now</p>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-sm bg-surface hover:bg-surfaceHover border border-border px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCcw size={16} />
          Analyze New Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Summary Card */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <FileText size={20} />
              <h3 className="font-display font-semibold text-lg text-white">Summary</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              This document is a standard Non-Disclosure Agreement (NDA). It outlines the confidentiality requirements between both parties. The terms are generally standard, but there are strict penalties for data breaches. The duration of confidentiality extends for 5 years post-termination.
            </p>
          </motion.div>

          {/* Key Clauses */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-accent">
              <ListChecks size={20} />
              <h3 className="font-display font-semibold text-lg text-white">Key Clauses</h3>
            </div>
            <div className="flex flex-col gap-2">
              {dummyClauses.map((clause) => (
                <ClauseItem 
                  key={clause.id} 
                  title={clause.title} 
                  text={clause.text} 
                  highlight={clause.highlight}
                  onExplain={() => setSelectedClause(clause)}
                />
              ))}
            </div>
          </motion.div>
          
        </div>

        {/* Right Column - Risks & Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Risk Score */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
             <ProgressMeter score={78} />
          </motion.div>

          {/* Identified Risks */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle size={20} />
              <h3 className="font-display font-semibold text-lg text-white">Risks Identified</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-surface p-3 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">Uncapped Liability</span>
                  <RiskBadge level="High" />
                </div>
                <p className="text-xs text-white/60">Section 4.2 does not cap your financial liability in a breach.</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">Governing Law</span>
                  <RiskBadge level="Medium" />
                </div>
                <p className="text-xs text-white/60">Jurisdiction is set to Delaware, which may be inconvenient.</p>
              </div>
            </div>
          </motion.div>

          {/* Rights & Actions */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 bg-gradient-to-br from-surface to-primary/5">
            <div className="flex items-center gap-3 mb-4 text-green-400">
              <CheckSquare size={20} />
              <h3 className="font-display font-semibold text-lg text-white">Suggested Actions</h3>
            </div>
            <ul className="text-sm text-white/80 space-y-3">
              <li className="flex items-start gap-2">
                <div className="mt-1 bg-green-500/20 text-green-400 rounded-full p-0.5"><CheckSquare size={12}/></div>
                <span>Negotiate a cap on liability (suggested: $10,000 maximum).</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 bg-green-500/20 text-green-400 rounded-full p-0.5"><CheckSquare size={12}/></div>
                <span>Opt-out of auto-renewal via email to legal@company.com within 30 days.</span>
              </li>
            </ul>
          </motion.div>

        </div>
      </div>

      <ModalPopup 
        isOpen={!!selectedClause} 
        onClose={() => setSelectedClause(null)} 
        clause={selectedClause} 
      />
    </motion.div>
  );
}
