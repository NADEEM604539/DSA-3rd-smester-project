'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, SYSTEM, REMINDER, FINE_NOTICE

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
      return;
    }

    fetchNotifications();
  }, [user, isLoaded, router]);

  const fetchNotifications = async () => {
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

      const notifResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/notifications/${id}`
      );

      if (!notifResponse.ok) throw new Error('Failed to fetch notifications');
      const notifData = await notifResponse.json();
      setNotifications(notifData.notifications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'ALL') {
      return notifications;
    }
    return notifications.filter(n => n.type === filter);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'SYSTEM': '📢',
      'REMINDER': '⏰',
      'FINE_NOTICE': '⚠️',
    };
    return icons[type] || '📬';
  };

  const getTypeColor = (type) => {
    const colors = {
      'SYSTEM': 'border-l-blue-600 from-blue-900/30',
      'REMINDER': 'border-l-yellow-600 from-yellow-900/30',
      'FINE_NOTICE': 'border-l-red-600 from-red-900/30',
    };
    return colors[type] || 'border-l-gray-600 from-gray-800';
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-amber-200 text-lg font-serif">Loading notifications...</div>
        </div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📬</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Announcements
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Messages from the library administration ({notifications.length} total)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded font-semibold text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { value: 'ALL', label: 'All', icon: '📭', count: notifications.length },
            { value: 'SYSTEM', label: 'System', icon: '📢', count: notifications.filter(n => n.type === 'SYSTEM').length },
            { value: 'REMINDER', label: 'Reminders', icon: '⏰', count: notifications.filter(n => n.type === 'REMINDER').length },
            { value: 'FINE_NOTICE', label: 'Fines', icon: '⚠️', count: notifications.filter(n => n.type === 'FINE_NOTICE').length },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`py-2 px-4 rounded-lg font-serif font-semibold transition border-2 ${
                filter === option.value
                  ? 'bg-amber-700 border-amber-600 text-gray-950'
                  : 'bg-gray-800 border-gray-700 text-amber-200 hover:border-amber-600'
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.notification_id}
                className={`rounded-lg shadow-lg p-6 border-l-4 transition bg-gradient-to-br to-gray-800 ${getTypeColor(notif.type)}`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-serif font-bold text-amber-100">
                        {notif.message}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-black/30 text-amber-100 text-xs font-bold rounded-full font-serif">
                        {notif.type}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="text-sm text-gray-300 font-serif">
                      {new Date(notif.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-12 text-center border border-amber-800/20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-amber-100 text-lg font-serif mb-3">
              No announcements
            </p>
            <p className="text-gray-400 font-serif">
              Check back later for updates from the library administration.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800 mt-12">
        <p className="font-serif italic text-sm">
          📬 Stay informed about library announcements
        </p>
      </footer>
    </div>
  );
}
