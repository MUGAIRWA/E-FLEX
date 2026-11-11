import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MenuIcon, XIcon, BellIcon, BookOpenIcon } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// @ts-ignore: no types for JS AuthContext
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Button } from './Button';

interface NavbarProps {
  isLoggedIn?: boolean;
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionLink = (hash: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${hash}`);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/auth');
  };

  const handleGetStarted = () => {
    setIsOpen(false);
    navigate('/auth');
  };

  const handleDashboard = () => {
    setIsOpen(false);
    const roleRoutes = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard'
    } as const;

    const role = user?.role;
    if (typeof role === 'string' && role in roleRoutes) {
      navigate(roleRoutes[role as keyof typeof roleRoutes]);
    } else {
      navigate('/');
    }
  };

  const getUserDisplayName = () => {
    if (user && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'User';
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#F8F6F1]/95 backdrop-blur-md border-b border-[#E5E0D5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="eflex"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              type="button"
              onClick={() => handleSectionLink('#features')}
              className="text-sm font-medium text-[#3B4744] hover:text-[#134E4A] transition-colors"
            >
              Curriculum & Tools
            </button>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${location.pathname === '/about'
                  ? 'text-[#134E4A] font-semibold underline decoration-[#C85A28] decoration-2 underline-offset-8'
                  : 'text-[#3B4744] hover:text-[#134E4A]'
                }`}
            >
              Our Story
            </Link>
            <button
              type="button"
              onClick={() => handleSectionLink('#testimonials')}
              className="text-sm font-medium text-[#3B4744] hover:text-[#134E4A] transition-colors"
            >
              Schools & Families
            </button>

            <div className="h-5 w-px bg-[#DCD6C8]" />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDashboard}
                  className="relative p-2 rounded-lg text-[#3B4744] hover:bg-[#EFECE4] transition-colors"
                  aria-label="View notifications in dashboard"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#C85A28] text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <span className="text-sm font-medium text-[#3B4744]">
                  {getUserDisplayName()}
                </span>
                <Button variant="primary" size="sm" onClick={handleDashboard}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm font-semibold text-[#16211E] hover:text-[#134E4A] transition-colors"
                >
                  Sign In
                </button>
                <Button variant="primary" size="sm" onClick={handleGetStarted}>
                  Enroll Now
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[#16211E] hover:bg-[#EFECE4]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#F8F6F1] border-t border-[#E5E0D5]"
        >
          <div className="px-4 pt-3 pb-6 space-y-2">
            <button
              type="button"
              onClick={() => handleSectionLink('#features')}
              className="block w-full text-left text-sm font-medium text-[#3B4744] hover:text-[#134E4A] py-2.5"
            >
              Curriculum & Tools
            </button>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block text-sm font-medium text-[#3B4744] hover:text-[#134E4A] py-2.5"
            >
              Our Story
            </Link>
            <button
              type="button"
              onClick={() => handleSectionLink('#testimonials')}
              className="block w-full text-left text-sm font-medium text-[#3B4744] hover:text-[#134E4A] py-2.5"
            >
              Schools & Families
            </button>

            <div className="pt-3 border-t border-[#E5E0D5]">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-medium text-[#5C6663] pb-1">
                    Signed in as {getUserDisplayName()}
                  </span>
                  <Button variant="primary" size="sm" className="w-full" onClick={handleDashboard}>
                    Open Dashboard
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogin}>
                    Sign In
                  </Button>
                  <Button variant="primary" size="sm" className="w-full" onClick={handleGetStarted}>
                    Enroll Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
