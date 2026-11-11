import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  MessageCircleIcon,
  HelpCircleIcon,
  SendIcon,
  CheckCircleIcon
} from 'lucide-react';
import { messageAPI, notificationAPI } from '../../../services/api';
import { SUBJECTS } from '../../../constants/subjects';

export function MessagesSupportTab() {
  const [activeTab, setActiveTab] = useState('teacher-messages');
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: SUBJECTS?.[0] || 'Mathematics',
    title: '',
    description: '',
    urgency: 'medium'
  });

  const loadMessagesAndTickets = useCallback(async () => {
    try {
      setLoading(true);
      const [msgRes, helpRes] = await Promise.allSettled([
        messageAPI.getMessages({ limit: 30 }),
        notificationAPI.getHelpRequests()
      ]);

      if (msgRes.status === 'fulfilled') {
        const msgs = msgRes.value.data?.messages || [];
        setTeacherMessages(msgs);
      }
      if (helpRes.status === 'fulfilled') {
        const tickets = helpRes.value.data?.helpRequests || [];
        setSupportTickets(tickets);
      }
    } catch (err) {
      console.error('Failed to load parent messages/tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessagesAndTickets();
  }, [loadMessagesAndTickets]);

  const handleRaiseTicket = async () => {
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) return;
    try {
      await notificationAPI.createHelpRequest({
        subject: ticketForm.subject,
        topic: ticketForm.title.trim(),
        urgency: ticketForm.urgency,
        details: ticketForm.description.trim()
      });
      setShowTicketModal(false);
      setTicketForm({
        subject: SUBJECTS?.[0] || 'Mathematics',
        title: '',
        description: '',
        urgency: 'medium'
      });
      setFeedbackMsg('Support ticket raised and sent to the teacher/admin team!');
      setTimeout(() => setFeedbackMsg(''), 3500);
      loadMessagesAndTickets();
    } catch (err) {
      console.error('Failed to raise ticket:', err);
    }
  };

  return (
    <div className="space-y-6">
      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('teacher-messages')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'teacher-messages'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageCircleIcon className="w-4 h-4 inline mr-2" />
          Teacher Messages
        </button>
        <button
          onClick={() => setActiveTab('support-tickets')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'support-tickets'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <HelpCircleIcon className="w-4 h-4 inline mr-2" />
          Support Tickets
        </button>
      </div>

      {/* Teacher Messages */}
      {activeTab === 'teacher-messages' && (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <p className="text-sm text-gray-500">Loading messages...</p>
            </Card>
          ) : teacherMessages.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <MessageCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  No direct teacher messages yet
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  When teachers send you messages regarding your child&apos;s coursework, they will appear here.
                </p>
              </div>
            </Card>
          ) : (
            teacherMessages.map((msg) => {
              const senderName = msg.sender
                ? `${msg.sender.firstName} ${msg.sender.lastName}`
                : 'Teacher';
              return (
                <Card key={msg.id || msg._id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {senderName}
                      </h4>
                      <p className="text-xs text-gray-500">{msg.subject}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2 text-sm">{msg.content}</p>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Support Tickets */}
      {activeTab === 'support-tickets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Support Tickets
            </h3>
            <Button
              variant="primary"
              onClick={() => setShowTicketModal(true)}
            >
              Raise Ticket
            </Button>
          </div>

          {loading ? (
            <Card>
              <p className="text-sm text-gray-500">Loading support tickets...</p>
            </Card>
          ) : supportTickets.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <HelpCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  No support tickets submitted yet
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click &quot;Raise Ticket&quot; above if you need assistance from teachers or school administration.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <Card key={ticket.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {ticket.topic || ticket.subject || 'Support Request'}
                      </h4>
                      <p className="text-sm text-gray-600">{ticket.details}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.isRead
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {ticket.isRead ? 'Resolved' : 'Open'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showTicketModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTicketModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Raise Support Ticket
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject / Department
                </label>
                <select
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {(SUBJECTS || ['Mathematics', 'English', 'Chemistry']).map(
                    (subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title / Topic
                </label>
                <input
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      description: e.target.value
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Detailed description of the issue"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowTicketModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleRaiseTicket}
              >
                <SendIcon className="w-4 h-4 mr-1.5" />
                Submit Ticket
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
