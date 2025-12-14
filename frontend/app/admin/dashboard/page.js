'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/app/components/Navbar';
import { useProtectedRoute } from '@/lib/use-protected-route';

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userRole, loading: roleLoading } = useProtectedRoute(['ADMIN']);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || roleLoading) return;
    if (!user || userRole !== 'ADMIN') {
      if (userRole && userRole !== 'ADMIN') {
        const dashboardMap = {
          'LIBRARIAN': '/librarian/dashboard',
          'MEMBER': '/user/dashboard',
        };
        router.push(dashboardMap[userRole] || '/');
      } else if (!user) {
        router.push('/');
      }
      return;
    }
    fetchDashboardData();
  }, [user, isLoaded, router, userRole, roleLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get admin stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/stats`
      );
      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Get recent activities
      const activitiesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/activities`
      );
      if (!activitiesResponse.ok) throw new Error('Failed to fetch activities');
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData.activities || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950">
    
        <div className="flex items-center justify-center py-20">
          <div className="text-amber-200 text-lg font-serif">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">⚙️</div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Admin Dashboard
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Manage library operations, librarians, and view system statistics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Books */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-blue-800/30 hover:border-blue-600/50 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm uppercase font-serif">Total Books</p>
                <span className="text-3xl">📚</span>
              </div>
              <p className="text-4xl font-bold text-blue-300">{stats.total_books || 0}</p>
              <p className="text-xs text-gray-400 mt-2">Across all categories</p>
            </motion.div>

            {/* Active Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-green-800/30 hover:border-green-600/50 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm uppercase font-serif">Active Members</p>
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-4xl font-bold text-green-300">{stats.total_members || 0}</p>
              <p className="text-xs text-gray-400 mt-2">Registered users</p>
            </motion.div>

            {/* Active Issues */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-purple-800/30 hover:border-purple-600/50 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm uppercase font-serif">Active Issues</p>
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-4xl font-bold text-purple-300">{stats.active_issues || 0}</p>
              <p className="text-xs text-gray-400 mt-2">Books in circulation</p>
            </motion.div>

            {/* Unpaid Fines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-red-800/30 hover:border-red-600/50 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm uppercase font-serif">Unpaid Fines</p>
                <span className="text-3xl">💰</span>
              </div>
              <p className="text-4xl font-bold text-red-300">${stats.unpaid_fines_amount || 0}</p>
              <p className="text-xs text-gray-400 mt-2">{stats.unpaid_fines_count || 0} records</p>
            </motion.div>
          </div>
        )}

        {/* Overdue Alert */}
        {stats && stats.overdue_books > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border-l-4 border-red-500 p-6 rounded-lg mb-12 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-red-300 font-serif mb-2">
                  ⚠️ Overdue Books Alert
                </h3>
                <p className="text-red-200 font-serif">
                  {stats.overdue_books} book(s) are overdue. Take action to collect them.
                </p>
              </div>
              <Link
                href="/admin/issues?filter=overdue"
                className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition font-serif font-semibold"
              >
                View Overdue
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: '📚', label: 'Add Book', href: '/admin/books' },
              { icon: '📖', label: 'All Books', href: '/admin/books' },
              { icon: '👥', label: 'Librarians', href: '/admin/librarians' },
              { icon: '💳', label: 'All Fines', href: '/admin/fines' },
              { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
            ].map((action, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-amber-800/30 hover:border-amber-600/50 transition group"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition">{action.icon}</span>
                  <span className="text-xs text-amber-200 text-center font-serif font-semibold">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Recent Activities</h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 10).map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 hover:border-amber-600/30 transition flex items-start gap-4"
                >
                  <div className="text-2xl pt-1">
                    {activity.action.includes('issue') ? '📤' :
                     activity.action.includes('return') ? '📥' :
                     activity.action.includes('fine') ? '💰' :
                     activity.action.includes('librarian') ? '👨‍💼' : '📚'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-amber-200 font-serif font-semibold capitalize">
                        {activity.action.replace(/_/g, ' ')}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-serif">
                      {activity.description || 'System activity recorded'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-serif">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}