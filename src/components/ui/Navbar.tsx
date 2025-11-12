import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MenuIcon, XIcon, BellIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore: no types for JS AuthContext
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './Button';
interface NavbarProps {
  isLoggedIn?: boolean;
}
export function Navbar({
  isLoggedIn = false
}: NavbarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleDashboard = () => {
    const roleRoutes = {
      admin: '/admin',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent'
    } as const;

    const role = user?.role;
    if (typeof role === 'string' && role in roleRoutes) {
      navigate(roleRoutes[role as keyof typeof roleRoutes]);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <motion.div whileHover={{
            scale: 1.1
          }} className="font-poppins font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              E-Flex
            </motion.div>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-primary transition-colors">
              Testimonials
            </a>
            {isAuthenticated ? <div className="flex items-center space-x-4">
                <motion.button whileHover={{
              scale: 1.1
            }} className="relative">
                  <BellIcon className="w-6 h-6 text-gray-700" />
                  <span className="absolute -top-1 -right-1 bg-warning text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </motion.button>
                <Button variant="primary" size="sm" onClick={handleDashboard}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div> : <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handleLogin}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && <motion.div initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <a href="#features" className="block text-gray-700 hover:text-primary py-2">
              Features
            </a>
            <a href="#about" className="block text-gray-700 hover:text-primary py-2">
              About
            </a>
            <a href="#testimonials" className="block text-gray-700 hover:text-primary py-2">
              Testimonials
            </a>
            {isAuthenticated ? <div className="flex flex-col space-y-2">
                <Button variant="primary" size="sm" className="w-full" onClick={handleDashboard}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </div> : <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogin}>
                  Login
                </Button>
                <Button variant="primary" size="sm" className="w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>}
          </div>
        </motion.div>}
    </nav>;
}