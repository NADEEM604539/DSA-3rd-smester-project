'use client';

import { useEffect, useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LibrarianNavbar() {
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border-b-2 border-amber-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/librarian/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-amber-100 font-bold font-serif hidden md:block">Librarian</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/librarian/dashboard">
              <button className="px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Dashboard
              </button>
            </Link>
            <Link href="/librarian/manage-books">
              <button className="px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Books
              </button>
            </Link>
            <Link href="/librarian/issues">
              <button className="px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Issues
              </button>
            </Link>
            <Link href="/librarian/returns">
              <button className="px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Returns
              </button>
            </Link>
            <Link href="/librarian/inventory">
              <button className="px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Inventory
              </button>
            </Link>
            <Link href="/librarian/settings">
              <button className="px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Settings
              </button>
            </Link>
            <Link href="/librarian/notifications">
              <button className="px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif flex items-center gap-1">
                🔔 Notifications
              </button>
            </Link>
          </div>

          {/* User Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* User Button */}
            <div className="relative group">
              <button className="bg-amber-700 hover:bg-amber-600 text-gray-950 px-4 py-2 rounded-lg font-serif font-semibold transition text-sm md:text-base">
                👤 {user?.firstName} {user?.lastName}
              </button>
              <div className="absolute right-0 mt-0 w-48 bg-gray-800 border border-amber-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <UserButton/> {user?.firstName}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-amber-200 hover:text-amber-100 text-2xl"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-amber-800/50 pt-4">
            <Link href="/librarian/dashboard">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Dashboard
              </button>
            </Link>
            <Link href="/librarian/manage-books">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Books
              </button>
            </Link>
            <Link href="/librarian/issues">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Issues
              </button>
            </Link>
            <Link href="/librarian/members">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Members
              </button>
            </Link>
            <Link href="/librarian/returns">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Returns
              </button>
            </Link>
            <Link href="/librarian/reports">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Reports
              </button>
            </Link>
            <Link href="/librarian/inventory">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Inventory
              </button>
            </Link>
            <Link href="/librarian/settings">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                Settings
              </button>
            </Link>
            <Link href="/librarian/notifications">
              <button className="w-full text-left px-4 py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30 rounded transition font-serif">
                🔔 Notifications
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
