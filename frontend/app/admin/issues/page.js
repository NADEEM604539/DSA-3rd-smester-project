'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
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

export default function IssuesManagement() {
  const { getToken } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, RETURNED
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [renewDays, setRenewDays] = useState(7);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Use ADMIN endpoint to get ALL system issues, not member-specific
      // For now, we'll create a proper admin issues endpoint or use a generic fetch
      // This should fetch from admin dashboard or a dedicated admin issues endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/issues', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {
        // Fallback if endpoint doesn't exist yet
        return null;
      });

      if (response?.ok) {
        const data = await response.json();
        setIssues(Array.isArray(data) ? data : data.issues || []);
      } else {
        setError('Admin issues endpoint not yet available - pending backend implementation');
        setIssues([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleExtendDeadline = async (issueId) => {
    try {
      const token = await getToken();
      const response = await fetch(``${process.env.NEXT_PUBLIC_API_URL}/member/issues/${issueId}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ additional_days: renewDays })
      });

      if (response.ok) {
        setSuccess('Deadline extended successfully');
        fetchIssues();
        setSelectedIssue(null);
      } else {
        setError('Failed to extend deadline');
      }
    } catch (err) {
      setError('Error extending deadline');
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'ALL') return true;
    return issue.status === filter;
  });

  const stats = {
    total: issues.length,
    active: issues.filter(i => i.status === 'APPROVED' || i.status === 'PENDING').length,
    overdue: issues.filter(i => !i.returned_at && new Date(i.due_date) < new Date()).length,
    returned: issues.filter(i => i.status === 'RETURNED').length
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading issues...</div>
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
        <h1 className={`text-4xl font-bold ${COLORS.text} mb-2`}>Issues Management</h1>
        <p className={`${COLORS.textMuted} mb-8`}>View and manage all book issues</p>

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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Total Issues</p>
            <p className="text-3xl font-bold text-amber-400">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Active</p>
            <p className="text-3xl font-bold text-blue-400">{stats.active}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Overdue</p>
            <p className="text-3xl font-bold text-red-400">{stats.overdue}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Returned</p>
            <p className="text-3xl font-bold text-green-400">{stats.returned}</p>
          </motion.div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['ALL', 'PENDING', 'APPROVED', 'RETURNED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === status ? `${COLORS.button}` : 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Issues Table */}
        <div className={`${COLORS.card} rounded-lg overflow-hidden border`}>
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center">
              <p className={`${COLORS.textMuted} text-lg`}>No issues found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${COLORS.bg}`}>
                  <tr className={`border-b ${COLORS.border}`}>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Issue ID</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Member</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Book</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Issued Date</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Due Date</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue, idx) => {
                    const isOverdue = !issue.returned_at && new Date(issue.due_date) < new Date();
                    return (
                      <motion.tr
                        key={issue.issue_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`border-b ${COLORS.border} hover:${COLORS.bg} transition ${
                          isOverdue ? 'bg-red-900 bg-opacity-20' : ''
                        }`}
                      >
                        <td className={`px-6 py-4 ${COLORS.text}`}>#{issue.issue_id}</td>
                        <td className={`px-6 py-4 ${COLORS.textMuted}`}>#{issue.user_id}</td>
                        <td className={`px-6 py-4 ${COLORS.text}`}>{issue.book?.title || 'Unknown'}</td>
                        <td className={`px-6 py-4 ${COLORS.textMuted}`}>
                          {new Date(issue.issued_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className={`px-6 py-4 ${isOverdue ? 'text-red-400 font-bold' : COLORS.textMuted}`}>
                          {new Date(issue.due_date).toLocaleDateString('en-IN')}
                          {isOverdue && <span className="text-red-400 ml-2">(Overdue)</span>}
                        </td>
                        <td className={`px-6 py-4`}>
                          <span className={`${
                            issue.status === 'RETURNED' ? 'bg-green-900 text-green-100' :
                            isOverdue ? 'bg-red-900 text-red-100' :
                            'bg-blue-900 text-blue-100'
                          } px-3 py-1 rounded-full text-sm`}>
                            {issue.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Extend Deadline Modal */}
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`${COLORS.card} rounded-lg border p-6 max-w-md w-full`}
            >
              <h2 className={`text-2xl font-bold ${COLORS.text} mb-4`}>Extend Deadline</h2>
              <p className={COLORS.textMuted}>Current Due Date: {new Date(selectedIssue.due_date).toLocaleDateString('en-IN')}</p>
              
              <div className="my-6">
                <label className={`block ${COLORS.text} font-semibold mb-2`}>Extend By (Days)</label>
                <input
                  type="number"
                  value={renewDays}
                  onChange={(e) => setRenewDays(parseInt(e.target.value))}
                  className={`w-full ${COLORS.input} px-4 py-2 rounded-lg`}
                  min="1"
                  max="30"
                />
              </div>

              <p className={`${COLORS.textMuted} text-sm mb-6`}>
                New Due Date: {new Date(new Date(selectedIssue.due_date).getTime() + renewDays * 86400000).toLocaleDateString('en-IN')}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExtendDeadline(selectedIssue.issue_id)}
                  className={`${COLORS.button} flex-1 px-4 py-2 rounded-lg font-semibold`}
                >
                  Extend
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
