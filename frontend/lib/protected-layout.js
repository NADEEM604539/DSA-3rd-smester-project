/**
 * lib/protected-layout.js
 * 
 * Wrapper components for role-protected layouts
 */

'use client'

import { useProtectedRoute } from './use-protected-route'
import { useRouter } from 'next/navigation'

export function AdminLayout({ children }) {
  const { userRole, loading } = useProtectedRoute(['ADMIN'])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (userRole !== 'ADMIN') {
    return null
  }

  return <>{children}</>
}

export function LibrarianLayout({ children }) {
  const { userRole, loading } = useProtectedRoute(['LIBRARIAN'])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (userRole !== 'LIBRARIAN') {
    return null
  }

  return <>{children}</>
}

export function MemberLayout({ children }) {
  const { userRole, loading } = useProtectedRoute(['MEMBER'])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (userRole !== 'MEMBER') {
    return null
  }

  return <>{children}</>
}

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { userRole, loading } = useProtectedRoute(allowedRoles)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}
