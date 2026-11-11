import React from 'react';
import { motion } from 'framer-motion';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}
export function Card({
  children,
  className = '',
  hover = true
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -2
            }
          : {}
      }
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl border border-[#E6E1D6] shadow-[0_2px_10px_-3px_rgba(22,33,30,0.05)] p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}