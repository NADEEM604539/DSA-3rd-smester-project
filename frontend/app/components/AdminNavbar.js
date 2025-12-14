'use client';

import Link from 'next/link';
import { useUser, SignOutButton, UserButton } from '@clerk/nextjs';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminNavbar({ onToggleSidebar }) {
  const { user } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 shadow-lg border-b border-amber-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Sidebar Toggle & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggleSidebar?.()}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition"
              title="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
          </div>



          {/* Right: User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-gray-950 font-bold">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
              <span className="hidden sm:inline text-sm font-semibold">{user?.firstName || 'Admin'}</span>
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-sm font-semibold text-gray-100">{user?.fullName}</p>
                  <p className="text-xs text-gray-400">{user?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
                <div className="px-4 py-2">
                  <Link
                    href="/admin/dashboard"
                    className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                </div>
                <div className="border-t border-gray-700 px-4 py-2">
                  <UserButton/>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
