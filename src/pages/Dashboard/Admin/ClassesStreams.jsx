import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, UsersIcon, UserCheckIcon, EyeIcon, PlusIcon, EditIcon, FilterIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function ClassesStreams() {
  const [selectedForm, setSelectedForm] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');

  const classData = [
    {
      id: 1,
      class: 'Form 1',
      stream: 'Blue',
      totalStudents: 45,
      assignedTeacher: 'Ms. Sarah Wilson',
      subjects: ['Mathematics', 'English', 'Science'],
      actions: ['Add Student', 'Assign Teacher', 'View Students']
    },
    {
      id: 2,
      class: 'Form 1',
      stream: 'Yellow',
      totalStudents: 42,
      assignedTeacher: 'Mr. David Brown',
      subjects: ['Mathematics', 'English', 'Science'],
      actions: ['Add Student', 'Assign Teacher', 'View Students']
    },
    {
      id: 3,
      class: 'Form 2',
      stream: 'Blue',
      totalStudents: 48,
      assignedTeacher: 'Ms. Emma Davis',
      subjects: ['Mathematics', 'English', 'Science', 'History'],
      actions: ['Add Student', 'Assign Teacher', 'View Students']
    },
    {
      id: 4,
      class: 'Form 2',
      stream: 'Yellow',
      totalStudents: 44,
      assignedTeacher: 'Mr. John Smith',
      subjects: ['Mathematics', 'English', 'Science', 'History'],
      actions: ['Add Student', 'Assign Teacher', 'View Students']
    },
    {
      id: 5,
      class: 'Form 3',
      stream: 'Blue',
      totalStudents: 46,
      assignedTeacher: 'Ms. Lisa Johnson',
      subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography'],
      actions: ['Add Student', 'Assign Teacher', 'View Students']
    },
    {
      id: 6,
      class: 'Form 4',
      stream: 'Blue',
      totalStudents: 43,
      assignedTeacher: 'Mr. Robert Taylor',
      subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography'],
      actions: ['Add Student', 'Assign Teacher', 'View Students']
    }
  ];

  const filteredClasses = classData.filter(cls => {
    const matchesForm = selectedForm === 'all' || cls.class.toLowerCase().replace(' ', '') === selectedForm;
    const matchesStream = selectedStream === 'all' || cls.stream.toLowerCase() === selectedStream;
    return matchesForm && matchesStream;
  });

  const handleAction = (classId, action) => {
    console.log(`${action} for class ${classId}`);
    // Here you would implement the action logic
  };

  const handleAddClass = () => {
    console.log('Add new class/stream');
    // Here you would open a modal or navigate to add class form
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Classes & Streams</h1>
        <div className="text-sm text-gray-500">Manage class and stream assignments</div>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Forms</option>
              <option value="form1">Form 1</option>
              <option value="form2">Form 2</option>
              <option value="form3">Form 3</option>
              <option value="form4">Form 4</option>
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
          </div>
          <Button onClick={handleAddClass}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Class/Stream
          </Button>
        </div>
      </Card>

      {/* Class Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects Offered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((cls) => (
                <motion.tr
                  key={cls.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cls.stream === 'Blue' ? 'bg-blue-100 text-blue-800' :
                      cls.stream === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                      cls.stream === 'Red' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {cls.stream}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {cls.totalStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.assignedTeacher}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {cls.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(cls.id, 'assign_teacher')}
                    >
                      <UserCheckIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(cls.id, 'view_students')}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(cls.id, 'edit')}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <BookOpenIcon className="w-8 h-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">268</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <UserCheckIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Teachers</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <BookOpenIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Subjects Offered</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
