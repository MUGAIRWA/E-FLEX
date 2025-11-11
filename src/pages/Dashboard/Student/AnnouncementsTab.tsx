import React from 'react';
import { motion } from 'framer-motion';
import { BellIcon } from 'lucide-react';
export function AnnouncementsTab() {
  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Announcements
        </h1>
        <p className="text-gray-600">
          Stay updated with the latest news and announcements
        </p>
      </div>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <BellIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-gray-800">No new announcements</h3>
          <p className="text-gray-600 text-sm">
            Check back later for updates from your teachers
          </p>
        </div>
      </motion.div>
    </div>;
}