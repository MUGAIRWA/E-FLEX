import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TrendingUpIcon, DownloadIcon, MessageCircleIcon } from 'lucide-react';

export function ProgressReportTab() {
  const [selectedStudent, setSelectedStudent] = useState('john-doe');

  const students = [
    { id: 'john-doe', name: 'John Doe' },
    { id: 'jane-doe', name: 'Jane Doe' }
  ];

  const subjects = [
    { subject: 'Math', progress: 85, averageScore: 79, lastQuiz: '2 days ago', teacher: 'Mr. Kamau' },
    { subject: 'English', progress: 70, averageScore: 74, lastQuiz: '3 days ago', teacher: 'Ms. Njeri' },
    { subject: 'Science', progress: 90, averageScore: 88, lastQuiz: '1 day ago', teacher: 'Dr. Oduya' },
    { subject: 'History', progress: 65, averageScore: 68, lastQuiz: '5 days ago', teacher: 'Mrs. Wanjiku' }
  ];

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Selector</h3>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {students.map(student => (
            <option key={student.id} value={student.id}>{student.name}</option>
          ))}
        </select>
      </Card>

      {/* Subject Performance Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Average Score</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Quiz</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{item.subject}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{item.averageScore}</td>
                  <td className="py-3 px-4">{item.lastQuiz}</td>
                  <td className="py-3 px-4">{item.teacher}</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm">
                      <MessageCircleIcon className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart Placeholder */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Line Chart: Performance trends</p>
          </div>
        </Card>

        {/* Bar Chart Placeholder */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Completion by Week</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Bar Chart: Weekly completion</p>
          </div>
        </Card>
      </div>

      {/* Progress Circle */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Mastery</h3>
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeDasharray="78, 100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">78%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button variant="primary">
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download Report (PDF)
        </Button>
        <Button variant="outline">
          <MessageCircleIcon className="w-4 h-4 mr-2" />
          Message Teacher
        </Button>
      </div>
    </div>
  );
}
