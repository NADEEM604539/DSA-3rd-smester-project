'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { SignOutButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Fetch notification count
    const fetchNotificationCount = async () => {
      try {
        if (!user) return;
        const email = user?.emailAddresses[0]?.emailAddress;
        if (!email) return;

        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/user-by-email/${email}`,
          { signal: AbortSignal.timeout(5000) }
        );
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const notifResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/member/notifications/${userData.user_id}`,
            { signal: AbortSignal.timeout(5000) }
          );
          
          if (notifResponse.ok) {
            const notifData = await notifResponse.json();
            const unreadCount = (notifData.notifications || []).filter(n => !n.read).length;
            setNotifications(unreadCount);
          }
        }
      } catch (err) {
        // Silently fail - notifications are optional
        setNotifications(0);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const isActive = (path) => pathname === path;

  // Main navigation links - only essential ones
  const mainNavLinks = [
    { href: '/user/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/user/books', label: 'Browse', icon: '📚' },
    { href: '/user/search', label: 'Search', icon: '🔍' },
    { href: '/user/my-issues', label: 'My Issues', icon: '📖' },
  ];

  // Secondary links in user menu
  const secondaryLinks = [
    { href: '/user/fines', label: 'My Fines', icon: '💳' },
    { href: '/user/reading-history', label: 'History', icon: '📅' },
    { href: '/user/wishlist', label: 'Wishlist', icon: '⭐' },
    { href: '/user/notifications', label: 'Notifications', icon: '🔔' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-amber-50 shadow-xl border-b-2 border-amber-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/user/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">📚</span>
            <span className="font-serif font-bold text-lg text-amber-100 hidden sm:inline">
              Library
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md font-serif font-semibold transition text-sm flex items-center gap-1.5 whitespace-nowrap ${
                  isActive(link.href)
                    ? 'bg-amber-700 text-gray-950'
                    : 'text-amber-100 hover:bg-amber-700/20 hover:text-amber-200'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side - User Menu and Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition font-serif text-sm font-semibold ${
                  isUserMenuOpen
                    ? 'bg-amber-700 text-gray-950'
                    : 'text-amber-100 hover:bg-amber-700/20'
                }`}
              >
                <span className="text-lg">👤</span>
                <span className="hidden sm:inline">{user?.firstName || 'User'}</span>
                <span className="text-xs ml-1">▼</span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl border border-amber-800/30 z-50">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <p className="text-sm font-serif text-amber-100 font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>

                  {/* Profile Link */}
                  <Link href="/user/profile">
                    <button className="block w-full text-left px-4 py-2.5 text-amber-100 hover:bg-amber-700/20 font-serif transition border-b border-gray-700 text-sm">
                      👤 My Profile
                    </button>
                  </Link>

                  {/* Secondary Links */}
                  <div className="py-2 border-b border-gray-700">
                    {secondaryLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <button className="block w-full text-left px-4 py-2 text-amber-100 hover:bg-amber-700/20 font-serif transition text-sm flex items-center gap-2">
                          <span>{link.icon}</span>
                          <span>{link.label}</span>
                          {link.label === 'Notifications' && notifications > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-bold">
                              {notifications}
                            </span>
                          )}
                        </button>
                      </Link>
                    ))}
                  </div>

                  {/* Sign Out */}
                  <div className="px-4 py-2">
                  
                      <button className="w-full text-left text-red-400 hover:text-red-300 font-serif font-semibold transition text-sm py-2">
                        <UserButton/>
                      </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-xl text-amber-100 hover:text-amber-200 transition"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-md font-serif font-semibold transition text-sm ${
                  isActive(link.href)
                    ? 'bg-amber-700 text-gray-950'
                    : 'text-amber-100 hover:bg-amber-700/20'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
