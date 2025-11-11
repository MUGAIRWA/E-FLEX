import React from 'react';
import { motion } from 'framer-motion';
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl';
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white hover:scale-105',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  return <motion.button whileHover={{
    scale: 1.05
  }} whileTap={{
    scale: 0.95
  }} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} type={type}>
      {children}
    </motion.button>;
}