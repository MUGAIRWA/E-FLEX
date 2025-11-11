import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, TrophyIcon, ClockIcon } from 'lucide-react';
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
  return <Card className="hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <BookOpenIcon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {completedModules}/{totalModules} Modules
        </span>
      </div>
      <h3 className="font-poppins font-bold text-xl mb-3 text-gray-800">
        {subject}
      </h3>
      <ProgressBar progress={progress} color={color} />
      {nextClass && <div className="mt-4 flex items-center text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 mr-2" />
          <span>Next: {nextClass}</span>
        </div>}
      <motion.button whileHover={{
      scale: 1.02
    }} whileTap={{
      scale: 0.98
    }} className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
        Continue Learning
      </motion.button>
    </Card>;
}