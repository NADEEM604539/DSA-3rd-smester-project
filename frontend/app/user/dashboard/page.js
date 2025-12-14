'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import Navbar from '@/app/components/Navbar';
import { useProtectedRoute } from '@/lib/use-protected-route';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userRole, loading: roleLoading } = useProtectedRoute(['MEMBER']);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || roleLoading) return;
    if (!user || userRole !== 'MEMBER') {
      if (userRole && userRole !== 'MEMBER') {
        const dashboardMap = {
          'ADMIN': '/admin/dashboard',
          'LIBRARIAN': '/librarian/dashboard',
        };
        router.push(dashboardMap[userRole] || '/');
      } else if (!user) {
        router.push('/');
      }
      return;
    }

    fetchUserStats();
  }, [user, isLoaded, router, userRole, roleLoading]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const email = user?.emailAddresses[0]?.emailAddress;
      
      // Get user ID from backend
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user-by-email/${email}`
      );
      
      if (!userResponse.ok) throw new Error('Failed to fetch user');
      const userData = await userResponse.json();
      const userId = userData.user_id;

      // Fetch user's issues
      const issuesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/my-issues/${userId}`
      );
      const issuesData = await issuesResponse.json();

      // Fetch user's fines
      const finesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/fines/${userId}`
      );
      const finesData = await finesResponse.json();

      setUserStats({
        activeIssues: issuesData.count || 0,
        totalFines: finesData.summary?.total_fines || 0,
        unpaidFines: finesData.summary?.unpaid || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-amber-200 text-lg">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📚</div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-900/10 to-transparent opacity-30"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-2 font-serif text-amber-100">
                Welcome, {user?.firstName || 'Reader'}
              </h1>
              <p className="text-lg text-amber-200 font-serif italic">
                Your Literary Haven Awaits
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
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Active Books Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 border-l-4 border-amber-600 hover:shadow-2xl transition transform hover:-translate-y-1 border-t border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif text-amber-100 font-semibold">Books Borrowed</h3>
              <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                <path fillRule="evenodd" d="M3 7h14v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-5xl font-bold text-amber-200 mb-2">
              {userStats?.activeIssues || 0}
            </p>
            <p className="text-sm text-gray-400 mb-4">Currently Reading</p>
            <Link href="/user/my-issues" className="text-amber-400 hover:text-amber-300 text-sm font-semibold inline-block">
              View Books →
            </Link>
          </div>

          {/* Total Fines Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 border-l-4 border-orange-500 hover:shadow-2xl transition transform hover:-translate-y-1 border-t border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif text-amber-100 font-semibold">Total Fines</h3>
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.16 5.314l4.897-1.596A1 1 0 0114 4.5v10a1 1 0 01-.83.986l-4.898 1.596A1 1 0 018 15.5h-.5a1 1 0 01-1-1v-10a1 1 0 011.16-.986z" />
                <path d="M12.157 5.314l4.897-1.596A1 1 0 0118 4.5v10a1 1 0 01-.83.986l-4.898 1.596A1 1 0 0112 15.5h-.5a1 1 0 01-1-1v-10a1 1 0 011.157-.986z" />
              </svg>
            </div>
            <p className="text-5xl font-bold text-amber-200 mb-2">
              Rs {(userStats?.totalFines || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mb-4">All Books Combined</p>
            <Link href="/user/profile" className="text-orange-400 hover:text-orange-300 text-sm font-semibold inline-block">
              View Details →
            </Link>
          </div>

          {/* Unpaid Fines Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 border-l-4 border-red-500 hover:shadow-2xl transition transform hover:-translate-y-1 border-t border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif text-amber-100 font-semibold">Unpaid Fines</h3>
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.422a6 6 0 018.367 8.368v.001a6 6 0 01-8.367 8.368z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-5xl font-bold text-amber-200 mb-2">
              Rs {(userStats?.unpaidFines || 0).toFixed(2)}
            </p>
            <p className="text-sm text-red-400 font-semibold mb-4">Payment Due</p>
            <Link href="/user/profile" className="text-red-400 hover:text-red-300 text-sm font-semibold inline-block">
              Pay Now →
            </Link>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-lg shadow-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-serif text-amber-100 mb-6 pb-4 border-b border-gray-700 font-semibold">
            Explore the Library
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Books */}
            <Link href="/user/search">
              <div className="group cursor-pointer h-full">
                <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/20 rounded-lg p-6 group-hover:shadow-lg transition transform group-hover:-translate-y-1 h-full border border-amber-800/50 hover:border-amber-600">
                  <svg className="w-12 h-12 text-amber-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="font-serif text-lg text-amber-100 font-semibold">Search</h3>
                  <p className="text-sm text-gray-400 mt-1">Find your next read</p>
                </div>
              </div>
            </Link>

            {/* Browse Books */}
            <Link href="/user/books">
              <div className="group cursor-pointer h-full">
                <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/20 rounded-lg p-6 group-hover:shadow-lg transition transform group-hover:-translate-y-1 h-full border border-amber-800/50 hover:border-amber-600">
                  <svg className="w-12 h-12 text-amber-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                    <path fillRule="evenodd" d="M3 7h14v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-serif text-lg text-amber-100 font-semibold">Browse</h3>
                  <p className="text-sm text-gray-400 mt-1">All library books</p>
                </div>
              </div>
            </Link>

            {/* My Issues */}
            <Link href="/user/my-issues">
              <div className="group cursor-pointer h-full">
                <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/20 rounded-lg p-6 group-hover:shadow-lg transition transform group-hover:-translate-y-1 h-full border border-amber-800/50 hover:border-amber-600">
                  <svg className="w-12 h-12 text-amber-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11.002c0 6.252-4.5 10.997-10 10.997" />
                  </svg>
                  <h3 className="font-serif text-lg text-amber-100 font-semibold">My Issues</h3>
                  <p className="text-sm text-gray-400 mt-1">Books I borrowed</p>
                </div>
              </div>
            </Link>

            {/* Profile */}
            <Link href="/user/profile">
              <div className="group cursor-pointer h-full">
                <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/20 rounded-lg p-6 group-hover:shadow-lg transition transform group-hover:-translate-y-1 h-full border border-amber-800/50 hover:border-amber-600">
                  <svg className="w-12 h-12 text-amber-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-serif text-lg text-amber-100 font-semibold">Profile</h3>
                  <p className="text-sm text-gray-400 mt-1">Your account</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Featured Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-lg p-8 text-amber-50 mb-12 border border-amber-800/30">
          <h2 className="text-2xl font-serif mb-4 font-semibold text-amber-100">📚 Library Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border-l-2 border-amber-600">
              <h3 className="font-serif text-lg font-semibold mb-2 text-amber-100">Advanced Search</h3>
              <p className="text-gray-300">
                Search by title, author, or ISBN. Our smart search uses DSA optimization for lightning-fast results.
              </p>
            </div>
            <div className="p-4 border-l-2 border-amber-600">
              <h3 className="font-serif text-lg font-semibold mb-2 text-amber-100">Track Your Reading</h3>
              <p className="text-gray-300">
                Keep track of borrowed books, due dates, and manage your reading list efficiently.
              </p>
            </div>
            <div className="p-4 border-l-2 border-amber-600">
              <h3 className="font-serif text-lg font-semibold mb-2 text-amber-100">Manage Fines</h3>
              <p className="text-gray-300">
                View all your fines and late fees. Stay informed about payment due dates.
              </p>
            </div>
            <div className="p-4 border-l-2 border-amber-600">
              <h3 className="font-serif text-lg font-semibold mb-2 text-amber-100">Smart Recommendations</h3>
              <p className="text-gray-300">
                Discover books similar to your reading preferences and expand your literary horizons.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-4 border-amber-700">
        <p className="font-serif italic">
          "A library is not a luxury but one of the necessities of life." - Henry Ward Beecher
        </p>
      </footer>
    </div>
  );
}
