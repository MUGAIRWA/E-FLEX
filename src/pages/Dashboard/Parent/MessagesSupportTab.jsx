import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { MessageCircleIcon, HelpCircleIcon, SendIcon, PaperclipIcon, ClockIcon } from 'lucide-react';

export function MessagesSupportTab() {
  const [activeTab, setActiveTab] = useState('teacher-messages');
  const [newMessage, setNewMessage] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'technical'
  });

  const teacherMessages = [
    {
      id: 1,
      teacher: 'Mr. Kamau',
      subject: 'Mathematics',
      lastMessage: 'Please review the algebra homework.',
      timestamp: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      teacher: 'Ms. Njeri',
      subject: 'English',
      lastMessage: 'Great progress on the essay!',
      timestamp: '1 day ago',
      unread: false
    }
  ];

  const supportTickets = [
    {
      id: '#112',
      issue: 'Payment not reflecting',
      status: 'Open',
      lastUpdate: '1h ago'
    },
    {
      id: '#108',
      issue: 'Login issues',
      status: 'Resolved',
      lastUpdate: '2 days ago'
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage('');
    }
  };

  const handleRaiseTicket = () => {
    // Handle raising ticket
    setShowTicketModal(false);
    setTicketForm({ title: '', description: '', category: 'technical' });
  };

  return (
    <div className="space-y-6">
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
          {teacherMessages.map((message) => (
            <Card key={message.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.teacher}`}
                    alt={message.teacher}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{message.teacher}</h4>
                    <p className="text-sm text-gray-600">{message.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{message.timestamp}</p>
                  {message.unread && (
                    <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mt-2">{message.lastMessage}</p>
            </Card>
          ))}

          {/* Message Input */}
          <Card>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="outline" size="sm">
                <PaperclipIcon className="w-4 h-4" />
              </Button>
              <Button variant="primary" size="sm" onClick={handleSendMessage}>
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Support Tickets */}
      {activeTab === 'support-tickets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Support Tickets</h3>
            <Button variant="primary" onClick={() => setShowTicketModal(true)}>
              Raise Ticket
            </Button>
          </div>

          <div className="space-y-3">
            {supportTickets.map((ticket) => (
              <Card key={ticket.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{ticket.id}</h4>
                    <p className="text-sm text-gray-600">{ticket.issue}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'Open'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{ticket.lastUpdate}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">Raise Support Ticket</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
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
              <Button variant="primary" className="flex-1" onClick={handleRaiseTicket}>
                Raise Ticket
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
