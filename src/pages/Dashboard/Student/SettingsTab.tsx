import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { UserIcon, MailIcon, PhoneIcon, EyeIcon, EyeOffIcon, LogOutIcon, MonitorIcon, SmartphoneIcon, GlobeIcon, HelpCircleIcon, SunIcon, MoonIcon, TypeIcon } from 'lucide-react';

export function SettingsTab() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    assignmentReminders: true,
    newGradesAlert: true,
    announcements: true
  });
  const [theme, setTheme] = useState('light');
  const [textSize, setTextSize] = useState(100);
  const [contactForm, setContactForm] = useState({
    email: 'john.doe@example.com',
    phone: ''
  });

  const studentInfo = {
    name: 'John Doe',
    admissionNumber: 'ADM2024001',
    class: 'Form 3',
    stream: 'Blue',
    linkedParents: [
      { id: 1, name: 'Mrs. Jane Doe', email: 'jane.doe@example.com' },
      { id: 2, name: 'Mr. John Smith', email: 'john.smith@example.com' }
    ],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student'
  };

  const currentSessions = [
    { device: 'Chrome on Windows', location: 'Nairobi, Kenya', loginTime: '2024-01-15 10:30 AM', current: true },
    { device: 'Safari on iPhone', location: 'Nairobi, Kenya', loginTime: '2024-01-14 8:15 PM', current: false }
  ];

  const handleNotificationChange = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleContactUpdate = () => {
    // Handle contact update logic
    console.log('Updating contact info:', contactForm);
  };

  const handlePasswordChange = () => {
    // Handle password change logic
    console.log('Changing password');
  };

  const handleLogoutAllDevices = () => {
    // Handle logout from all devices
    console.log('Logging out from all devices');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={studentInfo.avatar}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-primary"
          />
          <div>
            <h4 className="text-xl font-semibold text-gray-800">{studentInfo.name}</h4>
            <p className="text-gray-600">Student</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Admission Number</p>
              <p className="font-medium">{studentInfo.admissionNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <UserIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Class & Stream</p>
              <p className="font-medium">{studentInfo.class} {studentInfo.stream}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Linked Parent(s)</h4>
          <div className="space-y-2">
            {studentInfo.linkedParents.map((parent) => (
              <div key={parent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{parent.name}</p>
                  <p className="text-sm text-gray-600">{parent.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Update Personal Contact */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Personal Contact</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <Button onClick={handleContactUpdate} variant="primary">Save Changes</Button>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>

          <Button onClick={handlePasswordChange} variant="primary">Update Password</Button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Assignment Reminders</h4>
              <p className="text-sm text-gray-600">Get notified about upcoming assignments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.assignmentReminders}
                onChange={() => handleNotificationChange('assignmentReminders')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">New Grades Alert</h4>
              <p className="text-sm text-gray-600">Receive alerts when new grades are posted</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.newGradesAlert}
                onChange={() => handleNotificationChange('newGradesAlert')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Announcements</h4>
              <p className="text-sm text-gray-600">Get notified about school announcements</p>
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

      {/* Theme / Accessibility */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme / Accessibility</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === 'light' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              <div>
                <h4 className="font-medium text-gray-800">Theme</h4>
                <p className="text-sm text-gray-600">Switch between light and dark mode</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-3">
              <TypeIcon className="w-5 h-5" />
              <div>
                <h4 className="font-medium text-gray-800">Text Size</h4>
                <p className="text-sm text-gray-600">Adjust the text size for better readability</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="50"
                max="200"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{textSize}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Device & Session Management */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Device & Session Management</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Current Logged-in Devices</h4>
            <div className="space-y-3">
              {currentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {session.device.includes('Chrome') ? <MonitorIcon className="w-5 h-5 text-gray-500" /> : <SmartphoneIcon className="w-5 h-5 text-gray-500" />}
                    <div>
                      <p className="font-medium text-gray-800">{session.device}</p>
                      <p className="text-sm text-gray-600">{session.location} • {session.loginTime}</p>
                    </div>
                  </div>
                  {session.current && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleLogoutAllDevices} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            Log out of all devices
          </Button>
        </div>
      </Card>

      {/* Support / Help */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Support / Help</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HelpCircleIcon className="w-5 h-5 text-gray-500" />
              <div>
                <h4 className="font-medium text-gray-800">Support Ticket</h4>
                <p className="text-sm text-gray-600">Get help from our support team</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Open Ticket</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <MailIcon className="w-5 h-5 text-gray-500" />
              <div>
                <h4 className="font-medium text-gray-800">Contact Support</h4>
                <p className="text-sm text-gray-600">support@eflex.edu</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Email</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
