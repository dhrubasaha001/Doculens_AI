import React, { useEffect, useState } from 'react';

export default function ProgressMeter({ score }) {
  const [currentScore, setCurrentScore] = useState(0);
  
  useEffect(() => {
    // animate score
    const t = setTimeout(() => {
      setCurrentScore(score);
    }, 300);
    return () => clearTimeout(t);
  }, [score]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;
  
  let colorClass = 'text-green-500';
  if (currentScore > 33) colorClass = 'text-yellow-500';
  if (currentScore > 66) colorClass = 'text-red-500';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-surfaceHover"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{currentScore}</span>
        </div>
      </div>
      <span className="text-xs text-white/50 mt-2 font-medium uppercase tracking-wider text-center">Document<br/>Risk Score</span>
    </div>
  );
}
