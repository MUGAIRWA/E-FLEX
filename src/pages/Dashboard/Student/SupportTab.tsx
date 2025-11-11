import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircleIcon } from 'lucide-react';
export function SupportTab() {
  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Support
        </h1>
        <p className="text-gray-600">
          Get help with your studies or technical issues
        </p>
      </div>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <HelpCircleIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-gray-800">Need help?</h3>
        </div>
        <p className="text-gray-700">
          If you need assistance with your coursework or are experiencing
          technical difficulties, please contact your teacher or the support
          team.
        </p>
      </motion.div>
    </div>;
}