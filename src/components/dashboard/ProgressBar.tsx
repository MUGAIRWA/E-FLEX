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
  color = 'from-primary to-accent',
  showPercentage = true
}: ProgressBarProps) {
  return <div className="w-full">
      {label && <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && <span className="text-sm font-semibold text-gray-800">
              {progress}%
            </span>}
        </div>}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div initial={{
        width: 0
      }} animate={{
        width: `${progress}%`
      }} transition={{
        duration: 1,
        ease: 'easeOut'
      }} className={`h-full bg-gradient-to-r ${color} rounded-full`} />
      </div>
    </div>;
}