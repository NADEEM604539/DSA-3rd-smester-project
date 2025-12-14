'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function WishlistPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
      return;
    }

    fetchWishlist();
  }, [user, isLoaded, router]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all books to display
      const booksResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/books`
      );

      if (!booksResponse.ok) throw new Error('Failed to fetch books');
      const booksData = await booksResponse.json();
      setAllBooks(booksData.books || []);

      // Load wishlist from localStorage (since backend doesn't have this yet)
      const savedWishlist = localStorage.getItem('wishlist') || '[]';
      setWishlist(JSON.parse(savedWishlist));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (book) => {
    if (!wishlist.find(b => b.book_id === book.book_id)) {
      const updated = [...wishlist, book];
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  };

  const removeFromWishlist = (bookId) => {
    const updated = wishlist.filter(b => b.book_id !== bookId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const filteredWishlist = wishlist.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author_name && book.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-amber-200 text-lg font-serif">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">❤️</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-amber-100">
            My Wishlist
          </h1>
          <p className="text-lg text-amber-200 font-serif italic">
            Save books you want to read later
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

        {/* Search and Stats */}
        <div className="mb-8">
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your wishlist..."
              className="w-full px-4 py-3 bg-gray-800 border-2 border-amber-700/50 text-amber-50 placeholder-gray-500 rounded-lg focus:outline-none focus:border-amber-600 transition font-serif"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-amber-800/30">
              <p className="text-gray-500 text-sm uppercase font-serif mb-2">Total Saved</p>
              <p className="text-4xl font-bold text-amber-200">{wishlist.length}</p>
              <p className="text-xs text-gray-400 mt-2">Books in wishlist</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-green-800/30">
              <p className="text-gray-500 text-sm uppercase font-serif mb-2">Available Now</p>
              <p className="text-4xl font-bold text-green-400">
                {wishlist.filter(b => b.available).length}
              </p>
              <p className="text-xs text-gray-400 mt-2">Ready to borrow</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-orange-800/30">
              <p className="text-gray-500 text-sm uppercase font-serif mb-2">Unavailable</p>
              <p className="text-4xl font-bold text-orange-400">
                {wishlist.filter(b => !b.available).length}
              </p>
              <p className="text-xs text-gray-400 mt-2">Currently borrowed</p>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        {filteredWishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishlist.map((book) => (
              <div
                key={book.book_id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-amber-600 transition group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-5xl mb-2">📚</div>
                  <button
                    onClick={() => removeFromWishlist(book.book_id)}
                    className="text-red-400 hover:text-red-300 transition"
                    title="Remove from wishlist"
                  >
                    ❌
                  </button>
                </div>

                <h3 className="text-lg font-serif font-bold text-amber-100 mb-2 line-clamp-2 group-hover:text-amber-200 transition">
                  {book.title}
                </h3>

                <p className="text-sm text-amber-300 mb-3 font-serif italic">
                  by {book.author_name || 'Unknown'}
                </p>

                {/* Availability Badge */}
                <div className="mb-4">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-serif ${
                      book.available
                        ? 'bg-green-900/70 text-green-300 border border-green-600'
                        : 'bg-orange-900/70 text-orange-300 border border-orange-600'
                    }`}
                  >
                    {book.available ? '✅ Available' : '⏳ Unavailable'}
                  </div>
                </div>

                {/* Book Info */}
                <div className="space-y-2 mb-4 text-xs text-gray-400 border-t border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span>ISBN:</span>
                    <span className="text-amber-100 font-mono">{book.isbn || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Year:</span>
                    <span className="text-amber-100">{book.publish_year || 'N/A'}</span>
                  </div>
                </div>

                {/* Description */}
                {book.description && (
                  <p className="text-xs text-gray-400 mb-4 line-clamp-3">
                    {book.description}
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {book.available ? (
                    <Link href={`/user/book/${book.book_id}`}>
                      <button className="w-full px-4 py-2 bg-amber-700 hover:bg-amber-600 text-gray-950 font-semibold rounded-lg transition font-serif text-sm">
                        Borrow Now
                      </button>
                    </Link>
                  ) : (
                    <button className="w-full px-4 py-2 bg-gray-700 text-gray-500 font-semibold rounded-lg cursor-not-allowed opacity-50 font-serif text-sm">
                      Not Available
                    </button>
                  )}
                  <button
                    onClick={() => removeFromWishlist(book.book_id)}
                    className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 font-semibold rounded-lg transition font-serif text-sm border border-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-12 text-center border border-amber-800/20">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-amber-100 text-lg font-serif mb-3">
              {wishlist.length === 0 ? 'Your wishlist is empty' : 'No matches found'}
            </p>
            <p className="text-gray-400 font-serif mb-6">
              {wishlist.length === 0 
                ? 'Start adding books to your wishlist by browsing the library'
                : 'Try a different search term'}
            </p>
            <Link href="/user/books">
              <button className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition font-serif">
                Browse Books
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800 mt-12">
        <p className="font-serif italic text-sm">
          ❤️ Save your favorite books for later
        </p>
      </footer>
    </div>
  );
}
