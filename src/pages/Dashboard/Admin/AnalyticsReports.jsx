import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, FileTextIcon, MailIcon, DownloadIcon, FilterIcon, BarChart3Icon, LineChartIcon, PieChartIcon, UsersIcon, BookOpenIcon, CalendarIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function AnalyticsReports() {
  const [selectedReportType, setSelectedReportType] = useState('student');
  const [selectedTimeRange, setSelectedTimeRange] = useState('monthly');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStream, setSelectedStream] = useState('');

  const reportOptions = [
    {
      id: 'student',
      title: 'Single Student Report',
      description: 'Academic performance, completion rate, attendance, login frequency',
      icon: <UsersIcon className="w-6 h-6" />
    },
    {
      id: 'class',
      title: 'Class Report',
      description: 'Overall average score, most completed subject, lowest performing subject',
      icon: <BookOpenIcon className="w-6 h-6" />
    },
    {
      id: 'stream',
      title: 'Stream Report',
      description: 'Compare all streams in a class (e.g., Form 4 Blue vs Yellow)',
      icon: <BarChart3Icon className="w-6 h-6" />
    }
  ];

  const mockStudentData = {
    name: 'John Doe',
    performance: [
      { subject: 'Mathematics', score: 85, completion: 95 },
      { subject: 'English', score: 78, completion: 88 },
      { subject: 'Science', score: 92, completion: 100 },
      { subject: 'History', score: 76, completion: 82 },
      { subject: 'Geography', score: 88, completion: 90 }
    ],
    attendance: 94,
    loginFrequency: 'Daily'
  };

  const mockClassData = {
    className: 'Form 3',
    averageScore: 82,
    subjects: [
      { name: 'Mathematics', average: 85, completion: 95 },
      { name: 'English', average: 78, completion: 88 },
      { name: 'Science', average: 92, completion: 100 },
      { name: 'History', average: 76, completion: 82 },
      { name: 'Geography', average: 88, completion: 90 }
    ]
  };

  const mockStreamData = {
    className: 'Form 4',
    streams: [
      { name: 'Blue', averageScore: 85, studentCount: 45 },
      { name: 'Yellow', averageScore: 82, studentCount: 42 },
      { name: 'Red', averageScore: 88, studentCount: 48 },
      { name: 'Green', averageScore: 79, studentCount: 40 }
    ]
  };

  const handleGenerateReport = () => {
    console.log('Generating report:', {
      type: selectedReportType,
      timeRange: selectedTimeRange,
      student: selectedStudent,
      class: selectedClass,
      stream: selectedStream
    });
    // Here you would implement the report generation logic
  };

  const handleEmailReport = () => {
    console.log('Emailing report to parent');
    // Here you would implement the email functionality
  };

  const renderReportContent = () => {
    switch (selectedReportType) {
      case 'student':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Student Performance</h3>
                <div className="space-y-4">
                  {mockStudentData.performance.map((subject, index) => (
                    <div key={subject.subject} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{subject.subject}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${subject.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{subject.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
                <div className="space-y-4">
                  {mockStudentData.performance.map((subject, index) => (
                    <div key={subject.subject} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{subject.subject}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${subject.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{subject.completion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Additional Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Attendance</span>
                    <span className="text-sm font-medium">{mockStudentData.attendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Login Frequency</span>
                    <span className="text-sm font-medium">{mockStudentData.loginFrequency}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'class':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Class Overview: {mockClassData.className}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{mockClassData.averageScore}%</div>
                  <div className="text-sm text-gray-600">Overall Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">92%</div>
                  <div className="text-sm text-gray-600">Average Completion Rate</div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Subject Performance</h4>
                {mockClassData.subjects.map((subject, index) => (
                  <div key={subject.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{subject.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">Avg: {subject.average}%</span>
                      <span className="text-sm">Comp: {subject.completion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'stream':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stream Comparison: {mockStreamData.className}</h3>
              <div className="space-y-4">
                {mockStreamData.streams.map((stream, index) => (
                  <div key={stream.name} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{stream.name} Stream</span>
                      <span className="text-sm text-gray-600 ml-2">({stream.studentCount} students)</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full"
                          style={{ width: `${(stream.averageScore / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{stream.averageScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="text-sm text-gray-500">Deep performance tracking and report generation</div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-6 cursor-pointer transition-all ${
                selectedReportType === option.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedReportType(option.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="text-primary">
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Actions */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="termly">Termly</option>
          </select>

          {selectedReportType === 'student' && (
            <input
              type="text"
              placeholder="Select Student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          )}

          {(selectedReportType === 'class' || selectedReportType === 'stream') && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Class</option>
              <option value="form1">Form 1</option>
              <option value="form2">Form 2</option>
              <option value="form3">Form 3</option>
              <option value="form4">Form 4</option>
            </select>
          )}

          {selectedReportType === 'stream' && (
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Stream</option>
              <option value="blue">Blue</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
            </select>
          )}
        </div>

        <div className="flex space-x-4">
          <Button onClick={handleGenerateReport}>
            <FileTextIcon className="w-5 h-5 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={handleEmailReport}>
            <MailIcon className="w-5 h-5 mr-2" />
            Email to Parent
          </Button>
          <Button variant="outline">
            <DownloadIcon className="w-5 h-5 mr-2" />
            Export PDF
          </Button>
        </div>
      </Card>

      {/* Report Content */}
      {renderReportContent()}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <LineChartIcon className="w-5 h-5" />
            <span>Student Growth</span>
          </h3>
          <div className="h-32 flex items-end justify-between space-x-1">
            {[65, 70, 75, 80, 85, 82, 88, 90].map((value, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div
                  className="bg-primary rounded-t w-4"
                  style={{ height: `${value}px` }}
                ></div>
                <span className="text-xs text-gray-500">{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart3Icon className="w-5 h-5" />
            <span>Stream Comparisons</span>
          </h3>
          <div className="space-y-3">
            {['Blue', 'Yellow', 'Red', 'Green'].map((stream, index) => (
              <div key={stream} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stream}</span>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-500 h-3 rounded" style={{ width: `${60 + index * 10}px` }}></div>
                  <span className="text-sm font-medium">{80 + index * 2}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5" />
            <span>Class Completion</span>
          </h3>
          <div className="flex items-center justify-center h-32">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-green-500"></div>
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">92%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
