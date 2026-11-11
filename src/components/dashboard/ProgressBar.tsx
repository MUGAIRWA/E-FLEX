import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  label,
  color = 'bg-[#134E4A]',
  showPercentage = true
}: ProgressBarProps) {
  // Normalize any legacy gradient strings to clean brand solids
  const resolveFillClass = (rawColor: string) => {
    if (rawColor.includes('accent') || rawColor.includes('#C85A28')) {
      return 'bg-[#C85A28]';
    }
    if (rawColor.includes('success') || rawColor.includes('green') || rawColor.includes('#1E7A50')) {
      return 'bg-[#1E7A50]';
    }
    if (rawColor.includes('warning') || rawColor.includes('#D97706')) {
      return 'bg-[#D97706]';
    }
    if (rawColor.startsWith('bg-')) {
      return rawColor;
    }
    return 'bg-[#134E4A]';
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-[#3B4744]">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-[#16211E]">
              {progress}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-[#EFECE4] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className={`h-full ${resolveFillClass(color)} rounded-full`}
        />
      </div>
    </div>
  );
}