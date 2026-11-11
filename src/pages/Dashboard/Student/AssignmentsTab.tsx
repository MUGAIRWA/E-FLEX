import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  SendIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { assignmentAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';

export function AssignmentsTab() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubmitId, setActiveSubmitId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const formatClassLabel = (cls?: string, stream?: string) => {
    const prettyClass = cls ? cls.replace(/^form(\d)$/i, 'Form $1') : '';
    return [prettyClass, stream].filter(Boolean).join(' ').trim();
  };

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await assignmentAPI.getAssignments({ limit: 50 });
      const raw = (res.data as any)?.assignments || [];
      setAssignments(raw);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    if (!socket) return;
    const handleRealtimeUpdate = () => {
      loadAssignments();
    };
    socket.on('notification', handleRealtimeUpdate);
    return () => {
      socket.off('notification', handleRealtimeUpdate);
    };
  }, [socket, loadAssignments]);

  const computeStatus = (assignment: any) => {
    const mySubmission = assignment.submissions?.[0];
    if (mySubmission) {
      return mySubmission.status === 'graded' ? 'graded' : 'submitted';
    }
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      return 'overdue';
    }
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 text-xs font-semibold bg-[#E8F1EF] text-[#134E4A] px-3 py-1 rounded-full">
            <ClockIcon className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="flex items-center space-x-1 text-xs font-semibold bg-[#E9F5EE] text-[#1E7A50] px-3 py-1 rounded-full">
            <CheckCircleIcon className="w-3 h-3" />
            <span>Submitted</span>
          </span>
        );
      case 'graded':
        return (
          <span className="flex items-center space-x-1 text-xs font-semibold bg-[#1E7A50] text-white px-3 py-1 rounded-full">
            <CheckCircleIcon className="w-3 h-3" />
            <span>Graded</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="flex items-center space-x-1 text-xs font-semibold bg-[#F3E8DF] text-[#C85A28] px-3 py-1 rounded-full">
            <AlertCircleIcon className="w-3 h-3" />
            <span>Overdue</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault();
    if (!submissionText.trim() && !selectedFile) {
      setErrorMsg('Please enter your answer or attach your assignment file.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      if (submissionText.trim()) {
        formData.append('content', submissionText.trim());
      }
      if (selectedFile) {
        formData.append('attachments', selectedFile);
      }

      await assignmentAPI.submitAssignment(assignmentId, formData);
      setActiveSubmitId(null);
      setSubmissionText('');
      setSelectedFile(null);
      setToastMsg('Assignment submitted! Your teacher and parent have been notified.');
      loadAssignments();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to submit assignment. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = assignments.filter((a) => computeStatus(a) === 'pending').length;
  const completedCount = assignments.filter((a) => {
    const st = computeStatus(a);
    return st === 'submitted' || st === 'graded';
  }).length;
  const overdueCount = assignments.filter((a) => computeStatus(a) === 'overdue').length;

  const studentStreamLabel = formatClassLabel(
    (user as any)?.class,
    (user as any)?.stream
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins font-bold text-3xl mb-1 text-[#16211E]">
            Class Assignments
          </h1>
          <p className="text-[#5C6663]">
            Assignments posted by your teachers for your class stream
          </p>
        </div>
        {studentStreamLabel && (
          <span className="inline-flex items-center self-start px-4 py-1.5 rounded-full text-xs font-semibold bg-[#134E4A] text-white shadow-sm">
            Stream: {studentStreamLabel}
          </span>
        )}
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-[#E9F5EE] border border-[#BFE3CE] text-[#1E7A50] text-sm font-medium flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#134E4A] flex items-center justify-center shadow-sm">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#16211E]">{pendingCount}</p>
              <p className="text-sm text-[#5C6663]">Pending</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E7A50] flex items-center justify-center shadow-sm">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#16211E]">{completedCount}</p>
              <p className="text-sm text-[#5C6663]">Submitted / Graded</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#C85A28] flex items-center justify-center shadow-sm">
              <AlertCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#16211E]">{overdueCount}</p>
              <p className="text-sm text-[#5C6663]">Overdue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assignments List */}
      {loading ? (
        <Card>
          <p className="text-sm text-[#5C6663] py-6 text-center">
            Loading assignments for your class stream...
          </p>
        </Card>
      ) : assignments.length === 0 ? (
        <Card>
          <div className="text-center py-8 space-y-2">
            <FileTextIcon className="w-10 h-10 text-[#8A9490] mx-auto" />
            <h3 className="font-poppins font-bold text-lg text-[#16211E]">
              No assignments posted yet
            </h3>
            <p className="text-sm text-[#5C6663]">
              When your teacher posts an assignment for {studentStreamLabel || 'your stream'}, it will appear here automatically.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => {
            const aId = assignment.id || assignment._id;
            const status = computeStatus(assignment);
            const mySub = assignment.submissions?.[0];
            const attachment = assignment.attachments?.[0];
            const streamBadge = formatClassLabel(
              assignment.course?.class,
              assignment.course?.stream
            );

            return (
              <motion.div
                key={aId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-[#C85A28] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <FileTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5 mb-2">
                            <h3 className="font-poppins font-bold text-lg text-[#16211E]">
                              {assignment.title}
                            </h3>
                            {getStatusBadge(status)}
                            {streamBadge && (
                              <span className="text-xs font-medium bg-[#F4F1EA] border border-[#E5E0D5] text-[#3B4744] px-2.5 py-0.5 rounded-full">
                                {streamBadge}
                              </span>
                            )}
                          </div>
                          {assignment.description && (
                            <p className="text-sm text-[#3B4744] mb-3 whitespace-pre-wrap">
                              {assignment.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-[#5C6663]">
                            <span className="flex items-center">
                              <span className="font-semibold text-[#16211E] mr-1">
                                Subject:
                              </span>{' '}
                              {assignment.course?.subject || 'General'}
                            </span>
                            {assignment.teacher && (
                              <span className="flex items-center">
                                <span className="font-semibold text-[#16211E] mr-1">
                                  Teacher:
                                </span>{' '}
                                {assignment.teacher.firstName}{' '}
                                {assignment.teacher.lastName}
                              </span>
                            )}
                            <span className="flex items-center">
                              <span className="font-semibold text-[#16211E] mr-1">
                                Due:
                              </span>{' '}
                              {assignment.dueDate
                                ? new Date(assignment.dueDate).toLocaleDateString()
                                : 'No due date'}
                            </span>
                            <span className="flex items-center">
                              <span className="font-semibold text-[#16211E] mr-1">
                                Total Marks:
                              </span>{' '}
                              {assignment.totalMarks || 100}
                            </span>
                          </div>

                          {attachment?.url && (
                            <div className="mt-3">
                              <a
                                href={
                                  attachment.url.startsWith('http')
                                    ? attachment.url
                                    : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''}${attachment.url}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#134E4A] hover:underline"
                              >
                                <ExternalLinkIcon className="w-3.5 h-3.5" />
                                <span>
                                  Download Teacher Attachment (
                                  {attachment.originalName || 'File'})
                                </span>
                              </a>
                            </div>
                          )}

                          {mySub && (
                            <div className="mt-4 p-3.5 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[#134E4A]">
                                  Submitted on{' '}
                                  {new Date(mySub.submittedAt).toLocaleString()}
                                </span>
                                {mySub.marks !== null &&
                                  mySub.marks !== undefined && (
                                    <span className="text-sm font-bold text-[#1E7A50]">
                                      Score: {mySub.marks}/
                                      {assignment.totalMarks || 100}
                                    </span>
                                  )}
                              </div>
                              {mySub.content && (
                                <p className="text-xs text-[#3B4744]">
                                  <span className="font-semibold">Your response:</span>{' '}
                                  {mySub.content}
                                </p>
                              )}
                              {mySub.feedback && (
                                <p className="text-xs text-[#1E7A50] font-medium">
                                  Teacher Feedback: {mySub.feedback}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 md:ml-4">
                      {(status === 'pending' || status === 'overdue') && (
                        <Button
                          variant={status === 'overdue' ? 'accent' : 'primary'}
                          size="sm"
                          onClick={() => {
                            setActiveSubmitId(
                              activeSubmitId === aId ? null : aId
                            );
                            setErrorMsg('');
                          }}
                        >
                          <UploadIcon className="w-4 h-4 mr-1.5" />
                          {status === 'overdue'
                            ? 'Submit Late'
                            : 'Submit Work'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Inline Submission Form */}
                  {activeSubmitId === aId && (
                    <form
                      onSubmit={(e) => handleSubmitAssignment(e, aId)}
                      className="mt-5 pt-5 border-t border-[#E5E0D5] space-y-4"
                    >
                      {errorMsg && (
                        <div className="p-3 rounded-xl bg-[#F3E8DF] border border-[#E8D5C4] text-[#C85A28] text-xs font-medium">
                          {errorMsg}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-[#3B4744] mb-1.5">
                          Your Answer / Notes
                        </label>
                        <textarea
                          rows={3}
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Type your assignment response or notes for your teacher..."
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white focus:border-[#134E4A] focus:outline-none resize-none text-[#16211E]"
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-[#F4F1EA] border border-[#E5E0D5] text-[#16211E] rounded-xl hover:border-[#134E4A] transition-colors text-xs font-semibold">
                          <UploadIcon className="w-4 h-4 text-[#134E4A]" />
                          <span>
                            {selectedFile
                              ? selectedFile.name
                              : 'Attach File (PDF, DOC, TXT, Image)'}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              setSelectedFile(e.target.files?.[0] || null)
                            }
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          />
                        </label>

                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveSubmitId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={submitting}
                          >
                            <SendIcon className="w-4 h-4 mr-1.5" />
                            {submitting ? 'Submitting...' : 'Confirm Submission'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}