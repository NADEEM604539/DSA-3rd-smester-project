'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutPage() {
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
              href="/"
              className="px-4 py-2 text-amber-100 hover:text-amber-400 font-serif transition"
            >
              Home
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
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-amber-100 mb-4">
            About Our DSA Implementation
          </h1>
          <p className="text-xl text-amber-200 font-serif">
            A comprehensive library management system built with advanced data structures
          </p>
        </motion.div>
      </section>

      {/* DSA Details Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-serif font-bold text-amber-100 mb-12 text-center"
        >
          🏗️ Data Structures Used
        </motion.h2>

        {/* Trie */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border-2 border-amber-800 rounded-lg p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="text-6xl">🌳</div>
            <div className="flex-1">
              <h3 className="text-3xl font-serif font-bold text-amber-100 mb-4">Trie (Prefix Tree)</h3>
              <p className="text-gray-300 font-serif mb-4">
                A tree-based data structure that efficiently stores strings and enables fast prefix-based searches.
              </p>
              <div className="bg-gray-800 border border-amber-800 rounded p-4 mb-4">
                <h4 className="text-amber-200 font-bold mb-2 font-serif">Time Complexities:</h4>
                <ul className="text-gray-300 font-serif space-y-1">
                  <li>• Search: O(m) where m = prefix length</li>
                  <li>• Insertion: O(m)</li>
                  <li>• Deletion: O(m)</li>
                </ul>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800 border border-amber-700 rounded p-4">
                  <h4 className="text-amber-200 font-bold mb-2 font-serif">🔍 Search Implementation</h4>
                  <p className="text-sm text-gray-300 font-serif">
                    Used for book title and author prefix searches. When users type "Harry", the system instantly finds all books starting with that prefix.
                  </p>
                </div>
                <div className="bg-gray-800 border border-amber-700 rounded p-4">
                  <h4 className="text-amber-200 font-bold mb-2 font-serif">✨ Key Benefits</h4>
                  <ul className="text-sm text-gray-300 font-serif space-y-1">
                    <li>• Autocomplete suggestions</li>
                    <li>• Fast partial matches</li>
                    <li>• Memory efficient for large datasets</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AVL Tree */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border-2 border-amber-800 rounded-lg p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="text-6xl">⚖️</div>
            <div className="flex-1">
              <h3 className="text-3xl font-serif font-bold text-amber-100 mb-4">AVL Tree (Self-Balancing BST)</h3>
              <p className="text-gray-300 font-serif mb-4">
                A self-balancing binary search tree that maintains balance through rotations, ensuring O(log n) operations.
              </p>
              <div className="bg-gray-800 border border-amber-800 rounded p-4 mb-4">
                <h4 className="text-amber-200 font-bold mb-2 font-serif">Time Complexities:</h4>
                <ul className="text-gray-300 font-serif space-y-1">
                  <li>• Search: O(log n)</li>
                  <li>• Insertion: O(log n)</li>
                  <li>• Deletion: O(log n)</li>
                  <li>• Traversal: O(n)</li>
                </ul>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800 border border-amber-700 rounded p-4">
                  <h4 className="text-amber-200 font-bold mb-2 font-serif">📊 Usage in Library</h4>
                  <p className="text-sm text-gray-300 font-serif">
                    Maintains sorted book lists by publication year, title, or author. Enables efficient range queries for books published between dates.
                  </p>
                </div>
                <div className="bg-gray-800 border border-amber-700 rounded p-4">
                  <h4 className="text-amber-200 font-bold mb-2 font-serif">🎯 Balancing Benefits</h4>
                  <ul className="text-sm text-gray-300 font-serif space-y-1">
                    <li>• Guaranteed O(log n) performance</li>
                    <li>• No worst-case degradation</li>
                    <li>• Automatic rotations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hash Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border-2 border-amber-800 rounded-lg p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="text-6xl">🔑</div>
            <div className="flex-1">
              <h3 className="text-3xl font-serif font-bold text-amber-100 mb-4">Hash Table</h3>
              <p className="text-gray-300 font-serif mb-4">
                A data structure that maps keys to values using a hash function, enabling constant-time average lookups.
              </p>
              <div className="bg-gray-800 border border-amber-800 rounded p-4 mb-4">
                <h4 className="text-amber-200 font-bold mb-2 font-serif">Time Complexities (Average):</h4>
                <ul className="text-gray-300 font-serif space-y-1">
                  <li>• Search: O(1)</li>
                  <li>• Insertion: O(1)</li>
                  <li>• Deletion: O(1)</li>
                </ul>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800 border border-amber-700 rounded p-4">
                  <h4 className="text-amber-200 font-bold mb-2 font-serif">🔎 Primary Uses</h4>
                  <ul className="text-sm text-gray-300 font-serif space-y-1">
                    <li>• ISBN to Book lookup</li>
                    <li>• User ID to User record</li>
                    <li>• Book ID to availability</li>
                  </ul>
                </div>
                <div className="bg-gray-800 border border-amber-700 rounded p-4">
                  <h4 className="text-amber-200 font-bold mb-2 font-serif">⚡ Performance</h4>
                  <p className="text-sm text-gray-300 font-serif">
                    Enables instant lookups even with millions of books and users. Collision handling via chaining.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Powered by DSA */}
      <section className="bg-gray-900 border-y-2 border-amber-800 py-16 my-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-serif font-bold text-center text-amber-100 mb-12"
          >
            🎯 Features Powered by DSA
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-amber-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-serif font-bold text-amber-100 mb-3">1. Smart Book Search</h3>
              <p className="text-gray-300 font-serif mb-3">
                <strong>DSA Used:</strong> Trie + AVL Tree + Hash Table
              </p>
              <p className="text-sm text-gray-400 font-serif">
                Search for "Harry" and get all matching titles instantly. Trie handles prefix matching, AVL orders results, Hash Table does exact ISBN lookups.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 border border-amber-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-serif font-bold text-amber-100 mb-3">2. Issue Management</h3>
              <p className="text-gray-300 font-serif mb-3">
                <strong>DSA Used:</strong> Hash Table + Array
              </p>
              <p className="text-sm text-gray-400 font-serif">
                Check if user can borrow more books (max 3 limit). Hash Table provides O(1) user lookup, Array stores issue records.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 border border-amber-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-serif font-bold text-amber-100 mb-3">3. Fine Calculation</h3>
              <p className="text-gray-300 font-serif mb-3">
                <strong>DSA Used:</strong> Hash Table + Efficient Date Logic
              </p>
              <p className="text-sm text-gray-400 font-serif">
                Calculate overdue fines for thousands of records. Hash Table for fast issue lookup, efficient queries for overdue detection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 border border-amber-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-serif font-bold text-amber-100 mb-3">4. Sorted Reports</h3>
              <p className="text-gray-300 font-serif mb-3">
                <strong>DSA Used:</strong> AVL Tree
              </p>
              <p className="text-sm text-gray-400 font-serif">
                Generate reports sorted by date, author, or category. AVL Tree maintains natural order during traversal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-serif font-bold text-center text-amber-100 mb-12"
        >
          🏛️ System Architecture
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border-2 border-amber-800 rounded-lg p-6"
          >
            <h3 className="text-2xl font-serif font-bold text-amber-100 mb-4">Frontend</h3>
            <ul className="text-gray-300 font-serif space-y-2">
              <li>✓ Next.js 16 (React 19)</li>
              <li>✓ Clerk Authentication</li>
              <li>✓ Framer Motion Animations</li>
              <li>✓ Tailwind CSS Styling</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border-2 border-amber-800 rounded-lg p-6"
          >
            <h3 className="text-2xl font-serif font-bold text-amber-100 mb-4">Backend</h3>
            <ul className="text-gray-300 font-serif space-y-2">
              <li>✓ FastAPI (Python)</li>
              <li>✓ SQLAlchemy ORM</li>
              <li>✓ MySQL Database</li>
              <li>✓ Uvicorn Server</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 border-2 border-amber-800 rounded-lg p-6"
          >
            <h3 className="text-2xl font-serif font-bold text-amber-100 mb-4">DSA Implementations</h3>
            <ul className="text-gray-300 font-serif space-y-2">
              <li>✓ Trie (Prefix Search)</li>
              <li>✓ AVL Tree (Balanced BST)</li>
              <li>✓ Hash Table (Chaining)</li>
              <li>✓ Efficient Sorting</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
          <h2 className="text-4xl font-serif font-bold text-amber-100 mb-4">
            Experience DSA in Action
          </h2>
          <p className="text-xl text-amber-200 font-serif mb-8">
            See how optimized data structures make library management fast and efficient
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/user/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-gray-950 font-bold rounded-lg transition font-serif text-lg"
            >
              Get Started
            </a>
            <Link
              href="/"
              className="px-8 py-3 border-2 border-amber-700 hover:bg-amber-700/20 text-amber-100 font-bold rounded-lg transition font-serif text-lg"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t-2 border-amber-800 py-8 text-center">
        <p className="text-gray-400 font-serif">
          LibraryDSA © 2025 | Advanced Data Structures Implementation
        </p>
        <p className="text-gray-500 text-sm font-serif mt-2">
          Project demonstrates practical DSA usage in real-world applications
        </p>
      </footer>
    </div>
  );
}
