import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, EditIcon, TrashIcon, SendIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { announcementAPI } from '../../../services/api';

export function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'medium',
    isActive: true
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementAPI.getAnnouncements({ page: 1, limit: 50 });
      setAnnouncements(response.data?.announcements || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setShowCreateForm(false);
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      type: 'general',
      targetAudience: 'all',
      priority: 'medium',
      isActive: true
    });
  };

  const handleSaveAnnouncement = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and content are required');
      return;
    }
    setError('');
    try {
      if (selectedAnnouncement) {
        const id = selectedAnnouncement.id || selectedAnnouncement._id;
        const response = await announcementAPI.updateAnnouncement(id, formData);
        setAnnouncements((prev) =>
          prev.map((a) => ((a.id || a._id) === id ? response.data : a))
        );
      } else {
        const response = await announcementAPI.createAnnouncement(formData);
        setAnnouncements((prev) => [response.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title || '',
      message: announcement.message || announcement.content || '',
      type: announcement.type || 'general',
      targetAudience: announcement.targetAudience || 'all',
      priority: announcement.priority || 'medium',
      isActive: announcement.isActive !== undefined ? announcement.isActive : true
    });
    setShowCreateForm(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await announcementAPI.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => (a.id || a._id) !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <div className="text-sm text-gray-500">Create and manage platform announcements</div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter announcement title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter announcement content"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="administrative">Administrative</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
                <option value="parents">Parents</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveAnnouncement}>
              <SendIcon className="w-4 h-4 mr-2" />
              {selectedAnnouncement ? 'Update Announcement' : 'Create Announcement'}
            </Button>
          </div>
        </Card>
      )}

      {/* Announcements List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Announcements</h2>
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Announcement
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements found. Create one above!</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const id = announcement.id || announcement._id;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            announcement.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {announcement.isActive ? 'Published' : 'Inactive'}
                        </span>
                        <span
                          className={`text-sm font-medium capitalize ${
                            announcement.priority === 'high'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {announcement.priority} Priority
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{announcement.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">
                          Target: {announcement.targetAudience}
                        </span>
                        <span>
                          Created:{' '}
                          {announcement.createdAt
                            ? new Date(announcement.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        {announcement.postedBy && (
                          <span>
                            By: {announcement.postedBy.firstName}{' '}
                            {announcement.postedBy.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        <EditIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAnnouncement(id)}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
