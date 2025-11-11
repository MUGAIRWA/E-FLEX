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
  return <motion.div whileHover={hover ? {
    y: -5,
    shadow: '0 20px 40px rgba(0,0,0,0.1)'
  } : {}} className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>
      {children}
    </motion.div>;
}