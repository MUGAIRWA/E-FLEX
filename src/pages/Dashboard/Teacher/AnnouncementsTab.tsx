import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, Send, TrashIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { announcementAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

export function TeacherAnnouncementsTab() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'medium'
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoadingList(true);
      const response = await announcementAPI.getAnnouncements({ page: 1, limit: 20 });
      const data: any = response.data;
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await announcementAPI.createAnnouncement(formData);
      setAnnouncements((prev) => [response.data, ...prev]);
      setSuccessMessage('Announcement sent successfully!');

      setFormData({
        title: '',
        message: '',
        type: 'general',
        targetAudience: 'all',
        priority: 'medium'
      });
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementAPI.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => (a.id || a._id) !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Announcements
        </h1>
        <p className="text-gray-600">
          Create and manage announcements for your students
        </p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BellIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Create Announcement</h3>
              <p className="text-gray-600 text-sm">
                Send important updates to your class
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Announcement title"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Type your announcement message here..."
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                  <option value="teachers">Teachers Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {successMessage && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>

      <Card>
        <h3 className="font-semibold text-lg text-gray-800 mb-4">
          Recent Announcements
        </h3>
        {loadingList ? (
          <p className="text-sm text-gray-500">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements posted yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => {
              const id = a.id || a._id;
              const isOwner =
                user &&
                (a.postedById === user._id ||
                  a.postedBy?.id === user._id ||
                  a.postedBy?._id === user._id);
              return (
                <div
                  key={id}
                  className="p-4 border border-gray-200 rounded-xl flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{a.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                        {a.targetAudience}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Posted by {a.postedBy?.firstName} {a.postedBy?.lastName} •{' '}
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete announcement"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
