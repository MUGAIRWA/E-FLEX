import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TrendingUpIcon, ClockIcon, BookOpenIcon, CalendarIcon, FileTextIcon } from 'lucide-react';

export function DashboardTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, Mrs. Jane Doe 👋
        </h1>
        <p className="text-gray-600">
          Here's how John Doe is performing this week.
        </p>
      </div>

      {/* Child Progress Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-4 mb-4">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Student"
            alt="Student"
            className="w-16 h-16 rounded-full border-2 border-primary"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">John Doe</h3>
            <p className="text-gray-600">Form 3 Blue</p>
            <p className="text-sm text-gray-500">Subjects enrolled: Mathematics, English, Science</p>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="75, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-800">75%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall completion rate</p>
            </div>
          </div>
          <Button variant="primary">View Full Report</Button>
        </div>
      </motion.div>

      {/* Weekly Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <BookOpenIcon className="w-8 h-8 text-primary mx-auto mb-2" />
          <h4 className="font-semibold text-gray-800">Subjects Accessed</h4>
          <p className="text-2xl font-bold text-primary">3</p>
          <p className="text-sm text-gray-600">this week</p>
        </Card>

        <Card className="text-center">
          <TrendingUpIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-800">Quizzes Completed</h4>
          <p className="text-2xl font-bold text-green-500">5</p>
          <p className="text-sm text-gray-600">this week</p>
        </Card>

        <Card className="text-center">
          <FileTextIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-800">Pending Assignments</h4>
          <p className="text-2xl font-bold text-orange-500">2</p>
          <p className="text-sm text-gray-600">due soon</p>
        </Card>

        <Card className="text-center">
          <CalendarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-800">Latest Grade</h4>
          <p className="text-2xl font-bold text-blue-500">A-</p>
          <p className="text-sm text-gray-600">Mathematics</p>
        </Card>
      </div>

      {/* Engagement Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h4 className="font-semibold text-gray-800 mb-2">Most Active Subject</h4>
          <p className="text-lg text-primary font-bold">Mathematics 📘</p>
        </Card>

        <Card>
          <h4 className="font-semibold text-gray-800 mb-2">Last Login</h4>
          <p className="text-lg text-gray-800 font-bold">2 days ago</p>
        </Card>

        <Card>
          <h4 className="font-semibold text-gray-800 mb-2">Average Time Spent</h4>
          <p className="text-lg text-green-600 font-bold">1h 20min/day</p>
        </Card>
      </div>

      {/* Notifications Widget */}
      <Card>
        <h4 className="font-semibold text-gray-800 mb-4">Recent Notifications</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-700">New assignment uploaded for Chemistry</p>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-700">John completed Mathematics quiz with 85%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
