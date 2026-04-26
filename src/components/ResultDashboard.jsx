import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, FileText, AlertTriangle, ListChecks, CheckSquare, Loader2 } from 'lucide-react';
import RiskBadge from './RiskBadge';
import ProgressMeter from './ProgressMeter';
import ClauseItem from './ClauseItem';
import ModalPopup from './ModalPopup';
import ChatPanel from './ChatPanel';

export default function ResultDashboard({ data, onReset }) {
  const [selectedClause, setSelectedClause] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationMap, setExplanationMap] = useState({});
  const [rights, setRights] = useState([]);
  const [isFetchingRights, setIsFetchingRights] = useState(false);
  
  const API_BASE_URL = 'http://localhost:8000';

  const analysis = data?.analysis || {};
  const filename = data?.filename || 'document.pdf';
  
  // Mapping new JSON schema
  const keyClauses = analysis.keyClauses || [];
  const riskAlerts = analysis.riskAlerts || [];
  const verdict = analysis.verdict || 'Analysis completed.';
  const documentType = analysis.documentType || 'Unknown Document';
  const overallRiskLevel = analysis.riskLevel || 'Medium';

  const parsedScore = Number(analysis.riskScore);
  const score = isNaN(parsedScore) ? 50 : parsedScore;

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

  const handleExplain = async (clause) => {
    setSelectedClause(clause);
    if (explanationMap[clause.id]) return;

    setIsExplaining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clause_text: clause.originalText }),
      });
      if (!response.ok) throw new Error('Failed');
      const resData = await response.json();
      setExplanationMap(prev => ({ ...prev, [clause.id]: resData.explanation }));
    } catch (err) {
      setExplanationMap(prev => ({ ...prev, [clause.id]: 'Failed to load explanation.' }));
    } finally {
      setIsExplaining(false);
    }
  };

  const handleRefreshRights = async () => {
    setIsFetchingRights(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rights`);
      if (!response.ok) throw new Error('Failed');
      const resData = await response.json();
      setRights(resData.rights);
    } catch (err) {
      setRights(['Failed to load rights.']);
    } finally {
      setIsFetchingRights(false);
    }
  };

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
          <p className="text-white/60">{filename} • Scanned just now</p>
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
            <p className="text-white/80 leading-relaxed font-bold mb-2">
              Verdict: {verdict}
            </p>
            <p className="text-white/80 leading-relaxed">
              This document was identified as: {documentType}. The overall risk level is {overallRiskLevel}.
            </p>
          </motion.div>

          {/* Key Clauses */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-accent">
              <ListChecks size={20} />
              <h3 className="font-display font-semibold text-lg text-white">Key Clauses</h3>
            </div>
            <div className="flex flex-col gap-2">
              {keyClauses.map((clause, idx) => {
                const clauseId = `clause-${idx}`;
                return (
                  <ClauseItem 
                    key={clauseId} 
                    title={clause.type} 
                    text={clause.originalText} 
                    highlight={clause.type === 'Obligation' || clause.type === 'Restriction'}
                    onExplain={() => handleExplain({ ...clause, id: clauseId })}
                  />
                )
              })}
            </div>
          </motion.div>
          
          {/* Chat Panel */}
          <motion.div variants={itemVariants}>
            <ChatPanel />
          </motion.div>
          
        </div>

        {/* Right Column - Risks & Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Risk Score */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
             <ProgressMeter score={score} />
          </motion.div>

          {/* Identified Risks */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle size={20} />
              <h3 className="font-display font-semibold text-lg text-white">Risks Identified</h3>
            </div>
            <div className="flex flex-col gap-3">
              {riskAlerts.length > 0 ? riskAlerts.map((risk, idx) => (
                <div key={idx} className="bg-surface p-3 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{risk.risk}</span>
                    <RiskBadge level={overallRiskLevel} />
                  </div>
                  <p className="text-xs text-white/60 mb-1">{risk.whyItMatters}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{risk.location}</p>
                </div>
              )) : (
                <p className="text-sm text-white/60 italic">No significant risks found.</p>
              )}
            </div>
          </motion.div>

          {/* Rights & Actions */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 bg-gradient-to-br from-surface to-primary/5">
            <div className="flex items-center gap-3 mb-4 text-green-400">
              <CheckSquare size={20} />
              <h3 className="font-display font-semibold text-lg text-white">Suggested Actions</h3>
            </div>
            <ul className="text-sm text-white/80 space-y-3">
              {(analysis.actions || []).map((action, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="mt-1 bg-green-500/20 text-green-400 rounded-full p-0.5"><CheckSquare size={12}/></div>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* User Rights */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 bg-gradient-to-br from-surface to-accent/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-accent">
                <FileText size={20} />
                <h3 className="font-display font-semibold text-lg text-white">Your Rights</h3>
              </div>
              <button 
                onClick={handleRefreshRights}
                disabled={isFetchingRights}
                className="text-xs bg-surface hover:bg-surfaceHover border border-border px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isFetchingRights ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                Refresh Rights
              </button>
            </div>
            
            {rights.length > 0 ? (
              <ul className="text-sm text-white/80 space-y-3">
                {rights.map((right, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="mt-1 bg-accent/20 text-accent rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0">{idx + 1}</div>
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50 italic">Click refresh to extract your rights from this document.</p>
            )}
          </motion.div>

        </div>
      </div>

      <ModalPopup 
        isOpen={!!selectedClause} 
        onClose={() => setSelectedClause(null)} 
        clause={{
          title: selectedClause?.type,
          text: selectedClause?.originalText,
        }} 
        explanation={selectedClause ? explanationMap[selectedClause.id] : null}
        isLoading={isExplaining}
      />
    </motion.div>
  );
}
