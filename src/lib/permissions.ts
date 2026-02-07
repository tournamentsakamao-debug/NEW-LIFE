/**
 * ADMIN CONFIGURATION
 * Yahan aap un emails ko rakhein jinhe super-admin access chahiye.
 */
export const ADMIN_EMAILS = [
  'tournamentsakamao@gmail.com',
  'prounknown055@gmail.com'
]

/**
 * Requirement 3.1: Admin Verification Logic
 * Ye function check karta hai ki kya user privileged admin hai.
 */
export function isSuperAdmin(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Requirement 12: Role-Based Access Control (RBAC)
 * Sirf UI par nahi, balki functional level par permissions check karne ke liye.
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
  return user.role === 'admin' || isSuperAdmin(user.email)
}

/**
 * Luxury App Security: 
 * Jab admin koi sensitive action kare (jaise payment approve), 
 * tab ye check use karein.
 */
export function canPerformAction(user: any, permission: string): boolean {
  if (!hasAdminPower(user)) return false
  
  // Super admins can do everything
  if (isSuperAdmin(user.email)) return true

  // Future-proofing: Yahan specific permissions add kar sakte hain
  return true 
}
