'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (isLoaded && user) {
      // Default to member dashboard
      router.push('/user/dashboard');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-amber-200 text-2xl font-serif">Loading...</div>
      </div>
    );
  }

  // Show landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-amber-50">
      {/* Navigation */}
      <nav className="bg-gray-950/80 backdrop-blur-sm border-b-2 border-amber-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif font-bold text-amber-400">
            📚 LibraryDSA
          </Link>
          <div className="flex gap-4">
            <Link
              href="/about"
              className="px-4 py-2 text-amber-100 hover:text-amber-400 font-serif transition"
            >
              About
            </Link>
            <a
              href="/user/dashboard"
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition font-serif"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-amber-100 mb-4">
            Library Management System
          </h1>
          <p className="text-xl md:text-2xl text-amber-200 font-serif mb-8">
            Powered by Advanced Data Structures & Algorithms
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/user/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-gray-950 font-bold rounded-lg transition font-serif text-lg"
            >
              Get Started
            </a>
            <Link
              href="/about"
              className="px-8 py-3 border-2 border-amber-700 hover:bg-amber-700/20 text-amber-100 font-bold rounded-lg transition font-serif text-lg"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* DSA Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-serif font-bold text-center text-amber-100 mb-12"
        >
          🚀 Data Structures in Action
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Trie Structure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-amber-800 rounded-lg p-8 hover:border-amber-600 transition"
          >
            <div className="text-5xl mb-4">🌳</div>
            <h3 className="text-2xl font-serif font-bold text-amber-100 mb-3">Trie (Prefix Tree)</h3>
            <p className="text-gray-300 font-serif mb-4">
              Fast prefix-based search for books by title and author
            </p>
            <ul className="text-sm text-gray-400 space-y-2 font-serif">
              <li>✓ O(m) title search (m = prefix length)</li>
              <li>✓ Autocomplete suggestions</li>
              <li>✓ Instant filtering results</li>
            </ul>
          </motion.div>

          {/* AVL Tree */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-amber-800 rounded-lg p-8 hover:border-amber-600 transition"
          >
            <div className="text-5xl mb-4">⚖️</div>
            <h3 className="text-2xl font-serif font-bold text-amber-100 mb-3">AVL Tree (Balanced)</h3>
            <p className="text-gray-300 font-serif mb-4">
              Self-balancing binary search tree for sorted book traversal
            </p>
            <ul className="text-sm text-gray-400 space-y-2 font-serif">
              <li>✓ O(log n) balanced insertion/deletion</li>
              <li>✓ Sorted book listings</li>
              <li>✓ Range queries on book attributes</li>
            </ul>
          </motion.div>

          {/* Hash Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-amber-800 rounded-lg p-8 hover:border-amber-600 transition"
          >
            <div className="text-5xl mb-4">🔑</div>
            <h3 className="text-2xl font-serif font-bold text-amber-100 mb-3">Hash Table</h3>
            <p className="text-gray-300 font-serif mb-4">
              Instant book lookup by ISBN and user ID
            </p>
            <ul className="text-sm text-gray-400 space-y-2 font-serif">
              <li>✓ O(1) average ISBN lookup</li>
              <li>✓ Fast user record retrieval</li>
              <li>✓ Collision handling with chaining</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-serif font-bold text-center text-amber-100 mb-12"
        >
          ✨ Smart Library Features
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-gray-900 border border-amber-800 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔍</div>
              <div>
                <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">Advanced Book Search</h3>
                <p className="text-gray-300 font-serif">
                  Search by title (Trie), author (Trie), or ISBN (Hash Table). Get results in milliseconds with our optimized DSA implementation.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Issue Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-gray-900 border border-amber-800 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">📚</div>
              <div>
                <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">Smart Issue Management</h3>
                <p className="text-gray-300 font-serif">
                  Enforce max books per user using hash-based user lookups. Track issue records efficiently with optimized queries.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Fine Calculation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-amber-800 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">💰</div>
              <div>
                <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">Automatic Fine Calculation</h3>
                <p className="text-gray-300 font-serif">
                  Calculate overdue fines instantly with efficient date calculations. Track payment status across thousands of records.
                </p>
              </div>
            </div>
          </motion.div>

          {/* User Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-amber-800 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">👤</div>
              <div>
                <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">Role-Based Dashboards</h3>
                <p className="text-gray-300 font-serif">
                  Members, Librarians, and Admins get customized views. Powered by efficient permission checks and data filtering.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-900 border-y-2 border-amber-800 py-16 my-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-serif font-bold text-center text-amber-100 mb-12"
          >
            🎯 How It Works
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Search Books',
                description: 'Use Trie for prefix search, AVL for sorted results, Hash for exact ISBN lookup',
              },
              {
                step: '2',
                title: 'Issue Books',
                description: 'Check max books limit using hash-based user lookup, update availability instantly',
              },
              {
                step: '3',
                title: 'Track Returns',
                description: 'Monitor due dates, calculate fines automatically, manage return requests efficiently',
              },
              {
                step: '4',
                title: 'Manage Fines',
                description: 'Process overdue charges, track payments, generate reports with optimized queries',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 items-start bg-gray-800 border border-amber-800 rounded-lg p-6"
              >
                <div className="text-4xl font-serif font-bold text-amber-400 min-w-12">{item.step}</div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">{item.title}</h3>
                  <p className="text-gray-300 font-serif">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
          <h2 className="text-4xl font-serif font-bold text-amber-100 mb-4">
            Ready to Experience Smart Library Management?
          </h2>
          <p className="text-xl text-amber-200 font-serif mb-8">
            Join our system and explore the power of optimized data structures
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/sign-up"
              className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-gray-950 font-bold rounded-lg transition font-serif text-lg"
            >
              Sign Up Now
            </a>
            <Link
              href="/about"
              className="px-8 py-3 border-2 border-amber-700 hover:bg-amber-700/20 text-amber-100 font-bold rounded-lg transition font-serif text-lg"
            >
              Learn About DSA
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t-2 border-amber-800 py-8 text-center">
        <p className="text-gray-400 font-serif">
          LibraryDSA © 2025 | Advanced Data Structures Implementation
        </p>
      </footer>
    </div>
  );
}

        