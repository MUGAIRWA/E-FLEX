import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  type = 'button',
  disabled = false
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-[#134E4A] text-[#FAF8F5] hover:bg-[#0E3B38] shadow-sm border border-[#134E4A]',
    secondary:
      'bg-[#C85A28] text-white hover:bg-[#B24D1F] shadow-sm border border-[#C85A28]',
    outline:
      'bg-white text-[#16211E] border border-[#D8D1C4] hover:border-[#134E4A] hover:text-[#134E4A] hover:bg-[#F8F6F1]'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm sm:text-base',
    lg: 'px-7 py-3.5 text-base'
  };

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={disabled ? undefined : onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
