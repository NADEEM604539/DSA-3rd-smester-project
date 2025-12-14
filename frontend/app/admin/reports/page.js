'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const COLORS = {
  bg: 'bg-gray-950',
  text: 'text-gray-100',
  textMuted: 'text-gray-400',
  border: 'border-gray-700',
  card: 'bg-gray-900 border border-gray-700',
};

export default function ReportsAnalytics() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setStats(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading reports...</div>
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
            <h1 className={`text-4xl font-bold ${COLORS.text}`}>Reports & Analytics</h1>
            <p className={`${COLORS.textMuted} mt-1`}>Comprehensive library system analysis</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`${COLORS.card} px-4 py-2 rounded-lg border`}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${COLORS.card} rounded-lg border p-8 mb-8`}
        >
          <h2 className={`text-2xl font-bold ${COLORS.text} mb-6`}>Library Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className={COLORS.textMuted}>Total Books</p>
              <p className="text-4xl font-bold text-amber-400">{stats?.total_books || 0}</p>
            </div>
            <div className="text-center">
              <p className={COLORS.textMuted}>Total Members</p>
              <p className="text-4xl font-bold text-blue-400">{stats?.total_members || 0}</p>
            </div>
            <div className="text-center">
              <p className={COLORS.textMuted}>Active Issues</p>
              <p className="text-4xl font-bold text-green-400">{stats?.active_issues || 0}</p>
            </div>
            <div className="text-center">
              <p className={COLORS.textMuted}>Overdue Books</p>
              <p className="text-4xl font-bold text-red-400">{stats?.overdue_books || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${COLORS.card} rounded-lg border p-8 mb-8`}
        >
          <h2 className={`text-2xl font-bold ${COLORS.text} mb-6`}>Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${COLORS.bg} rounded-lg p-6 border`}>
              <p className={COLORS.textMuted}>Book Circulation Rate</p>
              <p className="text-4xl font-bold text-blue-400">
                {stats?.total_books > 0 ? ((stats?.active_issues / stats?.total_books) * 100).toFixed(1) : 0}%
              </p>
              <p className={`${COLORS.textMuted} mt-2`}>Books currently issued</p>
            </div>
            <div className={`${COLORS.bg} rounded-lg p-6 border`}>
              <p className={COLORS.textMuted}>Member Engagement</p>
              <p className="text-4xl font-bold text-purple-400">
                {stats?.total_members > 0 ? ((stats?.active_issues / stats?.total_members) * 100).toFixed(1) : 0}%
              </p>
              <p className={`${COLORS.textMuted} mt-2`}>Active borrowing members</p>
            </div>
            <div className={`${COLORS.bg} rounded-lg p-6 border`}>
              <p className={COLORS.textMuted}>On-Time Return Rate</p>
              <p className="text-4xl font-bold text-green-400">---%</p>
              <p className={`${COLORS.textMuted} mt-2`}>Books returned by deadline</p>
            </div>
          </div>
        </motion.div>

        {/* Issues & Problems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${COLORS.card} rounded-lg border p-8`}
        >
          <h2 className={`text-2xl font-bold ${COLORS.text} mb-6`}>Critical Issues</h2>
          <div className="space-y-4">
            {stats?.overdue_books > 0 && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
                <p className="font-semibold">⚠️ {stats?.overdue_books} Overdue Books</p>
                <p className="text-sm mt-1">Immediate action required to recover books past their due date</p>
              </div>
            )}
            {stats?.unpaid_fines_count > 0 && (
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 text-yellow-100">
                <p className="font-semibold">⚠️ {stats?.unpaid_fines_count} Unpaid Fines</p>
                <p className="text-sm mt-1">Total outstanding amount: Rs{stats?.unpaid_fines_amount?.toFixed(2)}</p>
              </div>
            )}
            {!stats?.overdue_books && !stats?.unpaid_fines_count && (
              <div className="bg-green-900 border border-green-700 rounded-lg p-4 text-green-100">
                <p className="font-semibold">✅ No Critical Issues</p>
                <p className="text-sm mt-1">All books are on track and fines are being managed</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
