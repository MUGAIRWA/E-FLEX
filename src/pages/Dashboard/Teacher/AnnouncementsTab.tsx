import React from 'react';
import { motion } from 'framer-motion';
import { BellIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
export function TeacherAnnouncementsTab() {
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input type="text" placeholder="Announcement title" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea rows={4} placeholder="Type your announcement message here..." className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <Button variant="primary">Post Announcement</Button>
          </div>
        </Card>
      </motion.div>
    </div>;
}