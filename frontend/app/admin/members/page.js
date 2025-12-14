'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const COLORS = {
  bg: 'bg-gray-950',
  text: 'text-gray-100',
  textMuted: 'text-gray-400',
  border: 'border-gray-700',
  input: 'bg-gray-900 border border-gray-700 text-gray-100',
  card: 'bg-gray-900 border border-gray-700',
};

export default function MembersView() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const memberList = data.users?.filter(u => u.role === 'MEMBER') || [];
        setMembers(memberList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members
    .filter(m =>
      m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user_id?.toString().includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.full_name?.localeCompare(b.full_name);
      if (sortBy === 'email') return a.email?.localeCompare(b.email);
      return b.user_id - a.user_id;
    });

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading members...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${COLORS.bg} p-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <h1 className={`text-4xl font-bold ${COLORS.text} mb-2`}>Members</h1>
        <p className={`${COLORS.textMuted} mb-8`}>View all library members (Read-only)</p>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${COLORS.card} border rounded-lg p-6 mb-8 grid grid-cols-3 gap-4`}
        >
          <div className="text-center">
            <p className={COLORS.textMuted}>Total Members</p>
            <p className="text-4xl font-bold text-amber-400">{members.length}</p>
          </div>
          <div className="text-center">
            <p className={COLORS.textMuted}>Active (Last 30 Days)</p>
            <p className="text-4xl font-bold text-blue-400">--</p>
          </div>
          <div className="text-center">
            <p className={COLORS.textMuted}>Search Results</p>
            <p className="text-4xl font-bold text-green-400">{filteredMembers.length}</p>
          </div>
        </motion.div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 ${COLORS.input} px-4 py-3 rounded-lg`}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`${COLORS.input} px-4 py-3 rounded-lg`}
          >
            <option value="recent">Recent First</option>
            <option value="name">Name (A-Z)</option>
            <option value="email">Email (A-Z)</option>
          </select>
        </div>

        {/* Members Table */}
        <div className={`${COLORS.card} rounded-lg overflow-hidden border`}>
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <p className={`${COLORS.textMuted} text-lg`}>No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${COLORS.bg}`}>
                  <tr className={`border-b ${COLORS.border}`}>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Member ID</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Full Name</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Email</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Joined</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, idx) => (
                    <motion.tr
                      key={member.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`border-b ${COLORS.border} hover:${COLORS.bg} transition`}
                    >
                      <td className={`px-6 py-4 ${COLORS.text} font-semibold`}>#{member.user_id}</td>
                      <td className={`px-6 py-4 ${COLORS.text}`}>{member.full_name}</td>
                      <td className={`px-6 py-4 ${COLORS.textMuted}`}>{member.email}</td>
                      <td className={`px-6 py-4 ${COLORS.textMuted}`}>
                        {member.created_at ? new Date(member.created_at).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className={`px-6 py-4`}>
                        <span className="bg-green-900 text-green-100 px-3 py-1 rounded-full text-sm">
                          Active
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-blue-900 border border-blue-700 rounded-lg p-6 mt-8`}
        >
          <p className="text-blue-100">
            <strong>ℹ️ Note:</strong> This view is read-only. Member accounts cannot be created or modified from this page. 
            Members are created automatically when they sign up through the Clerk authentication system.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
