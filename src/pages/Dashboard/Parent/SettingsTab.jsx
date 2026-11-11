import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  MailIcon,
  PhoneIcon,
  EyeIcon,
  EyeOffIcon,
  LogOutIcon
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authAPI, parentAPI } from '../../../services/api';

export function SettingsTab() {
  const { user, logout } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await parentAPI.getChildren();
        setLinkedStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load linked students:', err);
      }
    };
    loadChildren();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await authAPI.updateProfile({ firstName, lastName, email, phone });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.current || !passwordData.new) return;
    if (passwordData.new !== passwordData.confirm) {
      setMessage('New passwords do not match!');
      return;
    }
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      setMessage('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMessage(
        err.response?.data?.message || 'Failed to update password.'
      );
    }
  };

  const fullName =
    `${firstName} ${lastName}`.trim() || 'Parent Account';

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 rounded-xl bg-[#E9F5EE] border border-[#BFE3CE] text-[#1E7A50] text-sm font-medium">
          {message}
        </div>
      )}

      {/* Parent Profile */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Parent Profile
        </h3>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#134E4A] text-white flex items-center justify-center font-bold text-xl">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-800">{fullName}</h4>
            <p className="text-gray-600 text-sm capitalize">
              {user?.role || 'Parent'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MailIcon className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <PhoneIcon className="w-4 h-4 inline mr-1" />
                Phone Number (M-Pesa / Contact)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Linked Students */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Linked Students
        </h3>
        {linkedStudents.length === 0 ? (
          <p className="text-sm text-gray-500">
            No students linked yet. Students are linked automatically when they register with your phone number or when you specify their admission number/email.
          </p>
        ) : (
          <div className="space-y-3">
            {linkedStudents.map((student) => (
              <div
                key={student.id}
                className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      student.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`
                    }
                    alt={student.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {student.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {student.classLabel || `${student.class || ''} ${student.stream || ''}`}
                      {student.admissionNumber
                        ? ` • Adm: ${student.admissionNumber}`
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    current: e.target.value
                  }))
                }
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, new: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirm: e.target.value
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>

          <Button variant="primary" onClick={handleUpdatePassword}>
            Update Password
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Logout</h3>
            <p className="text-sm text-gray-600">Sign out of your account</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
