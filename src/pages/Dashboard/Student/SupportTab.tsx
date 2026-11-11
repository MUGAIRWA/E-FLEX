import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircleIcon,
  SendIcon,
  CheckCircleIcon,
  MessageSquareIcon,
  BookOpenIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { notificationAPI } from '../../../services/api';
import { useSocket } from '../../../contexts/SocketContext';
// @ts-ignore
import { SUBJECTS } from '../../../constants/subjects';

export function SupportTab() {
  const { socket } = useSocket();
  const [subject, setSubject] = useState<string>(SUBJECTS?.[0] || 'Mathematics');
  const [topic, setTopic] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHelpHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await notificationAPI.getHelpRequests();
      setHelpRequests(res.data?.helpRequests || []);
    } catch (err) {
      console.error('Failed to load help history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHelpHistory();
  }, [loadHelpHistory]);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = () => {
      loadHelpHistory();
    };
    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, loadHelpHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !details.trim()) {
      setErrorMsg('Please specify the topic/area and describe what you need help with.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await notificationAPI.createHelpRequest({
        subject,
        topic: topic.trim(),
        urgency,
        details: details.trim()
      });

      setSuccessMsg(
        res.data?.message ||
          'Your teacher has been notified and will assist you shortly!'
      );
      setTopic('');
      setDetails('');
      setUrgency('medium');
      loadHelpHistory();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Failed to send help request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-[#16211E]">
          Academic Help & Teacher Support
        </h1>
        <p className="text-[#5C6663]">
          Struggling with a specific subject, topic, or assignment? Alert your teacher directly so they can help you.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-[#E8F1EF] p-3.5 rounded-xl">
              <HelpCircleIcon className="h-6 w-6 text-[#134E4A]" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-xl text-[#16211E]">
                Request Help in a Particular Area
              </h3>
              <p className="text-[#5C6663] text-sm">
                Your teacher will receive an instant notification with the exact subject and topic you need help with
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 p-4 rounded-xl bg-[#E9F5EE] border border-[#BFE3CE] text-[#1E7A50] text-sm font-medium flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-4 rounded-xl bg-[#F3E8DF] border border-[#E8D5C4] text-[#C85A28] text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3B4744] mb-2">
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white focus:border-[#134E4A] focus:outline-none transition-colors text-[#16211E]"
                >
                  {(SUBJECTS || ['Mathematics', 'English', 'Chemistry', 'Biology', 'Physics']).map(
                    (subj: string) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3B4744] mb-2">
                  Particular Topic / Area *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quadratic Equations, Mole Concept..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white focus:border-[#134E4A] focus:outline-none transition-colors text-[#16211E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3B4744] mb-2">
                  How Urgent Is This?
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white focus:border-[#134E4A] focus:outline-none transition-colors text-[#16211E]"
                >
                  <option value="low">Low — General clarification</option>
                  <option value="medium">Medium — Stuck on practice/homework</option>
                  <option value="high">High — Need help before upcoming quiz/exam</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3B4744] mb-2">
                What part are you finding difficult? *
              </label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the concept, formula, or question you are stuck on..."
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white focus:border-[#134E4A] focus:outline-none transition-colors resize-none text-[#16211E]"
                required
              />
            </div>

            <Button type="submit" variant="primary" disabled={submitting}>
              <SendIcon className="w-4 h-4 mr-2" />
              {submitting ? 'Notifying Teacher...' : 'Notify Teacher for Help'}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Previous Help Requests & Teacher Replies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquareIcon className="w-5 h-5 text-[#134E4A]" />
            <h3 className="font-poppins font-bold text-xl text-[#16211E]">
              Your Help Requests & Teacher Guidance
            </h3>
          </div>

          {loadingHistory ? (
            <p className="text-sm text-[#5C6663]">Loading your help requests...</p>
          ) : helpRequests.length === 0 ? (
            <p className="text-sm text-[#5C6663]">
              You haven&apos;t sent any help requests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {helpRequests.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F1EF] text-[#134E4A]">
                        <BookOpenIcon className="w-3.5 h-3.5 mr-1" />
                        {item.subject}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3E8DF] text-[#C85A28]">
                        Topic: {item.topic}
                      </span>
                      {item.teacher && (
                        <span className="text-xs text-[#5C6663]">
                          Sent to {item.teacher.firstName} {item.teacher.lastName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#8A9490]">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ''}
                    </span>
                  </div>

                  <p className="text-sm text-[#16211E]">{item.details}</p>

                  {item.replies && item.replies.length > 0 ? (
                    <div className="pl-4 border-l-2 border-[#1E7A50] space-y-2 mt-2">
                      {item.replies.map((rep: any) => (
                        <div
                          key={rep.id}
                          className="bg-[#E9F5EE] p-3 rounded-xl text-sm text-[#16211E]"
                        >
                          <p className="text-xs font-semibold text-[#1E7A50] mb-1">
                            {rep.teacherName} replied:
                          </p>
                          <p>{rep.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#D97706] font-semibold">
                      Awaiting teacher response...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
