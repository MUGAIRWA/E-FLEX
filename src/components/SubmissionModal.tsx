import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DownloadIcon, FileTextIcon, UserIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface Submission {
  student: {
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
  status: string;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  assignmentTitle: string;
  totalMarks: number;
}

export function SubmissionModal({
  isOpen,
  onClose,
  submission,
  assignmentTitle,
  totalMarks
}: SubmissionModalProps) {
  if (!submission) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {assignmentTitle}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Submission Details
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Student Info */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {submission.student.firstName} {submission.student.lastName}
                  </h3>
                  {submission.student.admissionNumber && (
                    <p className="text-sm text-gray-600">
                      Admission #: {submission.student.admissionNumber}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Submitted: {formatDate(submission.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Submission Content */}
              {submission.content && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Submission Content</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {submission.attachments && submission.attachments.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {submission.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileTextIcon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {attachment.originalName}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grading Info */}
              {submission.status === 'graded' && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Grading</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Score:</span>
                      <span className="text-lg font-bold text-green-800">
                        {submission.marks}/{totalMarks}
                      </span>
                    </div>
                    {submission.feedback && (
                      <div>
                        <span className="text-sm font-medium text-green-800">Feedback:</span>
                        <p className="text-sm text-green-700 mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  submission.status === 'graded'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
