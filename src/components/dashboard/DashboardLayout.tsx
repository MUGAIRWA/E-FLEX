import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  FileTextIcon,
  UsersIcon,
  BellIcon,
  HelpCircleIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  SettingsIcon,
  UploadIcon,
  ClipboardCheckIcon,
  TrendingUpIcon,
  CreditCardIcon,
  CheckCheckIcon,
  Trash2Icon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket, NotificationItem } from '../../contexts/SocketContext';

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
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markNotificationsAsRead,
    deleteNotification
  } = useSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    const notifId = item.id || item._id;
    if (notifId && !item.isRead) {
      await markNotificationAsRead(notifId);
    }

    const link = (item.link || '').toLowerCase();
    if (item.type === 'help_request' || link.includes('progress')) {
      onTabChange(
        userRole === 'teacher'
          ? 'progress'
          : userRole === 'parent'
          ? 'progress-report'
          : 'support'
      );
    } else if (link === 'dashboard') {
      onTabChange(userRole === 'parent' || userRole === 'admin' ? 'dashboard' : 'overview');
    } else if (link.includes('support')) {
      onTabChange(userRole === 'student' ? 'support' : 'announcements');
    } else if (link.includes('module') || link.includes('exam') || link.includes('quiz')) {
      onTabChange(
        userRole === 'student'
          ? 'modules'
          : userRole === 'parent'
          ? 'dashboard'
          : 'upload'
      );
    } else if (link.includes('assignment') || link.includes('gradebook')) {
      onTabChange(
        userRole === 'teacher'
          ? 'gradebook'
          : userRole === 'parent'
          ? 'dashboard'
          : 'assignments'
      );
    } else if (link.includes('grade')) {
      onTabChange(
        userRole === 'teacher'
          ? 'gradebook'
          : userRole === 'parent'
          ? 'progress-report'
          : 'overview'
      );
    } else if (link.includes('message')) {
      onTabChange(
        userRole === 'parent'
          ? 'messages-support'
          : userRole === 'student'
          ? 'support'
          : 'announcements'
      );
    } else {
      onTabChange(userRole === 'parent' ? 'dashboard' : 'announcements');
    }
    setIsNotificationsOpen(false);
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Just now';
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const studentTabs = [
    { id: 'overview', label: 'Overview', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'modules', label: 'Modules', icon: <BookOpenIcon className="w-5 h-5" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileTextIcon className="w-5 h-5" /> },
    { id: 'community', label: 'Community', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <BellIcon className="w-5 h-5" /> },
    { id: 'support', label: 'Support', icon: <HelpCircleIcon className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  const teacherTabs = [
    { id: 'overview', label: 'Overview', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'upload', label: 'Upload Content', icon: <UploadIcon className="w-5 h-5" /> },
    { id: 'gradebook', label: 'Gradebook', icon: <ClipboardCheckIcon className="w-5 h-5" /> },
    { id: 'progress', label: 'Student Progress', icon: <TrendingUpIcon className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <BellIcon className="w-5 h-5" /> }
  ];

  const parentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'progress-report', label: 'Progress Report', icon: <TrendingUpIcon className="w-5 h-5" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <BellIcon className="w-5 h-5" /> },
    { id: 'messages-support', label: 'Messages / Support', icon: <HelpCircleIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'user-management', label: 'User Management', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'content-moderation', label: 'Content Moderation', icon: <BookOpenIcon className="w-5 h-5" /> },
    { id: 'finance-dashboard', label: 'Finance Dashboard', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'analytics-reports', label: 'Analytics & Reports', icon: <TrendingUpIcon className="w-5 h-5" /> },
    { id: 'classes-streams', label: 'Classes & Streams', icon: <ClipboardCheckIcon className="w-5 h-5" /> },
    { id: 'teachers-overview', label: 'Teachers Overview', icon: <UploadIcon className="w-5 h-5" /> },
    { id: 'tickets-support', label: 'Tickets / Support', icon: <HelpCircleIcon className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <BellIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  const tabs =
    userRole === 'student'
      ? studentTabs
      : userRole === 'teacher'
      ? teacherTabs
      : userRole === 'parent'
      ? parentTabs
      : userRole === 'admin'
      ? adminTabs
      : [];

  const getUserInfo = (): UserInfo => {
    if (user && user.firstName && user.lastName) {
      const fullName = `${user.firstName} ${user.lastName}`;
      const roleDisplay =
        userRole === 'admin'
          ? 'Administrator'
          : userRole.charAt(0).toUpperCase() + userRole.slice(1);
      const avatarSeed = `${user.firstName}${user.lastName}`;

      return {
        name: fullName,
        role: roleDisplay,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`
      };
    }

    const storedName = localStorage.getItem('userName');
    if (storedName) {
      return {
        name: storedName,
        role:
          userRole === 'admin'
            ? 'Administrator'
            : userRole.charAt(0).toUpperCase() + userRole.slice(1),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(storedName)}`
      };
    }

    return {
      name: 'User',
      role: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole}`
    };
  };

  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Top Navigation Bar */}
      <nav className="bg-[#F8F6F1]/95 backdrop-blur-md border-b border-[#E5E0D5] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                }}
                className="text-[#16211E] hover:text-primary transition-colors"
                aria-label="Toggle sidebar"
              >
                {isMobileSidebarOpen ? (
                  <XIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center"
              >
                <img
                  src="/logo.png"
                  alt="eflex"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell + Dropdown */}
              <div className="relative" ref={notificationRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  className="relative p-2 text-[#3B4744] hover:text-[#134E4A] transition-colors rounded-xl hover:bg-[#EFECE4]"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#C85A28] text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E5E0D5] overflow-hidden z-50"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-[#F8F6F1] border-b border-[#E5E0D5]">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-[#16211E] text-sm">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <span className="bg-[#E8F1EF] text-[#134E4A] text-xs font-semibold px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markNotificationsAsRead}
                            className="flex items-center space-x-1 text-xs text-[#134E4A] hover:underline font-medium"
                          >
                            <CheckCheckIcon className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-[#EFECE4]">
                        {notifications.length === 0 ? (
                          <div className="py-8 px-4 text-center">
                            <BellIcon className="w-8 h-8 text-[#8A9490] mx-auto mb-2" />
                            <p className="text-sm text-[#5C6663]">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          notifications.map((item, idx) => {
                            const notifId = item.id || item._id || `notif-${idx}`;
                            return (
                              <div
                                key={notifId}
                                className={`flex items-start justify-between p-3.5 hover:bg-[#F8F6F1] transition-colors cursor-pointer ${
                                  !item.isRead ? 'bg-[#E8F1EF]/50' : ''
                                }`}
                                onClick={() => handleNotificationClick(item)}
                              >
                                <div className="flex items-start space-x-3 pr-2 min-w-0 flex-1">
                                  <span
                                    className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                                      !item.isRead ? 'bg-[#C85A28]' : 'bg-[#D5CFC2]'
                                    }`}
                                  />
                                  <div className="min-w-0 flex-1">
                                    {item.type === 'help_request' && (
                                      <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-[#F3E8DF] text-[#C85A28] px-2 py-0.5 rounded-full mb-1">
                                        Student Needs Help
                                      </span>
                                    )}
                                    <p
                                      className={`text-sm truncate ${
                                        !item.isRead
                                          ? 'font-semibold text-[#16211E]'
                                          : 'font-medium text-[#3B4744]'
                                      }`}
                                    >
                                      {item.title}
                                    </p>
                                    <p className="text-xs text-[#5C6663] line-clamp-2 mt-0.5">
                                      {item.message}
                                    </p>
                                    <p className="text-[11px] text-[#8A9490] mt-1">
                                      {formatTimeAgo(item.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notifId);
                                  }}
                                  className="text-[#8A9490] hover:text-[#C85A28] p-1 rounded transition-colors"
                                  title="Dismiss notification"
                                >
                                  <Trash2Icon className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="px-4 py-2.5 bg-[#F8F6F1] border-t border-[#E5E0D5] text-center">
                        <button
                          onClick={() => {
                            onTabChange('announcements');
                            setIsNotificationsOpen(false);
                          }}
                          className="text-xs font-semibold text-[#134E4A] hover:underline"
                        >
                          View all announcements
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center space-x-3">
                <img
                  src={userInfo.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-[#134E4A] bg-[#EFECE4]"
                />
                <div className="hidden md:block">
                  <p className="font-semibold text-sm text-[#16211E]">
                    {userInfo.name}
                  </p>
                  <p className="text-xs text-[#5C6663]">{userInfo.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="hidden md:block w-64 bg-white border-r border-[#E5E0D5] min-h-screen"
            >
              <div className="p-5 space-y-1.5">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#134E4A] text-white shadow-sm'
                        : 'text-[#3B4744] hover:bg-[#F4F1EA] hover:text-[#16211E]'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium text-sm">{tab.label}</span>
                  </motion.button>
                ))}
                <div className="pt-5 mt-5 border-t border-[#E5E0D5] space-y-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#5C6663] hover:bg-[#F3E8DF] hover:text-[#C85A28] transition-all"
                  >
                    <LogOutIcon className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-[#16211E]/50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="w-64 bg-white border-r border-[#E5E0D5] min-h-screen"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 space-y-1.5">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#134E4A] text-white shadow-sm'
                          : 'text-[#3B4744] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-medium text-sm">{tab.label}</span>
                    </motion.button>
                  ))}
                  <div className="pt-5 mt-5 border-t border-[#E5E0D5] space-y-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#5C6663] hover:bg-[#F3E8DF] hover:text-[#C85A28] transition-all"
                    >
                      <LogOutIcon className="w-5 h-5" />
                      <span className="font-medium text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
