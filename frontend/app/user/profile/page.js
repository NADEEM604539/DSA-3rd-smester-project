'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import Navbar from '@/app/components/Navbar';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
      return;
    }

    fetchUserProfile();
  }, [user, isLoaded, router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const email = user?.emailAddresses[0]?.emailAddress;
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user-by-email/${email}`
      );

      if (!userResponse.ok) throw new Error('Failed to fetch user');
      const userData = await userResponse.json();
      const id = userData.user_id;
      setUserId(id);

      // Fetch user's issues
      const issuesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/my-issues/${id}`
      );
      const issuesData = await issuesResponse.json();

      // Fetch user's fines
      const finesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/fines/${id}`
      );
      const finesData = await finesResponse.json();

      // Fetch notifications
      const notifResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/notifications/${id}`
      );
      const notifData = await notifResponse.json();

      setUserStats({
        activeIssues: issuesData.count || 0,
        totalFines: finesData.summary?.total_fines || 0,
        unpaidFines: finesData.summary?.unpaid || 0,
      });

      setNotifications(notifData.notifications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">👤</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/user/dashboard" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block transition">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
                My Profile
              </h1>
              <p className="text-lg text-amber-200 font-serif italic">
                Manage your account and library settings
              </p>
            </div>
            <div className="text-amber-200 hover:text-amber-100 transition">
              <SignOutButton redirectUrl="/" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 border border-amber-800/30">
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">👤</div>
                <h2 className="text-2xl font-serif font-bold text-amber-100 mb-1">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-amber-300 font-serif italic">Member</p>
              </div>

              {/* User Details */}
              <div className="space-y-4 bg-gray-850 p-4 rounded-lg border border-gray-700 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-serif mb-1">Email</p>
                  <p className="text-amber-100 font-serif text-sm break-all">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-serif mb-1">Member ID</p>
                  <p className="text-amber-100 font-mono text-sm">{userId || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-serif mb-1">Account Status</p>
                  <p className="text-green-400 font-serif font-semibold">✅ Active</p>
                </div>
              </div>

              <Link href="/user/dashboard">
                <button className="w-full py-2 px-4 bg-amber-700 hover:bg-amber-600 text-gray-950 font-semibold rounded-lg transition font-serif">
                  Return to Dashboard
                </button>
              </Link>
            </div>
          </div>

          {/* Library Statistics */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Books Borrowed */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-amber-800/30">
                <p className="text-gray-500 text-sm uppercase font-serif mb-2">Books Borrowed</p>
                <p className="text-5xl font-bold text-amber-200 mb-2">
                  {userStats?.activeIssues || 0}
                </p>
                <p className="text-xs text-gray-400 font-serif">Currently in your collection</p>
              </div>

              {/* Total Fines */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-amber-800/30">
                <p className="text-gray-500 text-sm uppercase font-serif mb-2">Total Fines</p>
                <p className="text-5xl font-bold text-orange-400 mb-2">
                  Rs {(userStats?.totalFines || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 font-serif">All time accumulation</p>
              </div>

              {/* Unpaid Fines */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-red-800/30">
                <p className="text-gray-500 text-sm uppercase font-serif mb-2">Unpaid Fines</p>
                <p className="text-5xl font-bold text-red-400 mb-2">
                  Rs {(userStats?.unpaidFines || 0).toFixed(2)}
                </p>
                <Link href="#fines" className="text-red-400 hover:text-red-300 text-xs font-semibold">
                  View Details →
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-amber-900/30 to-gray-800 rounded-lg shadow-lg p-6 border border-amber-800/30">
                <p className="text-gray-500 text-sm uppercase font-serif mb-3">Quick Actions</p>
                <div className="space-y-2">
                  <Link href="/user/my-issues">
                    <button className="w-full text-left text-amber-300 hover:text-amber-200 text-sm font-semibold transition">
                      📖 My Issues →
                    </button>
                  </Link>
                  <Link href="/user/books">
                    <button className="w-full text-left text-amber-300 hover:text-amber-200 text-sm font-semibold transition">
                      📚 Browse Books →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fine Payment Section */}
        {(userStats?.unpaidFines || 0) > 0 && (
          <div id="fines" className="mb-12">
            <h2 className="text-2xl font-serif text-amber-100 mb-6 font-semibold">
              💳 Payment Due
            </h2>
            <div className="bg-gradient-to-br from-red-900/20 to-gray-800 rounded-lg shadow-lg p-8 border border-red-800/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-400 text-sm uppercase font-serif mb-2">Amount Due</p>
                  <p className="text-6xl font-bold text-red-400 mb-4">
                    ${(userStats?.unpaidFines || 0).toFixed(2)}
                  </p>
                  <p className="text-gray-300 font-serif mb-6">
                    Please pay your outstanding fines to continue borrowing books.
                  </p>
                  <button className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition font-serif">
                    Pay Now
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-amber-100 font-serif font-bold mb-4">Payment Information</h3>
                  <p className="text-sm text-gray-300 font-serif mb-4">
                    You have unpaid fines from overdue books. Please settle these charges to continue accessing library services.
                  </p>
                  <div className="bg-gray-800 rounded p-4 mb-4">
                    <p className="text-xs text-gray-500 uppercase font-serif mb-2">Status</p>
                    <p className="text-red-400 font-serif font-bold">⚠️ Payment Required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif text-amber-100 mb-6 font-semibold">
              🔔 Notifications
            </h2>
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-amber-800/30"
                >
                  <div className="flex gap-4">
                    <span className="text-2xl">📬</span>
                    <div className="flex-1">
                      <p className="text-amber-100 font-serif font-semibold">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Settings Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif text-amber-100 mb-6 font-semibold">
            ⚙️ Account Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-600 transition cursor-pointer">
              <p className="text-xl font-serif font-bold text-amber-100 mb-2">🔐 Security</p>
              <p className="text-sm text-gray-400 font-serif mb-4">
                Manage passwords and security settings
              </p>
              <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold font-serif">
                Configure →
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-600 transition cursor-pointer">
              <p className="text-xl font-serif font-bold text-amber-100 mb-2">🔔 Preferences</p>
              <p className="text-sm text-gray-400 font-serif mb-4">
                Update notification and email settings
              </p>
              <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold font-serif">
                Update →
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-600 transition cursor-pointer">
              <p className="text-xl font-serif font-bold text-amber-100 mb-2">📋 History</p>
              <p className="text-sm text-gray-400 font-serif mb-4">
                View your borrowing and payment history
              </p>
              <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold font-serif">
                View →
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-600 transition cursor-pointer">
              <p className="text-xl font-serif font-bold text-amber-100 mb-2">🆘 Support</p>
              <p className="text-sm text-gray-400 font-serif mb-4">
                Contact library support or report issues
              </p>
              <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold font-serif">
                Contact →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800">
        <p className="font-serif italic text-sm">
          📚 Your library membership is active. Enjoy unlimited access to our collection!
        </p>
      </footer>
    </div>
  );
}
