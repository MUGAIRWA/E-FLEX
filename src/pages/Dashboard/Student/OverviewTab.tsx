import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, TrendingUpIcon, CalendarIcon, StarIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { SubjectCard } from '../../../components/dashboard/SubjectCard';
import { QuoteCard } from '../../../components/dashboard/QuoteCard';
import { ProgressBar } from '../../../components/dashboard/ProgressBar';
export function OverviewTab() {
  const subjects = [{
    subject: 'Mathematics',
    progress: 75,
    totalModules: 12,
    completedModules: 9,
    nextClass: 'Monday, 2:00 PM',
    color: 'from-primary to-blue-400'
  }, {
    subject: 'English',
    progress: 60,
    totalModules: 10,
    completedModules: 6,
    nextClass: 'Tuesday, 10:00 AM',
    color: 'from-accent to-purple-400'
  }, {
    subject: 'Kiswahili',
    progress: 85,
    totalModules: 8,
    completedModules: 7,
    nextClass: 'Wednesday, 1:00 PM',
    color: 'from-success to-green-400'
  }];
  const stats = [{
    label: 'Badges Earned',
    value: '12',
    icon: <TrophyIcon className="w-6 h-6" />,
    color: 'from-warning to-red-400'
  }, {
    label: 'Current Streak',
    value: '7 days',
    icon: <TrendingUpIcon className="w-6 h-6" />,
    color: 'from-primary to-blue-400'
  }, {
    label: 'Assignments Due',
    value: '3',
    icon: <CalendarIcon className="w-6 h-6" />,
    color: 'from-accent to-purple-400'
  }, {
    label: 'Average Score',
    value: '87%',
    icon: <StarIcon className="w-6 h-6" />,
    color: 'from-success to-green-400'
  }];
  return <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 text-gray-800">
          Welcome back, John! 👋
        </h1>
        <p className="text-gray-600">
          Ready to continue your learning journey?
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
              <p className="font-poppins font-bold text-2xl text-gray-800">
                {stat.value}
              </p>
            </Card>
          </motion.div>)}
      </div>
      {/* Quote Card */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.4
    }}>
        <QuoteCard />
      </motion.div>
      {/* Enrolled Subjects */}
      <div>
        <h2 className="font-poppins font-bold text-2xl mb-6 text-gray-800">
          Your Subjects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5 + index * 0.1
        }}>
              <SubjectCard {...subject} />
            </motion.div>)}
        </div>
      </div>
      {/* Overall Progress */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.8
    }}>
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-4 text-gray-800">
            Overall Progress
          </h3>
          <div className="space-y-4">
            <ProgressBar progress={73} label="Total Course Completion" color="from-primary to-accent" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-primary">24</p>
                <p className="text-sm text-gray-600">Quizzes Completed</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-accent">18</p>
                <p className="text-sm text-gray-600">Assignments Submitted</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>;
}