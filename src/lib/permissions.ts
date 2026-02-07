export const ADMIN_EMAILS = [
  'tournamentsakamao@gmail.com',
  'prounknown055@gmail.com'
]

export const ADMIN_USERNAMES = [
  'tournamentsakamao@gmail.com',
  'prounknown055@gmail.com'
]

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export function isAdminUsername(username: string): boolean {
  return ADMIN_USERNAMES.includes(username.toLowerCase())
}
