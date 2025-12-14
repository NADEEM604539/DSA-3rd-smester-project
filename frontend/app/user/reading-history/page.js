'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function ReadingHistoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, returned, borrowed
  const [renewingId, setRenewingId] = useState(null);
  const [returningId, setReturningId] = useState(null);
  const [renewSuccess, setRenewSuccess] = useState(null);
  const [returnSuccess, setReturnSuccess] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Helper function to normalize status from backend enum format
  const normalizeStatus = (status) => {
    if (!status) return 'unknown';
    return status.toLowerCase().replace(/_/g, '_');
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
      return;
    }

    fetchReadingHistory();
  }, [user, isLoaded, router]);

  const fetchReadingHistory = async () => {
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

      const historyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/my-issues/${id}`
      );

      if (!historyResponse.ok) throw new Error('Failed to fetch history');
      const historyData = await historyResponse.json();
      
      // Sort by issue date descending
      const sorted = (historyData.issues || []).sort((a, b) => 
        new Date(b.issue_date) - new Date(a.issue_date)
      );
      setIssues(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (issueId) => {
    try {
      setRenewingId(issueId);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/renew/${issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to renew book');
      setRenewSuccess(issueId);
      setTimeout(() => setRenewSuccess(null), 3000);
      
      // Refresh issues
      fetchReadingHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setRenewingId(null);
    }
  };

  const handleRequestReturn = async (issueId) => {
    try {
      setReturningId(issueId);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/request-return/${issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to request return');
      setReturnSuccess(issueId);
      setTimeout(() => setReturnSuccess(null), 3000);
      
      // Refresh issues
      fetchReadingHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setReturningId(null);
    }
  };

  const handleCancelReturn = async (issueId) => {
    try {
      setCancellingId(issueId);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/cancel-return/${issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to cancel return request');
      setReturnSuccess(issueId);
      setTimeout(() => setReturnSuccess(null), 3000);
      
      // Refresh issues
      fetchReadingHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getFilteredIssues = () => {
    let filtered;
    
    if (filter === 'returned') {
      filtered = issues.filter(i => {
        const status = normalizeStatus(i.status);
        return status === 'returned';
      });
    } else if (filter === 'borrowed') {
      filtered = issues.filter(i => {
        const status = normalizeStatus(i.status);
        return status === 'pending' || status === 'approved';
      });
    } else {
      filtered = issues;
    }

    // Sort by priority: return_requested first, then by date (newest first)
    return filtered.sort((a, b) => {
      const statusA = normalizeStatus(a.status);
      const statusB = normalizeStatus(b.status);

      // RETURN_REQUESTED always comes first
      if (statusA === 'return_requested' && statusB !== 'return_requested') return -1;
      if (statusA !== 'return_requested' && statusB === 'return_requested') return 1;

      // Otherwise sort by issue date (newest first)
      return new Date(b.issue_date) - new Date(a.issue_date);
    });
  };

  const calculateReadingDays = (issueDate, returnedAt) => {
    const issue = new Date(issueDate);
    const ret = returnedAt ? new Date(returnedAt) : new Date();
    return Math.floor((ret - issue) / (1000 * 60 * 60 * 24));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-amber-200 text-lg font-serif">Loading reading history...</div>
        </div>
      </div>
    );
  }

  const filteredIssues = getFilteredIssues();
  const totalRead = issues.filter(i => {
    const status = normalizeStatus(i.status);
    return status === 'returned';
  }).length;
  const currentlyReading = issues.filter(i => {
    const status = normalizeStatus(i.status);
    return status === 'pending' || status === 'approved';
  }).length;
  const returnRequested = issues.filter(i => {
    const status = normalizeStatus(i.status);
    return status === 'return_requested';
  }).length;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📚</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Reading History
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Track your reading journey and library activity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {renewSuccess && (
          <div className="bg-green-900/30 border-l-4 border-green-500 text-green-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">✅ Book renewed successfully!</p>
          </div>
        )}

        {returnSuccess && (
          <div className="bg-blue-900/30 border-l-4 border-blue-500 text-blue-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">✅ Return request submitted! Waiting for librarian approval.</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-amber-800/30">
            <p className="text-gray-500 text-sm uppercase font-serif mb-2">Total Books Read</p>
            <p className="text-5xl font-bold text-amber-200">{totalRead}</p>
            <p className="text-xs text-gray-400 mt-2">Completed and returned</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-blue-800/30">
            <p className="text-gray-500 text-sm uppercase font-serif mb-2">Currently Reading</p>
            <p className="text-5xl font-bold text-blue-400">{currentlyReading}</p>
            <p className="text-xs text-gray-400 mt-2">Active borrowings</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-cyan-800/30">
            <p className="text-gray-500 text-sm uppercase font-serif mb-2">Pending Return</p>
            <p className="text-5xl font-bold text-cyan-400">{returnRequested}</p>
            <p className="text-xs text-gray-400 mt-2">Awaiting approval</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { value: 'all', label: 'All Books', icon: '📋' },
            { value: 'returned', label: 'Returned', icon: '✅' },
            { value: 'borrowed', label: 'Currently Reading', icon: '📖' },
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
              {option.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {filteredIssues.length > 0 ? (
          <div className="space-y-4">
            {filteredIssues.map((issue, idx) => {
              const status = normalizeStatus(issue.status);
              const readingDays = calculateReadingDays(issue.issue_date, issue.returned_at);
              const isReturned = status === 'returned';
              const dueDate = new Date(issue.due_date);
              const today = new Date();
              const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              const isOverdue = daysRemaining < 0;

              return (
                <div
                  key={issue.issue_id}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 w-4 h-4 bg-amber-600 rounded-full border-4 border-gray-950"></div>

                  {/* Content */}
                  <div className="ml-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-amber-600 transition">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      {/* Book Info */}
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-serif mb-2">Book</p>
                        <h3 className="text-lg font-serif font-bold text-amber-100 mb-1">
                          {issue.book_title}
                        </h3>
                        <p className="text-sm text-amber-300 font-serif italic">
                          by {issue.author_name || 'Unknown'}
                        </p>
                      </div>

                      {/* Dates */}
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-serif mb-2">Borrowed</p>
                        <p className="text-amber-100 font-serif">
                          {new Date(issue.issue_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        {isReturned && issue.returned_at && (
                          <>
                            <p className="text-gray-500 text-xs uppercase font-serif mt-3 mb-1">Returned</p>
                            <p className="text-green-400 font-serif">
                              {new Date(issue.returned_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Reading Duration */}
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-serif mb-2">Reading Time</p>
                        <p className="text-2xl font-bold text-amber-200">{readingDays}</p>
                        <p className="text-xs text-gray-400 font-serif">
                          {readingDays === 1 ? 'day' : 'days'}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col justify-center">
                        <div
                          className={`inline-block px-4 py-2 rounded-lg text-sm font-bold font-serif text-center ${
                            isReturned
                              ? 'bg-green-900/50 text-green-300 border border-green-600'
                              : status === 'return_requested'
                              ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-600'
                              : 'bg-blue-900/50 text-blue-300 border border-blue-600'
                          }`}
                        >
                          {isReturned ? '✅ Returned' : status === 'return_requested' ? '⏳ Return Requested' : '📖 Reading'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {status === 'return_requested' ? (
                        <div className="flex flex-col justify-center gap-2">
                          <button
                            onClick={() => handleCancelReturn(issue.issue_id)}
                            disabled={cancellingId === issue.issue_id}
                            className={`py-2 px-3 rounded-lg font-serif font-bold transition text-sm ${
                              cancellingId === issue.issue_id
                                ? 'bg-orange-600 text-white cursor-not-allowed opacity-75'
                                : 'bg-gradient-to-r from-orange-700 to-orange-600 text-white hover:from-orange-600 hover:to-orange-500'
                            }`}
                          >
                            {cancellingId === issue.issue_id ? 'Cancelling...' : '✏️ Cancel Return'}
                          </button>
                        </div>
                      ) : !isReturned && (
                        <div className="flex flex-col justify-center gap-2">
                          <button
                            onClick={() => handleRequestReturn(issue.issue_id)}
                            disabled={returningId === issue.issue_id}
                            className={`py-2 px-3 rounded-lg font-serif font-bold transition text-sm ${
                              returningId === issue.issue_id
                                ? 'bg-blue-600 text-white cursor-not-allowed opacity-75'
                                : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500'
                            }`}
                          >
                            {returningId === issue.issue_id ? 'Requesting...' : '↩️ Return'}
                          </button>
                          <button
                            onClick={() => handleRenew(issue.issue_id)}
                            disabled={renewingId === issue.issue_id || isOverdue}
                            className={`py-2 px-3 rounded-lg font-serif font-bold transition text-sm ${
                              isOverdue
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                : renewingId === issue.issue_id
                                ? 'bg-amber-600 text-gray-950 cursor-not-allowed opacity-75'
                                : 'bg-gradient-to-r from-amber-700 to-amber-600 text-gray-950 hover:from-amber-600 hover:to-amber-500'
                            }`}
                          >
                            {renewingId === issue.issue_id ? 'Renewing...' : isOverdue ? 'Overdue' : '🔄 Renew'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-12 text-center border border-amber-800/20">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-amber-100 text-lg font-serif mb-3">
              No reading history
            </p>
            <p className="text-gray-400 font-serif mb-6">
              Start your reading journey by borrowing books from the library.
            </p>
            <Link href="/user/books">
              <button className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition font-serif">
                Browse Books
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800 mt-12">
        <p className="font-serif italic text-sm">
          📖 Every book is a step in your reading adventure
        </p>
      </footer>
    </div>
  );
}
