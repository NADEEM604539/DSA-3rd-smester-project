/**
 * lib/auth-context.js
 * 
 * Client-side authentication context to store and manage user role globally
 * Uses email as primary identifier (Clerk handles email as unique identifier)
 */

'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { clearUserSession } from './utils'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      // If user signs out, clear session
      if (!user || !isSignedIn) {
        clearUserSession()
        setUserRole(null)
        setUserId(null)
        setLoading(false)
        return
      }

      try {
        const userEmail = user.primaryEmailAddress?.emailAddress

        if (!userEmail) {
          console.error('No email found in Clerk user')
          setUserRole(null)
          setLoading(false)
          return
        }

        // Check if role is in localStorage (from previous login)
        const storedRole = localStorage.getItem('userRole')
        if (storedRole) {
          setUserRole(storedRole)
          setLoading(false)
          return
        }

        // Fetch user role from backend using email
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`
        const response = await fetch(`${apiUrl}/auth/user-by-email/${encodeURIComponent(userEmail)}`)

        if (response.ok) {
          const userData = await response.json()
          const role = userData.role
          setUserRole(role)
          setUserId(userData.user_id)
          localStorage.setItem('userRole', role)
          localStorage.setItem('userId', userData.user_id)
          // Also set as cookie for middleware access
          document.cookie = `userRole=${role};path=/;max-age=86400`
          document.cookie = `userId=${userData.user_id};path=/;max-age=86400`
        } else {
          console.error('Failed to fetch user role')
          setUserRole(null)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        setUserRole(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user, isSignedIn])

  return (
    <AuthContext.Provider value={{ userRole, userId, loading, isSignedIn, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
