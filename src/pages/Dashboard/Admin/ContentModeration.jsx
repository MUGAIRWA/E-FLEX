import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, CheckIcon, XIcon, EditIcon, FilterIcon, SearchIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function ContentModeration() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mockData = [
    {
      id: 1,
      type: 'Notes',
      title: 'Algebra Fundamentals',
      uploadedBy: 'Ms. Sarah Wilson',
      subject: 'Mathematics',
      date: '2024-01-15',
      status: 'Pending'
    },
    {
      id: 2,
      type: 'Quiz',
      title: 'Chemistry Lab Quiz',
      uploadedBy: 'Mr. David Brown',
      subject: 'Chemistry',
      date: '2024-01-14',
      status: 'Approved'
    },
    {
      id: 3,
      type: 'Assignment',
      title: 'History Essay',
      uploadedBy: 'Ms. Emma Davis',
      subject: 'History',
      date: '2024-01-13',
      status: 'Rejected'
    },
    {
      id: 4,
      type: 'Video',
      title: 'Physics Motion Tutorial',
      uploadedBy: 'Mr. John Smith',
      subject: 'Physics',
      date: '2024-01-12',
      status: 'Pending'
    },
    {
      id: 5,
      type: 'Post',
      title: 'Discussion on Climate Change',
      uploadedBy: 'Ms. Lisa Johnson',
      subject: 'Geography',
      date: '2024-01-11',
      status: 'Approved'
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesType = selectedType === 'all' || item.type.toLowerCase() === selectedType;
    const matchesSubject = selectedSubject === 'all' || item.subject.toLowerCase() === selectedSubject;
    const matchesTeacher = selectedTeacher === 'all' || item.uploadedBy.toLowerCase().includes(selectedTeacher);
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSubject && matchesTeacher && matchesSearch;
  });

  const handleAction = (id, action, comment = '') => {
    console.log(`${action} content ${id}`, comment ? `with comment: ${comment}` : '');
    // Here you would typically update the status in your backend
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <div className="text-sm text-gray-500">Review and approve uploaded materials</div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="notes">Notes</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
            <option value="video">Video</option>
            <option value="post">Post</option>
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="history">History</option>
            <option value="geography">Geography</option>
            <option value="english">English</option>
          </select>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Teachers</option>
            <option value="ms. sarah wilson">Ms. Sarah Wilson</option>
            <option value="mr. david brown">Mr. David Brown</option>
            <option value="ms. emma davis">Ms. Emma Davis</option>
            <option value="mr. john smith">Mr. John Smith</option>
            <option value="ms. lisa johnson">Ms. Lisa Johnson</option>
          </select>
        </div>
      </Card>

      {/* Content Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.uploadedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {item.status === 'Pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleAction(item.id, 'approve')}
                        >
                          <CheckIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleAction(item.id, 'reject', 'Content does not meet standards')}
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-600 hover:text-yellow-800"
                          onClick={() => handleAction(item.id, 'request_revision', 'Please revise content')}
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {item.status !== 'Pending' && (
                      <span className="text-gray-400">No actions available</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
