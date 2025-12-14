'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { useProtectedRoute } from '@/lib/use-protected-route';

export default function MyIssuesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userRole, loading: roleLoading } = useProtectedRoute(['MEMBER']);
  const [issues, setIssues] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renewingId, setRenewingId] = useState(null);
  const [returningId, setReturningId] = useState(null);
  const [renewSuccess, setRenewSuccess] = useState(null);
  const [returnSuccess, setReturnSuccess] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, issueId: null, message: '' });

  // Helper function to normalize status from backend enum format
  const normalizeStatus = (status) => {
    if (!status) return 'unknown';
    return status.toLowerCase().replace(/_/g, '_');
  };

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
  }, [user, isLoaded, router, userRole, roleLoading]);

  useEffect(() => {
    if (!isLoaded || roleLoading) return;
    if (!user || userRole !== 'MEMBER') {
      return;
    }

    fetchUserIdAndIssues();
  }, [user, isLoaded, router, userRole, roleLoading]);

  const fetchUserIdAndIssues = async () => {
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

      const issuesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/my-issues/${id}`
      );

      if (!issuesResponse.ok) throw new Error('Failed to fetch issues');
      const issuesData = await issuesResponse.json();
      setIssues(issuesData.issues || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (issueId) => {
    // Show confirmation dialog first
    setConfirmDialog({
      isOpen: true,
      action: 'renew',
      issueId: issueId,
      message: 'Are you sure you want to renew this book? Your due date will be extended by 14 days.'
    });
  };

  const confirmRenew = async (issueId) => {
    try {
      setRenewingId(issueId);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/renew/${issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to renew book');
      }

      setRenewSuccess(issueId);
      setTimeout(() => setRenewSuccess(null), 3000);
      
      // Refresh issues
      fetchUserIdAndIssues();
    } catch (err) {
      setError(err.message);
    } finally {
      setRenewingId(null);
      setConfirmDialog({ isOpen: false, action: null, issueId: null, message: '' });
    }
  };

  const handleRequestReturn = async (issueId) => {
    // Handler removed - now using confirmRequestReturn with dialog
  };

  const confirmRequestReturn = async (issueId) => {
    try {
      setReturningId(issueId);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/request-return/${issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to request return');
      }

      setReturnSuccess(issueId);
      setTimeout(() => setReturnSuccess(null), 3000);
      
      // Refresh issues
      fetchUserIdAndIssues();
    } catch (err) {
      setError(err.message);
    } finally {
      setReturningId(null);
      setConfirmDialog({ isOpen: false, action: null, issueId: null, message: '' });
    }
  };

  const handleCancelReturn = async (issueId) => {
    // Handler removed - now using confirmCancelReturn with dialog
  };

  const confirmCancelReturn = async (issueId) => {
    try {
      setCancellingId(issueId);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/cancel-return/${issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel return request');
      }

      setReturnSuccess(issueId);
      setTimeout(() => setReturnSuccess(null), 3000);
      
      // Refresh issues
      fetchUserIdAndIssues();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
      setConfirmDialog({ isOpen: false, action: null, issueId: null, message: '' });
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading your borrowed books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📖</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/user/dashboard" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block transition">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            My Borrowed Books
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Track your current reading
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

        {/* Filter issues to show only ACTIVE borrowed books (PENDING or APPROVED status) */}
        {(() => {
          // Filter and sort issues
          const returnRequestedIssues = issues
            .filter(issue => {
              const status = normalizeStatus(issue.status);
              return status === 'return_requested';
            })
            .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));

          const activeIssues = issues
            .filter(issue => {
              const status = normalizeStatus(issue.status);
              return status === 'pending' || status === 'approved';
            })
            .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));

          return (
            <>
              {/* ACTIVELY BORROWED BOOKS SECTION */}
              {activeIssues.length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 mb-6 pb-3 border-b-2 border-amber-800">
                    📖 Currently Reading
                  </h2>
                  <div className="space-y-4">
                    {activeIssues.map((issue) => {
                      const issueDate = new Date(issue.issue_date);
                      const dueDate = new Date(issue.due_date);
                      const today = new Date();
                      const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysRemaining < 0;
                      const isDueSoon = daysRemaining > 0 && daysRemaining <= 7;

                      return (
                        <div
                          key={issue.issue_id}
                          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-amber-600 transition"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                            {/* Book Icon */}
                            <div className="flex items-center gap-4">
                              <div className="text-5xl">📚</div>
                              <div>
                                <h3 className="text-xl font-serif font-bold text-amber-100">
                                  {issue.book_title}
                                </h3>
                                <p className="text-sm text-amber-300 font-serif italic">
                                  by {issue.author_name || 'Unknown'}
                                </p>
                              </div>
                            </div>

                            {/* Issue Details */}
                            <div className="text-sm">
                              <p className="text-gray-500 uppercase font-serif mb-1">Issued</p>
                              <p className="text-amber-100 font-serif">
                                {issueDate.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>

                            {/* Due Date */}
                            <div className="text-sm">
                              <p className="text-gray-500 uppercase font-serif mb-1">Due Date</p>
                              <p
                                className={`font-serif font-bold ${
                                  isOverdue
                                    ? 'text-red-400'
                                    : isDueSoon
                                    ? 'text-orange-400'
                                    : 'text-green-400'
                                }`}
                              >
                                {dueDate.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                              <p
                                className={`text-xs mt-1 font-serif ${
                                  isOverdue
                                    ? 'text-red-300'
                                    : isDueSoon
                                    ? 'text-orange-300'
                                    : 'text-green-300'
                                }`}
                              >
                                {isOverdue
                                  ? `${Math.abs(daysRemaining)} days overdue`
                                  : `${daysRemaining} days remaining`}
                              </p>
                            </div>

                            {/* Renew / Return Buttons */}
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setConfirmDialog({
                                  isOpen: true,
                                  action: 'requestReturn',
                                  issueId: issue.issue_id,
                                  message: 'Are you sure you want to request return for this book? A librarian will review your request.'
                                })}
                                disabled={returningId === issue.issue_id}
                                className={`py-2 px-4 rounded-lg font-serif font-bold transition text-sm ${
                                  returningId === issue.issue_id
                                    ? 'bg-blue-600 text-white cursor-not-allowed opacity-75'
                                    : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500'
                                }`}
                              >
                                {returningId === issue.issue_id ? 'Requesting...' : '↩️ Return'}
                              </button>
                              <button
                                onClick={() => setConfirmDialog({
                                  isOpen: true,
                                  action: 'renew',
                                  issueId: issue.issue_id,
                                  message: 'Are you sure you want to renew this book? Your due date will be extended by 14 days.'
                                })}
                                disabled={renewingId === issue.issue_id || isOverdue}
                                className={`py-2 px-6 rounded-lg font-serif font-bold transition ${
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* RETURN-REQUESTED BOOKS SECTION */}
              {returnRequestedIssues.length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-cyan-100 mb-6 pb-3 border-b-2 border-cyan-800">
                    ⏳ Pending Return Approval
                  </h2>
                  <div className="space-y-4">
                    {returnRequestedIssues.map((issue) => {
                      const issueDate = new Date(issue.issue_date);

                      return (
                        <div
                          key={issue.issue_id}
                          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border-2 border-cyan-700 hover:border-cyan-500 transition"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                            {/* Book Icon */}
                            <div className="flex items-center gap-4">
                              <div className="text-5xl">⏳</div>
                              <div>
                                <h3 className="text-xl font-serif font-bold text-cyan-100">
                                  {issue.book_title}
                                </h3>
                                <p className="text-sm text-cyan-300 font-serif italic">
                                  by {issue.author_name || 'Unknown'}
                                </p>
                                <p className="text-xs text-cyan-400 mt-1 font-semibold">
                                  Return request pending...
                                </p>
                              </div>
                            </div>

                            {/* Issue Details */}
                            <div className="text-sm">
                              <p className="text-gray-500 uppercase font-serif mb-1">Issued</p>
                              <p className="text-cyan-100 font-serif">
                                {issueDate.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>

                            {/* Status Info */}
                            <div className="text-sm">
                              <p className="text-gray-500 uppercase font-serif mb-1">Status</p>
                              <div className="inline-block px-3 py-1 bg-cyan-900/50 text-cyan-300 border border-cyan-600 rounded-full font-serif text-xs font-bold">
                                ⏳ Waiting for Librarian
                              </div>
                            </div>

                            {/* Cancel Return Button */}
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setConfirmDialog({
                                  isOpen: true,
                                  action: 'cancelReturn',
                                  issueId: issue.issue_id,
                                  message: 'Are you sure you want to cancel your return request? You can keep reading the book.'
                                })}
                                disabled={cancellingId === issue.issue_id}
                                className={`py-2 px-4 rounded-lg font-serif font-bold transition text-sm ${
                                  cancellingId === issue.issue_id
                                    ? 'bg-orange-600 text-white cursor-not-allowed opacity-75'
                                    : 'bg-gradient-to-r from-orange-700 to-orange-600 text-white hover:from-orange-600 hover:to-orange-500'
                                }`}
                              >
                                {cancellingId === issue.issue_id ? 'Cancelling...' : '✏️ Cancel Return'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* NO BOOKS MESSAGE */}
              {activeIssues.length === 0 && returnRequestedIssues.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-12 text-center border border-amber-800/20">
                  <div className="text-6xl mb-4">📖</div>
                  <p className="text-amber-100 text-lg font-serif mb-3">
                    No borrowed books
                  </p>
                  <p className="text-gray-400 font-serif mb-6">
                    You haven't borrowed any books yet. Explore the library and add some to your collection!
                  </p>
                  <Link href="/user/books">
                    <button className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-gray-950 font-semibold rounded-lg transition font-serif">
                      Browse Books
                    </button>
                  </Link>
                </div>
              ) : null}
            </>
          );
        })()}
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800 mt-12">
        <p className="font-serif italic text-sm">
          📚 Keep track of your reading journey
        </p>
      </footer>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-amber-800 rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="mb-4">
              <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">Confirm Action</h3>
              <p className="text-gray-300 font-serif text-sm">{confirmDialog.message}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, action: null, issueId: null, message: '' })}
                className="px-4 py-2 rounded-lg font-serif font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.action === 'renew') {
                    confirmRenew(confirmDialog.issueId);
                  } else if (confirmDialog.action === 'requestReturn') {
                    confirmRequestReturn(confirmDialog.issueId);
                  } else if (confirmDialog.action === 'cancelReturn') {
                    confirmCancelReturn(confirmDialog.issueId);
                  }
                }}
                className="px-4 py-2 rounded-lg font-serif font-semibold bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-gray-950 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
