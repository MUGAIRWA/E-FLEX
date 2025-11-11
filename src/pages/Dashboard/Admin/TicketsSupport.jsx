import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircleIcon, MessageSquareIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon, UserIcon, FilterIcon, SearchIcon, SendIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function TicketsSupport() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const ticketsData = [
    {
      id: 'TCK001',
      user: 'John Doe',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      date: '2024-01-15',
      assignedTo: 'Admin',
      subject: 'Login Issues',
      description: 'User unable to login to the platform',
      messages: [
        { from: 'John Doe', message: 'I cannot log in to my account', time: '2024-01-15 10:00' },
        { from: 'Admin', message: 'Please try resetting your password', time: '2024-01-15 10:30' }
      ]
    },
    {
      id: 'TCK002',
      user: 'Jane Smith',
      category: 'Payment',
      priority: 'Medium',
      status: 'In Review',
      date: '2024-01-14',
      assignedTo: 'Support',
      subject: 'Payment Not Processed',
      description: 'Subject payment was not processed correctly',
      messages: [
        { from: 'Jane Smith', message: 'My payment for Mathematics was not processed', time: '2024-01-14 14:00' }
      ]
    },
    {
      id: 'TCK003',
      user: 'Mike Johnson',
      category: 'Academic',
      priority: 'Low',
      status: 'Resolved',
      date: '2024-01-13',
      assignedTo: 'Admin',
      subject: 'Grade Inquiry',
      description: 'Student questioning their assignment grade',
      messages: [
        { from: 'Mike Johnson', message: 'I think my grade is wrong', time: '2024-01-13 09:00' },
        { from: 'Admin', message: 'Grade has been reviewed and confirmed', time: '2024-01-13 11:00' }
      ]
    },
    {
      id: 'TCK004',
      user: 'Alice Brown',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      date: '2024-01-12',
      assignedTo: null,
      subject: 'App Crashing',
      description: 'Mobile app crashes when accessing assignments',
      messages: [
        { from: 'Alice Brown', message: 'The app keeps crashing', time: '2024-01-12 16:00' }
      ]
    }
  ];

  const filteredTickets = ticketsData.filter(ticket => {
    const matchesCategory = selectedCategory === 'all' || ticket.category.toLowerCase() === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || ticket.status.toLowerCase().replace(' ', '') === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority.toLowerCase() === selectedPriority;
    const matchesSearch = ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesPriority && matchesSearch;
  });

  const handleStatusChange = (ticketId, newStatus) => {
    console.log(`Change status of ${ticketId} to ${newStatus}`);
    // Here you would update the ticket status
  };

  const handleAssign = (ticketId, assignee) => {
    console.log(`Assign ${ticketId} to ${assignee}`);
    // Here you would assign the ticket
  };

  const handleSendMessage = (ticketId) => {
    if (newMessage.trim()) {
      console.log(`Send message to ${ticketId}: ${newMessage}`);
      setNewMessage('');
      // Here you would send the message
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <AlertTriangleIcon className="w-4 h-4" />;
      case 'Medium':
        return <ClockIcon className="w-4 h-4" />;
      case 'Low':
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <HelpCircleIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tickets / Support</h1>
        <div className="text-sm text-gray-500">Manage all technical and academic support requests</div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="payment">Payment</option>
            <option value="academic">Academic</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="inreview">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Support Tickets</h2>
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{ticket.id}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <div className={`flex items-center space-x-1 ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityIcon(ticket.priority)}
                        <span className="text-xs font-medium">{ticket.priority}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{ticket.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600">by {ticket.user} • {ticket.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Assigned to</p>
                      <p className="text-sm font-medium">{ticket.assignedTo || 'Unassigned'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Ticket Details */}
        <div>
          {selectedTicket ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedTicket.id}</h2>
                <div className="flex space-x-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <select
                    value={selectedTicket.assignedTo || ''}
                    onChange={(e) => handleAssign(selectedTicket.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    <option value="Admin">Admin</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedTicket.subject}</h3>
                  <p className="text-sm text-gray-600">{selectedTicket.description}</p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Category: {selectedTicket.category}</span>
                  <span>Priority: {selectedTicket.priority}</span>
                  <span>User: {selectedTicket.user}</span>
                </div>

                {/* Messages */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedTicket.messages.map((msg, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {msg.from.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{msg.from}</span>
                          <span className="text-xs text-gray-500">{msg.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Message */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedTicket.id)}
                  />
                  <Button onClick={() => handleSendMessage(selectedTicket.id)}>
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center text-gray-500">
                <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a ticket to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
