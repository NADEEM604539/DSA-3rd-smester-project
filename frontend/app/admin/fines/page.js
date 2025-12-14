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
  buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700',
  card: 'bg-gray-900 border border-gray-700',
};

export default function FinesManagement() {
  const { getToken } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PAID, UNPAID
  const [sortBy, setSortBy] = useState('recent'); // recent, amount-high, amount-low

  const fetchFines = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      // Use ADMIN endpoint to get ALL system fines
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/fines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Admin endpoint returns all fines across all members
        const allFines = data.fines || [];
        setFines(allFines);
        setError('');
      } else {
        setError('Failed to fetch fines from admin endpoint');
      }
    } catch (err) {
      setError('Failed to fetch fines: ' + err.message);
      console.error(err);
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleMarkAsPaid = async (fineId) => {
    try {
      const token = await getToken();
      const response = await fetch(``${process.env.NEXT_PUBLIC_API_URL}/member/fines/${fineId}/mark-paid`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Fine marked as paid');
        fetchFines();
      }
    } catch (err) {
      setError('Failed to mark fine as paid');
    }
  };

  const filteredFines = fines.filter(f => {
    if (filter === 'PAID') return f.is_paid;
    if (filter === 'UNPAID') return !f.is_paid;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'amount-high') return b.fine_amount - a.fine_amount;
    if (sortBy === 'amount-low') return a.fine_amount - b.fine_amount;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const stats = {
    total: fines.reduce((sum, f) => sum + f.fine_amount, 0),
    paid: fines.filter(f => f.is_paid).reduce((sum, f) => sum + f.fine_amount, 0),
    unpaid: fines.filter(f => !f.is_paid).reduce((sum, f) => sum + f.fine_amount, 0),
    count: fines.length,
    paidCount: fines.filter(f => f.is_paid).length,
    unpaidCount: fines.filter(f => !f.is_paid).length
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading fines...</div>
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
        <h1 className={`text-4xl font-bold ${COLORS.text} mb-2`}>Fines Management</h1>
        <p className={`${COLORS.textMuted} mb-8`}>View and manage all library fines</p>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-4 rounded-lg bg-red-900 border border-red-700 text-red-100`}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-4 rounded-lg bg-green-900 border border-green-700 text-green-100`}
          >
            {success}
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Total Fines</p>
            <p className="text-3xl font-bold text-amber-400">Rs{stats.total.toFixed(2)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Paid</p>
            <p className="text-3xl font-bold text-green-400">Rs{stats.paid.toFixed(2)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Unpaid</p>
            <p className="text-3xl font-bold text-red-400">Rs{stats.unpaid.toFixed(2)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Total Count</p>
            <p className="text-3xl font-bold text-blue-400">{stats.count}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Unpaid Count</p>
            <p className="text-3xl font-bold text-orange-400">{stats.unpaidCount}</p>
          </motion.div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'ALL' ? `${COLORS.button}` : COLORS.buttonSecondary
              }`}
            >
              All Fines
            </button>
            <button
              onClick={() => setFilter('PAID')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'PAID' ? 'bg-green-600 text-white' : COLORS.buttonSecondary
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('UNPAID')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'UNPAID' ? 'bg-red-600 text-white' : COLORS.buttonSecondary
              }`}
            >
              Unpaid
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`${COLORS.input} px-4 py-2 rounded-lg`}
          >
            <option value="recent">Recent First</option>
            <option value="amount-high">Amount (High to Low)</option>
            <option value="amount-low">Amount (Low to High)</option>
          </select>
        </div>

        {/* Fines Table */}
        <div className={`${COLORS.card} rounded-lg overflow-hidden border`}>
          {filteredFines.length === 0 ? (
            <div className="p-12 text-center">
              <p className={`${COLORS.textMuted} text-lg`}>No fines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${COLORS.bg}`}>
                  <tr className={`border-b ${COLORS.border}`}>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Member ID</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Amount</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Fine Type</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Status</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Due Date</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFines.map((fine, idx) => (
                    <motion.tr
                      key={fine.fine_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-b ${COLORS.border} hover:${COLORS.bg} transition`}
                    >
                      <td className={`px-6 py-4 ${COLORS.text}`}>#{fine.user_id}</td>
                      <td className={`px-6 py-4 font-bold text-amber-400`}>Rs{fine.fine_amount.toFixed(2)}</td>
                      <td className={`px-6 py-4 ${COLORS.textMuted}`}>{fine.fine_type || 'LATE_RETURN'}</td>
                      <td className={`px-6 py-4`}>
                        <span className={`${fine.is_paid ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} px-3 py-1 rounded-full text-sm`}>
                          {fine.is_paid ? 'PAID' : 'UNPAID'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${COLORS.textMuted}`}>
                        {new Date(fine.due_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className={`px-6 py-4`}>
                        {!fine.is_paid && (
                          <button
                            onClick={() => handleMarkAsPaid(fine.fine_id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Collection Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${COLORS.card} p-6 rounded-lg border mt-8`}
        >
          <h2 className={`text-2xl font-bold ${COLORS.text} mb-4`}>Collection Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className={COLORS.textMuted}>Collection Rate</p>
              <p className="text-4xl font-bold text-green-400">
                {stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className={COLORS.textMuted}>Overdue Fines</p>
              <p className="text-4xl font-bold text-red-400">
                {fines.filter(f => !f.is_paid && new Date(f.due_date) < new Date()).length}
              </p>
            </div>
            <div>
              <p className={COLORS.textMuted}>Average Fine Amount</p>
              <p className="text-4xl font-bold text-blue-400">
                Rs{stats.count > 0 ? (stats.total / stats.count).toFixed(2) : 0}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
