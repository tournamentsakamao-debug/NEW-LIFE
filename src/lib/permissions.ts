/**
 * ADMIN CONFIGURATION
 * Yahan aap un emails ko rakhein jinhe super-admin access chahiye.
 */
export const ADMIN_EMAILS = [
  'tournamentsakamao@gmail.com',
  'prounknown055@gmail.com'
]

/**
 * Requirement 3.1 & Vercel Fix:
 * Dono names (isAdminEmail aur isSuperAdmin) export kiye hain taaki build error na aaye.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export function isSuperAdmin(email: string | undefined | null): boolean {
  return isAdminEmail(email)
}

/**
 * Requirement 12: Role-Based Access Control (RBAC)
 */
export const PERMISSIONS = {
  MANAGE_TOURNAMENTS: 'manage_tournaments',
  MANAGE_PAYMENTS: 'manage_payments',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  SEND_NOTIFICATIONS: 'send_notifications'
}

/**
 * Helper to check if a user has admin role
 */
export function hasAdminPower(user: any): boolean {
  if (!user) return false
  // Dono checks: Role status in DB OR Email whitelist
  return user.role === 'admin' || isAdminEmail(user.email)
}

/**
 * Action Authorization Logic
 */
export function canPerformAction(user: any, permission: string): boolean {
  if (!hasAdminPower(user)) return false
  
  // Super admins can do everything
  if (isAdminEmail(user.email)) return true

  return true 
}
