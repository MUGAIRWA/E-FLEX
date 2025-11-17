import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, Send } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { announcementAPI } from '../../../services/api';
export function TeacherAnnouncementsTab() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await announcementAPI.createAnnouncement(formData);
      setSuccessMessage('Announcement sent successfully!');

      // Clear form after showing success message
      setTimeout(() => {
        setFormData({
          title: '',
          message: '',
          type: 'general',
          targetAudience: 'all',
          priority: 'medium'
        });
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Announcements
        </h1>
        <p className="text-gray-600">
          Create and manage announcements for your students
        </p>
      </div>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
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
            <Button variant="primary" disabled={isLoading}>
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
    </div>;
}
