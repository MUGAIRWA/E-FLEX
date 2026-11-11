import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareIcon,
  SearchIcon,
  SendIcon,
  RefreshCwIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { notificationAPI } from '../../../services/api';

export function TicketsSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getHelpRequests().catch(() => ({ data: [] }));
      const list = Array.isArray(res.data?.helpRequests)
        ? res.data.helpRequests
        : Array.isArray(res.data)
        ? res.data
        : [];
      setTickets(list);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async (ticketId) => {
    if (!replyMessage.trim()) return;
    setSending(true);
    try {
      await notificationAPI.replyToHelpRequest(ticketId, { message: replyMessage.trim() });
      setReplyMessage('');
      await loadTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const title = (ticket.title || ticket.subject || '').toLowerCase();
    const msg = (ticket.message || ticket.description || '').toLowerCase();
    const userName = ticket.user
      ? `${ticket.user.firstName} ${ticket.user.lastName}`.toLowerCase()
      : '';
    return (
      !searchTerm.trim() ||
      title.includes(searchTerm.toLowerCase()) ||
      msg.includes(searchTerm.toLowerCase()) ||
      userName.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16211E]">Tickets & Support</h1>
          <p className="text-sm text-[#5C6663] mt-1">
            Live support and help requests submitted by students, parents, and teachers.
          </p>
        </div>
        <Button variant="outline" onClick={loadTickets} disabled={loading}>
          <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-5">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-3 h-5 w-5 text-[#5C6663]" />
          <input
            type="text"
            placeholder="Search support tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-2.5 border border-[#D8D1C4] rounded-xl w-full"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[#16211E] mb-4">
              Support Requests ({filteredTickets.length})
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134E4A]" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <p className="text-sm text-[#5C6663] py-8 text-center">
                No support tickets have been submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => {
                  const tid = ticket.id || ticket._id;
                  const isSelected = (selectedTicket?.id || selectedTicket?._id) === tid;
                  return (
                    <motion.div
                      key={tid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#134E4A] bg-[#134E4A]/5'
                          : 'border-[#E5E0D5] bg-[#F8F6F1]/50 hover:border-[#134E4A]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#16211E]">
                          {ticket.title || ticket.subject || 'Support Request'}
                        </span>
                        <span className="text-xs text-[#5C6663]">
                          {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                      <p className="text-sm text-[#5C6663] line-clamp-2">
                        {ticket.message || ticket.description}
                      </p>
                      {ticket.user && (
                        <p className="text-xs font-medium text-[#134E4A] mt-2">
                          From: {ticket.user.firstName} {ticket.user.lastName} ({ticket.user.email})
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div>
          {selectedTicket ? (
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#16211E]">
                  {selectedTicket.title || selectedTicket.subject || 'Support Ticket'}
                </h3>
                {selectedTicket.user && (
                  <p className="text-xs text-[#5C6663] mt-0.5">
                    Submitted by {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                  </p>
                )}
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] text-sm text-[#16211E]">
                {selectedTicket.message || selectedTicket.description}
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-[#16211E]">
                  Send Reply Notification
                </label>
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write a response..."
                  className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl text-sm"
                />
                <Button
                  className="w-full"
                  disabled={sending || !replyMessage.trim()}
                  onClick={() => handleSendReply(selectedTicket.id || selectedTicket._id)}
                >
                  <SendIcon className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center text-[#5C6663] py-8">
                <MessageSquareIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a support ticket to view details and reply.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
