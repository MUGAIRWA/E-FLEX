import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { UserIcon, MailIcon, PhoneIcon, EyeIcon, EyeOffIcon, LogOutIcon } from 'lucide-react';

export function SettingsTab() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  const parentInfo = {
    name: 'Mrs. Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+254 712 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Parent'
  };

  const linkedStudents = [
    { id: 1, name: 'John Doe', class: 'Form 3 Blue', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student' },
    { id: 2, name: 'Jane Doe', class: 'Form 2 Green', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student2' }
  ];

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
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
          <Button variant="outline">Edit Profile</Button>
        </div>
      </Card>

      {/* Linked Students */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Linked Students</h3>
        <div className="space-y-4">
          {linkedStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-800">{student.name}</h4>
                  <p className="text-sm text-gray-600">{student.class}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline">Add Student</Button>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() => handleNotificationChange('sms')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Push Notifications</h4>
              <p className="text-sm text-gray-600">Receive push notifications in app</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
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

          <Button variant="primary">Update Password</Button>
        </div>
      </Card>

      {/* Logout */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Logout</h3>
            <p className="text-sm text-gray-600">Sign out of your account</p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
