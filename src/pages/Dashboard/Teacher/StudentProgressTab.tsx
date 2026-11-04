import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUpIcon,
  HelpCircleIcon,
  SendIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BookOpenIcon,
  UserIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { notificationAPI, assignmentAPI } from '../../../services/api';
import { useSocket } from '../../../contexts/SocketContext';

export function StudentProgressTab() {
  const { socket, refreshNotifications } = useSocket();
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [helpRes, assignRes] = await Promise.allSettled([
        notificationAPI.getHelpRequests(),
        assignmentAPI.getAssignments({ limit: 20 })
      ]);

      if (helpRes.status === 'fulfilled') {
        setHelpRequests(helpRes.value.data?.helpRequests || []);
      }
      if (assignRes.status === 'fulfilled') {
        setAssignments((assignRes.value.data as any)?.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load student progress & help requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for real-time student help requests
  useEffect(() => {
    if (!socket) return;
    const handleNewHelp = () => {
      fetchData();
      refreshNotifications();
    };
    socket.on('student_help_request', handleNewHelp);
    socket.on('notification', handleNewHelp);
    return () => {
      socket.off('student_help_request', handleNewHelp);
      socket.off('notification', handleNewHelp);
    };
  }, [socket, fetchData, refreshNotifications]);

  const handleSendReply = async (reqItem: any) => {
    const reply = (replyTextMap[reqItem.id] || '').trim();
    if (!reply) return;

    setSendingReplyId(reqItem.id);
    try {
      await notificationAPI.replyToHelpRequest(reqItem.id, {
        studentId: reqItem.studentId || reqItem.student?.id,
        reply,
        subject: reqItem.subject,
        topic: reqItem.topic
      });
      setReplyTextMap((prev) => ({ ...prev, [reqItem.id]: '' }));
      setHelpRequests((prev) =>
        prev.map((h) => (h.id === reqItem.id ? { ...h, isRead: true } : h))
      );
      refreshNotifications();
      setFeedbackMsg(
        `Reply sent to ${
          reqItem.student
            ? `${reqItem.student.firstName} ${reqItem.student.lastName}`
            : 'student'
        }!`
      );
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleMarkResolved = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setHelpRequests((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isRead: true } : h))
      );
      refreshNotifications();
    } catch (err) {
      console.error('Failed to mark resolved:', err);
    }
  };

  const filteredRequests = helpRequests.filter((r) => {
    if (filter === 'unread') return !r.isRead;
    if (filter === 'resolved') return r.isRead;
    return true;
  });

  const unreadHelpCount = helpRequests.filter((r) => !r.isRead).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-3xl mb-1 text-gray-800">
            Student Progress & Help Alerts
          </h1>
          <p className="text-gray-600">
            Respond when students need help in a particular area and monitor coursework performance
          </p>
        </div>
        {unreadHelpCount > 0 && (
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl font-medium text-sm">
            <AlertCircleIcon className="w-5 h-5 text-amber-600" />
            <span>
              {unreadHelpCount} student{unreadHelpCount > 1 ? 's' : ''} waiting for help
            </span>
          </div>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Student Help Requests Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <HelpCircleIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-xl text-gray-800">
                  Students Needing Help by Topic
                </h3>
                <p className="text-gray-600 text-sm">
                  Real-time alerts when students flag a topic or concept they are struggling with
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {(['all', 'unread', 'resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    filter === tab
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'unread' ? `Needs Help (${unreadHelpCount})` : tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 py-4">Loading student help requests...</p>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl">
              <CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-700">No pending help requests in this view</p>
              <p className="text-xs text-gray-500 mt-1">
                When a student requests help in a particular subject or topic, you will be notified immediately in the top bell and here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 rounded-xl border transition-all ${
                    !req.isRead
                      ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-gray-900">
                            {req.student
                              ? `${req.student.firstName} ${req.student.lastName}`
                              : 'Student'}
                          </span>
                          {req.student?.class && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                              {req.student.class} {req.student.stream || ''}
                            </span>
                          )}
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                            {req.subject}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                            Area: {req.topic}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                              req.urgency === 'high'
                                ? 'bg-red-100 text-red-700'
                                : req.urgency === 'low'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.urgency || 'medium'} urgency
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Requested{' '}
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleString()
                            : 'recently'}
                        </p>
                      </div>
                    </div>

                    {!req.isRead ? (
                      <button
                        onClick={() => handleMarkResolved(req.id)}
                        className="text-xs text-gray-600 hover:text-green-600 font-medium underline"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        <span>Responded / Resolved</span>
                      </span>
                    )}
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-gray-200 text-sm text-gray-800 mb-3">
                    {req.details}
                  </div>

                  {/* Quick Teacher Reply */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={replyTextMap[req.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({
                          ...prev,
                          [req.id]: e.target.value
                        }))
                      }
                      placeholder={`Send guidance or explanation on "${req.topic}"...`}
                      className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSendReply(req)}
                      disabled={
                        sendingReplyId === req.id ||
                        !(replyTextMap[req.id] || '').trim()
                      }
                    >
                      <SendIcon className="w-4 h-4 mr-1.5" />
                      {sendingReplyId === req.id ? 'Sending...' : 'Send Guidance'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Coursework & Assignment Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUpIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-xl text-gray-800">
                Assignment Submission & Performance Tracker
              </h3>
              <p className="text-gray-600 text-sm">
                Overview of student submissions and average scores across your assignments
              </p>
            </div>
          </div>

          {assignments.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              No assignments published yet. Publish an assignment in the Upload Content tab to track student progress.
            </p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assign: any) => {
                const subs = Array.isArray(assign.submissions)
                  ? assign.submissions
                  : [];
                const graded = subs.filter((s: any) => s.marks !== null && s.marks !== undefined);
                const avgMarks =
                  graded.length > 0
                    ? Math.round(
                        graded.reduce((sum: number, s: any) => sum + Number(s.marks || 0), 0) /
                          graded.length
                      )
                    : null;

                return (
                  <div
                    key={assign.id || assign._id}
                    className="p-4 bg-gray-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <BookOpenIcon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">{assign.title}</p>
                        <p className="text-xs text-gray-500">
                          {assign.course?.title || assign.course?.subject || 'Course'} • Due{' '}
                          {assign.dueDate
                            ? new Date(assign.dueDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
                        {subs.length} Submission{subs.length === 1 ? '' : 's'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium text-xs">
                        {avgMarks !== null
                          ? `Avg: ${avgMarks}/${assign.totalMarks || 100}`
                          : 'Not graded yet'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
