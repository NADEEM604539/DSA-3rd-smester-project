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
  button: 'bg-amber-600 hover:bg-amber-700 text-white',
  buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700',
  card: 'bg-gray-900 border border-gray-700',
  success: 'text-green-400',
  error: 'text-red-400',
  alert: 'bg-amber-900 border border-amber-700 text-amber-100'
};

export default function LibrarianManagement() {
  const { getToken } = useAuth();
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    status: 'ACTIVE'
  });

  // Fetch librarians
  const fetchLibrarians = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter ONLY LIBRARIAN role from admin endpoint
        const libs = data.users?.filter(u => u.role === 'LIBRARIAN') || [];
        setLibrarians(libs);
        setError('');
      } else {
        setError('Failed to fetch librarians from admin endpoint');
      }
    } catch (err) {
      setError('Failed to fetch librarians: ' + err.message);
      console.error(err);
      setLibrarians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarians();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = await getToken();
      const url = editingId 
        ? ``${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/users';
      
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? new URLSearchParams({ ...formData, role: 'LIBRARIAN' })
        : JSON.stringify({ ...formData, role: 'LIBRARIAN' });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(editingId ? {} : { 'Content-Type': 'application/json' })
        },
        body
      });

      if (response.ok) {
        setSuccess(editingId ? 'Librarian updated successfully' : 'Librarian added successfully');
        setFormData({ full_name: '', email: '', status: 'ACTIVE' });
        setShowAddForm(false);
        setEditingId(null);
        fetchLibrarians();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to save librarian');
      }
    } catch (err) {
      setError('Error saving librarian');
      console.error(err);
    }
  };

  // Handle suspend/reactivate
  const handleToggleSuspend = async (libId, currentStatus) => {
    try {
      const token = await getToken();
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      
      const response = await fetch(``${process.env.NEXT_PUBLIC_API_URL}/admin/users/${libId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ status: newStatus })
      });

      if (response.ok) {
        setSuccess(`Librarian ${newStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'}`);
        fetchLibrarians();
      }
    } catch (err) {
      setError('Failed to update librarian status');
    }
  };

  // Handle delete
  const handleDelete = async (libId) => {
    if (!window.confirm('Are you sure you want to delete this librarian?')) return;

    try {
      const token = await getToken();
      const response = await fetch(``${process.env.NEXT_PUBLIC_API_URL}/admin/users/${libId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Librarian deleted successfully');
        fetchLibrarians();
      }
    } catch (err) {
      setError('Failed to delete librarian');
    }
  };

  const handleEdit = (lib) => {
    setFormData({
      full_name: lib.full_name,
      email: lib.email,
      status: lib.status || 'ACTIVE'
    });
    setEditingId(lib.user_id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', status: 'ACTIVE' });
    setShowAddForm(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading librarians...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${COLORS.bg} p-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${COLORS.text}`}>Librarian Management</h1>
            <p className={`${COLORS.textMuted} mt-1`}>Manage library staff members</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className={`${COLORS.button} px-6 py-3 rounded-lg font-semibold transition`}
          >
            + Add Librarian
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-4 rounded-lg ${COLORS.alert} bg-red-900 border border-red-700`}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-4 rounded-lg ${COLORS.alert} bg-green-900 border border-green-700 text-green-100`}
          >
            {success}
          </motion.div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`${COLORS.card} p-6 rounded-lg mb-8 border`}
          >
            <h2 className={`text-2xl font-bold ${COLORS.text} mb-4`}>
              {editingId ? 'Edit Librarian' : 'Add New Librarian'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
                required
              />
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  className={`${COLORS.button} px-6 py-2 rounded-lg font-semibold flex-1`}
                >
                  {editingId ? 'Update' : 'Add'} Librarian
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`${COLORS.buttonSecondary} px-6 py-2 rounded-lg font-semibold flex-1`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Librarians List */}
        <div className={`${COLORS.card} rounded-lg overflow-hidden border`}>
          {librarians.length === 0 ? (
            <div className="p-12 text-center">
              <p className={`${COLORS.textMuted} text-lg`}>No librarians found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${COLORS.bg}`}>
                  <tr className={`border-b ${COLORS.border}`}>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Name</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Email</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Status</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {librarians.map((lib, idx) => (
                    <motion.tr
                      key={lib.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-b ${COLORS.border} hover:${COLORS.bg} transition`}
                    >
                      <td className={`px-6 py-4 ${COLORS.text}`}>{lib.full_name}</td>
                      <td className={`px-6 py-4 ${COLORS.textMuted}`}>{lib.email}</td>
                      <td className={`px-6 py-4`}>
                        <span className={`${lib.status === 'ACTIVE' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} px-3 py-1 rounded-full text-sm`}>
                          {lib.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 flex gap-2`}>
                        <button
                          onClick={() => handleEdit(lib)}
                          className="text-amber-400 hover:text-amber-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lib.user_id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Total Librarians</p>
            <p className="text-3xl font-bold text-amber-400">{librarians.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Active</p>
            <p className="text-3xl font-bold text-green-400">{librarians.filter(l => l.status !== 'SUSPENDED').length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Suspended</p>
            <p className="text-3xl font-bold text-red-400">{librarians.filter(l => l.status === 'SUSPENDED').length}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
