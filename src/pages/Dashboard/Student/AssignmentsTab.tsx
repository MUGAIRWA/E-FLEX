import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadIcon, FileTextIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
export function AssignmentsTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const assignments = [{
    id: 1,
    title: 'Algebra Problem Set',
    subject: 'Mathematics',
    dueDate: '2024-01-20',
    status: 'pending',
    description: 'Complete exercises 1-15 from Chapter 3',
    points: 20
  }, {
    id: 2,
    title: 'Essay: Climate Change',
    subject: 'English',
    dueDate: '2024-01-22',
    status: 'pending',
    description: 'Write a 500-word essay on climate change impacts',
    points: 30
  }, {
    id: 3,
    title: 'Lab Report: Chemical Reactions',
    subject: 'Sciences',
    dueDate: '2024-01-18',
    status: 'overdue',
    description: 'Submit your lab findings and analysis',
    points: 25
  }, {
    id: 4,
    title: 'Geometry Worksheet',
    subject: 'Mathematics',
    dueDate: '2024-01-15',
    status: 'submitted',
    description: 'Triangle properties and calculations',
    points: 15,
    grade: 18
  }];
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center space-x-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            <ClockIcon className="w-3 h-3" />
            <span>Pending</span>
          </span>;
      case 'submitted':
        return <span className="flex items-center space-x-1 text-xs bg-success/10 text-success px-3 py-1 rounded-full">
            <CheckCircleIcon className="w-3 h-3" />
            <span>Submitted</span>
          </span>;
      case 'overdue':
        return <span className="flex items-center space-x-1 text-xs bg-warning/10 text-warning px-3 py-1 rounded-full">
            <AlertCircleIcon className="w-3 h-3" />
            <span>Overdue</span>
          </span>;
      default:
        return null;
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Assignments
        </h1>
        <p className="text-gray-600">View and submit your assignments</p>
      </div>
      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">2</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-green-400 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">8</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-red-400 flex items-center justify-center">
              <AlertCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">1</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </Card>
      </div>
      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment, index) => <motion.div key={assignment.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }}>
            <Card>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center flex-shrink-0">
                      <FileTextIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-poppins font-bold text-lg text-gray-800">
                          {assignment.title}
                        </h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {assignment.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span className="font-medium mr-1">Subject:</span>{' '}
                          {assignment.subject}
                        </span>
                        <span className="flex items-center">
                          <span className="font-medium mr-1">Due:</span>{' '}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <span className="font-medium mr-1">Points:</span>{' '}
                          {assignment.points}
                        </span>
                        {assignment.grade && <span className="flex items-center text-success font-semibold">
                            Grade: {assignment.grade}/{assignment.points}
                          </span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 md:ml-4">
                  {assignment.status === 'pending' && <>
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                        <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all">
                          <UploadIcon className="w-4 h-4" />
                          <span className="font-semibold text-sm">Upload</span>
                        </div>
                      </label>
                      {selectedFile && <Button variant="primary" size="sm">
                          Submit
                        </Button>}
                    </>}
                  {assignment.status === 'submitted' && <Button variant="outline" size="sm">
                      View Submission
                    </Button>}
                  {assignment.status === 'overdue' && <Button variant="primary" size="sm">
                      Submit Late
                    </Button>}
                </div>
              </div>
            </Card>
          </motion.div>)}
      </div>
    </div>;
}