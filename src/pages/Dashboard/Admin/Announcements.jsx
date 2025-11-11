import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, PlusIcon, EditIcon, TrashIcon, SendIcon, EyeIcon, CalendarIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function Announcements() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'normal',
    scheduledDate: '',
    isActive: true
  });

  const announcementsData = [
    {
      id: 1,
      title: 'System Maintenance Notice',
      content: 'The platform will undergo scheduled maintenance on Sunday, January 21st from 2:00 AM to 4:00 AM EAT. Some services may be temporarily unavailable.',
      targetAudience: 'All Users',
      priority: 'High',
      status: 'Published',
      createdDate: '2024-01-15',
      scheduledDate: '2024-01-21',
      views: 245,
      isActive: true
    },
    {
      id: 2,
      title: 'New Feature: Interactive Quizzes',
      content: 'We are excited to announce the launch of interactive quizzes for Mathematics and Science subjects. Students can now take quizzes directly on the platform.',
      targetAudience: 'Students',
      priority: 'Normal',
      status: 'Published',
      createdDate: '2024-01-14',
      scheduledDate: null,
      views: 189,
      isActive: true
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting Schedule',
      content: 'Parent-teacher meetings are scheduled for next week. Please check your dashboard for your assigned time slot.',
      targetAudience: 'Parents',
      priority: 'Normal',
      status: 'Draft',
      createdDate: '2024-01-13',
      scheduledDate: '2024-01-25',
      views: 0,
      isActive: false
    },
    {
      id: 4,
      title: 'Holiday Notice',
      content: 'School will be closed for the upcoming public holiday on January 20th. No classes will be held.',
      targetAudience: 'All Users',
      priority: 'High',
      status: 'Scheduled',
      createdDate: '2024-01-12',
      scheduledDate: '2024-01-19',
      views: 0,
      isActive: false
    }
  ];

  const handleCreateAnnouncement = () => {
    console.log('Create announcement:', formData);
    setShowCreateForm(false);
    setFormData({
      title: '',
      content: '',
      targetAudience: 'all',
      priority: 'normal',
      scheduledDate: '',
      isActive: true
    });
    // Here you would create the announcement
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience.toLowerCase().replace(' ', ''),
      priority: announcement.priority.toLowerCase(),
      scheduledDate: announcement.scheduledDate || '',
      isActive: announcement.isActive
    });
    setShowCreateForm(true);
  };

  const handleDeleteAnnouncement = (id) => {
    console.log('Delete announcement:', id);
    // Here you would delete the announcement
  };

  const handlePublishAnnouncement = (id) => {
    console.log('Publish announcement:', id);
    // Here you would publish the announcement
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'High' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <div className="text-sm text-gray-500">Create and manage platform announcements</div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <Button variant="outline" onClick={() => {
              setShowCreateForm(false);
              setSelectedAnnouncement(null);
              setFormData({
                title: '',
                content: '',
                targetAudience: 'all',
                priority: 'normal',
                scheduledDate: '',
                isActive: true
              });
            }}>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter announcement content"
              />
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
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date (Optional)</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
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
            <Button onClick={handleCreateAnnouncement}>
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

        <div className="space-y-4">
          {announcementsData.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                      {announcement.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority} Priority
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{announcement.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Target: {announcement.targetAudience}</span>
                    <span>Created: {announcement.createdDate}</span>
                    {announcement.scheduledDate && (
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Scheduled: {announcement.scheduledDate}
                      </span>
                    )}
                    <span className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {announcement.views} views
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {announcement.status === 'Draft' && (
                    <Button size="sm" onClick={() => handlePublishAnnouncement(announcement.id)}>
                      <SendIcon className="w-4 h-4 mr-1" />
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleEditAnnouncement(announcement)}>
                    <EditIcon className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
