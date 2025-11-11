import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, FileTextIcon, UsersIcon, BellIcon, HelpCircleIcon, MenuIcon, XIcon, LogOutIcon, SettingsIcon, UploadIcon, ClipboardCheckIcon, TrendingUpIcon, CreditCardIcon } from 'lucide-react';
interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'student' | 'teacher' | 'parent' | 'admin';
}

interface UserInfo {
  name: string;
  role: string;
  avatar: string;
}
export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  userRole
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    // Navigate to landing page
    navigate('/');
  };
  const studentTabs = [{
    id: 'overview',
    label: 'Overview',
    icon: <HomeIcon className="w-5 h-5" />
  }, {
    id: 'modules',
    label: 'Modules',
    icon: <BookOpenIcon className="w-5 h-5" />
  }, {
    id: 'assignments',
    label: 'Assignments',
    icon: <FileTextIcon className="w-5 h-5" />
  }, {
    id: 'community',
    label: 'Community',
    icon: <UsersIcon className="w-5 h-5" />
  }, {
    id: 'announcements',
    label: 'Announcements',
    icon: <BellIcon className="w-5 h-5" />
  }, {
    id: 'support',
    label: 'Support',
    icon: <HelpCircleIcon className="w-5 h-5" />
  }, {
    id: 'payment',
    label: 'Payment',
    icon: <CreditCardIcon className="w-5 h-5" />
  }, {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon className="w-5 h-5" />
  }];
  const teacherTabs = [{
    id: 'overview',
    label: 'Overview',
    icon: <HomeIcon className="w-5 h-5" />
  }, {
    id: 'upload',
    label: 'Upload Content',
    icon: <UploadIcon className="w-5 h-5" />
  }, {
    id: 'gradebook',
    label: 'Gradebook',
    icon: <ClipboardCheckIcon className="w-5 h-5" />
  }, {
    id: 'progress',
    label: 'Student Progress',
    icon: <TrendingUpIcon className="w-5 h-5" />
  }, {
    id: 'announcements',
    label: 'Announcements',
    icon: <BellIcon className="w-5 h-5" />
  }];
  const parentTabs = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon className="w-5 h-5" />
  }, {
    id: 'progress-report',
    label: 'Progress Report',
    icon: <TrendingUpIcon className="w-5 h-5" />
  }, {
    id: 'payments',
    label: 'Payments',
    icon: <CreditCardIcon className="w-5 h-5" />
  }, {
    id: 'announcements',
    label: 'Announcements',
    icon: <BellIcon className="w-5 h-5" />
  }, {
    id: 'messages-support',
    label: 'Messages / Support',
    icon: <HelpCircleIcon className="w-5 h-5" />
  }];
  const adminTabs = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon className="w-5 h-5" />
  }, {
    id: 'user-management',
    label: 'User Management',
    icon: <UsersIcon className="w-5 h-5" />
  }, {
    id: 'content-moderation',
    label: 'Content Moderation',
    icon: <BookOpenIcon className="w-5 h-5" />
  }, {
    id: 'finance-dashboard',
    label: 'Finance Dashboard',
    icon: <CreditCardIcon className="w-5 h-5" />
  }, {
    id: 'analytics-reports',
    label: 'Analytics & Reports',
    icon: <TrendingUpIcon className="w-5 h-5" />
  }, {
    id: 'classes-streams',
    label: 'Classes & Streams',
    icon: <ClipboardCheckIcon className="w-5 h-5" />
  }, {
    id: 'teachers-overview',
    label: 'Teachers Overview',
    icon: <UploadIcon className="w-5 h-5" />
  }, {
    id: 'tickets-support',
    label: 'Tickets / Support',
    icon: <HelpCircleIcon className="w-5 h-5" />
  }, {
    id: 'announcements',
    label: 'Announcements',
    icon: <BellIcon className="w-5 h-5" />
  }, {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon className="w-5 h-5" />
  }];
  const tabs = userRole === 'student' ? studentTabs : userRole === 'teacher' ? teacherTabs : userRole === 'parent' ? parentTabs : userRole === 'admin' ? adminTabs : [];
  const getUserInfo = (): UserInfo => {
    if (userRole === 'teacher') {
      return {
        name: 'Ms. Sarah Johnson',
        role: 'Mathematics Teacher',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher'
      };
    }
    if (userRole === 'parent') {
      return {
        name: 'Mrs. Jane Doe',
        role: 'Parent',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Parent'
      };
    }
    if (userRole === 'admin') {
      return {
        name: 'Admin User',
        role: 'Administrator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
      };
    }
    return {
      name: 'John Doe',
      role: 'Form 3 Student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student'
    };
  };
  const userInfo = getUserInfo();
  return <div className="min-h-screen w-full bg-background">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setIsMobileSidebarOpen(!isMobileSidebarOpen);
            }} className="text-gray-700 hover:text-primary transition-colors">
                {isMobileSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
              <div className="font-poppins font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                E-Flex
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button whileHover={{
              scale: 1.1
            }} className="relative p-2 text-gray-700 hover:text-primary transition-colors">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-0 right-0 bg-warning text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {userRole === 'teacher' ? '5' : '3'}
                </span>
              </motion.button>
              <div className="flex items-center space-x-3">
                <img src={userInfo.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-primary" />
                <div className="hidden md:block">
                  <p className="font-semibold text-sm text-gray-800">
                    {userInfo.name}
                  </p>
                  <p className="text-xs text-gray-500">{userInfo.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex">
        {/* Desktop Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && <motion.aside initial={{
          x: -300,
          opacity: 0
        }} animate={{
          x: 0,
          opacity: 1
        }} exit={{
          x: -300,
          opacity: 0
        }} className="hidden md:block w-64 bg-white shadow-lg min-h-screen">
              <div className="p-6 space-y-2">
                {tabs.map(tab => <motion.button key={tab.id} whileHover={{
              x: 5
            }} onClick={() => onTabChange(tab.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>)}
                <div className="pt-6 mt-6 border-t border-gray-200 space-y-2">
                  <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all">
                    <LogOutIcon className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>}
        </AnimatePresence>
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileSidebarOpen(false)}>
              <motion.aside initial={{
            x: -300
          }} animate={{
            x: 0
          }} exit={{
            x: -300
          }} className="w-64 bg-white shadow-lg min-h-screen" onClick={e => e.stopPropagation()}>
                <div className="p-6 space-y-2">
                  {tabs.map(tab => <motion.button key={tab.id} whileHover={{
                x: 5
              }} onClick={() => {
                onTabChange(tab.id);
                setIsMobileSidebarOpen(false);
              }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
                      {tab.icon}
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>)}
                  <div className="pt-6 mt-6 border-t border-gray-200 space-y-2">
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all">
                      <LogOutIcon className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </motion.aside>
            </motion.div>}
        </AnimatePresence>
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>;
}