'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import LibrarianNavbar from '@/app/components/LibrarianNavbar';

export default function ReturnsAndFinesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    fetchOverdueIssues();
  }, [user]);

  const fetchOverdueIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/issues`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (!response.ok) throw new Error('Failed to fetch issues');

      const data = await response.json();
      // Show both RETURN_REQUESTED and overdue APPROVED books
      const pendingReturns = data.issues?.filter(i => {
        const status = String(i.status).toLowerCase().replace('issuestatus.', '').trim();
        const isOverdue = status === 'approved' && new Date(i.due_date) < new Date();
        const isRequested = status === 'return_requested';
        return isOverdue || isRequested;
      }) || [];
      setIssues(pendingReturns);
    } catch (err) {
      console.error('Error fetching overdue issues:', err);
      setError('Failed to load overdue issues');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (issueId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/return/${issueId}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to mark as returned');
      fetchOverdueIssues();
    } catch (err) {
      console.error('Error marking return:', err);
      setError('Failed to process return');
    }
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
          <h1 className="text-3xl md:text-4xl font-bold text-amber-100 font-serif">Returns & Fines</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 rounded font-serif mb-8">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl overflow-hidden border border-amber-800/30">
          <div className="bg-gray-800 px-6 py-4 border-b border-amber-800/50">
            <h2 className="text-xl font-bold text-amber-100 font-serif">Overdue Books ({issues.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-amber-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-amber-200 font-serif">Book</th>
                  <th className="px-6 py-3 text-left text-amber-200 font-serif">Member</th>
                  <th className="px-6 py-3 text-left text-amber-200 font-serif">Due Date</th>
                  <th className="px-6 py-3 text-center text-amber-200 font-serif">Days Overdue</th>
                  <th className="px-6 py-3 text-center text-amber-200 font-serif">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-serif">No overdue books</td>
                  </tr>
                ) : (
                  issues.map((issue) => {
                    const daysOverdue = Math.floor((new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={issue.issue_id} className="border-b border-amber-800/20 hover:bg-gray-700">
                        <td className="px-6 py-4 text-amber-100 font-serif">{issue.book_title}</td>
                        <td className="px-6 py-4 text-amber-100 font-serif">{issue.member_name}</td>
                        <td className="px-6 py-4 text-gray-300 font-serif">{new Date(issue.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center text-red-300 font-bold font-serif">{daysOverdue}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleMarkReturned(issue.issue_id)}
                            className="bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition font-serif text-sm"
                          >
                            ✓ Mark Returned
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
