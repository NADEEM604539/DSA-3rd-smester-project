'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import LibrarianNavbar from '@/app/components/LibrarianNavbar';
import { useProtectedRoute } from '@/lib/use-protected-route';

export default function IssueManagementPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userRole, loading: roleLoading } = useProtectedRoute(['LIBRARIAN']);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    fetchIssues();
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/issues`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }

      const data = await response.json();
      setIssues(data.issues || []);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveIssue = async (issueId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/issues/${issueId}/approve`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to approve issue');
      }

      fetchIssues();
    } catch (err) {
      console.error('Error approving issue:', err);
      setError('Failed to approve issue');
    }
  };

  const handleRejectIssue = async (issueId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/issues/${issueId}/reject`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to reject issue');
      }

      fetchIssues();
    } catch (err) {
      console.error('Error rejecting issue:', err);
      setError('Failed to reject issue');
    }
  };

  const handleMarkReturned = async (issueId, issueName, wasRequested) => {
    // Show confirmation dialog first
    setConfirmDialog({
      issueId,
      issueName,
      wasRequested,
    });
  };

  const confirmMarkReturned = async () => {
    if (!confirmDialog) return;

    try {
      setIsProcessing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/return/${confirmDialog.issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to mark book as returned');
      }

      setConfirmDialog(null);
      fetchIssues();
    } catch (err) {
      console.error('Error marking return:', err);
      setError('Failed to mark book as returned');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    // Normalize status from backend enum format (e.g., "IssueStatus.PENDING" or "PENDING")
    let normalizedStatus = status;
    if (typeof status === 'string') {
      normalizedStatus = status.toLowerCase().replace('issuestatus.', '').trim();
    }

    const statusConfig = {
      pending: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', icon: '⏳' },
      approved: { bg: 'bg-green-900/50', text: 'text-green-300', icon: '✓' },
      rejected: { bg: 'bg-red-900/50', text: 'text-red-300', icon: '✕' },
      returned: { bg: 'bg-blue-900/50', text: 'text-blue-300', icon: '↩️' },
      return_requested: { bg: 'bg-cyan-900/50', text: 'text-cyan-300', icon: '↩️' },
    };

    const config = statusConfig[normalizedStatus] || statusConfig.pending;
    const displayStatus = normalizedStatus.replace('_', ' ');
    
    return (
      <span className={`inline-block px-3 py-1 rounded font-serif font-semibold ${config.bg} ${config.text}`}>
        {config.icon} {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </span>
    );
  };

  const filteredIssues = issues
    .filter((issue) => {
      // Normalize status for comparison
      const normalizedStatus = String(issue.status).toLowerCase().replace('issuestatus.', '').trim();
      const matchStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
      const matchSearch =
        issue.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.member_name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      // Priority order: RETURN_REQUESTED first, then PENDING, then APPROVED, then RETURNED
      const statusOrder = {
        'return_requested': 0,
        'pending': 1,
        'approved': 2,
        'returned': 3,
      };

      const statusA = String(a.status).toLowerCase().replace('issuestatus.', '').trim();
      const statusB = String(b.status).toLowerCase().replace('issuestatus.', '').trim();

      const orderA = statusOrder[statusA] ?? 4;
      const orderB = statusOrder[statusB] ?? 4;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Within same status, sort by issue_date (newest first)
      const dateA = new Date(a.issue_date).getTime();
      const dateB = new Date(b.issue_date).getTime();
      return dateB - dateA;
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const normalizeStatus = (status) => {
    return String(status).toLowerCase().replace('issuestatus.', '').trim();
  };

  const isOverdue = (dueDate, status) => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === 'approved' && new Date(dueDate) < new Date();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading issues...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <LibrarianNavbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📖</div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Issue Management
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Track and manage all book borrowing requests and issues
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 rounded backdrop-blur-sm font-serif mb-8">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by book or member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-900 border border-amber-800 text-amber-100 placeholder-gray-500 rounded font-serif focus:outline-none focus:border-amber-600"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
          >
            <option value="all">All Issues</option>
            <option value="return_requested">↩️ Return Requested</option>
            <option value="approved">✓ Approved</option>
            <option value="returned">✓ Returned</option>
          </select>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredIssues.length === 0 ? (
            <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl p-12 border border-amber-800/30 text-center">
              <p className="text-gray-400 text-lg font-serif">No issues found</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.issue_id}
                className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl p-6 border ${
                  isOverdue(issue.due_date, issue.status)
                    ? 'border-red-600/50 bg-red-950/10'
                    : 'border-amber-800/30'
                } transition`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-100 font-serif mb-1">
                      {issue.book_title}
                    </h3>
                    <p className="text-gray-400 text-sm font-serif">By {issue.author}</p>
                  </div>
                  {getStatusBadge(issue.status)}
                </div>

                {/* Member & Dates */}
                <div className="space-y-3 mb-4 pb-4 border-b border-amber-800/20">
                  <div>
                    <p className="text-xs text-gray-500 font-serif uppercase">Member</p>
                    <p className="text-amber-200 font-serif">{issue.member_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-serif uppercase">Issued</p>
                      <p className="text-amber-200 font-serif text-sm">{formatDate(issue.issue_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-serif uppercase">Due</p>
                      <p className={`font-serif text-sm ${
                        isOverdue(issue.due_date, issue.status) ? 'text-red-400 font-bold' : 'text-amber-200'
                      }`}>
                        {formatDate(issue.due_date)}
                        {isOverdue(issue.due_date, issue.status) && ' 🔴'}
                      </p>
                    </div>
                  </div>

                  {/* Show Returned Date if Book is Returned */}
                  {normalizeStatus(issue.status) === 'returned' && issue.returned_at && (
                    <div className="mt-4 pt-4 border-t border-green-800/30">
                      <p className="text-xs text-gray-500 font-serif uppercase">Returned On</p>
                      <p className="text-green-400 font-serif text-sm font-bold">{formatDate(issue.returned_at)}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {(() => {
                  const status = normalizeStatus(issue.status);
                  
                  if (status === 'pending') {
                    return (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveIssue(issue.issue_id)}
                          className="flex-1 bg-gradient-to-br from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-2 px-4 rounded transition font-serif text-sm"
                        >
                          ✓ Approve
                        </button>
                      </div>
                    );
                  }
                  
                  if (status === 'approved') {
                    return (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleMarkReturned(issue.issue_id, issue.book_title, false)}
                          className="flex-1 bg-gradient-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-2 px-4 rounded transition font-serif text-sm"
                        >
                          ↩️ Mark as Returned
                        </button>
                      </div>
                    );
                  }
                  
                  if (status === 'return_requested') {
                    return (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleMarkReturned(issue.issue_id, issue.book_title, true)}
                          className="flex-1 bg-gradient-to-br from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-2 px-4 rounded transition font-serif text-sm"
                        >
                          ✓ Accept Return
                        </button>
                      </div>
                    );
                  }
                  
                  if (status === 'rejected') {
                    return (
                      <div className="text-center text-red-400 font-serif text-sm italic">
                        Request Rejected
                      </div>
                    );
                  }
                  
                  if (status === 'returned') {
                    return (
                      <div className="bg-green-900/20 border border-green-600/50 rounded p-3 text-center">
                        <p className="text-green-400 font-serif text-sm italic font-bold">✓ Issue Completed</p>
                        {issue.returned_at && (
                          <p className="text-green-300 font-serif text-xs mt-1">
                            Returned on {formatDate(issue.returned_at)}
                          </p>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <div className="text-center text-gray-500 font-serif text-sm italic">
                      No action available
                    </div>
                  );
                })()}
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl p-8 border border-amber-800/30">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-300 font-serif mb-1">{issues.filter(i => normalizeStatus(i.status) === 'pending').length}</p>
              <p className="text-gray-400 font-serif text-sm">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-300 font-serif mb-1">{issues.filter(i => normalizeStatus(i.status) === 'approved').length}</p>
              <p className="text-gray-400 font-serif text-sm">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-cyan-300 font-serif mb-1">{issues.filter(i => normalizeStatus(i.status) === 'return_requested').length}</p>
              <p className="text-gray-400 font-serif text-sm">Return Requested</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-300 font-serif mb-1">{issues.filter(i => normalizeStatus(i.status) === 'returned').length}</p>
              <p className="text-gray-400 font-serif text-sm">Returned</p>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 border-2 border-amber-600 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">
                  {confirmDialog.wasRequested ? '✓' : '↩️'}
                </div>
                <h2 className="text-2xl font-bold text-amber-100 font-serif mb-2">
                  {confirmDialog.wasRequested ? 'Accept Return Request' : 'Mark as Returned'}
                </h2>
                <p className="text-gray-300 font-serif">
                  {confirmDialog.issueName}
                </p>
              </div>

              <div className="bg-gray-950/50 rounded p-4 mb-6 border border-amber-800/30">
                <p className="text-sm text-gray-300 font-serif mb-2">
                  {confirmDialog.wasRequested
                    ? '⏳ This book return was requested by the member.'
                    : '📝 This book is being marked as returned by you directly (no request).'}
                </p>
                <p className="text-xs text-gray-400 font-serif italic">
                  Once confirmed, the member will see this book as completed in their history.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition font-serif disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkReturned}
                  disabled={isProcessing}
                  className={`flex-1 ${
                    confirmDialog.wasRequested
                      ? 'bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500'
                      : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500'
                  } text-white font-bold py-2 px-4 rounded transition font-serif disabled:opacity-50`}
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

