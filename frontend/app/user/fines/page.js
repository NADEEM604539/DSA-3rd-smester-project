'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/app/components/Navbar';

export default function FinesPage() {
  const { userId } = useAuth();
  const { user, isLoaded } = useUser();
  const [fines, setFines] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchFinesData();
  }, [user, isLoaded]);

  const fetchFinesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user email
      const email = user?.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        setError('Email not found');
        return;
      }

      // Get user ID from backend
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user-by-email/${email}`
      );
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user');
      }
      const userData = await userResponse.json();
      const id = userData.user_id;

      if (!id) {
        setError('User ID not found');
        return;
      }

      // Store in localStorage for later use
      localStorage.setItem('user_id', id);

      // Get fines
      const finesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/fines/${id}`
      );
      if (!finesResponse.ok) {
        throw new Error('Failed to fetch fines');
      }
      const finesData = await finesResponse.json();
      console.log('Fines data:', finesData);
      setFines(finesData.fines || []);
      setStats(finesData.summary);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadChallan = async (fineId) => {
    try {
      setDownloadingId(fineId);
      const id = localStorage.getItem('user_id');
      if (!id) {
        alert('User ID not found');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/fines/${fineId}/challan?user_id=${id}`
      );
      if (!response.ok) {
        throw new Error('Failed to download challan');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fine_challan_${fineId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download challan: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const getFilteredFines = () => {
    if (filter === 'paid') {
      return fines.filter(f => f.is_paid);
    } else if (filter === 'unpaid') {
      return fines.filter(f => !f.is_paid);
    }
    return fines;
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-amber-200 text-lg font-serif">Loading fines data...</div>
        </div>
      </div>
    );
  }

  const filteredFines = getFilteredFines();

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">💳</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Fine Management
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Track and manage your library fines and penalties
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-amber-800/30">
            <p className="text-gray-500 text-sm uppercase font-serif mb-2">Total Fines</p>
            <p className="text-4xl font-bold text-amber-200">
              Rs{(stats?.total_fines || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">All time total</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-green-800/30">
            <p className="text-gray-500 text-sm uppercase font-serif mb-2">Paid Fines</p>
            <p className="text-4xl font-bold text-green-400">
              Rs {(stats?.paid || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">Settled</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-red-800/30">
            <p className="text-gray-500 text-sm uppercase font-serif mb-2">Unpaid Fines</p>
            <p className="text-4xl font-bold text-red-400">
              Rs {(stats?.unpaid || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">Due now</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-orange-800/30">
            <p className="text-gray-500 text-sm uppercase font-serif mb-2">Fine Count</p>
            <p className="text-4xl font-bold text-orange-400">
              {fines.length}
            </p>
            <p className="text-xs text-gray-400 mt-2">Total records</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          {[
            { value: 'all', label: 'All Fines', icon: '📋' },
            { value: 'paid', label: 'Paid', icon: '✅' },
            { value: 'unpaid', label: 'Unpaid', icon: '⚠️' },
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

        {filteredFines.length > 0 ? (
          <div className="space-y-4">
            {filteredFines.map((fine) => (
              <div
                key={fine.fine_id}
                className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border transition ${
                  fine.is_paid
                    ? 'border-green-800/30'
                    : 'border-red-800/30'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-serif mb-2">Type</p>
                    <p className="text-amber-100 font-serif font-semibold">
                      {fine.fine_type === 'LATE_RETURN' ? '⏰ Late Return' : '📦 Book Lost'}
                    </p>
                    <p className={`text-sm font-bold mt-2 ${
                      fine.is_paid ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {fine.is_paid ? '✓ PAID' : '⚠️ UNPAID'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase font-serif mb-2">Amount</p>
                    <p className="text-3xl font-bold text-amber-300">
                      Rs{fine.fine_amount.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase font-serif mb-2">Created</p>
                    <p className="text-amber-100 font-serif">
                      {new Date(fine.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {fine.paid_at && (
                      <>
                        <p className="text-gray-500 text-xs uppercase font-serif mt-3 mb-1">Paid On</p>
                        <p className="text-green-400 font-serif">
                          {new Date(fine.paid_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase font-serif mb-2">Payment Deadline</p>
                    <p className="text-orange-300 font-serif font-semibold">
                      {new Date(new Date(fine.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">7 days from creation</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => downloadChallan(fine.fine_id)}
                      disabled={downloadingId === fine.fine_id}
                      className="py-2 px-4 bg-amber-700 hover:bg-amber-600 text-gray-950 font-serif font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {downloadingId === fine.fine_id ? '⏳ Downloading...' : '📄 Download Challan'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl p-12 border border-amber-800/30 text-center">
            <p className="text-gray-400 text-lg font-serif">🎉 No fines to display!</p>
            <p className="text-gray-500 text-sm font-serif mt-2">Keep it up! No {filter !== 'all' ? filter : 'unpaid'} fines at the moment.</p>
            <p className="text-gray-500 text-xs font-serif mt-4">💡 Keep your account in good standing for uninterrupted library access</p>
          </div>
        )}
      </div>
    </div>
  );
}
