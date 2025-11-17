import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SubmissionModal } from '../../../components/SubmissionModal';
import { assignmentAPI } from '../../../services/api';

export function GradebookTab() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, selectedClass, selectedStatus]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await assignmentAPI.getAssignments();
      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.submissions.some(sub =>
          `${sub.student.firstName} ${sub.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by class (course)
    if (selectedClass) {
      filtered = filtered.filter(assignment => assignment.course.title === selectedClass);
    }

    // Filter by status
    if (selectedStatus) {
      if (selectedStatus === 'pending') {
        filtered = filtered.filter(assignment =>
          assignment.submissions.some(sub => sub.status === 'pending')
        );
      } else if (selectedStatus === 'graded') {
        filtered = filtered.filter(assignment =>
          assignment.submissions.some(sub => sub.status === 'graded')
        );
      }
    }

    setFilteredAssignments(filtered);
  };

  const handleViewSubmission = (assignment, submission) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradingSubmission(submission._id);
    setGrade(submission.marks?.toString() || '');
    setFeedback(submission.feedback || '');
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission || !selectedAssignment) return;

    try {
      // This would be the API call to save grades
      // await assignmentAPI.gradeAssignment(
      //   selectedAssignment._id,
      //   selectedSubmission.student._id,
      //   { marks: parseInt(grade), feedback }
      // );
      
      console.log('Grade saved:', { grade, feedback });
      setGradingSubmission(null);
      setGrade('');
      setFeedback('');
      
      // Refresh assignments
      await fetchAssignments();
    } catch (err) {
      console.error('Error saving grade:', err);
      setError('Failed to save grade. Please try again.');
    }
  };

  const getSubmissionStatus = (submission) => {
    if (submission.status === 'graded') {
      return {
        icon: <CheckCircleIcon className="w-5 h-5 text-success" />,
        label: 'Graded',
        color: 'bg-success/10 text-success'
      };
    } else if (submission.status === 'pending') {
      return {
        icon: <ClockIcon className="w-5 h-5 text-warning" />,
        label: 'Pending',
        color: 'bg-warning/10 text-warning'
      };
    }
    return {
      icon: <XCircleIcon className="w-5 h-5 text-error" />,
      label: 'Missing',
      color: 'bg-error/10 text-error'
    };
  };

  const classes = [...new Set(assignments.map(a => a.course.title))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gradebook</h1>
        <p className="text-gray-600">Manage and grade student assignments</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments or students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Classes</option>
              {classes.map(className => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-error/10 border border-error/20 rounded-lg text-error"
        >
          {error}
        </motion.div>
      )}

      {/* Assignments List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500">No assignments found</p>
              </div>
            </Card>
          ) : (
            filteredAssignments.map((assignment, index) => (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.course.title}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {assignment.submissions.length} submissions
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                  </div>

                  {/* Submissions */}
                  <div className="space-y-3">
                    {assignment.submissions.map(submission => {
                      const status = getSubmissionStatus(submission);
                      return (
                        <div
                          key={submission._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            {status.icon}
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {submission.student.firstName} {submission.student.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {submission.status === 'graded' && (
                              <span className="text-sm font-medium text-gray-800">
                                {submission.marks}/{assignment.totalMarks}
                              </span>
                            )}
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                              {status.label}
                            </span>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSubmission(assignment, submission)}
                              className="flex items-center gap-2"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View
                            </Button>

                            {submission.status === 'pending' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleGradeSubmission(submission)}
                              >
                                Grade
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Grading Modal */}
      {gradingSubmission && selectedSubmission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Grade Submission - {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter marks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add feedback for the student..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setGradingSubmission(null);
                  setGrade('');
                  setFeedback('');
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleSaveGrade}>
                Save Grade
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Submission Modal */}
      {isModalOpen && selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
