'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import LibrarianNavbar from '@/app/components/LibrarianNavbar';

const COLORS = {
  bg: 'bg-gray-950',
  text: 'text-gray-100',
  textMuted: 'text-gray-400',
  border: 'border-gray-700',
  card: 'bg-gray-900 border border-gray-700',
  accent: 'text-amber-500',
};

export default function LibrarianAnnouncements() {
  const { user, isLoaded } = useUser();
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!isLoaded || !user) return;
    
    const email = user?.emailAddresses[0]?.emailAddress;
    fetchUserAndNotifications(email);
  }, [user, isLoaded]);

  const fetchUserAndNotifications = async (email) => {
    try {
      setLoading(true);
      setError('');

      // Get user ID from email
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user-by-email/${email}`
      );
      
      if (!userResponse.ok) throw new Error('Failed to fetch user');
      const userData = await userResponse.json();
      const id = userData.user_id;
      setUserId(id);

      // Fetch notifications
      const notifResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/notifications/${id}`
      );

      if (notifResponse.ok) {
        const data = await notifResponse.json();
        setNotifications(data.notifications || []);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnnouncementColor = (type) => {
    switch (type) {
      case 'SYSTEM':
        return 'bg-blue-900 border-blue-700';
      case 'REMINDER':
        return 'bg-yellow-900 border-yellow-700';
      case 'FINE_NOTICE':
        return 'bg-red-900 border-red-700';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'SYSTEM':
        return '📢 System Announcement';
      case 'REMINDER':
        return '⏰ Reminder';
      case 'FINE_NOTICE':
        return '⚠️ Fine Notice';
      default:
        return '📌 Notification';
    }
  };

  const filteredNotifications = filter === 'ALL' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  return (
    <div className={`min-h-screen ${COLORS.bg} ${COLORS.text}`}>
      <LibrarianNavbar />
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  General <span className={COLORS.accent}>Announcements</span>
                </h1>
                <p className={COLORS.textMuted}>Messages from library administration</p>
              </div>
              <Link href="/librarian/dashboard">
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Filter Buttons */}
          {!loading && notifications.length > 0 && (
            <div className="flex gap-3 mb-8 flex-wrap">
              {[
                { value: 'ALL', label: 'All', count: notifications.length },
                { value: 'SYSTEM', label: 'System', count: notifications.filter(n => n.type === 'SYSTEM').length },
                { value: 'REMINDER', label: 'Reminders', count: notifications.filter(n => n.type === 'REMINDER').length },
                { value: 'FINE_NOTICE', label: 'Fines', count: notifications.filter(n => n.type === 'FINE_NOTICE').length },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`py-2 px-4 rounded-lg font-semibold transition border-2 ${
                    filter === option.value
                      ? 'bg-amber-700 border-amber-600 text-gray-950'
                      : 'bg-gray-800 border-gray-700 text-amber-200 hover:border-amber-600'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                <p className={COLORS.textMuted}>Loading announcements...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6"
            >
              <p className="text-red-100">{error}</p>
              <button
                onClick={() => user && fetchUserAndNotifications(user.emailAddresses[0].emailAddress)}
                className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && filteredNotifications.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${COLORS.card} rounded-lg p-12 text-center`}
            >
              <div className="mb-4 text-4xl">📭</div>
              <h3 className="text-xl font-semibold mb-2">No Announcements</h3>
              <p className={COLORS.textMuted}>No announcements match your filter. Check back soon!</p>
            </motion.div>
          )}

          {/* Announcements List */}
          {!loading && filteredNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.notification_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${COLORS.card} rounded-lg p-6 hover:border-amber-500 transition border-2`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Type Badge */}
                      <div className="mb-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getAnnouncementColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>

                      {/* Message */}
                      <h3 className="text-lg font-semibold mb-2">
                        {notification.message}
                      </h3>

                      {/* Date */}
                      <p className={`text-sm ${COLORS.textMuted}`}>
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`${COLORS.card} rounded-lg p-4 mt-8 text-center ${COLORS.textMuted}`}
              >
                <p>Showing {filteredNotifications.length} of {notifications.length} announcements</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
