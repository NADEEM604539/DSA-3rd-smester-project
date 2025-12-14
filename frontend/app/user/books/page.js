'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function BooksPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, available, unavailable
  const [sortBy, setSortBy] = useState('title'); // title, author, year
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
      return;
    }

    fetchAllBooks();
  }, [user, isLoaded, router]);

  // Apply filters and sorting whenever books or settings change
  useEffect(() => {
    let filtered = [...books];

    // Filter by availability (available > 0 = available, available = 0 = borrowed)
    if (filterType === 'available') {
      filtered = filtered.filter(book => (book.available || 0) > 0);
    } else if (filterType === 'unavailable') {
      filtered = filtered.filter(book => (book.available || 0) === 0);
    }

    // Search filter
    if (searchFilter.trim()) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(searchFilter.toLowerCase()))
      );
    }

    // Sort
    if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'author') {
      filtered.sort((a, b) => 
        (a.author || '').localeCompare(b.author || '')
      );
    } else if (sortBy === 'year') {
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    setFilteredBooks(filtered);
  }, [books, filterType, sortBy, searchFilter]);

  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/books`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data.books || []);
    } catch (err) {
      setError(err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📚</div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/user/dashboard" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block transition">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Library Collection
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Explore {books.length} books in our collection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl p-6 md:p-8 mb-8 border border-amber-800/30">
          {/* Search */}
          <div className="mb-6">
            <label className="block text-amber-100 font-serif text-sm mb-2 font-semibold">
              Search Books
            </label>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full px-4 py-3 bg-gray-800 border-2 border-amber-700/50 text-amber-50 placeholder-gray-500 rounded-lg focus:outline-none focus:border-amber-600 transition font-serif"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Availability Filter */}
            <div>
              <label className="block text-amber-100 font-serif text-sm mb-2 font-semibold">
                Filter by Availability
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All Books', icon: '📖' },
                  { value: 'available', label: 'Available', icon: '✅' },
                  { value: 'unavailable', label: 'Borrowed', icon: '❌' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`py-2 px-4 rounded-lg font-serif font-semibold transition border-2 text-sm ${
                      filterType === option.value
                        ? 'bg-amber-700 border-amber-600 text-gray-950'
                        : 'bg-gray-800 border-gray-700 text-amber-200 hover:border-amber-600'
                    }`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-amber-100 font-serif text-sm mb-2 font-semibold">
                Sort By
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'title', label: 'Title', icon: '🔤' },
                  { value: 'author', label: 'Author', icon: '✍️' },
                  { value: 'year', label: 'Newest', icon: '📅' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`py-2 px-4 rounded-lg font-serif font-semibold transition border-2 text-sm ${
                      sortBy === option.value
                        ? 'bg-amber-700 border-amber-600 text-gray-950'
                        : 'bg-gray-800 border-gray-700 text-amber-200 hover:border-amber-600'
                    }`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-amber-200 font-serif mb-6 text-sm">
          Showing <span className="font-bold text-amber-100">{filteredBooks.length}</span> of{' '}
          <span className="font-bold text-amber-100">{books.length}</span> books
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-amber-200 text-lg font-serif animate-pulse">
              Loading library collection...
            </div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Link key={book.book_id} href={`/user/book/${book.book_id}`}>
                <div className="group cursor-pointer h-full">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-5 border border-gray-700 hover:border-amber-600 transition group-hover:shadow-2xl group-hover:-translate-y-2 h-full flex flex-col">
                    {/* Book Icon with Availability Badge */}
                    <div className="mb-4 relative">
                      <div className="text-6xl mb-2">📚</div>
                      <div
                        className={`absolute top-0 right-0 px-2 py-1 rounded-full text-xs font-bold font-serif ${
                          (book.available || 0) > 0
                            ? 'bg-green-900/70 text-green-300 border border-green-600'
                            : 'bg-red-900/70 text-red-300 border border-red-600'
                        }`}
                      >
                        {(book.available || 0) > 0 ? 'Available' : 'Borrowed'}
                      </div>
                    </div>

                    {/* Book Title */}
                    <h3 className="text-lg font-serif font-bold text-amber-100 mb-2 group-hover:text-amber-200 transition line-clamp-2 flex-grow">
                      {book.title}
                    </h3>

                    {/* Author */}
                    <p className="text-sm text-amber-300 mb-3 font-serif italic">
                      by {book.author || 'Unknown'}
                    </p>

                    {/* ISBN and Year */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-400 border-t border-gray-700 pt-3">
                      <div>
                        <p className="text-gray-500">ISBN</p>
                        <p className="text-amber-200 font-mono text-xs truncate">{book.isbn || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {book.description && (
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    {/* View Details Button */}
                    <div className="text-amber-400 group-hover:text-amber-300 text-sm font-semibold inline-block mt-auto pt-3 border-t border-gray-700">
                      View Details →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-12 text-center border border-amber-800/20">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-amber-100 text-lg font-serif mb-3">
              No books found
            </p>
            <p className="text-gray-400 font-serif mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setSearchFilter('');
              }}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-gray-950 font-semibold rounded-lg transition font-serif"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {!loading && (
        <div className="bg-gray-950 border-t-2 border-amber-800 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-lg border border-amber-800/30">
                <p className="text-amber-300 font-serif text-2xl font-bold">{books.length}</p>
                <p className="text-gray-400 text-sm font-serif">Total Books</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-lg border border-green-800/30">
                <p className="text-green-400 font-serif text-2xl font-bold">
                  {books.filter(b => (b.available || 0) > 0).length}
                </p>
                <p className="text-gray-400 text-sm font-serif">Available</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-lg border border-red-800/30">
                <p className="text-red-400 font-serif text-2xl font-bold">
                  {books.filter(b => (b.available || 0) === 0).length}
                </p>
                <p className="text-gray-400 text-sm font-serif">Borrowed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800">
        <p className="font-serif italic text-sm">
          📚 Expand your mind, one page at a time
        </p>
      </footer>
    </div>
  );
}
