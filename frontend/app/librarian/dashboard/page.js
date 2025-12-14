'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LibrarianNavbar from '@/app/components/LibrarianNavbar';
import { useProtectedRoute } from '@/lib/use-protected-route';

export default function LibrarianDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userRole, loading: roleLoading } = useProtectedRoute(['LIBRARIAN']);
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeIssues: 0,
    totalMembers: 0,
    overdueBooks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || roleLoading) return;
    if (!user || userRole !== 'LIBRARIAN') {
      if (userRole && userRole !== 'LIBRARIAN') {
        const dashboardMap = {
          'ADMIN': '/admin/dashboard',
          'MEMBER': '/user/dashboard',
        };
        router.push(dashboardMap[userRole] || '/');
      } else if (!user) {
        router.push('/');
      }
    }
  }, [user, isLoaded, router, userRole, roleLoading]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, issuesRes, membersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/librarian/books`, { signal: AbortSignal.timeout(5000) }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/librarian/issues`, { signal: AbortSignal.timeout(5000) }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/librarian/members`, { signal: AbortSignal.timeout(5000) }),
        ]);

        let totalBooks = 0, activeIssues = 0, totalMembers = 0, overdueBooks = 0;

        if (booksRes.ok) {
          const data = await booksRes.json();
          totalBooks = data.books?.length || 0;
        }

        if (issuesRes.ok) {
          const data = await issuesRes.json();
          const issues = data.issues || [];
          activeIssues = issues.filter(i => i.status === 'approved').length;
          overdueBooks = issues.filter(i => i.status === 'approved' && new Date(i.due_date) < new Date()).length;
        }

        if (membersRes.ok) {
          const data = await membersRes.json();
          totalMembers = data.members?.length || 0;
        }

        setStats({ totalBooks, activeIssues, totalMembers, overdueBooks });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <LibrarianNavbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-amber-900 to-gray-900 text-amber-50 px-6 py-12 md:px-12 shadow-2xl border-b-4 border-amber-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 text-9xl font-bold">📚</div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-100 font-serif mb-2">
            Librarian Dashboard
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">Manage your library efficiently</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Books */}
          <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border-2 border-amber-700 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-amber-600 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-amber-100 font-serif font-bold text-lg">Total Books</h3>
              <span className="text-5xl">📚</span>
            </div>
            <p className="text-5xl font-bold text-amber-400 font-serif mb-2">{stats.totalBooks}</p>
            <p className="text-sm text-amber-200 font-serif">In collection</p>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-amber-500 h-full" style={{width: '75%'}}></div>
            </div>
          </div>

          {/* Active Issues */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-2 border-blue-700 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-blue-600 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-100 font-serif font-bold text-lg">Active Issues</h3>
              <span className="text-5xl">📖</span>
            </div>
            <p className="text-5xl font-bold text-blue-400 font-serif mb-2">{stats.activeIssues}</p>
            <p className="text-sm text-blue-200 font-serif">Currently borrowed</p>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-blue-500 h-full" style={{width: `${Math.min(100, (stats.activeIssues / stats.totalBooks) * 100)}`}}></div>
            </div>
          </div>

          {/* Total Members */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border-2 border-green-700 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-green-600 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-100 font-serif font-bold text-lg">Total Members</h3>
              <span className="text-5xl">👥</span>
            </div>
            <p className="text-5xl font-bold text-green-400 font-serif mb-2">{stats.totalMembers}</p>
            <p className="text-sm text-green-200 font-serif">Registered members</p>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-green-500 h-full" style={{width: '65%'}}></div>
            </div>
          </div>

          {/* Overdue Books */}
          <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 border-2 border-red-700 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-red-600 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-100 font-serif font-bold text-lg">Overdue Books</h3>
              <span className="text-5xl">⚠️</span>
            </div>
            <p className="text-5xl font-bold text-red-400 font-serif mb-2">{stats.overdueBooks}</p>
            <p className="text-sm text-red-200 font-serif">Require attention</p>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-red-500 h-full" style={{width: `${Math.min(100, (stats.overdueBooks / Math.max(1, stats.activeIssues)) * 100)}`}}></div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/librarian/manage-books">
              <button className="w-full bg-gradient-to-br from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-gray-950 font-bold py-5 px-6 rounded-xl transition font-serif shadow-xl hover:shadow-2xl hover:scale-105 duration-200">
                📚 Manage Books
              </button>
            </Link>
            <Link href="/librarian/issues">
              <button className="w-full bg-gradient-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-5 px-6 rounded-xl transition font-serif shadow-xl hover:shadow-2xl hover:scale-105 duration-200">
                📖 Issue Management
              </button>
            </Link>
            <Link href="/librarian/members">
              <button className="w-full bg-gradient-to-br from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-5 px-6 rounded-xl transition font-serif shadow-xl hover:shadow-2xl hover:scale-105 duration-200">
                👥 Member Management
              </button>
            </Link>
            <Link href="/librarian/returns">
              <button className="w-full bg-gradient-to-br from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-bold py-5 px-6 rounded-xl transition font-serif shadow-xl hover:shadow-2xl hover:scale-105 duration-200">
                ↩️ Returns & Fines
              </button>
            </Link>
          </div>
        </div>

        {/* Secondary Actions */}
        <div>
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Additional Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/librarian/reports">
              <button className="w-full bg-gradient-to-br from-pink-900/40 to-pink-900/20 hover:from-pink-900/60 hover:to-pink-900/40 border-2 border-pink-700 text-pink-200 font-bold py-4 px-6 rounded-xl transition font-serif shadow-lg hover:shadow-xl">
                📊 Reports & Analytics
              </button>
            </Link>
            <Link href="/librarian/inventory">
              <button className="w-full bg-gradient-to-br from-cyan-900/40 to-cyan-900/20 hover:from-cyan-900/60 hover:to-cyan-900/40 border-2 border-cyan-700 text-cyan-200 font-bold py-4 px-6 rounded-xl transition font-serif shadow-lg hover:shadow-xl">
                📦 Inventory Check
              </button>
            </Link>
            <Link href="/librarian/settings">
              <button className="w-full bg-gradient-to-br from-indigo-900/40 to-indigo-900/20 hover:from-indigo-900/60 hover:to-indigo-900/40 border-2 border-indigo-700 text-indigo-200 font-bold py-4 px-6 rounded-xl transition font-serif shadow-lg hover:shadow-xl">
                ⚙️ Settings
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
