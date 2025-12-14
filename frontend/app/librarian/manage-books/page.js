'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import LibrarianNavbar from '@/app/components/LibrarianNavbar';

export default function ManageBooksPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    year: new Date().getFullYear(),
    quantity: 1,
    available: 1,
    category: '',
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    fetchBooks();
  }, [user]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/books`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Validation: available cannot exceed quantity
      if (formData.available > formData.quantity) {
        setError(`Available copies (${formData.available}) cannot exceed total copies (${formData.quantity})`);
        return;
      }

      const endpoint = editingBook
        ? `${process.env.NEXT_PUBLIC_API_URL}/librarian/books/${editingBook.book_id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/librarian/books`;

      const method = editingBook ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || (editingBook ? 'Failed to update book' : 'Failed to add book'));
      }

      const result = await response.json();
      setShowForm(false);
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        year: new Date().getFullYear(),
        quantity: 1,
        available: 1,
        category: '',
      });
      
      // Show success message briefly
      setError(`✓ Book ${editingBook ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setError(null), 3000);
      
      fetchBooks();
    } catch (err) {
      console.error('Error saving book:', err);
      setError(err.message);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/books/${bookId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      quantity: book.quantity || 1,
      available: book.available || 1,
      category: book.category || '',
    });
    setShowForm(true);
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
  );

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <LibrarianNavbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📚</div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Manage Books
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Add, edit, and delete books from the library collection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className={`border-l-4 text-white p-4 rounded backdrop-blur-sm font-serif mb-8 ${
            error.includes('✓') 
              ? 'bg-green-900/30 border-green-500 text-green-200' 
              : 'bg-red-900/30 border-red-500 text-red-200'
          }`}>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-900 border border-amber-800 text-amber-100 placeholder-gray-500 rounded font-serif focus:outline-none focus:border-amber-600"
          />
          <button
            onClick={() => {
              setEditingBook(null);
              setFormData({
                title: '',
                author: '',
                isbn: '',
                publisher: '',
                year: new Date().getFullYear(),
                quantity: 1,
                available: 1,
                category: '',
              });
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-br from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-gray-950 font-bold py-3 px-6 rounded-lg transition font-serif shadow-lg whitespace-nowrap"
          >
            {showForm ? '✕ Close' : '+ Add Book'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl p-8 border border-amber-800/30 mb-8">
            <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={isNaN(formData.year) ? '' : formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Total Quantity
                </label>
                <input
                  type="number"
                  value={isNaN(formData.quantity) ? '' : formData.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    const newAvailable = Math.min(formData.available, newQuantity);
                    setFormData({ ...formData, quantity: newQuantity, available: newAvailable });
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-amber-200 font-serif font-semibold mb-2">
                  Available
                </label>
                <input
                  type="number"
                  value={isNaN(formData.available) ? '' : formData.available}
                  onChange={(e) => {
                    const newAvailable = parseInt(e.target.value) || 1;
                    if (newAvailable <= formData.quantity) {
                      setFormData({ ...formData, available: newAvailable });
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-amber-800 text-amber-100 rounded font-serif focus:outline-none focus:border-amber-600"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-3 rounded-lg transition font-serif shadow-lg"
                >
                  {
                    formData.available===formData.available ?
                    <div>
                      {editingBook ? '✓ Update Book' : '+ Save Book'}
                    </div>:
                    <div>
                       {editingBook ? ' NO WAY' : '+ NO WAY'}
                    </div>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Books List */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl overflow-hidden border border-amber-800/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-amber-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-amber-200 font-serif font-semibold">Title</th>
                  <th className="px-6 py-4 text-left text-amber-200 font-serif font-semibold">Author</th>
                  <th className="px-6 py-4 text-left text-amber-200 font-serif font-semibold">ISBN</th>
                  <th className="px-6 py-4 text-left text-amber-200 font-serif font-semibold">Category</th>
                  <th className="px-6 py-4 text-center text-amber-200 font-serif font-semibold">Qty</th>
                  <th className="px-6 py-4 text-center text-amber-200 font-serif font-semibold">Available</th>
                  <th className="px-6 py-4 text-center text-amber-200 font-serif font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400 font-serif">
                      No books found
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.book_id} className="border-b border-amber-800/20 hover:bg-gray-750 transition">
                      <td className="px-6 py-4 text-amber-100 font-serif">{book.title}</td>
                      <td className="px-6 py-4 text-gray-300 font-serif">{book.author || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-400 font-serif text-sm">{book.isbn}</td>
                      <td className="px-6 py-4 text-gray-300 font-serif text-sm">{book.category || '-'}</td>
                      <td className="px-6 py-4 text-center text-amber-300 font-serif font-semibold">{book.quantity || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded font-serif font-semibold ${
                          (book.available || 0) > 0
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {book.available || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm font-serif transition"
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.book_id)}
                          className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-sm font-serif transition"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 font-serif text-sm">
          Total: {filteredBooks.length} books
        </div>
      </div>
    </div>
  );
}
