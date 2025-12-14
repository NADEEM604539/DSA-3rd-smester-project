'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const adminMenuItems = [
  {
    category: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/admin/reports', label: 'Reports & Analytics', icon: '📈' }
    ]
  },
  {
    category: 'Management',
    items: [
      { href: '/admin/librarians', label: 'Librarian Management', icon: '👨‍💼' },
      { href: '/admin/books', label: 'Books Management', icon: '📚' },
      { href: '/admin/members', label: 'Members', icon: '👥' },
      { href: '/admin/issues', label: 'Issues Management', icon: '📖' }
    ]
  },
  {
    category: 'Operations',
    items: [
      { href: '/admin/fines', label: 'Fines Management', icon: '💳' },
      { href: '/admin/notifications', label: 'Notifications', icon: '🔔' }
    ]
  },
  {
    category: 'Settings',
    items: [
      { href: '/admin/settings', label: 'System Settings', icon: '⚙️' }
    ]
  }
];

export default function AdminSidebar({ isOpen, onToggle }) {
  const pathname = usePathname();

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : 0 }}
        className={`fixed md:relative w-64 bg-gray-900 border-r border-gray-700 min-h-screen z-30 transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-3xl">⚙️</span>
            <div className="hidden md:block">
              <p className="text-amber-400 font-bold text-lg">Admin</p>
              <p className="text-gray-400 text-xs">Library</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {adminMenuItems.map((section, idx) => (
            <div key={idx} className="mb-8">
              {/* Section Header */}
              <p className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.category}
              </p>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      whileHover={{ x: 4 }}
                      className="relative"
                    >
                      <Link
                        href={item.href}
                        onClick={() => onToggle(false)}
                        className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-lg font-medium text-sm transition ${
                          active
                            ? 'bg-amber-600 text-gray-950 shadow-lg'
                            : 'text-gray-300 hover:text-gray-100 hover:bg-gray-800/50'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="hidden md:inline">{item.label}</span>
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-300 rounded-l-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
