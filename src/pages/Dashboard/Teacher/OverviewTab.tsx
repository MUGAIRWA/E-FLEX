import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, FileTextIcon, ClipboardCheckIcon, BellIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AnnouncementModal } from '../../../components/AnnouncementModal';
// @ts-ignore: no types for JS AuthContext module
import { useAuth } from '../../../contexts/AuthContext';
export function TeacherOverviewTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Teacher';
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const stats = [{
    label: 'Total Students',
    value: '124',
    icon: <UsersIcon className="w-6 h-6" />,
    color: 'from-primary to-blue-400',
    change: '+8'
  }, {
    label: 'Pending Submissions',
    value: '15',
    icon: <ClipboardCheckIcon className="w-6 h-6" />,
    color: 'from-warning to-red-400',
    change: '-3'
  }, {
    label: 'Active Assignments',
    value: '6',
    icon: <FileTextIcon className="w-6 h-6" />,
    color: 'from-accent to-purple-400',
    change: '+2'
  }, {
    label: 'Avg. Class Score',
    value: '82%',
    icon: <TrendingUpIcon className="w-6 h-6" />,
    color: 'from-success to-green-400',
    change: '+5%'
  }];
  const recentSubmissions = [{
    student: 'Alice Kamau',
    assignment: 'Algebra Problem Set',
    subject: 'Mathematics',
    submittedAt: '2 hours ago',
    status: 'pending'
  }, {
    student: 'Brian Ochieng',
    assignment: 'Essay: Climate Change',
    subject: 'English',
    submittedAt: '5 hours ago',
    status: 'pending'
  }, {
    student: 'Catherine Wanjiru',
    assignment: 'Geometry Worksheet',
    subject: 'Mathematics',
    submittedAt: '1 day ago',
    status: 'pending'
  }];
  const upcomingClasses = [{
    class: 'Form 3A - Mathematics',
    time: 'Today, 10:00 AM',
    students: 32,
    topic: 'Quadratic Equations'
  }, {
    class: 'Form 2B - Mathematics',
    time: 'Today, 2:00 PM',
    students: 28,
    topic: 'Geometry Basics'
  }, {
    class: 'Form 4A - Mathematics',
    time: 'Tomorrow, 9:00 AM',
    students: 35,
    topic: 'Calculus Introduction'
  }];
  return <div className="space-y-8">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 text-gray-800">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-600">
          Here is your teaching overview for today
        </p>
      </motion.div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <motion.div key={index} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }}>
            <Card>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="font-poppins font-bold text-2xl text-gray-800">
                  {stat.value}
                </p>
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
            </Card>
          </motion.div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.4
      }}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-xl text-gray-800">
                Recent Submissions
              </h3>
              <span className="text-xs bg-warning/10 text-warning px-3 py-1 rounded-full font-semibold">
                {recentSubmissions.length} Pending
              </span>
            </div>
            <div className="space-y-3">
              {recentSubmissions.map((submission, index) => <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {submission.student}
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.assignment}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {submission.submittedAt}
                      </p>
                    </div>
                    <Button variant="primary" size="sm">
                      Grade
                    </Button>
                  </div>
                </div>)}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Submissions
            </Button>
          </Card>
        </motion.div>
        {/* Upcoming Classes */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.5
      }}>
          <Card>
            <h3 className="font-poppins font-bold text-xl mb-4 text-gray-800">
              Upcoming Classes
            </h3>
            <div className="space-y-3">
              {upcomingClasses.map((classInfo, index) => <div key={index} className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {classInfo.class}
                      </p>
                      <p className="text-sm text-gray-600">{classInfo.time}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {classInfo.students} students
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Topic:{' '}
                    <span className="font-medium">{classInfo.topic}</span>
                  </p>
                </div>)}
            </div>
          </Card>
        </motion.div>
      </div>
      {/* Quick Actions */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.6
    }}>
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-4 text-gray-800">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="primary" className="flex items-center justify-center space-x-2" onClick={() => onTabChange('upload')}>
              <FileTextIcon className="w-5 h-5" />
              <span>Create Assignment</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2"
              onClick={() => setIsAnnouncementModalOpen(true)}
            >
              <BellIcon className="w-5 h-5" />
              <span>Send Announcement</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2" onClick={() => onTabChange('progress')}>
              <TrendingUpIcon className="w-5 h-5" />
              <span>View Progress</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSuccess={() => {
          // Could add a success message or refresh data here
          console.log('Announcement created successfully');
        }}
      />
    </div>;
}
