import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
export function StudentProgressTab() {
  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Student Progress
        </h1>
        <p className="text-gray-600">
          Track and monitor your students' academic performance
        </p>
      </div>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white rounded-xl shadow-md p-6">
        <Card>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUpIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Progress Dashboard</h3>
              <p className="text-gray-600 text-sm">
                View detailed analytics on student performance
              </p>
            </div>
          </div>
          <div className="p-6 text-center text-gray-500">
            Student progress data will be displayed here
          </div>
        </Card>
      </motion.div>
    </div>;
}