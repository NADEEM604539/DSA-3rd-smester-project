/**
 * lib/use-protected-route.js
 * 
 * Hook to protect routes based on user role
 * Redirects unauthorized users to their dashboard
 * Clerk handles sign-in automatically
 */

'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthContext } from './auth-context'

export function useProtectedRoute(allowedRoles = []) {
  const router = useRouter()
  const { userRole, loading, isSignedIn } = useAuthContext()

  useEffect(() => {
    // Wait for auth to load
    if (loading) return

    // If not authenticated, Clerk middleware will handle sign-in redirect
    if (!isSignedIn) {
      return
    }

    // If no role yet, wait for it to load
    if (!userRole) {
      return
    }

    // Check if user role is allowed on this route
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // Redirect to user's own dashboard
      const dashboardMap = {
        'ADMIN': '/admin/dashboard',
        'LIBRARIAN': '/librarian/dashboard',
        'MEMBER': '/user/dashboard',
      }
      router.push(dashboardMap[userRole] || '/user/dashboard')
      return
    }
  }, [userRole, loading, isSignedIn, allowedRoles, router])

  return { userRole, loading, isSignedIn }
}
