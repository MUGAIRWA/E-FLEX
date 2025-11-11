import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, BookOpenIcon, TrendingUpIcon, EyeIcon, FilterIcon, SearchIcon, UserCheckIcon, BarChart3Icon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function TeachersOverview() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const teachersData = [
    {
      id: 1,
      name: 'Ms. Sarah Wilson',
      subjects: ['Mathematics'],
      classes: ['Form 1 Blue', 'Form 1 Yellow'],
      totalStudents: 87,
      averagePerformance: 85,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Mr. David Brown',
      subjects: ['English'],
      classes: ['Form 1 Blue', 'Form 2 Yellow'],
      totalStudents: 89,
      averagePerformance: 82,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Ms. Emma Davis',
      subjects: ['Science'],
      classes: ['Form 2 Blue', 'Form 3 Yellow'],
      totalStudents: 94,
      averagePerformance: 88,
      status: 'Active'
    },
    {
      id: 4,
      name: 'Mr. John Smith',
      subjects: ['History'],
      classes: ['Form 2 Yellow', 'Form 4 Blue'],
      totalStudents: 76,
      averagePerformance: 79,
      status: 'Active'
    },
    {
      id: 5,
      name: 'Ms. Lisa Johnson',
      subjects: ['Geography'],
      classes: ['Form 3 Blue', 'Form 4 Green'],
      totalStudents: 82,
      averagePerformance: 86,
      status: 'Active'
    },
    {
      id: 6,
      name: 'Mr. Robert Taylor',
      subjects: ['Mathematics', 'Physics'],
      classes: ['Form 4 Blue', 'Form 3 Red'],
      totalStudents: 91,
      averagePerformance: 91,
      status: 'Active'
    }
  ];

  const filteredTeachers = teachersData.filter(teacher => {
    const matchesSubject = selectedSubject === 'all' || teacher.subjects.some(sub => sub.toLowerCase().includes(selectedSubject));
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPerformance = selectedPerformance === 'all' ||
                              (selectedPerformance === 'high' && teacher.averagePerformance >= 85) ||
                              (selectedPerformance === 'medium' && teacher.averagePerformance >= 75 && teacher.averagePerformance < 85) ||
                              (selectedPerformance === 'low' && teacher.averagePerformance < 75);
    return matchesSubject && matchesSearch && matchesPerformance;
  });

  const handleViewReports = (teacherId) => {
    console.log('View reports for teacher', teacherId);
    // Here you would navigate to teacher details or open a modal
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 85) return 'text-green-600';
    if (performance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBarColor = (performance) => {
    if (performance >= 85) return 'bg-green-500';
    if (performance >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Teachers Overview</h1>
        <div className="text-sm text-gray-500">Give visibility into teacher workload and performance</div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="english">English</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="geography">Geography</option>
            <option value="physics">Physics</option>
          </select>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Streams</option>
            <option value="blue">Blue</option>
            <option value="yellow">Yellow</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Classes</option>
            <option value="form1">Form 1</option>
            <option value="form2">Form 2</option>
            <option value="form3">Form 3</option>
            <option value="form4">Form 4</option>
          </select>
          <select
            value={selectedPerformance}
            onChange={(e) => setSelectedPerformance(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Performance</option>
            <option value="high">High (85%+)</option>
            <option value="medium">Medium (75-84%)</option>
            <option value="low">Low (75%)</option>
          </select>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <motion.tr
                  key={teacher.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {teacher.totalStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPerformanceBarColor(teacher.averagePerformance)}`}
                          style={{ width: `${teacher.averagePerformance}%` }}
                        ></div>
                      </div>
                      <span className={`font-medium ${getPerformanceColor(teacher.averagePerformance)}`}>
                        {teacher.averagePerformance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReports(teacher.id)}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Reports
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Teacher Details Modal/Card (for demonstration) */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Teacher Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.slice(0, 3).map((teacher) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {teacher.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{teacher.name}</h3>
                  <p className="text-sm text-gray-500">{teacher.subjects.join(', ')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Classes:</span>
                  <span>{teacher.classes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Students:</span>
                  <span>{teacher.totalStudents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Performance:</span>
                  <span className={getPerformanceColor(teacher.averagePerformance)}>
                    {teacher.averagePerformance}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getPerformanceBarColor(teacher.averagePerformance)}`}
                    style={{ width: `${teacher.averagePerformance}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
