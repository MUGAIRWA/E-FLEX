import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, FilterIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
export function GradebookTab() {
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [grade, setGrade] = useState<string>('');
  const submissions = [{
    id: 1,
    student: 'Alice Kamau',
    assignment: 'Algebra Problem Set',
    subject: 'Mathematics',
    class: 'Form 3A',
    submittedAt: '2024-01-18 10:30 AM',
    status: 'pending',
    totalPoints: 20,
    fileUrl: '#'
  }, {
    id: 2,
    student: 'Brian Ochieng',
    assignment: 'Essay: Climate Change',
    subject: 'English',
    class: 'Form 3A',
    submittedAt: '2024-01-18 2:15 PM',
    status: 'pending',
    totalPoints: 30,
    fileUrl: '#'
  }, {
    id: 3,
    student: 'Catherine Wanjiru',
    assignment: 'Geometry Worksheet',
    subject: 'Mathematics',
    class: 'Form 2A',
    submittedAt: '2024-01-17 11:00 AM',
    status: 'graded',
    totalPoints: 15,
    grade: 14,
    fileUrl: '#'
  }];
  const handleGradeSubmit = () => {
    console.log('Grade submitted:', grade);
    setSelectedSubmission(null);
    setGrade('');
  };
  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Gradebook
        </h1>
        <p className="text-gray-600">Review and grade student submissions</p>
      </div>
      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search students or assignments..." className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors" />
          </div>
          <select className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors">
            <option>All Classes</option>
            <option>Form 3A</option>
            <option>Form 3B</option>
            <option>Form 2A</option>
          </select>
          <select className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors">
            <option>All Status</option>
            <option>Pending</option>
            <option>Graded</option>
          </select>
        </div>
      </Card>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-red-400 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">15</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-green-400 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">48</p>
              <p className="text-sm text-gray-600">Graded This Week</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">3</p>
              <p className="text-sm text-gray-600">Late Submissions</p>
            </div>
          </div>
        </Card>
      </div>
      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission, index) => <motion.div key={submission.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }}>
            <Card>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-poppins font-bold text-lg text-gray-800">
                        {submission.student}
                      </h3>
                      {submission.status === 'pending' ? <span className="text-xs bg-warning/10 text-warning px-3 py-1 rounded-full font-semibold">
                          Pending
                        </span> : <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-semibold">
                          Graded
                        </span>}
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      {submission.assignment}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{submission.subject}</span>
                      <span>•</span>
                      <span>{submission.class}</span>
                      <span>•</span>
                      <span>Submitted: {submission.submittedAt}</span>
                      <span>•</span>
                      <span>Points: {submission.totalPoints}</span>
                    </div>
                  </div>
                  {submission.status === 'graded' && submission.grade && <div className="text-right">
                      <p className="text-2xl font-bold text-success">
                        {submission.grade}/{submission.totalPoints}
                      </p>
                      <p className="text-sm text-gray-600">Score</p>
                    </div>}
                </div>
                {selectedSubmission === submission.id ? <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grade (out of {submission.totalPoints})
                        </label>
                        <input type="number" max={submission.totalPoints} value={grade} onChange={e => setGrade(e.target.value)} placeholder="Enter grade" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback
                        </label>
                        <textarea rows={3} placeholder="Add feedback for the student" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none" />
                      </div>
                      <div className="flex space-x-3">
                        <Button variant="primary" onClick={handleGradeSubmit}>
                          Submit Grade
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div> : <div className="flex space-x-3">
                    <Button variant="primary" size="sm" onClick={() => setSelectedSubmission(submission.id)}>
                      {submission.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                    </Button>
                    <Button variant="outline" size="sm">
                      View Submission
                    </Button>
                  </div>}
              </div>
            </Card>
          </motion.div>)}
      </div>
    </div>;
}