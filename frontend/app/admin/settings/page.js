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

export default function SystemSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    max_books_per_user: 3,
    max_issue_days: 14,
    fine_per_day: 10.0,
    grace_period_days: 0,
    lost_book_penalty_multiplier: 2.0,
    max_renewals: 1
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/policies`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure all values are properly set
      setFormData({
        max_books_per_user: parseInt(data.max_books_per_user) || 3,
        max_issue_days: parseInt(data.max_issue_days) || 14,
        fine_per_day: parseFloat(data.fine_per_day) || 10.0,
        grace_period_days: parseInt(data.grace_period_days) || 0,
        lost_book_penalty_multiplier: parseFloat(data.lost_book_penalty_multiplier) || 2.0,
        max_renewals: parseInt(data.max_renewals) || 1
      });
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/policies`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Settings updated successfully');
        fetchSettings();
      } else {
        setError('Failed to update settings');
      }
    } catch (err) {
      setError('Error saving settings');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${COLORS.bg} p-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <h1 className={`text-4xl font-bold ${COLORS.text} mb-2`}>System Settings</h1>
        <p className={`${COLORS.textMuted} mb-8`}>Configure library policies and parameters</p>

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

        {/* Settings Form */}
        <form onSubmit={handleSave}>
          {/* Borrowing Settings */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${COLORS.card} rounded-lg border p-8 mb-6`}
          >
            <h2 className={`text-2xl font-bold ${COLORS.text} mb-6`}>Borrowing Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block ${COLORS.text} font-semibold mb-2`}>
                  Max Books Per User
                </label>
                <input
                  type="number"
                  value={isNaN(formData.max_books_per_user) ? '' : formData.max_books_per_user}
                  onChange={(e) => setFormData({ ...formData, max_books_per_user: parseInt(e.target.value) || 0 })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                  min="1"
                  max="20"
                />
                <p className={`${COLORS.textMuted} text-sm mt-1`}>Maximum books a member can borrow at once</p>
              </div>

              <div>
                <label className={`block ${COLORS.text} font-semibold mb-2`}>
                  Max Issue Days
                </label>
                <input
                  type="number"
                  value={isNaN(formData.max_issue_days) ? '' : formData.max_issue_days}
                  onChange={(e) => setFormData({ ...formData, max_issue_days: parseInt(e.target.value) || 0 })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                  min="1"
                  max="60"
                />
                <p className={`${COLORS.textMuted} text-sm mt-1`}>Number of days a book can be borrowed</p>
              </div>

              <div>
                <label className={`block ${COLORS.text} font-semibold mb-2`}>
                  Max Renewals
                </label>
                <input
                  type="number"
                  value={isNaN(formData.max_renewals) ? '' : formData.max_renewals}
                  onChange={(e) => setFormData({ ...formData, max_renewals: parseInt(e.target.value) || 0 })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                  min="0"
                  max="10"
                />
                <p className={`${COLORS.textMuted} text-sm mt-1`}>Times a book can be renewed by a member</p>
              </div>

              <div>
                <label className={`block ${COLORS.text} font-semibold mb-2`}>
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  value={isNaN(formData.grace_period_days) ? '' : formData.grace_period_days}
                  onChange={(e) => setFormData({ ...formData, grace_period_days: parseInt(e.target.value) || 0 })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                  min="0"
                  max="14"
                />
                <p className={`${COLORS.textMuted} text-sm mt-1`}>Days before fine is charged for late return</p>
              </div>
            </div>
          </motion.div>

          {/* Fine Settings */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`${COLORS.card} rounded-lg border p-8 mb-6`}
          >
            <h2 className={`text-2xl font-bold ${COLORS.text} mb-6`}>Fine & Penalty Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block ${COLORS.text} font-semibold mb-2`}>
                  Fine Per Day (Rs)
                </label>
                <input
                  type="number"
                  value={isNaN(formData.fine_per_day) ? '' : formData.fine_per_day}
                  onChange={(e) => setFormData({ ...formData, fine_per_day: parseFloat(e.target.value) || 0 })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                  min="0"
                  step="0.5"
                />
                <p className={`${COLORS.textMuted} text-sm mt-1`}>Fine amount charged per day of late return</p>
              </div>

              <div>
                <label className={`block ${COLORS.text} font-semibold mb-2`}>
                  Lost Book Penalty Multiplier
                </label>
                <input
                  type="number"
                  value={isNaN(formData.lost_book_penalty_multiplier) ? '' : formData.lost_book_penalty_multiplier}
                  onChange={(e) => setFormData({ ...formData, lost_book_penalty_multiplier: parseFloat(e.target.value) || 0 })}
                  className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
                  min="1"
                  step="0.1"
                />
                <p className={`${COLORS.textMuted} text-sm mt-1`}>Multiplier of book cost for lost items</p>
              </div>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`bg-blue-900 border border-blue-700 rounded-lg p-6 mb-6`}
          >
            <p className="text-blue-100">
              <strong>ℹ️ Note:</strong> Changes to these settings will apply to all future book issuances and fines. Existing fines and issues will not be affected retroactively.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className={`${COLORS.button} px-8 py-3 rounded-lg font-semibold transition`}
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={fetchSettings}
              className={`bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 px-8 py-3 rounded-lg font-semibold transition`}
            >
              Reset to Saved
            </button>
          </div>
        </form>

        {/* Current Configuration Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`${COLORS.card} rounded-lg border p-8 mt-8`}
        >
          <h2 className={`text-2xl font-bold ${COLORS.text} mb-6`}>Current Configuration</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className={COLORS.textMuted}>Max Books/User</p>
              <p className="text-2xl font-bold text-amber-400">{formData.max_books_per_user}</p>
            </div>
            <div>
              <p className={COLORS.textMuted}>Issue Period</p>
              <p className="text-2xl font-bold text-blue-400">{formData.max_issue_days} days</p>
            </div>
            <div>
              <p className={COLORS.textMuted}>Daily Fine</p>
              <p className="text-2xl font-bold text-red-400">Rs{formData.fine_per_day}/day</p>
            </div>
            <div>
              <p className={COLORS.textMuted}>Grace Period</p>
              <p className="text-2xl font-bold text-green-400">{formData.grace_period_days} days</p>
            </div>
            <div>
              <p className={COLORS.textMuted}>Lost Book Penalty</p>
              <p className="text-2xl font-bold text-yellow-400">{formData.lost_book_penalty_multiplier}x</p>
            </div>
            <div>
              <p className={COLORS.textMuted}>Max Renewals</p>
              <p className="text-2xl font-bold text-purple-400">{formData.max_renewals}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
