'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

export default function BookDetailPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const bookId = params?.id;

  const [book, setBook] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/');
      return;
    }

    fetchBookDetails();
    fetchUserId();
  }, [user, isLoaded, router, bookId]);

  const fetchUserId = async () => {
    try {
      const email = user?.emailAddresses[0]?.emailAddress;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user-by-email/${email}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserId(data.user_id);
      }
    } catch (err) {
      console.error('Failed to fetch user ID:', err);
    }
  };

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/books`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }

      const data = await response.json();
      const foundBook = data.books?.find(b => b.book_id === parseInt(bookId));

      if (!foundBook) {
        throw new Error('Book not found');
      }

      setBook(foundBook);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async () => {
    if (!userId) {
      setError('Unable to identify user. Please log in again.');
      return;
    }

    try {
      setBorrowing(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/librarian/issue/${userId}/${bookId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to borrow book');
      }

      setBorrowSuccess(true);
      await fetchBookDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setBorrowing(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg font-serif">Loading book details...</div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
          <Link href="/user/books" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block transition">
            ← Back to Books
          </Link>
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
          <Link href="/user/books" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block transition">
            ← Back to Books
          </Link>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-amber-100 font-serif text-lg">Book not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 px-6 py-10 md:px-12 shadow-2xl relative overflow-hidden border-b-2 border-amber-800">
        <div className="absolute top-0 right-0 opacity-5 text-6xl">📚</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/user/books" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block transition">
            ← Back to Books
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-serif text-amber-100">
            Book Details
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {borrowSuccess && (
          <div className="bg-green-900/30 border-l-4 border-green-500 text-green-200 p-4 mb-8 rounded backdrop-blur-sm font-serif">
            <p className="font-semibold">✅ Book borrowed successfully!</p>
            <p className="text-sm mt-1">You can view your borrowed books in "My Issues"</p>
          </div>
        )}

        {/* Book Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Image/Icon Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 border border-amber-800/30 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">📚</div>
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold font-serif mb-4 ${
                    book.available
                      ? 'bg-green-900/70 text-green-300 border border-green-600'
                      : 'bg-red-900/70 text-red-300 border border-red-600'
                  }`}
                >
                  {book.available ? '✅ Available' : '❌ Borrowed'}
                </div>
              </div>

              {/* Book Info Box */}
              <div className="space-y-4 bg-gray-850 p-4 rounded-lg border border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-serif">ISBN</p>
                  <p className="text-amber-100 font-mono text-sm">{book.isbn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-serif">Author</p>
                  <p className="text-amber-100 font-serif">{book.author_name || 'Unknown'}</p>
                </div>
              </div>

              {/* Borrow Button */}
              <button
                onClick={handleBorrowBook}
                disabled={!book.available || borrowing}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-serif font-bold transition ${
                  book.available
                    ? borrowing
                      ? 'bg-amber-600 text-gray-950 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-amber-700 to-amber-600 text-gray-950 hover:from-amber-600 hover:to-amber-500 shadow-lg hover:shadow-xl'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                {borrowing ? 'Borrowing...' : book.available ? '📖 Borrow This Book' : 'All Items Borrowed'}
              </button>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <Link href="/user/my-issues" className="text-amber-400 hover:text-amber-300 text-sm font-semibold inline-block">
                  View My Issues →
                </Link>
              </div>
            </div>
          </div>

          {/* Book Details Section */}
          <div className="lg:col-span-2">
            {/* Title and Author */}
            <div className="mb-8">
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-amber-100 mb-3 leading-tight">
                {book.title}
              </h2>
              <p className="text-2xl text-amber-300 font-serif italic mb-2">
                by {book.author_name || 'Unknown Author'}
              </p>
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-8">
                <h3 className="text-2xl font-serif text-amber-100 mb-4 font-semibold">
                  About This Book
                </h3>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-300 font-serif leading-relaxed text-lg">
                    {book.description}
                  </p>
                </div>
              </div>
            )}

            {/* Book Details Grid */}
            <div className="mb-8">
              <h3 className="text-2xl font-serif text-amber-100 mb-4 font-semibold">
                Book Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-500 text-sm uppercase font-serif mb-2">ISBN</p>
                  <p className="text-amber-100 font-mono text-lg font-bold">{book.isbn || 'Not Available'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-500 text-sm uppercase font-serif mb-2">Published Year</p>
                  <p className="text-amber-100 font-serif text-lg font-bold">{book.publish_year || 'Not Available'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-500 text-sm uppercase font-serif mb-2">Author</p>
                  <p className="text-amber-100 font-serif text-lg font-bold">{book.author_name || 'Unknown'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-500 text-sm uppercase font-serif mb-2">Availability</p>
                  <p className={`text-lg font-bold font-serif ${book.available ? 'text-green-400' : 'text-red-400'}`}>
                    {book.available ? '✅ In Stock' : '❌ OUT OF STOCK'}
                  </p>
                </div>
              </div>
            </div>

            {/* Library Features */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg p-8 border border-amber-800/30">
              <h3 className="text-2xl font-serif text-amber-100 mb-4 font-semibold">
                📚 Library Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="font-serif font-semibold text-amber-100">DSA Optimized Search</p>
                    <p className="text-sm text-gray-400">Found via our fast Trie algorithm</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-serif font-semibold text-amber-100">Easy Borrowing</p>
                    <p className="text-sm text-gray-400">One-click to add to your collection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="font-serif font-semibold text-amber-100">Track Due Dates</p>
                    <p className="text-sm text-gray-400">Never miss a return deadline</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <p className="font-serif font-semibold text-amber-100">Get Notifications</p>
                    <p className="text-sm text-gray-400">Reminders for due books</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Navigation */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/user/books">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-600 transition group-hover:shadow-lg text-center">
                <p className="text-3xl mb-2">📚</p>
                <p className="font-serif font-semibold text-amber-100 group-hover:text-amber-200">Browse All Books</p>
              </div>
            </div>
          </Link>

          <Link href="/user/search">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-600 transition group-hover:shadow-lg text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="font-serif font-semibold text-amber-100 group-hover:text-amber-200">Search More Books</p>
              </div>
            </div>
          </Link>

          <Link href="/user/my-issues">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 hover:border-amber-600 transition group-hover:shadow-lg text-center">
                <p className="text-3xl mb-2">📖</p>
                <p className="font-serif font-semibold text-amber-100 group-hover:text-amber-200">My Borrowed Books</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-amber-100 py-6 text-center border-t-2 border-amber-800 mt-12">
        <p className="font-serif italic text-sm">
          ✨ Every book is a journey. Begin yours today.
        </p>
      </footer>
    </div>
  );
}
