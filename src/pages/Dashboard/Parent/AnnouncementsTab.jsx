import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BellIcon, UserIcon, CalendarIcon } from 'lucide-react';

export function AnnouncementsTab() {
  const [filter, setFilter] = useState('all');

  const announcements = [
    {
      id: 1,
      title: 'Holiday Learning Starts on Nov 15',
      postedBy: 'Admin',
      timestamp: '2 hours ago',
      description: 'We will be starting our holiday learning program next week. All students are encouraged to participate.',
      type: 'admin'
    },
    {
      id: 2,
      title: 'Mathematics Extra Classes',
      postedBy: 'Mr. Kamau',
      timestamp: '1 day ago',
      description: 'Additional mathematics classes will be held every Wednesday after school for Form 3 students.',
      type: 'teacher'
    },
    {
      id: 3,
      title: 'Science Fair Registration Open',
      postedBy: 'Dr. Oduya',
      timestamp: '3 days ago',
      description: 'Registration for the annual science fair is now open. Submit your projects by Dec 1st.',
      type: 'teacher'
    },
    {
      id: 4,
      title: 'Parent-Teacher Meeting Scheduled',
      postedBy: 'Admin',
      timestamp: '5 days ago',
      description: 'The next parent-teacher meeting is scheduled for Nov 20th at 2 PM in the school hall.',
      type: 'admin'
    }
  ];

  const filteredAnnouncements = filter === 'all'
    ? announcements
    : announcements.filter(ann => ann.type === filter);

  return (
    <div className="space-y-6">
      {/* Header with Notification Bell */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
        <div className="relative">
          <BellIcon className="w-8 h-8 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </div>
      </div>

      {/* Filter Options */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'teacher', label: 'By Teacher' },
            { key: 'admin', label: 'By Admin' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === option.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Announcement Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  announcement.type === 'admin' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {announcement.type === 'admin' ? (
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                  <p className="text-sm text-gray-600">
                    Posted by {announcement.postedBy} • {announcement.timestamp}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{announcement.description}</p>

            <Button variant="outline" size="sm">
              View Details
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Load More Announcements
        </Button>
      </div>
    </div>
  );
}
