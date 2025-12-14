import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Only protect role-specific routes
// Clerk handles sign-in/sign-up automatically
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isLibrarianRoute = createRouteMatcher(['/librarian(.*)'])
const isUserRoute = createRouteMatcher(['/user(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // If accessing protected routes, user must be authenticated
  if (isAdminRoute(req) || isLibrarianRoute(req) || isUserRoute(req)) {
    const { userId } = await auth()
    
    if (!userId) {
      // Clerk will automatically redirect to sign-in modal
      return auth.protect()
    }

    // Get user role from cookie (set by auth context on client)
    let userRole = req.cookies.get('userRole')?.value

    // If role not in cookie, fetch from backend using the Clerk user email
    if (!userRole) {
      try {
        const { user } = await auth()
        if (user && user.emailAddresses && user.emailAddresses.length > 0) {
          const userEmail = user.emailAddresses[0].emailAddress
          const apiUrl = process.env.API_URL || `${process.env.NEXT_PUBLIC_API_URL}`
          
          const roleResponse = await fetch(`${apiUrl}/auth/user-by-email/${encodeURIComponent(userEmail)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (roleResponse.ok) {
            const userData = await roleResponse.json()
            userRole = userData.role
          }
        }
      } catch (error) {
        console.error('Error fetching user role from backend:', error)
        // Allow request to continue, client-side will handle role redirect
        return NextResponse.next()
      }
    }

    if (!userRole) {
      // If role still not available, let client handle it
      return NextResponse.next()
    }

    // Role-based route protection - redirect to correct dashboard
    if (isAdminRoute(req) && userRole !== 'ADMIN') {
      const dashboardPath = userRole === 'LIBRARIAN' ? '/librarian/dashboard' : '/user/dashboard'
      return NextResponse.redirect(new URL(dashboardPath, req.url))
    }

    if (isLibrarianRoute(req) && userRole !== 'LIBRARIAN') {
      const dashboardPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
      return NextResponse.redirect(new URL(dashboardPath, req.url))
    }

    if (isUserRoute(req) && userRole !== 'MEMBER') {
      const dashboardPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/librarian/dashboard'
      return NextResponse.redirect(new URL(dashboardPath, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}