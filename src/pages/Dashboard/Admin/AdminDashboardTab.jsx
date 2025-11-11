import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, BookOpenIcon, CreditCardIcon, HelpCircleIcon, PlusIcon, FileTextIcon, MessageSquareIcon, TrendingUpIcon, BarChart3Icon, PieChartIcon, LineChartIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function AdminDashboardTab() {
  const [recentActivity, setRecentActivity] = useState([
    'Student Tevin Jr submitted Chemistry Assignment',
    'Payment received from Parent Mugairwa (KSh 500)',
    'New Ticket: Login Issue (Open)'
  ]);

  const metrics = [
    { label: 'Total Students', value: '1,250', icon: <UsersIcon className="w-6 h-6" />, color: 'text-blue-600' },
    { label: 'Total Teachers', value: '45', icon: <BookOpenIcon className="w-6 h-6" />, color: 'text-green-600' },
    { label: 'Total Parents', value: '980', icon: <UsersIcon className="w-6 h-6" />, color: 'text-purple-600' },
    { label: 'Active Classes & Streams', value: '32', icon: <BookOpenIcon className="w-6 h-6" />, color: 'text-orange-600' },
    { label: 'Total Payments', value: 'KSh 312,500', icon: <CreditCardIcon className="w-6 h-6" />, color: 'text-green-600' },
    { label: 'Active Support Tickets', value: '12', icon: <HelpCircleIcon className="w-6 h-6" />, color: 'text-red-600' }
  ];

  const quickActions = [
    { label: 'Add User', icon: <PlusIcon className="w-5 h-5" />, action: () => console.log('Add User') },
    { label: 'Generate Report', icon: <FileTextIcon className="w-5 h-5" />, action: () => console.log('Generate Report') },
    { label: 'Post Announcement', icon: <MessageSquareIcon className="w-5 h-5" />, action: () => console.log('Post Announcement') }
  ];

  // Mock data for charts
  const studentEngagementData = [
    { month: 'Jan', engagement: 85 },
    { month: 'Feb', engagement: 88 },
    { month: 'Mar', engagement: 92 },
    { month: 'Apr', engagement: 89 },
    { month: 'May', engagement: 95 },
    { month: 'Jun', engagement: 98 }
  ];

  const paymentsData = [
    { week: 'Week 1', amount: 15000 },
    { week: 'Week 2', amount: 18000 },
    { week: 'Week 3', amount: 22000 },
    { week: 'Week 4', amount: 19000 }
  ];

  const subjectsData = [
    { subject: 'Mathematics', students: 450 },
    { subject: 'English', students: 380 },
    { subject: 'Science', students: 320 },
    { subject: 'History', students: 280 },
    { subject: 'Geography', students: 250 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Real-time platform overview</div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={action.label}
              onClick={action.action}
              className="flex items-center space-x-2 p-4 h-auto"
              variant="outline"
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-sm text-gray-700">{activity}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Engagement Line Chart */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <LineChartIcon className="w-5 h-5" />
            <span>Student Engagement</span>
          </h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {studentEngagementData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center space-y-2">
                <div
                  className="bg-primary rounded-t w-8"
                  style={{ height: `${data.engagement * 2}px` }}
                ></div>
                <span className="text-xs text-gray-600">{data.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Payments Bar Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <BarChart3Icon className="w-5 h-5" />
            <span>Weekly Payments</span>
          </h2>
          <div className="space-y-4">
            {paymentsData.map((data, index) => (
              <div key={data.week} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.week}</span>
                <div className="flex items-center space-x-2">
                  <div className="bg-green-500 h-4 rounded" style={{ width: `${data.amount / 500}px` }}></div>
                  <span className="text-sm font-medium">KSh {data.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performing Subjects Pie Chart */}
        <Card className="p-6 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5" />
            <span>Top Performing Subjects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {subjectsData.map((subject, index) => (
              <div key={subject.subject} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="absolute inset-0 rounded-full border-4 border-primary"></div>
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{subject.students}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">{subject.subject}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
