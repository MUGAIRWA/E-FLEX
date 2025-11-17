import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, UserIcon, AlertCircleIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { announcementAPI } from '../../../services/api';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: string;
  targetAudience: string;
  priority: string;
  postedBy: {
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt: string;
  isActive: boolean;
}

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
  }, [filter, page]);

  // Listen for real-time announcements
  useEffect(() => {
    if (socket) {
      const handleAnnouncement = (announcement: Announcement) => {
        if (canViewAnnouncement(user, announcement)) {
          setAnnouncements(prev => {
            // Check if announcement already exists to avoid duplicates
            const exists = prev.some(a => a._id === announcement._id);
            if (!exists) {
              return [announcement, ...prev];
            }
            return prev;
          });
        }
      };

      socket.on('announcement', handleAnnouncement);

      return () => {
        socket.off('announcement', handleAnnouncement);
      };
    }
  }, [socket, user]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (filter !== 'all') {
        params.type = filter;
      }

      const response = await announcementAPI.getAnnouncements(params);
      const data: any = response.data;

      if (page === 1) {
        setAnnouncements(data.announcements || []);
      } else {
        setAnnouncements(prev => [...prev, ...(data.announcements || [])]);
      }

      setHasMore((data.announcements || []).length === params.limit && (data.currentPage || page) < (data.totalPages || 0));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'academic': return 'border-blue-500 bg-blue-50';
      case 'administrative': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  // Helper function to check if user can view announcement
  const canViewAnnouncement = (user: any, announcement: Announcement) => {
    if (!user || !announcement) return false;

    if (user.role === 'admin') return true;

    if (announcement.targetAudience === 'all') return true;

    if (user.role === 'student' && announcement.targetAudience === 'students') return true;
    if (user.role === 'parent' && announcement.targetAudience === 'parents') return true;
    if (user.role === 'teacher' && (announcement.targetAudience === 'teachers' || announcement.targetAudience === 'students' || announcement.targetAudience === 'parents')) return true;

    return false;
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
            Announcements
          </h1>
          <p className="text-gray-600">
            Stay updated with the latest news and announcements
          </p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Announcements
        </h1>
        <p className="text-gray-600">
          Stay updated with the latest news and announcements
        </p>
      </div>

      {/* Filter Options */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'general', label: 'General' },
            { key: 'academic', label: 'Academic' },
            { key: 'administrative', label: 'Administrative' },
            { key: 'urgent', label: 'Urgent' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => {
                setFilter(option.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === option.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError('');
              fetchAnnouncements();
            }}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4"
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <BellIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">No announcements found</h3>
            <p className="text-gray-600 text-sm">
              Check back later for updates from your teachers
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${getTypeColor(announcement.type)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Posted by {announcement.postedBy.firstName} {announcement.postedBy.lastName} • {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                  announcement.type === 'urgent' ? 'bg-red-100 text-red-700' :
                  announcement.type === 'academic' ? 'bg-blue-100 text-blue-700' :
                  announcement.type === 'administrative' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {announcement.type}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{announcement.message}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Audience: {announcement.targetAudience}
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Announcements'}
          </Button>
        </div>
      )}
    </div>
  );
}
