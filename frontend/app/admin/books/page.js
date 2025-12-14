'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProtectedRoute } from '@/lib/use-protected-route';

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

export default function BooksManagement() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userRole, loading: roleLoading } = useProtectedRoute(['ADMIN']);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author_id: '',
    category_id: '',
    total_copies: '',
    available_copies: ''
  });

  // Fetch books, authors, categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [booksRes, authorsRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/books`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/authors`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, { headers })
      ]);

      if (booksRes.ok) setBooks(await booksRes.json().then(d => d.books || []));
      if (authorsRes.ok) setAuthors(await authorsRes.json().then(d => d.authors || []));
      if (categoriesRes.ok) setCategories(await categoriesRes.json().then(d => d.categories || []));
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || roleLoading) return;
    if (!user || userRole !== 'ADMIN') {
      if (userRole && userRole !== 'ADMIN') {
        const dashboardMap = {
          'LIBRARIAN': '/librarian/dashboard',
          'MEMBER': '/user/dashboard',
        };
        router.push(dashboardMap[userRole] || '/');
      } else if (!user) {
        router.push('/');
      }
    }
  }, [user, isLoaded, router, userRole, roleLoading]);

  useEffect(() => {
    if (!isLoaded || roleLoading) return;
    if (!user || userRole !== 'ADMIN') return;
    
    fetchData();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = await getToken();
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/books/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/books`;
      
      const method = editingId ? 'PUT' : 'POST';
      const body = JSON.stringify({
        isbn: formData.isbn,
        title: formData.title,
        author_id: parseInt(formData.author_id) || null,
        category_id: parseInt(formData.category_id) || null,
        total_copies: parseInt(formData.total_copies) || 1,
        available_copies: parseInt(formData.available_copies) || 1
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        setSuccess(editingId ? 'Book updated successfully' : 'Book added successfully');
        setFormData({
          isbn: '', title: '', author_id: '', category_id: '', 
          total_copies: '', available_copies: ''
        });
        setShowAddForm(false);
        setEditingId(null);
        fetchData();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to save book');
      }
    } catch (err) {
      setError('Error saving book');
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Book deleted successfully');
        fetchData();
      }
    } catch (err) {
      setError('Failed to delete book');
    }
  };

  const handleEdit = (book) => {
    setFormData({
      isbn: book.isbn,
      title: book.title,
      author_id: book.author_id || '',
      category_id: book.category_id || '',
      total_copies: book.total_copies || '',
      available_copies: book.available_copies || ''
    });
    setEditingId(book.book_id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      isbn: '', title: '', author_id: '', category_id: '', 
      total_copies: '', available_copies: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isbn?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} p-6 flex items-center justify-center`}>
        <div className="text-2xl text-amber-400">Loading books...</div>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${COLORS.text}`}>Books Management</h1>
            <p className={`${COLORS.textMuted} mt-1`}>Add, edit, or delete books from the library</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className={`${COLORS.button} px-6 py-3 rounded-lg font-semibold transition`}
          >
            + Add Book
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-4 rounded-lg bg-red-900 border border-red-700 text-red-100`}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-4 rounded-lg bg-green-900 border border-green-700 text-green-100`}
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
              {editingId ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
                required
              />
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
                required
              />
              <select
                value={formData.author_id}
                onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
              >
                <option value="">Select Author</option>
                {authors.map(a => (
                  <option key={a.author_id} value={a.author_id}>{a.author_name}</option>
                ))}
              </select>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Total Copies"
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
                min="1"
              />
              <input
                type="number"
                placeholder="Available Copies"
                value={formData.available_copies}
                onChange={(e) => setFormData({ ...formData, available_copies: e.target.value })}
                className={`${COLORS.input} px-4 py-2 rounded-lg`}
                min="0"
              />
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  className={`${COLORS.button} px-6 py-2 rounded-lg font-semibold flex-1`}
                >
                  {editingId ? 'Update' : 'Add'} Book
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

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by title or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${COLORS.input} px-4 py-3 rounded-lg`}
          />
        </div>

        {/* Books List */}
        <div className={`${COLORS.card} rounded-lg overflow-hidden border`}>
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center">
              <p className={`${COLORS.textMuted} text-lg`}>No books found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${COLORS.bg}`}>
                  <tr className={`border-b ${COLORS.border}`}>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Title</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>ISBN</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Author</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Category</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Copies</th>
                    <th className={`px-6 py-4 text-left ${COLORS.text} font-semibold`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book, idx) => {
                    const author = authors.find(a => a.author_id === book.author_id);
                    const category = categories.find(c => c.category_id === book.category_id);
                    return (
                      <motion.tr
                        key={book.book_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`border-b ${COLORS.border} hover:${COLORS.bg} transition`}
                      >
                        <td className={`px-6 py-4 ${COLORS.text} font-medium`}>{book.title}</td>
                        <td className={`px-6 py-4 ${COLORS.textMuted}`}>{book.isbn}</td>
                        <td className={`px-6 py-4 ${COLORS.textMuted}`}>{author?.author_name || 'N/A'}</td>
                        <td className={`px-6 py-4 ${COLORS.textMuted}`}>{category?.category_name || 'N/A'}</td>
                        <td className={`px-6 py-4 ${COLORS.textMuted}`}>
                          {book.available_copies}/{book.total_copies}
                        </td>
                        <td className={`px-6 py-4 flex gap-2`}>
                          <button
                            onClick={() => handleEdit(book)}
                            className="text-amber-400 hover:text-amber-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(book.book_id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Total Books</p>
            <p className="text-3xl font-bold text-amber-400">{books.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Total Copies</p>
            <p className="text-3xl font-bold text-blue-400">{books.reduce((sum, b) => sum + (b.total_copies || 0), 0)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Available</p>
            <p className="text-3xl font-bold text-green-400">{books.reduce((sum, b) => sum + (b.available_copies || 0), 0)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${COLORS.card} p-4 rounded-lg border text-center`}
          >
            <p className={COLORS.textMuted}>Issued</p>
            <p className="text-3xl font-bold text-yellow-400">{books.reduce((sum, b) => sum + ((b.total_copies || 0) - (b.available_copies || 0)), 0)}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
