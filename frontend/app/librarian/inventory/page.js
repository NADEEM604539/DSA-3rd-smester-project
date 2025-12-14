'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import LibrarianNavbar from '@/app/components/LibrarianNavbar';

export default function InventoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAvailability, setFilterAvailability] = useState('all');

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

      if (!response.ok) throw new Error('Failed to fetch books');

      const data = await response.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    if (filterAvailability === 'available') return book.available > 0;
    if (filterAvailability === 'low') return book.available > 0 && book.available <= 2;
    if (filterAvailability === 'out') return book.available === 0;
    return true;
  });

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
          <h1 className="text-3xl md:text-4xl font-bold text-amber-100 font-serif">Inventory</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterAvailability('all')}
            className={`px-4 py-2 rounded font-serif transition ${filterAvailability === 'all' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-amber-200 hover:bg-gray-700'}`}
          >
            All Books ({books.length})
          </button>
          <button
            onClick={() => setFilterAvailability('available')}
            className={`px-4 py-2 rounded font-serif transition ${filterAvailability === 'available' ? 'bg-green-700 text-white' : 'bg-gray-800 text-amber-200 hover:bg-gray-700'}`}
          >
            Available ({books.filter(b => b.available > 0).length})
          </button>
          <button
            onClick={() => setFilterAvailability('low')}
            className={`px-4 py-2 rounded font-serif transition ${filterAvailability === 'low' ? 'bg-yellow-700 text-white' : 'bg-gray-800 text-amber-200 hover:bg-gray-700'}`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilterAvailability('out')}
            className={`px-4 py-2 rounded font-serif transition ${filterAvailability === 'out' ? 'bg-red-700 text-white' : 'bg-gray-800 text-amber-200 hover:bg-gray-700'}`}
          >
            Out of Stock ({books.filter(b => b.available === 0).length})
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl overflow-hidden border border-amber-800/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-amber-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-amber-200 font-serif">Book Title</th>
                  <th className="px-6 py-3 text-left text-amber-200 font-serif">Author</th>
                  <th className="px-6 py-3 text-center text-amber-200 font-serif">Total</th>
                  <th className="px-6 py-3 text-center text-amber-200 font-serif">Available</th>
                  <th className="px-6 py-3 text-center text-amber-200 font-serif">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-serif">No books match filter</td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                    const statusColor = book.available === 0 ? 'text-red-300' : book.available <= 2 ? 'text-yellow-300' : 'text-green-300';
                    const statusText = book.available === 0 ? 'Out of Stock' : book.available <= 2 ? 'Low Stock' : 'In Stock';
                    return (
                      <tr key={book.book_id} className="border-b border-amber-800/20 hover:bg-gray-700">
                        <td className="px-6 py-4 text-amber-100 font-serif">{book.title}</td>
                        <td className="px-6 py-4 text-gray-300 font-serif">{book.author}</td>
                        <td className="px-6 py-4 text-center font-bold text-amber-300 font-serif">{book.quantity || 0}</td>
                        <td className="px-6 py-4 text-center font-bold text-amber-300 font-serif">{book.available || 0}</td>
                        <td className={`px-6 py-4 text-center font-semibold font-serif ${statusColor}`}>
                          {statusText}
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
