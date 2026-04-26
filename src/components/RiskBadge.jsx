import React from 'react';

export default function RiskBadge({ level }) {
  const styles = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const labels = {
    high: '🔴 High Risk',
    medium: '🟡 Medium Risk',
    low: '🟢 Low Risk',
  };

  const riskKey = level.toLowerCase();

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${styles[riskKey]}`}>
      {labels[riskKey]}
    </span>
  );
}
