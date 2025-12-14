/**
 * lib/utils.js
 * 
 * Helper utilities for frontend
 */

/**
 * Clear user session data on logout
 */
export function clearUserSession() {
  localStorage.removeItem('userRole')
  document.cookie = 'userRole=; path=/; max-age=0'
}

/**
 * Get user role from storage
 */
export function getUserRoleFromStorage() {
  try {
    return localStorage.getItem('userRole')
  } catch (e) {
    console.error('Error reading userRole from localStorage:', e)
    return null
  }
}

/**
 * Set user role in storage and cookies
 */
export function setUserRoleInStorage(role) {
  try {
    localStorage.setItem('userRole', role)
    document.cookie = `userRole=${role};path=/;max-age=86400`
  } catch (e) {
    console.error('Error setting userRole in storage:', e)
  }
}

/**
 * Get dashboard URL for role
 */
export function getDashboardUrlForRole(role) {
  const dashboardMap = {
    'ADMIN': '/admin/dashboard',
    'LIBRARIAN': '/librarian/dashboard',
    'MEMBER': '/user/dashboard',
  }
  return dashboardMap[role] || '/user/dashboard'
}

/**
 * Check if user has permission for route
 */
export function hasRolePermission(userRole, requiredRoles = []) {
  if (!userRole || !requiredRoles.length) return true
  return requiredRoles.includes(userRole)
}
