import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ProgressBar } from '../../../components/dashboard/ProgressBar';
import { UserIcon, MailIcon, PhoneIcon, EyeIcon, EyeOffIcon, LogOutIcon, PlusIcon, TrashIcon, DownloadIcon, MessageCircleIcon, HelpCircleIcon, GlobeIcon, TypeIcon } from 'lucide-react';

export function SettingsTab() {
  const navigate = useNavigate();

  const parentInfo = {
    name: 'Mrs. Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+254 712 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Parent'
  };

  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    assignments: true,
    progress: false,
    payments: true,
    announcements: true
  });

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showSupportTicket, setShowSupportTicket] = useState(false);

  // Form states
  const [editProfileData, setEditProfileData] = useState({
    name: 'Mrs. Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+254 712 345 678'
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [newChildData, setNewChildData] = useState({
    name: '',
    admissionNumber: '',
    class: '',
    stream: ''
  });

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    // Navigate to landing page
    navigate('/');
  };

  const linkedStudents = [
    { id: 1, name: 'John Doe', class: 'Form 3', stream: 'Blue', progress: 85, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student' },
    { id: 2, name: 'Jane Doe', class: 'Form 2', stream: 'Green', progress: 72, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student2' }
  ];

  const paymentNumbers = [
    { id: 1, number: '+254 712 345 678', isDefault: true },
    { id: 2, number: '+254 723 456 789', isDefault: false }
  ];

  const [paymentReminders, setPaymentReminders] = useState(true);
  const [language, setLanguage] = useState('English');
  const [textSize, setTextSize] = useState('Medium');

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Handler functions
  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleRemoveStudent = (studentId) => {
    // In a real app, this would make an API call
    console.log('Removing student:', studentId);
    // For now, just show an alert
    alert(`Student removed successfully!`);
  };

  const handleAddChild = () => {
    setShowAddChild(true);
  };

  const handleRequestLinkRemoval = () => {
    // In a real app, this would make an API call
    alert('Link removal request submitted. School administration will review your request.');
  };

  const handleUpdatePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    // In a real app, this would make an API call
    alert('Password updated successfully!');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleRaiseSupportTicket = () => {
    setShowSupportTicket(true);
  };

  const handleChatWithSupport = () => {
    // In a real app, this would open a chat interface
    alert('Opening support chat...');
  };

  const handleFAQSection = () => {
    // In a real app, this would navigate to FAQ page
    alert('Opening FAQ section...');
  };

  const handleDownloadReceipts = () => {
    // In a real app, this would trigger a download
    alert('Downloading transaction receipts...');
  };

  return (
    <div className="space-y-6">
      {/* Parent Profile */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Parent Profile</h3>
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={parentInfo.avatar}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-primary"
          />
          <div>
            <h4 className="text-xl font-semibold text-gray-800">{parentInfo.name}</h4>
            <p className="text-gray-600">Parent</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <MailIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{parentInfo.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PhoneIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{parentInfo.phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={handleEditProfile}>Edit Profile</Button>
        </div>
      </Card>

      {/* Manage Linked Students */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Linked Students</h3>
        <div className="space-y-4">
          {linkedStudents.map((student) => (
            <div key={student.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.class} {student.stream}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleRemoveStudent(student.id)}>
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              <div className="mb-2">
                <ProgressBar progress={student.progress} label="Progress Overview" showPercentage={true} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <Button variant="outline" onClick={handleAddChild}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Another Child
          </Button>
          <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50" onClick={handleRequestLinkRemoval}>
            Request Link Removal
          </Button>
        </div>
      </Card>

      {/* Payment Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Preferences</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Saved Payment Phone Numbers (M-Pesa)</h4>
            <div className="space-y-2">
              {paymentNumbers.map((num) => (
                <div key={num.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{num.number}</span>
                    {num.isDefault && <span className="text-xs bg-primary text-white px-2 py-1 rounded">Default</span>}
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Enable Payment Reminders</h4>
              <p className="text-sm text-gray-600">Receive reminders for upcoming payments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentReminders}
                onChange={() => setPaymentReminders(!paymentReminders)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={handleDownloadReceipts}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download Transaction Receipts
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Assignment Completion Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when assignments are completed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.assignments}
                onChange={() => handleNotificationChange('assignments')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Low Progress Notifications</h4>
              <p className="text-sm text-gray-600">Receive alerts for low academic progress</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.progress}
                onChange={() => handleNotificationChange('progress')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Fee/Payment Alerts</h4>
              <p className="text-sm text-gray-600">Get notified about payment deadlines and status</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.payments}
                onChange={() => handleNotificationChange('payments')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">School Announcements</h4>
              <p className="text-sm text-gray-600">Receive important school announcements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.announcements}
                onChange={() => handleNotificationChange('announcements')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Language / Accessibility */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Language / Accessibility</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="English">English</option>
              <option value="Swahili">Swahili</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Size</label>
            <select
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Support / Help */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Support / Help</h3>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleRaiseSupportTicket}>
            <HelpCircleIcon className="w-5 h-5 mr-3" />
            Raise Support Ticket
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={handleChatWithSupport}>
            <MessageCircleIcon className="w-5 h-5 mr-3" />
            Chat with Support
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={handleFAQSection}>
            <HelpCircleIcon className="w-5 h-5 mr-3" />
            FAQ Section
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>

          <Button variant="primary" onClick={handleUpdatePassword}>Update Password</Button>
        </div>
      </Card>

      {/* Logout */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Logout</h3>
            <p className="text-sm text-gray-600">Sign out of your account</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
