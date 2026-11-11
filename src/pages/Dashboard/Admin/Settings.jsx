import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { UserIcon, ShieldIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { authAPI } from '../../../services/api';

export function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await authAPI.updateProfile({ firstName, lastName, email, phoneNumber });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const settingsSections = [
    { id: 'profile', label: 'Profile Settings', icon: UserIcon },
    { id: 'security', label: 'Account Info', icon: ShieldIcon }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#16211E]">Admin Settings</h1>
        <p className="text-sm text-[#5C6663] mt-1">Manage your administrator profile and account details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#134E4A] text-white'
                      : 'text-[#16211E] hover:bg-[#F8F6F1]'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2.5" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <div className="lg:col-span-3">
          <Card className="p-6">
            {activeSection === 'profile' ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <h3 className="text-lg font-bold text-[#16211E]">Administrator Profile</h3>
                {message && (
                  <div className="p-3 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] text-sm text-[#134E4A] font-medium">
                    {message}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#16211E] mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#D8D1C4] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#16211E] mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#D8D1C4] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#16211E] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#D8D1C4] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#16211E] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#D8D1C4] rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#16211E]">Session & Role Information</h3>
                <p className="text-sm text-[#5C6663]">
                  Signed in as <strong className="text-[#16211E]">{user?.email}</strong> with role{' '}
                  <strong className="text-[#134E4A] uppercase">{user?.role}</strong>.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
