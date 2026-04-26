import React, { useEffect, useState } from 'react';

export default function ProgressMeter({ score }) {
  const [currentScore, setCurrentScore] = useState(0);
  
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentScore(validScore);
    }, 100);
    return () => clearTimeout(t);
  }, [validScore]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;
  
  let strokeColor = '#22c55e'; // green-500
  if (currentScore > 33) strokeColor = '#eab308'; // yellow-500
  if (currentScore > 66) strokeColor = '#ef4444'; // red-500

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{currentScore}</span>
        </div>
      </div>
      <span className="text-xs text-white/50 mt-4 font-medium uppercase tracking-wider text-center">Document<br/>Risk Score</span>
    </div>
  );
}
