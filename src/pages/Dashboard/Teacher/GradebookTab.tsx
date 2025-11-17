import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SubmissionModal } from '../../../components/SubmissionModal';
import { assignmentAPI } from '../../../services/api';

interface Submission {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber?: string;
  };
  content?: string;
  attachments?: Array<{
    filename: string;
    originalName: string;
    url: string;
  }>;
  submittedAt: string;
  marks?: number;
  feedback?: string;
  status: 'pending' | 'graded';
  gradedAt?: string;
  gradedBy?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
    subject: string;
  };
  totalMarks: number;
  dueDate: string;
  submissions: Submission[];
}

export function GradebookTab() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [grade, setGrade] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
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
      filtered = filtered.filter(assignment => {
        if (selectedStatus === 'pending') {
          return assignment.submissions.some(sub => sub.status === 'pending');
        } else if (selectedStatus === 'graded') {
          return assignment.submissions.some(sub => sub.status === 'graded');
        }
        return true;
      });
    }

    setFilteredAssignments(filtered);
  };

  const handleGradeSubmit = async (assignmentId: string, studentId: string) => {
    if (!grade.trim()) {
      alert('Please enter a grade');
      return;
    }

    const gradeValue = parseFloat(grade);
    if (isNaN(gradeValue) || gradeValue < 0) {
      alert('Please enter a valid grade');
      return;
    }

    try {
      setGradingSubmission(studentId);
      await assignmentAPI.gradeAssignment(assignmentId, studentId, {
        marks: gradeValue,
        feedback: feedback.trim()
      });

      // Update local state
      setAssignments(prevAssignments =>
        prevAssignments.map(assignment => {
          if (assignment._id === assignmentId) {
            return {
              ...assignment,
              submissions: assignment.submissions.map(sub =>
                sub.student._id === studentId
                  ? {
                      ...sub,
                      marks: gradeValue,
                      feedback: feedback.trim(),
                      status: 'graded' as const,
                      gradedAt: new Date().toISOString()
                    }
                  : sub
              )
            };
          }
          return assignment;
        })
      );

      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      alert('Grade submitted successfully!');
    } catch (err) {
      console.error('Error grading assignment:', err);
      alert('Failed to submit grade. Please try again.');
    } finally {
      setGradingSubmission(null);
    }
  };

  const handleViewSubmission = (assignment: Assignment, submission: Submission) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const calculateStats = () => {
    const allSubmissions = filteredAssignments.flatMap(assignment => assignment.submissions);
    const pendingCount = allSubmissions.filter(sub => sub.status === 'pending').length;
    const gradedCount = allSubmissions.filter(sub => sub.status === 'graded').length;
    const lateSubmissions = allSubmissions.filter(sub => {
      const dueDate = new Date(sub.submittedAt); // This should be assignment due date, but using submittedAt for now
      const submittedDate = new Date(sub.submittedAt);
      return submittedDate > dueDate;
    }).length;

    return {
      pendingReview: pendingCount,
      gradedThisWeek: gradedCount, // This should be filtered by this week
      lateSubmissions: lateSubmissions
    };
  };

  const stats = calculateStats();

  const getUniqueClasses = () => {
    const classes = assignments.map(assignment => assignment.course.title);
    return [...new Set(classes)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAssignments}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
            <input
              type="text"
              placeholder="Search students or assignments..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {getUniqueClasses().map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
          <select
            className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
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
              <p className="text-2xl font-bold text-gray-800">{stats.pendingReview}</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.gradedThisWeek}</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.lateSubmissions}</p>
              <p className="text-sm text-gray-600">Late Submissions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assignments and Submissions List */}
      <div className="space-y-6">
        {filteredAssignments.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No assignments found matching your criteria.</p>
            </div>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment._id}>
              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-800">{assignment.title}</h3>
                <p className="text-sm text-gray-600">{assignment.course.title} • {assignment.course.subject}</p>
                <p className="text-sm text-gray-600">Total Points: {assignment.totalMarks}</p>
              </div>

              {assignment.submissions.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {assignment.submissions.map((submission, index) => (
                    <motion.div
                      key={submission._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-poppins font-bold text-lg text-gray-800">
                                {submission.student.firstName} {submission.student.lastName}
                              </h4>
                              {submission.status === 'pending' ? (
                                <span className="text-xs bg-warning/10 text-warning px-3 py-1 rounded-full font-semibold">
                                  Pending
                                </span>
                              ) : (
                                <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-semibold">
                                  Graded
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                            </div>
                          </div>
                          {submission.status === 'graded' && submission.marks !== undefined && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-success">
                                {submission.marks}/{assignment.totalMarks}
                              </p>
                              <p className="text-sm text-gray-600">Score</p>
                            </div>
                          )}
                        </div>

                        {selectedSubmission?._id === submission._id ? (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Grade (out of {assignment.totalMarks})
                                </label>
                                <input
                                  type="number"
                                  max={assignment.totalMarks}
                                  value={grade}
                                  onChange={(e) => setGrade(e.target.value)}
                                  placeholder="Enter grade"
                                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Feedback
                                </label>
                                <textarea
                                  rows={3}
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Add feedback for the student"
                                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none"
                                />
                              </div>
                              <div className="flex space-x-3">
                                <Button
                                  variant="primary"
                                  onClick={() => handleGradeSubmit(assignment._id, submission.student._id)}
                                  disabled={gradingSubmission === submission.student._id}
                                >
                                  {gradingSubmission === submission.student._id ? 'Submitting...' : 'Submit Grade'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedSubmission(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex space-x-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              {submission.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSubmission(assignment, submission)}
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              View Submission
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        submission={selectedSubmission}
        assignmentTitle={selectedAssignment?.title || ''}
        totalMarks={selectedAssignment?.totalMarks || 0}
      />
    </div>
  );
}
