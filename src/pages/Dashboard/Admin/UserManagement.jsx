import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, UserPlusIcon, EyeIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function UserManagement() {
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const tabs = [
    { id: 'students', label: 'Students', count: 1250 },
    { id: 'teachers', label: 'Teachers', count: 45 },
    { id: 'parents', label: 'Parents', count: 980 },
    { id: 'admins', label: 'Admins', count: 5 }
  ];

  const mockData = {
    students: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', class: 'Form 3', stream: 'Blue', linkedParent: 'Jane Doe', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Student', class: 'Form 2', stream: 'Yellow', linkedParent: 'Bob Smith', status: 'Active' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Student', class: 'Form 4', stream: 'Red', linkedParent: 'Sarah Johnson', status: 'Suspended' }
    ],
    teachers: [
      { id: 4, name: 'Ms. Sarah Wilson', email: 'sarah@example.com', role: 'Teacher', subject: 'Mathematics', classes: ['Form 1', 'Form 2'], studentsCount: 85, status: 'Active' },
      { id: 5, name: 'Mr. David Brown', email: 'david@example.com', role: 'Teacher', subject: 'English', classes: ['Form 3', 'Form 4'], studentsCount: 92, status: 'Active' }
    ],
    parents: [
      { id: 6, name: 'Mrs. Jane Doe', email: 'jane.doe@example.com', role: 'Parent', children: ['John Doe'], status: 'Active' },
      { id: 7, name: 'Mr. Bob Smith', email: 'bob@example.com', role: 'Parent', children: ['Jane Smith', 'Tom Smith'], status: 'Active' }
    ],
    admins: [
      { id: 8, name: 'Admin User', email: 'admin@example.com', role: 'Admin', permissions: 'Full Access', status: 'Active' }
    ]
  };

  const getCurrentData = () => {
    return mockData[activeTab] || [];
  };

  const filteredData = getCurrentData().filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || item.role.toLowerCase() === selectedRole;
    const matchesStatus = selectedStatus === 'all' || item.status.toLowerCase() === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const renderTable = () => {
    if (activeTab === 'students') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Stream</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class} {student.stream}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.linkedParent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm" variant="outline" onClick={() => console.log('Edit', student.id)}>
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => console.log('View', student.id)}>
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => console.log('Delete', student.id)}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'teachers') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.classes.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.studentsCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      teacher.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm" variant="outline" onClick={() => console.log('Edit', teacher.id)}>
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => console.log('View', teacher.id)}>
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Similar structure for parents and admins
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.children ? user.children.join(', ') : user.permissions || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button size="sm" variant="outline" onClick={() => console.log('Edit', user.id)}>
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => console.log('View', user.id)}>
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => console.log('Add new user')}>
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full"
              />
            </div>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="p-6">
        {renderTable()}
      </Card>
    </div>
  );
}
