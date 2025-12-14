'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';

const COLORS = {
  bg: 'bg-gray-950',
  text: 'text-gray-100',
  textMuted: 'text-gray-400',
  border: 'border-gray-700',
  card: 'bg-gray-900 border border-gray-700',
  accent: 'text-amber-500',
};

export default function MemberAnnouncements() {
  const { getToken } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        setError('Failed to load announcements');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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
        return 'System Announcement';
      case 'REMINDER':
        return 'Reminder';
      case 'FINE_NOTICE':
        return 'Fine Notice';
      default:
        return 'Announcement';
    }
  };

  return (
    <div className={`min-h-screen ${COLORS.bg} ${COLORS.text} p-8`}>
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
              <p className={COLORS.textMuted}>System announcements and updates</p>
            </div>
            <Link href="/member/dashboard">
              <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </motion.div>

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
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && announcements.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${COLORS.card} rounded-lg p-12 text-center`}
          >
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Announcements Yet</h3>
            <p className={COLORS.textMuted}>Check back soon for system announcements and updates</p>
          </motion.div>
        )}

        {/* Announcements List */}
        {!loading && announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.announcement_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${COLORS.card} rounded-lg p-6 hover:border-amber-500 transition border-2`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getAnnouncementColor(announcement.announcement_type)}`}>
                        {getTypeLabel(announcement.announcement_type)}
                      </span>
                    </div>

                    {/* Message */}
                    <h3 className="text-lg font-semibold mb-2">
                      {announcement.message}
                    </h3>

                    {/* Date */}
                    <p className={`text-sm ${COLORS.textMuted}`}>
                      {formatDate(announcement.created_at)}
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
              <p>Total announcements: <span className={COLORS.accent}>{announcements.length}</span></p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
