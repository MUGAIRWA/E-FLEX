import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, ClockIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from './ProgressBar';

interface SubjectCardProps {
  subject: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  nextClass?: string;
  color: string;
}

export function SubjectCard({
  subject,
  progress,
  totalModules,
  completedModules,
  nextClass,
  color
}: SubjectCardProps) {
  const resolveBadgeColor = (rawColor: string) => {
    if (rawColor.includes('accent') || rawColor.includes('#C85A28')) {
      return 'bg-[#C85A28] text-white';
    }
    if (rawColor.includes('success') || rawColor.includes('green') || rawColor.includes('#1E7A50')) {
      return 'bg-[#1E7A50] text-white';
    }
    if (rawColor.startsWith('bg-')) {
      return `${rawColor} text-white`;
    }
    return 'bg-[#134E4A] text-white';
  };

  return (
    <Card className="hover:border-[#134E4A]/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${resolveBadgeColor(
            color
          )} flex items-center justify-center shadow-sm`}
        >
          <BookOpenIcon className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-[#3B4744] bg-[#F4F1EA] border border-[#E5E0D5] px-3 py-1 rounded-full">
          {completedModules}/{totalModules} Modules
        </span>
      </div>
      <h3 className="font-poppins font-bold text-xl mb-3 text-[#16211E]">
        {subject}
      </h3>
      <ProgressBar progress={progress} color={color} />
      {nextClass && (
        <div className="mt-4 flex items-center text-sm text-[#5C6663]">
          <ClockIcon className="w-4 h-4 mr-2 text-[#C85A28]" />
          <span>Next: {nextClass}</span>
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full mt-5 bg-[#134E4A] hover:bg-[#0E3B38] text-white py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
      >
        Continue Learning
      </motion.button>
    </Card>
  );
}