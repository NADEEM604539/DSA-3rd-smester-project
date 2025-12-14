'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import LibrarianNavbar from '@/app/components/LibrarianNavbar';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [settings, setSettings] = useState({
    max_books_per_user: 5,
    max_issue_days: 14,
    fine_per_day: 10,
    grace_period_days: 0,
    lost_book_penalty_multiplier: 3,
    max_renewals: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
      return;
    }

    // Fetch settings from backend
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/policies`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({
            max_books_per_user: data.max_books_per_user,
            max_issue_days: data.max_issue_days,
            fine_per_day: data.fine_per_day,
            grace_period_days: data.grace_period_days,
            lost_book_penalty_multiplier: data.lost_book_penalty_multiplier,
            max_renewals: data.max_renewals,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isLoaded, user, router]);

  const handleSave = async () => {
    setMessage({ type: 'info', text: 'Settings are managed by administrators only' });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <LibrarianNavbar />

      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-8 md:px-12 shadow-2xl border-b-2 border-amber-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-100 font-serif">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        {message.text && (
          <div
            className={`border-l-4 p-4 rounded font-serif mb-8 ${
              message.type === 'success'
                ? 'bg-green-900/30 border-green-500 text-green-200'
                : 'bg-red-900/30 border-red-500 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl p-8 border border-amber-800/30">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-8">Library Configuration</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">Max Books Per Member</label>
                <input
                  type="number"
                  value={settings.max_books_per_user}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600 opacity-60 cursor-not-allowed"
                />
                <p className="text-gray-400 text-xs font-serif mt-1">
                  Maximum books a member can borrow at once
                </p>
              </div>

              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Issue Duration (Days)
                </label>
                <input
                  type="number"
                  value={settings.max_issue_days}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600 opacity-60 cursor-not-allowed"
                />
                <p className="text-gray-400 text-xs font-serif mt-1">
                  How many days a member can borrow a book
                </p>
              </div>

              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">Fine per Day (Rs)</label>
                <input
                  type="number"
                  value={settings.fine_per_day}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600 opacity-60 cursor-not-allowed"
                />
                <p className="text-gray-400 text-xs font-serif mt-1">Fine amount per day for overdue books</p>
              </div>

              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">Grace Period (Days)</label>
                <input
                  type="number"
                  value={settings.grace_period_days}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600 opacity-60 cursor-not-allowed"
                />
                <p className="text-gray-400 text-xs font-serif mt-1">Days before fine starts accruing</p>
              </div>

              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">Lost Book Penalty (x)</label>
                <input
                  type="number"
                  value={settings.lost_book_penalty_multiplier}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600 opacity-60 cursor-not-allowed"
                />
                <p className="text-gray-400 text-xs font-serif mt-1">Multiplier of book price for lost books</p>
              </div>

              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">Max Renewals</label>
                <input
                  type="number"
                  value={settings.max_renewals}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600 opacity-60 cursor-not-allowed"
                />
                <p className="text-gray-400 text-xs font-serif mt-1">Maximum times a book can be renewed</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="flex-1 p-4 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-200">
              <p className="font-serif">ℹ️ <strong>Read-Only View:</strong> Library settings are managed by administrators. Contact your admin to modify these settings.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl p-8 border border-amber-800/30">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-red-300 font-serif mb-2">Database Backup</h3>
              <p className="text-gray-300 text-sm font-serif mb-4">Create a backup of all library data</p>
              <button className="bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded font-serif transition">
                📥 Backup Database
              </button>
            </div>
            <div className="pt-4 border-t border-amber-800/20">
              <h3 className="text-lg font-semibold text-red-300 font-serif mb-2">Reset Library</h3>
              <p className="text-gray-300 text-sm font-serif mb-4">Clear all data (cannot be undone)</p>
              <button className="bg-red-900 hover:bg-red-800 text-red-200 font-semibold py-2 px-6 rounded font-serif transition">
                🗑 Reset All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
