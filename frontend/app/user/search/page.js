'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function SearchPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title'); // title, author, isbn, generic
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResults([]);

      let endpoint = '';
      if (searchType === 'title') {
        endpoint = `/member/search/title/${encodeURIComponent(searchQuery)}`;
      } else if (searchType === 'author') {
        endpoint = `/member/search/author/${encodeURIComponent(searchQuery)}`;
      } else if (searchType === 'isbn') {
        endpoint = `/member/search/isbn/${encodeURIComponent(searchQuery)}`;
      } else {
        endpoint = `/member/search?q=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
      );

      if (!response.ok) {
        throw new Error('No books found matching your search');
      }

      const data = await response.json();
      setResults(data.books || (data.book ? [data.book] : []));
      setSearched(true);
    } catch (err) {
      setError(err.message);
      setResults([]);
      setSearched(true);
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
        <div className="absolute top-0 right-0 opacity-5 text-6xl">🔍</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/user/dashboard" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block transition">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            Search the Library
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Discover your next great read
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Search Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 mb-8 border border-amber-800/30">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Input */}
            <div>
              <label className="block text-amber-100 font-serif text-lg mb-3 font-semibold">
                What are you looking for?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter book title, author name, or ISBN..."
                  className="flex-1 px-6 py-3 bg-gray-800 border-2 border-amber-700/50 text-amber-50 placeholder-gray-500 rounded-lg focus:outline-none focus:border-amber-600 transition font-serif"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-gray-950 font-bold rounded-lg hover:from-amber-600 hover:to-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed font-serif"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Search Type Selection */}
            <div>
              <label className="block text-amber-100 font-serif text-lg mb-3 font-semibold">
                Search By
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'title', label: 'Title', icon: '📖' },
                  { value: 'author', label: 'Author', icon: '✍️' },
                  { value: 'isbn', label: 'ISBN', icon: '🔢' },
                  { value: 'generic', label: 'All Fields', icon: '🔍' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSearchType(option.value)}
                    className={`py-3 px-4 rounded-lg font-serif font-semibold transition border-2 ${
                      searchType === option.value
                        ? 'bg-amber-700 border-amber-600 text-gray-950'
                        : 'bg-gray-800 border-gray-700 text-amber-200 hover:border-amber-600'
                    }`}
                  >
                    <span className="text-xl mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Results Section */}
        {searched && (
          <div>
            <h2 className="text-2xl font-serif text-amber-100 mb-6 font-semibold">
              {loading ? 'Searching...' : `Found ${results.length} book${results.length !== 1 ? 's' : ''}`}
            </h2>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((book) => (
                  <Link key={book.book_id} href={`/user/book/${book.book_id}`}>
                    <div className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-amber-600 transition group-hover:shadow-2xl group-hover:-translate-y-1 h-full">
                        {/* Book Icon */}
                        <div className="mb-4 text-5xl">📚</div>

                        {/* Book Title */}
                        <h3 className="text-xl font-serif font-bold text-amber-100 mb-2 group-hover:text-amber-200 transition line-clamp-2">
                          {book.title}
                        </h3>

                        {/* Author */}
                        <p className="text-sm text-amber-300 mb-3 font-serif italic">
                          by {book.author_name || 'Unknown Author'}
                        </p>

                        {/* ISBN */}
                        <p className="text-xs text-gray-400 mb-4 font-mono">
                          ISBN: {book.isbn || 'N/A'}
                        </p>

                        {/* Description */}
                        <p className="text-sm text-gray-300 mb-4 line-clamp-3 font-serif">
                          {book.description || 'No description available'}
                        </p>

                        {/* Book Details */}
                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-400">
                          <div className="border-b border-gray-700 pb-2">
                            <p className="text-gray-500">Published</p>
                            <p className="text-amber-200">{book.publish_year || 'N/A'}</p>
                          </div>
                          <div className="border-b border-gray-700 pb-2">
                            <p className="text-gray-500">Availability</p>
                            <p className={book.available ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                              {book.available ? 'Available' : 'Not Available'}
                            </p>
                          </div>
                        </div>

                        {/* View Details Button */}
                        <div className="text-amber-400 group-hover:text-amber-300 text-sm font-semibold inline-block">
                          View Details →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-12 text-center border border-amber-800/20">
                  <div className="text-6xl mb-4">📖</div>
                  <p className="text-amber-100 text-lg font-serif mb-3">
                    No books found
                  </p>
                  <p className="text-gray-400 font-serif">
                    Try searching with different keywords or browse all books
                  </p>
                  <Link href="/user/books">
                    <button className="mt-6 px-6 py-2 bg-amber-700 hover:bg-amber-600 text-gray-950 font-semibold rounded-lg transition font-serif">
                      Browse All Books
                    </button>
                  </Link>
                </div>
              )
            )}
          </div>
        )}

        {/* Initial State */}
        {!searched && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-12 text-center border border-amber-800/20">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <p className="text-amber-100 text-lg font-serif mb-3">
              Ready to explore?
            </p>
            <p className="text-gray-400 font-serif">
              Use the search form above to find your favorite books by title, author, ISBN, or keyword
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800 mt-12">
        <p className="font-serif italic text-sm">
          💡 Tip: Start typing to search. Our library is organized with advanced search algorithms for instant results.
        </p>
      </footer>
    </div>
  );
}
