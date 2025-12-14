'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const COLORS = {
  bg: 'bg-gray-950',
  text: 'text-gray-100',
  textMuted: 'text-gray-400',
  border: 'border-gray-700',
  input: 'bg-gray-900 border border-gray-700 text-gray-100',
  button: 'bg-amber-600 hover:bg-amber-700 text-white',
  card: 'bg-gray-900 border border-gray-700',
};

export default function AnnouncementsSystem() {
  const { user, isLoaded } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [announcementData, setAnnouncementData] = useState({
    message: '',
    notification_type: 'SYSTEM'
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Fetch from the member endpoint to see all announcements
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/announcements`);

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        setError('Failed to load announcements');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error loading announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchAnnouncements();
    }
  }, [isLoaded, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!announcementData.message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const params = new URLSearchParams({
        message: announcementData.message,
        notification_type: announcementData.notification_type
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/send-notification?${params}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setSuccess('Announcement created successfully');
        setAnnouncementData({ message: '', notification_type: 'SYSTEM' });
        setShowCreate(false);
        await fetchAnnouncements();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create announcement');
      }
    } catch (err) {
      setError('Error creating announcement: ' + err.message);
      console.error(err);
    }
  };

  const stats = {
    total: announcements.length,
    system: announcements.filter(a => a.announcement_type === 'SYSTEM').length,
    reminder: announcements.filter(a => a.announcement_type === 'REMINDER').length,
    fineNotice: announcements.filter(a => a.announcement_type === 'FINE_NOTICE').length
  };

  if (!isLoaded || loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${COLORS.bg} p-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${COLORS.text}`}>Announcements System</h1>
            <p className={`${COLORS.textMuted} mt-1`}>Create and manage system-wide announcements</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className={`${COLORS.button} px-6 py-3 rounded-lg font-semibold transition`}
          >
            {showCreate ? 'Cancel' : '📢 Create Announcement'}
          </button>
        </div>

        {/* Alerts */}
        {error && <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-4 p-4 rounded-lg bg-red-900 border border-red-700 text-red-100`}
        >{error}</motion.div>}
        {success && <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-4 p-4 rounded-lg bg-green-900 border border-green-700 text-green-100`}
        >{success}</motion.div>}

        {/* Create Form */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`${COLORS.card} p-6 rounded-lg mb-8 border`}
          >
            <h2 className={`text-2xl font-bold ${COLORS.text} mb-4`}>Create New Announcement</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className={`block ${COLORS.text} font-semibold mb-2`}>Message</label>
                <textarea
                  value={announcementData.message}
                  onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                  rows="4"
                  placeholder="Enter announcement message (visible to all members and librarians)..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className={`block ${COLORS.text} font-semibold mb-2`}>Announcement Type</label>
                <select
                  value={announcementData.notification_type}
                  onChange={(e) => setAnnouncementData({ ...announcementData, notification_type: e.target.value })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                >
                  <option value="SYSTEM">System Announcement</option>
                  <option value="REMINDER">Reminder</option>
                  <option value="FINE_NOTICE">Fine Notice</option>
                </select>
              </div>

              <button
                type="submit"
                className={`${COLORS.button} px-8 py-3 rounded-lg font-semibold transition`}
              >
                Create Announcement
              </button>
            </form>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Total Notifications</p>
            <p className="text-3xl font-bold text-amber-400">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>System</p>
            <p className="text-3xl font-bold text-blue-400">{stats.system}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Reminders</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.reminder}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Fine Notices</p>
            <p className="text-3xl font-bold text-red-400">{stats.fineNotice}</p>
          </motion.div>
        </div>

        {/* Announcements List */}
        <div className={`${COLORS.card} rounded-lg overflow-hidden border`}>
          {announcements.length === 0 ? (
            <div className="p-12 text-center">
              <p className={`${COLORS.textMuted} text-lg`}>No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {announcements.map((announcement, idx) => {
                const getIcon = (type) => {
                  switch(type) {
                    case 'SYSTEM': return '📣';
                    case 'REMINDER': return '⏰';
                    case 'FINE_NOTICE': return '⚠️';
                    default: return '📢';
                  }
                };

                return (
                  <motion.div
                    key={announcement.announcement_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`${COLORS.bg} border ${COLORS.border} rounded-lg p-4`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{getIcon(announcement.announcement_type)}</span>
                      <div className="flex-1">
                        <div>
                          <p className={`${COLORS.text} font-semibold`}>{announcement.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            announcement.announcement_type === 'SYSTEM' ? 'bg-blue-900 text-blue-100' :
                            announcement.announcement_type === 'REMINDER' ? 'bg-yellow-900 text-yellow-100' :
                            'bg-red-900 text-red-100'
                          }`}>
                            {announcement.announcement_type}
                          </span>
                        </div>
                        <p className={`${COLORS.textMuted} text-xs mt-2`}>
                          {new Date(announcement.created_at).toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-blue-900 border border-blue-700 rounded-lg p-6 mt-8`}
        >
          <p className="text-blue-100">
            <strong>ℹ️ Announcement Types:</strong>
          </p>
          <ul className="text-blue-100 text-sm mt-2 space-y-1 ml-4">
            <li><strong>System Announcement:</strong> General library updates and announcements</li>
            <li><strong>Reminder:</strong> Overdue book reminders and deadline notifications</li>
            <li><strong>Fine Notice:</strong> Fine payment reminders and notices</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
