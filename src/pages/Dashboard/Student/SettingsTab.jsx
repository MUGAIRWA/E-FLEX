// @ts-ignore
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useAuth } from '../../../contexts/AuthContext';
// @ts-ignore
import { authAPI } from '../../../services/api';

export function SettingsTab() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    admissionNumber: user?.admissionNumber || '',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setSettings({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        admissionNumber: user.admissionNumber || '',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (type) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authAPI.updateProfile(settings);
      setMessage('Settings updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      setMessage('Failed to update settings. Please try again.');
    }

    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Implement password change logic
    setMessage('Password change functionality to be implemented');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-1 text-[#16211E]">
          Account Settings
        </h1>
        <p className="text-[#5C6663]">
          Manage your student profile, contact information, and notification preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm">
        <div className="p-6 sm:p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                message.includes('success')
                  ? 'bg-[#E9F5EE] border-[#BFE3CE] text-[#1E7A50]'
                  : 'bg-[#F3E8DF] border-[#E8D5C4] text-[#C85A28]'
              }`}
            >
              {message}
            </div>
          )}

          {/* Profile Information */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-poppins text-lg font-bold text-[#16211E] mb-4">
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={settings.firstName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={settings.lastName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={settings.phone}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    name="admissionNumber"
                    value={settings.admissionNumber}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={settings.dateOfBirth}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                  Address
                </label>
                <textarea
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="font-poppins text-lg font-bold text-[#16211E] mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    className="h-4 w-4 accent-[#134E4A] border-[#E5E0D5] rounded"
                  />
                  <label htmlFor="email-notifications" className="ml-2.5 text-sm text-[#3B4744]">
                    Email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="push-notifications"
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                    className="h-4 w-4 accent-[#134E4A] border-[#E5E0D5] rounded"
                  />
                  <label htmlFor="push-notifications" className="ml-2.5 text-sm text-[#3B4744]">
                    Push notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-notifications"
                    checked={settings.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                    className="h-4 w-4 accent-[#134E4A] border-[#E5E0D5] rounded"
                  />
                  <label htmlFor="sms-notifications" className="ml-2.5 text-sm text-[#3B4744]">
                    SMS notifications
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#134E4A] text-white font-semibold text-sm rounded-xl hover:bg-[#0E3B38] transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Change Password Section */}
          <div className="mt-8 pt-6 border-t border-[#E5E0D5]">
            <h3 className="font-poppins text-lg font-bold text-[#16211E] mb-4">
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3B4744] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="block w-full px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl text-[#16211E] focus:outline-none focus:border-[#134E4A] transition-colors"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#F4F1EA] border border-[#E5E0D5] text-[#16211E] font-semibold text-sm rounded-xl hover:bg-[#EFECE4] transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>

          {/* Logout Section */}
          <div className="mt-8 pt-6 border-t border-[#E5E0D5]">
            <h3 className="font-poppins text-lg font-bold text-[#16211E] mb-4">
              Account Actions
            </h3>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-[#C85A28] text-white font-semibold text-sm rounded-xl hover:bg-[#AE4B1E] transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
