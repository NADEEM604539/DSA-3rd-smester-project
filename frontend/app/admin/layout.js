'use client';

import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isLoaded || !user) {
        setIsVerifying(false);
        return;
      }

      try {
        const email = user?.emailAddresses[0]?.emailAddress;
        if (!email) {
          setIsVerifying(false);
          return;
        }

        const response = await fetch(
          ``${process.env.NEXT_PUBLIC_API_URL}/auth/user-by-email/${email}`
        );

        if (response.ok) {
          const userData = await response.json();
          if (userData.role === 'ADMIN') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Error verifying admin:', err);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdmin();
  }, [isLoaded, user]);

  if (!isLoaded || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-red-400 text-lg mb-4">Access Denied</p>
          <p className="text-gray-400">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Navbar */}
      <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onToggle={(state) => setSidebarOpen(state ?? !sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
